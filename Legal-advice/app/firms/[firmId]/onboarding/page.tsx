'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/shared/Card';
import FileUpload from '@/components/shared/FileUpload';
import { Loader2, CheckCircle, Upload, Users, Shield, ArrowRight, X, Mail } from 'lucide-react';
import { toast } from 'sonner';

const supabase = createClient();

export default function FirmOnboardingPage() {const params = useParams();
  const router = useRouter();
    const firmId = params.firmId as string;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [firm, setFirm] = useState<any>(null);
  const [invites, setInvites] = useState<any[]>([]);

  // Invite Form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('lawyer');
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {const fetchFirm = async () => {if (!firmId) return;
      const { data, error } = await supabase.from('firms').select('*').eq('id', firmId).single();

      if (error) {
        toast.error('Could not load firm details');
        return;
      }
      setFirm(data);
      setLoading(false);
    };
    fetchFirm();
  }, [firmId, supabase]);

  const handleDocsUploaded = async (files: any[]) => {
    // Update firm verification_documents
    const currentDocs = (firm.verification_documents as any[]) || [];
    const newDocs = files.map((f) => ({ name: f.name, url: f.url, path: f.path }));
    const updatedDocs = [...currentDocs, ...newDocs];

    const { error } = await supabase
      .from('firms')
      .update({ verification_documents: updatedDocs })
      .eq('id', firmId);

    if (error) {
      toast.error('Failed to save documents');
    } else {
      toast.success('Documents saved successfully');
      // Update local state
      setFirm({ ...firm, verification_documents: updatedDocs });
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingInvite(true);

    try {
      const res = await fetch(`/api/v1/firms/${firmId}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          full_name: inviteName,
          role: inviteRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Invite sent to ${inviteEmail}`);
      setInvites([
        ...invites,
        { email: inviteEmail, name: inviteName, role: inviteRole, status: 'invited' },
      ]);
      setInviteEmail('');
      setInviteName('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSendingInvite(false);
    }
  };

  const completeOnboarding = () => {
    toast.success('Onboarding complete! Your account is pending verification.');
    // Redirect to dashboard or status page
    // For now, reload or stay (demo)
    // router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to {firm.name}</h1>
          <p className="text-slate-600">
            Complete these steps to verify your firm and start accepting requests.
          </p>
        </header>

        <div className="grid md:grid-cols-[250px_1fr] gap-8">
          {/* Sidebar Steps */}
          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg flex items-start gap-3 transition-colors ${step === 1 ? 'bg-white shadow-sm border border-slate-200' : 'text-slate-500'}`}
            >
              <div
                className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step > 1 ? 'bg-green-100 text-green-700' : step === 1 ? 'bg-primary text-white' : 'bg-slate-200'}`}
              >
                {step > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
              </div>
              <div>
                <h3 className={`font-medium ${step === 1 ? 'text-slate-900' : ''}`}>
                  Verification
                </h3>
                <p className="text-xs mt-1">Upload business registration documents.</p>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg flex items-start gap-3 transition-colors ${step === 2 ? 'bg-white shadow-sm border border-slate-200' : 'text-slate-500'}`}
            >
              <div
                className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step > 2 ? 'bg-green-100 text-green-700' : step === 2 ? 'bg-primary text-white' : 'bg-slate-200'}`}
              >
                {step > 2 ? <CheckCircle className="w-4 h-4" /> : '2'}
              </div>
              <div>
                <h3 className={`font-medium ${step === 2 ? 'text-slate-900' : ''}`}>
                  Team Members
                </h3>
                <p className="text-xs mt-1">Invite lawyers to your firm.</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {step === 1 && (
              <Card className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-primary">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Verify Your Firm</h2>
                    <p className="text-sm text-slate-500">
                      Upload official documents to verify your business identity.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg text-sm">
                    Required: Business Registration Certificate, Tax ID Proof, or Bar Council
                    Registration of Owner.
                  </div>

                  <FileUpload
                    bucketName="documents"
                    folder={`verification/${firmId}`}
                    acceptedTypes={['application/pdf', 'image/jpeg', 'image/png']}
                    onUploadComplete={handleDocsUploaded}
                    className="w-full"
                  />

                  <div className="border-t pt-6 flex justify-end">
                    <button
                      onClick={() => setStep(2)}
                      className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                    >
                      Continue to Team Invites
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {
  step === 2 && (
              <Card className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Invite Team Members</h2>
                    <p className="text-sm text-slate-500">
                      Add lawyers and admins to your firm workspace.
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <form
                    onSubmit={handleSendInvite}
                    className="bg-slate-50 p-4 rounded-xl border border-slate-200"
                  >
                    <h3 className="font-medium text-slate-900 mb-3 text-sm">Send Invite</h3>
                    <div className="grid md:grid-cols-[1fr_1fr_140px] gap-3">
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="rounded-lg border-slate-200 text-sm"
                        required
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        className="rounded-lg border-slate-200 text-sm"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                      {/* Role Selection could go here but hardcoded to lawyer mostly */}
                      <button
                        type="submit"
                        disabled={sendingInvite}
                        className="bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
                      >
                        {sendingInvite ? 'Sending...' : 'Send Invite'}
                      </button>
                    </div>
                  </form>

                  <div>
                    <h3 className="font-medium text-slate-900 mb-3 text-sm">Invited Members</h3>
                    {invites.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-lg">
                        No invitations sent yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {invites.map((invite, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                <Mail className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900">{invite.name}</p>
                                <p className="text-xs text-slate-500">{invite.email}</p>
                              </div>
                            </div>
                            <span className="text-xs font-medium bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                              Invited
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-6 flex justify-between">
                    <button
                      onClick={() => setStep(1)}
                      className="text-slate-500 hover:text-slate-900 text-sm font-medium"
                    >
                      Back
                    </button>
                    <button
                      onClick={completeOnboarding}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                    >
                      Complete Setup
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
