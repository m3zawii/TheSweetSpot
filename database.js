/*
    ملف إعداد قاعدة البيانات (database.js)
    --------------------------------------
    الغرض: هذا الملف يُشغَّل مرة واحدة فقط. وظيفته هي إنشاء ملف قاعدة البيانات
    (bakery.db) وبناء الجداول (الأرفف) التي سنخزن عليها بياناتنا.
*/

// 1. استيراد أداة SQLite للتواصل مع قاعدة البيانات.
const sqlite3 = require('sqlite3').verbose();

// 2. تحديد اسم ملف قاعدة البيانات. كل بياناتنا ستُحفظ هنا.
const DB_SOURCE = 'bakery.db';

// 3. إنشاء اتصال مع قاعدة البيانات. إذا لم يكن الملف موجودًا، سيتم إنشاؤه.
let db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        // إذا حدث خطأ، قم بطباعته في الكونسول.
        console.error("خطأ في الاتصال بقاعدة البيانات:", err.message);
        throw err;
    } else {
        console.log('تم الاتصال بنجاح بقاعدة بيانات SQLite.');
        // db.serialize تضمن تنفيذ الأوامر بالترتيب.
        db.serialize(() => {
            // 4. أمر SQL لإنشاء جدول المستخدمين (users).
            // IF NOT EXISTS تمنع حدوث خطأ إذا كان الجدول موجودًا بالفعل.
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    password TEXT NOT NULL,
                    address TEXT NOT NULL
                )
            `, (err) => {
                if (err) {
                    console.error("خطأ في إنشاء جدول 'users':", err);
                } else {
                    console.log("جدول 'users' جاهز.");
                }
            });

            // 5. أمر SQL لإنشاء جدول الطلبات (orders).
            db.run(`
                CREATE TABLE IF NOT EXISTS orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    userId INTEGER NOT NULL,
                    items TEXT NOT NULL,
                    total REAL NOT NULL,
                    createdAt TEXT NOT NULL,
                    FOREIGN KEY (userId) REFERENCES users (id)
                )
            `, (err) => {
                if (err) {
                    console.error("خطأ في إنشاء جدول 'orders':", err);
                } else {
                    console.log("جدول 'orders' جاهز.");
                }
            });
        });
    }
});

// 6. تصدير الاتصال بقاعدة البيانات حتى يتمكن ملف server.js من استخدامه.
module.exports = db;


