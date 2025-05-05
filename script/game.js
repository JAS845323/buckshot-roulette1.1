import { ITEMS } from './items.js';
import { playSound } from './utils.js';

export class BuckshotRoulette {
    constructor() {
        this.playerHealth = 3;
        this.aiHealth = 3;
        this.currentRound = 1;
        this.isPlayerTurn = true;
        this.bullets = [];
        this.aiSkipsNextTurn = false;
        this.nextShotDamageMultiplier = 1;
        this.isFakeBlood = false;
        this.currentItems = []; // 当前回合可用道具
    }

    async initRound(round) {
        this.currentRound = round;
        this.isPlayerTurn = true;
        this.aiSkipsNextTurn = false;
        this.nextShotDamageMultiplier = 1;
        
        // 根据回合设置子弹数量
        const bulletCount = [3, 5, 8][round - 1];
        this.bullets = this.generateBullets(bulletCount);
        
        // 播放装弹音效
        playSound('reload');
        
        // 洗牌子弹（带延迟效果）
        await this.shuffleBulletsWithAnimation();
        
        // 第三局假血标记
        this.isFakeBlood = (round === 3);
        
        // 每回合随机抽取2个道具
        this.drawRandomItems(2);
    }

    generateBullets(count) {
        const liveCount = Math.ceil(count / 2);
        const blankCount = count - liveCount;
        
        return [
            ...Array(liveCount).fill(true),
            ...Array(blankCount).fill(false)
        ];
    }

    async shuffleBulletsWithAnimation() {
        const bulletDisplay = document.getElementById('bullet-display');
        bulletDisplay.classList.add('reloading');
        
        // Fisher-Yates 洗牌算法
        for (let i = this.bullets.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.bullets[i], this.bullets[j]] = [this.bullets[j], this.bullets[i]];
        }
        
        await delay(800); // 匹配动画时长
        bulletDisplay.classList.remove('reloading');
    }

    drawRandomItems(count) {
        this.currentItems = [];
        const allItems = Object.keys(ITEMS);
        
        for (let i = 0; i < count; i++) {
            if (allItems.length === 0) break;
            const randomIndex = Math.floor(Math.random() * allItems.length);
            this.currentItems.push(allItems[randomIndex]);
            allItems.splice(randomIndex, 1); // 避免重复
        }
    }

    shoot(targetSelf) {
        if (this.bullets.length === 0) {
            this.initRound(this.currentRound); // 重新装弹
            return "枪膛已空，重新装弹！";
        }
        
        const bullet = this.bullets.shift();
        let result = "";
        
        if (bullet) { // 实弹
            const damage = 1 * this.nextShotDamageMultiplier;
            this.nextShotDamageMultiplier = 1; // 重置伤害倍率
            
            if (targetSelf) {
                this.playerHealth -= damage;
                result = `你对自己开枪，实弹！受到${damage}点伤害`;
            } else {
                this.aiHealth -= damage;
                result = `你对AI开枪，实弹！AI受到${damage}点伤害`;
            }
        } else { // 空包弹
            if (targetSelf) {
                result = "你对自己开枪，空包弹！继续你的回合";
                return result; // 不切换回合
            } else {
                result = "你对AI开枪，空包弹！";
            }
        }
        
        // 检查游戏状态
        if (this.checkGameOver()) {
            return result + " " + this.getGameResult();
        }
        
        // 切换回合（除非对自己开空包弹）
        if (!(targetSelf && !bullet)) {
            const skipMessage = this.switchTurn();
            if (skipMessage) result += " " + skipMessage;
        }
        
        return result;
    }

    switchTurn() {
        if (this.aiSkipsNextTurn) {
            this.aiSkipsNextTurn = false;
            return "AI回合被跳过";
        }
        
        this.isPlayerTurn = !this.isPlayerTurn;
        return null;
    }

    peekNextBullet() {
        if (this.bullets.length === 0) return "枪膛已空";
        return this.bullets[0] ? "下一发是实弹" : "下一发是空包弹";
    }

    useItem(itemType) {
        const itemIndex = this.currentItems.indexOf(itemType);
        if (itemIndex === -1) return "没有这个道具";
        
        const result = ITEMS[itemType].use(this);
        this.currentItems.splice(itemIndex, 1); // 使用后移除
        
        return result;
    }

    checkGameOver() {
        if (this.currentRound === 3 && this.playerHealth <= 0) {
            return true; // 第三局直接死亡
        }
        
        if (this.playerHealth <= 0 || this.aiHealth <= 0) {
            return true;
        }
        
        if (this.bullets.length === 0 && this.currentRound === 3) {
            return true; // 第三局子弹用完
        }
        
        return false;
    }

    getGameResult() {
        if (this.playerHealth <= 0) {
            if (this.currentRound < 3) {
                return "你被击败了！AI给你使用了除颤器继续挑战";
            } else {
                return "游戏结束！你被击败了";
            }
        } else if (this.aiHealth <= 0) {
            return "恭喜！你击败了AI";
        } else if (this.bullets.length === 0) {
            return "子弹用尽，平局！";
        }
        return "";
    }
}