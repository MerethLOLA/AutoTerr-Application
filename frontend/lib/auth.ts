import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';

const apiUrl = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '/api';

/**
 * Connexion en deux temps quand la 2FA est activée : un premier appel avec
 * identifiant/mot de passe renvoie `two_factor_required` (sans jeton) au lieu
 * d'échouer. Comme `authorize()` de NextAuth ne peut renvoyer qu'un
 * utilisateur ou null, on relaie ce cas via une exception dont le message
 * (`TWO_FACTOR_REQUIRED:<userId>`) remonte tel quel dans `result.error` côté
 * client (redirect:false), pour que la page de connexion bascule vers la
 * saisie du code sans jamais reproposer mot de passe + code en une seule requête.
 */
async function laravelLogin(credentials: Record<string, string>) {
  const { twoFactorCode, twoFactorUserId, ...creds } = credentials;

  try {
    if (twoFactorCode && twoFactorUserId) {
      const res = await fetch(`${apiUrl}/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ user_id: twoFactorUserId, code: twoFactorCode }),
        cache: 'no-store',
      });
      if (!res.ok) return null;
      const json = await res.json();
      const { token, user } = json.data ?? json;
      if (!token || !user) return null;
      return { token, ...user, id: String(user.id) };
    }

    const res = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(creds),
      cache: 'no-store',
    });
    // Le backend Render s'endort après inactivité et peut mettre 30-50s à répondre
    // au premier appel ; des clics répétés pendant ce délai déclenchent facilement
    // la limite anti-spam (429), qui sans ce cas dédié ressortait comme un banal
    // "identifiants incorrects" — trompeur puisque le mot de passe peut être bon.
    if (res.status === 429) {
      throw new Error('TOO_MANY_ATTEMPTS');
    }
    if (!res.ok) return null;
    const json = await res.json();
    const data = json.data ?? json;
    if (data.two_factor_required) {
      throw new Error(`TWO_FACTOR_REQUIRED:${data.user_id}`);
    }
    const { token, user } = data;
    if (!token || !user) return null;
    return { token, ...user, id: String(user.id) };
  } catch (err) {
    if (err instanceof Error && (err.message.startsWith('TWO_FACTOR_REQUIRED:') || err.message === 'TOO_MANY_ATTEMPTS')) throw err;
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
        twoFactorCode:   { label: 'Code', type: 'text' },
        twoFactorUserId: { label: 'UserId', type: 'text' },
      },
      async authorize(credentials) {
        if (credentials?.twoFactorCode && credentials.twoFactorUserId) {
          return laravelLogin({ twoFactorCode: credentials.twoFactorCode, twoFactorUserId: credentials.twoFactorUserId });
        }
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
        twoFactorCode:   { label: 'Code', type: 'text' },
        twoFactorUserId: { label: 'UserId', type: 'text' },
      },
      async authorize(credentials) {
        if (credentials?.twoFactorCode && credentials.twoFactorUserId) {
          return laravelLogin({ twoFactorCode: credentials.twoFactorCode, twoFactorUserId: credentials.twoFactorUserId });
        }
        if (!credentials?.email || !credentials.password) return null;
        return laravelLogin({ email: credentials.email, password: credentials.password });
      },
    }),
  ],

  session: { strategy: 'jwt' },
  // 'trustHost' is not part of NextAuth TypeScript typings in used version.
  // Set it conditionally below when the env var is present to avoid TS error.

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.accessToken      = (user as any).token;
        token.role             = (user as any).role;
        token.username         = (user as any).username;
        token.userId           = (user as any).id;
        token.profilePhotoUrl  = (user as any).profile_photo_url ?? null;
        token.name             = (user as any).name ?? null;
      }
      // Déclenché par un appel client à `update(...)` (ex: après changement de
      // photo/profil dans les paramètres) — sans ça le JWT garde les valeurs de
      // la connexion initiale jusqu'à la prochaine authentification.
      if (trigger === 'update' && session) {
        if ('profile_photo_url' in session) token.profilePhotoUrl = session.profile_photo_url ?? null;
        if ('name' in session) token.name = session.name ?? null;
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

// Some deployments require NextAuth to trust the host header (NEXTAUTH_TRUST_HOST=true).
// The `trustHost` option isn't declared in the library's AuthOptions type, so
// assign it dynamically to avoid TypeScript errors while keeping runtime behavior.
if (process.env.NEXTAUTH_TRUST_HOST === 'true') {
  (authOptions as any).trustHost = true;
}
