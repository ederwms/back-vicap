const healthCheckRoute = require('./health-check')
const videoTranscriptionRoutes = require('./video-transcription')

const configureRoutes = (server) => {
  server.use(videoTranscriptionRoutes)
  server.use(healthCheckRoute)
}

module.exports = {
  configureRoutes
}
