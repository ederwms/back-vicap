class NoContent {
  constructor (req, res) {
    this.request = req
    this.response = res
  }

  send () {
    return this.response.status(204).send()
  }
}

module.exports = NoContent
