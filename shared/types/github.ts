export interface GitHubRepo {
  fullName: string
  avatarUrl: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  license: string | null
}
