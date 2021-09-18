const healthCheckRoute = require('./health-check')
const videoTranscriptionRoutes = require('./transcription')

const configureRoutes = (server) => {
  server.use(videoTranscriptionRoutes)
  server.use(healthCheckRoute)
}

module.exports = {
  configureRoutes
}
