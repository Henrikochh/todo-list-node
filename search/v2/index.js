const db = require('../../fw/db');
const { escapeHtml } = require('../../fw/security');

async function search(req) {
    const userid = req.session.userid;
    const terms = req.query.terms;

    if (!userid || !terms) {
        return "Not enough information to search";
    }

    let result = '';

    const stmt = await db.executeStatement('SELECT ID, title, state FROM tasks WHERE userID = ? AND title LIKE ?', [userid, `%${terms}%`]);
    if (stmt.length > 0) {
        stmt.forEach(function(row) {
            result += `${escapeHtml(row.title)} (${escapeHtml(row.state)})<br />`;
        });
    }

    return result;
}

module.exports = {
    search: search
};