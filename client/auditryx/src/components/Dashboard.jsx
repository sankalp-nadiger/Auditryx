import React from 'react';
import { useApp } from '../App.jsx';
import { Download, Users, Target, AlertTriangle, Shield } from 'lucide-react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, PieChart, Pie, Cell } from 'recharts';
import Badge from './Badge.jsx';

const Dashboard = () => {
    const { data } = useApp();

    if (!data) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-500 rounded-full">
                            <Download className="text-white" />
                        </div>
                        <div className="ml-4">
                            <h2 className="text-gray-600 text-sm">Downloads</h2>
                            <p className="text-2xl font-bold">{data.downloads}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-500 rounded-full">
                            <Users className="text-white" />
                        </div>
                        <div className="ml-4">
                            <h2 className="text-gray-600 text-sm">Users</h2>
                            <p className="text-2xl font-bold">{data.users}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-red-500 rounded-full">
                            <Target className="text-white" />
                        </div>
                        <div className="ml-4">
                            <h2 className="text-gray-600 text-sm">Goals</h2>
                            <p className="text-2xl font-bold">{data.goals}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-500 rounded-full">
                            <AlertTriangle className="text-white" />
                        </div>
                        <div className="ml-4">
                            <h2 className="text-gray-600 text-sm">Alerts</h2>
                            <p className="text-2xl font-bold">{data.alerts}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8 bg-white p-4 rounded-lg shadow">
                <h2 className="text-gray-600 text-lg font-semibold">Sales Overview</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.sales}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                        <Line type="monotone" dataKey="profit" stroke="#82ca9d" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-8 bg-white p-4 rounded-lg shadow">
                <h2 className="text-gray-600 text-lg font-semibold">User Demographics</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={data.demographics} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                            {data.demographics.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-8 bg-white p-4 rounded-lg shadow">
                <h2 className="text-gray-600 text-lg font-semibold">Recent Activities</h2>
                <div className="flex flex-col">
                    {data.activities.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border-b">
                            <div className="flex items-center">
                                <div className={`w-2.5 h-2.5 rounded-full mr-3 ${activity.type === 'download' ? 'bg-blue-500' : 'bg-green-500'}`} />
                                <div>
                                    <p className="text-sm text-gray-800">{activity.description}</p>
                                    <p className="text-xs text-gray-500">{activity.time}</p>
                                </div>
                            </div>
                            <Badge type={activity.type} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;