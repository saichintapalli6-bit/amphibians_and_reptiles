import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import api from '../services/api';

interface ReportRow {
  label: string;
  precision: number;
  recall: number;
  f1_score: number;
  support: number;
}

export default function AccuracyScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/training/', {
          headers: { 'Accept': 'application/json' }
        });
        if (response.data.status === 'success') {
          setData(response.data);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch model results');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#D5006D" /></View>;
  if (!data) return <View style={styles.centered}><Text>No data available</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.pageTitle}>Model Training Results</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Overall Accuracy</Text>
        <Text style={styles.accuracyValue}>{parseFloat(data.accuracy).toFixed(2)}%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Classification Report</Text>
        <ScrollView horizontal>
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerText, {width: 100}]}>Label</Text>
              <Text style={[styles.headerText, {width: 80}]}>Precision</Text>
              <Text style={[styles.headerText, {width: 80}]}>Recall</Text>
              <Text style={[styles.headerText, {width: 80}]}>F1-Score</Text>
              <Text style={[styles.headerText, {width: 80}]}>Support</Text>
            </View>
            {data.report_list.map((row: ReportRow, idx: number) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.cellText, {width: 100}]}>{row.label}</Text>
                <Text style={[styles.cellText, {width: 80}]}>{parseFloat(row.precision.toString()).toFixed(2)}</Text>
                <Text style={[styles.cellText, {width: 80}]}>{parseFloat(row.recall.toString()).toFixed(2)}</Text>
                <Text style={[styles.cellText, {width: 80}]}>{parseFloat(row.f1_score.toString()).toFixed(2)}</Text>
                <Text style={[styles.cellText, {width: 80}]}>{row.support}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Confusion Matrix</Text>
        <Image 
          source={{ uri: `data:image/png;base64,${data.conf_matrix_image}` }} 
          style={styles.resultImage} 
          resizeMode="contain"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Training & Validation Accuracy</Text>
        <Image 
          source={{ uri: `data:image/png;base64,${data.accuracy_image}` }} 
          style={styles.resultImage} 
          resizeMode="contain"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Training & Validation Loss</Text>
        <Image 
          source={{ uri: `data:image/png;base64,${data.loss_image}` }} 
          style={styles.resultImage} 
          resizeMode="contain"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#111', // Dark background as in accuracy.html
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd700',
    textAlign: 'center',
    marginVertical: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 10,
  },
  accuracyValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ffd700',
    paddingBottom: 5,
    marginBottom: 5,
  },
  headerText: {
    color: '#ffd700',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  cellText: {
    color: '#eee',
    fontSize: 12,
  },
  resultImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
});
