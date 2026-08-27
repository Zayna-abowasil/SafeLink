import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

export default function ReportScreen() {
  const [scanId, setScanId] = useState('');
  const [reason, setReason] = useState<'Phishing' | 'Malware' | 'Inappropriate content'>('Phishing');
  const [comments, setComments] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    if (!scanId.trim()) {
      Alert.alert('Validation Error', 'Please provide a valid Scan ID.');
      return;
    }

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const formData = new FormData();
      formData.append('scanId', scanId.trim());
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

      Alert.alert('Report Submitted', 'The report and screenshot have been uploaded to Cloudinary.');
      setScanId('');
      setComments('');
      setImageUri(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Unable to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>🚩 Threat Dispatch</Text>
        <Text style={styles.subtitle}>Report phishing scans and malicious campaigns</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Scan ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Paste scan ObjectId here..."
            placeholderTextColor="#64748b"
            value={scanId}
            onChangeText={setScanId}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Reason</Text>
          <View style={styles.reasonRow}>
            {(['Phishing', 'Malware', 'Inappropriate content'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setReason(r)}
                style={[
                  styles.reasonBtn,
                  reason === r ? styles.reasonBtnActive : styles.reasonBtnInactive,
                ]}
              >
                <Text
                  style={[
                    styles.reasonText,
                    reason === r ? styles.reasonTextActive : styles.reasonTextInactive,
                  ]}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Incident Details / Comments</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the deceptive behavior, email sender, etc..."
            placeholderTextColor="#64748b"
            value={comments}
            onChangeText={setComments}
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
          <Text style={styles.attachText}>
            {imageUri ? '📸 Screenshot Attached (Tap to Change)' : '📎 Attach Evidence Screenshot'}
          </Text>
        </TouchableOpacity>

        {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleReportSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitText}>Submit Threat Report</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fb7185',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 14,
  },
  textArea: {
    height: 90,
  },
  reasonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reasonBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  reasonBtnActive: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    borderColor: '#f43f5e',
  },
  reasonBtnInactive: {
    backgroundColor: '#020617',
    borderColor: '#334155',
  },
  reasonText: {
    fontSize: 11,
  },
  reasonTextActive: {
    color: '#fb7185',
    fontWeight: 'bold',
  },
  reasonTextInactive: {
    color: '#94a3b8',
  },
  attachBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#38bdf8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
  },
  attachText: {
    color: '#38bdf8',
    fontWeight: '600',
    fontSize: 12,
  },
  previewImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: '#e11d48',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});