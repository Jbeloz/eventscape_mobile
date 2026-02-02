import { create } from 'zustand'
import { supabase } from '../services/supabase'

interface User {
  id: string
  email: string
  name?: string
  role?: string
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  getCurrentUser: () => Promise<void>
  verifyOtp: (email: string, token: string) => Promise<boolean>
  verifyEmail: (email: string, token: string) => Promise<boolean>
  resendVerificationEmail: (email: string) => Promise<void>
  sendPasswordResetEmail: (email: string) => Promise<void>
  resetPassword: (newPassword: string) => Promise<void>
  resendPasswordResetEmail: (email: string) => Promise<void>
}

// Simple hash function compatible with React Native
const hashToken = (token: string): string => {
  let hash = 0
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(64, '0')
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  signUp: async (email: string, password: string, name: string) => {
    set({ loading: true, error: null })
    try {
      // Register user with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      if (!data.user?.id) {
        throw new Error('Failed to create auth user')
      }

      // Split name into first_name and last_name
      const nameParts = name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      // Create user record in custom users table
      const { data: userData, error: dbError } = await supabase
        .from('users')
        .insert({
          auth_id: Math.abs(data.user.id.split('-').reduce((acc, part) => acc + parseInt(part, 16), 0)), // Convert UUID to integer hash
          email: data.user.email?.toLowerCase() || '',
          password_hash: 'managed_by_supabase_auth', // Placeholder - actual password managed by Supabase Auth
          first_name: firstName,
          last_name: lastName,
          user_role: 'customer',
        })
        .select()

      if (dbError) {
        console.error('❌ User insert error:', dbError)
        throw new Error(dbError.message || 'Failed to create user record')
      }

      const user_id = userData?.[0]?.user_id
      
      if (!user_id) {
        throw new Error('User record created but no user_id returned')
      }

      console.log('✅ User created with ID:', user_id)

      // Create customer record linked to the new user
      try {
        const { error: customerError } = await supabase
          .from('customers')
          .insert({
            user_id: user_id,
            preferences: null,
          })
        
        if (customerError) {
          console.error('❌ Customer record insert error:', customerError)
        } else {
          console.log('✅ Customer record created')
        }
      } catch (err: any) {
        console.error('❌ Customer record exception:', err)
      }

      // Generate OTP code (6 digits)
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      const otpHash = hashToken(otpCode)
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      
      // Record OTP in database
      try {
        const { error: otpInsertError } = await supabase
          .from('otp')
          .insert({
            user_id: user_id,
            otp_code_hash: otpHash,
            otp_expiry: expiryTime.toISOString(),
            otp_attempts: 0,
            last_otp_sent: new Date().toISOString(),
          })
        
        if (otpInsertError) {
          console.error('❌ OTP insert error:', otpInsertError)
        } else {
          console.log('✅ OTP record created')
        }
      } catch (err: any) {
        console.error('❌ OTP record exception:', err)
      }

      // Create email verification record
      try {
        const emailTokenHash = hashToken(`${data.user.email}-${Date.now()}-${Math.random()}`)
        const { error: emailVerifError } = await supabase
          .from('email_verification')
          .insert({
            user_id: user_id,
            email_token_hash: emailTokenHash,
            expires_at: expiryTime.toISOString(),
            is_verified: false,
            last_token_sent: new Date().toISOString(),
          })
        
        if (emailVerifError) {
          console.error('❌ Email verification insert error:', emailVerifError)
        } else {
          console.log('✅ Email verification record created')
        }
      } catch (err: any) {
        console.error('❌ Email verification exception:', err)
      }

      // Log OTP code for development
      console.log('📧 OTP Code:', otpCode)
      console.log('✅ Account created! Verification email should be sent automatically by Supabase')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      if (data.user) {
        // Fetch user details from custom users table by email (not auth_id)
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email.toLowerCase())
          .single()

        if (dbError && dbError.code !== 'PGRST116') {
          // Only throw if it's not a "no rows found" error
          throw dbError
        }

        // Prevent administrator accounts from signing in
        if (userData?.user_role === 'administrator') {
          throw new Error('Not authorized to sign in here')
        }

        // Check if email is verified
        if (userData?.user_id) {
          const { data: verificationData, error: verifyError } = await supabase
            .from('email_verification')
            .select('is_verified')
            .eq('user_id', userData.user_id)
            .single()

          if (verifyError && verifyError.code !== 'PGRST116') {
            console.warn('⚠️ Email verification check error:', verifyError)
          }

          if (!verificationData?.is_verified) {
            throw new Error('Please verify your email before signing in. Check your inbox for the verification code.')
          }
        }

        // Verify session is valid before setting user state
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData?.session) {
          throw new Error('Session could not be established. Please try again.')
        }

        console.log('🔍 Login - Found user:', userData?.email, 'Role:', userData?.user_role)
        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            name: userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : undefined,
            role: userData?.user_role,
          },
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      set({ user: null })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  verifyOtp: async (email: string, token: string) => {
    set({ loading: true, error: null })
    try {
      // Verify with Supabase Auth OTP
      const { data, error: otpError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      })

      if (otpError) {
        throw otpError
      }

      if (data.user) {
        // Update OTP record in database as verified/used
        const { data: userData } = await supabase
          .from('users')
          .select('user_id')
          .eq('email', email.toLowerCase())
          .single()

        if (userData?.user_id) {
          // Mark the latest OTP as used
          try {
            await supabase
              .from('otp')
              .update({
                otp_used_at: new Date().toISOString(),
                otp_attempts: 0,
              })
              .eq('user_id', userData.user_id)
              .order('created_at', { ascending: false })
              .limit(1)
          } catch (err: any) {
            console.warn('OTP update warning:', err.message)
          }
        }

        // Set user state
        const { data: fullUserData } = await supabase
          .from('users')
          .select('*')
          .eq('email', email.toLowerCase())
          .single()

        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            name: fullUserData ? `${fullUserData.first_name || ''} ${fullUserData.last_name || ''}`.trim() : undefined,
            role: fullUserData?.user_role,
          },
        })

        return true
      }

      return false
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OTP verification failed'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  verifyEmail: async (email: string, token: string) => {
    set({ loading: true, error: null })
    try {
      // Verify with Supabase Auth
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      })

      if (verifyError) {
        throw verifyError
      }

      if (data.user) {
        // Update email verification record in database
        const { data: userData } = await supabase
          .from('users')
          .select('user_id')
          .eq('email', email.toLowerCase())
          .single()

        if (userData?.user_id) {
          try {
            await supabase
              .from('email_verification')
              .update({
                is_verified: true,
                verified_at: new Date().toISOString(),
              })
              .eq('user_id', userData.user_id)
              .order('created_at', { ascending: false })
              .limit(1)
          } catch (err: any) {
            console.warn('Email verification update warning:', err.message)
          }
        }

        // Set user state
        const { data: fullUserData } = await supabase
          .from('users')
          .select('*')
          .eq('email', email.toLowerCase())
          .single()

        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            name: fullUserData ? `${fullUserData.first_name || ''} ${fullUserData.last_name || ''}`.trim() : undefined,
            role: fullUserData?.user_role,
          },
        })

        return true
      }

      return false
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email verification failed'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  getCurrentUser: async () => {
    set({ loading: true, error: null })
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        // Handle refresh token errors gracefully
        if (authError.message?.includes('Invalid Refresh Token') || 
            authError.message?.includes('Refresh Token Not Found')) {
          console.warn('⚠️ Refresh token invalid or expired, clearing session')
          await supabase.auth.signOut()
          set({ user: null, error: null })
          return
        }
        throw authError
      }

      if (authUser) {
        // Fetch user details from custom users table by email (not auth_id)
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('email', authUser.email?.toLowerCase() || '')
          .single()

        if (dbError && dbError.code !== 'PGRST116') {
          // PGRST116 means no rows found, which is acceptable
          throw dbError
        }

        set({
          user: {
            id: authUser.id,
            email: authUser.email || '',
            name: userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : undefined,
            role: userData?.user_role,
          },
        })
      } else {
        set({ user: null })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get current user'
      set({ error: errorMessage })
    } finally {
      set({ loading: false })
    }
  },

  resendVerificationEmail: async (email: string) => {
    set({ loading: true, error: null })
    try {
      // Get user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', email)
        .single()

      if (userError || !userData) {
        throw new Error('User not found')
      }

      // Generate new OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      const otpHash = hashToken(otpCode)
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Update OTP record in database
      try {
        const { error: otpUpdateError } = await supabase
          .from('otp')
          .update({
            otp_code_hash: otpHash,
            otp_expiry: expiryTime.toISOString(),
            otp_attempts: 0,
            last_otp_sent: new Date().toISOString(),
          })
          .eq('user_id', userData.user_id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (otpUpdateError) {
          console.warn('OTP update error:', otpUpdateError.message)
        } else {
          console.log('✅ OTP record updated')
        }
      } catch (err: any) {
        console.warn('OTP update warning:', err.message)
      }

      // Update email verification last_token_sent
      try {
        await supabase
          .from('email_verification')
          .update({
            last_token_sent: new Date().toISOString(),
          })
          .eq('user_id', userData.user_id)
          .order('created_at', { ascending: false })
          .limit(1)
      } catch (err: any) {
        console.warn('Email verification update warning:', err.message)
      }

      // Log the new OTP code
      // Note: In production, send this via your email service
      console.log('📧 New OTP Code:', otpCode)

      // Resend verification email via Supabase
      console.log('📤 Resending verification email to:', email)
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (resendError) {
        console.error('❌ Resend email error:', resendError)
        console.error('Error code:', resendError.code)
        // Handle rate limit gracefully
        if (resendError.code === 'over_email_send_rate_limit') {
          console.warn('⚠️ Too many requests. Please wait 55 seconds before resending.')
          throw new Error('Please wait a minute before requesting a new verification email')
        }
        throw resendError
      } else {
        console.log('✅ Verification email resent successfully to', email)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification email'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  sendPasswordResetEmail: async (email: string) => {
    set({ loading: true, error: null })
    try {
      // Get user from custom users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', email)
        .single()

      if (userError || !userData) {
        throw new Error('User not found with this email address')
      }

      // Send password reset email via Supabase Auth
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email)

      if (resetError) {
        throw resetError
      }

      // Generate token hash for tracking (using email as token source)
      const tokenHash = hashToken(email + Date.now())
      const expiryTime = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

      // Record password reset request in database
      try {
        const { data: resetData, error: resetInsertError } = await supabase
          .from('password_reset')
          .insert({
            user_id: userData.user_id,
            reset_token_hash: tokenHash,
            expires_at: expiryTime.toISOString(),
            last_token_sent: new Date().toISOString(),
          })
          .select()

        if (resetInsertError) {
          console.error('❌ Password reset record insert error:', resetInsertError)
          console.error('Reset error code:', resetInsertError.code)
          console.error('Reset error details:', resetInsertError.details)
        } else {
          console.log('✅ Password reset record created:', resetData)
        }
      } catch (dbError) {
        console.error('❌ Database error creating password reset record:', dbError)
      }

      console.log('✅ Password reset email sent successfully to', email)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send password reset email'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  resetPassword: async (newPassword: string) => {
    set({ loading: true, error: null })
    try {
      // Get current user from Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.getUser()

      if (authError || !authData.user) {
        throw new Error('Not authenticated')
      }

      // Update password in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        throw updateError
      }

      // Get user from custom table to mark password reset as used
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', authData.user.email?.toLowerCase() || '')
        .single()

      if (userData) {
        // Mark the password reset record as used
        try {
          const { error: updateResetError } = await supabase
            .from('password_reset')
            .update({
              used_at: new Date().toISOString(),
            })
            .eq('user_id', userData.user_id)
            .is('used_at', null)

          if (updateResetError) {
            console.error('❌ Error marking password reset as used:', updateResetError)
          } else {
            console.log('✅ Password reset marked as used')
          }
        } catch (dbError) {
          console.error('❌ Database error updating password reset record:', dbError)
        }
      }

      console.log('✅ Password reset successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  resendPasswordResetEmail: async (email: string) => {
    set({ loading: true, error: null })
    try {
      // Get user from custom users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', email)
        .single()

      if (userError || !userData) {
        throw new Error('User not found with this email address')
      }

      // Resend password reset email via Supabase Auth
      const { error: resendError } = await supabase.auth.resetPasswordForEmail(email)

      if (resendError) {
        // Handle rate limit error gracefully
        if (resendError.status === 429 || resendError.message?.includes('over_email_send_rate_limit')) {
          throw new Error('Please wait a minute before requesting a new password reset email')
        }
        throw resendError
      }

      // Update password reset record with new timestamp and token hash
      const newTokenHash = hashToken(email + Date.now())
      const expiryTime = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

      try {
        const { error: updateResetError } = await supabase
          .from('password_reset')
          .update({
            reset_token_hash: newTokenHash,
            expires_at: expiryTime.toISOString(),
            last_token_sent: new Date().toISOString(),
          })
          .eq('user_id', userData.user_id)
          .is('used_at', null)

        if (updateResetError) {
          console.error('❌ Error updating password reset record:', updateResetError)
        } else {
          console.log('✅ Password reset record updated')
        }
      } catch (dbError) {
        console.error('❌ Database error updating password reset record:', dbError)
      }

      console.log('✅ Password reset email resent successfully to', email)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend password reset email'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },
}))
