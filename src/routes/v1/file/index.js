const express = require('express')
const routes = express.Router()
const multer = require('multer')
const multerConfig = require('../../../config/multer.config')

const FileController = require('../../../controllers/file.controller')

routes.post('/api/v1/file', multer(multerConfig).single('file'), FileController.createFile)

module.exports = routes
