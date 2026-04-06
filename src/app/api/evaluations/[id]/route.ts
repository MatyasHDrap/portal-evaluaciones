import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const { name, percentage } = await request.json();

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (percentage !== undefined) updateData.percentage = percentage;

    const { data, error } = await supabaseAdmin
      .from('evaluations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Evaluation update error:', error);
      return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
    }

    return NextResponse.json({ evaluation: data });
  } catch (err) {
    console.error('Evaluation PUT error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
