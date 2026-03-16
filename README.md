 rea# YogaFlow AI 🧘‍♀️💻

YogaFlow AI to nowoczesna aplikacja webowa stworzona do zarządzania zajęciami jogi. Oferuje ona platformę, na której użytkownicy mogą założyć konto, logować się, rezerwować zajęcia (wideo) oraz śledzić swoje postępy i notatki treningowe. Aplikacja posiada również dedykowany panel administratora.

## 🛠 Technologie

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (z responsywnym designem i ikonami FontAwesome)
- **Backend:** Node.js, Express.js
- **Baza danych:** SQLite3
- **Autentykacja:** JSON Web Tokens (JWT), bcrypt (haszowanie haseł), ciasteczka (HttpOnly)

## ✨ Główne funkcje

### 👤 Dla Klienta:
* Rejestracja i logowanie (zabezpieczone haszowaniem haseł bcrypt).
* Dostęp do dedykowanego panelu Klienta (`customer_account.html`).
* Możliwość przeglądania dostępnych zajęć wideo.
* Rezerwacja wybranych zajęć na konkretny dzień i godzinę.
* Anulowanie swoich rezerwacji.
* Możliwość zapisywania notatek/rezultatów treningowych związanych z samopoczuciem.

### 👑 Dla Administratora (opcjonalnie):
* Dedykowany panel administracyjny (`admin_panel.html`).
* Dostęp do listy wszystkich zarejestrowanych klientów.
* Zabezpieczony dostęp tylko dla użytkowników z przypisaną rolą `admin` w bazie danych.

## 🚀 Jak uruchomić projekt lokalnie?

Ważne: Aplikacja wykorzystuje swój własny serwer oparty na Node.js do obsługi zapytań API (logowanie, baza danych). **Nie należy** otwierać plików HTML bezpośrednio w przeglądarce ani korzystać z wtyczek takich jak *Live Server*.

### Wymagania wstępne
- Zainstalowane środowisko [Node.js](https://nodejs.org/).

### Instrukcja instalacji
1. Otwórz terminal / wiersz poleceń na swoim komputerze.
2. Przejdź do głównego folderu z pobranym projektem:
   ```bash
   cd sciezka/do/twojego/folderu/yogaFlowAI
   ```
3. Zainstaluj niezbędne zależności poleceniem:
   ```bash
   npm install
   ```
4. Uruchom aplikację:
   ```bash
   node server.js
   ```
5. Kiedy w terminalu pokaże się poniższy komunikat, serwer jest gotowy:
   > Serwer działa na http://localhost:3001
   > Połączono z bazą SQLite
   > Tabela users gotowa...

6. Zostaw uruchomiony terminal w tle i wejdź przez dowolną przeglądarkę internetową (np. Chrome) na adres:
   👉 **http://localhost:3001**

## 📁 Główne pliki projektu

- `server.js` - Główny plik serwera i API (Node.js + Express).
- `database.js` - Narzędzie odpowiedzialne za połączenie z bazą SQLite i tworzenie potrzebnych tabel.
- `database.sqlite` - Sama baza danych.
- `auth.js` - Skrypt pomocniczy na froncie do weryfikacji JWT sesji.
- `login.html`, `register.html` - Strony autoryzacji.
- `customer_account.html` - Kliencki panel po zalogowaniu.
- `style.css` - Główne style wizualne aplikacji.
- `package.json` - Wykaz zależności Node.js do zainstalowania.

## 🔒 Bezpieczeństwo

* Hasła użytkowników nigdy nie są przetrzymywane "tekstem jawnym" - korzystają z silnego algorytmu *bcrypt*.
* Sesja realizowana jest za pomocą szyfrowanych tokenów *JWT*, dostarczanych automatycznie w bezpiecznych ciastkach tzw. *HttpOnly*, chronionych dodatkowo przed dostępem z poziomu JavaScript w samej przeglądarce.

---
*Stworzone jako projekt administracji i budowy aplikacji w środowisku lokalnym/chmurowym.*
