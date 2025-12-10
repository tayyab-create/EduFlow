'use client';

import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3001';

interface School {
    id: string;
    name: string;
    code: string;
    city: string;
    email: string;
    phone: string;
    isActive: boolean;
    organizationId: string;
}

export default function SchoolsPage() {
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        name: '',
        code: '',
        city: '',
        email: '',
        phone: '',
    });

    const getToken = () => localStorage.getItem('accessToken');

    const fetchSchools = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/api/v1/schools`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error('Failed to fetch schools');

            const data = await res.json();
            setSchools(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchools();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/api/v1/schools`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error('Failed to create school');

            setShowForm(false);
            setForm({ name: '', code: '', city: '', email: '', phone: '' });
            fetchSchools();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Schools</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        {showForm ? 'Cancel' : '+ Add School'}
                    </button>
                </div>

                {/* Add Form */}
                {showForm && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4">Add New School</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="School Name *"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                                className="border rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                placeholder="Code (e.g., LGS-JT) *"
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value })}
                                required
                                className="border rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                placeholder="City"
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
                                type="tel"
                                placeholder="Phone"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="border rounded-lg px-3 py-2"
                            />
                            <div className="col-span-2">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    Create School
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-500">{error}</div>
                    ) : schools.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No schools found</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Name</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Code</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">City</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Email</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {schools.map((school) => (
                                    <tr key={school.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{school.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{school.code}</td>
                                        <td className="px-6 py-4 text-gray-600">{school.city || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600">{school.email || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${school.isActive
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}
                                            >
                                                {school.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
