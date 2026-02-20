'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RatingStars } from './RatingStars';
import { toast } from 'sonner';
import { submitReview } from '@/app/actions/reviews';
import { Loader2 } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  lawyerName?: string;
  onSuccess?: () => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  requestId,
  lawyerName = 'the lawyer',
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [interactionType, setInteractionType] = useState('full_case');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitReview(requestId, rating, reviewText, interactionType);

      if (result.success) {
        toast.success('Review submitted successfully!');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(result.error || 'Failed to submit review');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
          <DialogDescription>How was your experience working with {lawyerName}?</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* Star Rating */}
          <div className="flex flex-col items-center gap-2">
            <RatingStars rating={rating} onRatingChange={setRating} size="lg" />
            <span className="text-sm font-medium text-slate-500">
              {rating === 0
                ? 'Select a rating'
                : rating === 1
                  ? 'Poor'
                  : rating === 2
                    ? 'Fair'
                    : rating === 3
                      ? 'Good'
                      : rating === 4
                        ? 'Very Good'
                        : 'Excellent'}
            </span>
          </div>

          {/* Interaction Type */}
          <div className="grid gap-2">
            <Label htmlFor="interaction-type">Service Type</Label>
            <select
              id="interaction-type"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={interactionType}
              onChange={(e) => setInteractionType(e.target.value)}
            >
              <option value="full_case">Full Case Handling</option>
              <option value="opinion">Legal Opinion</option>
              <option value="chat">Consultation (Chat)</option>
              <option value="call">Consultation (Call)</option>
            </select>
          </div>

          {/* Review Text */}
          <div className="grid gap-2">
            <Label htmlFor="review-text">Feedback (Optional)</Label>
            <Textarea
              id="review-text"
              placeholder="Share details about your experience..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Skip
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
