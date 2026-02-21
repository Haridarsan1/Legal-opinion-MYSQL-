import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's conversations
    const userConversations = await prisma.conversations.findMany({
      where: {
        OR: [
          { participant_1_id: user.id },
          { participant_2_id: user.id },
        ],
      },
      select: { id: true },
    });

    const conversationIds = userConversations.map((c) => c.id);

    // Count unread messages
    const unreadCount = await prisma.messages.count({
      where: {
        read: false,
        sender_id: { not: user.id },
        conversation_id: {
          in: conversationIds,
        },
      },
    });

    return NextResponse.json({ unreadCount }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch unread count' },
      { status: 500 }
    );
  }
}
