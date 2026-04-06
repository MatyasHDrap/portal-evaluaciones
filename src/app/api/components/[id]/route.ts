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
    const { type, percentage, due_date } = await request.json();

    const updateData: Record<string, unknown> = {};
    if (type !== undefined) updateData.type = type;
    if (percentage !== undefined) updateData.percentage = percentage;
    if (due_date !== undefined) updateData.due_date = due_date || null;

    const { data, error } = await supabaseAdmin
      .from('evaluation_components')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Component update error:', error);
      return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
    }

    return NextResponse.json({ component: data });
  } catch (err) {
    console.error('Component PUT error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
