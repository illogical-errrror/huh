import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCompanies } from '../api';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';

const CompanyTable = () => {
    const [companies, setCompanies] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters & Sorting
    const [searchTerm, setSearchTerm] = useState('');
    const [engagementFilter, setEngagementFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    const [sortField, setSortField] = useState('company_name');
    const [sortDirection, setSortDirection] = useState('asc');

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const data = await getCompanies();
                setCompanies(data);
                setFiltered(data);
            } catch (error) {
                console.error("Failed to fetch companies:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCompanies();
    }, []);

    useEffect(() => {
        let result = companies;

        if (searchTerm) {
            result = result.filter(c => c.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (engagementFilter) {
            result = result.filter(c => c.engagement_type && c.engagement_type.includes(engagementFilter));
        }

        if (roleFilter) {
            result = result.filter(c => c.role && c.role.some(r => r.toLowerCase().includes(roleFilter.toLowerCase())));
        }

        // Sorting
        result.sort((a, b) => {
            let valA, valB;

            switch (sortField) {
                case 'company_name':
                    valA = a.company_name;
                    valB = b.company_name;
                    break;
                case 'ctc':
                    valA = a.compensation?.ctc_lpa || 0;
                    valB = b.compensation?.ctc_lpa || 0;
                    break;
                case 'students':
                    valA = a.selection_stats?.students_selected || 0;
                    valB = b.selection_stats?.students_selected || 0;
                    break;
                default:
                    valA = a.company_name;
                    valB = b.company_name;
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        setFiltered([...result]);
    }, [companies, searchTerm, engagementFilter, roleFilter, sortField, sortDirection]);

    const toggleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc'); // Default to desc for numbers usually, but 'asc' for names
        }
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <ChevronUp className="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-50" />;
        return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 text-indigo-500" /> : <ChevronDown className="w-4 h-4 text-indigo-500" />;
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Companies</h2>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">View detailed placement statistics per company.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 shadow-sm dark:shadow-md rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search companies..."
                            className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <select
                            className="block w-full pl-3 pr-10 py-2 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={engagementFilter}
                            onChange={(e) => setEngagementFilter(e.target.value)}
                        >
                            <option value="">All Engagement Types</option>
                            <option value="Full Time">Full Time</option>
                            <option value="Internship">Internship</option>
                            <option value="PPO">PPO</option>
                        </select>
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Filter by role..."
                            className="block w-full pl-3 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 shadow-sm dark:shadow-md rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => toggleSort('company_name')}>
                                    <div className="flex items-center space-x-1">
                                        <span>Company Name</span>
                                        <SortIcon field="company_name" />
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Roles
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Engagement
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => toggleSort('ctc')}>
                                    <div className="flex items-center space-x-1">
                                        <span>CTC (LPA)</span>
                                        <SortIcon field="ctc" />
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => toggleSort('students')}>
                                    <div className="flex items-center space-x-1">
                                        <span>Students</span>
                                        <SortIcon field="students" />
                                    </div>
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">View</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                                        No companies found matching your criteria.
                                    </td>
                                </tr>
                            ) : filtered.map((company, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900 dark:text-white">{company.company_name}</div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate">
                                        <div className="text-sm text-slate-500 dark:text-slate-300">
                                            {company.role && company.role.length > 0 ? company.role.join(', ') : 'Not Disclosed'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-wrap gap-1">
                                            {company.engagement_type && company.engagement_type.map((type, i) => (
                                                <span key={i} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${type === 'Full Time' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300' :
                                                        type === 'Internship' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' :
                                                            'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300'}`}>
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                            {company.offer_profiles?.length > 1 ? `Up to ₹${company.compensation.ctc_lpa} LPA` : (company.compensation?.ctc_lpa ? `₹${company.compensation.ctc_lpa} LPA` : <span className="text-slate-400 font-normal">Not Disclosed</span>)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900 dark:text-white">
                                            {company.selection_stats?.students_selected != null ?
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                                                    {company.selection_stats.students_selected} Selected
                                                </span> :
                                                <span className="text-amber-500 dark:text-amber-400 text-xs font-medium">Result Pending</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/company/${encodeURIComponent(company.company_name)}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                                            View details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Simple pagination footer - just info for now */}
                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        Showing <span className="font-medium">{filtered.length}</span> companies
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyTable;
