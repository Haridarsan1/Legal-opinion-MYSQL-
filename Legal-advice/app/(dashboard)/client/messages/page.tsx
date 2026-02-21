import { Metadata } from 'next';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import MessagesContent from './MessagesContent';

export const metadata: Metadata = {
  title: 'Messages - Legal Opinion Portal',
  description: 'Communicate with your lawyers',
};

export default async function MessagesPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  return <MessagesContent userId={user.id!} />;
}
