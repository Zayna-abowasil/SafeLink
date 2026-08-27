import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config/api';

interface ScannedLink {
  _id: string;
  url: string;
  classification: string;
}

export default function ReportScreen() {
  const [scans, setScans] = useState<ScannedLink[]>([]);
  const [selectedScanId, setSelectedScanId] = useState('');
  const [selectedScanUrl, setSelectedScanUrl] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingScans, setLoadingScans] = useState(true);

  const [reason, setReason] = useState<'Phishing' | 'Malware' | 'Inappropriate content'>('Phishing');
  const [comments, setComments] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // جلب الفحوصات السابقة لاختيار الرابط منها
  const fetchScannedLinks = async () => {
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
        setScans(data.scans);
        if (data.scans.length > 0) {
          setSelectedScanId(data.scans[0]._id);
          setSelectedScanUrl(data.scans[0].url);
        }
      }
    } catch (error) {
      console.error('Failed to load scans:', error);
    } finally {
      setLoadingScans(false);
    }
  };

  useEffect(() => {
    fetchScannedLinks();
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Denied', 'Gallery access is required to upload screenshots.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleReportSubmit = async () => {
    if (!selectedScanId) {
      Alert.alert('Validation Error', 'Please select a scanned link to report.');
      return;
    }

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const formData = new FormData();
      formData.append('scanId', selectedScanId);
      formData.append('reason', reason);
      formData.append('comments', comments);

      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'screenshot.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('screenshot', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }

      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: {
          'bypass-tunnel-reminder': 'true',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit report');
      }

      Alert.alert('Report Submitted', 'The threat report has been registered successfully.');
      setComments('');
      setImageUri(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Unable to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-950" contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <View className="bg-rose-500/10 p-2 rounded-xl border border-rose-500/20 mr-3">
          <Ionicons name="flag" size={24} color="#fb7185" />
        </View>
        <View>
          <Text className="text-2xl font-bold text-rose-400">Threat Dispatch</Text>
          <Text className="text-xs text-slate-400">Report suspicious links and threats</Text>
        </View>
      </View>

      <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-8">
        <View className="mb-4">
          <Text className="text-xs font-semibold text-slate-300 mb-2">Select Scanned Link</Text>
          {loadingScans ? (
            <ActivityIndicator color="#38bdf8" className="py-2" />
          ) : scans.length === 0 ? (
            <View className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <Text className="text-xs text-slate-500">No scanned links found. Run a scan first.</Text>
            </View>
          ) : (
            <View>
              <TouchableOpacity
                className="flex-row items-center justify-between bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3"
                onPress={() => setShowDropdown(!showDropdown)}
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <Ionicons name="link-outline" size={18} color="#38bdf8" />
                  <Text className="text-slate-50 text-sm ml-2" numberOfLines={1}>
                    {selectedScanUrl || 'Select link to report'}
                  </Text>
                </View>
                <Ionicons
                  name={showDropdown ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#94a3b8"
                />
              </TouchableOpacity>

              {showDropdown && (
                <View className="bg-slate-950 border border-slate-800 rounded-xl mt-1.5 overflow-hidden max-h-48">
                  <ScrollView nestedScrollEnabled>
                    {scans.map((item) => (
                      <TouchableOpacity
                        key={item._id}
                        className={`p-3 border-b border-slate-800/60 flex-row justify-between items-center ${
                          selectedScanId === item._id ? 'bg-sky-950/40' : ''
                        }`}
                        onPress={() => {
                          setSelectedScanId(item._id);
                          setSelectedScanUrl(item.url);
                          setShowDropdown(false);
                        }}
                      >
                        <Text
                          className={`text-xs flex-1 mr-2 ${
                            selectedScanId === item._id ? 'text-sky-400 font-bold' : 'text-slate-300'
                          }`}
                          numberOfLines={1}
                        >
                          {item.url}
                        </Text>
                        <Text className="text-[10px] text-slate-500 font-semibold">
                          {item.classification}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}
        </View>

        <View className="mb-4">
          <Text className="text-xs font-semibold text-slate-300 mb-2">Threat Reason</Text>
          <View className="flex-row justify-between">
            {(['Phishing', 'Malware', 'Inappropriate content'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setReason(r)}
                className={`py-2 px-2.5 rounded-xl border ${
                  reason === r
                    ? 'bg-rose-500/20 border-rose-500'
                    : 'bg-slate-950 border-slate-700'
                }`}
              >
                <Text
                  className={`text-[11px] ${
                    reason === r ? 'text-rose-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-xs font-semibold text-slate-300 mb-2">Incident Details / Comments</Text>
          <TextInput
            className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-50 text-sm h-24"
            placeholder="Describe why this link is dangerous..."
            placeholderTextColor="#64748b"
            value={comments}
            onChangeText={setComments}
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          className="border border-dashed border-sky-400 rounded-xl py-3.5 flex-row items-center justify-center mb-4 bg-sky-950/20"
          onPress={pickImage}
        >
          <Ionicons
            name={imageUri ? 'image' : 'attach-outline'}
            size={18}
            color="#38bdf8"
          />
          <Text className="text-sky-400 font-semibold text-xs ml-2">
            {imageUri ? 'Screenshot Attached (Tap to Change)' : 'Attach Evidence Screenshot'}
          </Text>
        </TouchableOpacity>

        {imageUri && (
          <Image source={{ uri: imageUri }} className="w-full h-40 rounded-xl mb-4" />
        )}

        <TouchableOpacity
          className="bg-rose-600 rounded-xl py-3.5 flex-row items-center justify-center space-x-2"
          onPress={handleReportSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="#ffffff" />
              <Text className="text-white font-bold text-base ml-2">Submit Threat Report</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}