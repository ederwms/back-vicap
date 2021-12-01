const healthCheckRoute = require('./health-check')
const videoTranscriptionRoutes = require('./transcription')
const fileRoutes = require('./file')

const configureRoutes = (server) => {
  server.use(videoTranscriptionRoutes)
  server.use(fileRoutes)
  server.use(healthCheckRoute)
}

module.exports = {
  configureRoutes
}
