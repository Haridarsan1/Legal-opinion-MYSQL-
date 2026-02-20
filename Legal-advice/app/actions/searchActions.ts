'use server';
import { createClient } from '@/lib/supabase/server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export interface SearchResult {
  type: 'lawyer' | 'practice_area' | 'service';
  id: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  metadata?: any;
}

export interface GroupedResults {
  lawyers: SearchResult[];
  practiceAreas: SearchResult[];
  services: SearchResult[];
}

export async function searchGlobal(
  query: string
): Promise<{ success: boolean; data?: GroupedResults; error?: string }> {
  

  if (!query || query.trim().length < 2) {
    return { success: true, data: { lawyers: [], practiceAreas: [], services: [] } };
  }

  const searchQuery = `%${query}%`;

  try {
    // Parallel queries for better performance
    const [lawyersResult, practiceAreasResult] = await Promise.all([
      // Search Lawyers
      supabase
        .from('lawyer_profiles')
        .select('id, full_name, specialization, avatar_url, city, years_of_experience')
        .or(`full_name.ilike.${searchQuery},specialization.cs.{${query}}`) // naive array search, improved below
        .limit(5),

      // Search Practice Areas (assuming table exists, or we mock it if not yet created - using mock for safety first)
      // If you have a real table, replace. For now, I'll mock common ones if query matches.
      Promise.resolve(getMockPracticeAreas(query)),
    ]);

    // Parse Lawyers
    const lawyers: SearchResult[] = (lawyersResult.data || []).map((l: any) => ({
      type: 'lawyer',
      id: l.id,
      title: l.full_name,
      subtitle: `${l.specialization?.[0] || 'Lawyer'} • ${l.years_of_experience || 0} yrs • ${l.city || 'Remote'}`,
      image_url: l.avatar_url,
      metadata: { specialty: l.specialization },
    }));

    // Parse Practice Areas
    const practiceAreas = practiceAreasResult;

    return {
      success: true,
      data: {
        lawyers,
        practiceAreas,
        services: [], // Future scope
      },
    };
  } catch (error) {
    console.error('Search error:', error);
    return { success: false, error: 'Failed to perform search' };
  }
}

// Mock helper for Phase 1 until actual table confirmed
function getMockPracticeAreas(query: string): SearchResult[] {
  const allAreas = [
    'Corporate Law',
    'Criminal Defense',
    'Family Law',
    'Intellectual Property',
    'Real Estate',
    'Immigration',
    'Tax Law',
    'Labor & Employment',
    'Startup Law',
    'Divorce Consultation',
    'Property Dispute',
    'Company Registration',
  ];

  return allAreas
    .filter((area) => area.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map((area) => ({
      type: 'practice_area',
      id: area.toLowerCase().replace(/\s+/g, '-'),
      title: area,
      subtitle: 'Practice Area',
    }));
}
