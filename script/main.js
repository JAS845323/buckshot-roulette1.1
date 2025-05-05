import { BuckshotRoulette } from './game.js';
import { AI } from './ai.js';
import { delay, playSound, updateHealthDisplay, preloadSounds } from './utils.js';
import { ITEMS } from './items.js';

// 初始化游戏和AI
const game = new BuckshotRoulette();
const ai = new AI();

// DOM元素
const elements = {
    playerHealth: document.getElementById('player-health'),
    aiHealth: document.getElementById('ai-health'),
    roundInfo: document.getElementById('round-info'),
    turnInfo: document.getElementById('turn-info'),
    bulletDisplay: document.getElementById('bullet-display'),
    actionLog: document.getElementById('action-log'),
    shootSelfBtn: document.getElementById('shoot-self'),
    shootAiBtn: document.getElementById('shoot-ai'),
    peekBtn: document.getElementById('peek'),
    currentItems: document.getElementById('current-items')
};

// 初始化游戏
function initGame() {
    preloadSounds();
    game.initRound(1);
    updateUI();
    bindEvents();
    logAction("游戏开始！第一局");
}

// 更新UI
function updateUI() {
    updateHealthDisplay(elements.playerHealth, game.playerHealth);
    updateHealthDisplay(elements.aiHealth, game.aiHealth);

    elements.roundInfo.textContent = `第${game.currentRound}局`;
    elements.turnInfo.textContent = game.isPlayerTurn ? "你的回合" : "AI的回合";

    updateBulletDisplay();
    updateCurrentItemsDisplay();

    const isPlayerActive = game.isPlayerTurn && !game.isGameOver();
    elements.shootSelfBtn.disabled = !isPlayerActive;
    elements.shootAiBtn.disabled = !isPlayerActive;
    elements.peekBtn.disabled = !isPlayerActive;
}

// 更新子弹显示
function updateBulletDisplay() {
    elements.bulletDisplay.innerHTML = '';
    game.bullets.forEach((bullet, index) => {
        const bulletEl = document.createElement('div');
        bulletEl.className = `bullet ${bullet ? 'live' : 'blank'}`;
        bulletEl.dataset.index = index;
        elements.bulletDisplay.appendChild(bulletEl);
    });
}

// 更新当前道具显示
function updateCurrentItemsDisplay() {
    elements.currentItems.innerHTML = '<h3>本回合道具</h3>';

    game.currentItems.forEach(itemType => {
        const itemEl = document.createElement('div');
        itemEl.className = 'current-item';
        itemEl.dataset.item = itemType;
        itemEl.innerHTML = `
            <img src="assets/images/items/${itemType}.png" alt="${ITEMS[itemType].name}">
            <span>${ITEMS[itemType].name}</span>
        `;
        itemEl.title = `${ITEMS[itemType].name}: ${ITEMS[itemType].description}`;

        itemEl.addEventListener('click', () => {
            if (!game.isPlayerTurn || game.isGameOver()) return;

            playSound('item');
            const result = game.useItem(itemType);
            logAction(`使用【${ITEMS[itemType].name}】: ${result}`);
            updateUI();

            if (game.isGameOver()) {
                showGameResult();
            }
        });

        elements.currentItems.appendChild(itemEl);
    });
}

// 记录行动日志
function logAction(message) {
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.textContent = message;
    elements.actionLog.prepend(logEntry);
    elements.actionLog.scrollTop = 0;
}

// 绑定事件
function bindEvents() {
    elements.shootSelfBtn.addEventListener('click', async () => {
        if (!game.isPlayerTurn || game.isGameOver()) return;

        playSound('shot');
        const result = game.shoot(true);
        logAction(result);
        updateUI();

        await handleTurnEnd();
    });

    elements.shootAiBtn.addEventListener('click', async () => {
        if (!game.isPlayerTurn || game.isGameOver()) return;

        playSound('shot');
        const result = game.shoot(false);
        logAction(result);
        updateUI();

        await handleTurnEnd();
    });

    elements.peekBtn.addEventListener('click', () => {
        if (!game.isPlayerTurn || game.isGameOver()) return;

        playSound('click');
        const result = game.peekNextBullet();
        logAction(`检查子弹: ${result}`);
    });
}

// 处理回合结束
async function handleTurnEnd() {
    if (game.isGameOver()) {
        showGameResult();
        return;
    }

    if (game.bullets.length === 0 && game.currentRound < 3) {
        game.currentRound++;
        await game.initRound(game.currentRound);
        logAction(`进入第${game.currentRound}局！`);
        updateUI();
        return;
    }

    if (!game.isPlayerTurn) {
        await delay(1000);
        const result = await ai.takeTurn(game);
        if (result) logAction(result);
        updateUI();
        await handleTurnEnd();
    }
}

// 显示游戏结果
function showGameResult() {
    let message = game.getGameResult();
    logAction(`游戏结束！${message}`);
    elements.shootSelfBtn.disabled = true;
    elements.shootAiBtn.disabled = true;
    elements.peekBtn.disabled = true;
}

// 启动游戏
document.addEventListener('DOMContentLoaded', initGame);
