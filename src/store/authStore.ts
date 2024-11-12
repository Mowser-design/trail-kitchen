import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User,
  applyActionCode,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  verifyEmail: (actionCode: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  setUser: (user) => set({ user }),
  signUp: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await sendEmailVerification(userCredential.user);
      set({ user: userCredential.user });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      set({ user: userCredential.user });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await firebaseSignOut(auth);
      set({ user: null });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  verifyEmail: async (actionCode) => {
    set({ loading: true, error: null });
    try {
      await applyActionCode(auth, actionCode);
      if (auth.currentUser) {
        await auth.currentUser.reload();
        set({ user: auth.currentUser });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  sendVerificationEmail: async () => {
    set({ loading: true, error: null });
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  clearError: () => set({ error: null }),
}));