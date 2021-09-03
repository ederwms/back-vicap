const express = require('express')
const routes = express.Router()

routes.get('/api/v1/health-check', (req, res) => {
  return res.json({
    status: 'ok'
  })
})

module.exports = routes
