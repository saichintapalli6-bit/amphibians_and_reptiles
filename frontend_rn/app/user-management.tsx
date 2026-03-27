import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView, Platform,
  Animated, useWindowDimensions,
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

/* Web-safe confirm: uses window.confirm on web, Alert on mobile */
function webConfirm(title: string, msg: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${msg}`)) onConfirm();
  } else {
    Alert.alert(title, msg, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', style: 'destructive', onPress: onConfirm },
    ]);
  }
}

function webAlert(title: string, msg: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${msg}`);
  } else {
    Alert.alert(title, msg);
  }
}

export default function UserManagementScreen() {
  const [users,   setUsers]   = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/userDetails', { headers: { Accept: 'application/json' } });
      if (response.data.status === 'success') {
        setUsers(response.data.users);
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      } else {
        webAlert('Error', 'Failed to load users');
      }
    } catch {
      webAlert('Connection Error', 'Cannot reach the server. Is Django running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const doActivate = async (uid: number, name: string) => {
    webConfirm('Activate User', `Activate "${name}"?`, async () => {
      setActionId(uid);
      try {
        const resp = await api.get(`/ActivUsers/?uid=${uid}`, { headers: { Accept: 'application/json' } });
        if (resp.data.status === 'success') {
          webAlert('✅ Success', `${name} has been activated!`);
          fetchUsers();
        } else {
          webAlert('Error', resp.data.message || 'Activation failed');
        }
      } catch {
        webAlert('Error', 'Activation failed. Try again.');
      } finally {
        setActionId(null);
      }
    });
  };

  const doDelete = async (uid: number, name: string) => {
    webConfirm('🗑️ Delete User', `Delete "${name}"? This cannot be undone!`, async () => {
      setActionId(uid);
      try {
        const resp = await api.get(`/DeleteUsers/?uid=${uid}`, { headers: { Accept: 'application/json' } });
        if (resp.data.status === 'success') {
          webAlert('✅ Deleted', `${name} has been removed.`);
          fetchUsers();
        } else {
          webAlert('Error', resp.data.message || 'Delete failed');
        }
      } catch {
        webAlert('Error', 'Delete failed. Try again.');
      } finally {
        setActionId(null);
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#e94560" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>👥  User Management</Text>
          <Text style={styles.headerSub}>{users.length} registered user{users.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchUsers}>
          <Text style={styles.refreshBtnText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.body, isDesktop && styles.bodyDesktop]}>
        {users.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>👤</Text>
            <Text style={styles.emptyText}>No users registered yet.</Text>
          </View>
        ) : (
          users.map((user, i) => (
            <Animated.View
              key={user.id}
              style={[styles.card, isDesktop && styles.cardDesktop, { opacity: fadeAnim }]}
            >
              {/* Left: User info */}
              <View style={styles.userInfo}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{user.name?.[0]?.toUpperCase() || '?'}</Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userMeta}>🆔 {user.loginid}</Text>
                  <Text style={styles.userMeta}>📧 {user.email}</Text>
                  {user.mobile ? <Text style={styles.userMeta}>📱 {user.mobile}</Text> : null}
                  <View style={[styles.badge, user.status === 'activated' ? styles.badgeActive : styles.badgeWait]}>
                    <Text style={styles.badgeText}>
                      {user.status === 'activated' ? '✅ Active' : '⏳ Pending Approval'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Right: Actions */}
              <View style={styles.actions}>
                {user.status !== 'activated' && (
                  <TouchableOpacity
                    style={[styles.activateBtn, actionId === user.id && styles.btnDisabled]}
                    onPress={() => doActivate(user.id, user.name)}
                    disabled={actionId === user.id}
                    activeOpacity={0.8}
                  >
                    {actionId === user.id
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Text style={styles.btnText}>✅ Activate</Text>}
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.deleteBtn, actionId === user.id && styles.btnDisabled]}
                  onPress={() => doDelete(user.id, user.name)}
                  disabled={actionId === user.id}
                  activeOpacity={0.8}
                >
                  {actionId === user.id
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.btnText}>🗑️ Delete</Text>}
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: Platform.OS === 'web' ? '100vh' as any : undefined,
    backgroundColor: '#0f0f23',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { color: 'rgba(255,255,255,0.5)', marginTop: 14, fontSize: 15 },
  header: {
    backgroundColor: '#1a1a3e',
    paddingTop: 18, paddingBottom: 18, paddingHorizontal: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: 'rgba(233,69,96,0.25)',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  refreshBtn: {
    backgroundColor: 'rgba(233,69,96,0.15)',
    borderWidth: 1, borderColor: 'rgba(233,69,96,0.4)',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  refreshBtnText: { color: '#e94560', fontWeight: '700', fontSize: 13 },
  body:        { padding: 16 },
  bodyDesktop: { padding: 24, maxWidth: 900, alignSelf: 'center' as any, width: '100%' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 16, marginBottom: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  cardDesktop: { padding: 20 },
  userInfo: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, marginRight: 12 },
  avatarCircle: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#e94560', justifyContent: 'center', alignItems: 'center',
    marginRight: 12, flexShrink: 0,
  },
  avatarText:  { color: '#fff', fontSize: 18, fontWeight: '800' },
  userDetails: { flex: 1 },
  userName:    { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 3 },
  userMeta:    { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 2 },
  badge: {
    alignSelf: 'flex-start', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4, marginTop: 6,
  },
  badgeActive: { backgroundColor: 'rgba(52,211,153,0.2)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.4)' },
  badgeWait:   { backgroundColor: 'rgba(251,191,36,0.2)', borderWidth: 1, borderColor: 'rgba(251,191,36,0.4)' },
  badgeText:   { fontSize: 11, fontWeight: '700', color: '#fff' },
  actions:     { flexDirection: 'column', gap: 8, minWidth: 110 },
  activateBtn: {
    backgroundColor: '#10b981', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center',
    shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  deleteBtn: {
    backgroundColor: '#e94560', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center',
    shadowColor: '#e94560', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  btnDisabled: { opacity: 0.5 },
  btnText:     { color: '#fff', fontWeight: '700', fontSize: 13 },
  emptyBox:    { alignItems: 'center', paddingTop: 60 },
  emptyIcon:   { fontSize: 48, marginBottom: 12 },
  emptyText:   { color: 'rgba(255,255,255,0.4)', fontSize: 16 },
});
