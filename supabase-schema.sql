-- ============================================
-- Portal de Evaluaciones - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  percentage INT NOT NULL,
  display_order INT DEFAULT 0
);

-- 4. Evaluation Components table
CREATE TABLE IF NOT EXISTS evaluation_components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  percentage INT NOT NULL,
  due_date DATE,
  display_order INT DEFAULT 0
);

-- 5. Student Grades table
CREATE TABLE IF NOT EXISTS student_grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  component_id UUID REFERENCES evaluation_components(id) ON DELETE CASCADE,
  grade DECIMAL(2,1) CHECK (grade >= 1.0 AND grade <= 7.0),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, component_id)
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_grades ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything (our API routes use service role)
CREATE POLICY "Service role full access on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on subjects" ON subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on evaluations" ON evaluations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on evaluation_components" ON evaluation_components FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on student_grades" ON student_grades FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Seed Data: All Subjects and Evaluations
-- ============================================

-- 1. TIC
INSERT INTO subjects (id, name, display_order) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Certámenes de TIC', 1);

INSERT INTO evaluations (id, subject_id, name, percentage, display_order) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Evaluación 1', 25, 1),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Evaluación 2', 35, 2),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Evaluación 3', 40, 3);

INSERT INTO evaluation_components (evaluation_id, type, percentage, due_date, display_order) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Trabajo Aplicado', 100, '2026-04-09', 1),
  ('b1000000-0000-0000-0000-000000000002', 'Certamen', 100, '2026-05-14', 1),
  ('b1000000-0000-0000-0000-000000000003', 'Certamen', 100, '2026-06-18', 1);

-- 2. Matemáticas
INSERT INTO subjects (id, name, display_order) VALUES
  ('a1000000-0000-0000-0000-000000000002', 'Certámenes de Matemáticas', 2);

INSERT INTO evaluations (id, subject_id, name, percentage, display_order) VALUES
  ('b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'Evaluación 1', 25, 1),
  ('b2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'Evaluación 2', 35, 2),
  ('b2000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Evaluación 3', 40, 3);

INSERT INTO evaluation_components (evaluation_id, type, percentage, due_date, display_order) VALUES
  ('b2000000-0000-0000-0000-000000000001', 'Certamen', 100, '2026-04-01', 1),
  ('b2000000-0000-0000-0000-000000000002', 'Trabajo', 100, '2026-05-13', 1),
  ('b2000000-0000-0000-0000-000000000003', 'Certamen', 70, '2026-06-10', 1),
  ('b2000000-0000-0000-0000-000000000003', 'Test', 30, '2026-06-15', 2);

-- 3. Análisis de Sistemas
INSERT INTO subjects (id, name, display_order) VALUES
  ('a1000000-0000-0000-0000-000000000003', 'Certámenes de Análisis de Sistemas', 3);

INSERT INTO evaluations (id, subject_id, name, percentage, display_order) VALUES
  ('b3000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 'Evaluación 1', 25, 1),
  ('b3000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 'Evaluación 2', 35, 2),
  ('b3000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'Evaluación 3', 40, 3);

INSERT INTO evaluation_components (evaluation_id, type, percentage, due_date, display_order) VALUES
  ('b3000000-0000-0000-0000-000000000001', 'Test', 40, '2026-04-06', 1),
  ('b3000000-0000-0000-0000-000000000001', 'Trabajo', 60, '2026-03-30', 2),
  ('b3000000-0000-0000-0000-000000000002', 'Certamen', 60, '2026-05-12', 1),
  ('b3000000-0000-0000-0000-000000000002', 'Trabajo', 40, '2026-04-20', 2),
  ('b3000000-0000-0000-0000-000000000003', 'Trabajo', 100, '2026-06-08', 1);

-- 4. Taller Integrado ABP
INSERT INTO subjects (id, name, display_order) VALUES
  ('a1000000-0000-0000-0000-000000000004', 'Certámenes de Taller Integrado ABP', 4);

INSERT INTO evaluations (id, subject_id, name, percentage, display_order) VALUES
  ('b4000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'Evaluación 1', 25, 1),
  ('b4000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004', 'Evaluación 2', 35, 2),
  ('b4000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 'Evaluación 3', 40, 3);

INSERT INTO evaluation_components (evaluation_id, type, percentage, due_date, display_order) VALUES
  ('b4000000-0000-0000-0000-000000000001', 'Trabajo', 100, '2026-04-17', 1),
  ('b4000000-0000-0000-0000-000000000002', 'Trabajo', 100, '2026-05-15', 1),
  ('b4000000-0000-0000-0000-000000000003', 'Trabajo', 100, '2026-06-12', 1);

-- 5. Taller de Hardware
INSERT INTO subjects (id, name, display_order) VALUES
  ('a1000000-0000-0000-0000-000000000005', 'Certámenes de Taller de Hardware', 5);

INSERT INTO evaluations (id, subject_id, name, percentage, display_order) VALUES
  ('b5000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', 'Evaluación 1', 25, 1),
  ('b5000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', 'Evaluación 2', 35, 2),
  ('b5000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000005', 'Evaluación 3', 40, 3);

INSERT INTO evaluation_components (evaluation_id, type, percentage, due_date, display_order) VALUES
  ('b5000000-0000-0000-0000-000000000001', 'Por definir', 100, NULL, 1),
  ('b5000000-0000-0000-0000-000000000002', 'Por definir', 100, NULL, 1),
  ('b5000000-0000-0000-0000-000000000003', 'Por definir', 100, NULL, 1);

-- 6. Desarrollo de Algoritmos
INSERT INTO subjects (id, name, display_order) VALUES
  ('a1000000-0000-0000-0000-000000000006', 'Certámenes de Desarrollo de Algoritmos', 6);

INSERT INTO evaluations (id, subject_id, name, percentage, display_order) VALUES
  ('b6000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000006', 'Evaluación 1', 25, 1),
  ('b6000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000006', 'Evaluación 2', 35, 2),
  ('b6000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000006', 'Evaluación 3', 40, 3);

INSERT INTO evaluation_components (evaluation_id, type, percentage, due_date, display_order) VALUES
  ('b6000000-0000-0000-0000-000000000001', 'Certamen 1', 100, '2026-04-09', 1),
  ('b6000000-0000-0000-0000-000000000002', 'Certamen 2', 70, NULL, 1),
  ('b6000000-0000-0000-0000-000000000002', 'Test 1', 30, NULL, 2),
  ('b6000000-0000-0000-0000-000000000003', 'Certamen 3', 70, NULL, 1),
  ('b6000000-0000-0000-0000-000000000003', 'Test 2', 30, NULL, 2);

-- 7. Comunicación y Aprendizaje
INSERT INTO subjects (id, name, display_order) VALUES
  ('a1000000-0000-0000-0000-000000000007', 'Certámenes de Comunicación y Aprendizaje', 7);

INSERT INTO evaluations (id, subject_id, name, percentage, display_order) VALUES
  ('b7000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000007', 'Evaluación 1', 25, 1),
  ('b7000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000007', 'Evaluación 2', 35, 2),
  ('b7000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000007', 'Evaluación 3', 40, 3);

INSERT INTO evaluation_components (evaluation_id, type, percentage, due_date, display_order) VALUES
  ('b7000000-0000-0000-0000-000000000001', 'Trabajo Grupal', 100, '2026-04-07', 1),
  ('b7000000-0000-0000-0000-000000000002', 'Disertación', 100, '2026-05-12', 1),
  ('b7000000-0000-0000-0000-000000000003', 'Informe', 100, '2026-06-09', 1);

-- 8. Desarrollo Personal
INSERT INTO subjects (id, name, display_order) VALUES
  ('a1000000-0000-0000-0000-000000000008', 'Certámenes de Desarrollo Personal', 8);

INSERT INTO evaluations (id, subject_id, name, percentage, display_order) VALUES
  ('b8000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000008', 'Evaluación 1', 25, 1),
  ('b8000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000008', 'Evaluación 2', 35, 2),
  ('b8000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000008', 'Evaluación 3', 40, 3);

INSERT INTO evaluation_components (evaluation_id, type, percentage, due_date, display_order) VALUES
  ('b8000000-0000-0000-0000-000000000001', 'Trabajo (Promedio)', 100, NULL, 1),
  ('b8000000-0000-0000-0000-000000000002', 'Trabajo (Promedio)', 100, NULL, 1),
  ('b8000000-0000-0000-0000-000000000003', 'Trabajo (Promedio)', 100, NULL, 1);
