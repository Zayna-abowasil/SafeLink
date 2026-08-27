import "./global.css";
import React, { useState } from 'react';
import { SafeAreaView, StatusBar, View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#020617' }} className="flex-1 bg-slate-950">
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#020617' }} className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      <View style={{ flex: 1 }} className="flex-1">
        {activeTab === 'scan' && (
          <ScanScreen
            onNavigateToHistory={() => setActiveTab('history')}
            onLogout={handleLogout}
          />
        )}
        {activeTab === 'history' && <HistoryScreen />}
        {activeTab === 'report' && <ReportScreen />}
      </View>

      {/* Bottom Navigation with Vector Icons */}
      <View className="flex-row justify-between bg-slate-900 border-t border-slate-800 py-2.5 px-5">
        <TouchableOpacity className="flex-1 items-center" onPress={() => setActiveTab('scan')}>
          <Ionicons
            name={activeTab === 'scan' ? "shield-checkmark" : "shield-checkmark-outline"}
            size={22}
            color={activeTab === 'scan' ? "#38bdf8" : "#64748b"}
          />
          <Text className={`text-[11px] mt-1 font-bold ${activeTab === 'scan' ? 'text-sky-400' : 'text-slate-500'}`}>
            Scanner
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 items-center" onPress={() => setActiveTab('history')}>
          <Ionicons
            name={activeTab === 'history' ? "time" : "time-outline"}
            size={22}
            color={activeTab === 'history' ? "#38bdf8" : "#64748b"}
          />
          <Text className={`text-[11px] mt-1 font-bold ${activeTab === 'history' ? 'text-sky-400' : 'text-slate-500'}`}>
            History
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 items-center" onPress={() => setActiveTab('report')}>
          <Ionicons
            name={activeTab === 'report' ? "flag" : "flag-outline"}
            size={22}
            color={activeTab === 'report' ? "#fb7185" : "#64748b"}
          />
          <Text className={`text-[11px] mt-1 font-bold ${activeTab === 'report' ? 'text-rose-400' : 'text-slate-500'}`}>
            Report
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}