const axios = require('axios')

async function upload(url, report) {
    const result = await axios.post(url, report)
    return result
}

module.exports = upload

