class Created {
  constructor (req, res) {
    this.request = req
    this.response = res
  }

  json (data) {
    return this.response.status(201).json(data)
  }
}

module.exports = Created
