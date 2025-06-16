const mysql = require('mysql2/promise');
const dbConfig = require('../config');

const pool = mysql.createPool(dbConfig);

async function executeStatement(statement, params = []) {
    try {
        const [results] = await pool.execute(statement, params);
        return results;
    } catch (error) {
        console.error('SQL Error:', error.message);
        throw new Error('A database error occurred.');
    }
}

module.exports = { executeStatement, pool };