-- ============================================
-- ESQUEMA DE BASE DE DATOS: Control Horario
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de sesiones de trabajo
CREATE TABLE IF NOT EXISTS work_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  total_hours DECIMAL(5,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de pausas/descansos
CREATE TABLE IF NOT EXISTS breaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES work_sessions(id) ON DELETE CASCADE NOT NULL,
  break_start TIMESTAMPTZ NOT NULL,
  break_end TIMESTAMPTZ,
  total_break_minutes DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_work_sessions_user_id ON work_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_start_time ON work_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_breaks_session_id ON breaks(session_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE breaks ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para work_sessions
CREATE POLICY "Users can view own sessions"
  ON work_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON work_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON work_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON work_sessions FOR DELETE USING (auth.uid() = user_id);

-- Políticas para breaks
CREATE POLICY "Users can view own breaks"
  ON breaks FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM work_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own breaks"
  ON breaks FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM work_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own breaks"
  ON breaks FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM work_sessions WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- TRIGGER: Crear perfil automáticamente al registrarse
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
