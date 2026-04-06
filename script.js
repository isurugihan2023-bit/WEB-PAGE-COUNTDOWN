// Interactive Effects Classes
class ClickSpark {
    constructor(options = {}) {
        this.sparkColor = options.sparkColor || '#ff2a5f';
        this.sparkSize = options.sparkSize || 10;
        this.sparkRadius = options.sparkRadius || 15;
        this.sparkCount = options.sparkCount || 8;
        this.duration = options.duration || 400;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.sparks = [];
        this.setupCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        document.addEventListener('mousedown', (e) => this.handleClick(e));
        requestAnimationFrame((t) => this.draw(t));
    }
    setupCanvas() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '99999';
        document.body.appendChild(this.canvas);
        this.resizeCanvas();
    }
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    handleClick(e) {
        const now = performance.now();
        for (let i = 0; i < this.sparkCount; i++) {
            this.sparks.push({ x: e.clientX, y: e.clientY, angle: (2 * Math.PI * i) / this.sparkCount, startTime: now });
        }
    }
    draw(timestamp) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.sparks = this.sparks.filter(spark => {
            const elapsed = timestamp - spark.startTime;
            if (elapsed >= this.duration) return false;
            const progress = elapsed / this.duration;
            const eased = progress * (2 - progress);
            const distance = eased * this.sparkRadius;
            const lineLength = this.sparkSize * (1 - eased);
            const x1 = spark.x + distance * Math.cos(spark.angle);
            const y1 = spark.y + distance * Math.sin(spark.angle);
            const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
            const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);
            this.ctx.strokeStyle = this.sparkColor;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            return true;
        });
        requestAnimationFrame((t) => this.draw(t));
    }
}

class Confetti {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.active = false;
        this.setupCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    setupCanvas() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '99998';
        document.body.appendChild(this.canvas);
        this.resizeCanvas();
    }
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    fire() {
        const colors = ['#ff4655', '#ffffff', '#ff0000'];
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + 10,
                vx: (Math.random() - 0.5) * 10,
                vy: -Math.random() * 15 - 10,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rSpeed: (Math.random() - 0.5) * 10
            });
        }
        if (!this.active) { this.active = true; this.animate(); }
    }
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = this.particles.filter(p => {
            p.x += p.vx; p.y += p.vy; p.vy += 0.5; p.rotation += p.rSpeed;
            this.ctx.fillStyle = p.color;
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation * Math.PI / 180);
            this.ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            this.ctx.restore();
            return p.y < this.canvas.height + 100;
        });
        if (this.particles.length > 0) requestAnimationFrame(() => this.animate());
        else this.active = false;
    }
}

class ShapeGrid {
    constructor(options = {}) {
        this.direction = options.direction || 'right';
        this.speed = options.speed || 0.5;
        this.borderColor = options.borderColor || 'rgba(255, 70, 85, 0.15)';
        this.squareSize = options.squareSize || 50;
        this.hoverFillColor = options.hoverFillColor || 'rgba(255, 70, 85, 0.1)';
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridOffset = { x: 0, y: 0 };
        this.hoveredSquare = null;
        this.cellOpacities = new Map();
        this.setupCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.hoveredSquare = null);
        requestAnimationFrame((t) => this.updateAnimation(t));
    }
    setupCanvas() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.background = '#000';
        document.body.prepend(this.canvas);
        this.resizeCanvas();
    }
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const offsetX = ((this.gridOffset.x % this.squareSize) + this.squareSize) % this.squareSize;
        const offsetY = ((this.gridOffset.y % this.squareSize) + this.squareSize) % this.squareSize;
        const col = Math.floor((mouseX - offsetX) / this.squareSize);
        const row = Math.floor((mouseY - offsetY) / this.squareSize);
        this.hoveredSquare = { x: col, y: row };
    }
    updateAnimation(timestamp) {
        const wrap = this.squareSize;
        if (this.direction === 'right') this.gridOffset.x = (this.gridOffset.x - this.speed + wrap) % wrap;
        this.updateCellOpacities();
        this.drawGrid();
        requestAnimationFrame((t) => this.updateAnimation(t));
    }
    updateCellOpacities() {
        const targets = new Map();
        if (this.hoveredSquare) targets.set(`${this.hoveredSquare.x},${this.hoveredSquare.y}`, 1);
        for (const [key] of targets) if (!this.cellOpacities.has(key)) this.cellOpacities.set(key, 0);
        for (const [key, opacity] of this.cellOpacities) {
            const target = targets.get(key) || 0;
            const next = opacity + (target - opacity) * 0.1;
            if (next < 0.01) this.cellOpacities.delete(key);
            else this.cellOpacities.set(key, next);
        }
    }
    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const offsetX = ((this.gridOffset.x % this.squareSize) + this.squareSize) % this.squareSize;
        const offsetY = ((this.gridOffset.y % this.squareSize) + this.squareSize) % this.squareSize;
        const cols = Math.ceil(this.canvas.width / this.squareSize) + 2;
        const rows = Math.ceil(this.canvas.height / this.squareSize) + 2;
        for (let col = -1; col < cols; col++) {
            for (let row = -1; row < rows; row++) {
                const sx = col * this.squareSize + offsetX;
                const sy = row * this.squareSize + offsetY;
                const cellKey = `${col},${row}`;
                const alpha = this.cellOpacities.get(cellKey);
                if (alpha) {
                    this.ctx.globalAlpha = alpha;
                    this.ctx.fillStyle = this.hoverFillColor;
                    this.ctx.fillRect(sx, sy, this.squareSize, this.squareSize);
                    this.ctx.globalAlpha = 1;
                }
                this.ctx.strokeStyle = this.borderColor;
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(sx, sy, this.squareSize, this.squareSize);
            }
        }
        const grad = this.ctx.createRadialGradient(this.canvas.width/2, this.canvas.height/2, 0, this.canvas.width/2, this.canvas.height/2, Math.max(this.canvas.width, this.canvas.height));
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.8)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

const confettiEffect = new Confetti();
function fireCelebration() { confettiEffect.fire(); }

class NotificationManager {
    constructor() {
        this.container = document.getElementById('toast-container');
        this.toggleBtn = document.getElementById('notification-toggle');
        this.alarmSound = document.getElementById('alarm-sound');
        this.permission = Notification.permission;
        
        this.setupEventListeners();
        this.updateToggleButton();
    }

    setupEventListeners() {
        this.toggleBtn?.addEventListener('click', () => this.requestPermission());
    }

    async requestPermission() {
        const permission = await Notification.requestPermission();
        this.permission = permission;
        this.updateToggleButton();
        if (permission === 'granted') {
            this.toast('SYSTEM', 'Notifications enabled! Mission alerts active.', '🔔');
        } else if (permission === 'denied') {
            this.toast('SYSTEM', 'Notifications blocked. Please enable in browser settings.', '❌');
        }
    }

    updateToggleButton() {
        if (!this.toggleBtn) return;
        if (this.permission === 'granted') {
            this.toggleBtn.classList.add('enabled');
            this.toggleBtn.title = 'Notifications Enabled';
        } else {
            this.toggleBtn.classList.remove('enabled');
            this.toggleBtn.title = 'Enable Notifications';
        }
    }

    toast(title, msg, icon = '🛡️', duration = 5000) {
        if (!this.container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-msg">${msg}</div>
            </div>
        `;
        
        this.container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    playAlarm() {
        if (this.alarmSound) {
            this.alarmSound.currentTime = 0;
            this.alarmSound.play().catch(e => console.log('Audio playback blocked:', e));
        }
    }

    notify(title, msg, icon = '🎯') {
        this.toast(title, msg, icon);
        if (this.permission === 'granted') {
            try {
                new Notification(title, { body: msg });
            } catch (e) { console.error(e); }
        }
        this.playAlarm();
    }

    sessionAlert(type, sessionName) {
        const title = type === 'start' ? 'MISSION STARTING' : 'MISSION ENDING';
        const msg = type === 'start' 
            ? `Time to focus on ${sessionName}! Unit ready.` 
            : `Wrap up ${sessionName}. Next session approaching soon.`;
        const icon = type === 'start' ? '⚔️' : '🏁';
        this.notify(title, msg, icon);
    }
}

const notifier = new NotificationManager();

const SESSIONS = [
    { id: 'morning', name: 'Information Technology', timeRange: [6.5, 9.0], task: 'Learn 1 topic + 5-10 questions', color: '#00f2ff' },
    { id: 'late_morning', name: 'Engineering Technology', timeRange: [10.0, 12.5], task: 'Learn concept + Examples/diagrams', color: '#00f2ff' },
    { id: 'afternoon', name: 'Science for Technology', timeRange: [14.0, 16.5], task: 'Study lesson + Write short notes', color: '#00f2ff' },
    { id: 'evening', name: 'Past Papers', timeRange: [17.5, 19.5], task: '20 MCQ + 2 structured questions', color: '#ff4655' },
    { id: 'night', name: 'Revision', timeRange: [20.5, 22.0], task: 'Revise all 3 subjects + Fix weak areas', color: '#ffcc00' }
];

let state = {
    day: 9,
    sessionResults: {}, // { id: 'done' | 'fail' }
    penalties: [], // Array of task objects {name, date}
    startDate: new Date().toISOString(),
    lastCheck: null,
    firstMissionDone: false,
    manualOverride: null,
    manualTimerEnd: null,
    timerActive: false,
    remainingSeconds: 0,
    currentSessionId: null,
    celebratedToday: false,
    freeTimeEnd: null, // Timestamp when reward ends
    lastNotifiedId: null, // ID of session already notified
    lastWarningId: null,  // ID of session warning already sent
    lastEndNotifiedId: null, // ID of session end already notified
    history: [] // [{ day, date, results, progress, completedCount, totalCount }]
};

// Initialize app
function init() {
    loadState();
    checkDayProgression();
    renderTimetable();
    updateDashboard();
    startIntervals();
    updateClock(); // Initial call
    new ClickSpark(); // Interactive particle effect
    new ShapeGrid(); // Animated background grid
    
    // Check if notification permission was already granted
    if (Notification.permission === 'granted') {
        notifier.updateToggleButton();
    }
}

function updateClock() {
    const now = new Date();
    
    // 12-hour clock
    const timeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
    });
    
    // Date
    const dateStr = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });

    document.getElementById('live-time').innerText = timeStr;
    document.getElementById('live-date').innerText = dateStr;

    // Final Countdown
    const deadline = new Date('2026-08-10T00:00:00');
    const diff = deadline - now;
    
    if (diff > 0) {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('deadline-days').innerText = `${d} DAYS LEFT`;
        document.getElementById('cd-days').innerText = d.toString().padStart(2, '0');
        document.getElementById('cd-hours').innerText = h.toString().padStart(2, '0');
        document.getElementById('cd-mins').innerText = m.toString().padStart(2, '0');
        document.getElementById('cd-secs').innerText = s.toString().padStart(2, '0');
    }
}

function loadState() {
    const saved = localStorage.getItem('comeback_state');
    if (saved) {
        const loaded = JSON.parse(saved);
        // Migration: Ensure new properties exist
        state = { ...state, ...loaded };
        if (!state.sessionResults) state.sessionResults = {};
    } else {
        saveState();
    }
}

function saveState() {
    localStorage.setItem('comeback_state', JSON.stringify(state));
}

function checkDayProgression() {
    const now = new Date();
    const lastCheck = state.lastCheck ? new Date(state.lastCheck) : null;
    
    if (lastCheck && now.toDateString() !== lastCheck.toDateString()) {
        // New day! 
        // Move uncompleted tasks to penalties
        const activeSessions = getActiveSessionsForDay(state.day);
        activeSessions.forEach(s => {
            if (state.sessionResults[s.id] !== 'done') {
                addPenalty(s.name + " (" + s.id.replace('_', ' ') + ")");
            }
        });

        // Record History before changing state
        recordHistory();

        state.day += 1;
        state.sessionResults = {};
    }
    state.lastCheck = now.toISOString();
    saveState();
}

/**
 * Capture current day's performance and save it to history before resetting.
 */
function recordHistory() {
    const activeSessions = getActiveSessionsForDay(state.day);
    const results = { ...state.sessionResults };
    const date = new Date().toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });

    const activeCount = activeSessions.length;
    const completedCount = Object.keys(state.sessionResults).filter(id => 
        state.sessionResults[id] === 'done' && activeSessions.some(s => s.id === id)
    ).length;
    const progress = activeCount > 0 ? Math.round((completedCount / activeCount) * 100) : 0;

    // Create a detailed record
    const record = {
        day: state.day,
        date: date,
        results: results,
        progress: progress,
        completedCount: completedCount,
        totalCount: activeCount,
        timestamp: new Date().getTime()
    };

    // Add to history (limit to last 30 entries if needed, but for now just push)
    if (!state.history) state.history = [];
    
    // Check if day already exists (to avoid duplicate entries if reset is clicked multiple times)
    const existingIndex = state.history.findIndex(h => h.day === state.day);
    if (existingIndex !== -1) {
        state.history[existingIndex] = record;
    } else {
        state.history.unshift(record); // newest first
    }
    
    saveState();
}

function resetDay() {
    if (confirm("Are you sure you want to finish today and prepare for the next day? Unfinished tasks will be added to penalties.")) {
        // Record History before changing state
        recordHistory();

        // Move uncompleted tasks to penalties
        const activeSessions = getActiveSessionsForDay(state.day);
        activeSessions.forEach(s => {
            if (state.sessionResults[s.id] !== 'done') {
                addPenalty(s.name + " (" + s.id.replace('_', ' ') + ")");
            }
        });

        // Progress to next day
        state.day += 1;
        state.sessionResults = {};
        state.celebratedToday = false;
        state.manualOverride = null;
        state.timerActive = false;
        state.lastCheck = new Date().toISOString();
        
        saveState();
        updateDashboard();
        renderTimetable();
        showNotification("NEW DAY INITIALIZED. PREPARE FOR BATTLE.");
    }
}

function getActiveSessionsForDay(day) {
    // If the first 3 subjects are finished, unlock everything else!
    const firstThreeDone = ['morning', 'late_morning', 'afternoon'].every(id => state.sessionResults[id] === 'done');
    if (firstThreeDone) return SESSIONS;

    if (day <= 3) return SESSIONS.slice(0, 3); // Morning, Late Morning, Afternoon
    if (day <= 7) return SESSIONS.slice(0, 4); // + Evening
    return SESSIONS; // Full 12h
}

function renderTimetable() {
    const list = document.getElementById('timetable-list');
    list.innerHTML = '';
    
    const activeSessionsForDay = getActiveSessionsForDay(state.day);
    
    SESSIONS.forEach(session => {
        const isActiveForDay = activeSessionsForDay.some(s => s.id === session.id);
        const result = state.sessionResults[session.id]; // 'done' or 'fail'
        const currentSession = getCurrentSession();
        
        const row = document.createElement('div');
        row.className = `session-row ${result === 'done' ? 'completed' : (result === 'fail' ? 'failed' : '')} ${currentSession?.id === session.id ? 'active' : ''}`;
        if (!isActiveForDay) row.style.opacity = '0.3';

        row.innerHTML = `
            <div class="session-time">${formatTimeRange(session.timeRange)}</div>
            <div class="session-meta">
                <div class="session-name">${session.name} ${!isActiveForDay ? '<small>(Locked)</small>' : ''}</div>
                <div class="session-controls ${!isActiveForDay ? 'hidden' : ''}">
                    <button class="status-btn run ${state.manualOverride === session.id ? 'active' : ''}" onclick="toggleManualStart('${session.id}')" title="Activate Subject">+</button>
                    <button class="status-btn tic ${result === 'done' ? 'active' : ''}" onclick="toggleStatus('${session.id}', 'done')">✔</button>
                    <button class="status-btn cross ${result === 'fail' ? 'active' : ''}" onclick="toggleStatus('${session.id}', 'fail')">✖</button>
                </div>
            </div>
            <div class="session-dot" style="background: ${session.color}"></div>
        `;
        list.appendChild(row);
    });
}

function toggleManualStart(id) {
    if (state.manualOverride === id) {
        state.manualOverride = null;
    } else {
        state.manualOverride = id;
        state.manualTimerEnd = null; // Clear manual timer if subject activated
        showNotification(`MISSION OVERRIDE: ${SESSIONS.find(s=>s.id===id).name} Activated`);
    }
    saveState();
    updateDashboard();
    renderTimetable();
}

function toggleStatus(id, type) {
    if (state.sessionResults[id] === type) {
        delete state.sessionResults[id];
    } else {
        state.sessionResults[id] = type;
        if (type === 'fail') {
            const session = SESSIONS.find(s => s.id === id);
            addPenalty(session.name);
        }
    }
    saveState();
    updateDashboard();
    renderTimetable();
}

function formatTimeRange(range) {
    const h1 = Math.floor(range[0]);
    const m1 = (range[0] % 1) * 60;
    const h2 = Math.floor(range[1]);
    const m2 = (range[1] % 1) * 60;
    return `${h1}:${m1 === 0 ? '00' : m1} - ${h2}:${m2 === 0 ? '00' : m2}`;
}

function getCurrentSession() {
    if (state.manualOverride) {
        return SESSIONS.find(s => s.id === state.manualOverride);
    }
    const now = new Date();
    const decHour = now.getHours() + now.getMinutes() / 60;
    const activeForDay = getActiveSessionsForDay(state.day);
    return activeForDay.find(s => decHour >= s.timeRange[0] && decHour <= s.timeRange[1]);
}

function updateDashboard() {
    const session = getCurrentSession();
    const subjectEl = document.getElementById('current-subject');
    const taskEl = document.getElementById('current-task');
    const dayEl = document.getElementById('current-day');
    const starterEl = document.getElementById('starter-mode-status');
    const progressEl = document.getElementById('daily-progress');

    if (dayEl) dayEl.innerText = state.day;
    const firstThreeDone = ['morning', 'late_morning', 'afternoon'].every(id => state.sessionResults[id] === 'done');
    
    if (firstThreeDone || state.day > 7) starterEl.innerText = "FULL 12H GRIND (UNLOCKED)";
    else if (state.day <= 3) starterEl.innerText = "STARTER MODE (D1-3)";
    else if (state.day <= 7) starterEl.innerText = "ACCELERATING (D4-7)";

    const startBtn = document.getElementById('btn-start');
    const stopBtn = document.getElementById('btn-stop');
    const timerContainer = document.querySelector('.mission-timer');

    // Handle session transitions or manual overrides
    const newSessionId = session ? session.id : (state.manualTimerEnd ? 'manual' : (state.firstMissionDone ? 'none' : 'first'));
    if (state.currentSessionId !== newSessionId) {
        state.currentSessionId = newSessionId;
        state.timerActive = false;
        if (session) {
            state.remainingSeconds = (session.timeRange[1] - session.timeRange[0]) * 3600;
        } else if (newSessionId === 'manual') {
            state.remainingSeconds = 2 * 3600;
        } else if (newSessionId === 'first') {
            state.remainingSeconds = 25 * 60;
        } else {
            state.remainingSeconds = 0;
        }
        saveState();
    }

    if (session) {
        subjectEl.innerText = session.name;
        taskEl.innerText = session.task;
        startBtn.classList.remove('hidden');
        startBtn.innerText = state.timerActive ? 'FINISH' : 'START';
        stopBtn.classList.remove('hidden');
        stopBtn.innerText = 'STOP';
        timerContainer.classList.remove('hidden');
    } else if (!state.firstMissionDone) {
        subjectEl.innerText = "FIRST MISSION (NOW)";
        taskEl.innerText = "25 minutes -> Information Technology";
        startBtn.classList.remove('hidden');
        startBtn.innerText = state.timerActive ? 'FINISH' : 'START';
        stopBtn.classList.add('hidden');
        timerContainer.classList.remove('hidden');
    } else if (state.manualTimerEnd) {
        subjectEl.innerText = "MANUAL 2H MISSION";
        taskEl.innerText = "Intensive focus session active.";
        startBtn.classList.remove('hidden');
        startBtn.innerText = state.timerActive ? 'FINISH' : 'START';
        stopBtn.classList.remove('hidden');
        stopBtn.innerText = 'STOP';
        timerContainer.classList.remove('hidden');
    } else {
        subjectEl.innerText = "NO ACTIVE MISSION";
        taskEl.innerText = "Next session starts soon. Stay ready.";
        startBtn.classList.remove('hidden');
        startBtn.innerText = 'START 2H MISSION';
        stopBtn.classList.add('hidden');
        timerContainer.classList.add('hidden');
    }

    // Progress
    const activeSessions = getActiveSessionsForDay(state.day);
    const activeCount = activeSessions.length;
    const completedCount = Object.keys(state.sessionResults).filter(id => 
        state.sessionResults[id] === 'done' && activeSessions.some(s => s.id === id)
    ).length;
    
    const percent = activeCount > 0 ? (completedCount / activeCount) * 100 : 0;
    progressEl.style.width = percent + '%';

    if (percent === 100 && !state.celebratedToday) {
        state.celebratedToday = true;
        fireCelebration();
        showNotification("MISSION COMPLETE! 🏆 YOU ARE UNSTOPPABLE.");
        saveState();
    } else if (percent < 100) {
        state.celebratedToday = false; // Reset if they fail/remove a session
    }

    renderPenalties();
    renderRewards();
}

function renderPenalties() {
    const list = document.getElementById('penalty-list');
    list.innerHTML = '';
    
    if (state.penalties.length === 0) {
        list.innerHTML = '<li class="empty-msg">No penalties yet. Stay focused!</li>';
        return;
    }

    state.penalties.forEach((p, index) => {
        const li = document.createElement('li');
        li.className = 'penalty-item';
        li.innerHTML = `
            <div class="penalty-text">
                <strong>${p.name}</strong> <br> <small>${new Date(p.date).toLocaleDateString()}</small>
            </div>
            <div class="penalty-actions">
                <button class="penalty-action-btn tick" onclick="event.stopPropagation(); completePenalty(${index})" title="Mark as Completed">✔</button>
                <button class="penalty-action-btn minus" onclick="event.stopPropagation(); clearPenalty(${index})" title="Delete Penalty">−</button>
            </div>
        `;
        li.onclick = () => completePenalty(index);
        list.appendChild(li);
    });
}

function renderRewards() {
    const items = document.querySelectorAll('.reward-item');
    const activeSessions = getActiveSessionsForDay(state.day);
    const completed = Object.keys(state.sessionResults).filter(id => 
        state.sessionResults[id] === 'done' && activeSessions.some(s => s.id === id)
    ).length;
    const total = activeSessions.length;

    // YouTube / Movies (ALL missions)
    if (completed >= total && total > 0) items[0].className = 'reward-item unlocked';
    else items[0].className = 'reward-item locked';

    // Game Session (ALL missions)
    if (completed >= total && total > 0) items[1].className = 'reward-item unlocked';
    else items[1].className = 'reward-item locked';

    // Full Chill (ALL missions)
    const cubeItem = items[2];
    if (completed >= total && total > 0) {
        cubeItem.className = 'reward-item unlocked';
        cubeItem.title = "CLICK TO START 2H FREE TIME!";
    } else {
        cubeItem.className = 'reward-item locked';
        cubeItem.title = "Complete ALL missions to unlock 2H FREE TIME code.";
    }
}

function closeRewardModal() {
    document.getElementById('reward-modal').classList.add('hidden');
}

function resetFreeTime() {
    state.freeTimeEnd = new Date().getTime() + (2 * 60 * 60 * 1000);
    saveState();
    updateRewardTimer();
    showNotification("FREE TIME RESTARTED. ENJOY!");
}

function claimReward(type) {
    if (type === 'netflix') {
        const activeSessions = getActiveSessionsForDay(state.day);
        const completed = Object.keys(state.sessionResults).filter(id => 
            state.sessionResults[id] === 'done' && activeSessions.some(s => s.id === id)
        ).length;
        const total = activeSessions.length;

        if (completed >= total && total > 0) {
            window.open('https://www.youtube.com', '_blank');
        } else {
            showNotification("Mission incomplete. Finish all tasks to unlock your reward!", "error");
        }
    } else if (type === 'freetime') {
        const activeSessions = getActiveSessionsForDay(state.day);
        const completed = Object.keys(state.sessionResults).filter(id => 
            state.sessionResults[id] === 'done' && activeSessions.some(s => s.id === id)
        ).length;
        const total = activeSessions.length;

        if (completed >= total && total > 0) {
            if (!state.freeTimeEnd) {
                state.freeTimeEnd = new Date().getTime() + (2 * 60 * 60 * 1000); // 2 hours
                saveState();
            }
            document.getElementById('reward-modal').classList.remove('hidden');
            updateRewardTimer();
        } else {
            showNotification("Mission incomplete. Finish ALL tasks to unlock FREE TIME!", "error");
        }
    }
}

function updateRewardTimer() {
    if (!state.freeTimeEnd) return;

    const now = new Date().getTime();
    const diff = state.freeTimeEnd - now;
    const display = document.getElementById('reward-countdown');

    if (diff > 0) {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        
        display.innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        display.style.color = "var(--accent-red)";
    } else {
        display.innerText = "00:00:00";
        display.style.color = "var(--accent-red)";
        // Optional: notification when time is up
    }
}

function addPenalty(taskName) {
    state.penalties.push({ name: taskName, date: new Date().toISOString() });
    saveState();
    renderPenalties();
}

function completePenalty(index) {
    if (confirm('Did you complete this penalty task?')) {
        state.penalties.splice(index, 1);
        saveState();
        renderPenalties();
        fireCelebration();
        showNotification("PENALTY CONQUERED!");
    }
}

function clearPenalty(index) {
    if (confirm('Are you sure you want to delete this penalty without completing it?')) {
        state.penalties.splice(index, 1);
        saveState();
        renderPenalties();
        showNotification("PENALTY REMOVED.");
    }
}

// Button Events
document.getElementById('btn-start').addEventListener('click', () => {
    const session = getCurrentSession();
    
    // If it's the "FINISH" state
    if (state.timerActive) {
        if (session) {
            state.sessionResults[session.id] = 'done';
            state.manualOverride = null;
            state.timerActive = false;
            saveState();
            updateDashboard();
            renderTimetable();
            showNotification("MISSION ACCOMPLISHED!");
        } else if (state.manualTimerEnd) {
            state.manualTimerEnd = null;
            state.timerActive = false;
            saveState();
            updateDashboard();
            showNotification("MANUAL MISSION COMPLETE.");
        } else if (!state.firstMissionDone) {
            state.firstMissionDone = true;
            state.timerActive = false;
            saveState();
            updateDashboard();
            showNotification("FIRST MISSION COMPLETE!");
        }
        return;
    }

    // Toggle START
    const currentId = session ? session.id : (state.manualTimerEnd ? 'manual' : (state.firstMissionDone ? 'none' : 'first'));
    if (currentId === 'none') {
        // Start new manual 2h session
        state.manualTimerEnd = new Date().getTime() + (2 * 60 * 1000); // Temporary 2m test or keep 2h?
        state.manualTimerEnd = new Date().getTime() + (2 * 60 * 60 * 1000);
    }
    
    state.timerActive = true;
    saveState();
    updateDashboard();
});

document.getElementById('btn-stop').addEventListener('click', () => {
    state.timerActive = false;
    saveState();
    updateDashboard();
    showNotification("TIMER PAUSED.");
});

// Timer Logic
function startIntervals() {
    setInterval(() => {
        updateClock();
        const display = document.getElementById('timer-display');
        
        if (state.timerActive && state.remainingSeconds > 0) {
            state.remainingSeconds--;
            if (state.remainingSeconds % 10 === 0) saveState(); // Periodic save
        }

        // Reward Timer
        if (state.freeTimeEnd) {
            updateRewardTimer();
        }

        if (state.remainingSeconds > 0 || state.timerActive) {
            const h = Math.floor(state.remainingSeconds / 3600);
            const m = Math.floor((state.remainingSeconds % 3600) / 60);
            const s = state.remainingSeconds % 60;
            display.innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        } else {
            display.innerText = "--:--:--";
        }
        
        // Every second checks
        checkSessionTransitions();

        // Auto-refresh UI every minute
        if (new Date().getSeconds() === 0) {
            checkDayProgression();
            updateDashboard();
            renderTimetable();
        }
    }, 1000);
}

function checkSessionTransitions() {
    const now = new Date();
    const decHour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    const activeForDay = getActiveSessionsForDay(state.day);
    
    // 1. Upcoming Mission Warning (1 minute before)
    const upcomingSession = activeForDay.find(s => {
        const timeToStart = (s.timeRange[0] - decHour) * 60;
        return timeToStart > 0 && timeToStart <= 1.0; 
    });

    if (upcomingSession && state.lastWarningId !== upcomingSession.id) {
        state.lastWarningId = upcomingSession.id;
        notifier.sessionAlert('start', upcomingSession.name);
        saveState();
    }

    // 2. Mission Started Notification
    const currentSession = activeForDay.find(s => decHour >= s.timeRange[0] && decHour <= s.timeRange[1]);
    if (currentSession && state.lastNotifiedId !== currentSession.id) {
        state.lastNotifiedId = currentSession.id;
        notifier.notify("MISSION ACTIVE", `Focus session: ${currentSession.name} is now live.`, "🔥");
        saveState();
    }
    
    // 3. Mission Ending Soon (5 minutes before)
    if (currentSession) {
        const timeToEnd = (currentSession.timeRange[1] - decHour) * 60;
        if (timeToEnd > 0 && timeToEnd <= 5.0 && state.lastEndNotifiedId !== currentSession.id) {
            state.lastEndNotifiedId = currentSession.id;
            notifier.sessionAlert('end', currentSession.name);
            saveState();
        }
    }

    // Reset trackers logic
    // If we are no longer in the "warning" window for the upcoming session
    if (!upcomingSession) state.lastWarningId = null;
    
    // If we are no longer in the current session, reset current/end trackers
    if (!currentSession) {
        state.lastNotifiedId = null;
        state.lastEndNotifiedId = null;
    }
}

// Relax Logic
let relaxTimer = null;
function startRelax(name, duration) {
    document.getElementById('relax-task-name').innerText = name;
    document.getElementById('relax-timer-overlay').classList.remove('hidden');
    
    let timeLeft = duration;
    updateRelaxDisplay(timeLeft);
    
    relaxTimer = setInterval(() => {
        timeLeft--;
        updateRelaxDisplay(timeLeft);
        if (timeLeft <= 0) {
            stopRelax();
            showNotification("Relax complete! Brain refreshed.", "success");
        }
    }, 1000);
}

function updateRelaxDisplay(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    document.getElementById('relax-countdown').innerText = `${m}:${s.toString().padStart(2, '0')}`;
}

function stopRelax() {
    clearInterval(relaxTimer);
    document.getElementById('relax-timer-overlay').classList.add('hidden');
}

function togglePenaltyList() {
    const panel = document.getElementById('penalty-panel');
    panel.classList.toggle('collapsed');
}

function showNotification(msg, type = "success") {
    const icon = type === "error" ? "❌" : "🏆";
    notifier.notify(type === "error" ? "SYSTEM ALERT" : "MISSION STATUS", msg, icon);
}

// History Controls
function openHistoryModal() {
    renderHistory();
    document.getElementById('history-modal').classList.remove('hidden');
}

function closeHistoryModal() {
    document.getElementById('history-modal').classList.add('hidden');
}

function renderHistory() {
    const list = document.getElementById('history-list');
    if (!list) return;

    if (!state.history || state.history.length === 0) {
        list.innerHTML = '<div class="empty-history">No history recorded yet. Complete a day to see your progress here!</div>';
        return;
    }

    list.innerHTML = '';
    state.history.forEach(record => {
        const item = document.createElement('div');
        item.className = 'history-item';
        
        // Count statuses
        const results = record.results || {};
        const doneCount = Object.values(results).filter(v => v === 'done').length;
        const failCount = Object.values(results).filter(v => v === 'fail').length;

        // Generate status pills
        let pillsHtml = '';
        SESSIONS.forEach(s => {
            const res = results[s.id];
            if (res) {
                pillsHtml += `<span class="status-pill ${res}">${s.name}</span>`;
            }
        });

        item.innerHTML = `
            <div class="history-item-header">
                <div>
                    <div class="history-day-tag">DAY ${record.day}</div>
                    <div class="history-date">${record.date}</div>
                </div>
                <div style="text-align: right">
                    <div class="history-progress-label">${record.progress}%</div>
                </div>
            </div>
            <div class="history-mini-progress-container">
                <div class="history-mini-progress" style="width: ${record.progress}%"></div>
            </div>
            <div class="history-stats-row">
                <span>Completed: ${record.completedCount}/${record.totalCount}</span>
                <span>Fails: ${failCount}</span>
            </div>
            <div class="history-details">
                ${pillsHtml || '<small style="opacity: 0.5">No session data available</small>'}
            </div>
        `;
        list.appendChild(item);
    });
}

// Start
init();
