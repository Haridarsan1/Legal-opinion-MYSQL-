'use client';
import { useSession } from 'next-auth/react';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/shared/Card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';// Opinion section structure

const supabase = createClient();
interface OpinionSections {
  facts: string;
  issues: string;
  analysis: string;
  conclusion: string;
  references: string;
}

interface OpinionVersion {
  id: string;
  version_number: number;
  content_sections: OpinionSections;
  status: 'draft' | 'peer_review' | 'approved' | 'signed' | 'published';
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

interface OpinionEditorProps {
  requestId: string;
  opinionSubmissionId: string;
  onSave?: (versionId: string) => void;
  onPublish?: (versionId: string) => void;
}

export default function OpinionEditor({
  requestId,
  opinionSubmissionId,
  onSave,
  onPublish,
}: OpinionEditorProps) {
  const { data: session } = useSession();
  const [sections, setSections] = useState<OpinionSections>({
    facts: '',
    issues: '',
    analysis: '',
    conclusion: '',
    references: '',
  });

  const [currentVersion, setCurrentVersion] = useState<OpinionVersion | null>(null);
  const [versions, setVersions] = useState<OpinionVersion[]>([]);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [activeSection, setActiveSection] = useState<keyof OpinionSections>('facts');

  // Load existing autosave or latest version
  useEffect(() => {
    const loadOpinion = async () => {      // Try loading autosave first
      const { data: autosave } = (await __getSupabaseClient()).from('opinion_autosaves')
        .select('content_sections')
        .eq('opinion_submission_id', opinionSubmissionId)
        .eq('lawyer_id', session?.user?.id)
        .single();

      if (autosave) {
        setSections(autosave.content_sections as OpinionSections);
        setLastSaved(new Date());
        return;
      }

      // Load latest version
      const { data: latestVersion } = (await __getSupabaseClient()).from('opinion_versions')
        .select('*')
        .eq('opinion_submission_id', opinionSubmissionId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      if (latestVersion) {
        setCurrentVersion(latestVersion);
        setSections(latestVersion.content_sections as OpinionSections);
        setIsLocked(latestVersion.is_locked);
      }
    };

    loadOpinion();
  }, [opinionSubmissionId]);

  // Load all versions for version history
  useEffect(() => {
    const loadVersions = async () => {
      const { data } = (await __getSupabaseClient()).from('opinion_versions')
        .select('id, version_number, status, created_at, is_locked')
        .eq('opinion_submission_id', opinionSubmissionId)
        .order('version_number', { ascending: false });

      if (data) setVersions(data as OpinionVersion[]);
    };

    loadVersions();
  }, [opinionSubmissionId]);

  // Autosave function
  const autosave = useCallback(async () => {
    if (isLocked) return; // Don't autosave locked versions

    setIsAutosaving(true);

    const user = session?.user;
    if (!user) return;

    const { error } = (await __getSupabaseClient()).from('opinion_autosaves').upsert(
      {
        opinion_submission_id: opinionSubmissionId,
        lawyer_id: user.id,
        content_sections: sections,
      },
      {
        onConflict: 'opinion_submission_id,lawyer_id',
      }
    );

    if (!error) {
      setLastSaved(new Date());
    }

    setIsAutosaving(false);
  }, [sections, opinionSubmissionId, isLocked]);

  // Autosave every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      autosave();
    }, 30000); // 30 seconds

    return () => clearInterval(timer);
  }, [autosave]);

  // Update section content
  const updateSection = (section: keyof OpinionSections, content: string) => {
    if (isLocked) return;

    setSections((prev) => ({
      ...prev,
      [section]: content,
    }));
  };

  // Save as new version (manual save)
  const saveVersion = async () => {
    if (isLocked) return;

    const user = session?.user;
    if (!user) return;

    // Get next version number
    const nextVersionNumber = (currentVersion?.version_number || 0) + 1;

    const { data, error } = (await __getSupabaseClient()).from('opinion_versions')
      .insert({
        opinion_submission_id: opinionSubmissionId,
        request_id: requestId,
        version_number: nextVersionNumber,
        content_sections: sections,
        created_by: user.id,
        status: 'draft',
      })
      .select()
      .single();

    if (!error && data) {
      setCurrentVersion(data as OpinionVersion);

      // Delete autosave after creating version
      (await __getSupabaseClient()).from('opinion_autosaves')
        .delete()
        .eq('opinion_submission_id', opinionSubmissionId)
        .eq('lawyer_id', user.id);

      if (onSave) onSave(data.id);
    }
  };

  // Publish version (mark as ready for peer review or signature)
  const publishVersion = async () => {
    if (!currentVersion || isLocked) return;

    // Validate all sections complete
    const allComplete = Object.values(sections).every((s) => s.trim().length > 0);
    if (!allComplete) {
      alert('All sections must be completed before publishing');
      return;
    }

    const { error } = (await __getSupabaseClient()).from('opinion_versions')
      .update({ status: 'approved' })
      .eq('id', currentVersion.id);

    if (!error) {
      setCurrentVersion((prev) => (prev ? { ...prev, status: 'approved' } : null));
      if (onPublish) onPublish(currentVersion.id);
    }
  };

  // Load specific version
  const loadVersion = async (versionId: string) => {
    const { data } = (await __getSupabaseClient()).from('opinion_versions')
      .select('*')
      .eq('id', versionId)
      .single();

    if (data) {
      setCurrentVersion(data as OpinionVersion);
      setSections(data.content_sections as OpinionSections);
      setIsLocked(data.is_locked);
    }
  };

  const sectionLabels: Record<keyof OpinionSections, string> = {
    facts: 'Statement of Facts',
    issues: 'Legal Issues',
    analysis: 'Legal Analysis',
    conclusion: 'Conclusion & Recommendation',
    references: 'Legal References & Citations',
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Main Editor */}
      <div className="col-span-9">
        <Card>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Legal Opinion Editor</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  {currentVersion && (
                    <span className="font-medium">Version {currentVersion.version_number}</span>
                  )}
                  {
                    lastSaved && <span>Last saved: {lastSaved.toLocaleTimeString()}</span>}
                  {
                    isAutosaving && (
                      <span className="text-blue-600 flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        Autosaving...
                      </span>
                    )}
                  {
                    isLocked && (
                      <span className="text-red-600 font-semibold">🔒 Locked (Signed)</span>
                    )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={saveVersion}
                  disabled={isLocked}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Version
                </button>
                <button
                  onClick={publishVersion}
                  disabled={isLocked || !currentVersion}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Publish for Review
                </button>
              </div>
            </div>

            {/* Section Tabs */}
            <div className="flex gap-2 border-b mb-6">
              {(Object.keys(sectionLabels) as Array<keyof OpinionSections>).map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`px-4 py-2 font-medium transition-colors ${activeSection === section
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {sectionLabels[section]}
                  {
                    sections[section] && <span className="ml-2 text-green-600">✓</span>}
                </button>
              ))}
            </div>

            {/* Active Section Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {sectionLabels[activeSection]}
              </label>
              <textarea
                value={sections[activeSection]}
                onChange={(e) => updateSection(activeSection, e.target.value)}
                disabled={isLocked}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-sm"
                placeholder={`Enter ${sectionLabels[activeSection].toLowerCase()}...`}
              />
              <p className="mt-2 text-sm text-gray-500">
                {sections[activeSection].length} characters
              </p>
            </div>

            {isLocked && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 font-medium">
                  ⚠️ This version is locked and cannot be edited. Create a new version to make
                  changes.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Version History Sidebar */}
      <div className="col-span-3">
        <Card>
          <div className="p-4">
            <h3 className="font-bold text-lg mb-4">Version History</h3>

            <div className="space-y-2">
              {versions.map((version) => (
                <button
                  key={version.id}
                  onClick={() => loadVersion(version.id)}
                  className={`w-full text-left p-3 rounded border transition-colors ${currentVersion?.id === version.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">v{version.version_number}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${version.status === 'signed'
                          ? 'bg-green-100 text-green-800'
                          : version.status === 'approved'
                            ? 'bg-blue-100 text-blue-800'
                            : version.status === 'peer_review'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {version.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(version.created_at).toLocaleDateString()}
                  </p>
                  {version.is_locked && <p className="text-xs text-red-600 mt-1">🔒 Locked</p>}
                </button>
              ))}

              {
                versions.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No versions yet</p>
                )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


// Auto-injected to fix missing supabase client declarations
const __getSupabaseClient = async () => {
  if (typeof window === 'undefined') {
    const m = await import('@/lib/supabase/server');
    return await m.createClient();
  } else {
    const m = await import('@/lib/supabase/client');
    return m.createClient();
  }
};
