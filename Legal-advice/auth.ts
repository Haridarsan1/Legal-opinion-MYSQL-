import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await prisma.profiles.findUnique({ where: { email } });

                    if (!user || (!user.password && password !== 'temp123')) return null;

                    // Temporary bypass for legacy users migrating without passwords
                    const passwordsMatch = user.password
                        ? await bcrypt.compare(password, user.password)
                        : password === 'temp123'; // basic hook for users matching imported PG db

                    if (passwordsMatch) return { id: user.id, email: user.email, name: user.full_name, role: user.role };
                }
                return null;
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
            }
            return session;
        }
    }
});
