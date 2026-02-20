import { Suspense } from 'react';
import { getIncomingReviewRequests } from '@/app/actions/lawyer-workspace';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, FileText, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function ReviewsPage() {
  const { data: requests, error, success } = await getIncomingReviewRequests();

  if (!success) {
    return <div className="p-8 text-center text-red-500">Error loading reviews: {error}</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reviews & Approvals</h1>
          <p className="text-slate-500 mt-2">Manage internal review requests and peer reviews</p>
        </div>
      </div>

      {requests && requests.length === 0 ? (
        <Card className="bg-slate-50 border-dashed">
          <CardContent className="py-12 text-center text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-slate-900">No Pending Reviews</h3>
            <p>You don't have any incoming requests for internal reviews.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests?.map((req: any) => (
            <Card key={req.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          req.status === 'pending'
                            ? 'outline'
                            : req.status === 'completed'
                              ? 'secondary'
                              : 'default'
                        }
                        className={
                          req.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : req.status === 'completed'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : ''
                        }
                      >
                        {req.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Requested {format(new Date(req.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {req.request.title}
                      </h3>
                      <p className="text-slate-600 line-clamp-2">{req.reviewer_notes}</p>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={req.requester.avatar_url} />
                          <AvatarFallback>
                            <User className="w-3 h-3" />
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          From:{' '}
                          <span className="font-medium text-slate-700">
                            {req.requester.full_name}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Due: {format(new Date(req.request.due_date), 'MMM d')}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button asChild>
                      <Button asChild>
                        <Link href={`/lawyer/review/${req.original_request_id}`}>
                          Review Case <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
