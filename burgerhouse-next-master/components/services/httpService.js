import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

export const BASE_URL = "http://localhost:3000";

const app = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

app.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalConfig = error.config;
    const status = error?.response?.status;

    const isDineInRequest =
      originalConfig?.url?.startsWith("/dinein") ||
      originalConfig?.url?.includes("/dinein");

    if (isDineInRequest && (status === 401 || status === 403)) {
      Cookies.remove("dine_sessionId");
      Cookies.remove("dine_tableId");
      toast.error("توکن میز شما منقضی شده است، لطفا دوباره اسکن کنید.");

      return Promise.reject(error);
    }

    if (
      status === 401 &&
      !originalConfig._retry &&
      !originalConfig.url.includes("/auth/signin") &&
      !originalConfig.url.includes("/auth/signup")
    ) {
      originalConfig._retry = true;

      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // If backend sent a new access token in response body
        if (data?.accessToken) {
          // Save to cookie
          Cookies.set("access_token", data.accessToken, {
            expires: 7,
            sameSite: "Lax",
            secure: true,
          });

          // Update axios default header
          app.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${data.accessToken}`;

          // Add to this failed request's config
          originalConfig.headers[
            "Authorization"
          ] = `Bearer ${data.accessToken}`;

          // Retry with NEW token
          return app(originalConfig);
        }
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

const http = {
  get: app.get,
  post: app.post,
  put: app.put,
  patch: app.patch,
  delete: app.delete,
};

export { app };

export default http;
