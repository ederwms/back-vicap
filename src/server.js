const app = require('./app')

const port = process.env.PORT || 3000
const environment = process.env.NODE_ENV || 'development'

app.listen(port, () => {
  console.log(`Server ${environment} running on port ${port}`)
})
