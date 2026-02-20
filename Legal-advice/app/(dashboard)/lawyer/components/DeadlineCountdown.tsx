'use client';

import { Clock, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DeadlineCountdownProps {
  deadline: string | null;
  className?: string;
}

export default function DeadlineCountdown({ deadline, className = '' }: DeadlineCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    isUrgent: boolean;
    isExpired: boolean;
  } | null>(null);

  useEffect(() => {
    if (!deadline) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const deadlineTime = new Date(deadline).getTime();
      const diff = deadlineTime - now;

      if (diff <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          isUrgent: false,
          isExpired: true,
        };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      // Mark as urgent if less than 24 hours remaining
      const isUrgent = diff < 24 * 60 * 60 * 1000;

      return {
        days,
        hours,
        minutes,
        isUrgent,
        isExpired: false,
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every minute
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline || !timeLeft) {
    return null;
  }

  if (timeLeft.isExpired) {
    return (
      <div className={`flex items-center gap-1.5 text-sm text-red-600 ${className}`}>
        <AlertCircle className="w-4 h-4" />
        <span className="font-medium">Deadline passed</span>
      </div>
    );
  }

  const getFormattedTime = () => {
    if (timeLeft.days > 0) {
      return `${timeLeft.days}d ${timeLeft.hours}h left`;
    } else if (timeLeft.hours > 0) {
      return `${timeLeft.hours}h ${timeLeft.minutes}m left`;
    } else {
      return `${timeLeft.minutes}m left`;
    }
  };

  const getColorClass = () => {
    if (timeLeft.isUrgent) {
      return 'text-red-600 bg-red-50 border-red-200';
    } else if (timeLeft.days < 3) {
      return 'text-orange-600 bg-orange-50 border-orange-200';
    } else {
      return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-sm font-medium ${getColorClass()} ${className}`}
    >
      <Clock className="w-3.5 h-3.5" />
      <span>{getFormattedTime()}</span>
    </div>
  );
}
