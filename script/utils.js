// 延迟函数
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 播放音效
export function playSound(type) {
    const sounds = {
        shot: document.getElementById('shot-sound'),
        click: document.getElementById('click-sound'),
        item: document.getElementById('item-sound'),
        reload: document.getElementById('reload-sound')
    };
    
    if (sounds[type]) {
        sounds[type].currentTime = 0;
        sounds[type].play().catch(e => console.log("音效播放失败:", e));
    }
}

// 更新生命值显示
export function updateHealthDisplay(element, health) {
    element.innerHTML = '';
    for (let i = 0; i < health; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        element.appendChild(heart);
    }
}

// 预加载音效
export function preloadSounds() {
    const soundTypes = ['shot', 'click', 'item', 'reload'];
    soundTypes.forEach(type => {
        const sound = document.getElementById(`${type}-sound`);
        if (sound) {
            sound.volume = 0; // 静音预加载
            sound.play().then(() => {
                sound.pause();
                sound.currentTime = 0;
                sound.volume = 1; // 恢复音量
            });
        }
    });
}