const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const pool = require('./database.js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const saltRounds = 10;

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- API Endpoints ---

app.post('/api/signup', async (req, res) => {
    const { name, email, password, address } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const sql = `INSERT INTO users (name, email, password, address) VALUES ($1, $2, $3, $4) RETURNING id`;
        const result = await pool.query(sql, [name, email, hashedPassword, address]);
        res.status(201).json({ message: 'Account created successfully!', userId: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Email may already be in use or another error occurred.' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const sql = `SELECT * FROM users WHERE email = $1`;
        const result = await pool.query(sql, [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            res.status(200).json({
                message: 'Login successful!',
                user: { id: user.id, name: user.name, email: user.email, address: user.address }
            });
        } else {
            res.status(401).json({ error: 'Invalid email or password.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'A server error occurred.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
```

#### الخطوة الثالثة والأخيرة: الدفع إلى GitHub

الآن بعد أن قمت بتنظيف ملفاتك، كل ما عليك فعله هو حفظ هذه التغييرات ورفعها إلى GitHub.

1.  **احفظ الملفات** التي قمت بتعديلها.
2.  **افتح الترمينال** في مجلد مشروعك وقم بتشغيل الأوامر التالية:

    ```bash
    git add .
    git commit -m "Fix: Clean up server files from non-code text"
    git push
    

