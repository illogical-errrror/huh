import React, { useState, useEffect } from 'react';
import { getSummaryStats } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Briefcase, Users, Building, TrendingUp, IndianRupee } from 'lucide-react';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const StatCard = ({ title, value, icon: Icon, description }) => (
    <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm dark:shadow-md rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 transition-colors">
        <div className="p-5">
            <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-lg">
                    <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{title}</dt>
                        <dd>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white capitalize truncate">{value}</div>
                        </dd>
                    </dl>
                </div>
            </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 border-t border-slate-100 dark:border-slate-700">
            <div className="text-sm text-slate-500 dark:text-slate-400">{description}</div>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getSummaryStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to load stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
    );
    if (!stats) return <div className="text-red-500 p-4 bg-red-50 dark:bg-red-500/10 rounded-lg">Failed to load statistics. Please ensure the backend server is running.</div>;

    const engagementData = [
        { name: 'Full Time', value: stats.full_time_count },
        { name: 'Internship', value: stats.internship_count },
        { name: 'PPO', value: stats.ppo_count || 0 }
    ].filter(d => d.value > 0);

    // Group packages into ranges
    const distribution = {};
    stats.package_distribution.forEach(pack => {
        let range = '';
        if (pack < 5) range = '< 5 LPA';
        else if (pack < 10) range = '5 - 10 LPA';
        else if (pack < 20) range = '10 - 20 LPA';
        else range = '20+ LPA';

        distribution[range] = (distribution[range] || 0) + 1;
    });

    const chartData = Object.keys(distribution).map(key => ({
        range: key,
        count: distribution[key]
    })).sort((a, b) => {
        const order = { '< 5 LPA': 1, '5 - 10 LPA': 2, '10 - 20 LPA': 3, '20+ LPA': 4 };
        return order[a.range] - order[b.range];
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Overview</h2>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">Key metrics and statistics of placement season 2026.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Highest Package" value={stats.highest_package_lpa ? `₹${stats.highest_package_lpa} LPA` : "Not Disclosed"} icon={TrendingUp} description="Maximum CTC offered" />
                <StatCard title="Average Package" value={stats.average_package_lpa ? `₹${stats.average_package_lpa} LPA` : "Pending"} icon={IndianRupee} description="Mean CTC across all offers" />
                <StatCard title="Total Offers" value={stats.total_offers || "TBC"} icon={Briefcase} description="Total number of selections" />
                <StatCard title="Companies Visited" value={stats.total_companies} icon={Building} description="Total companies processed" />
                <StatCard title="Median Package" value={stats.median_package_lpa ? `₹${stats.median_package_lpa} LPA` : "Pending"} icon={IndianRupee} description="Middle value of all offers" />
                {stats.ppo_count > 0 && <StatCard title="PPOs Offered" value={stats.ppo_count} icon={Briefcase} description="Pre-placement offers" />}
                <StatCard title="Full-time Roles" value={stats.full_time_count} icon={Users} description="Companies offering FTE" />
                <StatCard title="Internships" value={stats.internship_count} icon={Users} description="Companies offering Internships" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-white dark:bg-slate-800 shadow-sm dark:shadow-md rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Package Distribution (Companies)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                <XAxis dataKey="range" stroke="#9ca3af" axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} dx={-10} />
                                <RechartsTooltip
                                    cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }}
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#818cf8' }}
                                />
                                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 shadow-sm dark:shadow-md rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Engagement Types (Companies)</h3>
                    <div className="h-80 flex justify-center items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={engagementData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {engagementData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center mt-4 space-x-6">
                        {engagementData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300">
                                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                {entry.name} ({entry.value})
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
