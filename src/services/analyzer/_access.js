const axios = require('axios')

const customAxios = () => {
  const instance = axios.create({
    headers: {
      'Cache-Control': 'no-cache',
      'Ocp-Apim-Subscription-Key': process.env.VIDEO_ANALYZER_SUBSCRIPTION_KEY
    }
  })

  return instance
}

module.exports = {
  customAxios
}
