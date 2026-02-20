'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function updateProfile(formData: FormData) {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return { error: 'Unauthorized' };

  try {
    const fullName = formData.get('full_name') as string;
    const phone = formData.get('phone') as string;
    const organization = formData.get('organization') as string;

    await prisma.profiles.update({
      where: { id: user.id },
      data: { full_name: fullName, phone, organization },
    });

    revalidatePath('/dashboard/client/profile');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return { error: 'Unauthorized' };

  try {
    const profile = await prisma.profiles.findUnique({ where: { id: user.id } });
    if (!profile?.password) return { error: 'No password set for this account' };

    const passwordsMatch = await bcrypt.compare(currentPassword, profile.password);
    if (!passwordsMatch) return { error: 'Current password is incorrect' };

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.profiles.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function uploadProfilePicture(file: File) {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return { error: 'Unauthorized' };

  // NOTE: File storage via Supabase is removed. 
  // Implement your own file storage here (e.g., local disk, S3, Cloudinary).
  return { error: 'File upload not yet configured. Please integrate a storage provider.' };
}
