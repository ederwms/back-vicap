const express = require('express')
const routes = express.Router()

const TranscriptionController = require('../../../controllers/transcription.controller')

routes.get('/api/v1/transcription', TranscriptionController.getVideoTranscription)

module.exports = routes
