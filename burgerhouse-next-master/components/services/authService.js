import http from "./httpService";

export default function signUpApi(data) {
  return http.post("/auth/signup", data).then(({ data }) => data);
}

export function signInApi(data) {
  return http.post("/auth/signin", data).then(({ data }) => data);
}

export function getCurrentUserApi(token) {
  return http
    .get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(({ data }) => data);
}

export function logoutApi() {
  return http.post("/auth/logout").then(({ data }) => data);
}

export function forgotPasswordApi(data) {
  return http.post("/auth/forgot-password", data).then(({ data }) => data);
}

export function editUserApi({ userId, updatedUser }) {
  return http.patch(`/users/${userId}`, updatedUser).then(({ data }) => data);
}

export function resetPasswordApi(resetData) {
  return http.post("/auth/reset-password", resetData).then(({ data }) => data);
}
