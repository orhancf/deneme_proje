import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        }
    }
    interface User {
        role?: string;
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email (e.g. admin@scct.dev)", type: "email" },
                password: { label: "Password (any)", type: "password" }
            },
            async authorize(credentials) {
                const email = credentials?.email as string;
                // Mock users based on our db/seed/003_app_schema.sql
                if (email === "admin@scct.dev") {
                    return { id: "a0000000-0000-0000-0000-000000000001", name: "Admin User", email, role: "ADMIN" };
                }
                if (email === "director@scct.dev") {
                    return { id: "a0000000-0000-0000-0000-000000000002", name: "SC Director", email, role: "EXEC" };
                }
                if (email === "analyst@scct.dev") {
                    return { id: "a0000000-0000-0000-0000-000000000003", name: "Analyst User", email, role: "ANALYST" };
                }
                if (email === "viewer@scct.dev") {
                    return { id: "a0000000-0000-0000-0000-000000000004", name: "Viewer User", email, role: "VIEWER" };
                }
                return null;
            }
        })
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
            }
            return session;
        }
    },
    events: {
        async signIn({ user }) {
            try {
                const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                await fetch(`${API_BASE}/api/audit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Id': user?.id || '',
                        'X-User-Role': user?.role || ''
                    },
                    body: JSON.stringify({
                        action: 'LOGIN',
                        resource: 'Application',
                        details: { email: user?.email, name: user?.name }
                    })
                });
            } catch (error) {
                console.error('Failed to log signIn event:', error);
            }
        },
        async signOut(message: any) {
            try {
                const token = message?.token;
                const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                await fetch(`${API_BASE}/api/audit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Id': (token?.id as string) || '',
                        'X-User-Role': (token?.role as string) || ''
                    },
                    body: JSON.stringify({
                        action: 'LOGOUT',
                        resource: 'Application',
                        details: {}
                    })
                });
            } catch (error) {
                console.error('Failed to log signOut event:', error);
            }
        },
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.AUTH_SECRET || "scct-secret-key-for-development-use-only",
});

