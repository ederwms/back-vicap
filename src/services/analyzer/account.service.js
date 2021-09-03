const { customAxios } = require('./_access')

const getAccountToken = async () => {
  console.log('[account] Iniciando busca do token...')

  try {
    const response = await customAxios().get(`
      https://api.videoindexer.ai/Auth/${process.env.VIDEO_ANALYZER_LOCATION}/Accounts/${process.env.VIDEO_ANALYZER_ACCOUNT_ID}/AccessTokenWithPermission?permission=Owner
    `)

    console.log('[account] Consegui o token')

    return response.data
  } catch (error) {
    // TODO tratativa de erro
    console.log(error.response.data)
  }
}

module.exports = {
  getAccountToken
}
