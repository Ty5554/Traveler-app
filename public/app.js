const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

const AUTH_STORAGE_KEY = 'traveler.auth';

const Auth = {
    storageKey: AUTH_STORAGE_KEY,
    state: { token: null, user: null },
    load() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed?.token && parsed?.user && !this.isExpired(parsed.token)) {
                this.state.token = parsed.token;
                this.state.user = parsed.user;
            } else {
                this.clear();
            }
        } catch (err) {
            this.clear();
        }
    },
    save(session) {
        this.state.token = session.token;
        this.state.user = session.user;
        try {
            localStorage.setItem(this.storageKey, JSON.stringify({
                token: session.token,
                user: session.user
            }));
        } catch (err) {
            // localStorageが利用できない場合は無視
        }
    },
    clear(removeStorage = true) {
        this.state.token = null;
        this.state.user = null;
        if (removeStorage) {
            try {
                localStorage.removeItem(this.storageKey);
            } catch (err) {
                // noop
            }
        }
    },
    isExpired(token) {
        if (!token) return true;
        const [base] = token.split('.');
        if (!base) return true;
        try {
            const normalized = base.replace(/-/g, '+').replace(/_/g, '/');
            const padding = '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
            const json = atob(normalized + padding);
            const payload = JSON.parse(json);
            if (!payload.exp) return false;
            return payload.exp * 1000 <= Date.now();
        } catch (err) {
            return true;
        }
    }
};

const ROLE_LABELS = {
    premium: 'プレミアム会員',
    member: 'メンバー',
    admin: '管理者'
};

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=128&q=80';

const PLACEHOLDERS = {
    flight: 'https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=1200&q=80',
    hotel: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1200&q=80'
};

const withAuth = (options = {}) => {
    const headers = { ...(options.headers || {}) };
    if (Auth.state.token) {
        headers['Authorization'] = `Bearer ${Auth.state.token}`;
    }
    return { ...options, headers };
};

const API = {
    airports: () => fetch(`${window.API_BASE}/api.php/airports`, withAuth()).then(r => r.json()),
    searchFlights: (q) => fetch(`${window.API_BASE}/api.php/flights?` + new URLSearchParams(q), withAuth()).then(r => r.json()),
    searchHotels: (q) => fetch(`${window.API_BASE}/api.php/hotels?` + new URLSearchParams(q), withAuth()).then(r => r.json()),
    login: async (credentials) => {
        const res = await fetch(`${window.API_BASE}/api.php/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data) {
            throw new Error(data?.error || 'ログインに失敗しました');
        }
        return data;
    }
};

const formatDuration = (minutes) => {
    if (!minutes && minutes !== 0) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const parts = [];
    if (h) parts.push(`${h}時間`);
    if (m) parts.push(`${m}分`);
    return parts.join('') || `${minutes}分`;
};

const createElement = (html, tag = 'div') => {
    const wrapper = document.createElement(tag);
    wrapper.innerHTML = html.trim();
    return wrapper.firstElementChild;
};

function renderFeaturedFlights(list = []) {
    const root = document.querySelector('[data-slot="featured-flights"]');
    if (!root) return;
    root.innerHTML = '';
    list.slice(0, 3).forEach(f => {
        const image = f.image || PLACEHOLDERS.flight;
        const el = createElement(`
        <article class="card card-compact">
            <figure class="card-media">
                <img src="${image}" alt="${f.airline} ${f.from_name || f.from}発 ${f.to_name || f.to}行きのイメージ" loading="lazy" />
            </figure>
            <header class="card-header">
                <span class="badge">${f.airline}</span>
                <div class="route">
                    <strong>${f.from_name || f.from} → ${f.to_name || f.to}</strong>
                    <span>${f.depart_time} - ${f.arrive_time} / ${formatDuration(f.duration)}</span>
                </div>
            </header>
            <ul class="card-meta-list">
                <li><strong>運賃</strong> ${f.fare_type || '—'}</li>
                <li><strong>機材</strong> ${f.aircraft || '—'}</li>
                <li><strong>特典</strong> ${f.note || '—'}</li>
            </ul>
            <div class="card-footer">
                <div class="price">¥${f.price.toLocaleString()}<span> / 片道</span></div>
            </div>
        </article>
      `);
        root.appendChild(el);
    });
}

function renderFeaturedHotels(list = []) {
    const root = document.querySelector('[data-slot="featured-hotels"]');
    if (!root) return;
    root.innerHTML = '';
    const featured = list.filter(h => h.featured);
    const picks = featured.length ? featured : list;
    picks.slice(0, 3).forEach(h => {
        const image = h.image || PLACEHOLDERS.hotel;
        const el = createElement(`
        <article class="card card-compact hotel">
            <figure class="card-media">
                <img src="${image}" alt="${h.name}の外観" loading="lazy" />
            </figure>
            <header class="card-header">
                <span class="badge">${h.brand || 'Hotel'}</span>
                <div>
                    <strong>${h.name}</strong>
                    <span>${h.city}・${h.area} / ★ ${h.rating.toFixed(1)}</span>
                </div>
            </header>
            <p class="card-note">${h.description}</p>
            <ul class="card-meta-list">
                <li><strong>最寄り</strong> ${h.station || '—'}</li>
                <li><strong>設備</strong> ${h.amenities.slice(0, 3).join(' / ')}</li>
            </ul>
            <div class="card-footer">
                <div class="price">¥${h.price.toLocaleString()}<span> / 泊</span></div>
            </div>
        </article>
      `);
        root.appendChild(el);
    });
}

function updateAuthUI() {
    const loginBtn = $('#login-trigger');
    const userChip = $('#user-chip');
    if (!loginBtn || !userChip) return;
    if (Auth.state.user) {
        loginBtn.classList.add('hidden');
        userChip.classList.remove('hidden');
        const avatar = $('.user-avatar', userChip);
        if (avatar) {
            avatar.src = Auth.state.user.avatar || DEFAULT_AVATAR;
            avatar.alt = `${Auth.state.user.name}のアバター`;
        }
        const nameEl = $('.user-name', userChip);
        if (nameEl) nameEl.textContent = Auth.state.user.name;
        const roleEl = $('.user-role', userChip);
        if (roleEl) roleEl.textContent = ROLE_LABELS[Auth.state.user.role] || 'メンバー';
    } else {
        loginBtn.classList.remove('hidden');
        userChip.classList.add('hidden');
    }
}

function setLoginError(msg = '') {
    const el = $('#login-error');
    if (!el) return;
    if (msg) {
        el.textContent = msg;
        el.classList.remove('hidden');
    } else {
        el.textContent = '';
        el.classList.add('hidden');
    }
}

function openAuthModal() {
    const modal = $('#auth-modal');
    if (!modal) return;
    setLoginError('');
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    const email = $('#login-email');
    setTimeout(() => email?.focus(), 50);
}

function closeAuthModal() {
    const modal = $('#auth-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    setLoginError('');
}

function setActiveTab(tab) {
    $$(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    $$(".nav-link").forEach(a => a.classList.toggle("active", a.dataset.tab === tab));
    $$("form.search-form").forEach(f => f.classList.toggle("hidden", f.dataset.tab !== tab));
    $("#about-section").classList.toggle("hidden", tab !== "about");
}

function renderFlights(list) {
    const root = $("#results");
    root.innerHTML = `
    <div class="filters">
      <label>並び替え：</label>
      <select id="sort-flight">
        <option value="price">価格が安い順</option>
        <option value="duration">所要時間が短い順</option>
        <option value="depart">出発が早い順</option>
      </select>
      <input type="search" id="filter-airline" placeholder="航空会社で絞り込み (例: ANA)" />
    </div>
  `;
    const grid = document.createElement('div');
    grid.className = 'results';
    root.appendChild(grid);

    const draw = (items) => {
        grid.innerHTML = '';
        if (!items.length) {
            grid.appendChild(createElement('<p class="empty">条件に合致する航空券が見つかりませんでした。</p>', 'div'));
            return;
        }
        items.forEach(f => {
            const image = f.image || PLACEHOLDERS.flight;
            const el = createElement(`
        <article class="card">
            <figure class="card-media">
                <img src="${image}" alt="${f.airline} ${f.from_name || f.from}発 ${f.to_name || f.to}行きのイメージ" loading="lazy" />
            </figure>
            <header class="card-header">
                <div>
                    <div class="route"><strong>${f.from_name || f.from}</strong> → <strong>${f.to_name || f.to}</strong></div>
                    <div class="meta">${f.depart_time} 発 / ${f.arrive_time} 着 ・ 所要 ${formatDuration(f.duration)}</div>
                </div>
                <div class="badge">${f.airline} ${f.flight_no}</div>
            </header>
            <ul class="card-meta-list">
                <li><strong>運賃タイプ</strong> ${f.fare_type || '—'}</li>
                <li><strong>機材</strong> ${f.aircraft || '—'}</li>
                <li><strong>手荷物</strong> ${f.baggage || '—'}</li>
                <li><strong>経路</strong> ${f.direct ? '直行便' : `乗継 (${f.via || '—'})`}</li>
            </ul>
            ${f.note ? `<p class="card-note">${f.note}</p>` : ''}
            <div class="card-footer">
                <div class="price">¥${f.price.toLocaleString()}<span> / 片道・税込</span></div>
                <button class="primary">予約に進む</button>
            </div>
        </article>
      `);
            grid.appendChild(el);
        });
    };

    // 初回描画
    draw(list);

    $("#sort-flight").addEventListener('change', (e) => {
        const v = e.target.value;
        const copy = [...list];
        if (v === 'price') copy.sort((a, b) => a.price - b.price);
        if (v === 'duration') copy.sort((a, b) => a.duration - b.duration);
        if (v === 'depart') copy.sort((a, b) => a.depart_time.localeCompare(b.depart_time));
        draw(copy);
    });
    $("#filter-airline").addEventListener('input', (e) => {
        const kw = e.target.value.trim().toLowerCase();
        draw(list.filter(f => f.airline.toLowerCase().includes(kw)));
    });
}

function renderHotels(list) {
    const root = $("#results");
    root.innerHTML = `
    <div class="filters">
      <label>並び替え：</label>
      <select id="sort-hotel">
        <option value="price">価格が安い順</option>
        <option value="rating">評価が高い順</option>
      </select>
      <input type="search" id="filter-area" placeholder="エリアで絞り込み (例: 渋谷)" />
    </div>
  `;
    const grid = document.createElement('div');
    grid.className = 'results';
    root.appendChild(grid);

    const draw = (items) => {
        grid.innerHTML = '';
        if (!items.length) {
            grid.appendChild(createElement('<p class="empty">条件に合致する宿泊プランが見つかりませんでした。</p>', 'div'));
            return;
        }
        items.forEach(h => {
            const image = h.image || PLACEHOLDERS.hotel;
            const el = createElement(`
        <article class="card hotel">
            <figure class="card-media">
                <img src="${image}" alt="${h.name}の外観" loading="lazy" />
            </figure>
            <header class="card-header">
                <div>
                    <span class="meta">${h.city}・${h.area}</span>
                    <h3>${h.name}</h3>
                </div>
                <div class="badge">${h.brand || 'Hotel'}</div>
            </header>
            <ul class="card-meta-list">
                <li><strong>評価</strong> ★ ${h.rating.toFixed(1)}</li>
                <li><strong>最寄り</strong> ${h.station || '—'}</li>
                <li><strong>設備</strong> ${h.amenities.join(' / ')}</li>
            </ul>
            ${h.description ? `<p class="card-note">${h.description}</p>` : ''}
            <div class="card-footer">
                <div class="price">¥${h.price.toLocaleString()}<span> / 泊 (税込)</span></div>
                <button class="primary">空室を確認</button>
            </div>
        </article>
      `);
            grid.appendChild(el);
        });
    };

    draw(list);

    $("#sort-hotel").addEventListener('change', (e) => {
        const v = e.target.value;
        const copy = [...list];
        if (v === 'price') copy.sort((a, b) => a.price - b.price);
        if (v === 'rating') copy.sort((a, b) => b.rating - a.rating);
        draw(copy);
    });
    $("#filter-area").addEventListener('input', (e) => {
        const kw = e.target.value.trim();
        draw(list.filter(h => h.area.includes(kw)));
    });
}

function wireUI() {
    // タブ切替
    $$(".tab-btn, .nav-link").forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = e.currentTarget.dataset.tab;
            setActiveTab(tab);
        });
    });

    Auth.load();
    updateAuthUI();

    const loginTrigger = $('#login-trigger');
    const logoutBtn = $('#logout-btn');
    const loginForm = $('#login-form');
    const modal = $('#auth-modal');
    const modalClose = $('#auth-close');
    const submitBtn = $('#login-submit');

    loginTrigger?.addEventListener('click', () => openAuthModal());
    modalClose?.addEventListener('click', () => closeAuthModal());
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeAuthModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
            closeAuthModal();
        }
    });

    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!submitBtn) return;
        const emailInput = $('#login-email');
        const passwordInput = $('#login-password');
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';
        setLoginError('');
        submitBtn.disabled = true;
        try {
            const data = await API.login({ email, password });
            Auth.save(data);
            updateAuthUI();
            closeAuthModal();
            loginForm.reset();
        } catch (err) {
            setLoginError(err.message || 'ログインに失敗しました');
        } finally {
            submitBtn.disabled = false;
        }
    });

    logoutBtn?.addEventListener('click', () => {
        Auth.clear();
        updateAuthUI();
    });

    // 空港サジェスト用データを読み込み
    API.airports().then(list => {
        const dl = $("#airport-list");
        dl.innerHTML = list.map(a => `<option value="${a.code}">${a.city} (${a.code})</option>`).join('');
    });

    // デフォルト表示用データ
    Promise.all([
        API.searchFlights({ from: 'HND', to: 'CTS' }),
        API.searchHotels({ city: '東京' })
    ]).then(([flightRes, hotelRes]) => {
        if (flightRes?.items) {
            renderFlights(flightRes.items);
            renderFeaturedFlights(flightRes.items);
        }
        if (hotelRes?.items) {
            renderFeaturedHotels(hotelRes.items);
        }
    }).catch(() => {
        // ignore preload errors on demo
    });

    // 航空券検索
    $("#flight-form").addEventListener('submit', async (e) => {
        e.preventDefault();
        const q = {
            from: $("#from-airport").value.trim(),
            to: $("#to-airport").value.trim(),
            date: $("#depart-date").value,
            pax: $("#pax").value || 1,
        };
        const res = await API.searchFlights(q);
        renderFlights(res.items);
        renderFeaturedFlights(res.items);
    });

    // ホテル検索
    $("#hotel-form").addEventListener('submit', async (e) => {
        e.preventDefault();
        const q = {
            city: $("#hotel-city").value.trim(),
            checkin: $("#checkin-date").value,
            checkout: $("#checkout-date").value,
            guests: $("#guests").value || 2,
        };
        const res = await API.searchHotels(q);
        renderHotels(res.items);
        renderFeaturedHotels(res.items);
    });
}

window.addEventListener('DOMContentLoaded', wireUI);
