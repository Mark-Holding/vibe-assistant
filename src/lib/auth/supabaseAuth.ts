import { supabase } from '../supabase'
import type { AuthError, User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

class SupabaseAuthService {
  
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        const user = this.mapSupabaseUser(data.user)
        return { success: true, user }
      }

      return { success: false, error: 'Authentication failed' }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      }
    }
  }

  async signUp(email: string, password: string, name?: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0]
          }
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        const user = this.mapSupabaseUser(data.user)
        return { success: true, user }
      }

      return { success: false, error: 'Account creation failed' }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign up failed' 
      }
    }
  }

  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // OAuth redirects, so we return success
      // The actual user data will be available after redirect
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Google authentication failed' 
      }
    }
  }

  async signInWithGitHub(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // OAuth redirects, so we return success
      // The actual user data will be available after redirect
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'GitHub authentication failed' 
      }
    }
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut()
  }

  getCurrentUser(): User | null {
    // This will be handled by the auth state listener in the context
    return null
  }

  isAuthenticated(): boolean {
    // This will be handled by the auth state listener in the context
    return false
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ? this.mapSupabaseUser(session.user) : null
      callback(user)
    })
  }

  // Get current session
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  // Get current user from session
  async getUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user ? this.mapSupabaseUser(user) : null
  }

  private mapSupabaseUser(supabaseUser: SupabaseUser): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.name || 
            supabaseUser.user_metadata?.full_name || 
            supabaseUser.email?.split('@')[0] || 
            'User',
      avatar: supabaseUser.user_metadata?.avatar_url || 
              supabaseUser.user_metadata?.picture
    }
  }
}

export const supabaseAuthService = new SupabaseAuthService() 