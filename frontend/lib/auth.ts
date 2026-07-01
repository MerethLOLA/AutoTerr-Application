import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';

async function laravelLogin(credentials: Record<string, string>) {
  const apiUrl = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
  try {
    const res = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(credentials),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    const { token, user } = json.data ?? json;
    if (!token || !user) return null;
    return { token, ...user, id: String(user.id) };
  } catch {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'employee',
      name: 'Employé',
      credentials: {
        username: { label: 'Identifiant', type: 'text' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) return null;
        return laravelLogin({ username: credentials.username, password: credentials.password });
      },
    }),
    CredentialsProvider({
      id: 'client',
      name: 'Client',
      credentials: {
        email:    { label: 'Email',         type: 'email'    },
        password: { label: 'Mot de passe',  type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        return laravelLogin({ email: credentials.email, password: credentials.password });
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken      = (user as any).token;
        token.role             = (user as any).role;
        token.username         = (user as any).username;
        token.userId           = (user as any).id;
        token.profilePhotoUrl  = (user as any).profile_photo_url ?? null;
        token.name             = (user as any).name ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).token                   = token.accessToken;
      (session.user as any).id                 = token.userId;
      (session.user as any).role               = token.role;
      (session.user as any).username           = token.username;
      (session.user as any).profile_photo_url  = token.profilePhotoUrl ?? null;
      if (token.name) (session.user as any).name = token.name;
      return session;
    },
  },

  pages: {
    signIn: '/login/employee',
    error:  '/login/employee',
  },

  secret: process.env.NEXTAUTH_SECRET,
};
