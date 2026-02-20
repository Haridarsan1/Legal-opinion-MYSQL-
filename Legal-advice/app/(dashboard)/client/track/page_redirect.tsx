import { redirect } from 'next/navigation';

export default function ClientTrackRedirect() {
  redirect('/client/requests');
}
