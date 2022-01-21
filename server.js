const fs = require('fs');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const uploadClient = require('./upload');

(async () => {
    const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
    const options = {logLevel: 'info', output: 'html', onlyCategories: ['performance'], port: chrome.port};
    const runnerResult = await lighthouse(process.argv[2] || 'https://www.example.com/', options);
    const uploadUrl = 'http://localhost:8080/add-report' || process.argv[3]
    const report = runnerResult.lhr;
    const audits = summarize(report.audits)
    const metaData = addMetaInfo(audits)
    const greenReport = {
        "url": report.requestedUrl,
        "time": report.fetchTime,
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
    fs.writeFileSync('greenreport.json', JSON.stringify(greenReport));
    fs.writeFileSync('lhrreport.html', runnerResult.report);

    // `.lhr` is the Lighthouse Result as a JS object
    console.log('Report is done for', runnerResult.lhr.finalUrl);
    console.log('Performance score was', runnerResult.lhr.categories.performance.score * 100);
    console.log('Now upload to: ', uploadUrl)
    const uploadData = await uploadClient(uploadUrl, greenReport)
    console.log('Uploaded: ', uploadData)
    await chrome.kill();
})();

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