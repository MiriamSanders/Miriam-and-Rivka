const mysql = require('mysql2/promise');
const dbPromise = require("./dbConnection");

async function genericGet(table, fieldName, fieldValue, limit, offset) {
    try {
        const db = await dbPromise;
        const params = [table, fieldName, fieldValue];
        let query = `
            SELECT * 
            FROM ??
            WHERE ?? = ? 
        `;
        if (limit) {
            query += ` LIMIT ?`;
            params.push(limit);
        }
        if (offset) {
            query += ` OFFSET ?`;
            params.push(offset);
        }
        const [rows] = await db.execute(mysql.format(query, params));
        if (rows.length === 0) {
            return null;
        }
        return rows;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
async function genericGetByColumnName(table, id, column) {
    try {
        const db = await dbPromise;
        const query = mysql.format(`SELECT * FROM ?? WHERE ?? = ?`, [table, column, id,]);
        const [rows] = await db.execute(query);
        if (rows.length === 0) {
            return null;
        }
        return rows[0];
    }
    catch (error) {
        console.error('Error fetching data by ID:', error);
        throw error;
    }
}
async function genericGetAll(table, limit, offset) {
    try {
        const db = await dbPromise;
        let query = `SELECT * FROM ??`;
        const params = [table];

        if (limit) {
            query += ` LIMIT ?`;
            params.push(limit);
        }

        if (offset) {
            query += ` OFFSET ?`;
            params.push(offset);
        }
        const [rows] = await db.execute(mysql.format(query, params));
        return rows;
    } catch (error) {
        console.error('Error fetching all data:', error);
        throw error;
    }
}
async function genericPost(table, data, returnId = "userId") {
    try {
        const db = await dbPromise;
        const insertQuery = mysql.format(`INSERT INTO ?? SET ?`, [table, data]);
        const [insertResult] = await db.execute(insertQuery);

        let id = insertResult.insertId;
        if (id) {
            const selectQuery = mysql.format(`SELECT * FROM ?? WHERE ?? = ?`, [table, returnId, id]);
            const [rows] = await db.execute(selectQuery);
            return rows[0] || null;
        } else if (data[returnId]) {

            const idQuery = mysql.format(`SELECT * FROM ?? WHERE ?? = ?`, [table, returnId, data[returnId]]);
            const [rows] = await db.execute(idQuery);
            if (rows.length === 0) throw new Error('No record found for the given ID');
            return rows[0];
        } else {
            throw new Error('Insert did not return an ID, and userID was not provided.');
        }
    } catch (error) {
        console.error('Error inserting data:', error);
        throw error;
    }
}
async function genericPut(table, userId, data) {
    try {
        const db = await dbPromise;
        const updateQuery = mysql.format(`
            UPDATE ?? 
            SET ? 
            WHERE userId = ?
        `, [table, data, userId]);
        await db.execute(updateQuery);
        const selectQuery = mysql.format(`SELECT * FROM ?? WHERE userId = ?`, [table, userId]);
        const [rows] = await db.execute(selectQuery);
        return rows[0] || null;
    } catch (error) {
        console.error('Error updating data:', error);
        throw error;
    }
}
async function genericDelete(table, id, fieldName) {
    try {
        const db = await dbPromise;
        const query = mysql.format(` 
            DELETE FROM ??
            WHERE ?? = ?
        `, [table, fieldName, id]);
        const [result] = await db.execute(query, [table, id]);
        return result.affectedRows;
    } catch (error) {
        console.error('Error deleting data:', error);
        throw error;
    }
}
module.exports = {
     genericGet, 
     genericPut, 
     genericPost, 
     genericGetAll, 
     genericGetByColumnName, 
     genericDelete 
};