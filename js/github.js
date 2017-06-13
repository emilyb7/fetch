const getLanguages = repoNodes => repoNodes
  .map(({ languages, }) => languages.nodes)
  .reduce((a, b) => a.concat(b), [])
  .reduce((a, { name, }) => a.concat(a.indexOf(name) > -1 ? [] : [ name, ]), [])

const countStars = repoNodes =>
  !repoNodes.length
    ? 0
    : repoNodes
      .map(({ stargazers, }) => stargazers.totalCount)
      .reduce((a, b) => a + b)

const getContributors = userNodes => userNodes
  .map(({ login, }) => login)

const repoDetails = repo => ({
  name: repo.name,
  url: repo.url,
  createdAt: repo.createdAt,
  issues: repo.issues.totalCount,
  watchers: repo.watchers.totalCount,
  contributors: getContributors(repo.mentionableUsers.nodes),
})

const success_userDetails = ({ user, }) => ({
  avatar: user.avatarUrl,
  repos: user.allRepos.totalCount,
  languages: getLanguages(user.allRepos.nodes),
  stars: countStars(user.allRepos.nodes),
  topRepos: user.topRepos.nodes.map(repoDetails),
});
