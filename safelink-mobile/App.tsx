import React, { useState } from 'react';
import { SafeAreaView, StatusBar, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ScanScreen from './src/screens/ScanScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ReportScreen from './src/screens/ReportScreen';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'scan' | 'history' | 'report'>('scan');

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    setIsAuthenticated(false);
    setAuthScreen('login');
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#020617" />
        {authScreen === 'login' ? (
          <LoginScreen
            onLoginSuccess={() => setIsAuthenticated(true)}
            onNavigateToRegister={() => setAuthScreen('register')}
          />
        ) : (
          <RegisterScreen
            onRegisterSuccess={() => setAuthScreen('login')}
            onNavigateToLogin={() => setAuthScreen('login')}
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {/* Main Content Area */}
      <View style={styles.content}>
        {activeTab === 'scan' && (
          <ScanScreen
            onNavigateToHistory={() => setActiveTab('history')}
            onLogout={handleLogout}
          />
        )}
        {activeTab === 'history' && <HistoryScreen />}
        {activeTab === 'report' && <ReportScreen />}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('scan')}
        >
          <Text style={[styles.navText, activeTab === 'scan' && styles.navActiveTextSky]}>
            🔍 Scanner
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.navText, activeTab === 'history' && styles.navActiveTextSky]}>
            📜 History
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('report')}
        >
          <Text style={[styles.navText, activeTab === 'report' && styles.navActiveTextRose]}>
            🚩 Report
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  navActiveTextSky: {
    color: '#38bdf8',
  },
  navActiveTextRose: {
    color: '#fb7185',
  },
});