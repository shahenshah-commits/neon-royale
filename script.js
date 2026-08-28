/**
 * MIND VAULT — Core Engine & Algorithmic Puzzle Generator
 */

// --- Web Audio Synthesizer Engine (Zero External Dependencies) ---
const AudioEngine = {
    ctx: null,
    sfxEnabled: true,

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

    playClick() { this.playTone(700, 'sine', 0.04, 0.05); },
    playCorrect() {
        [523.25, 659.25, 783.99].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'triangle', 0.12, 0.1), i * 80);
        });
    },
    playWrong() { this.playTone(150, 'sawtooth', 0.3, 0.2); },
    playWin() {
        [400, 600, 800, 1000, 1200].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'sine', 0.15, 0.15), i * 90);
        });
    },

    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        document.getElementById('sfx-toggle-btn').innerText = this.sfxEnabled ? 'ON' : 'OFF';
        Storage.saveSettings();
    }
};

// --- Storage Management ---
const Storage = {
    data: {
        currentLevel: 1,
        unlockedLevel: 1,
        stars: {}, // { levelNum: starCount }
        score: 0,
        streak: 0,
        bestStreak: 0,
        hintsUsed: 0,
        perfectLevels: 0,
        achievements: {
            firstSolve: false,
            brainMaster: false,
            logicKing: false,
            perfectMind: false,
            speedThinker: false,
            puzzleMaster: false
        },
        settings: { sfx: true }
    },

    load() {
        const saved = localStorage.getItem('mind_vault_save_v1');
        if (saved) {
            try {
                this.data = JSON.parse(saved);
            } catch(e) {}
        }
        AudioEngine.sfxEnabled = this.data.settings.sfx;
        document.getElementById('sfx-toggle-btn').innerText = AudioEngine.sfxEnabled ? 'ON' : 'OFF';
        this.updateHomeStats();
    },

    save() {
        localStorage.setItem('mind_vault_save_v1', JSON.stringify(this.data));
        this.updateHomeStats();
    },

    saveSettings() {
        this.data.settings.sfx = AudioEngine.sfxEnabled;
        this.save();
    },

    updateHomeStats() {
        let totalStars = Object.values(this.data.stars).reduce((a, b) => a + b, 0);
        document.getElementById('home-stars').innerText = totalStars;
        document.getElementById('home-score').innerText = this.data.score;
        document.getElementById('home-streak').innerText = this.data.streak;
    },

    resetData() {
        if (confirm('Are you sure you want to completely erase all Mind Vault progress?')) {
            localStorage.removeItem('mind_vault_save_v1');
            location.reload();
        }
    }
};

// --- UI Navigation Manager ---
const UI = {
    showScreen(screenId) {
        AudioEngine.playClick();
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('complete-modal').classList.add('hidden');
        document.getElementById('failed-modal').classList.add('hidden');

        if (screenId === 'map-screen') {
            MapScreen.render();
        } else if (screenId === 'achievements-screen') {
            Achievements.render();
        } else if (screenId === 'stats-screen') {
            Stats.render();
        }

        const target = document.getElementById(screenId);
        if (target) target.classList.add('active');
        Storage.updateHomeStats();
    }
};

// --- Background Canvas Visualizer ---
const VaultCanvas = {
    canvas: null,
    ctx: null,
    nodes: [],

    init() {
        this.canvas = document.getElementById('vaultCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        for (let i = 0; i < 45; i++) {
            this.nodes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                radius: Math.random() * 2 + 1
            });
        }
        this.loop();
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    loop() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        this.ctx.fillStyle = '#030308';
        this.ctx.fillRect(0, 0, w, h);

        this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.08)';
        this.ctx.lineWidth = 1;

        for (let i = 0; i < this.nodes.length; i++) {
            let n = this.nodes[i];
            n.x += n.vx;
            n.y += n.vy;

            if (n.x < 0 || n.x > w) n.vx *= -1;
            if (n.y < 0 || n.y > h) n.vy *= -1;

            this.ctx.fillStyle = '#00f3ff';
            this.ctx.beginPath();
            this.ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            this.ctx.fill();

            for (let j = i + 1; j < this.nodes.length; j++) {
                let n2 = this.nodes[j];
                let dist = Math.hypot(n.x - n2.x, n.y - n2.y);
                if (dist < 130) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(n.x, n.y);
                    this.ctx.lineTo(n2.x, n2.y);
                    this.ctx.stroke();
                }
            }
        }
        requestAnimationFrame(() => this.loop());
    }
};

// --- Level Map Controller ---
const MapScreen = {
    render() {
        const container = document.getElementById('level-grid-container');
        container.innerHTML = '';
        
        let completedCount = Object.keys(Storage.data.stars).length;
        let percent = Math.floor((completedCount / 100) * 100);
        
        document.getElementById('progress-lvl-text').innerText = completedCount;
        document.getElementById('progress-percent').innerText = percent + '%';
        document.getElementById('prog-fill').style.width = percent + '%';

        for (let i = 1; i <= 100; i++) {
            const unlocked = i <= Storage.data.unlockedLevel;
            const stars = Storage.data.stars[i] || 0;
            const node = document.createElement('div');
            node.className = `level-node ${unlocked ? 'unlocked' : 'locked'}`;
            node.innerHTML = `
                <span>${i === 100 ? '👑 100' : i}</span>
                <span class="node-stars">${unlocked ? '⭐'.repeat(stars) || '🔒' : '🔒'}</span>
            `;
            if (unlocked) {
                node.onclick = () => PuzzleEngine.loadLevel(i);
            }
            container.appendChild(node);
        }
    }
};

// --- Algorithmic Puzzle Engine (100 Levels + Final Vault) ---
const PuzzleEngine = {
    currentLevelNum: 1,
    attemptsLeft: 3,
    timerSeconds: 0,
    timerInterval: null,
    activePuzzle: null,
    startTime: 0,

    resumeOrStart() {
        this.loadLevel(Storage.data.unlockedLevel <= 100 ? Storage.data.unlockedLevel : 100);
    },

    loadLevel(lvlNum) {
        AudioEngine.playClick();
        this.currentLevelNum = lvlNum;
        this.attemptsLeft = 3;
        this.timerSeconds = 0;
        this.startTime = Date.now();

        if (lvlNum === 100) {
            this.loadFinalVault();
            return;
        }

        document.getElementById('hud-level-title').innerText = `LEVEL ${lvlNum}`;
        document.getElementById('hud-attempts').innerText = `ATTEMPTS: ❤️❤️❤️`;
        document.getElementById('hud-streak').innerText = `🔥 x${Storage.data.streak}`;
        document.getElementById('hint-display-box').classList.add('hidden');

        // Generate Puzzle based on Level tier & modulo variety
        this.activePuzzle = this.generatePuzzle(lvlNum);
        
        document.getElementById('puzzle-category-title').innerText = this.activePuzzle.category;
        document.getElementById('puzzle-question-prompt').innerText = this.activePuzzle.prompt;
        
        this.renderInteractiveArea();
        UI.showScreen('puzzle-screen');

        // Optional Timer for levels > 25
        if (lvlNum > 25) {
            this.startTimer();
        }
    },

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timerSeconds++;
            let mins = String(Math.floor(this.timerSeconds / 60)).padStart(2, '0');
            let secs = String(this.timerSeconds % 60).padStart(2, '0');
            document.getElementById('hud-timer').innerText = `TIME: ${mins}:${secs}`;
        }, 1000);
    },

    generatePuzzle(lvl) {
        const types = ['number', 'pattern', 'logic', 'code', 'odd', 'memory'];
        let type = types[(lvl - 1) % types.length];

        if (type === 'number') {
            let start = (lvl * 2) % 15 + 1;
            let step = (lvl % 5) + 2;
            let seq = [start, start + step, start + step * 2, start + step * 3];
            let ans = start + step * 4;
            let options = [ans, ans + step, ans - step, ans + 2];
            options.sort(() => Math.random() - 0.5);

            return {
                category: '🔢 NUMBER SEQUENCE',
                prompt: `${seq.join(' → ')} → ?`,
                type: 'choice',
                options: options,
                answer: ans,
                hint: `Each number increases by ${step}.`
            };
        } else if (type === 'pattern') {
            let symbols = ['🔺', '🟦', '🟢', '⭐'];
            let s1 = symbols[lvl % symbols.length];
            let s2 = symbols[(lvl + 1) % symbols.length];
            let seq = [s1, s2, s1, s2];
            let ans = s1;
            let options = [s1, s2, '❌', '⚡'];
            options.sort(() => Math.random() - 0.5);

            return {
                category: '👀 PATTERN RECOGNITION',
                prompt: `What comes next in the sequence?\n${seq.join(' ')} → ?`,
                type: 'choice',
                options: options,
                answer: ans,
                hint: 'Observe the alternating pattern pair.'
            };
        } else if (type === 'logic') {
            return {
                category: '🧠 LOGIC DEDUCTION',
                prompt: `Vault door A opens on primes. Vault door B opens on evens. Which door opens on 2?`,
                type: 'choice',
                options: ['DOOR A', 'DOOR B', 'BOTH', 'NEITHER'],
                answer: 'BOTH',
                hint: '2 is both an even number and a prime number.'
            };
        } else if (type === 'code') {
            let code = 100 + (lvl * 7) % 800;
            let clue = code - 15;
            return {
                category: '🔐 CODE BREAKER',
                prompt: `Clue: The secret security PIN is 15 more than ${clue}. Enter code:`,
                type: 'input',
                answer: String(code),
                hint: `Add 15 to ${clue}.`
            };
        } else if (type === 'odd') {
            let items = ['💻', '💻', '💻', '🧠', '💻'];
            items.sort(() => Math.random() - 0.5);
            return {
                category: '🎯 ODD ONE OUT',
                prompt: 'Find the anomalous element in the data stream:',
                type: 'choice',
                options: items,
                answer: '🧠',
                hint: 'Look for the biological brain icon among computers.'
            };
        } else {
            return {
                category: '💡 QUICK MENTAL MATH',
                prompt: `Solve: (${lvl} × 2) + 10 = ?`,
                type: 'input',
                answer: String((lvl * 2) + 10),
                hint: `Multiply ${lvl} by 2, then add 10.`
            };
        }
    },

    renderInteractiveArea() {
        const area = document.getElementById('puzzle-interactive-area');
        area.innerHTML = '';

        if (this.activePuzzle.type === 'choice') {
            const grid = document.createElement('div');
            grid.className = 'options-grid';
            this.activePuzzle.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'puzzle-option-btn';
                btn.innerText = opt;
                btn.onclick = () => this.submitAnswer(opt);
                grid.appendChild(btn);
            });
            area.appendChild(grid);
        } else if (this.activePuzzle.type === 'input') {
            const wrap = document.createElement('div');
            wrap.style.display = 'flex';
            wrap.style.flexDirection = 'column';
            wrap.style.gap = '15px';
            wrap.style.alignItems = 'center';

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'text-answer-input';
            input.id = 'puzzle-text-input';
            input.placeholder = 'ENTER ANSWER';

            const btn = document.createElement('neon-btn');
            btn.className = 'neon-btn primary-btn';
            btn.innerText = 'SUBMIT';
            btn.onclick = () => {
                const val = document.getElementById('puzzle-text-input').value.trim();
                this.submitAnswer(val);
            };

            wrap.appendChild(input);
            wrap.appendChild(btn);
            area.appendChild(wrap);
        }
    },

    submitAnswer(userAns) {
        if (this.timerInterval) clearInterval(this.timerInterval);
        const correct = String(userAns).toUpperCase() === String(this.activePuzzle.answer).toUpperCase();

        if (correct) {
            AudioEngine.playCorrect();
            this.handleSuccess();
        } else {
            AudioEngine.playWrong();
            this.attemptsLeft--;
            document.getElementById('hud-attempts').innerText = `ATTEMPTS: ${'❤️'.repeat(this.attemptsLeft)}`;
            if (this.attemptsLeft <= 0) {
                Storage.data.streak = 0;
                Storage.save();
                document.getElementById('failed-modal').classList.remove('hidden');
            } else {
                alert('Incorrect answer! Check your logic and try again.');
            }
        }
    },

    handleSuccess() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        Storage.data.streak++;
        if (Storage.data.streak > Storage.data.bestStreak) Storage.data.bestStreak = Storage.data.streak;

        let timeElapsed = (Date.now() - this.startTime) / 1000;
        let stars = timeElapsed < 25 ? 3 : (timeElapsed < 50 ? 2 : 1);
        if (Storage.data.hintsUsed > 0 && stars > 1) stars--;

        let existingStars = Storage.data.stars[this.currentLevelNum] || 0;
        if (stars > existingStars) Storage.data.stars[this.currentLevelNum] = stars;

        if (this.currentLevelNum >= Storage.data.unlockedLevel && this.currentLevelNum < 100) {
            Storage.data.unlockedLevel = this.currentLevelNum + 1;
        }

        let baseScore = 400 + (this.currentLevelNum * 15);
        let bonus = Math.max(0, 300 - Math.floor(timeElapsed * 5));
        Storage.data.score += (baseScore + bonus);

        // Check Achievements
        Achievements.checkAll();
        Storage.save();

        document.getElementById('res-score').innerText = baseScore;
        document.getElementById('res-bonus').innerText = bonus;
        document.getElementById('modal-stars-row').innerText = '⭐'.repeat(stars);
        document.getElementById('complete-modal').classList.remove('hidden');
    },

    nextLevel() {
        AudioEngine.playClick();
        if (this.currentLevelNum < 100) {
            this.loadLevel(this.currentLevelNum + 1);
        } else {
            UI.showScreen('home-screen');
        }
    },

    retryLevel() {
        AudioEngine.playClick();
        this.loadLevel(this.currentLevelNum);
    },

    useHint() {
        if (!this.activePuzzle) return;
        Storage.data.hintsUsed++;
        Storage.save();
        const box = document.getElementById('hint-display-box');
        document.getElementById('hint-text-content').innerText = this.activePuzzle.hint;
        box.classList.remove('hidden');
    },

    loadFinalVault() {
        document.getElementById('hud-level-title').innerText = `LEVEL 100 — FINAL VAULT`;
        const container = document.getElementById('final-vault-container');
        container.innerHTML = `
            <h3>👑 THE FINAL MAINFRAME</h3>
            <p>Solve the final core security cipher to unlock the Mind Vault.</p>
            <div style="display:flex; flex-direction:column; gap:12px; width:100%; max-width:320px; align-items:center;">
                <p>Stage 5 Cipher: What is 100 × 2 - 50?</p>
                <input type="text" id="final-vault-input" class="text-answer-input" placeholder="ENTER CODE">
                <button class="neon-btn primary-btn" onclick="PuzzleEngine.submitFinalVault()">UNLOCK VAULT</button>
            </div>
        `;
        UI.showScreen('final-vault-screen');
    },

    submitFinalVault() {
        const val = document.getElementById('final-vault-input').value.trim();
        if (val === '150') {
            AudioEngine.playWin();
            Storage.data.stars[100] = 3;
            Storage.data.score += 5000;
            Achievements.checkAll();
            Storage.save();
            alert('🎉 VAULT UNLOCKED! You have mastered the Mind Vault.');
            UI.showScreen('home-screen');
        } else {
            AudioEngine.playWrong();
            alert('Incorrect final cipher code.');
        }
    }
};

// --- Achievements System ---
const Achievements = {
    list: [
        { id: 'firstSolve', name: '🧠 FIRST SOLVE', desc: 'Complete Level 1' },
        { id: 'brainMaster', name: '🔥 BRAIN MASTER', desc: 'Complete 25 levels' },
        { id: 'logicKing', name: '👑 LOGIC KING', desc: 'Complete 50 levels' },
        { id: 'perfectMind', name: '💎 PERFECT MIND', desc: 'Get 3 stars on 25 levels' },
        { id: 'speedThinker', name: '⚡ SPEED THINKER', desc: 'Maintain an active streak > 5' },
        { id: 'puzzleMaster', name: '🧩 PUZZLE MASTER', desc: 'Complete all 100 levels' }
    ],

    checkAll() {
        let completed = Object.keys(Storage.data.stars).length;
        let perfectCount = Object.values(Storage.data.stars).filter(s => s === 3).length;

        if (completed >= 1) Storage.data.achievements.firstSolve = true;
        if (completed >= 25) Storage.data.achievements.brainMaster = true;
        if (completed >= 50) Storage.data.achievements.logicKing = true;
        if (perfectCount >= 25) Storage.data.achievements.perfectMind = true;
        if (Storage.data.streak >= 5) Storage.data.achievements.speedThinker = true;
        if (completed >= 100) Storage.data.achievements.puzzleMaster = true;
    },

    render() {
        const container = document.getElementById('achievements-container');
        container.innerHTML = '';
        this.list.forEach(ach => {
            const unlocked = Storage.data.achievements[ach.id];
            const div = document.createElement('div');
            div.className = `achievement-row ${unlocked ? 'unlocked' : ''}`;
            div.innerHTML = `
                <div>
                    <h4>${ach.name}</h4>
                    <p style="font-size:0.8rem; color:#aaa; font-family:var(--font-rajdhani);">${ach.desc}</p>
                </div>
                <div>${unlocked ? '✅ UNLOCKED' : '🔒 LOCKED'}</div>
            `;
            container.appendChild(div);
        });
    }
};

// --- Player Stats System ---
const Stats = {
    render() {
        let completed = Object.keys(Storage.data.stars).length;
        let totalStars = Object.values(Storage.data.stars).reduce((a, b) => a + b, 0);
        let perfectCount = Object.values(Storage.data.stars).filter(s => s === 3).length;

        document.getElementById('stat-completed').innerText = `${completed} / 100`;
        document.getElementById('stat-stars').innerText = `${totalStars} / 300`;
        document.getElementById('stat-score').innerText = Storage.data.score;
        document.getElementById('stat-streak').innerText = Storage.data.bestStreak;
        document.getElementById('stat-hints').innerText = Storage.data.hintsUsed;
        document.getElementById('stat-perfect').innerText = perfectCount;
    }
};

// Initialize Application on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
    Storage.load();
    VaultCanvas.init();
    Storage.updateHomeStats();
});
