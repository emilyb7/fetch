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

mount(model, view, "app")
