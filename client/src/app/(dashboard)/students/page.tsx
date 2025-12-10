'use client';

import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3001';

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    registrationNo: string;
    admissionDate: string;
    fatherName: string;
    fatherPhone: string;
    status: string;
    createdAt: string;
}

interface PaginatedResponse {
    data: Student[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        admissionDate: new Date().toISOString().split('T')[0],
        fatherName: '',
        fatherPhone: '',
    });

    const getToken = () => localStorage.getItem('accessToken');

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(
                `${API_BASE_URL}/api/v1/students?page=${page}&limit=10&search=${search}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!res.ok) throw new Error('Failed to fetch students');

            const data: PaginatedResponse = await res.json();
            setStudents(data.data);
            setTotalPages(data.meta.totalPages);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [page, search]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/api/v1/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error('Failed to create student');

            setShowForm(false);
            setForm({
                firstName: '',
                lastName: '',
                dateOfBirth: '',
                admissionDate: new Date().toISOString().split('T')[0],
                fatherName: '',
                fatherPhone: '',
            });
            fetchStudents();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        {showForm ? 'Cancel' : '+ Add Student'}
                    </button>
                </div>

                {/* Add Form */}
                {showForm && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4">Add New Student</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="First Name *"
                                value={form.firstName}
                                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                required
                                className="border rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                placeholder="Last Name *"
                                value={form.lastName}
                                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                required
                                className="border rounded-lg px-3 py-2"
                            />
                            <input
                                type="date"
                                placeholder="Date of Birth *"
                                value={form.dateOfBirth}
                                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                                required
                                className="border rounded-lg px-3 py-2"
                            />
                            <input
                                type="date"
                                placeholder="Admission Date"
                                value={form.admissionDate}
                                onChange={(e) => setForm({ ...form, admissionDate: e.target.value })}
                                className="border rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                placeholder="Father's Name"
                                value={form.fatherName}
                                onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                                className="border rounded-lg px-3 py-2"
                            />
                            <input
                                type="tel"
                                placeholder="Father's Phone"
                                value={form.fatherPhone}
                                onChange={(e) => setForm({ ...form, fatherPhone: e.target.value })}
                                className="border rounded-lg px-3 py-2"
                            />
                            <div className="col-span-2">
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                                >
                                    Create Student
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Search */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full max-w-md border rounded-lg px-4 py-2"
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-500">{error}</div>
                    ) : students.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No students found</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Name</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Reg. No</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Father</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Phone</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {student.firstName} {student.lastName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{student.registrationNo || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600">{student.fatherName || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600">{student.fatherPhone || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${student.status === 'active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-blue-600 hover:underline text-sm">View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
