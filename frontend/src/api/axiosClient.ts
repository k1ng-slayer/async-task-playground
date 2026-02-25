import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
