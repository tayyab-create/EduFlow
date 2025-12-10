'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    schoolId?: string;
}

const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    org_admin: 'Organization Admin',
    school_admin: 'School Admin',
    principal: 'Principal',
    teacher: 'Teacher',
    accountant: 'Accountant',
    parent: 'Parent',
    student: 'Student',
};

const roleColors: Record<string, string> = {
    super_admin: 'from-purple-500 to-purple-600',
    org_admin: 'from-violet-500 to-violet-600',
    school_admin: 'from-blue-500 to-blue-600',
    principal: 'from-orange-500 to-orange-600',
    teacher: 'from-green-500 to-green-600',
    accountant: 'from-amber-500 to-amber-600',
    parent: 'from-pink-500 to-pink-600',
    student: 'from-cyan-500 to-cyan-600',
};

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Welcome Banner */}
            <div className={`bg-gradient-to-r ${roleColors[user.role] || 'from-gray-500 to-gray-600'} rounded-2xl p-6 text-white mb-8`}>
                <h1 className="text-2xl font-bold mb-2">Welcome back, {user.firstName}! 👋</h1>
                <p className="opacity-90">
                    You're logged in as <strong>{roleLabels[user.role] || user.role}</strong>
                </p>
                {user.schoolId && (
                    <p className="text-sm opacity-75 mt-1">School ID: {user.schoolId}</p>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    label="Total Students"
                    value="--"
                    icon="🎓"
                    color="bg-green-50 text-green-600"
                />
                <StatCard
                    label="Total Teachers"
                    value="--"
                    icon="👨‍🏫"
                    color="bg-blue-50 text-blue-600"
                />
                <StatCard
                    label="Active Schools"
                    value="--"
                    icon="🏫"
                    color="bg-purple-50 text-purple-600"
                />
                <StatCard
                    label="Organizations"
                    value="--"
                    icon="🏢"
                    color="bg-amber-50 text-amber-600"
                />
            </div>

            {/* Quick Actions */}
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickActionCard
                    href="/students"
                    title="Manage Students"
                    desc="View, add, or edit student records"
                    icon="🎒"
                    color="bg-green-500"
                />
                <QuickActionCard
                    href="/schools"
                    title="Manage Schools"
                    desc="View and manage school branches"
                    icon="🏫"
                    color="bg-blue-500"
                />
                <QuickActionCard
                    href="/organizations"
                    title="Organizations"
                    desc="Manage school chains"
                    icon="🏢"
                    color="bg-purple-500"
                />
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    icon,
    color,
}: {
    label: string;
    value: string;
    icon: string;
    color: string;
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-5 border">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-2xl`}>
                    {icon}
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-sm text-gray-500">{label}</p>
                </div>
            </div>
        </div>
    );
}

function QuickActionCard({
    href,
    title,
    desc,
    icon,
    color,
}: {
    href: string;
    title: string;
    desc: string;
    icon: string;
    color: string;
}) {
    return (
        <Link
            href={href}
            className="bg-white rounded-xl shadow-sm p-5 border hover:shadow-md transition group"
        >
            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-2xl text-white`}>
                    {icon}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500">{desc}</p>
                </div>
            </div>
        </Link>
    );
}
