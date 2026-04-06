import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword, createToken, setSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, name, username, password } = await request.json();

    if (!email || !name || !username || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Check if email exists
    const { data: existingEmail } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { error: 'El correo ya está registrado' },
        { status: 409 }
      );
    }

    // Check if username exists
    const { data: existingUsername } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUsername) {
      return NextResponse.json(
        { error: 'El nombre de usuario ya está en uso' },
        { status: 409 }
      );
    }

    // Check if this is the first user (make admin)
    const { count } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    const role = count === 0 ? 'admin' : 'student';

    const password_hash = await hashPassword(password);

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({ email, name, username, password_hash, role })
      .select('id, email, name, username, role')
      .single();

    if (error) {
      console.error('Registration error:', error);
      return NextResponse.json(
        { error: 'Error al crear la cuenta' },
        { status: 500 }
      );
    }

    const token = await createToken({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    await setSessionCookie(token);

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
