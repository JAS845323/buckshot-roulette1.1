import { delay } from './utils.js';
import { ITEMS } from './items.js';

export class AI {
    constructor() {
        this.actionDelay = 4000; // 4秒延迟
    }
    
    async takeTurn(game) {
        await delay(1000); // 初始思考时间
        
        // 检查是否被跳过回合
        if (game.aiSkipsNextTurn) {
            game.aiSkipsNextTurn = false;
            return "AI回合被跳过";
        }
        
        // 使用道具（如果有且概率触发）
        if (game.currentItems.length > 0 && Math.random() < 0.6) {
            const itemType = this.chooseItem(game);
            const result = game.useItem(itemType);
            await delay(this.actionDelay);
            return `AI使用了【${ITEMS[itemType].name}】: ${result}`;
        }
        
        // 决定开枪目标
        const shootSelf = this.decideShootTarget(game);
        await delay(1000); // 开枪前延迟
        
        // 执行开枪
        const result = game.shoot(shootSelf);
        await delay(this.actionDelay);
        return `AI选择对${shootSelf ? "自己" : "玩家"}开枪: ${result}`;
    }
    
    chooseItem(game) {
        // 简单AI逻辑：优先使用手铐或华子
        const priorities = ['handcuffs', 'huazi', 'knife', 'drink', 'magnifier'];
        
        for (const itemType of priorities) {
            if (game.currentItems.includes(itemType)) {
                return itemType;
            }
        }
        
        // 默认返回第一个可用道具
        return game.currentItems[0];
    }
    
    decideShootTarget(game) {
        // 简单AI逻辑：30%概率对自己开枪
        return Math.random() < 0.3;
    }
}