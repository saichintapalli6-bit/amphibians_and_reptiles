import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import api from '../services/api';

export default function UserManagementScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/userDetails', {
        headers: { 'Accept': 'application/json' }
      });
      if (response.data.status === 'success') {
        setUsers(response.data.users);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (action, uid) => {
    const endpoint = action === 'activate' ? `/ActivUsers/?uid=${uid}` : `/DeleteUsers/?uid=${uid}`;
    try {
      const resp = await api.get(endpoint, { headers: { 'Accept': 'application/json' } });
      if (resp.data.status === 'success') {
        Alert.alert('Success', `User ${action === 'activate' ? 'activated' : 'deleted'}`);
        fetchUsers();
      }
    } catch (error) {
      Alert.alert('Error', 'Action failed');
    }
  };

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name} ({item.loginid})</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userStatus}>Status: {item.status}</Text>
      </View>
      <View style={styles.actions}>
        {item.status !== 'activated' && (
          <TouchableOpacity style={styles.activateBtn} onPress={() => handleAction('activate', item.id)}>
            <Text style={styles.btnText}>Activate</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleAction('delete', item.id)}>
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#D5006D" /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUser}
        ListEmptyComponent={<Text style={styles.emptyText}>No users found.</Text>}
        refreshing={loading}
        onRefresh={fetchUsers}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 10,
  },
  userCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    color: '#666',
  },
  userStatus: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
  },
  actions: {
    flexDirection: 'column',
    gap: 8,
  },
  activateBtn: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: '#F44336',
    padding: 8,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
  },
});
