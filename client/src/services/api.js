import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = `${API_URL}/api`;

export const api = {
    getInfo: (url) => axios.post(`${API_BASE}/info`, { url }),
    getQueue: () => axios.get(`${API_BASE}/queue`),
    download: (data) => axios.post(`${API_BASE}/download`, data),
    cancel: (id) => axios.post(`${API_BASE}/cancel`, { id }),
    pause: (id) => axios.post(`${API_BASE}/pause`, { id }),
    resume: (id) => axios.post(`${API_BASE}/resume`, { id }),
    deleteFile: (id, path) => axios.post(`${API_BASE}/delete-file`, { id, path }),
    browse: () => axios.post(`${API_BASE}/browse`),
};
