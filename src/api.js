// src/api.js
const isProduction = import.meta.env.PROD;
const API_BASE_URL = isProduction
    ? 'https://athlas-ia.vercel.app/api'
    : 'http://localhost:4000';

console.log(`🌐 API URL: ${API_BASE_URL} (${isProduction ? 'production' : 'development'})`);

export const fetchLatestTimestamp = async () => {
    const response = await fetch(`${API_BASE_URL}/latest-timestamp`);
    if (!response.ok) throw new Error('Failed to fetch latest timestamp');
    return response.json();
};

export const fetchCities = async () => {
    const response = await fetch(`${API_BASE_URL}/cities`);
    if (!response.ok) throw new Error('Failed to fetch cities');
    return response.json();
};

export const fetchMeasures = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/measures?${queryString}`);
    if (!response.ok) throw new Error('Failed to fetch measures');
    return response.json();
};

export const fetchHealth = async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Failed to fetch health');
    return response.json();
};