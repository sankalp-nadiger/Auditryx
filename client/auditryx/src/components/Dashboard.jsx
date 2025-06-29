

import { useEffect, useState } from 'react';
import { useApp } from '../App.jsx';
import { useNavigate } from 'react-router-dom';
import { Users, Shield } from 'lucide-react';
import Header from './Header.jsx';


const Dashboard = () => {

    const { user } = useApp();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/dashboard-data`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    credentials: 'include'
                });
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (e) {
                // handle error
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }
    if (!data) {
        return <div>No dashboard data found.</div>;
    }

return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-50 overflow-y-auto">
        <Header />
        
        {/* Main Content Container with proper spacing */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="text-left w-full">
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Welcome{user && user.full_name ? `, ${user.full_name}` : user && user.email ? `, ${user.email}` : ''}!
                    </h1>
                    <p className="text-gray-600 mt-2 text-base">Here's your procurement dashboard overview.</p>
                </div>
                {user && user.email && (
                    <div className="mt-2 md:mt-0 text-sm text-gray-500">
                        Logged in as <span className="font-semibold">{user.email}</span>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500 rounded-xl">
                            <Users className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-gray-600 text-sm font-medium">Suppliers</h2>
                            <p className="text-2xl font-bold text-gray-900">{data.suppliers}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500 rounded-xl">
                            <Shield className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-gray-600 text-sm font-medium">Compliance Records</h2>
                            <p className="text-2xl font-bold text-gray-900">{data.compliance_records}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Suppliers */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-gray-900 text-lg font-semibold">Recent Suppliers</h2>
                    </div>
                    <div className="p-6">
                        {data.recent_suppliers && data.recent_suppliers.length > 0 ? (
                            <div className="space-y-4">
                                {data.recent_suppliers.map((s, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-base text-gray-900 font-semibold">{s.name}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {s.country} {s.last_audit && `• Last Audit: ${s.last_audit}`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 text-sm">No recent suppliers.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Compliance Records */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-gray-900 text-lg font-semibold">Recent Compliance Records</h2>
                    </div>
                    <div className="p-6">
                        {data.recent_compliance && data.recent_compliance.length > 0 ? (
                            <div className="space-y-4">
                                {data.recent_compliance.map((c, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="text-base text-gray-900 font-semibold">{c.supplier}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {c.metric} • {c.status} • {c.date_recorded}
                                            </p>
                                        </div>
                                        {c.result !== undefined && (
                                            <span className="text-sm text-blue-600 font-medium ml-4">
                                                Result: {c.result}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 text-sm">No recent compliance records.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
);
};

export default Dashboard;