import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) throw new Error("No refresh token");

        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/users/refreshToken`,
          { token: refreshToken } 
        );

        // console.log("refresh token response:", res)

        const newToken = res.data.token;

        if (!newToken) throw new Error("No new token returned");
        localStorage.setItem("token", newToken);
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        return API(originalRequest);
      } catch (err) {
        console.error("Token refresh failed:", err);

        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
