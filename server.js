const fs = require('fs');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const uploadClient = require('./upload');

(async () => {
    let uploadData
    const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
    const options = {logLevel: 'info', output: 'html', onlyCategories: ['performance'], port: chrome.port};
    const runnerResult = await lighthouse(process.argv[2] || 'https://www.example.com/', options);
    const uploadKey = 'abc123' || process.argv[3]
    const report = runnerResult.lhr;

    delete report.audits['viewport']
    delete report.audits['final-screenshot']
    delete report.audits['screenshot-thumbnails']
    delete report.audits['first-contentful-paint']
    delete report.audits['largest-contentful-paint']
    delete report.audits['first-meaningful-paint']
    delete report.audits['user-timings']
    delete report.audits['bootup-time']
    delete report.audits['main-thread-tasks']
    delete report.audits['metrics']
    delete report.audits['metrics']
    delete report.audits['metrics']

    const metaData = addMetaInfo(report.audits)

    // `.lhr` is the Lighthouse Result as a JS object
    console.log('Report is done for', runnerResult.lhr.finalUrl);
    console.log('Performance score was', metaData.totalScore * 100);
    console.log('Now upload to API with key: ', uploadKey)
    try {
        uploadData = await uploadClient(report.audits)
        console.log('Uploaded: ', uploadData)
    } catch (e) {
        console.log('Uploaded Error.', e)
    }
    await chrome.kill();
})();


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