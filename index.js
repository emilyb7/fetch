const model = {
  githubHandle: "emilyb7",
  data: {},
  isFetching: false,
}

const query = {
  query: `query {
    user(login:\"${model.githubHandle}\") {
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

// actions!
const fetchData = (username) => ({
  type: 'fetchData',
})

const receiveData = (data) => ({
  type: 'receiveData',
  data: data,
})

const update = (model, action) => {
  switch(action.type) {
    case 'fetchData':
      return Object.assign({}, model, { isFetching: true, } )
    case 'receiveData':
      return Object.assign({}, model, { data: action.data, isFetching: false, })
    default:
      return model
  }
}

// view
const view = (signal, model, root) => {
  empty(root);
  [
    userData(model),
    repoList(model),
  ].forEach(el => { root.appendChild(el) })
}

// mount
const mount = (model, view, root_element_id) => {

  const root = document.getElementById(root_element_id)
  const signal = action =>
    event => {
      model = update(model, action(event))
      view(signal, model, root)
    }

    view(signal, model, root)

    const ghEndpoint = "https://api.github.com/graphql"

    signal(fetchData)()
    post(ghEndpoint, query, ({ errors, data, }) => {
      if (errors) return errors.forEach(e => { console.log(e.message) })
      signal(receiveData)(success_userDetails(data))
    })
}

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
  githubHandle: model.githubHandle,
  link: "https://github.com/" + model.githubHandle,
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

const empty = node => {
  while (node.firstChild) {
    node.removeChild(node.firstChild)
  }
}

// components

const userData = model => {
  const container = document.createElement('p')
  container.textContent = model.data.githubHandle
  return container
}

const repoList = ({ data, }) => {
  const container = document.createElement('div')
  container.textContent = data.firstRepoName
  return container
}

mount(model, view, "app")
