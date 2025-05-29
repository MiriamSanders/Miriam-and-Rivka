const mysql = require('mysql2/promise');
const dbPromise = require("./dbConnection");

async function GenericGet(table, fieldName, fieldValue, limit, offset) {
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
async function GenericGetIn(table, fieldName, fieldValues, fields = ['*']) {
  try {
    if (!Array.isArray(fieldValues) || fieldValues.length === 0) {
      return [];
    }

    const db = await dbPromise;

    const query = `
      SELECT ${fields.map(() => '??').join(', ')}
      FROM ??
      WHERE ?? IN (${fieldValues.map(() => '?').join(', ')})
    `;

    const params = [...fields, table, fieldName, ...fieldValues];
    const [rows] = await db.execute(mysql.format(query, params));

    return rows;
  } catch (error) {
    console.error('Error fetching data with IN:', error);
    throw error;
  }
}

async function GenericGetAll(table, limit, offset, columns = []) {
  try {
    const db = await dbPromise;

    const columnsPart = (Array.isArray(columns) && columns.length > 0)
      ? columns.map(col => `\`${col}\``).join(', ')
      : '*';

    let query = `SELECT ${columnsPart} FROM ??`;
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

async function GenericPost(table, data) {
    try {
        const db = await dbPromise;
        const insertQuery = mysql.format(`INSERT INTO ?? SET ?`, [table, data]);
        const [insertResult] = await db.execute(insertQuery);

        let id = insertResult.insertId;

        if (id) {
            const selectQuery = mysql.format(`SELECT * FROM ?? WHERE id = ?`, [table, id]);
            const [rows] = await db.execute(selectQuery);
            return rows[0] || null;
        } else if (data.userId) {
            const idQuery = mysql.format(`SELECT * FROM ?? WHERE userId = ?`, [table, data.userId]);
            const [rows] = await db.execute(idQuery);
            if (rows.length === 0) throw new Error('No record found for the given userID');
            return rows[0];
        } else {
            throw new Error('Insert did not return an ID, and userID was not provided.');
        }
    } catch (error) {
        console.error('Error inserting data:', error);
        throw error;
    }
}

async function GenericPut(table, id, data) {
    try {
        const db = await dbPromise;
        const updateQuery = mysql.format(`
            UPDATE ?? 
            SET ? 
            WHERE id = ?
        `, [table, data, id]);
        await db.execute(updateQuery);
        const selectQuery = mysql.format(`SELECT * FROM ?? WHERE id = ?`, [table, id]);
        const [rows] = await db.execute(selectQuery);
        return rows[0] || null;
    } catch (error) {
        console.error('Error updating data:', error);
        throw error;
    }
}

async function GenericDelete(table, id) {
    try {
        const db = await dbPromise;
        const query = mysql.format(` 
            UPDATE ?? 
            SET is_deleted = 1 
            WHERE id = ?
        `, [table, id]);
        const [result] = await db.execute(query, [table, id]);
        return result.affectedRows;
    } catch (error) {
        console.error('Error deleting data:', error);
        throw error;
    }
}

async function CascadeDelete(table, id, foreignKeyTable, foreignKeyColumn) {
    try {
        const db = await dbPromise;
        const mainQuery = mysql.format(`
            UPDATE ?? 
            SET is_deleted = 1 
            WHERE id = ?
        `, [table, id]);
        await db.execute(mainQuery);
        const cascadeQuery = mysql.format(`
            UPDATE ?? 
            SET is_deleted = 1 
            WHERE ?? = ?
        `, [foreignKeyTable, foreignKeyColumn, id]);
        await db.execute(cascadeQuery);

        return true;
    } catch (error) {
        console.error('Error performing cascade delete:', error);
        throw error;
    }
}
async function writeToLog(data) {
    const db = await dbPromise;
    const logQuery = mysql.format(`INSERT INTO logs SET ?`, [data]);
    await db.execute(logQuery);
}
module.exports = { GenericGet,GenericGetIn,GenericGetAll,GenericPost, GenericPut, GenericDelete, CascadeDelete, writeToLog };