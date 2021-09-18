const express = require('express')
const routes = express.Router()

const TranscriptionController = require('../../../controllers/transcription.controller')

routes.get('/api/v1/transcription', TranscriptionController.getTranscriptionJobByName)
routes.get('/api/v1/transcriptions', TranscriptionController.listTranscriptionJobs)
routes.post('/api/v1/transcription', TranscriptionController.startVideoTranscription)

module.exports = routes
