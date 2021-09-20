const express = require('express')
const routes = express.Router()
const multer = require('multer')
const multerConfig = require('../../../config/multer.config')

const TranscriptionController = require('../../../controllers/transcription.controller')

routes.get('/api/v1/transcription', TranscriptionController.getTranscriptionJobByName)
routes.get('/api/v1/transcriptions', TranscriptionController.listTranscriptionJobs)
routes.post('/api/v1/transcription', multer(multerConfig).single('file'), TranscriptionController.startVideoTranscription)

module.exports = routes
