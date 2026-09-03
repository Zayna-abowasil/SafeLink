//מסך התחברות המשתמש. מאפשר הזנת מייל וסיסמה, הצגה/הסתרה של הסיסמה, ופנייה ל-
// API. בהתחברות מוצלחת
// , האסימון ופרטי המשתמש נשמרים ב-AsyncStorage והמשתמש מועבר למסך הראשי

// מסך זה מקבל פונקציות props שמאפשרות ניווט למסך הרשמה או למסך הראשי לאחר התחברות מוצלחת.
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

//מקבל ב-Props את הפונקציות
interface LoginScreenProps {
  // פונקציה שמופעלת כאשר ההתחברות מצליחה, ומאפשרת ניווט למסך הראשי
  onLoginSuccess: () => void;
  // פונקציה שמופעלת כאשר המשתמש רוצה לעבור למסך ההרשמה
  onNavigateToRegister: () => void;
}

// פונקציה React שמייצגת את מסך ההתחברות
export default function LoginScreen({ onLoginSuccess, onNavigateToRegister }: LoginScreenProps) {
  // הגדרת מצב לניהול שדה המייל
  const [email, setEmail] = useState('');
  // הגדרת מצב לניהול שדה הסיסמה
  const [password, setPassword] = useState('');
  // מצב שמציין אם הסיסמה מוצגת או מוסתרת
  const [showPassword, setShowPassword] = useState(false);
  // מצב שמציין אם הבקשה לשרת נמצאת בתהליך טעינה
  const [isLoading, setIsLoading] = useState(false);

  // פונקציה אסינכרונית שמטפלת בתהליך ההתחברות
  const handleLogin = async () => {
    // בדיקה אם שדות המייל והסיסמה ריקים, ואם כן מציג הודעת שגיאה למשתמש ומפסיק את התהליך
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter your email and password.');
      return;
    }
    // עדכון מצב הטעינה כדי להציג אינדיקטור טעינה למשתמש בזמן שהבקשה לשרת מתבצעת
    setIsLoading(true);
    try {
      // ביצוע בקשת Fetch לשרת ה-Backend עם פרטי ההתחברות שהוזנו על ידי המשתמש
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      // המרת התשובה ל-JSON ובדיקת הצלחת הבקשה. אם הבקשה נכשלה, זורק שגיאה עם הודעה מתאימה
      const data = await response.json();
      // אם הבקשה נכשלה, זורק שגיאה עם הודעה מתאימה
      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password.');
      }
      // אם הבקשה הצליחה, שומר את הטוקן ופרטי המשתמש ב-AsyncStorage כדי לשמור את מצב ההתחברות
      await AsyncStorage.setItem('userToken', data.token);
      // אם יש פרטי משתמש, שומר אותם גם ב-AsyncStorage
      if (data.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      }
      // מציג הודעת הצלחה למשתמש ומפעיל את הפונקציה onLoginSuccess כדי לנווט למסך הראשי
      Alert.alert('Success', 'Welcome back!');
      onLoginSuccess();
      // אם הבקשה נכשלה, מציג הודעת שגיאה למשתמש עם ההודעה שהתקבלה מהשרת או הודעה כללית
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Unable to connect to the server.');
      // מדפיס את השגיאה לטרמינל לצורך ניפוי באגים
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /* למניעת הסתרת שדות על ידי המקלדת */
    <KeyboardAvoidingView
      className="flex-1 bg-slate-950"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* מאפשר גלילה של המסך במקרה שהמקלדת מכסה את השדות, ומרכז את התוכן אנכית */}
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View className="items-center mb-8">
          <View className="bg-sky-500/10 p-4 rounded-3xl border border-sky-500/20 mb-3">
            <Ionicons name="shield-checkmark" size={44} color="#38bdf8" />
          </View>
          <Text className="text-3xl font-black text-sky-400 tracking-wider">SafeLink</Text>
          <Text className="text-xs text-slate-400 mt-1.5">Real-Time Threat Scanner</Text>
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
                placeholder="example@email.com"
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
          
          {/* כפתור התחברות שמפעיל את הפונקציה handleLogin בעת לחיצה, ומציג אינדיקטור טעינה בזמן שהבקשה לשרת מתבצעת */}
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