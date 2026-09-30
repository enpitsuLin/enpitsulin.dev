export function normalizeGitHubRepo(value: string) {
  const repo = value.trim()
  if (!/^[a-z\d][a-z\d-]{0,38}\/[\w.-]{1,100}$/i.test(repo) || repo.endsWith('/.') || repo.endsWith('/..'))
    return undefined

  return repo
}
