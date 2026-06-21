// =========================================================
// 0. ЯЗЫК: ЗАГРУЗКА СОХРАНЁННОГО ЯЗЫКА
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('zoroLang') || 'ru';
    applyLanguage(savedLang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === savedLang);
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            localStorage.setItem('zoroLang', lang);
            applyLanguage(lang);
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
        });
    });
});

function applyLanguage(lang) {
    const elements = document.querySelectorAll('.hero-quote, .section-subtitle, h2, h3, p, .btn, .counter-label, .footer-copy p, .info, .relation, .quote, .ship-card p, .theory-card p, .meme-card p, .award-item p, .hero-subtitle');
    elements.forEach(el => {
        const text = el.textContent;
        fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`)
            .then(r => r.json())
            .then(data => { if (data && data[0]) el.textContent = data[0][0][0]; })
            .catch(() => {});
    });
}

// =========================================================
// 1. ТЕМЫ (3 режима)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('zoroTheme') || 'mixed';
    applyTheme(savedTheme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === savedTheme);
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            localStorage.setItem('zoroTheme', theme);
            applyTheme(theme);
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === theme));
        });
    });
});

function applyTheme(theme) {
    document.body.dataset.theme = theme === 'mixed' ? '' : theme;
}

// =========================================================
// 2. РЕГИСТРАЦИЯ/ВХОД
// =========================================================
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('zoroUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }

    document.querySelector('.auth-btn')?.addEventListener('click', () => {
        if (currentUser) {
            if (confirm('Выйти из аккаунта?')) {
                currentUser = null;
                localStorage.removeItem('zoroUser');
                updateAuthUI();
            }
            return;
        }
        const username = prompt('Введите имя пользователя:');
        if (!username) return;
        const password = prompt('Введите пароль:');
        if (!password) return;
        const users = JSON.parse(localStorage.getItem('zoroUsers') || '{}');
        if (users[username] && users[username] !== password) {
            alert('Неверный пароль!');
            return;
        }
        users[username] = password;
        localStorage.setItem('zoroUsers', JSON.stringify(users));
        currentUser = { username, password };
        localStorage.setItem('zoroUser', JSON.stringify(currentUser));
        updateAuthUI();
        alert('Добро пожаловать, ' + username + '!');
    });
});

function updateAuthUI() {
    const btn = document.querySelector('.auth-btn');
    if (!btn) return;
    btn.textContent = currentUser ? '👤 ' + currentUser.username : '🔑 Войти';
}

// =========================================================
// 3. ГОЛОСОВАНИЯ (только для авторизованных)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const polls = document.querySelectorAll('.poll-form');
    polls.forEach(poll => {
        const pollId = poll.dataset.poll;
        const resultsId = pollId + '-results';
        const results = document.getElementById(resultsId);

        // Проверяем, голосовал ли пользователь
        const votes = JSON.parse(localStorage.getItem('zoroVotes') || '{}');
        if (currentUser && votes[currentUser.username] && votes[currentUser.username][pollId]) {
            poll.querySelector('button').textContent = '✅ Вы уже голосовали';
            poll.querySelectorAll('input').forEach(inp => inp.disabled = true);
            showPollResults(pollId, results);
            return;
        }

        poll.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!currentUser) {
                alert('Войдите или зарегистрируйтесь, чтобы голосовать!');
                return;
            }
            const selected = poll.querySelector('input:checked');
            if (!selected) { alert('Выберите вариант!'); return; }
            const vote = selected.value;

            // Сохраняем голос
            const votes = JSON.parse(localStorage.getItem('zoroVotes') || '{}');
            if (!votes[currentUser.username]) votes[currentUser.username] = {};
            if (votes[currentUser.username][pollId]) {
                alert('Вы уже голосовали в этом опросе!');
                return;
            }
            votes[currentUser.username][pollId] = vote;
            localStorage.setItem('zoroVotes', JSON.stringify(votes));

            // Обновляем статистику
            let stats = JSON.parse(localStorage.getItem('pollStats_' + pollId) || '{}');
            stats[vote] = (stats[vote] || 0) + 1;
            localStorage.setItem('pollStats_' + pollId, JSON.stringify(stats));

            showPollResults(pollId, results);
            poll.querySelector('button').textContent = '✅ Голос учтён!';
            poll.querySelectorAll('input').forEach(inp => inp.disabled = true);
        });
    });
});

function showPollResults(pollId, results) {
    if (!results) return;
    const stats = JSON.parse(localStorage.getItem('pollStats_' + pollId) || '{}');
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    if (total === 0) { results.innerHTML = '<p>Пока нет голосов. Будь первым!</p>'; return; }
    let html = '<h4>📊 Результаты:</h4><ul style="list-style: none; padding: 0;">';
    for (const [key, count] of Object.entries(stats)) {
        const percent = ((count / total) * 100).toFixed(1);
        html += `<li style="padding: 6px 0; border-bottom: 1px solid var(--border);">${key}: ${count} голосов (${percent}%)</li>`;
    }
    html += `</ul><p style="margin-top: 10px; font-weight: 700; color: var(--gold);">Всего голосов: ${total}</p>`;
    results.innerHTML = html;
}

// =========================================================
// 4. УВЕЛИЧЕНИЕ КАРТИНОК ПРИ КЛИКЕ
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    // Создаём модальное окно
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-content">
            <div class="modal-close"><img src="zoro-skull.png" alt="Закрыть"></div>
            <img src="" alt="Увеличенное изображение">
        </div>
    `;
    document.body.appendChild(overlay);

    // Закрытие по клику на фон или на крестик
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.closest('.modal-close')) {
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Клик по любой картинке (кроме баннера и герба)
    document.querySelectorAll('.image-frame img, .sword-card img, .enemy-card img, .crew-relation-card img, .ship-card img, .meme-card img, .award-item img, .bio-img, .crew-wano-img, .ship-gallery img').forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            const src = img.src;
            const modalImg = overlay.querySelector('.modal-content img');
            modalImg.src = src;
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
});

// =========================================================
// 5. САКУРА
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const container = document.createElement('div');
    container.className = 'sakura-container';
    document.body.appendChild(container);
    for (let i = 0; i < 25; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'sakura-leaf';
        leaf.style.left = Math.random() * 100 + '%';
        leaf.style.animationDuration = (Math.random() * 8 + 8) + 's';
        leaf.style.animationDelay = (Math.random() * 10) + 's';
        leaf.style.width = (Math.random() * 15 + 10) + 'px';
        leaf.style.height = (Math.random() * 15 + 10) + 'px';
        leaf.style.opacity = Math.random() * 0.5 + 0.3;
        container.appendChild(leaf);
    }
});

// =========================================================
// 6. ИГРА: РАЗРЕЗАНИЕ ЯДЕР
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    let gameActive = false;
    let gameScore = 0;
    const gameContainer = document.createElement('div');
    gameContainer.className = 'game-container';
    document.body.appendChild(gameContainer);

    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'game-score';
    document.body.appendChild(scoreDisplay);

    // Запуск игры по двойному клику на логотип
    document.querySelector('.logo').addEventListener('dblclick', () => {
        gameActive = !gameActive;
        gameContainer.classList.toggle('active', gameActive);
        scoreDisplay.classList.toggle('active', gameActive);
        if (gameActive) {
            gameScore = 0;
            scoreDisplay.textContent = '⚔️ Разрезов: 0';
            spawnCores();
        } else {
            gameContainer.innerHTML = '';
        }
    });

    function spawnCores() {
        if (!gameActive) return;
        const core = document.createElement('div');
        core.className = 'game-core';
        core.style.left = Math.random() * 90 + '%';
        core.style.animationDuration = (Math.random() * 4 + 4) + 's';
        core.style.width = (Math.random() * 30 + 25) + 'px';
        core.style.height = (Math.random() * 30 + 25) + 'px';
        core.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!gameActive) return;
            core.classList.add('sliced');
            gameScore++;
            scoreDisplay.textContent = '⚔️ Разрезов: ' + gameScore;
            setTimeout(() => core.remove(), 500);
        });
        gameContainer.appendChild(core);
        setTimeout(() => {
            if (core.parentNode) core.remove();
        }, 8000);
        setTimeout(spawnCores, 600);
    }
});

// =========================================================
// 7. РАЗРЕЗ
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const slash = document.createElement('div');
    slash.className = 'slash-overlay';
    document.body.appendChild(slash);
    setTimeout(() => { slash.classList.add('active'); setTimeout(() => { slash.classList.remove('active'); }, 900); }, 400);
    document.querySelector('.logo')?.addEventListener('click', () => {
        slash.classList.remove('active');
        setTimeout(() => { slash.classList.add('active'); setTimeout(() => { slash.classList.remove('active'); }, 900); }, 50);
    });
});

// =========================================================
// 8. СЧЁТЧИКИ
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.counter-number').forEach(c => {
        new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                const target = parseInt(c.dataset.target);
                let current = 0;
                const timer = setInterval(() => {
                    current += target / 100;
                    if (current >= target) { c.textContent = target.toLocaleString(); clearInterval(timer); }
                    else { c.textContent = Math.floor(current).toLocaleString(); }
                }, 20);
                observer.disconnect();
            }
        }, { threshold: 0.3 }).observe(c);
    });
});

// =========================================================
// 9. 3D-НАКЛОН
// =========================================================
document.querySelectorAll('.enemy-card, .crew-relation-card, .sword-card, .ship-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-10px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(600px) rotateY(0) rotateX(0) translateY(0)';
    });
});

// =========================================================
// 10. ПЕЧАТАНИЕ ЦИТАТЫ
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const quote = document.querySelector('.hero-quote');
    if (quote) {
        const text = quote.innerHTML;
        quote.innerHTML = '';
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) { quote.innerHTML = text.substring(0, i + 1); i++; }
            else { clearInterval(timer); }
        }, 25);
    }
});

console.log('⚔️ Сайт Зоро загружен! Все анимации и функции активированы! ⚔️');
