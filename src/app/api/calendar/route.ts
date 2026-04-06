import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let query = supabaseAdmin
      .from('calendar_events')
      .select('*')
      .eq('user_id', session.id)
      .order('event_date', { ascending: true });

    if (month && year) {
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
      const endYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
      const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
      query = query.gte('event_date', startDate).lt('event_date', endDate);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Calendar events error:', error);
      return NextResponse.json({ error: 'Error al obtener eventos' }, { status: 500 });
    }

    return NextResponse.json({ events: events || [] });
  } catch (err) {
    console.error('Calendar GET error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { title, event_date, color, notes } = await request.json();

    if (!title || !event_date) {
      return NextResponse.json({ error: 'Título y fecha son obligatorios' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('calendar_events')
      .insert({
        user_id: session.id,
        title,
        event_date,
        color: color || '#7c6cf0',
        notes: notes || '',
      })
      .select()
      .single();

    if (error) {
      console.error('Calendar insert error:', error);
      return NextResponse.json({ error: 'Error al crear evento' }, { status: 500 });
    }

    return NextResponse.json({ event: data }, { status: 201 });
  } catch (err) {
    console.error('Calendar POST error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
