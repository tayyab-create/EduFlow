'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    schoolId?: string;
    createdAt: string;
}

const ROLES = [
    { value: 'org_admin', label: 'Org Admin', color: 'bg-violet-100 text-violet-700' },
    { value: 'school_admin', label: 'School Admin', color: 'bg-blue-100 text-blue-700' },
    { value: 'principal', label: 'Principal', color: 'bg-orange-100 text-orange-700' },
    { value: 'vice_principal', label: 'Vice Principal', color: 'bg-amber-100 text-amber-700' },
    { value: 'teacher', label: 'Teacher', color: 'bg-green-100 text-green-700' },
    { value: 'accountant', label: 'Accountant', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'hr', label: 'HR', color: 'bg-pink-100 text-pink-700' },
    { value: 'librarian', label: 'Librarian', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'receptionist', label: 'Receptionist', color: 'bg-teal-100 text-teal-700' },
];

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: 'password123',
        firstName: '',
        lastName: '',
        role: 'teacher',
        schoolId: '',
    });
    const [creating, setCreating] = useState(false);

    const getToken = () => localStorage.getItem('accessToken');

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/users`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data.data || data);
            }
        } catch {
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setShowForm(false);
                setFormData({
                    email: '',
                    password: 'password123',
                    firstName: '',
                    lastName: '',
                    role: 'teacher',
                    schoolId: '',
                });
                fetchUsers();
            } else {
                setError(data.message || 'Failed to create user');
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setCreating(false);
        }
    };

    const getRoleColor = (role: string) => {
        const found = ROLES.find(r => r.value === role);
        return found?.color || 'bg-gray-100 text-gray-700';
    };

    const getRoleLabel = (role: string) => {
        const found = ROLES.find(r => r.value === role);
        return found?.label || role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600">Create and manage users across the platform</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Create User'}
                </Button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {showForm && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Create New User</CardTitle>
                        <CardDescription>User will be created with the specified role</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>First Name</Label>
                                <Input
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label>Last Name</Label>
                                <Input
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label>Password</Label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label>Role</Label>
                                <select
                                    className="w-full h-10 px-3 border rounded-md"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    {ROLES.map(role => (
                                        <option key={role.value} value={role.value}>
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <Button type="submit" disabled={creating}>
                                    {creating ? 'Creating...' : 'Create User'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>All Users ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-gray-500">Loading...</p>
                    ) : users.length === 0 ? (
                        <p className="text-gray-500">No users found. Create one above!</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4">Name</th>
                                        <th className="text-left py-3 px-4">Email</th>
                                        <th className="text-left py-3 px-4">Role</th>
                                        <th className="text-left py-3 px-4">Status</th>
                                        <th className="text-left py-3 px-4">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium">
                                                {user.firstName} {user.lastName}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{user.email}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                    {getRoleLabel(user.role)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-500 text-sm">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
