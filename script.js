// =========================================================
// 1. АНИМАЦИЯ: ЛЕТАЮЩИЕ ЛИСТЬЯ САКУРЫ
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const sakuraContainer = document.createElement('div');
    sakuraContainer.className = 'sakura-container';
    document.body.appendChild(sakuraContainer);

    for (let i = 0; i < 30; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'sakura-leaf';
        leaf.style.left = Math.random() * 100 + '%';
        leaf.style.animationDuration = (Math.random() * 8 + 8) + 's';
        leaf.style.animationDelay = (Math.random() * 10) + 's';
        leaf.style.width = (Math.random() * 15 + 10) + 'px';
        leaf.style.height = (Math.random() * 15 + 10) + 'px';
        leaf.style.opacity = Math.random() * 0.5 + 0.3;
        sakuraContainer.appendChild(leaf);
    }
});

// =========================================================
// 2. АНИМАЦИЯ: ЭФФЕКТ РАЗРЕЗА ПРИ ЗАГРУЗКЕ
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const slash = document.createElement('div');
    slash.className = 'slash-overlay';
    document.body.appendChild(slash);

    setTimeout(() => {
        slash.classList.add('active');
        setTimeout(() => {
            slash.classList.remove('active');
        }, 1000);
    }, 300);

    // Разрез по клику на логотип
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', () => {
            slash.classList.remove('active');
            setTimeout(() => {
                slash.classList.add('active');
                setTimeout(() => {
                    slash.classList.remove('active');
                }, 1000);
            }, 50);
        });
    }
});

// =========================================================
// 3. АНИМАЦИЯ СЧЁТЧИКОВ
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const counters = document.querySelectorAll('.counter-number');

    function startCounters() {
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2500;
            const stepTime = 20;
            const steps = duration / stepTime;
            const increment = target / steps;

            let current = 0;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target.toLocaleString();
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current).toLocaleString();
                }
            }, stepTime);
        });
    }

    const countersSection = document.querySelector('.counters');
    if (countersSection) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                startCounters();
                observer.disconnect();
            }
        }, { threshold: 0.3 });
        observer.observe(countersSection);
    }
});

// =========================================================
// 4. АНИМАЦИЯ ПОЯВЛЕНИЯ ПРИ СКРОЛЛЕ
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll(
        '.hero-text, .hero-image, .counter-item, ' +
        '.sword-card, .enemy-card, .crew-relation-card, .award-item, ' +
        '.ship-card, .theory-card, .meme-card, .bio-text, .bio-image, .win-item'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });

    animatedElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
});

// =========================================================
// 5. ОПРОС "ЛУЧШАЯ ДЕВУШКА ДЛЯ ЗОРО"
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const pollForm = document.getElementById('zoro-poll');
    const pollResults = document.getElementById('poll-results');

    if (pollForm) {
        const savedVote = localStorage.getItem('zoroPollVote');
        if (savedVote) {
            const radio = document.querySelector(`input[name="girl"][value="${savedVote}"]`);
            if (radio) radio.checked = true;
        }

        pollForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const selected = document.querySelector('input[name="girl"]:checked');
            if (!selected) {
                alert('Выбери девушку для Зоро!');
                return;
            }

            const vote = selected.value;
            localStorage.setItem('zoroPollVote', vote);

            let stats = JSON.parse(localStorage.getItem('zoroPollStats')) || {};
            stats[vote] = (stats[vote] || 0) + 1;
            localStorage.setItem('zoroPollStats', JSON.stringify(stats));

            showPollResults(stats);
            pollForm.querySelector('button').textContent = 'Голос учтён! ✅';
        });

        const stats = JSON.parse(localStorage.getItem('zoroPollStats')) || {};
        if (Object.keys(stats).length > 0) {
            showPollResults(stats);
        }
    }

    function showPollResults(stats) {
        if (!pollResults) return;

        const total = Object.values(stats).reduce((a, b) => a + b, 0);
        let html = '<h4 style="margin-bottom: 15px;">🏆 Результаты:</h4><ul style="list-style: none; padding: 0;">';

        const names = {
            'tashigi': 'Ташиги',
            'hyori': 'Хёри',
            'robin': 'Робин',
            'nami': 'Нами',
            'kuina': 'Куина',
            'other': 'Другая'
        };

        for (const [key, count] of Object.entries(stats)) {
            const percent = ((count / total) * 100).toFixed(1);
            const name = names[key] || key;
            html += `<li style="padding: 8px 0; border-bottom: 1px solid var(--border);">${name}: ${count} голосов (${percent}%)</li>`;
        }
        html += `</ul><p style="margin-top: 15px; font-weight: 700; color: var(--gold);">Всего голосов: ${total}</p>`;
        pollResults.innerHTML = html;
    }
});

// =========================================================
// 6. АНИМАЦИЯ 3D-НАКЛОНА КАРТОЧЕК
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.crew-card, .sword-card, .enemy-card, .crew-relation-card, .ship-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-10px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) translateY(0px)';
        });
    });
});

// =========================================================
// 7. ЭФФЕКТ ПЕЧАТАНИЯ ТЕКСТА ДЛЯ ГЛАВНОЙ ЦИТАТЫ
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const quoteElement = document.querySelector('.hero-quote');
    if (quoteElement) {
        const originalText = quoteElement.innerHTML;
        quoteElement.innerHTML = '';
        let index = 0;
        const text = originalText;
        const timer = setInterval(() => {
            if (index < text.length) {
                quoteElement.innerHTML = text.substring(0, index + 1);
                index++;
            } else {
                clearInterval(timer);
            }
        }, 25);
    }
});

// =========================================================
// 8. КОНВЕЙЕРЫ (ВРАГИ И КОМАНДА)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    // Для врагов
    const enemiesTrack = document.querySelector('.enemies-track');
    if (enemiesTrack) {
        // Увеличиваем скорость при наведении
        enemiesTrack.addEventListener('mouseenter', () => {
            enemiesTrack.style.animationDuration = '15s';
        });
        enemiesTrack.addEventListener('mouseleave', () => {
            enemiesTrack.style.animationDuration = '30s';
        });
    }

    // Для команды
    const crewTrack = document.querySelector('.crew-relations-track');
    if (crewTrack) {
        crewTrack.addEventListener('mouseenter', () => {
            crewTrack.style.animationDuration = '17s';
        });
        crewTrack.addEventListener('mouseleave', () => {
            crewTrack.style.animationDuration = '35s';
        });
    }
});

console.log('⚔️ Сайт Зоро загружен! Все анимации активированы! ⚔️');
