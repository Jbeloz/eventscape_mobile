import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { AppState, Platform } from 'react-native'
import 'react-native-url-polyfill/auto'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

// Use localStorage for web, AsyncStorage for native
const storage = Platform.OS === 'web' 
  ? {
      getItem: (key: string) => Promise.resolve(typeof window !== 'undefined' ? localStorage.getItem(key) : null),
      setItem: (key: string, value: string) => { if (typeof window !== 'undefined') localStorage.setItem(key, value); return Promise.resolve() },
      removeItem: (key: string) => { if (typeof window !== 'undefined') localStorage.removeItem(key); return Promise.resolve() },
    }
  : AsyncStorage

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Recover session from storage on app startup
export async function recoverSession() {
  try {
    const session = await supabase.auth.getSession()
    if (session?.data?.session) {
      console.log('✅ Session recovered from storage')
      return session.data.session
    } else {
      console.log('⚠️ No session found in storage')
      return null
    }
  } catch (error) {
    console.error('❌ Error recovering session:', error)
    return null
  }
}

// Handle auth errors globally
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_OUT') {
    // Clear storage when user signs out
    await AsyncStorage.removeItem('supabase.auth')
  } else if (event === 'TOKEN_REFRESHED' && session) {
    // Session refreshed successfully
    console.log('✅ Session token refreshed')
  } else if (event === 'SIGNED_IN') {
    console.log('✅ User signed in')
  }
})

// Handle app lifecycle for token refresh
if (Platform.OS !== 'web') {
  const subscription = AppState.addEventListener('change', async (state) => {
    if (state === 'active') {
      console.log('📱 App moved to foreground - starting auto refresh')
      supabase.auth.startAutoRefresh()
    } else {
      console.log('📱 App moved to background - stopping auto refresh')
      supabase.auth.stopAutoRefresh()
    }
  })
}
