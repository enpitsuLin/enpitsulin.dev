import type { GitHubRepo } from '#shared/types/github'
import { normalizeGitHubRepo } from '#shared/utils/github-repo'

interface GitHubRepoResponse {
  full_name: string
  owner: { avatar_url: string }
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  license: { spdx_id: string, name: string } | null
}

export default defineCachedEventHandler(async (event): Promise<GitHubRepo> => {
  const repo = normalizeGitHubRepo(getRouterParam(event, 'repo') || '')
  if (!repo)
    throw createError({ statusCode: 400, statusMessage: 'Repository must use owner/name format' })

  try {
    const data = await $fetch<GitHubRepoResponse>(`https://api.github.com/repos/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'enpitsulin.dev',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      timeout: 8000,
      retry: 0,
    })

    return {
      fullName: data.full_name,
      avatarUrl: data.owner.avatar_url,
      description: data.description,
      language: data.language,
      stars: data.stargazers_count,
      forks: data.forks_count,
      license: data.license?.spdx_id === 'NOASSERTION' ? data.license.name : data.license?.spdx_id || null,
    }
  }
  catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode === 404 ? 404 : 502
    throw createError({
      statusCode,
      statusMessage: statusCode === 404 ? 'Repository not found' : 'Unable to load GitHub repository',
    })
  }
}, {
  name: 'github-repo',
  maxAge: 60 * 60,
  swr: true,
})
