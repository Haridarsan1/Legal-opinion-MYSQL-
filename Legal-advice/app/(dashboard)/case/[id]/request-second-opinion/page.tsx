'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LawyerDirectory, { DirectoryLawyer } from '@/components/lawyer/LawyerDirectory';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  createSecondOpinionRequest,
  getLawyersForSecondOpinion,
} from '@/app/actions/lawyer-workspace';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Send, FileText, Lock, User, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import LegalOpinionEditor from '../components/LegalOpinionEditor';
import Image from 'next/image';

export default function RequestSecondOpinionPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [opinion, setOpinion] = useState<any>(null);
  const [activeVersion, setActiveVersion] = useState<any>(null);
  const [lawyers, setLawyers] = useState<DirectoryLawyer[]>([]);
  const [fetchingLawyers, setFetchingLawyers] = useState(true);

  // Form State
  const [step, setStep] = useState<'select' | 'review'>('select');
  const [selectedLawyer, setSelectedLawyer] = useState<DirectoryLawyer | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOpinion();
    fetchLawyers();
  }, [requestId]);

  const fetchOpinion = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_opinions')
        .select(
          `
                    *,
                    versions:opinion_versions(*)
                `
        )
        .eq('request_id', requestId)
        .single();

      if (data) {
        setOpinion(data);
        // Get latest version
        const versions =
          data.versions?.sort((a: any, b: any) => b.version_number - a.version_number) || [];
        setActiveVersion(versions[0]);
      }
    } catch (error) {
      console.error('Error fetching opinion:', error);
      toast.error('Failed to load opinion draft');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLawyers = async () => {
    try {
      const result = await getLawyersForSecondOpinion('');
      if (result.success && result.data) {
        // Map to DirectoryLawyer format and add mock data for visual completeness
        const mappedLawyers: DirectoryLawyer[] = result.data.map((l) => ({
          ...l,
          title: 'Legal Expert',
          location: l.city || 'Consultant',
          rating: 4.8, // Mock
          reviews_count: Math.floor(Math.random() * 50), // Mock
          availability_status: 'Available', // Mock
          bio: l.about || 'Experienced legal professional specializing in corporate and civil law.',
        }));
        setLawyers(mappedLawyers);
      }
    } catch (error) {
      console.error('Error fetching lawyers:', error);
    } finally {
      setFetchingLawyers(false);
    }
  };

  const handleLawyerSelect = (lawyer: DirectoryLawyer) => {
    setSelectedLawyer(lawyer);
    setStep('review');
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!selectedLawyer) return;

    setIsSubmitting(true);
    try {
      const result = await createSecondOpinionRequest(requestId, selectedLawyer.id, note);
      if (result.success) {
        toast.success('Second opinion request sent successfully');
        router.push(`/case/${requestId}`);
      } else {
        toast.error(result.error || 'Failed to send request');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // STEP 1: SELECT LAWYER
  if (step === 'select') {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/case/${requestId}/opinion`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Request Second Opinion</h1>
              <p className="text-sm text-slate-500">Step 1: Select a Lawyer</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {fetchingLawyers ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <LawyerDirectory
              lawyers={lawyers}
              mode="select"
              onSelect={handleLawyerSelect}
              className="h-full"
            />
          )}
        </div>
      </div>
    );
  }

  // STEP 2: REVIEW & SEND
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          onClick={() => setStep('select')}
          className="pl-0 hover:bg-transparent hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Selection
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finalize Request</h1>
          <p className="text-slate-500">
            Add instructions and send request to {selectedLawyer?.full_name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Review Form */}
        <div className="lg:col-span-1 space-y-6">
          {/* Selected Lawyer Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base text-primary">Selected Reviewer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {selectedLawyer?.avatar_url ? (
                  <Image
                    src={selectedLawyer.avatar_url}
                    alt={selectedLawyer.full_name}
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-primary-200 border-2 border-white shadow-sm">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{selectedLawyer?.full_name}</h3>
                  <p className="text-sm text-slate-600 truncate">{selectedLawyer?.title}</p>
                  <Button
                    variant="link"
                    className="px-0 h-auto text-primary text-xs"
                    onClick={() => setStep('select')}
                  >
                    Change Lawyer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
              <CardDescription>
                Add a note for {selectedLawyer?.full_name?.split(' ')[0]}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Message / Details</Label>
                <Textarea
                  placeholder="E.g., Please review the specific claims regarding liability..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="bg-amber-50 p-4 rounded-lg flex gap-3 text-amber-800 text-sm border border-amber-100">
                <Lock className="w-5 h-5 shrink-0 text-amber-600" />
                <p>
                  Granting access will allow the selected lawyer to view the{' '}
                  <strong>full case details</strong> and your <strong>current draft</strong>.
                </p>
              </div>

              <Button className="w-full" size="lg" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Request
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Draft Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-500" />
                <CardTitle className="text-base">Draft Preview</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 min-h-[600px] bg-slate-50">
              {activeVersion?.pdf_url ? (
                <iframe
                  src={`${activeVersion.pdf_url}#toolbar=0`}
                  className="w-full h-full min-h-[600px] border-none"
                  title="Legal Opinion PDF"
                />
              ) : (
                <div className="p-6">
                  <LegalOpinionEditor
                    initialContent={activeVersion?.content}
                    readOnly={true}
                    onSave={() => {}}
                    onSend={() => {}}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
