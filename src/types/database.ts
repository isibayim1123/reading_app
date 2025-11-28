// Database types based on Supabase schema

export type UserType = 'student' | 'teacher';

export type DifficultyLevel =
  | 'elementary'
  | 'junior_high'
  | 'high_school'
  | 'advanced';

export type Grade = 'A' | 'B' | 'C' | 'D';

export type BadgeType = 'streak' | 'achievement' | 'skill' | 'milestone';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  user_type: UserType;
  grade: string | null;
  class_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  name: string;
  description: string | null;
  teacher_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: string;
  title: string;
  text: string;
  translation: string | null;
  difficulty_level: DifficultyLevel;
  category: string;
  tags: string[];
  audio_url: string | null;
  word_count: number | null;
  estimated_duration: number | null;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WordAccuracy {
  words: Array<{
    word: string;
    score: number;
    correct: boolean;
    error_type?: string;
  }>;
}

export interface Feedback {
  positive: string[];
  improvements: Array<{
    word: string;
    suggestion: string;
    ipa?: string;
  }>;
  overall: string;
}

export interface PracticeRecord {
  id: string;
  user_id: string;
  content_id: string;
  audio_recording_url: string | null;
  duration: number | null;
  transcription: string | null;
  word_accuracy: WordAccuracy | null;
  accuracy_score: number | null;
  grade: Grade | null;
  feedback: Feedback | null;
  attempt_number: number;
  practice_mode: string;
  created_at: string;
}

export interface DifficultWord {
  id: string;
  user_id: string;
  word: string;
  ipa: string | null;
  error_count: number;
  last_practiced_at: string | null;
  first_seen_in_content_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  badge_type: BadgeType;
  condition: Record<string, unknown>;
  display_order: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface Milestone {
  id: string;
  user_id: string;
  level: number;
  experience_points: number;
  total_practice_count: number;
  total_study_time: number;
  total_words_practiced: number;
  current_streak: number;
  longest_streak: number;
  last_practice_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  content_id: string;
  created_at: string;
}
