const header = require('./fw/header');
const footer = require('./fw/footer');

async function wrapContent(content, req) {
    let headerHtml = await header(req);
    return headerHtml + content + footer;
}

module.exports = { wrapContent };