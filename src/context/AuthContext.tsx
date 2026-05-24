import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { EmailService } from '../services/email';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  enrolledCourses: string[];
  photo: string | null;
  level: string;
  interests: string[];
  setupCompleted: boolean;
  setupPostponed: boolean;
  courseProgress: Record<string, { completedLessons: string[] }>;
  joinDate: string;
  equipment?: string;
  weeklyGoal?: number;
  bio?: string;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  supabaseConnected: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  enrollCourse: (courseId: string) => Promise<{ success: boolean; message?: string }>;
  updateCourseProgress: (courseId: string, lessonId: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (name?: string, level?: string, interests?: string[], extraFields?: Partial<UserSession>) => Promise<{ success: boolean; message?: string; user?: UserSession }>;
  updateAvatar: (photoBase64: string) => Promise<{ success: boolean; message?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  isEnrolled: (courseId: string) => boolean;
  purgeAllData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DMA_DB_KEY = 'dma_users_db';
const DMA_SESSION_KEY = 'dma_current_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  // Safe JSON parse helper — prevents crashes on corrupted localStorage
  function safeJsonParse<T>(data: string | null, fallback: T): T {
    if (!data) return fallback;
    try {
      return JSON.parse(data) as T;
    } catch {
      console.warn('[DMA Auth] Corrupted localStorage data, using fallback.');
      return fallback;
    }
  }

  // Helper: SHA-256 for local simulation passwords
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  interface LocalUser {
    id: string;
    name: string;
    email: string;
    password: string;
    enrolledCourses: string[];
    photo: string | null;
    level: string;
    interests: string[];
    setupCompleted: boolean;
    setupPostponed: boolean;
    courseProgress: Record<string, { completedLessons: string[] }>;
    joinDate: string;
    equipment?: string;
    weeklyGoal?: number;
    bio?: string;
  }

  const getLocalUsers = (): LocalUser[] => {
    return safeJsonParse<LocalUser[]>(localStorage.getItem(DMA_DB_KEY), []);
  };

  // Shared mapper: Supabase profile → UserSession (eliminates 4x duplication)
  const mapProfileToSession = (profile: Record<string, unknown>): UserSession => ({
    id: profile.id as string,
    name: profile.name as string,
    email: profile.email as string,
    enrolledCourses: (profile.enrolled_courses as string[]) || [],
    photo: (profile.photo_url as string) || null,
    level: (profile.level as string) || 'beginner',
    interests: (profile.interests as string[]) || [],
    setupCompleted: (profile.setup_completed as boolean) || false,
    setupPostponed: (profile.setup_postponed as boolean) || false,
    courseProgress: (profile.course_progress as Record<string, { completedLessons: string[] }>) || {},
    joinDate: (profile.join_date as string) || new Date().toISOString(),
    equipment: profile.equipment as string | undefined,
    weeklyGoal: profile.weekly_goal as number | undefined,
    bio: profile.bio as string | undefined,
  });

  // Sync or fallback helper for Supabase users
  const syncOrFallbackProfile = async (supabaseUser: any): Promise<UserSession> => {
    try {
      // 1. Try to fetch existing profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profile && !error) {
        return mapProfileToSession(profile);
      }

      // 2. Profile not found, let's attempt to insert a default profile
      const fallbackUser: UserSession = {
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Étudiant',
        email: supabaseUser.email || '',
        enrolledCourses: [],
        photo: null,
        level: 'beginner',
        interests: [],
        setupCompleted: false,
        setupPostponed: false,
        courseProgress: {},
        joinDate: supabaseUser.created_at || new Date().toISOString(),
      };

      const newProfile = {
        id: fallbackUser.id,
        name: fallbackUser.name,
        email: fallbackUser.email,
        enrolled_courses: fallbackUser.enrolledCourses,
        photo_url: fallbackUser.photo,
        level: fallbackUser.level,
        interests: fallbackUser.interests,
        setup_completed: fallbackUser.setupCompleted,
        setup_postponed: fallbackUser.setupPostponed,
        course_progress: fallbackUser.courseProgress,
        join_date: fallbackUser.joinDate,
      };

      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (!insertError && inserted) {
        return mapProfileToSession(inserted);
      }

      console.warn("[DMA Auth] Could not sync profile with Supabase DB (RLS or connection issues), using memory profile:", insertError);
      return fallbackUser;
    } catch (e) {
      console.warn("[DMA Auth] Error syncing profile with Supabase, using local fallback:", e);
      return {
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Étudiant',
        email: supabaseUser.email || '',
        enrolledCourses: [],
        photo: null,
        level: 'beginner',
        interests: [],
        setupCompleted: false,
        setupPostponed: false,
        courseProgress: {},
        joinDate: supabaseUser.created_at || new Date().toISOString(),
      };
    }
  };

  // Test Supabase Connection & Initialize session
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Test if Supabase is connected by attempting to get the session
        const { data, error } = await supabase.auth.getSession();
        if (!error) {
          setSupabaseConnected(true);
          if (data.session?.user) {
            const mappedUser = await syncOrFallbackProfile(data.session.user);
            setUser(mappedUser);
            localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(mappedUser));
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn("[DMA Auth] Supabase cloud connection failed, running in simulation mode:", e);
        setSupabaseConnected(false);
      }

      // Local Session Fallback
      const localSession = safeJsonParse<UserSession | null>(localStorage.getItem(DMA_SESSION_KEY), null);
      if (localSession) {
        setUser(localSession);
      }
      setLoading(false);
    };

    initAuth();

    // Listen to Supabase auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setSupabaseConnected(true);
        const mappedUser = await syncOrFallbackProfile(session.user);
        setUser(mappedUser);
        localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(mappedUser));
      } else if (event === 'SIGNED_OUT') {
        // Only clear if the active user session was NOT a local simulated user
        const activeSession = safeJsonParse<UserSession | null>(localStorage.getItem(DMA_SESSION_KEY), null);
        if (activeSession && !activeSession.id.startsWith('sim-')) {
          setUser(null);
          localStorage.removeItem(DMA_SESSION_KEY);
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Auth Operations
  const login = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (supabaseConnected) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (!error && data.user) {
          const mappedUser = await syncOrFallbackProfile(data.user);
          setUser(mappedUser);
          localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(mappedUser));
          return { success: true };
        }
      } catch (err) {
        console.warn("[DMA Auth] Supabase sign-in error, falling back to local database:", err);
      }
    }

    // Local simulation fallback
    const users = getLocalUsers();
    const hashed = await hashPassword(password);
    const matched = users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === hashed);

    if (matched) {
      const sessionUser: UserSession = {
        id: matched.id || 'sim-' + Math.random().toString(36).substr(2, 9),
        name: matched.name,
        email: matched.email,
        enrolledCourses: matched.enrolledCourses || [],
        photo: matched.photo || null,
        level: matched.level || 'beginner',
        interests: matched.interests || [],
        setupCompleted: matched.setupCompleted || false,
        setupPostponed: matched.setupPostponed || false,
        courseProgress: matched.courseProgress || {},
        joinDate: matched.joinDate || new Date().toISOString(),
        equipment: matched.equipment,
        weeklyGoal: matched.weeklyGoal,
        bio: matched.bio
      };
      setUser(sessionUser);
      localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(sessionUser));
      return { success: true };
    }

    return { success: false, message: "Email ou mot de passe incorrect." };
  };

  const register = async (name: string, email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    // Generate simulated user id or local register
    const users = getLocalUsers();
    if (users.find(u => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, message: "Cet email est déjà utilisé." };
    }

    if (password.length < 6) {
      return { success: false, message: "Le mot de passe doit contenir au moins 6 caractères." };
    }

    // Register on local DB first as fallback
    const hashed = await hashPassword(password);
    const newUser: LocalUser = {
      id: 'sim-' + crypto.randomUUID().slice(0, 9),
      name,
      email: normalizedEmail,
      password: hashed,
      enrolledCourses: [],
      photo: null,
      level: 'beginner',
      interests: [],
      setupCompleted: false,
      setupPostponed: false,
      courseProgress: {},
      joinDate: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(DMA_DB_KEY, JSON.stringify(users));

    if (supabaseConnected) {
      try {
        const redirectUrl = window.location.origin + '/login';
        await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { name }
          }
        });
      } catch (err) {
        console.warn("[DMA Auth] Supabase signUp failed, continuing offline registration:", err);
      }
    }

    // Auto-login locally — session does NOT include password hash
    const sessionUser: UserSession = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      enrolledCourses: [],
      photo: null,
      level: 'beginner',
      interests: [],
      setupCompleted: false,
      setupPostponed: false,
      courseProgress: {},
      joinDate: newUser.joinDate
    };
    setUser(sessionUser);
    localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(sessionUser));

    // Dispatch Transactional Welcome Email
    try {
      await EmailService.sendWelcomeEmail(newUser.name, newUser.email, newUser.id);
    } catch (e) {
      console.warn("[DMA Auth] Failed to dispatch welcome email:", e);
    }

    return { success: true };
  };

  const logout = async () => {
    if (supabaseConnected && user && !user.id.startsWith('sim-')) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    setUser(null);
    localStorage.removeItem(DMA_SESSION_KEY);
  };

  const enrollCourse = async (courseId: string) => {
    if (!user) return { success: false, message: "Vous devez être connecté." };

    if (!user.enrolledCourses.includes(courseId)) {
      const updatedCourses = [...user.enrolledCourses, courseId];
      const updatedUser = { ...user, enrolledCourses: updatedCourses };
      setUser(updatedUser);
      localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(updatedUser));

      if (supabaseConnected && !user.id.startsWith('sim-')) {
        const { error } = await supabase
          .from('profiles')
          .update({ enrolled_courses: updatedCourses })
          .eq('id', user.id);
        if (error) console.error('[DMA Auth] Supabase enrollment sync error:', error);
      }

      // Local db sync
      const users = getLocalUsers();
      const idx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
      if (idx !== -1) {
        users[idx].enrolledCourses = updatedCourses;
        localStorage.setItem(DMA_DB_KEY, JSON.stringify(users));
      }
    }
    return { success: true };
  };

  const updateCourseProgress = async (courseId: string, lessonId: string) => {
    if (!user) return;
    const progress = { ...user.courseProgress };
    if (!progress[courseId]) progress[courseId] = { completedLessons: [] };
    
    if (!progress[courseId].completedLessons.includes(lessonId)) {
      progress[courseId].completedLessons.push(lessonId);
      const updatedUser = { ...user, courseProgress: progress };
      setUser(updatedUser);
      localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(updatedUser));

      if (supabaseConnected && !user.id.startsWith('sim-')) {
        const { error } = await supabase
          .from('profiles')
          .update({ course_progress: progress })
          .eq('id', user.id);
        if (error) console.error('[DMA Auth] Supabase progress sync error:', error);
      }

      // Local db sync
      const users = getLocalUsers();
      const idx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
      if (idx !== -1) {
        users[idx].courseProgress = progress;
        localStorage.setItem(DMA_DB_KEY, JSON.stringify(users));
      }
    }
  };

  const deleteAccount = async (password: string) => {
    if (!user) return { success: false, message: "Utilisateur non connecté." };

    if (supabaseConnected && !user.id.startsWith('sim-')) {
      const { error } = await supabase.rpc('delete_user');
      if (error) return { success: false, message: error.message };
      await logout();
      return { success: true };
    }

    // Local simulation delete
    const users = getLocalUsers();
    const hashed = await hashPassword(password);
    const localUser = users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
    
    if (localUser && localUser.password !== hashed) {
      return { success: false, message: "Mot de passe incorrect." };
    }

    const filtered = users.filter(u => u.email.toLowerCase() !== user.email.toLowerCase());
    localStorage.setItem(DMA_DB_KEY, JSON.stringify(filtered));
    await logout();
    return { success: true };
  };

  const updateProfile = async (name?: string, level?: string, interests?: string[], extraFields?: Partial<UserSession>) => {
    if (!user) return { success: false, message: "Utilisateur non connecté." };

    const updatedUser = {
      ...user,
      name: name !== undefined ? name : user.name,
      level: level !== undefined ? level : user.level,
      interests: interests !== undefined ? interests : user.interests,
      ...extraFields
    };

    setUser(updatedUser);
    localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(updatedUser));

    if (supabaseConnected && !user.id.startsWith('sim-')) {
      const updates = {
        name: updatedUser.name,
        level: updatedUser.level,
        interests: updatedUser.interests,
        setup_completed: updatedUser.setupCompleted,
        setup_postponed: updatedUser.setupPostponed,
        equipment: updatedUser.equipment || 'acoustic',
        weekly_goal: updatedUser.weeklyGoal || 120,
        bio: updatedUser.bio || null
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) return { success: false, message: error.message };
    }

    // Sync local database
    const users = getLocalUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (idx !== -1) {
      users[idx] = {
        ...users[idx],
        ...updatedUser
      };
      localStorage.setItem(DMA_DB_KEY, JSON.stringify(users));
    }

    return { success: true, user: updatedUser };
  };

  const updateAvatar = async (photoBase64: string) => {
    if (!user) return { success: false, message: "Utilisateur non connecté." };

    const updatedUser = { ...user, photo: photoBase64 };
    setUser(updatedUser);
    localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(updatedUser));

    if (supabaseConnected && !user.id.startsWith('sim-')) {
      const { error } = await supabase
        .from('profiles')
        .update({ photo_url: photoBase64 })
        .eq('id', user.id);
      if (error) console.error('[DMA Auth] Supabase avatar sync error:', error);
    }

    // Sync local DB
    const users = getLocalUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (idx !== -1) {
      users[idx].photo = photoBase64;
      localStorage.setItem(DMA_DB_KEY, JSON.stringify(users));
    }
    return { success: true };
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (supabaseConnected && user && !user.id.startsWith('sim-')) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, message: error.message };
      return { success: true };
    }

    // Local simulation
    const users = getLocalUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === user?.email.toLowerCase());
    if (idx !== -1) {
      const hashedCurrent = await hashPassword(currentPassword);
      if (users[idx].password !== hashedCurrent) {
        return { success: false, message: "Le mot de passe actuel est incorrect." };
      }

      const hashedNew = await hashPassword(newPassword);
      users[idx].password = hashedNew;
      localStorage.setItem(DMA_DB_KEY, JSON.stringify(users));
      
      // Session does NOT include password hash for security
      return { success: true };
    }
    return { success: false, message: "Utilisateur non trouvé." };
  };

  const resetPassword = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (supabaseConnected) {
      const redirectUrl = window.location.origin + '/reset-password';
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: redirectUrl
      });
      if (error) return { success: false, message: error.message };
      return { success: true, message: "Un lien de réinitialisation a été envoyé à votre e-mail." };
    }

    // Local simulation fallback
    const users = getLocalUsers();
    const exists = users.some(u => u.email.toLowerCase() === normalizedEmail);
    if (!exists) return { success: false, message: "Aucun compte associé à cet e-mail." };
    
    return { success: true, message: "Simulation locale : Lien de réinitialisation envoyé avec succès." };
  };

  const isEnrolled = (courseId: string) => {
    return user ? user.enrolledCourses.includes(courseId) : false;
  };

  const purgeAllData = () => {
    localStorage.removeItem(DMA_DB_KEY);
    localStorage.removeItem(DMA_SESSION_KEY);
    localStorage.removeItem('dma_supabase_url');
    localStorage.removeItem('dma_supabase_key');
    localStorage.removeItem('dma_community_posts');
    localStorage.removeItem('dma_comments_db');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      supabaseConnected,
      login,
      register,
      logout,
      enrollCourse,
      updateCourseProgress,
      deleteAccount,
      updateProfile,
      updateAvatar,
      changePassword,
      resetPassword,
      isEnrolled,
      purgeAllData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
