const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const createTables = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                address TEXT NOT NULL
            );
        `);
        console.log("Table 'users' is ready.");

        await client.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                "userId" INTEGER NOT NULL REFERENCES users(id),
                items JSONB NOT NULL,
                total NUMERIC NOT NULL,
                "createdAt" TIMESTAMPTZ NOT NULL
            );
        `);
        console.log("Table 'orders' is ready.");

    } catch (err) {
        console.error("Error creating tables:", err);
    } finally {
        client.release();
    }
};

createTables();

module.exports = pool;

