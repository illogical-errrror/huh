import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getSummaryStats = async () => {
    const response = await axios.get(`${API_URL}/stats/summary`);
    return response.data;
};

export const getCompanies = async () => {
    const response = await axios.get(`${API_URL}/companies`);
    return response.data;
};

export const getCompanyByName = async (name) => {
    const response = await axios.get(`${API_URL}/companies/${encodeURIComponent(name)}`);
    return response.data;
};
