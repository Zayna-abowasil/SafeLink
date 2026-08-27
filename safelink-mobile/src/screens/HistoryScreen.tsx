import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
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
    <View className="flex-1 bg-slate-950 p-5">
      <View className="flex-row items-center mb-5">
        <View className="bg-sky-500/10 p-2 rounded-xl border border-sky-500/20 mr-3">
          <Ionicons name="time" size={24} color="#38bdf8" />
        </View>
        <View>
          <Text className="text-2xl font-bold text-sky-400">Scan Logs</Text>
          <Text className="text-xs text-slate-400">Audit trail of previously analyzed URLs</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
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
            <View className="py-16 items-center">
              <Ionicons name="folder-open-outline" size={48} color="#475569" />
              <Text className="text-slate-500 text-sm mt-3">No scans performed yet.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMalicious = item.riskScore > 40;
            return (
              <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-row items-center flex-1 mr-2">
                    <Ionicons
                      name={isMalicious ? 'alert-circle' : 'shield-checkmark'}
                      size={18}
                      color={isMalicious ? '#fb7185' : '#34d399'}
                    />
                    <Text className="text-slate-50 font-bold text-sm ml-2 flex-1" numberOfLines={1}>
                      {item.url}
                    </Text>
                  </View>

                  <View
                    className={`px-2.5 py-1 rounded-xl ${
                      isMalicious ? 'bg-rose-500/20' : 'bg-emerald-500/20'
                    }`}
                  >
                    <Text
                      className={`text-[11px] font-bold ${
                        isMalicious ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {item.classification || (isMalicious ? 'Threat' : 'Clean')}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-slate-800">
                  <Text className="text-xs text-slate-400">
                    Risk: <Text className="font-bold text-slate-50">{item.riskScore}/100</Text>
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-[11px] text-slate-500 mr-3">
                      {new Date(item.scanDate).toLocaleDateString()}
                    </Text>
                    <TouchableOpacity
                      className="flex-row items-center"
                      onPress={() => handleDelete(item._id)}
                    >
                      <Ionicons name="trash-outline" size={14} color="#fb7185" />
                      <Text className="text-xs text-rose-400 font-bold ml-1">Delete</Text>
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