'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * Server Actions for Profile Management
 */

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  try {
    const fullName = formData.get('full_name') as string;
    const phone = formData.get('phone') as string;
    const organization = formData.get('organization') as string;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone,
        organization,
      })
      .eq('id', user.id);

    if (error) throw error;

    revalidatePath('/dashboard/client/profile');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  try {
    // Verify current password by attempting to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (verifyError) {
      return { error: 'Current password is incorrect' };
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function uploadProfilePicture(file: File) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('profile-pictures').getPublicUrl(filePath);

    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (error) throw error;

    revalidatePath('/dashboard/client/profile');
    return { success: true, url: publicUrl };
  } catch (error: any) {
    return { error: error.message };
  }
}
