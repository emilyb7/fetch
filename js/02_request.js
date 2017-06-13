/* generic function for fetching data via graphql */

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
