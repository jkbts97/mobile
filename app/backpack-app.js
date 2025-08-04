/**
 * Backpack App - 背包应用
 * 为mobile-phone.js提供背包功能
 * 基于shop-app的逻辑，专门处理背包物品
 */

// @ts-nocheck
// 避免重复定义
if (typeof window.BackpackApp === 'undefined') {

class BackpackApp {
    constructor() {
        this.currentView = 'itemList'; // 'itemList', 'itemDetail'
        this.items = [];
        this.contextMonitor = null;
        this.lastItemCount = 0;
        this.isAutoRenderEnabled = true;
        this.lastRenderTime = 0;
        this.renderCooldown = 1000;
        this.eventListenersSetup = false;
        this.contextCheckInterval = null;
        this.selectedItem = null;

        this.init();
    }

    init() {
        console.log('[Backpack App] 背包应用初始化开始 - 版本 1.0 (背包物品管理)');

        // 立即解析一次背包信息
        this.parseItemsFromContext();

        // 异步初始化监控，避免阻塞界面渲染
        setTimeout(() => {
            this.setupContextMonitor();
        }, 100);

        console.log('[Backpack App] 背包应用初始化完成 - 版本 1.0');
    }

    // 设置上下文监控
    setupContextMonitor() {
        console.log('[Backpack App] 设置上下文监控...');

        // 监听上下文变化事件
        if (window.addEventListener) {
            window.addEventListener('contextUpdate', (event) => {
                this.handleContextChange(event);
            });

            // 监听消息更新事件
            window.addEventListener('messageUpdate', (event) => {
                this.handleContextChange(event);
            });

            // 监听聊天变化事件
            window.addEventListener('chatChanged', (event) => {
                this.handleContextChange(event);
            });
        }

        // 减少定时检查频率，从2秒改为10秒
        this.contextCheckInterval = setInterval(() => {
            this.checkContextChanges();
        }, 10000);

        // 监听SillyTavern的事件系统
        this.setupSillyTavernEventListeners();
    }

    // 处理上下文变化
    handleContextChange(event) {
        console.log('[Backpack App] 上下文变化:', event);
        this.parseItemsFromContext();
    }

    // 检查上下文变化
    checkContextChanges() {
        if (!this.isAutoRenderEnabled) return;

        const currentTime = Date.now();
        if (currentTime - this.lastRenderTime < this.renderCooldown) {
            return;
        }

        this.parseItemsFromContext();
        this.lastRenderTime = currentTime;
    }

    // 设置SillyTavern事件监听器
    setupSillyTavernEventListeners() {
        // 防止重复设置
        if (this.eventListenersSetup) {
            return;
        }

        try {
            // 监听SillyTavern的事件系统
            const eventSource = window['eventSource'];
            const event_types = window['event_types'];

            if (eventSource && event_types) {
                this.eventListenersSetup = true;

                // 创建防抖函数，避免过于频繁的解析
                const debouncedParse = this.debounce(() => {
                    this.parseItemsFromContext();
                }, 1000);

                // 监听消息发送事件
                if (event_types.MESSAGE_SENT) {
                    eventSource.on(event_types.MESSAGE_SENT, debouncedParse);
                }

                // 监听消息接收事件
                if (event_types.MESSAGE_RECEIVED) {
                    eventSource.on(event_types.MESSAGE_RECEIVED, debouncedParse);
                }

                // 监听聊天变化事件
                if (event_types.CHAT_CHANGED) {
                    eventSource.on(event_types.CHAT_CHANGED, debouncedParse);
                }
            } else {
                // 减少重试频率，从2秒改为5秒
                setTimeout(() => {
                    this.setupSillyTavernEventListeners();
                }, 5000);
            }
        } catch (error) {
            console.warn('[Backpack App] 设置SillyTavern事件监听器失败:', error);
        }
    }

    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 从上下文解析背包物品信息
    parseItemsFromContext() {
        try {
            // 获取当前背包数据
            const backpackData = this.getCurrentBackpackData();

            // 更新物品列表
            if (backpackData.items.length !== this.items.length || this.hasItemsChanged(backpackData.items)) {
                this.items = backpackData.items;
                this.updateItemList();
            }

        } catch (error) {
            console.error('[Backpack App] 解析背包物品信息失败:', error);
        }
    }

    /**
     * 从消息中获取当前背包数据（参考shop-app的getCurrentShopData方法）
     */
    getCurrentBackpackData() {
        try {
            // 优先使用mobileContextEditor获取数据
            const mobileContextEditor = window['mobileContextEditor'];
            if (mobileContextEditor) {
                const chatData = mobileContextEditor.getCurrentChatData();
                if (chatData && chatData.messages && chatData.messages.length > 0) {
                    // 搜索所有消息，不限制第一条
                    const allContent = chatData.messages.map(msg => msg.mes || '').join('\n');
                    return this.parseBackpackContent(allContent);
                }
            }

            // 如果没有mobileContextEditor，尝试其他方式
            const chatData = this.getChatData();
            if (chatData && chatData.length > 0) {
                // 合并所有消息内容进行解析
                const allContent = chatData.map(msg => msg.mes || '').join('\n');
                return this.parseBackpackContent(allContent);
            }
        } catch (error) {
            console.warn('[Backpack App] 获取背包数据失败:', error);
        }

        return { items: [] };
    }

    /**
     * 从消息中实时解析背包内容
     */
    parseBackpackContent(content) {
        const items = [];

        // 解析背包格式: [背包|商品名|商品类型|商品描述|数量]（'背包'是固定标识符）
        const itemRegex = /\[背包\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/g;

        let itemMatch;
        while ((itemMatch = itemRegex.exec(content)) !== null) {
            const [fullMatch, name, type, description, quantity] = itemMatch;

            // 检查是否已存在相同物品（根据名称和类型判断）
            const existingItem = items.find(p =>
                p.name.trim() === name.trim() &&
                p.type.trim() === type.trim()
            );

            if (existingItem) {
                // 如果已存在，累加数量
                existingItem.quantity += parseInt(quantity.trim()) || 1;
            } else {
                const newItem = {
                    id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: name.trim(),
                    type: type.trim(),
                    description: description.trim(),
                    quantity: parseInt(quantity.trim()) || 1,
                    image: this.getItemImage(type.trim()),
                    timestamp: new Date().toLocaleString()
                };
                items.push(newItem);
            }
        }

        console.log('[Backpack App] 解析完成，物品数:', items.length);
        return { items };
    }

    // 检查物品是否有变化（更高效的比较方法）
    hasItemsChanged(newItems) {
        if (newItems.length !== this.items.length) {
            return true;
        }

        for (let i = 0; i < newItems.length; i++) {
            const newItem = newItems[i];
            const oldItem = this.items[i];

            if (!oldItem ||
                newItem.name !== oldItem.name ||
                newItem.type !== oldItem.type ||
                newItem.description !== oldItem.description ||
                newItem.quantity !== oldItem.quantity) {
                return true;
            }
        }

        return false;
    }

    // 获取物品图片
    getItemImage(type) {
        const imageMap = {
            '食品': '🍎',
            '食物': '🍎', // 兼容"食物"写法
            '饮料': '🥤',
            '服装': '👔',
            '数码': '📱',
            '家居': '🏠',
            '美妆': '💄',
            '运动': '⚽',
            '图书': '📚',
            '玩具': '🧸',
            '音乐': '🎵',
            '工具': '🔧',
            '武器': '⚔️',
            '药品': '💊',
            '材料': '🧱',
            '宝石': '💎',
            '钥匙': '🔑',
            '金币': '🪙',
            '默认': '📦'
        };
        return imageMap[type] || imageMap['默认'];
    }

    // 获取聊天数据
    getChatData() {
        try {
            // 优先使用mobileContextEditor获取数据
            const mobileContextEditor = window['mobileContextEditor'];
            if (mobileContextEditor) {
                const chatData = mobileContextEditor.getCurrentChatData();
                if (chatData && chatData.messages && chatData.messages.length > 0) {
                    return chatData.messages;
                }
            }

            // 尝试从全局变量获取
            const chat = window['chat'];
            if (chat && Array.isArray(chat)) {
                return chat;
            }

            // 尝试从其他可能的位置获取
            const SillyTavern = window['SillyTavern'];
            if (SillyTavern && SillyTavern.chat) {
                return SillyTavern.chat;
            }

            return [];
        } catch (error) {
            console.error('[Backpack App] 获取聊天数据失败:', error);
            return [];
        }
    }

    // 获取应用内容
    getAppContent() {
        switch (this.currentView) {
            case 'itemList':
                return this.renderItemList();
            case 'itemDetail':
                return this.renderItemDetail();
            default:
                return this.renderItemList();
        }
    }

    // 渲染物品列表
    renderItemList() {
        console.log('[Backpack App] 渲染物品列表...');

        if (!this.items.length) {
            return `
                <div class="backpack-empty-state">
                    <div class="empty-icon" style="color: #333;">🎒</div>
                    <div class="empty-title" style="color: #333;">背包空空如也</div>
                </div>
            `;
        }

        // 计算总物品数
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);

        const itemCards = this.items.map(item => `
            <div class="backpack-item" data-item-id="${item.id}">
                <div class="backpack-item-image">${item.image}</div>
                <div class="backpack-item-info">
                    <div class="backpack-item-name">${item.name}</div>
                    <div class="backpack-item-type">${item.type}</div>
                    <div class="backpack-item-description">${item.description}</div>
                    <div class="backpack-item-quantity">数量: ${item.quantity}</div>
                </div>
            </div>
        `).join('');

        return `
            <div class="backpack-item-list">
                <div class="backpack-header">
                    <div class="backpack-title">我的背包</div>
                    <div class="backpack-stats">共 ${this.items.length} 种物品，总计 ${totalItems} 件</div>
                </div>
                <div class="backpack-grid">
                    ${itemCards}
                </div>
            </div>
        `;
    }

    // 渲染物品详情
    renderItemDetail() {
        if (!this.selectedItem) {
            return this.renderItemList();
        }

        const item = this.selectedItem;

        return `
            <div class="backpack-item-detail">
                <div class="item-detail-header">
                    <div class="item-detail-image">${item.image}</div>
                    <div class="item-detail-info">
                        <h2 class="item-detail-name">${item.name}</h2>
                        <div class="item-detail-type">${item.type}</div>
                        <div class="item-detail-quantity">数量: ${item.quantity}</div>
                    </div>
                </div>
                <div class="item-detail-description">
                    <h3>物品描述</h3>
                    <p>${item.description}</p>
                </div>
                <div class="item-detail-actions">
                    <button class="use-item-btn" data-item-id="${item.id}">使用物品</button>
                    <button class="back-to-list-btn">返回列表</button>
                </div>
            </div>
        `;
    }

    // 更新物品列表显示
    updateItemList() {
        if (this.currentView === 'itemList') {
            this.updateAppContent();
        }
    }

    // 更新应用内容
    updateAppContent() {
        const appContent = document.getElementById('app-content');
        if (appContent) {
            appContent.innerHTML = this.getAppContent();
            this.bindEvents();
        }
    }

    // 绑定事件
    bindEvents() {
        console.log('[Backpack App] 绑定事件...');

        // 物品点击事件（查看详情）
        document.querySelectorAll('.backpack-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const itemId = e.currentTarget?.getAttribute('data-item-id');
                this.showItemDetail(itemId);
            });
        });

        // 使用物品按钮
        document.querySelectorAll('.use-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target?.getAttribute('data-item-id');
                this.useItem(itemId);
            });
        });

        // 返回列表按钮
        document.querySelectorAll('.back-to-list-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showItemList();
            });
        });
    }

    // 显示物品详情
    showItemDetail(itemId) {
        const item = this.items.find(p => p.id === itemId);
        if (!item) return;

        this.selectedItem = item;
        this.currentView = 'itemDetail';
        this.updateAppContent();
        this.updateHeader();
    }

    // 使用物品
    useItem(itemId) {
        const item = this.items.find(p => p.id === itemId);
        if (!item) return;

        // 弹出输入框，填写对谁使用
        const target = prompt('请输入要对谁使用该物品：');
        if (target === null || target.trim() === '') {
            this.showToast('未填写对象，已取消使用', 'info');
            return;
        }

        // 生成消息
        const message = `对${target.trim()}使用了 ${item.name}`;
        this.sendToSillyTavern(message);

        this.showToast(`对${target.trim()}使用了 ${item.name}`, 'success');

        // 返回物品列表
        setTimeout(() => {
            this.showItemList();
        }, 1000);
    }

    // 显示物品列表
    showItemList() {
        this.currentView = 'itemList';
        this.selectedItem = null;
        this.updateAppContent();
        this.updateHeader();
    }

    // 统一的发送消息方法（参考shop-app的发送方式）
    async sendToSillyTavern(message) {
        try {
            console.log('[Backpack App] 🔄 发送消息到SillyTavern:', message);

            // 方法1: 直接使用DOM元素（与消息app相同的方式）
            const originalInput = document.getElementById('send_textarea');
            const sendButton = document.getElementById('send_but');

            if (!originalInput || !sendButton) {
                console.error('[Backpack App] 找不到输入框或发送按钮元素');
                return this.sendToSillyTavernBackup(message);
            }

            // 检查输入框是否可用
            if (originalInput.disabled) {
                console.warn('[Backpack App] 输入框被禁用');
                return false;
            }

            // 检查发送按钮是否可用
            if (sendButton.classList.contains('disabled')) {
                console.warn('[Backpack App] 发送按钮被禁用');
                return false;
            }

            // 设置值
            originalInput.value = message;
            console.log('[Backpack App] 已设置输入框值:', originalInput.value);

            // 触发输入事件
            originalInput.dispatchEvent(new Event('input', { bubbles: true }));
            originalInput.dispatchEvent(new Event('change', { bubbles: true }));

            // 延迟点击发送按钮
            await new Promise(resolve => setTimeout(resolve, 300));
            sendButton.click();
            console.log('[Backpack App] 已点击发送按钮');

            return true;

        } catch (error) {
            console.error('[Backpack App] 发送消息时出错:', error);
            return this.sendToSillyTavernBackup(message);
        }
    }

    // 备用发送方法
    async sendToSillyTavernBackup(message) {
        try {
            console.log('[Backpack App] 尝试备用发送方法:', message);

            // 尝试查找其他可能的输入框
            const textareas = document.querySelectorAll('textarea');

            if (textareas.length > 0) {
                const textarea = textareas[0];
                textarea.value = message;
                textarea.focus();

                // 模拟键盘事件
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
                return true;
            }

            return false;

        } catch (error) {
            console.error('[Backpack App] 备用发送方法失败:', error);
            return false;
        }
    }

    // 手动刷新物品列表
    refreshItemList() {
        console.log('[Backpack App] 手动刷新物品列表');
        this.parseItemsFromContext();
        this.updateAppContent();
    }

    // 销毁应用，清理资源
    destroy() {
        console.log('[Backpack App] 销毁应用，清理资源');

        // 清理定时器
        if (this.contextCheckInterval) {
            clearInterval(this.contextCheckInterval);
            this.contextCheckInterval = null;
        }

        // 重置状态
        this.eventListenersSetup = false;
        this.isAutoRenderEnabled = false;

        // 清空数据
        this.items = [];
        this.selectedItem = null;
    }

    // 更新header
    updateHeader() {
        // 通知mobile-phone更新header
        if (window.mobilePhone && window.mobilePhone.updateAppHeader) {
            const state = {
                app: 'backpack',
                title: this.getViewTitle(),
                view: this.currentView
            };
            window.mobilePhone.updateAppHeader(state);
        }
    }

    // 获取视图标题
    getViewTitle() {
        switch (this.currentView) {
            case 'itemList':
                return '我的背包';
            case 'itemDetail':
                return this.selectedItem ? this.selectedItem.name : '物品详情';
            default:
                return '我的背包';
        }
    }

    // 显示提示消息
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `backpack-toast ${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
}

// 创建全局实例
window.BackpackApp = BackpackApp;
window.backpackApp = new BackpackApp();

} // 结束类定义检查

// 全局函数供mobile-phone.js调用
window.getBackpackAppContent = function() {
    console.log('[Backpack App] 获取背包应用内容');

    if (!window.backpackApp) {
        console.error('[Backpack App] backpackApp实例不存在');
        return '<div class="error-message">背包应用加载失败</div>';
    }

    try {
        return window.backpackApp.getAppContent();
    } catch (error) {
        console.error('[Backpack App] 获取应用内容失败:', error);
        return '<div class="error-message">获取内容失败</div>';
    }
};

window.bindBackpackAppEvents = function() {
    console.log('[Backpack App] 绑定背包应用事件');

    if (!window.backpackApp) {
        console.error('[Backpack App] backpackApp实例不存在');
        return;
    }

    try {
        window.backpackApp.bindEvents();
    } catch (error) {
        console.error('[Backpack App] 绑定事件失败:', error);
    }
};

// 调试和测试功能
window.backpackAppRefresh = function() {
    if (window.backpackApp) {
        window.backpackApp.refreshItemList();
    }
};

window.backpackAppDebugInfo = function() {
    if (window.backpackApp) {
        console.log('[Backpack App Debug] 当前物品数量:', window.backpackApp.items.length);
        console.log('[Backpack App Debug] 物品列表:', window.backpackApp.items);
        console.log('[Backpack App Debug] 当前视图:', window.backpackApp.currentView);
        console.log('[Backpack App Debug] 选中物品:', window.backpackApp.selectedItem);
        console.log('[Backpack App Debug] 事件监听器设置:', window.backpackApp.eventListenersSetup);
        console.log('[Backpack App Debug] 自动渲染启用:', window.backpackApp.isAutoRenderEnabled);
    }
};

// 性能优化：销毁应用实例
window.backpackAppDestroy = function() {
    if (window.backpackApp) {
        window.backpackApp.destroy();
        console.log('[Backpack App] 应用已销毁');
    }
};

// 强制重新加载应用（清除缓存）
window.backpackAppForceReload = function() {
    console.log('[Backpack App] 🔄 强制重新加载应用...');

    // 销毁现有实例
    if (window.backpackApp) {
        window.backpackApp.destroy();
    }

    // 重新创建实例
    window.backpackApp = new BackpackApp();
    console.log('[Backpack App] ✅ 应用已重新加载 - 版本 1.0');
};

// 初始化
console.log('[Backpack App] 背包应用模块加载完成 - 版本 1.0 (背包物品管理)');
