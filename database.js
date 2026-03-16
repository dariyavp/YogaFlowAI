const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Błąd połączenia z bazą SQLite', err.message);
    } else {
        console.log('Połączono z bazą SQLite');
    }
});

// Tworzenie tabel
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'customer',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Błąd podczas tworzenia tabeli users', err.message);
        } else {
            console.log('Tabela users gotowa');

            // Opcjonalnie: Utworzenie domyślnego konta admina
            // const bcrypt = require('bcrypt');
            // const hash = bcrypt.hashSync('admin123', 10);
            // db.run(`INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES ('Admin', 'admin@example.com', ?, 'admin')`, [hash]);
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS user_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            wellbeing TEXT,
            results TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `, (err) => {
        if (err) {
            console.error('Błąd podczas tworzenia tabeli user_notes', err.message);
        } else {
            console.log('Tabela user_notes gotowa');

            // Opcjonalnie: Utworzenie domyślnego konta admina
            // const bcrypt = require('bcrypt');
            // const hash = bcrypt.hashSync('admin123', 10);
            // db.run(`INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES ('Admin', 'admin@example.com', ?, 'admin')`, [hash]);
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            duration INTEGER NOT NULL,
            video_url TEXT NOT NULL
        )
    `, (err) => {
        if (err) {
            console.error('Błąd podczas tworzenia tabeli classes', err.message);
        } else {
            console.log('Tabela classes gotowa');
            // Seed classes if empty
            db.get("SELECT COUNT(*) AS count FROM classes", (err, row) => {
                if (row && row.count === 0) {
                    const stmt = db.prepare("INSERT INTO classes (title, duration, video_url) VALUES (?, ?, ?)");

                    stmt.run(['Poranna Vinyasa Flow', 30, 'https://www.youtube.com/embed/v7AYKMP6rOE']);
                    stmt.run(['Joga Relaksacyjna na Dobry Sen', 45, 'https://www.youtube.com/embed/BiqaNN1Zc1I']);
                    stmt.run(['Ashtanga Vinyasa dla Początkujących', 60, 'https://www.youtube.com/embed/5XCBOW7s0EE']);
                    stmt.run(['Medytacja i oddech (Pranajama)', 20, 'https://www.youtube.com/embed/inpok4MKVLM']);
                    stmt.run(['Joga na bóle pleców i lędźwi', 25, 'https://www.youtube.com/embed/2zE_b8E645o']);
                    stmt.run(['Rozluźnienie karku i ramion', 15, 'https://www.youtube.com/embed/SedzswEwpPw']);
                    stmt.run(['Joga na odstresowanie i wyciszenie', 30, 'https://www.youtube.com/embed/b1H3xO3x_Js']);
                    stmt.run(['Szybka poranna energia (Rozbudzenie)', 10, 'https://www.youtube.com/embed/K-pGq_wEnM4']);
                    stmt.run(['Głębokie rozciąganie bioder i relaks', 35, 'https://www.youtube.com/embed/8-W71OaU1oY']);
                    stmt.run(['Wzmacniająca Vinyasa na całe ciało', 40, 'https://www.youtube.com/embed/v7AYKMP6rOE']);
                    stmt.finalize();
                    console.log('Dodano 10 przykładowych wideo zajęć do bazy.');
                }
            });
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS user_reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            class_id INTEGER NOT NULL,
            scheduled_time DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (class_id) REFERENCES classes (id)
        )
    `, (err) => {
        if (err) {
            console.error('Błąd podczas tworzenia tabeli user_reservations', err.message);
        } else {
            console.log('Tabela user_reservations gotowa');
        }
    });
});

module.exports = db;
