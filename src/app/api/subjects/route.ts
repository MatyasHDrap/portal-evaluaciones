import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const { data: subjects, error } = await supabaseAdmin
      .from('subjects')
      .select(`
        *,
        evaluations (
          *,
          evaluation_components (*)
        )
      `)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching subjects:', error);
      return NextResponse.json({ error: 'Error al obtener asignaturas' }, { status: 500 });
    }

    // Sort evaluations and components, rename evaluation_components -> components
    const sorted = subjects?.map(subject => ({
      ...subject,
      evaluations: subject.evaluations
        ?.sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order)
        .map((ev: { evaluation_components: { display_order: number; id: string; evaluation_id: string; type: string; percentage: number; due_date: string | null }[] }) => ({
          ...ev,
          evaluation_components: undefined,
          components: ev.evaluation_components
            ?.sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order),
        })),
    }));

    return NextResponse.json({ subjects: sorted });
  } catch (err) {
    console.error('Subjects GET error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { name, evaluations } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    // Get max display_order
    const { data: maxOrder } = await supabaseAdmin
      .from('subjects')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const newOrder = (maxOrder?.display_order || 0) + 1;

    const { data: subject, error } = await supabaseAdmin
      .from('subjects')
      .insert({ name, display_order: newOrder })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Error al crear asignatura' }, { status: 500 });
    }

    // Insert evaluations if provided
    if (evaluations && evaluations.length > 0) {
      for (const ev of evaluations) {
        const { data: evaluation } = await supabaseAdmin
          .from('evaluations')
          .insert({
            subject_id: subject.id,
            name: ev.name,
            percentage: ev.percentage,
            display_order: ev.display_order || 0,
          })
          .select()
          .single();

        if (evaluation && ev.components && ev.components.length > 0) {
          await supabaseAdmin.from('evaluation_components').insert(
            ev.components.map((comp: { type: string; percentage: number; due_date: string | null; display_order: number }) => ({
              evaluation_id: evaluation.id,
              type: comp.type,
              percentage: comp.percentage,
              due_date: comp.due_date || null,
              display_order: comp.display_order || 0,
            }))
          );
        }
      }
    }

    return NextResponse.json({ subject }, { status: 201 });
  } catch (err) {
    console.error('Subjects POST error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
