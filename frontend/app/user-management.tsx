import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import api from '../services/api';

interface User {
  id: number;
  name: string;
  loginid: string;
  email: string;
  mobile: string;
  status: string;
  city?: string;
}

export default function UserManagementScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Django URL: /userDetails  (admins.RegisterUsersView)
      const response = await api.get('/userDetails', {
        headers: { 'Accept': 'application/json' }
      });
      if (response.data.status === 'success') {
        setUsers(response.data.users);
      } else {
        Alert.alert('Error', 'Failed to load users');
      }
    } catch (error: any) {
      if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network')) {
        Alert.alert('Connection Error', 'Cannot reach the server. Check Wi-Fi and IP in api.js');
      } else {
        Alert.alert('Error', 'Failed to fetch users. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAction = async (action: 'activate' | 'delete', uid: number, userName: string) => {
    const confirmMsg = action === 'activate'
      ? `Activate user "${userName}"?`
      : `Delete user "${userName}"? This cannot be undone.`;

    Alert.alert(
      action === 'activate' ? 'Activate User' : 'Delete User',
      confirmMsg,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'activate' ? 'Activate' : 'Delete',
          style: action === 'delete' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              // Django URLs: /ActivUsers/?uid=  and  /DeleteUsers/?uid=
              const endpoint = action === 'activate'
                ? `/ActivUsers/?uid=${uid}`
                : `/DeleteUsers/?uid=${uid}`;
              const resp = await api.get(endpoint, {
                headers: { 'Accept': 'application/json' }
              });
              if (resp.data.status === 'success') {
                Alert.alert('Success', `User ${action === 'activate' ? 'activated' : 'deleted'} successfully`);
                fetchUsers(); // Refresh the list
              } else {
                Alert.alert('Error', resp.data.message || 'Action failed');
              }
            } catch (error) {
              Alert.alert('Error', 'Action failed. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userSub}>ID: {item.loginid}</Text>
        <Text style={styles.userSub}>{item.email}</Text>
        <View style={[styles.statusBadge, item.status === 'activated' ? styles.statusActive : styles.statusWaiting]}>
          <Text style={styles.statusText}>{item.status === 'activated' ? '✅ Activated' : '⏳ Waiting'}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        {item.status !== 'activated' && (
          <TouchableOpacity
            style={styles.activateBtn}
            onPress={() => handleAction('activate', item.id, item.name)}
          >
            <Text style={styles.btnText}>Activate</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleAction('delete', item.id, item.name)}
        >
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#D5006D" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Registered Users ({users.length})</Text>
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUser}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No users found.</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchUsers} colors={['#D5006D']} />}
        contentContainerStyle={users.length === 0 ? { flex: 1 } : { padding: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#D5006D',
    padding: 15,
    paddingHorizontal: 20,
  },
  headerText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
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
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  userSub: {
    color: '#666',
    fontSize: 13,
    marginBottom: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  statusActive: {
    backgroundColor: '#e8f5e9',
  },
  statusWaiting: {
    backgroundColor: '#fff3e0',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  actions: {
    flexDirection: 'column',
    gap: 8,
    minWidth: 80,
  },
  activateBtn: {
    backgroundColor: '#4CAF50',
    padding: 9,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: '#F44336',
    padding: 9,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
  },
});
