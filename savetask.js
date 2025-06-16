const db = require('./fw/db');

async function save(req, res) {
    const { id, task, status } = req.body;
    const userId = req.session.userid;

    if (id && task && status && userId) {
        await db.executeStatement(
            'UPDATE tasks SET task = ?, status = ? WHERE id = ? AND user_id = ?',
            [task, status, id, userId]
        );
    }
}

module.exports = { save };