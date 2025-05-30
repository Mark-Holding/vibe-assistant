import { AuthFormData } from '../../components/auth/AuthForm';

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

class AuthService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

  async signIn(email: string, password: string, rememberMe?: boolean): Promise<AuthResponse> {
    try {
      // TODO: Replace with actual API call
      console.log('Signing in user:', { email, rememberMe });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful response
      const user: User = {
        id: '1',
        email,
        name: email.split('@')[0],
      };

      // Store user in localStorage for now (replace with proper session management)
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      };
    }
  }

  async signUp(formData: AuthFormData): Promise<AuthResponse> {
    try {
      // TODO: Replace with actual API call
      console.log('Creating user account:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful response
      const user: User = {
        id: '1',
        email: formData.email,
        name: formData.name || formData.email.split('@')[0],
      };

      // Store user in localStorage for now (replace with proper session management)
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign up failed' 
      };
    }
  }

  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      // TODO: Implement Google OAuth
      console.log('Initiating Google OAuth...');
      
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful response
      const user: User = {
        id: '2',
        email: 'user@gmail.com',
        name: 'Google User',
        avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      };

      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Google authentication failed' 
      };
    }
  }

  async signInWithGitHub(): Promise<AuthResponse> {
    try {
      // TODO: Implement GitHub OAuth
      console.log('Initiating GitHub OAuth...');
      
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful response
      const user: User = {
        id: '3',
        email: 'user@github.com',
        name: 'GitHub User',
        avatar: 'https://github.com/github.png',
      };

      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'GitHub authentication failed' 
      };
    }
  }

  async signOut(): Promise<void> {
    // TODO: Call API to invalidate session
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

export const authService = new AuthService(); 