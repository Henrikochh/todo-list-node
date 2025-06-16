const db = require('../fw/db');
const { escapeHtml } = require('../fw/security');

async function getUsersHtml(req) {
    const users = await db.executeStatement('SELECT id, username FROM users');

    let html = '<h3>Users</h3><table class="table">';
    html += '<tr><th>ID</th><th>Username</th></tr>';
    for (const user of users) {
        html += `<tr>
            <td>${user.id}</td>
            <td>${escapeHtml(user.username)}</td>
        </tr>`;
    }
    html += '</table>';
    return html;
}

module.exports = {
    html: getUsersHtml
};