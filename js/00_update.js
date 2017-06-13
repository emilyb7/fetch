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


// update model
const update = (model, action) => {
  switch(action.type) {
    case 'fetchData':
      return Object.assign({}, model, { isFetching: true, } )
    case 'receiveData':
      return Object.assign({}, model, {
        data: action.data,
        isFetching: false,
        err: null,
      })
    case 'onInput':
      return Object.assign({}, model, { input: action.value, })
    case 'onSubmit':
      return Object.assign({}, model, {
        input: '',
        githubHandle: model.input,
        isFetching: true,
        data: model.data,
      })
    case 'notFound':
      return Object.assign({}, model, {
        githubHandle: '',
        input: model.githubHandle,
        data: {},
        isFetching: false,
        err: 'NOT_FOUND',]]
      })
    default:
      return model
  }
}
