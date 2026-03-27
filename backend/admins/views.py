from django.shortcuts import render,redirect
from django.contrib import messages
from users.models import UserRegistrationModel
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json


# Create your views here.
@csrf_exempt
def AdminLoginCheck(request):
    if request.method == 'POST':
        try:
            if 'application/json' in request.content_type:
                data = json.loads(request.body)
                usrid = data.get('loginid')
                pswd = data.get('pswd')
            else:
                usrid = request.POST.get('loginid')
                pswd = request.POST.get('pswd')

            print("User ID is = ", usrid)
            if usrid == 'admin' and pswd == 'admin':
                if 'application/json' in request.headers.get('Accept', '') or request.content_type == 'application/json':
                    return JsonResponse({'status': 'success', 'message': 'Admin Login Successful'})
                return render(request, 'admins/AdminHome.html')
            else:
                if 'application/json' in request.headers.get('Accept', '') or request.content_type == 'application/json':
                    return JsonResponse({'status': 'error', 'message': 'Please Check Your Login Details'}, status=401)
                messages.error(request, 'Please Check Your Login Details')
        except Exception as e:
            if 'application/json' in request.headers.get('Accept', '') or request.content_type == 'application/json':
                return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return render(request, 'AdminLogin.html', {})



def RegisterUsersView(request):
    data = UserRegistrationModel.objects.all()
    if 'application/json' in request.headers.get('Accept', ''):
        users_list = list(data.values('id', 'name', 'loginid', 'email', 'mobile', 'status', 'city'))
        return JsonResponse({'status': 'success', 'users': users_list})
    return render(request, 'admins/viewregisterusers.html', context={'data': data})




@csrf_exempt
def ActivaUsers(request):
    user_id = request.GET.get('uid')
    if not user_id and request.content_type == 'application/json':
        try:
            data = json.loads(request.body)
            user_id = data.get('uid')
        except: pass

    if user_id:
        UserRegistrationModel.objects.filter(id=user_id).update(status='activated')
        if 'application/json' in request.headers.get('Accept', '') or request.content_type == 'application/json':
            return JsonResponse({'status': 'success', 'message': 'User activated'})
    
    return redirect('RegisterUsersView')

@csrf_exempt
def DeleteUsers(request):
    user_id = request.GET.get('uid')
    if not user_id and request.content_type == 'application/json':
        try:
            data = json.loads(request.body)
            user_id = data.get('uid')
        except: pass
        
    if user_id:
        UserRegistrationModel.objects.filter(id=user_id).delete()
        if 'application/json' in request.headers.get('Accept', '') or request.content_type == 'application/json':
            return JsonResponse({'status': 'success', 'message': 'User deleted'})

    return redirect('RegisterUsersView')


