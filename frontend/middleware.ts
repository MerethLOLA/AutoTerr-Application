import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const EMPLOYEE_PATHS = [
  '/dashboard', '/voitures', '/clients', '/ventes', '/locations',
  '/facturations', '/paiements', '/employes', '/stock', '/fournisseurs',
  '/atelier', '/sav', '/planning', '/entretiens', '/garanties',
  '/assurances', '/controles-techniques', '/sinistres', '/carburant',
  '/alertes', '/reporting', '/documents', '/demandes', '/settings',
];

const CLIENT_PATHS = ['/espace-client'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // NextAuth JWT cookie (HTTP → next-auth.session-token, HTTPS → __Secure-next-auth.session-token)
  const hasAuth =
    !!request.cookies.get('next-auth.session-token')?.value ||
    !!request.cookies.get('__Secure-next-auth.session-token')?.value;

  if (!hasAuth) {
    if (EMPLOYEE_PATHS.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/login/employee', request.url));
    }
    if (CLIENT_PATHS.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/login/client', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};
