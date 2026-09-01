//רכיב השורש הראשי של אפליקציית המובייל.
//  הוא מנהל את זרימת הניווט הכללית ומצב האימות. במידה והמשתמש אינו מחובר מוצגים מסכי האימות 
// (Login/Register), וכאשר הוא מחובר מוצגת המערכת הראשית עם סרגל ניווט תחתון (Bottom Tabs) למעבר בין סריקה,
//  היסטוריה ודיווח.

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

// פונקציה React שמייצגת את רכיב השורש הראשי של האפליקציה
export default function App() {
  // הגדרת מצבים (States) לניהול מצב האימות, מסך האימות הפעיל והטאב הפעיל במערכת הראשית
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // מצב שמציין איזה מסך אימות פעיל: התחברות או הרשמה
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  // מצב שמציין איזה טאב פעיל במערכת הראשית: סריקה, היסטוריה או דיווח
  const [activeTab, setActiveTab] = useState<'scan' | 'history' | 'report'>('scan');

  // פונקציה אסינכרונית שמטפלת בתהליך ההתנתקות מהחשבון
  const handleLogout = async () => {
    // הסרת הטוקן ופרטי המשתמש המאומתים מה-AsyncStorage כדי לאפס את מצב האימות
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    // עדכון מצב האימות כדי להציג את מסכי האימות מחדש
    setIsAuthenticated(false);
    // החזרת המשתמש למסך ההתחברות לאחר ההתנתקות
    setAuthScreen('login');
  };

  // אם המשתמש אינו מחובר, מציג את מסכי האימות (Login/Register) בהתאם למצב הנוכחי
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#020617' }} className="flex-1 bg-slate-950">
        <StatusBar barStyle="light-content" backgroundColor="#020617" />
        {/* הצגת מסך ההתחברות או מסך ההרשמה בהתאם למצב הנוכחי של האימות */}
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
            /* כאשר המשתמש לוחץ על כפתור ההיסטוריה במסך הסריקה, מעדכן את הטאב הפעיל ל'היסטוריה' */
            onNavigateToHistory={() => setActiveTab('history')}
            onLogout={handleLogout}
          />
        )}
        
        {activeTab === 'history' && <HistoryScreen />}
        {/* כאשר המשתמש לוחץ על כפתור הדיווח במסך ההיסטוריה, מעדכן את הטאב הפעיל ל'דיווח' */}
        {activeTab === 'report' && <ReportScreen />}
      </View>

      {/* Bottom Navigation with Vector Icons */}
      <View className="flex-row justify-between bg-slate-900 border-t border-slate-800 py-2.5 px-5">
        {/* כפתור ניווט לטאב הסריקה. כאשר המשתמש לוחץ עליו, מעדכן את הטאב הפעיל ל'סורק' */}
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
         
        {/* כפתור ניווט לטאב ההיסטוריה. כאשר המשתמש לוחץ עליו, מעדכן את הטאב הפעיל ל'היסטוריה' */}
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
          
        {/* כפתור ניווט לטאב הדיווח. כאשר המשתמש לוחץ עליו, מעדכן את הטאב הפעיל ל'דיווח' */}
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