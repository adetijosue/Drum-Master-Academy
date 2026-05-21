export interface Course {
  id: string;
  title: string;
  category: string;
  level: string;
  badge?: string;
  desc: string;
  img: string;
  link: string;
  primary?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  description?: string;
  pedagogyTip?: string;
  quiz?: Quiz;
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface CourseData {
  id: string;
  title: string;
  subtitle?: string;
  chapters: Chapter[];
}

export interface Quiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface CourseProgress {
  courseId: string;
  completedLessons: string[];
  lastAccessedLesson?: string;
  lastAccessedAt?: string;
}
