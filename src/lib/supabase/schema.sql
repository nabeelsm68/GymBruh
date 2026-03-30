-- GymBruh Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/qqzovfysiqzabrchxeht/sql)

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  age INTEGER,
  gender TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  goal TEXT,
  activity_level INTEGER DEFAULT 3,
  diet_preference TEXT,
  allergies TEXT[] DEFAULT '{}',
  injuries TEXT,
  medical_conditions TEXT,
  sleep_hours NUMERIC,
  stress_level TEXT,
  water_intake TEXT,
  vibe TEXT DEFAULT 'balanced',
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Food logs table
CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  food_name TEXT NOT NULL,
  calories NUMERIC DEFAULT 0,
  protein NUMERIC DEFAULT 0,
  carbs NUMERIC DEFAULT 0,
  fats NUMERIC DEFAULT 0,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meal plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout plans table
CREATE TABLE IF NOT EXISTS workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- Row Level Security (RLS) Policies
-- ═══════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only CRUD their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Food Logs: Users can only CRUD their own logs
CREATE POLICY "Users can view own food logs" ON food_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food logs" ON food_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own food logs" ON food_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Meal Plans: Users can only CRUD their own plans
CREATE POLICY "Users can view own meal plans" ON meal_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plans" ON meal_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans" ON meal_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Workout Plans: Users can only CRUD their own plans
CREATE POLICY "Users can view own workout plans" ON workout_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout plans" ON workout_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout plans" ON workout_plans

  FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════
-- ZencyFlow Feature Tables
-- ═══════════════════════════════════════

-- Sleep Logs
CREATE TABLE IF NOT EXISTS sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  hours NUMERIC NOT NULL,
  quality INTEGER, -- 1-10 scale optionally
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- e.g., 'Fitness', 'Mindfulness', 'Financial'
  target_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  progress INTEGER DEFAULT 0, -- 0-100
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habits
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT, -- 'daily', 'weekly', etc.
  target_count INTEGER DEFAULT 1, -- Times per day/week
  color TEXT, -- For UI customization
  icon TEXT, -- For UI customization
  created_at TIMESTAMPTZ DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

-- Habit Logs (Tracking completions)
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- Denormalized for easier querying
  date DATE NOT NULL,
  count INTEGER DEFAULT 1,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal Entries (Ultimate Story Journal)
DROP TABLE IF EXISTS journal_entries CASCADE;

CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT,
  photos TEXT[] DEFAULT '{}',
  mood TEXT,
  location TEXT,
  calories INTEGER DEFAULT 0,
  workout_done BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar Events
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  color TEXT,
  type TEXT, -- 'workout', 'meal', 'generic'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- RLS Policies for New Tables
-- ═══════════════════════════════════════

-- Enable RLS
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Sleep Logs Policies
CREATE POLICY "Users can crud own sleep logs" ON sleep_logs USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Goals Policies
CREATE POLICY "Users can crud own goals" ON goals USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Habits Policies
CREATE POLICY "Users can crud own habits" ON habits USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Habit Logs Policies
CREATE POLICY "Users can crud own habit logs" ON habit_logs USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Journal Policies
CREATE POLICY "Users can crud own journal entries" ON journal_entries USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Calendar Policies
CREATE POLICY "Users can crud own calendar events" ON calendar_events USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════
-- Unified Plans Table (AI-Generated)
-- ═══════════════════════════════════════

-- Stores both workout and diet plans generated by AI
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT, -- 'workout' or 'diet'
  content JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plans" ON plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans" ON plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans" ON plans
  FOR DELETE USING (auth.uid() = user_id);

-- Add plan generation count to profiles for usage limits
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_generation_count INTEGER DEFAULT 0;

-- ═══════════════════════════════════════
-- AI Trainer Chat History (Trainer Memory)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS trainer_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,       -- 'user' or 'trainer'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE trainer_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trainer messages" ON trainer_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trainer messages" ON trainer_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trainer messages" ON trainer_messages
  FOR DELETE USING (auth.uid() = user_id);
