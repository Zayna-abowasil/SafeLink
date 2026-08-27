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
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config/api';

interface RegisterScreenProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

export default function RegisterScreen({ onRegisterSuccess, onNavigateToLogin }: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      Alert.alert('Success', 'Account created successfully! Please sign in.');
      onRegisterSuccess();
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Unable to connect to the server.');
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
            <Ionicons name="person-add" size={40} color="#38bdf8" />
          </View>
          <Text className="text-3xl font-black text-sky-400 tracking-wider">SafeLink</Text>
          <Text className="text-xs text-slate-400 mt-1.5">Create New Security Account</Text>
        </View>

        <View className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <Text className="text-xl font-bold text-slate-50 mb-1">Get Started</Text>
          <Text className="text-xs text-slate-400 mb-6">Enter your details to create an account</Text>

          <View className="mb-4">
            <Text className="text-xs font-semibold text-slate-300 mb-2">Full Name</Text>
            <View className="flex-row items-center bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3">
              <Ionicons name="person-outline" size={18} color="#64748b" />
              <TextInput
                className="flex-1 text-slate-50 text-sm ml-2"
                placeholder="John Doe"
                placeholderTextColor="#64748b"
                value={name}
                onChangeText={setName}
                autoCorrect={false}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-xs font-semibold text-slate-300 mb-2">Email Address</Text>
            <View className="flex-row items-center bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3">
              <Ionicons name="mail-outline" size={18} color="#64748b" />
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
              <Ionicons name="lock-closed-outline" size={18} color="#64748b" />
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
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text className="text-white font-bold text-base mr-2">Create Account</Text>
                <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-slate-400 text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text className="text-sky-400 font-bold text-sm">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}