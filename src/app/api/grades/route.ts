import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: grades, error } = await supabaseAdmin
      .from('student_grades')
      .select('*')
      .eq('user_id', session.id);

    if (error) {
      return NextResponse.json({ error: 'Error al obtener notas' }, { status: 500 });
    }

    return NextResponse.json({ grades: grades || [] });
  } catch (err) {
    console.error('Grades GET error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { grades } = await request.json();

    if (!grades || !Array.isArray(grades)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    for (const gradeEntry of grades) {
      const { component_id, grade } = gradeEntry;

      if (grade === null || grade === undefined || grade === '') {
        // Delete grade if empty
        await supabaseAdmin
          .from('student_grades')
          .delete()
          .eq('user_id', session.id)
          .eq('component_id', component_id);
      } else {
        const numGrade = parseFloat(grade);
        if (numGrade < 1.0 || numGrade > 7.0) continue;

        // Upsert grade
        await supabaseAdmin
          .from('student_grades')
          .upsert(
            {
              user_id: session.id,
              component_id,
              grade: numGrade,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,component_id' }
          );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Grades POST error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
