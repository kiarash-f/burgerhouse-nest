import http from "./httpService";

export default function signUpApi(data) {
  return http.post("/auth/signup", data).then(({ data }) => data);
}
