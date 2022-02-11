const utilities = require('./utilities/utilities')

async function upload(report) {
    const audits = utilities.summarize(report)
    const metaData = utilities.addMetaInfo(audits)
    const greenReport = {
        metaData,
        "audits": {
            "network": {
                "network-requests": audits["network-requests"],
                "third-party-summary": audits["third-party-summary"],
            },
            "serverPerformance": {
                "network-server-latency": audits["network-server-latency"],
                "server-response-time": audits["server-response-time"],
            },
            "frontendLoad": {
                "no-unload-listeners": audits["no-unload-listeners"],
                "no-composited-animations": audits["no-composited-animations"],
                "total-byte-weight": audits["total-byte-weight"],
                "unused-css-rules": audits["unused-css-rules"],
                "unused-javascript": audits["unused-javascript"],
                "duplicated-javascript": audits["duplicated-javascript"],
                "legacy-javascript": audits["legacy-javascript"],
                "use-passive-event-listeners": audits["use-passive-event-listeners"],
            },
            "cache": {
                "uses-long-cache-ttl": audits["uses-long-cache-ttl"],
            },
            "assetOptimization": {
                "unsized-images": audits["unsized-images"],
                "unminified-css": audits["unminified-css"],
                "unminified-javascript": audits["unminified-javascript"],
                "modern-image-formats": audits["modern-image-formats"],
                "uses-optimized-images": audits["uses-optimized-images"],
                "uses-text-compression": audits["uses-text-compression"],
                "uses-responsive-images": audits["uses-responsive-images"],
                "efficient-animated-content": audits["efficient-animated-content"],
            }
        },
        "actions": {
            "long-tasks": audits["long-tasks"]
        }
    }
    const result = await utilities.uploadToJSONBin(greenReport)
    return result
}

module.exports = upload

