import axios, { type AxiosError } from 'axios'
import toast from 'react-hot-toast'

const TOKEN_KEY = 'escola_token'
const USER_KEY = 'escola_user'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// REQUEST — injeta token automaticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// RESPONSE — trata erros globalmente
api.interceptors.response.use(
  response => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string> }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    if (error.response?.status === 403) {
      toast.error('Você não tem permissão para esta ação.')
    } else if (error.response?.status === 409) {
      toast.error(error.response.data?.message || 'Conflito de dados.')
    } else if (error.response?.status === 404) {
      toast.error('Recurso não encontrado.')
    } else if (error.response?.status === 400) {
      const errs = error.response.data?.errors
      if (errs) {
        Object.values(errs).forEach(msg => toast.error(msg))
      } else {
        toast.error(error.response.data?.message || 'Dados inválidos.')
      }
    } else if (!error.response) {
      toast.error('Erro de conexão. Verifique se o servidor está online.')
    }

    return Promise.reject(error)
  }
)

export const saveToken = (token: string) =>
  localStorage.setItem(TOKEN_KEY, token)

export const getToken = () =>
  localStorage.getItem(TOKEN_KEY)

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
