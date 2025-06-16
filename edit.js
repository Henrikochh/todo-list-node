const db = require('./fw/db');
const { escapeHtml } = require('./fw/security');

async function html(req, res) {
    const taskId = req.query.id;
    const userId = req.session.userid;

    const tasks = await db.executeStatement('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);

    if (tasks.length === 0) {
        return '<p>Task not found or you do not have permission to edit it.</p>';
    }

    const task = tasks[0];

    return `
    <h3>Edit Task</h3>
    <form method="post" action="/savetask">
        <input type="hidden" name="_csrf" value="${res.locals.csrfToken}">
        <input type="hidden" name="id" value="${task.id}">
        <div class="form-group">
            <label for="task">Task</label>
            <input type="text" class="form-control size-large" name="task" id="task" value="${escapeHtml(task.task)}">
        </div>
        <div class="form-group">
            <label for="status">Status</label>
            <select name="status" id="status" class="form-control">
                <option value="0" ${task.status === 0 ? 'selected' : ''}>Open</option>
                <option value="1" ${task.status === 1 ? 'selected' : ''}>Done</option>
            </select>
        </div>
        <div class="form-group">
            <input type="submit" class="btn" value="Save">
        </div>
    </form>`;
}

module.exports = { html };