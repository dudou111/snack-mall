import { request } from "./request";
import type { AuthPayload, UserInfo } from "../types";

export interface RegisterPayload {
  username: string;
  password: string;
  confirmPassword: string;
  tel?: string;
  email?: string;
  role: "user" | "merchant";
}

export const authApi = {
  login: (payload: { username: string; password: string }) =>
    request<AuthPayload>({
      url: "/api/shop-auth/login",
      method: "POST",
      data: payload
    }),

  register: (payload: RegisterPayload) =>
    request<{ userInfo: UserInfo }>({
      url: "/api/shop-auth/register",
      method: "POST",
      data: payload
    }),

  checkLogin: () =>
    request<UserInfo>({
      url: "/api/shop-auth/check_login",
      method: "GET"
    })
};
