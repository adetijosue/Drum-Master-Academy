export interface AppUser {
  id: string;
  email: string;
  name: string;
  photo?: string;
  level: string;
  instrument: string;
  interests: string[];
  bio?: string;
  equipment?: string;
  weeklyGoal: number;
  enrolledCourses: string[];
  completedLessons: Record<string, string[]>;
  setupCompleted: boolean;
  setupPostponed: boolean;
  createdAt?: string;
}

export interface AuthState {
  user: AppUser | null;
  loading: boolean;
  supabaseConnected: boolean;
}
