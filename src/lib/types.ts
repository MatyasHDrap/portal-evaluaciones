export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  role: 'admin' | 'student';
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  display_order: number;
  created_at: string;
  evaluations?: Evaluation[];
}

export interface Evaluation {
  id: string;
  subject_id: string;
  name: string;
  percentage: number;
  display_order: number;
  components?: EvaluationComponent[];
}

export interface EvaluationComponent {
  id: string;
  evaluation_id: string;
  type: string;
  percentage: number;
  due_date: string | null;
  display_order: number;
}

export interface StudentGrade {
  id: string;
  user_id: string;
  component_id: string;
  grade: number | null;
  updated_at: string;
}

export interface SubjectWithGrades extends Subject {
  evaluations: (Evaluation & {
    components: (EvaluationComponent & {
      grade?: StudentGrade | null;
    })[];
  })[];
}
