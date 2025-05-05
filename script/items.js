export const ITEMS = {
    huazi: {
        name: "华子",
        description: "恢复1点生命值（第三局无效）",
        use(game) {
            if (game.currentRound < 3 && !game.isFakeBlood) {
                game.playerHealth = Math.min(game.playerHealth + 1, 3);
                return "生命值+1";
            }
            return "无效（假血状态）";
        }
    },
    
    handcuffs: {
        name: "手铐",
        description: "跳过AI的下一个回合",
        use(game) {
            game.aiSkipsNextTurn = true;
            return "AI下回合将被跳过";
        }
    },
    
    knife: {
        name: "小刀",
        description: "下一发子弹伤害翻倍",
        use(game) {
            game.nextShotDamageMultiplier = 2;
            return "下一发子弹伤害翻倍";
        }
    },
    
    drink: {
        name: "饮料",
        description: "移除枪膛中的一发子弹",
        use(game) {
            if (game.bullets.length > 0) {
                const removed = game.bullets.pop();
                return `移除了一发${removed ? "实弹" : "空包弹"}`;
            }
            return "枪膛已空";
        }
    },
    
    magnifier: {
        name: "放大镜",
        description: "查看枪膛中的下一发子弹",
        use(game) {
            if (game.bullets.length > 0) {
                return `下一发是${game.bullets[0] ? "实弹" : "空包弹"}`;
            }
            return "枪膛已空";
        }
    }
};