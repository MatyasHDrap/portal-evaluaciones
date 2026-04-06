import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const { title, event_date, color, notes } = await request.json();

    const { data, error } = await supabaseAdmin
      .from('calendar_events')
      .update({ title, event_date, color, notes })
      .eq('id', id)
      .eq('user_id', session.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
    }

    return NextResponse.json({ event: data });
  } catch (err) {
    console.error('Calendar PUT error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('calendar_events')
      .delete()
      .eq('id', id)
      .eq('user_id', session.id);

    if (error) {
      return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Calendar DELETE error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
