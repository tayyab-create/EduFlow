'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const ROLES = [
    { value: 'super_admin', label: 'Super Admin', desc: 'Platform administrator', color: 'bg-purple-600' },
    { value: 'org_admin', label: 'Organization Admin', desc: 'School chain admin', color: 'bg-violet-600' },
    { value: 'school_admin', label: 'School Admin', desc: 'Single school admin', color: 'bg-blue-600' },
    { value: 'principal', label: 'Principal', desc: 'School principal', color: 'bg-orange-600' },
    { value: 'teacher', label: 'Teacher', desc: 'Class teacher', color: 'bg-green-600' },
];

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'school_admin',
        schoolName: '',
        schoolCode: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const selectRole = (role: string) => {
        setFormData((prev) => ({ ...prev, role }));
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const body: Record<string, string> = {
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: formData.role,
            };

            // Add school based on role
            if (formData.role === 'school_admin' && formData.schoolName) {
                body.schoolName = formData.schoolName; // Creates new school
            } else if (formData.schoolCode) {
                body.schoolCode = formData.schoolCode; // Joins existing school
            }

            const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('accessToken', data.tokens.accessToken);
                localStorage.setItem('refreshToken', data.tokens.refreshToken);
                localStorage.setItem('user', JSON.stringify(data.user));
                router.push('/dashboard');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
            <Card className="w-full max-w-lg shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-2xl">E</span>
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {step === 1 ? 'Select Your Role' : 'Create Account'}
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                        {step === 1
                            ? 'Choose your role to get started'
                            : `Registering as ${ROLES.find((r) => r.value === formData.role)?.label}`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 1 ? (
                        <div className="space-y-3">
                            {ROLES.map((role) => (
                                <button
                                    key={role.value}
                                    onClick={() => selectRole(role.value)}
                                    className={`w-full p-4 rounded-lg border-2 text-left transition hover:border-indigo-400 hover:shadow ${formData.role === role.value
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 ${role.color} rounded-lg flex items-center justify-center`}>
                                            <span className="text-white font-bold">{role.label[0]}</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{role.label}</p>
                                            <p className="text-sm text-gray-500">{role.desc}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                            <p className="text-center text-sm text-gray-500 mt-4">
                                Already have an account?{' '}
                                <a href="/login" className="text-indigo-600 hover:underline font-medium">
                                    Sign In
                                </a>
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        placeholder="John"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="admin@school.edu.pk"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
                                    className="h-11"
                                />
                            </div>

                            {/* School Admin: Create new school */}
                            {formData.role === 'school_admin' && (
                                <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
                                    <Label htmlFor="schoolName">School Name (creates new school)</Label>
                                    <Input
                                        id="schoolName"
                                        name="schoolName"
                                        placeholder="Lahore Grammar School"
                                        value={formData.schoolName}
                                        onChange={handleChange}
                                        className="h-11"
                                    />
                                </div>
                            )}

                            {/* Non-Super Admin: Join existing school */}
                            {formData.role !== 'super_admin' && formData.role !== 'school_admin' && (
                                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                                    <Label htmlFor="schoolCode">School Code (to join existing)</Label>
                                    <Input
                                        id="schoolCode"
                                        name="schoolCode"
                                        placeholder="LGS-X1Y"
                                        value={formData.schoolCode}
                                        onChange={handleChange}
                                        className="h-11"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                    className="h-11"
                                >
                                    ← Back
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Creating...' : 'Create Account'}
                                </Button>
                            </div>

                            <p className="text-center text-sm text-gray-500">
                                Already have an account?{' '}
                                <a href="/login" className="text-indigo-600 hover:underline font-medium">
                                    Sign In
                                </a>
                            </p>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
