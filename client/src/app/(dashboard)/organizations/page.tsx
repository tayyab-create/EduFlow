'use client';

import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3001';

interface Organization {
    id: string;
    name: string;
    code: string;
    city: string;
    email: string;
    maxSchools: number;
    isActive: boolean;
    schools: { id: string; name: string }[];
}

export default function OrganizationsPage() {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        name: '',
        code: '',
        city: '',
        email: '',
        maxSchools: 10,
    });

    const getToken = () => localStorage.getItem('accessToken');

    const fetchOrganizations = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/api/v1/organizations`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error('Failed to fetch organizations');

            const data = await res.json();
            setOrganizations(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/api/v1/organizations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error('Failed to create organization');

            setShowForm(false);
            setForm({ name: '', code: '', city: '', email: '', maxSchools: 10 });
            fetchOrganizations();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
                        <p className="text-gray-500 text-sm">School chains with multiple branches</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                        {showForm ? 'Cancel' : '+ Add Organization'}
                    </button>
                </div>

                {/* Add Form */}
                {showForm && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4">Add New Organization</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Organization Name *"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                                className="border rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                placeholder="Code (e.g., BSS) *"
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value })}
                                required
                                className="border rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                placeholder="Headquarters City"
                                value={form.city}
                                onChange={(e) => setForm({ ...form, city: e.target.value })}
                                className="border rounded-lg px-3 py-2"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="border rounded-lg px-3 py-2"
                            />
                            <input
                                type="number"
                                placeholder="Max Schools"
                                value={form.maxSchools}
                                onChange={(e) => setForm({ ...form, maxSchools: parseInt(e.target.value) })}
                                className="border rounded-lg px-3 py-2"
                            />
                            <div className="col-span-2">
                                <button
                                    type="submit"
                                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                                >
                                    Create Organization
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full p-8 text-center text-gray-500">Loading...</div>
                    ) : error ? (
                        <div className="col-span-full p-8 text-center text-red-500">{error}</div>
                    ) : organizations.length === 0 ? (
                        <div className="col-span-full p-8 text-center text-gray-500">
                            No organizations found. Create one to get started.
                        </div>
                    ) : (
                        organizations.map((org) => (
                            <div
                                key={org.id}
                                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{org.name}</h3>
                                        <p className="text-gray-500 text-sm">{org.code}</p>
                                    </div>
                                    <span
                                        className={`px-2 py-1 text-xs rounded-full ${org.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {org.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <p>📍 {org.city || 'No city set'}</p>
                                    <p>📧 {org.email || 'No email'}</p>
                                    <p>🏫 {org.schools?.length || 0} / {org.maxSchools} schools</p>
                                </div>

                                {org.schools && org.schools.length > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <p className="text-xs font-semibold text-gray-500 mb-2">Schools:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {org.schools.map((school) => (
                                                <span
                                                    key={school.id}
                                                    className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                                                >
                                                    {school.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
