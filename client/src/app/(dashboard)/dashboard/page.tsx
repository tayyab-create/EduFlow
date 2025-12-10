'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">E</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">EduFlow</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            Welcome, <strong>{user.firstName} {user.lastName}</strong>
                        </span>
                        <Button variant="outline" onClick={handleLogout}>
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                    <p className="text-gray-600 mt-1">Welcome to EduFlow School Management System</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="border-l-4 border-l-indigo-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-gray-900">--</p>
                            <p className="text-xs text-gray-500 mt-1">Connect database to see stats</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Teachers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-gray-900">--</p>
                            <p className="text-xs text-gray-500 mt-1">Connect database to see stats</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-yellow-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Classes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-gray-900">--</p>
                            <p className="text-xs text-gray-500 mt-1">Connect database to see stats</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Attendance Today</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-gray-900">--</p>
                            <p className="text-xs text-gray-500 mt-1">Connect database to see stats</p>
                        </CardContent>
                    </Card>
                </div>

                {/* User Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Email:</span>
                                <p className="font-medium">{user.email}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Role:</span>
                                <p className="font-medium capitalize">{user.role.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Name:</span>
                                <p className="font-medium">{user.firstName} {user.lastName}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">User ID:</span>
                                <p className="font-medium text-xs font-mono">{user.id}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Backend Status */}
                <Card className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-indigo-900">
                                Backend API Connected - Login successful!
                            </span>
                        </div>
                        <p className="text-xs text-indigo-700 mt-2">
                            Auth module is working. Start the PostgreSQL database to persist data.
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
