import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import LawyersListContent from './LawyersListContent';

export const metadata = {
  title: 'Find a Lawyer - Legal Opinion Portal',
  description: 'Browse verified legal experts by specialization and experience',
};

export default async function LawyersListPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch all lawyers with their stats
  const lawyers = await prisma.profiles.findMany({
    where: { role: 'lawyer' },
    select: {
      id: true,
      full_name: true,
      email: true,
      avatar_url: true,
      specialization: true,
      years_of_experience: true,
    },
    orderBy: [{ full_name: 'asc' }],
  });

  const lawyerIds = lawyers.map((lawyer) => lawyer.id);

  const ratingsByLawyer = await prisma.ratings.groupBy({
    by: ['lawyer_id'],
    where: {
      lawyer_id: { in: lawyerIds },
    },
    _avg: { overall_rating: true },
    _count: { _all: true },
  });

  const ratingMap = new Map(
    ratingsByLawyer
      .filter((rating) => rating.lawyer_id)
      .map((rating) => [rating.lawyer_id as string, rating])
  );

  // Fetch case counts for each lawyer
  const caseCounts = await prisma.legal_requests.findMany({
    where: { assigned_lawyer_id: { not: null } },
    select: { assigned_lawyer_id: true, status: true },
  });

  // Calculate stats for each lawyer
  const lawyersWithStats = (lawyers || []).map((lawyer: any) => {
    const lawyerCases = caseCounts?.filter((c: any) => c.assigned_lawyer_id === lawyer.id) || [];
    const ratingEntry = ratingMap.get(lawyer.id);
    const rating = ratingEntry?._avg?.overall_rating || 0;
    const reviewsCount = ratingEntry?._count?._all || 0;

    return {
      ...lawyer,
      specialization: lawyer.specialization
        ? Array.isArray(lawyer.specialization)
          ? lawyer.specialization
          : [lawyer.specialization]
        : [],
      // Map DB fields to UI expected fields
      rating,
      reviews_count: reviewsCount,
      title: 'Legal Expert', // Default title since it's not in DB
      totalCases: lawyerCases.length,
      completedCases: lawyerCases.filter(
        (c: any) => c.status === 'completed' || c.status === 'delivered'
      ).length,
    };
  });

  lawyersWithStats.sort((a: any, b: any) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return a.full_name.localeCompare(b.full_name);
  });

  // Fetch departments for filter options
  const departments = await prisma.departments.findMany({
    where: { active: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return <LawyersListContent lawyers={lawyersWithStats} departments={departments || []} />;
}
