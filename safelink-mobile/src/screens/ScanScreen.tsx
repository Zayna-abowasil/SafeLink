import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

interface ScanResult {
  url: string;
  classification: string;
  riskScore: number;
  aiExplanation: string;
  isSafe: boolean;
}

interface ScanScreenProps {
  onNavigateToHistory: () => void;
  onLogout: () => void;
}

export default function ScanScreen({ onNavigateToHistory, onLogout }: ScanScreenProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScan = async () => {
    if (!url.trim()) {
      Alert.alert('Invalid URL', 'Please enter a valid web link to analyze.');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/scans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Scan failed.');
      }

      const scanData = data.scan;
      setResult({
        url: scanData.url,
        classification: scanData.classification,
        riskScore: Number(scanData.riskScore),
        aiExplanation: scanData.aiExplanation || 'No explanation provided.',
        isSafe: scanData.classification === 'Safe',
      });
    } catch (error: any) {
      console.error('Scan Error:', error);
      Alert.alert('Scan Failed', error.message || 'Unable to analyze the URL.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🛡️ SafeLink AI</Text>
          <Text style={styles.subtitle}>Real-Time Threat Scanner</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Analyze Target URL</Text>
        <Text style={styles.cardSubtitle}>Paste suspicious link below to scan with OpenAI models</Text>

        <TextInput
          style={styles.input}
          placeholder="https://secure-account-update.xyz/login"
          placeholderTextColor="#64748b"
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          keyboardType="url"
          autoCorrect={false}
        />

        <TouchableOpacity style={styles.scanButton} onPress={handleScan} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.scanButtonText}>Run AI Security Scan</Text>
          )}
        </TouchableOpacity>
      </View>

      {result && (
        <View style={[styles.resultCard, result.isSafe ? styles.resultCardSafe : styles.resultCardThreat]}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultVerdictTitle}>Security Verdict</Text>
            <View style={[styles.badge, result.isSafe ? styles.badgeSafe : styles.badgeThreat]}>
              <Text style={[styles.badgeText, result.isSafe ? styles.badgeTextSafe : styles.badgeTextThreat]}>
                {result.isSafe ? 'SAFE LINK' : 'THREAT DETECTED'}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Risk Score</Text>
              <Text style={[styles.statValue, result.riskScore > 40 ? styles.statValueThreat : styles.statValueSafe]}>
                {result.riskScore}/100
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Classification</Text>
              <Text style={styles.statValueText}>{result.classification}</Text>
            </View>
          </View>

          <Text style={styles.aiLabel}>AI Intelligence Brief:</Text>
          <Text style={styles.aiExplanation}>{result.aiExplanation}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.historyNavButton} onPress={onNavigateToHistory}>
        <Text style={styles.historyNavText}>📜 View Scan History</Text>
      </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#38bdf8',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  logoutText: {
    fontSize: 12,
    color: '#fb7185',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 16,
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
    marginBottom: 16,
  },
  scanButton: {
    backgroundColor: '#0284c7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  resultCardSafe: {
    backgroundColor: 'rgba(6, 78, 59, 0.3)',
    borderColor: '#10b981',
  },
  resultCardThreat: {
    backgroundColor: 'rgba(136, 19, 55, 0.3)',
    borderColor: '#f43f5e',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultVerdictTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e2e8f0',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeSafe: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  badgeThreat: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeTextSafe: {
    color: '#34d399',
  },
  badgeTextThreat: {
    color: '#fb7185',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  statValueSafe: {
    color: '#34d399',
  },
  statValueThreat: {
    color: '#fb7185',
  },
  statValueText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginTop: 4,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 4,
  },
  aiExplanation: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
  },
  historyNavButton: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 32,
  },
  historyNavText: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 14,
  },
});