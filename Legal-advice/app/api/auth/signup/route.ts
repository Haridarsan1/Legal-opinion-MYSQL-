import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { email, password, options } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Extract user data from options
    const fullName = options?.data?.full_name || '';
    const phone = options?.data?.phone || '';
    const role = options?.data?.role || 'client';

    // Check if user already exists
    const existingUser = await prisma.profiles.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await prisma.profiles.create({
      data: {
        id: uuidv4(),
        email,
        password: hashedPassword,
        full_name: fullName,
        phone: phone,
        role: role as any,
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user account' },
      { status: 500 }
    );
  }
}
