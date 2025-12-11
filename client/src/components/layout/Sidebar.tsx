'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    schoolId?: string;
}

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['all'] },
    { href: '/students', label: 'Students', icon: '🎓', roles: ['super_admin', 'org_admin', 'school_admin', 'principal', 'teacher'] },
    { href: '/schools', label: 'Schools', icon: '🏫', roles: ['super_admin', 'org_admin', 'school_admin'] },
    { href: '/organizations', label: 'Organizations', icon: '🏢', roles: ['super_admin', 'org_admin'] },
    { href: '/users', label: 'Users', icon: '👥', roles: ['super_admin', 'org_admin', 'school_admin'] },
];

const roleColors: Record<string, string> = {
    super_admin: 'bg-purple-600',
    org_admin: 'bg-violet-600',
    school_admin: 'bg-blue-600',
    principal: 'bg-orange-600',
    teacher: 'bg-green-600',
    accountant: 'bg-amber-600',
    parent: 'bg-pink-600',
    student: 'bg-cyan-600',
};

const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    org_admin: 'Org Admin',
    school_admin: 'School Admin',
    principal: 'Principal',
    teacher: 'Teacher',
    accountant: 'Accountant',
    parent: 'Parent',
    student: 'Student',
};

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const filteredNavItems = navItems.filter((item) => {
        if (item.roles.includes('all')) return true;
        if (!user) return false;
        return item.roles.includes(user.role);
    });

    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
            {/* Logo */}
            <div className="p-4 border-b">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">E</span>
                    </div>
                    <span className="font-bold text-xl text-gray-900">EduFlow</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {filteredNavItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${isActive
                                ? 'bg-indigo-50 text-indigo-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Info */}
            {user && (
                <div className="p-4 border-t">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 ${roleColors[user.role] || 'bg-gray-600'} rounded-full flex items-center justify-center`}>
                            <span className="text-white font-bold">
                                {user.firstName[0]}{user.lastName[0]}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                                {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{roleLabels[user.role] || user.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition text-left"
                    >
                        🚪 Logout
                    </button>
                </div>
            )}
        </aside>
    );
}
