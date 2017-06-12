const githubHandle = "emilyb7";

/* helper functions */

const getLanguages = repoNodes => repoNodes
  .map(({ languages, }) => languages.nodes)
  .reduce((a, b) => a.concat(b), [])
  .reduce((a, { name, }) => a.concat(a.indexOf(name) > -1 ? [] : [ name, ]), [])

const countStars = repoNodes => repoNodes
  .map(({ stargazers, }) => stargazers.totalCount)
  .reduce((a, b) => a + b);

const getContributors = userNodes => userNodes
  .map(({ login, }) => login)

const success_userDetails = ({ user, }) => ({
  githubHandle: githubHandle,
  link: "https://github.com/" + githubHandle,
  avatar: user.avatarUrl,
  repos: user.allRepos.totalCount,
  languages: getLanguages(user.allRepos.nodes),
  stars: countStars(user.allRepos.nodes),
  firstRepoName: user.lastRepo.nodes[0].name,
  firstRepoUrl: user.lastRepo.nodes[0].url,
  firstRepoCreated: user.lastRepo.nodes[0].createdAt,
  firstRepoIssues: user.lastRepo.nodes[0].issues.totalCount,
  firstRepoWatchers: user.lastRepo.nodes[0].watchers.totalCount,
  firstRepoContributors: getContributors(user.lastRepo.nodes[0].mentionableUsers.nodes),
});

/* generic request function, can be recycled over and over! */

const post = (url, query, cb) => {

  const init = {
    method: 'POST',
    body: JSON.stringify(query),
    headers: new Headers({ 'Authorization': token, }),
  }

  fetch(url, init).then((response) => {
    return response.json()
  }).then((res) => {
    if (res.errors) {
      cb({ errors: res.errors });
      return
    }
    cb({ errors: null, data: res.data, });
  })
}

const updateDOM = obj => {
  document.getElementById("github-user-handle").textContent = githubHandle;
  document.getElementById("github-user-link").href = "https://github.com/" + githubHandle;
  document.getElementById("github-user-avatar").src = obj.avatar;
  document.getElementById("github-user-repos").textContent = obj.repos;
  document.getElementById("github-repos-languages").textContent = obj.languages.join(", ");
  document.getElementById("github-repos-stars").textContent = obj.stars;
  document.getElementById("github-repo-name").textContent = obj.name;
  document.getElementById("github-repo-link").href = obj.url;
  document.getElementById("github-repo-created").textContent = obj.firstRepoCreated;
  document.getElementById("github-repo-open-issues").textContent = obj.firstRepoIssues;
  document.getElementById("github-repo-watchers").textContent = obj.firstRepoWatchers;
  document.getElementById("github-repo-contributors").textContent = obj.firstRepoContributors.join(", ");
}

const query = {
  query: `query {
    user(login:\"${githubHandle}\") {
      avatarUrl,
      allRepos: repositories(last:100) {
        totalCount,
        nodes {
          languages(first:10) { nodes { name }}
          stargazers { totalCount }
        }
      }
      lastRepo: repositories(last:1) {
        nodes {
          name,
          url,
          createdAt,
          issues(states:OPEN) { totalCount },
          watchers { totalCount },
          mentionableUsers(last:100) { nodes { login, }}
        } },
    },
  }`
}

post("https://api.github.com/graphql", query, ({ errors, data, }) => {
  if (errors) {
    errors.forEach(e => { console.log(e.message) })
    return
  }
  const userDetails = success_userDetails(data)
  console.log(userDetails);
  updateDOM(userDetails)
})
