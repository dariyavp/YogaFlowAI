const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'super_secret_key_yoga_flow_ai_123'; // W środowisku produkcyjnym powinno to być w pliku .env

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Serwowanie plików statycznych HTML, CSS, JS z obecnego katalogu
app.use(express.static(path.join(__dirname, '')));

// --- Endpointy API ---

// 1. Rejestracja użytkownika
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Proszę podać wszystkie dane.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`;
        db.run(sql, [name, email, hashedPassword], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Użytkownik o takim emailu już istnieje.' });
                }
                return res.status(500).json({ error: 'Błąd podczas rejestracji.' });
            }
            res.status(201).json({ message: 'Rejestracja zakończona sukcesem!', userId: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ error: 'Błąd serwera podczas rejestracji.' });
    }
});

// 2. Logowanie użytkownika
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Wymagany wmail oraz hasło.' });
    }

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Błąd podczas logowania.' });
        if (!user) return res.status(401).json({ error: 'Nieprawidłowy email lub hasło.' });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ error: 'Nieprawidłowy email lub hasło.' });

        // Tworzenie tokena
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Ustalenie ciasteczka HttpOnly
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 // 1 godzina
        });

        res.json({ message: 'Zalogowano pomyślnie!', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
});

// 3. Wylogowanie
app.post('/api/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ message: 'Wylogowano.' });
});

// Middleware uwierzytelniający do zabezpieczania tras API
const authenticateToken = (req, res, next) => {
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({ error: 'Nie jesteś zalogowany.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token wygasł lub jest nieprawidłowy.' });
        }
        req.user = user;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Brak uprawnień administratora.' });
    }
};

// 4. Pobieranie danych zalogowanego użytkownika
app.get('/api/me', authenticateToken, (req, res) => {
    const sql = `SELECT id, name, email, role, created_at FROM users WHERE id = ?`;
    db.get(sql, [req.user.id], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ error: 'Nie znaleziono użytkownika.' });
        }
        res.json(user);
    });
});

// 5. Pobieranie wszystkich użytkowników (Tylko Admin)
app.get('/api/admin/users', authenticateToken, isAdmin, (req, res) => {
    const sql = `SELECT id, name, email, role, created_at FROM users`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Błąd podczas pobierania użytkowników.' });
        }
        res.json(rows);
    });
});

// 6. Dodawanie notatki (zalogowany użytkownik)
app.post('/api/notes', authenticateToken, (req, res) => {
    const { wellbeing, results } = req.body;
    const userId = req.user.id;

    const sql = `INSERT INTO user_notes (user_id, wellbeing, results) VALUES (?, ?, ?)`;
    db.run(sql, [userId, wellbeing, results], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Błąd podczas zapisywania notatki.' });
        }
        res.status(201).json({ message: 'Notatka zapisana!', noteId: this.lastID });
    });
});

// 7. Pobieranie notatek użytkownika
app.get('/api/notes', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const sql = `SELECT * FROM user_notes WHERE user_id = ? ORDER BY created_at DESC`;

    db.all(sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Błąd podczas pobierania notatek.' });
        }
        res.json(rows);
    });
});


// 8. Pobieranie wszystkich dostępnych zajęć wideo
app.get('/api/classes', authenticateToken, (req, res) => {
    const sql = `SELECT * FROM classes ORDER BY title`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Błąd podczas pobierania zajęć.' });
        }
        res.json(rows);
    });
});

// 9. Pobieranie zarezerwowanych zajęć użytkownika (z zaplanowanym czasem)
app.get('/api/user-classes', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const sql = `
        SELECT ur.id as reservation_id, ur.scheduled_time, c.* 
        FROM user_reservations ur
        JOIN classes c ON ur.class_id = c.id
        WHERE ur.user_id = ?
        ORDER BY ur.scheduled_time
    `;
    db.all(sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Błąd podczas pobierania Twoich rezerwacji.' });
        }
        res.json(rows);
    });
});

// 10. Rezerwacja wideo zajęć na konkretny czas
app.post('/api/user-classes', authenticateToken, (req, res) => {
    const { classId, scheduledTime } = req.body;
    const userId = req.user.id;

    if (!classId || !scheduledTime) return res.status(400).json({ error: 'Brak ID zajęć lub wybranej daty.' });

    const sql = `INSERT INTO user_reservations (user_id, class_id, scheduled_time) VALUES (?, ?, ?)`;
    db.run(sql, [userId, classId, scheduledTime], function (err) {
        if (err) {
            console.error('Błąd podczas rezerwacji wideo:', err);
            return res.status(500).json({ error: 'Błąd podczas rezerwacji.' });
        }
        res.status(201).json({ message: 'Zarezerwowano pomyślnie!', reservationId: this.lastID });
    });
});

// 11. Anulowanie rezerwacji wideo (po ID rezerwacji)
app.delete('/api/user-classes/:reservationId', authenticateToken, (req, res) => {
    const reservationId = req.params.reservationId;
    const userId = req.user.id;

    const sql = `DELETE FROM user_reservations WHERE user_id = ? AND id = ?`;
    db.run(sql, [userId, reservationId], function (err) {
        if (err) {
            console.error('Błąd podczas anulowania:', err);
            return res.status(500).json({ error: 'Błąd podczas anulowania rezerwacji.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Nie znaleziono rezerwacji do anulowania.' });
        }
        res.json({ message: 'Anulowano rezerwację.' });
    });
});


// Start serwera
app.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
});
