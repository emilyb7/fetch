const githubHandle = "emilyb7";

/* helper functions */

const getLanguages = arr =>
  arr.map(({ language, }) => language)
    .reduce((a, b) => a.concat(!!b && a.indexOf(b) < 0 ? [b] : []), []);

const countStars = arr =>
  arr.reduce((a, b) => a + b.stargazers_count, 0);

const getUsername = ({ login, }) => login;

const success_userDetails = response => ({
    githubHandle: githubHandle,
    link: "https://github.com/" + githubHandle,
    avatar: response[0].owner.avatar_url,
    repos: response.length,
    languages: getLanguages(response),
    stars: countStars(response),
    firstRepoName: response[0].name,
    firstRepoUrl: response[0].html_url,
    firstRepoCreated: response[0].created_at.substr(0, 10),
    firstRepoIssues: response[0].open_issues,
    firstRepoWatchers: response[0].watchers,
    firstRepoContributors: response[0].contributors_url,
  });

const success_contributorDetails = (args, response) =>
  Object.assign({}, args, { contributors : response.map(getUsername), });


/* generic request function, can be recycled over and over! */

const request = (url, cb) => {

  const init = {
    method: 'GET',
    mode: 'cors',
    cache: 'default',
  }

  fetch(url, init).then((response) => {
    return response.json()
  }).then(cb)
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
  document.getElementById("github-repo-contributors").textContent = obj.contributors.join(", ");
}

request("https://api.github.com/users/" + githubHandle + "/repos", (response) => {
  const userDetails = success_userDetails(response)
  request(userDetails.firstRepoContributors, (contribResponse) => {
    updateDOM(success_contributorDetails(userDetails, contribResponse))
  })
})
