import { NextResponse, type NextRequest } from 'next/server';
import { auth } from './auth';

export async function proxy(request: NextRequest) {
  const session = await auth();
  const user = session?.user;

  // Define protected role routes
  const protectedRoles = ['client', 'lawyer', 'firm', 'bank', 'admin'];
  const firstPathSegment = request.nextUrl.pathname.split('/').filter(Boolean)[0];

  // Redirect unauthenticated users trying to access protected role routes
  if (!user && protectedRoles.includes(firstPathSegment)) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Role-based access control
  if (user) {
    const role = (user as any).role;
    if (role) {
      const path = request.nextUrl.pathname;
      const validRoles = ['client', 'lawyer', 'firm', 'bank', 'admin'];
      const pathSegments = path.split('/').filter(Boolean);
      const roleFromPath = pathSegments[0];

      if (validRoles.includes(roleFromPath) && roleFromPath !== role && role !== 'admin') {
        return NextResponse.redirect(new URL(`/${role}`, request.url));
      }
    }
  }

  return NextResponse.next({ request: { headers: request.headers } });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
