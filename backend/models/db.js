import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectionLimit: 5
});

// Crie a tabela se não existir
async function testDatabase() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log('Database initialized');
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        if (conn) conn.release();
    }
}

async function getConnection() {
    try {
        const conn = await pool.getConnection();
        console.log('Connection established');
        return conn;
    } catch (err) {
        console.error('Error getting database connection:', err);
        throw err;
    }
}

testDatabase().catch(err => {
    console.error('Failed to initialize database:', err);
});

export default getConnection;
