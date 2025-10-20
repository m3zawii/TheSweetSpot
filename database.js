/*
    ملف إعداد قاعدة البيانات (PostgreSQL)
    ------------------------------------
    هذا الملف يقوم بإعداد الاتصال بقاعدة بيانات PostgreSQL التي يوفرها Railway
    وينشئ الجداول إذا لم تكن موجودة.
*/
const { Pool } = require('pg');

// إنشاء "pool" اتصال. سيستخدم تلقائيًا متغير DATABASE_URL
// الذي يوفره Railway عند النشر.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// وظيفة لإنشاء الجداول
const createTables = async () => {
    const client = await pool.connect();
    try {
        // نستخدم SERIAL بدلاً من INTEGER PRIMARY KEY AUTOINCREMENT
        // ونستخدم VARCHAR بدلاً من TEXT (وهو أكثر شيوعًا في PostgreSQL)
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                address TEXT NOT NULL
            );
        `);
        console.log("جدول 'users' جاهز.");

        // نستخدم TEXT للبيانات الطويلة مثل JSON
        await client.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                "userId" INTEGER NOT NULL REFERENCES users(id),
                items JSONB NOT NULL,
                total NUMERIC NOT NULL,
                "createdAt" TIMESTAMPTZ NOT NULL
            );
        `);
        console.log("جدول 'orders' جاهز.");

    } catch (err) {
        console.error("خطأ في إنشاء الجداول:", err);
    } finally {
        client.release();
    }
};

// تشغيل وظيفة إنشاء الجداول عند بدء تشغيل التطبيق
createTables();

// تصدير الـ pool حتى يتمكن الخادم من استخدامه لإجراء الاستعلامات
module.exports = pool;

