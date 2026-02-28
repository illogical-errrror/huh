import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCompanyByName } from '../api';
import { ChevronLeft, ChevronDown, ChevronUp, FileText, IndianRupee, Users, Code, Calendar } from 'lucide-react';

const CompanyDetail = () => {
    const { name } = useParams();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRaw, setShowRaw] = useState(false);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const data = await getCompanyByName(name);
                setCompany(data);
            } catch (error) {
                console.error("Failed to fetch company:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, [name]);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
    );

    if (!company) return (
        <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Company not found</h2>
            <Link to="/companies" className="text-indigo-500 hover:underline">Return to Companies list</Link>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                <Link to="/companies" className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                        {company.company_name}
                        {company.flags?.is_withdrawn && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800">
                                Withdrawn Offers
                            </span>
                        )}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {company.engagement_type && company.engagement_type.map((type, i) => (
                            <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                                {type}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Compensation Card */}
                <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-center">
                        <IndianRupee className="w-5 h-5 text-indigo-500 mr-2" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Compensation Details</h3>
                    </div>
                    <div className="p-6">
                        <div className="mb-6">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Highest Expected CTC</p>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                {company.compensation?.ctc_lpa ? `₹${company.compensation.ctc_lpa} LPA` : 'Not Disclosed'}
                            </div>
                        </div>

                        {/* Multi-Role Profile Breakdown */}
                        {company.offer_profiles && company.offer_profiles.length > 0 ? (
                            <div className="mt-6 mb-6">
                                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-3">Role-Specific Packages</h4>
                                <div className="space-y-3">
                                    {company.offer_profiles.map((profile, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50">
                                            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-200">{profile.role}</span>
                                            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">₹{profile.ctc_lpa} LPA</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                            {company.compensation?.base_lpa && (
                                <div>
                                    <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Base Salary</dt>
                                    <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                                        ₹{company.compensation.base_lpa} LPA
                                    </dd>
                                </div>
                            )}
                            {company.compensation?.variable_lpa && (
                                <div>
                                    <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Variable</dt>
                                    <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                                        ₹{company.compensation.variable_lpa} LPA
                                    </dd>
                                </div>
                            )}
                            {company.compensation?.bonus_lpa && (
                                <div>
                                    <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bonus / Sign-on</dt>
                                    <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                                        ₹{company.compensation.bonus_lpa} LPA
                                    </dd>
                                </div>
                            )}
                            {company.compensation?.stipend_monthly && (
                                <div>
                                    <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Stipend</dt>
                                    <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                                        ₹{company.compensation.stipend_monthly.toLocaleString()}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>

                {/* Roles & Eligibility Card */}
                <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-center">
                        <Code className="w-5 h-5 text-emerald-500 mr-2" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Roles & Eligibility</h3>
                    </div>
                    <div className="p-6">
                        <div className="mb-6">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Offered Roles</p>
                            <div className="flex flex-wrap gap-2">
                                {company.role && company.role.length > 0 ? company.role.map((r, i) => (
                                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 text-sm">
                                        {r}
                                    </span>
                                )) : <span className="text-slate-500 text-sm">Not specifically mentioned</span>}
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Allowed Branches</p>
                            <div className="flex flex-wrap gap-2">
                                {company.eligibility?.allowed_branches && company.eligibility.allowed_branches.length > 0 ?
                                    company.eligibility.allowed_branches.map((b, i) => (
                                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-medium">
                                            {b}
                                        </span>
                                    )) : <span className="text-slate-500 text-sm">All branches / Not specified</span>}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">CGPA Cutoff</p>
                            <div className="text-lg font-semibold text-slate-900 dark:text-white">
                                {company.eligibility?.cgpa_cutoff ? `${company.eligibility.cgpa_cutoff} / 10.0` : 'No hard cutoff specified'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selection Stats */}
                <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-center">
                        <Users className="w-5 h-5 text-indigo-500 mr-2" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Selection Statistics</h3>
                    </div>
                    <div className="p-6">
                        <dl className="grid grid-cols-2 gap-6">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                                <dt className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Final Selections</dt>
                                <dd className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                    {company.selection_stats?.students_selected != null ? company.selection_stats.students_selected : 'TBC'}
                                </dd>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <dt className="text-sm font-medium text-slate-700 dark:text-slate-300">Shortlisted</dt>
                                <dd className="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-200">
                                    {company.selection_stats?.students_shortlisted != null ? company.selection_stats.students_shortlisted : '-'}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Timeline Notes */}
                <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-center">
                        <Calendar className="w-5 h-5 text-amber-500 mr-2" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Timeline & Notes</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Result Status</h4>
                                <p className="mt-1 text-sm text-slate-900 dark:text-white flex items-center">
                                    {company.flags?.is_result_confirmed ?
                                        <><span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span> Confirmed</> :
                                        <><span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span> Pending / Interim</>}
                                </p>
                            </div>

                            {company.timeline?.internship_duration_months && (
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Internship Duration</h4>
                                    <p className="mt-1 text-sm text-slate-900 dark:text-white">{company.timeline.internship_duration_months} Months</p>
                                </div>
                            )}

                            {company.notes && (
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">General Notes</h4>
                                    <p className="mt-1 text-sm text-slate-900 dark:text-white">{company.notes}</p>
                                </div>
                            )}

                            {!company.notes && !company.timeline?.internship_duration_months && (
                                <p className="text-sm text-slate-500 italic dark:text-slate-400">No specific timeline records available.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Raw Messages Section */}
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mt-8">
                <button
                    onClick={() => setShowRaw(!showRaw)}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none"
                >
                    <div className="flex items-center">
                        <FileText className="w-5 h-5 text-slate-500 mr-2" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Original Announcements & Messages</h3>
                        <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                            {company.metadata?.raw_messages?.length || 0} messages
                        </span>
                    </div>
                    {showRaw ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </button>

                {showRaw && (
                    <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                        <div className="space-y-4">
                            {company.metadata?.raw_messages && company.metadata.raw_messages.length > 0 ? (
                                company.metadata.raw_messages.map((msg, idx) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                        <pre className="text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap break-words">
                                            {msg}
                                        </pre>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 text-sm">No raw messages found.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default CompanyDetail;
