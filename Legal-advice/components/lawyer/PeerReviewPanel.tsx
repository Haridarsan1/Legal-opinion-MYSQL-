'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/shared/Card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface PeerReview {
  id: string;
  reviewer_id: string;
  reviewer?: {
    full_name: string;
    bar_council_id: string;
  };
  status: 'requested' | 'in_progress' | 'approved' | 'changes_requested' | 'rejected';
  feedback: string | null;
  reviewed_at: string | null;
  created_at: string;
}

interface SectionComment {
  id: string;
  section_name: string;
  section_position: number | null;
  comment_text: string;
  comment_type: 'suggestion' | 'issue' | 'approval';
  resolved: boolean;
  created_by: string;
  created_at: string;
  creator?: {
    full_name: string;
  };
}

interface PeerReviewPanelProps {
  opinionVersionId: string;
  requestId: string;
  mode: 'request' | 'review'; // 'request' for author, 'review' for reviewer
  onReviewComplete?: () => void;
}

export default function PeerReviewPanel({
  opinionVersionId,
  requestId,
  mode,
  onReviewComplete,
}: PeerReviewPanelProps) {
  const supabase = createClient();

  const [peerReviews, setPeerReviews] = useState<PeerReview[]>([]);
  const [sectionComments, setSectionComments] = useState<SectionComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Request review form
  const [selectedReviewer, setSelectedReviewer] = useState('');
  const [reviewReason, setReviewReason] = useState('');
  const [availableLawyers, setAvailableLawyers] = useState<any[]>([]);

  // Submit review form
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'changes_requested' | 'rejected'>(
    'approved'
  );
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

  // Section comment form
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentSection, setCommentSection] = useState('facts');
  const [commentText, setCommentText] = useState('');
  const [commentType, setCommentType] = useState<'suggestion' | 'issue' | 'approval'>('suggestion');

  // Load peer reviews
  useEffect(() => {
    const loadPeerReviews = async () => {
      setIsLoading(true);

      const { data: reviews } = await supabase
        .from('peer_reviews')
        .select(
          `
          *,
          reviewer:profiles!peer_reviews_reviewer_id_fkey(full_name, bar_council_id)
        `
        )
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (reviews) setPeerReviews(reviews as PeerReview[]);
      setIsLoading(false);
    };

    loadPeerReviews();
  }, [requestId]);

  // Load section comments
  useEffect(() => {
    const loadComments = async () => {
      const { data: comments } = await supabase
        .from('opinion_section_comments')
        .select(
          `
          *,
          creator:profiles!opinion_section_comments_created_by_fkey(full_name)
        `
        )
        .eq('opinion_version_id', opinionVersionId)
        .order('created_at', { ascending: true });

      if (comments) setSectionComments(comments as SectionComment[]);
    };

    loadComments();
  }, [opinionVersionId]);

  // Load available lawyers for peer review
  useEffect(() => {
    const loadLawyers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, bar_council_id, specialization')
        .eq('role', 'lawyer')
        .limit(20);

      if (data) setAvailableLawyers(data);
    };

    if (showRequestModal) {
      loadLawyers();
    }
  }, [showRequestModal]);

  // Request peer review
  const requestPeerReview = async () => {
    if (!selectedReviewer) {
      alert('Please select a reviewer');
      return;
    }

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    // Get opinion submission ID
    const { data: version } = await supabase
      .from('opinion_versions')
      .select('opinion_submission_id')
      .eq('id', opinionVersionId)
      .single();

    if (!version) return;

    const { error } = await supabase.from('peer_reviews').insert({
      opinion_submission_id: version.opinion_submission_id,
      request_id: requestId,
      requested_by: user.id,
      reviewer_id: selectedReviewer,
      status: 'requested',
    });

    if (!error) {
      // Reload reviews
      const { data: reviews } = await supabase
        .from('peer_reviews')
        .select(
          `
          *,
          reviewer:profiles!peer_reviews_reviewer_id_fkey(full_name, bar_council_id)
        `
        )
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (reviews) setPeerReviews(reviews as PeerReview[]);

      setShowRequestModal(false);
      setSelectedReviewer('');
      setReviewReason('');
    }
  };

  // Submit peer review
  const submitReview = async () => {
    if (!activeReviewId || !reviewFeedback.trim()) {
      alert('Please provide feedback');
      return;
    }

    const { error } = await supabase
      .from('peer_reviews')
      .update({
        status: reviewStatus,
        feedback: reviewFeedback,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', activeReviewId);

    if (!error) {
      // Reload reviews
      const { data: reviews } = await supabase
        .from('peer_reviews')
        .select(
          `
          *,
          reviewer:profiles!peer_reviews_reviewer_id_fkey(full_name, bar_council_id)
        `
        )
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (reviews) setPeerReviews(reviews as PeerReview[]);

      setShowReviewModal(false);
      setReviewFeedback('');
      setActiveReviewId(null);

      if (onReviewComplete) onReviewComplete();
    }
  };

  // Add section comment
  const addSectionComment = async () => {
    if (!commentText.trim()) {
      alert('Please enter a comment');
      return;
    }

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    // Get peer review ID (assuming reviewer is adding comment)
    const userReview = peerReviews.find((r) => r.reviewer_id === user.id);
    if (!userReview) return;

    const { error } = await supabase.from('opinion_section_comments').insert({
      opinion_version_id: opinionVersionId,
      peer_review_id: userReview.id,
      section_name: commentSection,
      comment_text: commentText,
      comment_type: commentType,
      created_by: user.id,
    });

    if (!error) {
      // Reload comments
      const { data: comments } = await supabase
        .from('opinion_section_comments')
        .select(
          `
          *,
          creator:profiles!opinion_section_comments_created_by_fkey(full_name)
        `
        )
        .eq('opinion_version_id', opinionVersionId)
        .order('created_at', { ascending: true });

      if (comments) setSectionComments(comments as SectionComment[]);

      setShowCommentForm(false);
      setCommentText('');
    }
  };

  // Resolve comment
  const resolveComment = async (commentId: string) => {
    const { error } = await supabase
      .from('opinion_section_comments')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', commentId);

    if (!error) {
      setSectionComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, resolved: true } : c))
      );
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Peer Review</h3>

        {mode === 'request' && (
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Request Peer Review
          </button>
        )}
      </div>

      {/* Active Reviews */}
      <div className="space-y-4">
        {peerReviews.map((review) => (
          <Card key={review.id}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{review.reviewer?.full_name}</p>
                  <p className="text-sm text-gray-600">Bar ID: {review.reviewer?.bar_council_id}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    review.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : review.status === 'changes_requested'
                        ? 'bg-yellow-100 text-yellow-800'
                        : review.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : review.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {review.status.replace('_', ' ')}
                </span>
              </div>

              {review.feedback && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <p className="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
                  <p className="text-sm text-gray-600">{review.feedback}</p>
                </div>
              )}

              {review.reviewed_at && (
                <p className="text-xs text-gray-500 mt-2">
                  Reviewed: {new Date(review.reviewed_at).toLocaleString()}
                </p>
              )}

              {mode === 'review' && review.status === 'requested' && (
                <button
                  onClick={() => {
                    setActiveReviewId(review.id);
                    setShowReviewModal(true);
                  }}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Submit Review
                </button>
              )}
            </div>
          </Card>
        ))}

        {peerReviews.length === 0 && (
          <Card>
            <div className="p-6 text-center text-gray-500">No peer reviews requested yet</div>
          </Card>
        )}
      </div>

      {/* Section Comments */}
      {mode === 'review' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Section Comments</h4>
            <button
              onClick={() => setShowCommentForm(true)}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              Add Comment
            </button>
          </div>

          <div className="space-y-2">
            {sectionComments.map((comment) => (
              <div
                key={comment.id}
                className={`p-3 rounded border ${
                  comment.resolved ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm capitalize">{comment.section_name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          comment.comment_type === 'issue'
                            ? 'bg-red-100 text-red-800'
                            : comment.comment_type === 'approval'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {comment.comment_type}
                      </span>
                      {comment.resolved && (
                        <span className="text-xs text-green-600">✓ Resolved</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{comment.comment_text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {comment.creator?.full_name} •{' '}
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {!comment.resolved && mode === 'review' && (
                    <button
                      onClick={() => resolveComment(comment.id)}
                      className="ml-3 text-xs text-blue-600 hover:text-blue-800"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Request Review Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Request Peer Review</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Reviewer</label>
                <select
                  value={selectedReviewer}
                  onChange={(e) => setSelectedReviewer(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Choose a lawyer...</option>
                  {availableLawyers.map((lawyer) => (
                    <option key={lawyer.id} value={lawyer.id}>
                      {lawyer.full_name} - {lawyer.specialization || 'General'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reason (Optional)</label>
                <textarea
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={3}
                  placeholder="Why are you requesting this review?"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={requestPeerReview}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Submit Peer Review</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Decision</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="approved">Approve</option>
                  <option value="changes_requested">Request Changes</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Feedback</label>
                <textarea
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={5}
                  placeholder="Provide detailed feedback..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Comment Modal */}
      {showCommentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add Section Comment</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Section</label>
                <select
                  value={commentSection}
                  onChange={(e) => setCommentSection(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="facts">Statement of Facts</option>
                  <option value="issues">Legal Issues</option>
                  <option value="analysis">Legal Analysis</option>
                  <option value="conclusion">Conclusion</option>
                  <option value="references">References</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Comment Type</label>
                <select
                  value={commentType}
                  onChange={(e) => setCommentType(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="suggestion">Suggestion</option>
                  <option value="issue">Issue</option>
                  <option value="approval">Approval</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Comment</label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={4}
                  placeholder="Enter your comment..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCommentForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addSectionComment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
