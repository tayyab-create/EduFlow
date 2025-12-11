'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Seeded Super Admin (created on server startup)
const SEEDED_SUPER_ADMIN = {
    email: 'super@eduflow.pk',
    password: 'AdminPass123!',
};

// Demo accounts for quick testing (login only - created by admins)
const DEMO_ACCOUNTS = [
    { role: 'super_admin', email: SEEDED_SUPER_ADMIN.email, password: SEEDED_SUPER_ADMIN.password, label: 'Super Admin', color: 'bg-purple-600', icon: '👑', seeded: true },
    { role: 'org_admin', email: 'org@eduflow.pk', password: 'password123', label: 'Org Admin', color: 'bg-violet-600', icon: '🏢', seeded: false },
    { role: 'school_admin', email: 'school@eduflow.pk', password: 'password123', label: 'School Admin', color: 'bg-blue-600', icon: '🏫', seeded: false },
    { role: 'principal', email: 'principal@eduflow.pk', password: 'password123', label: 'Principal', color: 'bg-orange-600', icon: '👔', seeded: false },
    { role: 'teacher', email: 'teacher@eduflow.pk', password: 'password123', label: 'Teacher', color: 'bg-green-600', icon: '👨‍🏫', seeded: false },
];

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingRole, setLoadingRole] = useState<string | null>(null);

    const handleLogin = async (loginEmail: string, loginPassword: string) => {
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                const tokens = data.data?.tokens || data.tokens;
                const user = data.data?.user || data.user;
                localStorage.setItem('accessToken', tokens.accessToken);
                localStorage.setItem('refreshToken', tokens.refreshToken);
                localStorage.setItem('user', JSON.stringify(user));
                router.push('/dashboard');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setIsLoading(false);
            setLoadingRole(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleLogin(email, password);
    };

    const handleDemoLogin = async (account: typeof DEMO_ACCOUNTS[0]) => {
        setLoadingRole(account.role);
        setError('');

        try {
            // Try to login with account-specific password
            const loginRes = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: account.email, password: account.password }),
            });

            if (loginRes.ok) {
                const response = await loginRes.json();
                const tokens = response.data?.tokens || response.tokens;
                const user = response.data?.user || response.user;
                localStorage.setItem('accessToken', tokens.accessToken);
                localStorage.setItem('refreshToken', tokens.refreshToken);
                localStorage.setItem('user', JSON.stringify(user));
                router.push('/dashboard');
                return;
            }

            // Login failed
            if (account.seeded) {
                // Super Admin is seeded - should always exist
                setError('Login failed. Check server is running.');
            } else {
                // Other accounts need to be created by Super Admin
                setError(`${account.label} account not created. Login as Super Admin first to create users.`);
            }
        } catch (err) {
            console.error('Demo login error:', err);
            setError('Failed to connect to server');
        } finally {
            setLoadingRole(null);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
            <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-6">
                {/* Login Form */}
                <Card className="shadow-xl">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-2xl">E</span>
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            EduFlow
                        </CardTitle>
                        <CardDescription className="text-gray-500">
                            School Management System
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@school.edu.pk"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </Button>

                            <p className="text-center text-sm text-gray-500 mt-4">
                                Don&apos;t have an account?{' '}
                                <a href="/register" className="text-indigo-600 hover:underline font-medium">
                                    Register
                                </a>
                            </p>
                        </form>
                    </CardContent>
                </Card>

                {/* Demo Quick Login */}
                <Card className="shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-lg">🚀 Quick Demo Login</CardTitle>
                        <CardDescription>
                            Click any role to instantly login with a demo account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {DEMO_ACCOUNTS.map((account) => (
                            <button
                                key={account.role}
                                onClick={() => handleDemoLogin(account)}
                                disabled={loadingRole !== null}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition hover:shadow-md ${loadingRole === account.role
                                    ? 'border-indigo-400 bg-indigo-50'
                                    : 'border-gray-200 hover:border-indigo-300'
                                    }`}
                            >
                                <div className={`w-10 h-10 ${account.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                                    {account.icon}
                                </div>
                                <div className="text-left flex-1">
                                    <p className="font-semibold text-gray-900">{account.label}</p>
                                    <p className="text-xs text-gray-500">{account.email}</p>
                                </div>
                                {loadingRole === account.role && (
                                    <span className="text-sm text-indigo-600">Loading...</span>
                                )}
                            </button>
                        ))}

                        <div className="pt-3 border-t mt-4">
                            <p className="text-xs text-gray-400 text-center">
                                Super Admin is seeded on first run.<br />
                                Password: <code className="bg-gray-100 px-1 rounded">AdminPass123!</code>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
