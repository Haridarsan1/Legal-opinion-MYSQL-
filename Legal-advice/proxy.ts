import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define protected role routes
  const protectedRoles = ['client', 'lawyer', 'firm', 'bank', 'admin'];
  const firstPathSegment = request.nextUrl.pathname.split('/').filter(Boolean)[0];

  // Redirect unauthenticated users trying to access protected role routes
  if (!user && protectedRoles.includes(firstPathSegment)) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Allow authenticated users to access login/signup pages (no redirect)

  // Role-based access control
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile) {
      const path = request.nextUrl.pathname;
      const role = profile.role;

      // List of valid role routes
      const validRoles = ['client', 'lawyer', 'firm', 'bank', 'admin'];

      // Check if user is trying to access a different role's dashboard
      const pathSegments = path.split('/').filter(Boolean);
      const roleFromPath = pathSegments[0]; // /{role}/...

      if (validRoles.includes(roleFromPath) && roleFromPath !== role && role !== 'admin') {
        // Admins can access all dashboards, others only their own
        return NextResponse.redirect(new URL(`/${role}`, request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
