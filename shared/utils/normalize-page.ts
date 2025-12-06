export function normalizePage(page: string | undefined) {
  return page ? Number.parseInt(page as string) : 1
}
