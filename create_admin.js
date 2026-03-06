const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const sql = `INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES ('Główny Administrator', 'admin@yogaflow.com', ?, 'admin')`;

        db.run(sql, [hashedPassword], function (err) {
            if (err) {
                console.error('Błąd dodawania admina', err);
            } else {
                console.log('Konto admina utworzone. Email: admin@yogaflow.com, Hasło: admin123');
            }
        });
    } catch (err) {
        console.error(err);
    }
}

createAdmin();
