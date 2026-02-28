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

    companies.forEach(company => {
        const stats = company.selection_stats || {};
        const selCount = stats.students_selected || stats.students_shortlisted || 0;
        totalSelections += selCount;

        const compensation = company.compensation || {};
        const ctc = compensation.ctc_lpa || 0;

        if (ctc > highestCtc) highestCtc = ctc;
        if (ctc > 0) {
            totalCtcSum += ctc;
            ctcCount++;
        }
    });

    const averageCtc = ctcCount > 0 ? totalCtcSum / ctcCount : 0;

    return {
        total_companies_visited: companies.length,
        total_selections: totalSelections,
        highest_ctc_lpa: highestCtc,
        average_ctc_lpa: averageCtc
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
