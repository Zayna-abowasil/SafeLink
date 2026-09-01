//מסך רישום משתמש חדש. כולל שדות קלט עבור שם מלא, אימייל וסיסמה, מאמת את תקינות ההזנה ושולח בקשת 
// POST לשרת. בסיום מוצלח מנחה את המשתמש להתחבר ומעביר אותו למסך ההתחברות.

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

// ממשק TypeScript שמגדיר את סוגי הפרופס שהמסך מקבל
interface RegisterScreenProps {
  // פונקציה שמופעלת כאשר ההרשמה מצליחה, ומאפשרת ניווט למסך ההתחברות
  onRegisterSuccess: () => void;
  // פונקציה שמופעלת כאשר המשתמש רוצה לעבור למסך ההתחברות
  onNavigateToLogin: () => void;
}

// פונקציה React שמייצגת את מסך הרישום
export default function RegisterScreen({ onRegisterSuccess, onNavigateToLogin }: RegisterScreenProps) {
  // הגדרת מצבים (States) לניהול שדות הקלט, מצב הצגת הסיסמה ומצב טעינה
  const [name, setName] = useState('');
  // הגדרת מצב לניהול שדה האימייל
  const [email, setEmail] = useState('');
  // הגדרת מצב לניהול שדה הסיסמה
  const [password, setPassword] = useState('');
  // מצב שמציין אם הסיסמה מוצגת או מוסתרת
  const [showPassword, setShowPassword] = useState(false);
  // מצב שמציין אם הבקשה לשרת נמצאת בתהליך טעינה
  const [isLoading, setIsLoading] = useState(false);

  // פונקציה אסינכרונית שמטפלת בתהליך הרישום
  const handleRegister = async () => {
    // בדיקה אם אחד משדות הקלט ריק, ואם כן מציג הודעת שגיאה למשתמש ומפסיק את התהליך
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }
    // בדיקה אם הסיסמה קצרה מדי, ואם כן מציג הודעת שגיאה למשתמש ומפסיק את התהליך
    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters long.');
      return;
    }
    // עדכון מצב הטעינה כדי להציג אינדיקטור טעינה למשתמש בזמן שהבקשה לשרת מתבצעת
    setIsLoading(true);
    try {
      // ביצוע בקשת Fetch לשרת ה-Backend עם פרטי הרישום שהוזנו על ידי המשתמש
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
      // המרת התשובה ל-JSON ובדיקת הצלחת הבקשה. אם הבקשה נכשלה, זורק שגיאה עם הודעה מתאימה
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      // אם הבקשה הצליחה, מציג הודעת הצלחה למשתמש ומפעיל את הפונקציה onRegisterSuccess כדי לנווט למסך ההתחברות
      Alert.alert('Success', 'Account created successfully! Please sign in.');
      onRegisterSuccess();
      // אם הבקשה נכשלה, מציג הודעת שגיאה למשתמש עם ההודעה שהתקבלה מהשרת או הודעה כללית
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Unable to connect to the server.');
    } finally {
      // בסיום הבקשה, גם אם נכשלה, מעדכן את מצב הטעינה כדי להפסיק את האנימציה של אינדיקטור הטעינה
      setIsLoading(false);
    }
  };

  return (
    /* למניעת הסתרת שדות על ידי המקלדת */
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
              {/* כפתור שמאפשר למשתמש להציג או להסתיר את הסיסמה שהוזנה בשדה הסיסמה */}
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* כפתור יצירת חשבון שמפעיל את הפונקציה handleRegister בעת לחיצה, ומציג אינדיקטור טעינה בזמן שהבקשה לשרת מתבצעת */}
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