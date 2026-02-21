import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import LawyerProfileContent from './LawyerProfileContent';

export default async function LawyerProfilePage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch lawyer profile data
  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
  });

  const lawyerProfile = profile
    ? {
        practice_areas: Array.isArray(profile.specialization)
          ? profile.specialization
          : profile.specialization
            ? [profile.specialization]
            : [],
        years_of_experience: profile.years_of_experience ?? null,
        bar_council_id: profile.bar_council_id ?? null,
        bio: profile.bio ?? null,
        jurisdiction: null,
        year_of_enrollment: null,
      }
    : null;

  if (!profile || profile.role !== 'lawyer') {
    redirect('/auth/login');
  }

  const rawReviews = await prisma.ratings.findMany({
    where: { lawyer_id: user.id },
    orderBy: { created_at: 'desc' },
    include: {
      profiles_ratings_client_idToprofiles: {
        select: { full_name: true, avatar_url: true },
      },
    },
  });

  const reviews = rawReviews.map((review) => ({
    id: review.id,
    rating: review.overall_rating,
    review_text: review.feedback,
    created_at: review.created_at,
    request_id: review.request_id,
    client: review.profiles_ratings_client_idToprofiles
      ? {
          full_name: review.profiles_ratings_client_idToprofiles.full_name,
          avatar_url: review.profiles_ratings_client_idToprofiles.avatar_url,
        }
      : null,
  }));

  return <LawyerProfileContent profile={profile} lawyerProfile={lawyerProfile} reviews={reviews || []} />;
}
