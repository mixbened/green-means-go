const axios = require('axios')

const summarize = (audits) => {
    for(let audit in audits) {
        const o = audits[audit]
        if (o.score > 0.5) {
            o.color = 'o'
            if (o.score > 0.8) {
                o.color = 'g'
            }
        } else {
            o.color = 'r'
        }
        if (o.score === null) o.color = null
        delete audit.scoreDisplayMode
        delete audit.numericValue
        delete audit.numericUnit

    }
    return audits;
}

const addMetaInfo = (audits) => {
    let sum = 0;
    let count = 0;
    for(let audit in audits) {
        if(audits[audit].score !== null) {
            count++
            sum += audits[audit].score
        }
    }
    return {
        "totalScore": sum/count
    }
}

const uploadToJSONBin = (data) => {
    const base = 'https://api.jsonbin.io/v3/b'
    const headers = {
        "Content-Type": "application/json",
        "X-Master-Key": "$2b$10$71YSiQS7XKEcv6gnMn0RSek/1y5DC2BCMOolXZekF/ptCTsYiNRtK",
        "X-Collection-Id": "61ebd7d56c4a232f9d86fddc"
    }
    return axios.post(base, data, { headers })
}

module.exports = { summarize, addMetaInfo, uploadToJSONBin }