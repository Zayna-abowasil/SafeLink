import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config/api';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
}

export default function LoginScreen({ onLoginSuccess, onNavigateToRegister }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password.');
      }

      await AsyncStorage.setItem('userToken', data.token);
      if (data.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      }

      Alert.alert('Success', 'Welcome back!');
      onLoginSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Unable to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-950"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View className="items-center mb-8">
          <View className="bg-sky-500/10 p-4 rounded-3xl border border-sky-500/20 mb-3">
            <Ionicons name="shield-checkmark" size={44} color="#38bdf8" />
          </View>
          <Text className="text-3xl font-black text-sky-400 tracking-wider">SafeLink</Text>
          <Text className="text-xs text-slate-400 mt-1.5">Threat Intelligence & Link Security</Text>
        </View>

        <View className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <Text className="text-xl font-bold text-slate-50 mb-1">Welcome Back</Text>
          <Text className="text-xs text-slate-400 mb-6">Sign in to your account</Text>

          <View className="mb-4">
            <Text className="text-xs font-semibold text-slate-300 mb-2">Email Address</Text>
            <View className="flex-row items-center bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3">
              <Ionicons name="mail-outline" size={18} color="#64748b" className="mr-2" />
              <TextInput
                className="flex-1 text-slate-50 text-sm ml-2"
                placeholder="operator@safelink.io"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-xs font-semibold text-slate-300 mb-2">Password</Text>
            <View className="flex-row items-center bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3">
              <Ionicons name="lock-closed-outline" size={18} color="#64748b" className="mr-2" />
              <TextInput
                className="flex-1 text-slate-50 text-sm ml-2"
                placeholder="••••••••••••"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className="bg-sky-600 rounded-xl py-3.5 flex-row items-center justify-center space-x-2"
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text className="text-white font-bold text-base mr-2">Sign In</Text>
                <Ionicons name="log-in-outline" size={20} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-slate-400 text-sm">Don't have an account? </Text>
            <TouchableOpacity onPress={onNavigateToRegister}>
              <Text className="text-sky-400 font-bold text-sm">Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}