/**
 * NEON ROYALE — Core Engine & Game Logic
 */

// --- Audio Synthesizer Engine (Zero External Assets Required) ---
const AudioEngine = {
    ctx: null,
    sfxEnabled: true,
    musicEnabled: true,
    musicInterval: null,

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    playTone(freq, type, duration, vol = 0.1) {
        if (!this.sfxEnabled) return;
        try {
            this.init();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch(e) {}
    },

    playClick() { this.playTone(800, 'sine', 0.05, 0.05); },
    playCoin() { 
        this.playTone(1200, 'sine', 0.08, 0.1);
        setTimeout(() => this.playTone(1800, 'sine', 0.12, 0.1), 80);
    },
    playCrash() { this.playTone(120, 'sawtooth', 0.5, 0.25); },
    playLevelUp() {
        [400, 600, 800, 1200].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'triangle', 0.15, 0.15), i * 100);
        });
    },
    playMissionComplete() {
        [500, 750, 1000].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'sine', 0.12, 0.15), i * 120);
        });
    },

    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        document.getElementById('sfx-toggle-btn').innerText = this.sfxEnabled ? 'ON' : 'OFF';
        Storage.saveSettings();
    },

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        document.getElementById('music-toggle-btn').innerText = this.musicEnabled ? 'ON' : 'OFF';
        if (!this.musicEnabled && this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        } else if (this.musicEnabled) {
            this.startSynthwaveBeat();
        }
        Storage.saveSettings();
    },

    startSynthwaveBeat() {
        if (this.musicInterval || !this.musicEnabled) return;
        const notes = [110, 165, 146.83, 130.81]; // Am synth bass groove
        let step = 0;
        this.musicInterval = setInterval(() => {
            if (!this.musicEnabled) return;
            try {
                this.init();
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(notes[step % notes.length], this.ctx.currentTime);
                
                gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.25);
                step++;
            } catch(e) {}
        }, 300);
    }
};

// --- Storage Management ---
const Storage = {
    data: {
        coins: 100,
        unlockedCars: ['ROYALE X'],
        selectedCar: 'ROYALE X',
        level: 1,
        score: 0,
        highScore: 0,
        highSpeed: 0,
        maxDist: 0,
        playerName: 'DRIVER',
        missions: {
            1: { progress: 0, target: 1.0, completed: false, text: 'Drive 1 KM', reward: 150 },
            2: { progress: 0, target: 180, completed: false, text: 'Reach 180 KM/H', reward: 200 },
            3: { progress: 0, target: 50, completed: false, text: 'Collect 50 Coins', reward: 300 },
            4: { progress: 0, target: 1, completed: false, text: 'Drive without crashing', reward: 250 },
            5: { progress: 0, target: 250, completed: false, text: 'Reach 250 KM/H', reward: 500 },
            6: { progress: 0, target: 5.0, completed: false, text: 'Long distance drive (5 KM)', reward: 1000 }
        },
        settings: { sfx: true, music: true }
    },

    load() {
        const saved = localStorage.getItem('neon_royale_save_v1');
        if (saved) {
            try {
                this.data = JSON.parse(saved);
            } catch(e) {}
        }
        AudioEngine.sfxEnabled = this.data.settings.sfx;
        AudioEngine.musicEnabled = this.data.settings.music;
        document.getElementById('sfx-toggle-btn').innerText = AudioEngine.sfxEnabled ? 'ON' : 'OFF';
        document.getElementById('music-toggle-btn').innerText = AudioEngine.musicEnabled ? 'ON' : 'OFF';
        document.getElementById('player-name-input').value = this.data.playerName;
        if (AudioEngine.musicEnabled) AudioEngine.startSynthwaveBeat();
    },

    save() {
        localStorage.setItem('neon_royale_save_v1', JSON.stringify(this.data));
        UI.updateHomeStats();
    },

    savePlayerName(name) {
        this.data.playerName = name.trim().toUpperCase() || 'DRIVER';
        this.save();
    },

    saveSettings() {
        this.data.settings.sfx = AudioEngine.sfxEnabled;
        this.data.settings.music = AudioEngine.musicEnabled;
        this.save();
    },

    resetData() {
        if (confirm('Are you sure you want to completely wipe all game progress and stats?')) {
            localStorage.removeItem('neon_royale_save_v1');
            location.reload();
        }
    }
};

// --- Car Catalog ---
const CARS = [
    { id: 'ROYALE X', name: 'ROYALE X', speed: 65, accel: 60, handling: 70, braking: 70, price: 0, emoji: '🏎️' },
    { id: 'PHANTOM GT', name: 'PHANTOM GT', speed: 75, accel: 70, handling: 75, braking: 75, price: 500, emoji: '🚘' },
    { id: 'VORTEX R', name: 'VORTEX R', speed: 85, accel: 85, handling: 80, braking: 80, price: 1500, emoji: '⚡' },
    { id: 'TITAN RS', name: 'TITAN RS', speed: 92, accel: 90, handling: 85, braking: 85, price: 3500, emoji: '🔥' },
    { id: 'APEX Z', name: 'APEX Z', speed: 100, accel: 100, handling: 95, braking: 92, price: 7500, emoji: '👑' }
];

// --- Levels Catalog ---
const LEVELS = [
    { level: 1, name: 'ROOKIE', xpReq: 0, reward: 0 },
    { level: 2, name: 'STREET RACER', xpReq: 1000, reward: 250 },
    { level: 3, name: 'NIGHT DRIVER', xpReq: 3000, reward: 500 },
    { level: 4, name: 'SPEED HUNTER', xpReq: 6000, reward: 1000 },
    { level: 5, name: 'ROYAL RACER', xpReq: 10000, reward: 2000 },
    { level: 6, name: 'ELITE', xpReq: 15000, reward: 3500 },
    { level: 7, name: 'VIP', xpReq: 22000, reward: 5000 },
    { level: 8, name: 'MASTER', xpReq: 30000, reward: 7500 },
    { level: 9, name: 'LEGEND', xpReq: 40000, reward: 10000 },
    { level: 10, name: 'NEON ROYALE', xpReq: 55000, reward: 20000 }
];

// --- UI Navigation Manager ---
const UI = {
    showScreen(screenId) {
        AudioEngine.playClick();
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('hud-overlay').classList.add('hidden');
        
        if (screenId === 'garage-screen') {
            Garage.init();
        } else if (screenId === 'missions-screen') {
            Missions.render();
        } else if (screenId === 'leaderboard-screen') {
            Leaderboard.render();
        }

        const target = document.getElementById(screenId);
        if (target) target.classList.add('active');
        this.updateHomeStats();
    },

    updateHomeStats() {
        document.getElementById('home-coins').innerText = Storage.data.coins;
        document.getElementById('home-level').innerText = Storage.data.level;
        document.getElementById('home-highscore').innerText = Storage.data.highScore;
    },

    showLevelUp(lvlObj) {
        AudioEngine.playLevelUp();
        document.getElementById('popup-levelname').innerText = lvlObj.name;
        document.getElementById('popup-reward').innerText = lvlObj.reward;
        document.getElementById('levelup-popup').classList.remove('hidden');
    }
};

// --- Garage Controller ---
const Garage = {
    selectedCarId: null,

    init() {
        this.selectedCarId = Storage.data.selectedCar;
        this.renderList();
        this.updateShowcase();
    },

    renderList() {
        const container = document.getElementById('car-list-container');
        container.innerHTML = '';
        CARS.forEach(car => {
            const unlocked = Storage.data.unlockedCars.includes(car.id);
            const isSelected = car.id === this.selectedCarId;
            const div = document.createElement('div');
            div.className = `car-card ${isSelected ? 'selected' : ''}`;
            div.innerHTML = `
                <div class="car-card-info">
                    <h4>${car.emoji} ${car.name}</h4>
                    <p>${unlocked ? (isSelected ? 'EQUIPPED' : 'UNLOCKED') : `PRICE: ${car.price} 💰`}</p>
                </div>
            `;
            div.onclick = () => {
                AudioEngine.playClick();
                this.selectedCarId = car.id;
                this.renderList();
                this.updateShowcase();
            };
            container.appendChild(div);
        });
        document.getElementById('garage-coins').innerText = Storage.data.coins;
    },

    updateShowcase() {
        const car = CARS.find(c => c.id === this.selectedCarId) || CARS[0];
        const unlocked = Storage.data.unlockedCars.includes(car.id);
        
        document.getElementById('car-preview-art').innerText = car.emoji;
        document.getElementById('current-car-name').innerText = car.name;
        document.getElementById('stat-speed').style.width = car.speed + '%';
        document.getElementById('stat-accel').style.width = car.accel + '%';
        document.getElementById('stat-handling').style.width = car.handling + '%';

        const btn = document.getElementById('car-action-btn');
        if (unlocked) {
            btn.innerText = car.id === Storage.data.selectedCar ? 'EQUIPPED' : 'SELECT';
            btn.className = 'neon-btn primary-btn';
        } else {
            btn.innerText = `UNLOCK (${car.price} 💰)`;
            btn.className = 'neon-btn';
        }
    },

    handleCarAction() {
        AudioEngine.playClick();
        const car = CARS.find(c => c.id === this.selectedCarId);
        const unlocked = Storage.data.unlockedCars.includes(car.id);

        if (unlocked) {
            Storage.data.selectedCar = car.id;
            Storage.save();
            this.renderList();
        } else {
            if (Storage.data.coins >= car.price) {
                Storage.data.coins -= car.price;
                Storage.data.unlockedCars.push(car.id);
                Storage.data.selectedCar = car.id;
                Storage.save();
                this.renderList();
                this.updateShowcase();
            } else {
                alert('Not enough coins to unlock this supercar!');
            }
        }
    }
};

// --- Missions System ---
const Missions = {
    render() {
        const container = document.getElementById('missions-container');
        container.innerHTML = '';
        Object.keys(Storage.data.missions).forEach(id => {
            const m = Storage.data.missions[id];
            const div = document.createElement('div');
            div.className = `mission-item ${m.completed ? 'completed' : ''}`;
            div.innerHTML = `
                <div>
                    <h4>${m.text}</h4>
                    <p>Reward: ${m.reward} 💰 — Progress: ${Math.min(m.progress, m.target)} / ${m.target}</p>
                </div>
                <div>${m.completed ? '✅ COMPLETED' : '⏳ ACTIVE'}</div>
            `;
            container.appendChild(div);
        });
    },

    checkMissionProgress(type, val) {
        let updated = false;
        Object.keys(Storage.data.missions).forEach(id => {
            let m = Storage.data.missions[id];
            if (m.completed) return;

            if (type === 'dist' && id == '1') {
                m.progress = parseFloat(val.toFixed(2));
                if (m.progress >= m.target) this.completeMission(id);
                updated = true;
            } else if (type === 'speed' && (id == '2' || id == '5')) {
                if (val >= m.target) {
                    m.progress = val;
                    this.completeMission(id);
                    updated = true;
                }
            } else if (type === 'coin' && id == '3') {
                m.progress = val;
                if (m.progress >= m.target) this.completeMission(id);
                updated = true;
            } else if (type === 'nocrash' && id == '4') {
                m.progress = 1;
                this.completeMission(id);
                updated = true;
            } else if (type === 'dist' && id == '6') {
                m.progress = parseFloat(val.toFixed(2));
                if (m.progress >= m.target) this.completeMission(id);
                updated = true;
            }
        });
        if (updated) Storage.save();
    },

    completeMission(id) {
        let m = Storage.data.missions[id];
        if (m.completed) return;
        m.completed = true;
        Storage.data.coins += m.reward;
        AudioEngine.playMissionComplete();
    }
};

// --- Leaderboard System ---
const Leaderboard = {
    render() {
        const container = document.getElementById('leaderboard-container');
        container.innerHTML = `
            <div class="leaderboard-row" style="font-weight:bold; color:var(--neon-cyan)">
                <span>RANK & CALLSIGN</span>
                <span>SCORE / SPEED</span>
            </div>
            <div class="leaderboard-row">
                <span>1. 👑 ${Storage.data.playerName} (YOU)</span>
                <span>${Storage.data.highScore} PTS (${Storage.data.highSpeed} KM/H)</span>
            </div>
            <div class="leaderboard-row">
                <span>2. ⚡ VORTEX_X</span>
                <span>14,500 PTS (310 KM/H)</span>
            </div>
            <div class="leaderboard-row">
                <span>3. 🏎️ CYBER_VIP</span>
                <span>12,200 PTS (295 KM/H)</span>
            </div>
            <div class="leaderboard-row">
                <span>4. 🌙 NIGHTHAWK</span>
                <span>9,800 PTS (280 KM/H)</span>
            </div>
        `;
    }
};

// --- Main Game Engine ---
const Game = {
    canvas: null,
    ctx: null,
    isRunning: false,
    
    // Physics & State
    carX: 0,
    carY: 0,
    speed: 0,
    maxSpeed: 240,
    accelRate: 0.5,
    handlingVal: 3.5,
    distance: 0,
    score: 0,
    coinsEarned: 0,
    coinsCollectedThisRun: 0,
    topSpeedRun: 0,
    crashed: false,
    
    // Controls State
    keys: { left: false, right: false, accel: false, brake: false },

    // World Elements
    roadWidth: 600,
    traffic: [],
    coinsList: [],
    particles: [],
    scenery: [],
    roadOffset: 0,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.setupControls();
    },

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    setupControls() {
        window.addEventListener('keydown', e => {
            if (!this.isRunning) return;
            if (e.code === 'KeyW' || e.code === 'ArrowUp') this.keys.accel = true;
            if (e.code === 'KeyS' || e.code === 'ArrowDown' || e.code === 'Space') this.keys.brake = true;
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = true;
            if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = true;
        });

        window.addEventListener('keyup', e => {
            if (e.code === 'KeyW' || e.code === 'ArrowUp') this.keys.accel = false;
            if (e.code === 'KeyS' || e.code === 'ArrowDown' || e.code === 'Space') this.keys.brake = false;
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = false;
            if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = false;
        });

        // Touch Controls
        const bindTouch = (id, keyName) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys[keyName] = true; });
            el.addEventListener('touchend', (e) => { e.preventDefault(); this.keys[keyName] = false; });
            el.addEventListener('mousedown', () => { this.keys[keyName] = true; });
            el.addEventListener('mouseup', () => { this.keys[keyName] = false; });
        };

        bindTouch('btn-left', 'left');
        bindTouch('btn-right', 'right');
        bindTouch('btn-accel', 'accel');
        bindTouch('btn-brake', 'brake');
    },

    startRun() {
        AudioEngine.init();
        AudioEngine.playClick();
        
        const selectedCarObj = CARS.find(c => c.id === Storage.data.selectedCar) || CARS[0];
        this.maxSpeed = selectedCarObj.speed * 3.2;
        this.accelRate = selectedCarObj.accel * 0.008;
        this.handlingVal = selectedCarObj.handling * 0.045;

        // Reset state
        this.speed = 0;
        this.distance = 0;
        this.score = 0;
        this.coinsEarned = 0;
        this.coinsCollectedThisRun = 0;
        this.topSpeedRun = 0;
        this.crashed = false;
        this.carX = 0;
        this.traffic = [];
        this.coinsList = [];
        this.particles = [];
        this.roadOffset = 0;

        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('hud-overlay').classList.remove('hidden');

        this.isRunning = true;
        requestAnimationFrame(() => this.loop());
    },

    loop() {
        if (!this.isRunning) return;

        this.update();
        this.render();

        requestAnimationFrame(() => this.loop());
    },

    update() {
        // Handle Acceleration & Braking
        if (this.keys.accel) {
            this.speed += this.accelRate;
            if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
        } else {
            this.speed -= 0.35; // Natural friction deceleration
            if (this.speed < 0) this.speed = 0;
        }

        if (this.keys.brake) {
            this.speed -= 1.8;
            if (this.speed < 0) this.speed = 0;
        }

        // Steering
        const steerFactor = this.handlingVal * (this.speed / this.maxSpeed || 0.2);
        if (this.keys.left) this.carX -= steerFactor * 4.5;
        if (this.keys.right) this.carX += steerFactor * 4.5;

        const maxRoadLimit = this.roadWidth / 2 - 40;
        if (this.carX < -maxRoadLimit) this.carX = -maxRoadLimit;
        if (this.carX > maxRoadLimit) this.carX = maxRoadLimit;

        // Distance & Stats
        const kmDelta = (this.speed / 3600) * 0.06;
        this.distance += kmDelta;
        this.score += Math.floor(this.speed * 0.02);

        if (this.speed > this.topSpeedRun) this.topSpeedRun = Math.floor(this.speed);

        // Mission Hooks
        Missions.checkMissionProgress('dist', this.distance);
        Missions.checkMissionProgress('speed', this.topSpeedRun);

        // Traffic Spawning
        if (Math.random() < 0.025 + (this.speed / 2000)) {
            this.traffic.push({
                x: (Math.random() * 0.8 - 0.4) * this.roadWidth,
                y: -100,
                speed: 2 + Math.random() * 3,
                color: ['#ff007f', '#bd00ff', '#00f3ff', '#ffd700'][Math.floor(Math.random() * 4)]
            });
        }

        // Coin Spawning
        if (Math.random() < 0.03) {
            this.coinsList.push({
                x: (Math.random() * 0.8 - 0.4) * this.roadWidth,
                y: -100
            });
        }

        // Update Traffic
        const worldSpeed = this.speed * 0.12;
        this.roadOffset += worldSpeed;

        for (let i = this.traffic.length - 1; i >= 0; i--) {
            let t = this.traffic[i];
            t.y += worldSpeed - t.speed;

            // Collision check
            if (t.y > this.canvas.height - 220 && t.y < this.canvas.height - 120) {
                if (Math.abs(this.carX - t.x) < 45) {
                    this.gameOver();
                    return;
                }
            }

            if (t.y > this.canvas.height + 100) this.traffic.splice(i, 1);
        }

        // Update Coins
        for (let i = this.coinsList.length - 1; i >= 0; i--) {
            let c = this.coinsList[i];
            c.y += worldSpeed;

            // Collection check
            if (c.y > this.canvas.height - 220 && c.y < this.canvas.height - 120) {
                if (Math.abs(this.carX - c.x) < 50) {
                    AudioEngine.playCoin();
                    this.coinsEarned += 10;
                    this.coinsCollectedThisRun++;
                    Missions.checkMissionProgress('coin', this.coinsCollectedThisRun);
                    this.coinsList.splice(i, 1);
                    continue;
                }
            }

            if (c.y > this.canvas.height + 100) this.coinsList.splice(i, 1);
        }

        // Update HUD DOM
        document.getElementById('hud-speed').innerText = Math.floor(this.speed);
        document.getElementById('hud-coins').innerText = Storage.data.coins + this.coinsEarned;
        document.getElementById('hud-score').innerText = this.score;
        document.getElementById('hud-dist').innerText = this.distance.toFixed(2);
        document.getElementById('hud-level').innerText = Storage.data.level;
        document.getElementById('hud-levelname').innerText = LEVELS[Storage.data.level - 1]?.name || 'ROOKIE';

        // Animate Speedometer Needle
        const needleAngle = -135 + (this.speed / this.maxSpeed) * 270;
        const needle = document.getElementById('speedometer-needle');
        if (needle) needle.style.transform = `rotate(${needleAngle}deg)`;
    },

    render() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const ctx = this.ctx;

        // Background Sky & Neon Grid
        ctx.fillStyle = '#05050f';
        ctx.fillRect(0, 0, w, h);

        // Draw Stars/City Glow in Horizon
        ctx.fillStyle = '#00f3ff';
        ctx.fillRect(0, h * 0.35 - 2, w, 4);

        // Draw Road Perspective
        const centerX = w / 2;
        const roadW = this.roadWidth;
        const horizonY = h * 0.35;

        ctx.fillStyle = '#111122';
        ctx.beginPath();
        ctx.moveTo(centerX - roadW * 0.15, horizonY);
        ctx.lineTo(centerX + roadW * 0.15, horizonY);
        ctx.lineTo(centerX + roadW, h);
        ctx.lineTo(centerX - roadW, h);
        ctx.fill();

        // Road Center Neon Lines
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00f3ff';

        ctx.beginPath();
        ctx.moveTo(centerX - roadW * 0.15, horizonY);
        ctx.lineTo(centerX - roadW, h);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX + roadW * 0.15, horizonY);
        ctx.lineTo(centerX + roadW, h);
        ctx.stroke();

        // Moving Center Dashes
        ctx.strokeStyle = '#ff007f';
        ctx.lineWidth = 6;
        ctx.shadowColor = '#ff007f';
        ctx.setLineDash([30, 40]);
        ctx.lineDashOffset = -this.roadOffset * 2;
        ctx.beginPath();
        ctx.moveTo(centerX, horizonY);
        ctx.lineTo(centerX, h);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;

        // Render Coins
        this.coinsList.forEach(c => {
            const screenX = centerX + c.x * (c.y / h);
            const scale = Math.max(0.3, c.y / h);
            ctx.fillStyle = '#ffd700';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ffd700';
            ctx.beginPath();
            ctx.arc(screenX, c.y, 14 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // Render Traffic
        this.traffic.forEach(t => {
            const screenX = centerX + t.x;
            const screenY = t.y;
            ctx.fillStyle = t.color;
            ctx.shadowBlur = 12;
            ctx.shadowColor = t.color;
            ctx.roundRect(screenX - 35, screenY - 50, 70, 100, 10);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // Render Player Supercar
        const playerScreenX = centerX + this.carX;
        const playerScreenY = h - 160;

        ctx.fillStyle = '#00f3ff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00f3ff';
        ctx.roundRect(playerScreenX - 38, playerScreenY - 60, 76, 120, 14);
        ctx.fill();

        // Cockpit Window Glass
        ctx.fillStyle = '#05050f';
        ctx.fillRect(playerScreenX - 26, playerScreenY - 30, 52, 45);
        ctx.shadowBlur = 0;
    },

    gameOver() {
        this.isRunning = false;
        AudioEngine.playCrash();
        Missions.checkMissionProgress('nocrash', 0); // Reset or mark no-crash condition if needed

        // Save earnings & highscore
        Storage.data.coins += this.coinsEarned;
        if (this.score > Storage.data.highScore) Storage.data.highScore = this.score;
        if (this.topSpeedRun > Storage.data.highSpeed) Storage.data.highSpeed = this.topSpeedRun;
        if (this.distance > Storage.data.maxDist) Storage.data.maxDist = this.distance;

        // Check Level Progression
        let currentLevelObj = LEVELS[Storage.data.level - 1];
        let nextLevelObj = LEVELS[Storage.data.level];
        if (nextLevelObj && Storage.data.highScore >= nextLevelObj.xpReq) {
            Storage.data.level++;
            Storage.data.coins += nextLevelObj.reward;
            UI.showLevelUp(nextLevelObj);
        }

        Storage.save();

        // Populate Game Over Screen
        document.getElementById('go-score').innerText = this.score;
        document.getElementById('go-dist').innerText = this.distance.toFixed(2);
        document.getElementById('go-speed').innerText = this.topSpeedRun;
        document.getElementById('go-coins').innerText = this.coinsEarned;

        document.getElementById('hud-overlay').classList.add('hidden');
        document.getElementById('gameover-screen').classList.add('active');
    },

    dismissLevelUp() {
        AudioEngine.playClick();
        document.getElementById('levelup-popup').classList.add('hidden');
    }
};

// Initialize Application on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
    Storage.load();
    Game.init();
    UI.updateHomeStats();
});
