const db = require('../fw/db');
const { escapeHtml } = require('../fw/security');

async function getHtml(req) {
    let html = `
    <section id="list">
        <a href="edit">Create Task</a>
        <table>
            <tr>
                <th>ID</th>
                <th>Description</th>
                <th>State</th>
                <th></th>
            </tr>
    `;

    const tasks = await db.executeStatement('SELECT ID, title, state FROM tasks WHERE UserID = ?', [req.session.userid]);

    for (const task of tasks) {
        html += `
            <tr>
                <td>${task.ID}</td>
                <td class="wide">${escapeHtml(task.title)}</td>
                <td>${ucfirst(task.state)}</td>
                <td>
                    <a href="edit?id=${task.ID}">edit</a> | <a href="delete?id=${task.ID}">delete</a>
                </td>
            </tr>`;
    }

    html += `
        </table>
    </section>`;

    return html;
}

function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
    html: getHtml
}