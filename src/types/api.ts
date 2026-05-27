export interface PageResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface ApiError {
  status: number
  message: string
  timestamp: string
  errors?: Record<string, string>
}
