// view
const view = (signal, model, root) => {
  empty(root);

  if (model.err === 'NOT_FOUND') {
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

// components
const userData = ({ githubHandle, data, }) => {
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

// helper functions - DOM
const empty = node => {
  while (node.firstChild) {
    node.removeChild(node.firstChild)
  }
}
