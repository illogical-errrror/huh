import data from './data/placement_data.json';

export const getSummaryStats = async () => {
    // We can simulate an API response if we want, or just return the data directly.
    // The previous implementation expected summary stats wrapped in an object
    // Assuming backend generated this, but in frontend we can compute it on the fly 
    // or just assume frontend components derived it from raw data.
    // Let's compute a quick summary like the backend did
    const companies = data.companies;
    let totalSelections = 0;
    let highestCtc = 0;
    let totalCtcSum = 0;
    let ctcCount = 0;
    let fullTimeCount = 0;
    let internshipCount = 0;
    let ppoCount = 0;
    const allCtcs = [];
    const packageDistribution = [];

    companies.forEach(company => {
        const stats = company.selection_stats || {};
        const selCount = stats.students_selected || stats.students_shortlisted || 0;
        totalSelections += selCount;

        const compensation = company.compensation || {};
        const ctc = compensation.ctc_lpa || 0;

        if (ctc > 0) {
            if (ctc > highestCtc) highestCtc = ctc;
            totalCtcSum += ctc;
            ctcCount++;
            for (let i = 0; i < selCount; i++) {
                allCtcs.push(ctc);
                packageDistribution.push(ctc);
            }
        }

        const roles = company.roles || [];
        const isFTE = roles.some(r => r.engagement_type.includes("Full Time") || r.engagement_type.includes("FTE"));
        const isIntern = roles.some(r => r.engagement_type.includes("Internship") || r.engagement_type.includes("Intern"));
        const isPPO = roles.some(r => r.engagement_type.includes("PPO"));

        if (isFTE) fullTimeCount++;
        if (isIntern) internshipCount++;
        if (isPPO) ppoCount++;
    });

    const averageCtc = ctcCount > 0 ? (totalCtcSum / ctcCount).toFixed(2) : 0;

    allCtcs.sort((a, b) => a - b);
    let medianCtc = 0;
    if (allCtcs.length > 0) {
        const mid = Math.floor(allCtcs.length / 2);
        medianCtc = allCtcs.length % 2 !== 0 ? allCtcs[mid] : ((allCtcs[mid - 1] + allCtcs[mid]) / 2).toFixed(2);
    }

    return {
        total_companies_visited: companies.length,
        total_companies: companies.length,
        total_selections: totalSelections,
        total_offers: totalSelections,
        highest_package_lpa: highestCtc,
        average_package_lpa: averageCtc,
        median_package_lpa: medianCtc,
        full_time_count: fullTimeCount,
        internship_count: internshipCount,
        ppo_count: ppoCount,
        package_distribution: packageDistribution
    };
};

export const getCompanies = async () => {
    return data;
};

export const getCompanyByName = async (name) => {
    const company = data.companies.find(c => c.company_name.toLowerCase() === name.toLowerCase());
    if (company) {
        return company;
    } else {
        throw new Error("Company not found");
    }
};
