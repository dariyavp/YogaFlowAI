// auth.js
// Plik pomocy do zarządzania sesjami frontendowymi

async function checkAuth(requiredRole = null) {
    try {
        const response = await fetch('/api/me');
        if (!response.ok) {
            window.location.href = 'login.html';
            return null;
        }

        const user = await response.json();

        if (requiredRole && user.role !== requiredRole) {
            // Brak odpowiedniej roli - odrzucamy na główne konto lub logowanie
            window.location.href = user.role === 'admin' ? 'admin_panel.html' : 'customer_account.html';
            return null;
        }

        return user;
    } catch (err) {
        window.location.href = 'login.html';
        return null;
    }
}

async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = 'login.html';
    } catch (err) {
        console.error('Błąd podczas wylogowywania', err);
    }
}

// Jeśli znajdziemy przycisk wylogowania na stronie, przypinamy zdarzenie
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});
