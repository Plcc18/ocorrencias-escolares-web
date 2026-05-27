import { api, saveToken, removeToken } from './axios'
import type { AuthResponse, LoginRequest, UserMe } from '../types/auth'

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data)
    saveToken(response.data.accessToken)
    return response.data
  },

  logout: () => {
    removeToken()
  },

  me: async (): Promise<UserMe> => {
    const { data } = await api.get<UserMe>('/auth/me')
    return data
  },
}
