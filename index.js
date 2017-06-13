const model = {
  githubHandle: "emilyb7",
  input: 'emilyb7',
  data: {},
  isFetching: false,
  err: null,
}

const query = githubHandle => ({
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
      topRepos: repositories(last:5) {
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
})

// actions!
const fetchData = () => ({
  type: 'fetchData',
})

const receiveData = (data) => ({
  type: 'receiveData',
  data: data,
})

const onInput = event => ({
  type: 'onInput',
  value: event.target.value,
})

const onSubmit = () => ({
  type: 'onSubmit',
})

const notFound = () => ({
  type: 'notFound',
})

// update

const update = (model, action) => {
  console.log({ model, action, });
  switch(action.type) {
    case 'fetchData':
      return Object.assign({}, model, { isFetching: true, } )
    case 'receiveData':
      return Object.assign({}, model, { data: action.data, isFetching: false, err: null, })
    case 'onInput':
      return Object.assign({}, model, { input: action.value, })
    case 'onSubmit':
      return Object.assign({}, model, {
        input: '',
        githubHandle: model.input,
        isFetching: true,
        data: model.data,
      })
    case 'notFound': {
      console.log("notFound");
        return Object.assign({}, model, {
          githubHandle: '',
          input: model.githubHandle,
          data: {},
          isFetching: false,
          err: 'NOT_FOUND',
        })
    }

    default:
      return model
  }
}

// view
const view = (signal, model, root) => {
  console.log({model});
  empty(root);

  if (model.err === 'NOT_FOUND') {
    console.log("user not found");
    [
      input(model, signal, { onInput, onSubmit, })
    ].forEach(el => {
      root.appendChild(el)
    })
  } else {
    [
      userData(model),
      repoList(model.data.topRepos),
      input(model, signal, { onInput, onSubmit, }),
    ].forEach(el => {
      root.appendChild(el)
    })
  }

  document.getElementById('input').focus()
}

// mount
const mount = (model, view, root_element_id) => {
  const ghEndpoint = "https://api.github.com/graphql"

  const root = document.getElementById(root_element_id)

  const signal = action =>
    event => {
      const nextAction = action(event)
      const nextState = update(model, nextAction)
      if (nextAction.type === 'onSubmit') {
        view(signal, nextState, root)
        post(ghEndpoint, query(nextState.githubHandle), ({ errors, data, }) => {
          console.log({ errors, data, });
          if (errors) {
            errors.forEach(e => { console.log({err: e, }) })
            if (errors.find(({ type, }) => type === 'NOT_FOUND')) {
              model = update(nextState, notFound())
              view(signal, model, root)
              return
            }
          }
          model = update(nextState, receiveData(success_userDetails(data)))
          view(signal, model, root)
          return
        })
      }
      model = nextState;
      view(signal, nextState, root)
    }

    signal(fetchData)()
    post(ghEndpoint, query(model.githubHandle), ({ errors, data, }) => {
      if (errors) return errors.forEach(e => { console.log(e.message) })
      signal(receiveData)(success_userDetails(data))
    })

    view(signal, model, root)
}

/* helper functions */

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

const userData = ({ githubHandle, data, }) => {
  console.log({ userData: data,});
  const container = document.createElement('div')
  container.id = "user-details"

  const avatar = document.createElement('img')
  if (data.avatar) {
    avatar.src = data.avatar
  }

  const handle = document.createElement('h1')
  const link = document.createElement('a')
  link.href = "https://github.com/" + githubHandle
  link.textContent = githubHandle
  link.target = "_blank"
  handle.appendChild(link)

  const list = document.createElement('ul');

  if (data.repos) {
    [ "repos", "languages", "stars", ].forEach(prop => {
      const value = data[prop]
      const item = document.createElement('li')
      item.textContent = `${prop}: ${value}`
      list.appendChild(item)
    })
  }

  container.appendChild(handle)
  container.appendChild(avatar)
  container.appendChild(list)
  return container
}

const repoDetail = (title, data) => {
  const detail = document.createElement('p')
  detail.classList.add('repo-detail')
  detail.textContent = `${title}: ${data}`
  return detail
}

const repoList = (repos) => {
  const container = document.createElement('ul')
  if (repos) {
    repos.forEach(repo => {
      const item = document.createElement('li')
      item.classList.add("repo")

      const box = document.createElement('div')
      box.classList.add("repo-inner")

      const title = document.createElement('h2')
      title.textContent = repo.name
      box.appendChild(title)
      item.appendChild(box)
      container.appendChild(item)

      const date = repoDetail('date', repo.createdAt.slice(1, 10))
      box.appendChild(date)

      const issues = repoDetail('Open issues', repo.issues)
      box.appendChild(issues)

      const watchers = repoDetail('Watchers', repo.watchers)
      box.appendChild(watchers)

      const contributors = repoDetail('Contributors', repo.contributors.join(', '))
      box.appendChild(contributors)
    })
  }
  return container;
}

const input = ({ input, }, signal, { onInput, onSubmit}) => {
  const container = document.createElement('div')
  container.id = 'input-container'

  const field = document.createElement('input')
  field.type = 'text'
  field.value = input
  field.autofocus = true
  field.id = 'input'
  field.oninput = signal(onInput)
  container.appendChild(field)

  const btn = document.createElement('button')
  btn.textContent = 'Go'
  btn.onclick = signal(onSubmit)
  container.appendChild(btn)
  return container
}

mount(model, view, "app")
