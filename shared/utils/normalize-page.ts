export function normalizPage(page: string | undefined) {
  return page ? Number.parseInt(page as string) : 1
}
