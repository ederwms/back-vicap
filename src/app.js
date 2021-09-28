require('dotenv').config()
require('express-async-errors')

const http = require('http')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')

const { dbUri } = require('./services/service.db/_access')

const routes = require('./routes/v1')

const errorMiddleware = require('./middlewares/error.middleware')

class App {
  constructor () {
    this.app = express()
    this.server = http.createServer(this.app)

    this.database()
    this.middlewares()
    this.routes()
    this.exceptionHandler()
  }

  routes () {
    routes.configureRoutes(this.app)
  }

  database () {
    mongoose.connect(dbUri, { useNewUrlParser: true })
  }

  middlewares () {
    this.app.use(morgan('dev'))
    this.app.use(cors())
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
  }

  exceptionHandler () {
    this.app.use(errorMiddleware)
  }
}

module.exports = new App().server
