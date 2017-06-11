const githubHandle = "emilyb7";

/* helper functions */

const getLanguages = repoNodes => repoNodes
  .map(({ languages, }) => languages.nodes)
  .reduce((a, b) => a.concat(b), [])
  .reduce((a, { name, }) => a.concat(a.indexOf(name) > -1 ? [] : [ name, ]), [])

const countStars = repoNodes => repoNodes
  .map(({ stargazers, }) => stargazers.nodes)
  .reduce((a, b) => a + b.length, 0);

const getUsername = ({ login, }) => login;

const success_userDetails = ({ data, }) => {
  console.log("success userDetails");

  console.log(data);

  const firstRepo = data.viewer.repositories.nodes.slice(0).reverse()[1];

  const res = {
    githubHandle: githubHandle,
    link: "https://github.com/" + githubHandle,
    avatar: data.viewer.avatarUrl,
    repos: data.viewer.repositories.nodes.length,
    languages: getLanguages(data.viewer.repositories.nodes),
    stars: countStars(data.viewer.repositories.nodes),
    firstRepoName: firstRepo.name,
    firstRepoUrl: firstRepo.url,
    firstRepoCreated: firstRepo.createdAt,
    firstRepoIssues: firstRepo.issues.nodes.length,
    // firstRepoWatchers: response[0].watchers,
    // firstRepoContributors: response[0].contributors_url,
  };

  console.log(res);

  return res;
}

const success_contributorDetails = (args, response) =>
  Object.assign({}, args, { contributors : response.map(getUsername), });


/* generic request function, can be recycled over and over! */

const post = (url, query, cb) => {

  const init = {
    method: 'POST',
    body: JSON.stringify(query),
    headers: new Headers({
      'Authorization': token,
    }),
  }

  fetch(url, init).then((response) => {
    return response.json()
  }).then(cb)
  .catch((err) => console.log(err))

}

// const updateDOM = obj => {
//   document.getElementById("github-user-handle").textContent = githubHandle;
//   document.getElementById("github-user-link").href = "https://github.com/" + githubHandle;
//   document.getElementById("github-user-avatar").src = obj.avatar;
//   document.getElementById("github-user-repos").textContent = obj.repos;
//   document.getElementById("github-repos-languages").textContent = obj.languages.join(", ");
//   document.getElementById("github-repos-stars").textContent = obj.stars;
//   document.getElementById("github-repo-name").textContent = obj.name;
//   document.getElementById("github-repo-link").href = obj.url;
//   document.getElementById("github-repo-created").textContent = obj.firstRepoCreated;
//   document.getElementById("github-repo-open-issues").textContent = obj.firstRepoIssues;
//   document.getElementById("github-repo-watchers").textContent = obj.firstRepoWatchers;
//   document.getElementById("github-repo-contributors").textContent = obj.contributors.join(", ");
// }

const query = {
  query: "query { viewer { login, avatarUrl, repositories(last: 50) { nodes { name, url, createdAt, languages(first: 10) { nodes { name }}, stargazers(first: 100) { nodes { name }}, issues(first:100) { nodes { url, }} }} } }",
}

post("https://api.github.com/graphql", query, (response) => {
  console.log(response);
  console.log("hello");
  const userDetails = success_userDetails(response)
  console.log(userDetails);
  // // request(userDetails.firstRepoContributors, (contribResponse) => {
  //   console.log(contribResponse);
    // updateDOM(success_contributorDetails(userDetails, contribResponse))
  // })
})
