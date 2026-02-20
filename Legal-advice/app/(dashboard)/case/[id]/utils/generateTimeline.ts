// Timeline event generation utility

interface TimelineEvent {
  id: string;
  actor: {
    name: string;
    role: 'client' | 'lawyer' | 'system';
    avatar?: string;
  };
  action: string;
  entity?: string;
  timestamp: string;
  icon: 'upload' | 'message' | 'check' | 'eye' | 'file' | 'clock';
}

interface CaseData {
  request: {
    created_at: string;
    assigned_at?: string;
    opinion_submitted_at?: string;
    client_confirmed_at?: string;
    status: string;
    lawyer_acceptance_status?: 'pending' | 'accepted' | 'rejected';
    lawyer_accepted_at?: string;
    lawyer_rejected_at?: string;
  };
  client: {
    full_name: string;
    avatar_url?: string;
  };
  lawyer?: {
    full_name: string;
    avatar_url?: string;
  };
  documents: Array<{
    id: string;
    file_name: string;
    uploaded_at: string;
    uploaded_by: string;
    review_status?: string;
    reviewed_at?: string;
    reviewed_by?: string;
  }>;
  clarifications: Array<{
    id: string;
    created_at: string;
    responded_at?: string;
    resolved_at?: string;
    created_by_role?: string;
  }>;
  messages: Array<{
    id: string;
    created_at: string;
    sender_role: 'client' | 'lawyer';
  }>;
}

export function generateTimeline(data: CaseData): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Case created
  events.push({
    id: 'created',
    actor: {
      name: data.client.full_name,
      role: 'client',
      avatar: data.client.avatar_url,
    },
    action: 'submitted case',
    timestamp: data.request.created_at,
    icon: 'file',
  });

  // Lawyer assigned
  if (data.request.assigned_at && data.lawyer) {
    events.push({
      id: 'assigned',
      actor: {
        name: 'System',
        role: 'system',
      },
      action: 'assigned case to',
      entity: data.lawyer.full_name,
      timestamp: data.request.assigned_at,
      icon: 'check',
    });
  }

  // Lawyer acceptance/rejection
  if (data.request.lawyer_accepted_at && data.lawyer) {
    events.push({
      id: 'lawyer-accepted',
      actor: {
        name: data.lawyer.full_name,
        role: 'lawyer' as const,
        avatar: data.lawyer.avatar_url,
      },
      action: 'accepted the case',
      timestamp: data.request.lawyer_accepted_at,
      icon: 'check',
    });
  }

  if (data.request.lawyer_rejected_at && data.lawyer) {
    events.push({
      id: 'lawyer-rejected',
      actor: {
        name: data.lawyer.full_name,
        role: 'lawyer' as const,
        avatar: data.lawyer.avatar_url,
      },
      action: 'rejected the case',
      timestamp: data.request.lawyer_rejected_at,
      icon: 'clock',
    });
  }

  // Documents uploaded
  data.documents.forEach((doc) => {
    const isClientUpload = doc.uploaded_by === data.client.full_name;
    events.push({
      id: `doc-${doc.id}`,
      actor: isClientUpload
        ? { name: data.client.full_name, role: 'client' as const, avatar: data.client.avatar_url }
        : {
            name: data.lawyer?.full_name || 'Lawyer',
            role: 'lawyer' as const,
            avatar: data.lawyer?.avatar_url,
          },
      action: 'uploaded document',
      entity: doc.file_name,
      timestamp: doc.uploaded_at,
      icon: 'upload',
    });

    // Document reviewed/verified
    if (doc.reviewed_at && data.lawyer) {
      const reviewAction =
        doc.review_status === 'approved'
          ? 'verified'
          : doc.review_status === 'rejected'
            ? 'rejected'
            : 'reviewed';
      events.push({
        id: `doc-reviewed-${doc.id}`,
        actor: {
          name: doc.reviewed_by || data.lawyer.full_name,
          role: 'lawyer' as const,
          avatar: data.lawyer.avatar_url,
        },
        action: `${reviewAction} document`,
        entity: doc.file_name,
        timestamp: doc.reviewed_at,
        icon: doc.review_status === 'approved' ? 'check' : 'eye',
      });
    }
  });

  // Clarifications
  data.clarifications.forEach((clarification, idx) => {
    if (data.lawyer) {
      events.push({
        id: `clarification-${clarification.id}`,
        actor: {
          name: data.lawyer.full_name,
          role: 'lawyer' as const,
          avatar: data.lawyer.avatar_url,
        },
        action: 'requested clarification',
        timestamp: clarification.created_at,
        icon: 'message',
      });
    }

    if (clarification.responded_at) {
      events.push({
        id: `clarification-response-${clarification.id}`,
        actor: {
          name: data.client.full_name,
          role: 'client' as const,
          avatar: data.client.avatar_url,
        },
        action: 'responded to clarification',
        timestamp: clarification.responded_at,
        icon: 'message',
      });
    }

    if (clarification.resolved_at && data.lawyer) {
      events.push({
        id: `clarification-resolved-${clarification.id}`,
        actor: {
          name: data.lawyer.full_name,
          role: 'lawyer' as const,
          avatar: data.lawyer.avatar_url,
        },
        action: 'resolved clarification',
        timestamp: clarification.resolved_at,
        icon: 'check',
      });
    }
  });

  // Opinion submitted
  if (data.request.opinion_submitted_at && data.lawyer) {
    events.push({
      id: 'opinion-submitted',
      actor: {
        name: data.lawyer.full_name,
        role: 'lawyer' as const,
        avatar: data.lawyer.avatar_url,
      },
      action: 'submitted legal opinion report to client',
      timestamp: data.request.opinion_submitted_at,
      icon: 'check',
    });
  }

  // Client confirmed no further questions
  if (data.request.client_confirmed_at) {
    events.push({
      id: 'client-confirmed',
      actor: {
        name: data.client.full_name,
        role: 'client',
        avatar: data.client.avatar_url,
      },
      action: 'confirmed no further questions',
      timestamp: data.request.client_confirmed_at,
      icon: 'check',
    });
  }

  // Sort by timestamp (newest first)
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
