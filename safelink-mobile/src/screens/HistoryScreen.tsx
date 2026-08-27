import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

interface HistoryItem {
  _id: string;
  url: string;
  riskScore: number;
  classification: string;
  scanDate: string;
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/scans/history`, {
        headers: {
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await response.json();
      if (response.ok && data.scans) {
        setHistory(data.scans);
      }
    } catch (error) {
      console.error('History fetch failed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/scans/${id}`, {
        method: 'DELETE',
        headers: {
          'bypass-tunnel-reminder': 'true',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        setHistory((prev) => prev.filter((item) => item._id !== id));
      } else {
        Alert.alert('Error', 'Failed to delete scan record.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network request failed.');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📜 Scan Logs</Text>
        <Text style={styles.subtitle}>Audit trail of previously analyzed URLs</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchHistory();
              }}
              tintColor="#38bdf8"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No scans performed yet.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMalicious = item.riskScore > 40;
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.urlText} numberOfLines={1}>
                    {item.url}
                  </Text>
                  <View style={[styles.badge, isMalicious ? styles.badgeThreat : styles.badgeSafe]}>
                    <Text style={[styles.badgeText, isMalicious ? styles.badgeTextThreat : styles.badgeTextSafe]}>
                      {item.classification || (isMalicious ? 'Threat' : 'Clean')}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBottom}>
                  <Text style={styles.riskText}>
                    Risk: <Text style={styles.riskValue}>{item.riskScore}/100</Text>
                  </Text>
                  <View style={styles.actionsRow}>
                    <Text style={styles.dateText}>
                      {new Date(item.scanDate).toLocaleDateString()}
                    </Text>
                    <TouchableOpacity onPress={() => handleDelete(item._id)}>
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#38bdf8',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  urlText: {
    color: '#f8fafc',
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeSafe: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  badgeThreat: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  badgeTextSafe: {
    color: '#34d399',
  },
  badgeTextThreat: {
    color: '#fb7185',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  riskText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  riskValue: {
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    color: '#64748b',
    marginRight: 12,
  },
  deleteText: {
    fontSize: 12,
    color: '#fb7185',
    fontWeight: 'bold',
  },
});