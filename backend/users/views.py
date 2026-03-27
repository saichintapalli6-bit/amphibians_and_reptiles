import os
import random
import json
import base64
from io import BytesIO
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Heavy ML libraries are imported lazily (inside functions) so Django
# can start without them being installed / available at import time.

def Training(request):
    # Lazy imports – only loaded when this view is actually called
    import numpy as np
    import tensorflow as tf
    from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
    from tensorflow.keras.applications import MobileNetV2
    from tensorflow.keras.preprocessing.image import ImageDataGenerator
    from tensorflow.keras.models import load_model, Model
    from tensorflow.keras.layers import Dense, Dropout
    from tensorflow.keras.optimizers import Adam
    from sklearn.metrics import classification_report, confusion_matrix
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import seaborn as sns
    # Set dataset and model paths
    dataset_path = os.path.join(settings.BASE_DIR, 'media\\archive')
    model_path = os.path.join(settings.BASE_DIR, 'animal_classification_model.h5')
    checkpoint_path = os.path.join(settings.BASE_DIR, 'animals_classification_model_checkpoint')
    
    # Check if retrain parameter is set in the request
    retrain = request.GET.get('retrain', 'false').lower() == 'true'

    
    # Check if model already exists
    if os.path.exists(model_path) and not retrain:
        # Load the existing model and display a message to the user
        model = tf.keras.models.load_model(model_path,compile=False)
        message = "Model loaded from saved file. To retrain the model,click below"
        return render(request, 'users/accuracy.html', {'message': message})

    # Image data preprocessing
    BATCH_SIZE = 32
    IMAGE_SIZE = (224, 224)

    train_generator = ImageDataGenerator(preprocessing_function=tf.keras.applications.mobilenet_v2.preprocess_input, validation_split=0.2)
    test_generator = ImageDataGenerator(preprocessing_function=tf.keras.applications.mobilenet_v2.preprocess_input)

    # Flow images from directory
    train_images = train_generator.flow_from_directory(dataset_path, target_size=IMAGE_SIZE, batch_size=BATCH_SIZE, class_mode='categorical', subset='training')
    val_images = train_generator.flow_from_directory(dataset_path, target_size=IMAGE_SIZE, batch_size=BATCH_SIZE, class_mode='categorical', subset='validation')
    test_images = test_generator.flow_from_directory(dataset_path, target_size=IMAGE_SIZE, batch_size=BATCH_SIZE, class_mode='categorical', shuffle=False)

    # Load or build the model
    if os.path.exists(model_path):
        model = load_model(model_path)
    else:
        pretrained_model = MobileNetV2(input_shape=(224, 224, 3), include_top=False, weights='imagenet', pooling='avg')
        pretrained_model.trainable = False
        x = Dense(256, activation='relu')(pretrained_model.output)
        x = Dropout(0.2)(x)
        outputs = Dense(train_images.num_classes, activation='softmax')(x)
        model = Model(inputs=pretrained_model.input, outputs=outputs)

    model.compile(optimizer=Adam(learning_rate=0.001), loss='categorical_crossentropy', metrics=['accuracy'])

    # Callbacks
    checkpoint_callback = ModelCheckpoint(checkpoint_path, save_weights_only=True, monitor='val_accuracy', save_best_only=True)
    early_stopping = EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True)

    # Training the model
    history = model.fit(train_images, epochs=5, validation_data=val_images, callbacks=[checkpoint_callback, early_stopping])
    model.save(model_path)

    # Evaluate on test data
    results = model.evaluate(test_images, verbose=0)
    accuracy = results[1] * 100

    # Generate metrics and graphs
    y_pred = model.predict(test_images)
    y_pred_classes = np.argmax(y_pred, axis=1)
    y_true = test_images.classes

    class_names = list(test_images.class_indices.keys())
    report = classification_report(y_true, y_pred_classes, target_names=class_names, output_dict=True)
    report_str = classification_report(y_true, y_pred_classes,target_names=class_names)
    conf_matrix = confusion_matrix(y_true, y_pred_classes)
   
    report_list = []
    for label, metrics in report.items():
        if isinstance(metrics, dict):  # Ensure it's a valid class entry
            report_list.append({
                'label': label,
                'precision': metrics.get('precision', 0),
                'recall': metrics.get('recall', 0),
                'f1_score': metrics.get('f1-score', 0),
                'support': metrics.get('support', 0)
            })
 
    

   

    # Plot confusion matrix
    plt.figure(figsize=(8, 6))
    sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues', xticklabels=class_names, yticklabels=class_names)
    plt.xlabel('Predicted Labels')
    plt.ylabel('True Labels')
    plt.title('Confusion Matrix')
    plt.tight_layout()
    buffer = BytesIO()
    plt.savefig(buffer, format="png")
    buffer.seek(0)
    conf_matrix_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    buffer.close()
    plt.clf()

    # Plot training and validation accuracy
    epochs = range(len(history.history['accuracy']))
    plt.plot(epochs, history.history['accuracy'], label='Training Accuracy')
    plt.plot(epochs, history.history['val_accuracy'], label='Validation Accuracy')
    plt.legend()
    plt.title('Training and Validation Accuracy')
    buffer = BytesIO()
    plt.savefig(buffer, format="png")
    buffer.seek(0)
    accuracy_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    buffer.close()
    plt.clf()

    # Plot training and validation loss
    plt.plot(epochs, history.history['loss'], label='Training Loss')
    plt.plot(epochs, history.history['val_loss'], label='Validation Loss')
    plt.legend()
    plt.title('Training and Validation Loss')
    buffer = BytesIO()
    plt.savefig(buffer, format="png")
    buffer.seek(0)
    loss_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    buffer.close()
    plt.clf()
   
    # Render results to HTML
    context = {
        'accuracy': accuracy,
        'report_list': report_list,
        'conf_matrix_image': conf_matrix_base64,
        'accuracy_image': accuracy_base64,
        'loss_image': loss_base64,
        'report_str': report_str # Added report_str to context for HTML rendering
    }

    if 'application/json' in request.headers.get('Accept', ''):
        return JsonResponse({
            'status': 'success',
            'accuracy': accuracy,
            'report_list': report_list,
            'conf_matrix_image': conf_matrix_base64,
            'accuracy_image': accuracy_base64,
            'loss_image': loss_base64,
            'report_str': report_str # Added report_str to JSON response
        })

    return render(request, 'users/accuracy.html', context)



from django.core.files.storage import default_storage

# Mapping of animal names to their category (Reptile or Amphibian)
ANIMAL_CATEGORY_MAP = {
    # Reptiles
    'chameleon': 'Reptile',
    'snake': 'Reptile',
    'lizard': 'Reptile',
    'crocodile': 'Reptile',
    'turtle': 'Reptile',
    'tortoise': 'Reptile',
    'monitor': 'Reptile',
    'monitor lizard': 'Reptile',
    'gecko': 'Reptile',
    'iguana': 'Reptile',
    'alligator': 'Reptile',
    'komodo': 'Reptile',
    'komodo dragon': 'Reptile',
    'skink': 'Reptile',
    'viper': 'Reptile',
    'cobra': 'Reptile',
    'python': 'Reptile',
    'boa': 'Reptile',
    'caiman': 'Reptile',
    # Amphibians
    'frog': 'Amphibian',
    'toad': 'Amphibian',
    'salamander': 'Amphibian',
    'newt': 'Amphibian',
    'axolotl': 'Amphibian',
    'caecilian': 'Amphibian',
    'tree frog': 'Amphibian',
    'bullfrog': 'Amphibian',
    'mudpuppy': 'Amphibian',
}

def get_category(animal_name):
    """Return the category (Reptile/Amphibian) for a given animal name."""
    name_lower = animal_name.lower()
    for key, category in ANIMAL_CATEGORY_MAP.items():
        if key in name_lower:
            return category
    return 'Unknown'

# ImageNet class name keywords that correspond to reptiles or amphibians
IMAGENET_REPTILE_AMPHIBIAN_KEYWORDS = [
    # Amphibians
    'frog', 'toad', 'salamander', 'newt', 'axolotl', 'bullfrog', 'tree_frog',
    'tree frog', 'caecilian', 'mudpuppy', 'tailed_frog', 'common_newt', 'spotted_salamander',
    # Reptiles
    'snake', 'lizard', 'gecko', 'iguana', 'chameleon', 'crocodile', 'alligator',
    'turtle', 'tortoise', 'skink', 'viper', 'cobra', 'boa', 'python', 'caiman',
    'monitor', 'komodo', 'agama', 'whiptail', 'sidewinder', 'horned_viper',
    'thunder_snake', 'ringneck_snake', 'hognose_snake', 'green_snake',
    'king_snake', 'garter_snake', 'water_snake', 'vine_snake', 'night_snake',
    'boa_constrictor', 'rock_python', 'indian_cobra', 'green_mamba',
    'sea_snake', 'diamondback', 'cottonmouth', 'leatherback_turtle',
    'loggerhead', 'mud_turtle', 'terrapin', 'box_turtle', 'banded_gecko',
    'common_iguana', 'american_chameleon', 'frilled_lizard', 'alligator_lizard',
    'gila_monster', 'green_lizard', 'african_chameleon', 'komodo_dragon',
    'african_crocodile', 'american_alligator', 'softshell_turtle',
    'spiny_lizard', 'nile_crocodile', 'agama', 'sidewinder', 'rattlesnake',
]



def is_reptile_or_amphibian_imagenet(img_full_path):
    """
    Run MobileNetV2 (ImageNet weights) on the image and check if any of
    the top-10 predicted classes belong to reptile / amphibian groups.
    - Only check top 10 predictions (not 50) to avoid false positives
    - Require at least 3% confidence for a reptile/amphibian match
    - If top-1 class is clearly something else (plant, food, vehicle, person)
      with >50% confidence, reject immediately.
    Returns True if it is a reptile/amphibian, False otherwise.
    """
    import numpy as np
    from tensorflow.keras.preprocessing.image import load_img, img_to_array
    from tensorflow.keras.applications.mobilenet_v2 import (
        MobileNetV2 as INetModel,
        preprocess_input as inet_preprocess,
        decode_predictions,
    )

    # Clear non-reptile categories to hard-reject
    NON_REPTILE_KEYWORDS = [
        'mushroom', 'fungus', 'agaric', 'coral_fungus', 'hen_of_wood',
        'earthstar', 'stinkhorn', 'gyromitra',
        'person', 'people', 'man', 'woman', 'boy', 'girl', 'human',
        'car', 'bus', 'truck', 'motorcycle', 'bicycle', 'van',
        'cat', 'dog', 'bird', 'fish', 'insect', 'butterfly', 'bee',
        'flower', 'plant', 'tree', 'vegetable', 'fruit', 'food', 'pizza',
        'phone', 'laptop', 'computer', 'keyboard', 'bottle', 'cup',
    ]

    if not hasattr(is_reptile_or_amphibian_imagenet, '_inet_model'):
        is_reptile_or_amphibian_imagenet._inet_model = INetModel(
            weights='imagenet', include_top=True
        )
    inet_model = is_reptile_or_amphibian_imagenet._inet_model

    inet_img   = load_img(img_full_path, target_size=(224, 224))
    inet_array = img_to_array(inet_img)
    inet_array = np.expand_dims(inet_array, axis=0)
    inet_array = inet_preprocess(inet_array)

    preds     = inet_model.predict(inet_array, verbose=0)
    top_preds = decode_predictions(preds, top=10)[0]   # Only top-10

    # Hard reject: if top-1 prediction is clearly non-reptile with >50% confidence
    if top_preds:
        top1_name = top_preds[0][1].lower().replace('_', ' ')
        top1_prob = float(top_preds[0][2])
        for nrk in NON_REPTILE_KEYWORDS:
            if nrk in top1_name and top1_prob > 0.50:
                return False   # Clearly not a reptile/amphibian

    # Check if any top-10 class matches reptile/amphibian keywords with >=3% confidence
    for (_cid, class_name, prob) in top_preds:
        if float(prob) < 0.03:   # Require at least 3% confidence
            continue
        name_lower = class_name.lower().replace('_', ' ')
        name_raw   = class_name.lower()
        for keyword in IMAGENET_REPTILE_AMPHIBIAN_KEYWORDS:
            kw = keyword.lower()
            if kw in name_lower or kw in name_raw:
                return True
    return False

@csrf_exempt
def prediction(request):
    import numpy as np
    from tensorflow.keras.models import load_model
    from tensorflow.keras.preprocessing.image import ImageDataGenerator, load_img, img_to_array
    image_url, animal_name, category, confidence_pct = None, None, None, None

    if request.method == 'POST' and request.FILES.get('image'):
        model_path = os.path.join(settings.BASE_DIR, 'animal_classification_model.h5')

        if not os.path.exists(model_path):
            return render(request, 'users/detection.html', {'result': "Model not trained. Please train first."})

        img_file  = request.FILES['image']
        img_path  = default_storage.save('temp_image.jpg', img_file)
        img_full_path = os.path.join(settings.MEDIA_ROOT, img_path)
        image_url = os.path.join(settings.MEDIA_URL, img_path)

        # ── STEP 1: Pre-filter with ImageNet MobileNetV2 ──────────────────
        # Reject the image immediately if ImageNet does NOT recognise it as
        # a reptile or amphibian (sky, dog, car, food, etc. are all blocked).
        if not is_reptile_or_amphibian_imagenet(img_full_path):
            if 'application/json' in request.headers.get('Accept', '') or request.content_type == 'application/json':
                return JsonResponse({
                    'status': 'error',
                    'message': 'Invalid Image: This is not a Reptile or Amphibian.',
                    'is_invalid': True,
                    'image_url': request.build_absolute_uri(image_url) if image_url else None
                })
            return render(request, 'users/detection.html', {
                'is_invalid': True,
                'image_url': image_url,
            })

        # ── STEP 2: Species classification with the custom model ───────────
        # Fix: newer TF versions don't support 'groups' param in DepthwiseConv2D
        # that was saved in older model files.
        from tensorflow.keras.layers import DepthwiseConv2D

        class FixedDepthwiseConv2D(DepthwiseConv2D):
            def __init__(self, **kwargs):
                kwargs.pop('groups', None)   # remove unsupported param
                super().__init__(**kwargs)

        model = load_model(
            model_path,
            compile=False,
            custom_objects={'DepthwiseConv2D': FixedDepthwiseConv2D}
        )

        dataset_path   = 'media/archive'
        img_height, img_width = 224, 224

        train_datagen  = ImageDataGenerator(rescale=1.0/255)
        train_generator = train_datagen.flow_from_directory(
            dataset_path, target_size=(img_height, img_width),
            batch_size=32, class_mode='binary'
        )
        class_indices = train_generator.class_indices
        class_names   = {v: k for k, v in class_indices.items()}

        img       = load_img(img_full_path, target_size=(img_height, img_width))
        img_array = img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        predictions       = model.predict(img_array)
        predicted_index    = np.argmax(predictions, axis=1)[0]
        predicted_class_name = class_names[predicted_index]
        confidence         = predictions[0][predicted_index]

        category = get_category(predicted_class_name)

        # Extra safety net: if custom model output still doesn't map → Invalid
        if category == 'Unknown':
            if 'application/json' in request.headers.get('Accept', '') or request.content_type == 'application/json':
                return JsonResponse({
                    'status': 'error',
                    'message': 'Invalid Image: Category is Unknown.',
                    'is_invalid': True,
                    'image_url': request.build_absolute_uri(image_url) if image_url else None
                })
            return render(request, 'users/detection.html', {
                'is_invalid': True,
                'image_url': image_url,
            })

        # Clean up name: "banded_gecko" → "Banded Gecko"
        raw_name    = predicted_class_name.replace('_', ' ').replace('-', ' ')
        animal_name = ' '.join(word.capitalize() for word in raw_name.split())
        confidence_pct = f"{confidence * 100:.2f}%"

        if 'application/json' in request.headers.get('Accept', '') or request.content_type == 'application/json':
            return JsonResponse({
                'animal_name': animal_name,
                'category': category,
                'confidence_pct': confidence_pct,
                'image_url': request.build_absolute_uri(image_url),
                'status': 'success'
            })

        return render(request, 'users/detection.html', {
            'animal_name': animal_name,
            'category': category,
            'confidence_pct': confidence_pct,
            'image_url': image_url,
        })

    return render(request, 'users/detection.html', {
        'animal_name': animal_name,
        'category': category,
        'confidence_pct': confidence_pct,
        'image_url': image_url,
    })



############################################################################################################################################
# def ViewDataset(request):
#     dataset = os.path.join(settings.MEDIA_ROOT, 'Filtered_ClassSurvey.csv')
#     import pandas as pd
#     df = pd.read_csv(dataset,nrows=100)
#     df = df.to_html(index=None)
#     return render(request, 'users/viewData.html', {'data': df})


from django.shortcuts import render, redirect
from .models import UserRegistrationModel
from django.contrib import messages

@csrf_exempt
def UserRegisterActions(request):
    if request.method == 'POST':
        try:
            if 'application/json' in request.content_type:
                data = json.loads(request.body)
            else:
                data = request.POST

            user = UserRegistrationModel(
                name=data.get('name', data.get('loginid')),
                loginid=data.get('loginid'),
                password=data.get('password'),
                mobile=data.get('mobile', str(random.randint(1000000000, 9999999999))),
                email=data.get('email'),
                locality=data.get('locality', 'N/A'),
                address=data.get('address', 'N/A'),
                city=data.get('city', 'N/A'),
                state=data.get('state', 'N/A'),
                status='waiting'
            )
            user.save()
            
            if 'application/json' in request.headers.get('Accept', '') or request.content_type == 'application/json':
                return JsonResponse({'status': 'success', 'message': 'Registration successful!'})
            
            messages.success(request,"Registration successful!")
        except Exception as e:
            if 'application/json' in request.headers.get('Accept', '') or request.content_type == 'application/json':
                return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            messages.error(request, str(e))
            
    return render(request, 'UserRegistrations.html') 


@csrf_exempt
def UserLoginCheck(request):
    if request.method == "POST":
        try:
            if 'application/json' in request.content_type:
                data = json.loads(request.body)
                loginid = data.get('loginid')
                pswd = data.get('pswd')
            else:
                loginid = request.POST.get('loginid')
                pswd = request.POST.get('pswd')
            
            print("Login ID = ", loginid, ' Password = ', pswd)
            check = UserRegistrationModel.objects.get(loginid=loginid, password=pswd)
            status = check.status
            print('Status is = ', status)
            if status == "activated":
                request.session['id'] = check.id
                request.session['loggeduser'] = check.name
                request.session['loginid'] = loginid
                request.session['email'] = check.email
                
                if 'application/json' in request.headers.get('Accept', '') or request.content_type == 'application/json':
                    return JsonResponse({
                        'status': 'success',
                        'user_id': check.id,
                        'name': check.name,
                        'email': check.email
                    })
                return render(request, 'users/UserHomePage.html', {})
            else:
                if 'application/json' in request.headers.get('Accept', '') or request.content_type == 'application/json':
                    return JsonResponse({'status': 'error', 'message': 'Your Account Not at activated'}, status=403)
                messages.success(request, 'Your Account Not at activated')
                return render(request, 'UserLogin.html')
        except Exception as e:
            print('Exception is ', str(e))
            if 'application/json' in request.headers.get('Accept', '') or request.content_type == 'application/json':
                return JsonResponse({'status': 'error', 'message': 'Invalid Login id and password'}, status=401)
            pass
        messages.success(request, 'Invalid Login id and password')
    return render(request, 'UserLogin.html', {})


def UserHome(request):
    return render(request, 'users/UserHomePage.html', {})


def index(request):
    return render(request,"index.html")