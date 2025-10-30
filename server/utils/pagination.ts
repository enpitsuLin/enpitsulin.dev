export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginationResult {
  limit: number
  offset: number
  page: number
  pageSize: number
}

export function parsePagination(query: Record<string, any>): PaginationResult {
  const page = Math.max(1, Number.parseInt(query.page as string) || 1)
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(query.pageSize as string) || 10))

  return {
    page,
    pageSize,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
