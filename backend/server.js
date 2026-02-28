const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Load data
const dataPath = process.env.DATA_PATH || path.join(__dirname, 'data', 'placement_data.json');
let placementData = { companies: [] };

try {
    const fileContent = fs.readFileSync(dataPath, 'utf8');
    placementData = JSON.parse(fileContent);
    console.log(`Loaded ${placementData.companies.length} companies from JSON.`);
} catch (error) {
    console.error('Error reading placement data:', error.message);
}

// Routes
app.get('/api/stats/summary', (req, res) => {
    const companies = placementData.companies || [];
    let highestPackage = 0;
    let totalPackageSum = 0;
    let packageCount = 0;
    let ctcArray = [];

    let totalOffers = 0;
    let totalStudentsPlaced = 0;
    let internshipCount = 0;
    let fullTimeCount = 0;
    let ppoCount = 0;

    companies.forEach(company => {
        // Packages
        if (company.compensation && company.compensation.ctc_lpa) {
            const lpa = Number(company.compensation.ctc_lpa);
            if (lpa > highestPackage) highestPackage = lpa;
            totalPackageSum += lpa;
            packageCount++;
            ctcArray.push(lpa);
        }

        // Engagement types
        if (company.engagement_type && Array.isArray(company.engagement_type)) {
            if (company.engagement_type.includes('Internship')) internshipCount++;
            if (company.engagement_type.includes('Full Time')) fullTimeCount++;
            if (company.engagement_type.includes('PPO')) ppoCount++;
        }

        // Selection stats
        if (company.selection_stats) {
            if (company.selection_stats.students_selected) {
                totalStudentsPlaced += Number(company.selection_stats.students_selected);
                totalOffers += Number(company.selection_stats.students_selected);
            }
        }
    });

    const averagePackage = packageCount > 0 ? (totalPackageSum / packageCount).toFixed(2) : 0;

    // Calculate median
    let medianPackage = 0;
    if (ctcArray.length > 0) {
        ctcArray.sort((a, b) => a - b);
        const mid = Math.floor(ctcArray.length / 2);
        medianPackage = ctcArray.length % 2 !== 0 ? ctcArray[mid] : ((ctcArray[mid - 1] + ctcArray[mid]) / 2).toFixed(2);
    }

    res.json({
        highest_package_lpa: highestPackage,
        average_package_lpa: Number(averagePackage),
        median_package_lpa: Number(medianPackage),
        total_offers: totalOffers,
        total_students_placed: totalStudentsPlaced,
        total_companies: companies.length,
        internship_count: internshipCount,
        full_time_count: fullTimeCount,
        ppo_count: ppoCount,
        package_distribution: ctcArray
    });
});

app.get('/api/companies', (req, res) => {
    res.json(placementData.companies || []);
});

app.get('/api/companies/:name', (req, res) => {
    const companyName = req.params.name;
    const company = (placementData.companies || []).find(
        c => c.company_name.toLowerCase() === decodeURIComponent(companyName).toLowerCase()
    );

    if (company) {
        res.json(company);
    } else {
        res.status(404).json({ message: 'Company not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
