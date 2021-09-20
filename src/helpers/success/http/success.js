class Success {
  constructor (req, res) {
    this.request = req
    this.response = res
  }

  json (data) {
    return this.response.status(200).json(data)
  }
}

module.exports = Success
