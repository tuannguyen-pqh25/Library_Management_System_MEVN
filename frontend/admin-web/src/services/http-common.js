import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginUrl = err.config && err.config.url && err.config.url.includes('/login');
    if (err.response?.status === 401 && !isLoginUrl) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login"; // đổi đúng path login của nhóm
    }
    return Promise.reject(err);
  }
);

export default http;