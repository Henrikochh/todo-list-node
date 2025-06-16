const db = require('./fw/db');
const { escapeHtml } = require('./fw/security');

async function html(req, res) {
    const tasks = await db.executeStatement('SELECT * FROM tasks WHERE user_id = ?', [req.session.userid]);
    
    let tasksHtml = '<h3>My Tasks</h3><table class="table">';
    tasksHtml += '<tr><th>Task</th><th>Status</th><th></th></tr>';
    for (const task of tasks) {
        tasksHtml += `<tr>
            <td>${escapeHtml(task.task)}</td>
            <td>${task.status === 1 ? 'Done' : 'Open'}</td>
            <td><a href="/edit?id=${task.id}" class="btn">Edit</a></td>
        </tr>`;
    }
    tasksHtml += '</table>';

    let addTaskForm = `
        <h3>Add New Task</h3>
        <form method="post" action="/">
             <input type="hidden" name="_csrf" value="${res.locals.csrfToken}">
            <div class="form-group">
                <label for="task">Task</label>
                <input type="text" class="form-control size-medium" name="task" id="task" required>
            </div>
            <div class="form-group">
                <input type="submit" class="btn" value="Add Task">
            </div>
        </form>`;

    return tasksHtml + addTaskForm;
}

async function addTask(req, res) {
    const { task } = req.body;
    const userId = req.session.userid;
    if (task && userId) {
        await db.executeStatement('INSERT INTO tasks (task, user_id) VALUES (?, ?)', [task, userId]);
    }
}

module.exports = { html, addTask };