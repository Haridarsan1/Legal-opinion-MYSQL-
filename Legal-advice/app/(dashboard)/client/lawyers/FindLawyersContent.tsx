'use client';

import React from 'react';
import LawyerDirectory, { DirectoryLawyer } from '@/components/lawyer/LawyerDirectory';

interface Lawyer {
  id: string;
  name: string;
  title: string;
  rating: number;
  reviews: number;
  location: string;
  experience: number;
  specializations: string[];
  availability: 'Available' | 'In Court' | 'Offline';
}

interface FindLawyersContentProps {
  lawyers: any[];
}

export default function FindLawyersContent({ lawyers }: FindLawyersContentProps) {
  // Map real data to DirectoryLawyer interface
  const directoryLawyers: DirectoryLawyer[] = lawyers.map((l) => ({
    id: l.id,
    full_name: l.full_name,
    specialization: l.specialization,
    years_of_experience: l.years_of_experience,
    location: l.location,
    rating: l.rating,
    reviews_count: l.reviews_count,
    availability_status: l.availability_status || 'Available',
    title: l.title || 'Legal Expert',
    bio: l.bio,
    avatar_url: l.avatar_url,
    bar_council_id: l.bar_council_id,
  }));

  return (
    <LawyerDirectory
      lawyers={directoryLawyers}
      mode="browse"
      className="md:h-[calc(100vh-64px)]" // Adjust height for dashboard layout
    />
  );
}
