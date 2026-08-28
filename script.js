
:root {
    --bg-deep: #030308;
    --panel-bg: rgba(12, 12, 25, 0.8);
    --neon-cyan: #00f3ff;
    --neon-violet: #bd00ff;
    --neon-pink: #ff007f;
    --neon-gold: #ffd700;
    --text-main: #f0f6fc;
    --border-glow: rgba(0, 243, 255, 0.3);
    --font-orbitron: 'Orbitron', sans-serif;
    --font-rajdhani: 'Rajdhani', sans-serif;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    user-select: none;
    -webkit-user-select: none;
}

body, html {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: var(--bg-deep);
    font-family: var(--font-rajdhani);
    color: var(--text-main);
}

#app-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}

#vaultCanvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

/* Glassmorphism Panels */
.glass-panel {
    background: var(--panel-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--border-glow);
    box-shadow: 0 0 20px rgba(0, 243, 255, 0.12), inset 0 0 15px rgba(0, 243, 255, 0.04);
    border-radius: 14px;
}

/* Screens Layout */
.screen {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: radial-gradient(circle at center, rgba(12,12,30,0.75) 0%, rgba(3,3,8,0.95) 100%);
}

.screen.active {
    display: flex;
}

/* Home Screen */
.hero-glow {
    position: absolute;
    width: 380px;
    height: 380px;
    background: radial-gradient(circle, rgba(0,243,255,0.18) 0%, rgba(189,0,255,0) 70%);
    z-index: -1;
    animation: pulseGlow 4s infinite alternate;
}

@keyframes pulseGlow {
    0% { transform: scale(0.85); opacity: 0.5; }
    100% { transform: scale(1.2); opacity: 1; }
}

.logo-container {
    text-align: center;
    margin-bottom: 25px;
}

.vault-icon {
    font-size: 3rem;
    animation: bounceVault 2s infinite ease-in-out;
    display: inline-block;
}

@keyframes bounceVault {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
}

.game-title {
    font-family: var(--font-orbitron);
    font-size: clamp(2.3rem, 5vw, 4rem);
    font-weight: 900;
    letter-spacing: 4px;
    color: #fff;
    text-shadow: 0 0 10px var(--neon-cyan), 0 0 30px var(--neon-cyan);
}

.game-subtitle {
    font-family: var(--font-rajdhani);
    font-size: clamp(1rem, 2vw, 1.3rem);
    letter-spacing: 6px;
    color: var(--neon-violet);
    text-shadow: 0 0 10px var(--neon-violet);
    margin-top: 4px;
}

.menu-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 300px;
    padding: 22px;
}

/* Neon Buttons */
.neon-btn {
    font-family: var(--font-orbitron);
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 2px;
    background: transparent;
    color: var(--text-main);
    border: 2px solid var(--neon-cyan);
    padding: 11px 18px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 0 10px rgba(0,243,255,0.2);
    text-align: center;
}

.neon-btn:hover, .neon-btn:active {
    background: var(--neon-cyan);
    color: #030308;
    box-shadow: 0 0 25px var(--neon-cyan), 0 0 50px var(--neon-cyan);
    transform: translateY(-2px);
}

.primary-btn {
    border-color: var(--neon-pink);
    color: #fff;
    background: linear-gradient(135deg, rgba(255,0,127,0.3), rgba(189,0,255,0.3));
    box-shadow: 0 0 15px rgba(255,0,127,0.4);
}

.primary-btn:hover, .primary-btn:active {
    background: var(--neon-pink);
    border-color: var(--neon-pink);
    box-shadow: 0 0 30px var(--neon-pink), 0 0 60px var(--neon-pink);
    color: #fff;
}

.player-hud-summary {
    display: flex;
    justify-content: space-around;
    width: 300px;
    padding: 10px;
    margin-top: 18px;
    font-family: var(--font-orbitron);
    font-size: 0.9rem;
}

/* Common Header/Footer */
.screen-header {
    width: 100%;
    max-width: 800px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    font-family: var(--font-orbitron);
    color: var(--neon-cyan);
    border-bottom: 1px solid var(--border-glow);
    padding-bottom: 10px;
}

.screen-footer {
    margin-top: 15px;
    width: 100%;
    max-width: 800px;
    display: flex;
    justify-content: center;
}

.icon-btn {
    background: transparent;
    border: 1px solid var(--neon-pink);
    color: var(--neon-pink);
    font-size: 1.1rem;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    cursor: pointer;
    transition: 0.3s;
}

.icon-btn:hover {
    background: var(--neon-pink);
    color: #fff;
    box-shadow: 0 0 15px var(--neon-pink);
}

/* Level Map Screen */
.progress-bar-container {
    width: 100%;
    max-width: 800px;
    padding: 12px 20px;
    margin-bottom: 12px;
    font-family: var(--font-orbitron);
    font-size: 0.85rem;
}

.prog-track {
    width: 100%;
    height: 8px;
    background: rgba(255,255,255,0.1);
    border-radius: 4px;
    margin-top: 8px;
    overflow: hidden;
    border: 1px solid var(--border-glow);
}

.prog-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--neon-cyan), var(--neon-violet));
    width: 0%;
    transition: width 0.4s ease;
}

.level-grid {
    width: 100%;
    max-width: 800px;
    height: 55vh;
    overflow-y: auto;
    padding: 15px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));
    gap: 10px;
}

.level-node {
    background: rgba(20,20,35,0.7);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px;
    height: 70px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: 0.2s;
    font-family: var(--font-orbitron);
    font-size: 0.85krem;
}

.level-node.unlocked {
    border-color: var(--neon-cyan);
    color: #fff;
    box-shadow: 0 0 10px rgba(0,243,255,0.2);
}

.level-node.unlocked:hover {
    background: rgba(0,243,255,0.15);
    transform: translateY(-2px);
}

.level-node.locked {
    opacity: 0.4;
    cursor: not-allowed;
    border-color: #555;
}

.level-node .node-stars {
    font-size: 0.65rem;
    color: var(--neon-gold);
    margin-top: 3px;
}

/* Puzzle Gameplay */
.puzzle-top-bar {
    width: 100%;
    max-width: 750px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 8px;
}

.hud-badge {
    padding: 8px 14px;
    font-family: var(--font-orbitron);
    font-size: 0.85rem;
    font-weight: 700;
    color: #fff;
}

.streak-badge {
    color: var(--neon-gold);
}

.puzzle-main-container {
    width: 100%;
    max-width: 750px;
    padding: 25px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    min-height: 380px;
    justify-content: center;
    text-align: center;
}

.puzzle-header-info h3 {
    font-family: var(--font-orbitron);
    font-size: 1.5rem;
    color: var(--neon-cyan);
    margin-bottom: 6px;
}

.puzzle-header-info p {
    font-size: 1.05rem;
    color: #ccc;
}

.puzzle-interactive-area {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

/* Puzzle Elements */
.options-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    width: 100%;
    max-width: 450px;
}

.puzzle-option-btn {
    font-family: var(--font-orbitron);
    font-size: 1.1rem;
    background: rgba(15,15,30,0.8);
    border: 1px solid var(--neon-cyan);
    color: #fff;
    padding: 15px;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.2s;
}

.puzzle-option-btn:hover {
    background: var(--neon-cyan);
    color: #030308;
    box-shadow: 0 0 15px var(--neon-cyan);
}

.text-answer-input {
    background: rgba(0,0,0,0.6);
    border: 2px solid var(--neon-cyan);
    color: #fff;
    font-family: var(--font-orbitron);
    font-size: 1.2rem;
    padding: 10px 20px;
    border-radius: 8px;
    text-align: center;
    width: 220px;
}

.hint-box {
    width: 100%;
    max-width: 500px;
    padding: 10px 15px;
    font-size: 0.9rem;
    border-color: var(--neon-gold);
    color: var(--neon-gold);
}

.hint-box.hidden {
    display: none;
}

/* Modals */
.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.82);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-overlay.hidden {
    display: none;
}

.modal-box {
    padding: 30px;
    text-align: center;
    width: 90%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.modal-box h2 {
    font-family: var(--font-orbitron);
    font-size: 1.8rem;
    color: var(--neon-gold);
    text-shadow: 0 0 15px var(--neon-gold);
}

.stars-display-row {
    font-size: 2rem;
    letter-spacing: 5px;
}

.glitch-text {
    color: #ff3333 !important;
    text-shadow: 0 0 15px #ff3333 !important;
}

/* Achievements & Stats */
.achievements-list, .stats-panel, .settings-panel {
    width: 100%;
    max-width: 750px;
    max-height: 60vh;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.achievement-row, .stat-row, .setting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 18px;
    background: rgba(15,15,30,0.7);
    border: 1px solid var(--border-glow);
    border-radius: 8px;
    font-family: var(--font-orbitron);
    font-size: 0.9rem;
}

.achievement-row.unlocked {
    border-color: var(--neon-gold);
    box-shadow: 0 0 10px rgba(255,215,0,0.2);
}

.danger-zone {
    color: #ff3333;
    border-color: rgba(255,51,51,0.3);
}

.danger-btn {
    border-color: #ff3333;
    color: #ff3333;
}

.danger-btn:hover {
    background: #ff3333;
    color: #fff;
    box-shadow: 0 0 20px #ff3333;
}
