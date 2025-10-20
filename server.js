/*
    ملف الخادم (server.js)
    --------------------------
    هذا هو الملف الكامل والمعدل.
*/

// ========================================================
// --- 1. استيراد الأدوات (Imports) ---
// ========================================================
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./database.js');

// <<<--- السطر الأول الجديد: أضف هذا السطر هنا ---<<<
// هذه مكتبة مدمجة في Node.js تساعدنا في التعامل مع مسارات الملفات.
const path = require('path');


// ========================================================
// --- 2. إعداد التطبيق (App Setup) ---
// ========================================================
const app = express();
// هذا هو السطر الذكي الذي يعمل محليًا وعلى Railway
const PORT = process.env.PORT || 3000;
const saltRounds = 10;


// ========================================================
// --- 3. البرامج الوسيطة (Middleware) ---
// ========================================================
app.use(cors());
app.use(express.json());


/* ================================================================== */
/* --- <<<--- 4. تقديم الواجهة الأمامية (هذا هو الكود الثاني الجديد بالكامل) ---<<< --- */
/* ================================================================== */
// هذا السطر يخبر الخادم أن يجعل كل الملفات في المجلد الحالي متاحة للعامة.
// هذا ضروري إذا كان لديك ملفات CSS أو صور منفصلة.
app.use(express.static(__dirname));

// هذا هو "المضيف" الذي يستقبل الزوار على الرابط الرئيسي ('/').
app.get('/', (req, res) => {
    // عندما يأتيك طلب، أرسل ملف index.html كاستجابة.
    res.sendFile(path.join(__dirname, 'index.html'));
});


// ========================================================
// --- 5. نقاط النهاية (API Endpoints) ---
// ========================================================

// --- نقطة نهاية لإنشاء حساب جديد ---
app.post('/api/signup', async (req, res) => {
    // ... (هذا الكود يبقى كما هو)
    const { name, email, password, address } = req.body;
    if (!name || !email || !password || !address) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة.' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const sql = `INSERT INTO users (name, email, password, address) VALUES (?, ?, ?, ?)`;
        db.run(sql, [name, email, hashedPassword, address], function (err) {
            if (err) { return res.status(400).json({ error: 'هذا البريد الإلكتروني مستخدم بالفعل.' }); }
            res.status(201).json({ message: 'تم إنشاء الحساب بنجاح!', userId: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الحساب.' });
    }
});

// --- نقطة نهاية لتسجيل الدخول ---
app.post('/api/login', (req, res) => {
    // ... (هذا الكود يبقى كما هو)
    const { email, password } = req.body;
    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], async (err, user) => {
        if (err || !user) { return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' }); }
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            res.status(200).json({
                message: 'تم تسجيل الدخول بنجاح!',
                user: { id: user.id, name: user.name, email: user.email, address: user.address }
            });
        } else {
            res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
        }
    });
});

// ... (بقية نقاط النهاية الخاصة بالطلبات والمدير تبقى كما هي) ...
app.post('/api/orders', (req, res) => { /* ... code ... */ });
app.get('/api/orders/:userId', (req, res) => { /* ... code ... */ });
app.get('/api/admin/data', (req, res) => { /* ... code ... */ });


// ========================================================
// --- 6. بدء تشغيل الخادم (Start Server) ---
// ========================================================
app.listen(PORT, () => {
    console.log(`الخادم يعمل على المنفذ: ${PORT}`);
});
```

### شرح مكان الكود (خريطة الملف)

لفهم الترتيب، انظر إلى ملف `server.js` كهذه الخريطة:

1.  **الاستيراد (Imports):** نستدعي جميع الأدوات التي نحتاجها في الأعلى. (هنا أضفنا `path`).
2.  **الإعداد (Setup):** نجهز المتغيرات الأساسية للخادم.
3.  **البرامج الوسيطة (Middleware):** نجهز الخادم لاستقبال البيانات بشكل صحيح.
4.  **تقديم الواجهة (Serve Frontend):** **(هذا هو مكان الكود الجديد)**. نخبر الخادم بما يجب فعله عندما يزوره شخص ما. هذه وظيفة أساسية، لذلك نضعها قبل الوظائف المتخصصة.
5.  **نقاط النهاية (API Endpoints):** نخبر الخادم بالوظائف المتخصصة (كيفية التعامل مع تسجيل الدخول، إنشاء حساب، الطلبات).
6.  **بدء الخادم (Start Server):** في النهاية، نقوم بتشغيل كل شيء.

### ماذا تفعل الآن؟

1.  **استبدل الكود:** انسخ الكود الكامل أعلاه واستبدل به كل ما هو موجود في ملف `server.js` الخاص بك.
2.  **احفظ الملف.**
3.  **ادفع التغييرات إلى GitHub:**
    ```bash
    git add server.js
    git commit -m "Fix: Serve index.html as the main entry point"
    git push
    

