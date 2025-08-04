// ==SillyTavern Weibo Auto Listener==
// @name         Weibo Auto Listener for Mobile Extension
// @version      1.0.0
// @description  微博自动监听器，监听聊天变化并自动触发微博生成
// @author       Assistant

/**
 * 微博自动监听器类
 * 监听聊天变化，在满足条件时自动生成微博内容
 *
 * 配置说明：
 * - checkIntervalMs: 检查间隔时间（毫秒，默认5000）
 * - debounceMs: 防抖延迟时间（毫秒，默认500）
 * - immediateOnThreshold: 达到阈值时是否立即执行（默认true）
 * - enabled: 是否启用监听（默认true）
 * - maxRetries: 最大重试次数（默认3）
 */
class WeiboAutoListener {
    constructor() {
        this.isListening = false;
        this.lastMessageCount = 0;
        this.lastCheckTime = Date.now();
        this.checkInterval = null;
        this.debounceTimer = null;
        this.isProcessingRequest = false; // 新增：请求处理锁
        this.lastProcessedMessageCount = 0; // 新增：最后处理的消息数量
        this.currentStatus = '待机中'; // 新增：当前状态
        this.statusElement = null; // 新增：状态显示元素
        this.lastGenerationTime = null; // 新增：最后生成时间
        this.generationCount = 0; // 新增：生成次数统计
        this.settings = {
            enabled: false, // 修改默认值为false，需要用户手动启用
            checkIntervalMs: 5000, // 5秒检查一次
            debounceMs: 500, // 防抖0.5秒（从2秒减少到0.5秒）
            immediateOnThreshold: true, // 新增：达到阈值时立即执行
            maxRetries: 3
        };

        // 绑定方法
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.checkForChanges = this.checkForChanges.bind(this);
        this.safeDebounceAutoGenerate = this.safeDebounceAutoGenerate.bind(this);
        this.updateStatus = this.updateStatus.bind(this);
        this.initStatusDisplay = this.initStatusDisplay.bind(this);
    }

    /**
     * 开始监听
     */
    start() {
        if (this.isListening) {
            console.log('[Weibo Auto Listener] 已经在监听中');
            return;
        }

        console.log('[Weibo Auto Listener] 开始监听聊天变化...');
        this.isListening = true;
        this.lastCheckTime = Date.now();
        this.updateStatus('监听中');

        // 初始化消息计数
        this.updateMessageCount();

        // 初始化状态显示
        this.initStatusDisplay();

        // 开始定期检查
        this.checkInterval = setInterval(() => {
            this.checkForChanges();
        }, this.settings.checkIntervalMs);

        console.log(`[Weibo Auto Listener] ✅ 监听已启动，检查间隔: ${this.settings.checkIntervalMs}ms`);
    }

    /**
     * 停止监听
     */
    stop() {
        if (!this.isListening) {
            console.log('[Weibo Auto Listener] 当前未在监听');
            return;
        }

        console.log('[Weibo Auto Listener] 停止监听...');
        this.isListening = false;
        this.updateStatus('已停止');

        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }

        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }

        console.log('[Weibo Auto Listener] ✅ 监听已停止');
    }

    /**
     * 检查聊天变化
     */
    async checkForChanges() {
        try {
            if (!this.settings.enabled) {
                return;
            }

            // 获取当前消息数量
            const currentCount = this.getCurrentMessageCount();
            if (currentCount === null) {
                return;
            }

            // 检查消息数量是否发生变化
            const messageIncrement = currentCount - this.lastMessageCount;

            if (messageIncrement > 0) {
                console.log(`[Weibo Auto Listener] 检测到新消息，数量变化: +${messageIncrement} (${this.lastMessageCount} → ${currentCount})`);

                this.lastMessageCount = currentCount;
                this.lastCheckTime = Date.now();

                // 获取微博管理器的阈值设置
                const threshold = this.getWeiboThreshold();

                if (messageIncrement >= threshold) {
                    console.log(`[Weibo Auto Listener] 消息增量 ${messageIncrement} 达到阈值 ${threshold}，准备生成微博内容`);
                    this.updateStatus(`检测到${messageIncrement}条新消息，准备生成...`);

                    if (this.settings.immediateOnThreshold) {
                        // 立即执行
                        await this.safeDebounceAutoGenerate();
                    } else {
                        // 防抖处理
                        this.debounceAutoGenerate();
                    }
                } else {
                    console.log(`[Weibo Auto Listener] 消息增量 ${messageIncrement} 未达到阈值 ${threshold}，继续监听`);
                    this.updateStatus(`监听中 (${messageIncrement}/${threshold})`);
                }
            }

        } catch (error) {
            console.error('[Weibo Auto Listener] 检查变化时发生错误:', error);
            this.updateStatus('检查错误');
        }
    }

    /**
     * 获取当前消息数量
     */
    getCurrentMessageCount() {
        try {
            if (!window.mobileContextEditor) {
                return null;
            }

            const chatData = window.mobileContextEditor.getCurrentChatData();
            if (!chatData || !chatData.messages) {
                return null;
            }

            return chatData.messages.length;
        } catch (error) {
            console.error('[Weibo Auto Listener] 获取消息数量失败:', error);
            return null;
        }
    }

    /**
     * 获取微博管理器的阈值设置
     */
    getWeiboThreshold() {
        try {
            if (window.weiboManager && window.weiboManager.getSettings) {
                const settings = window.weiboManager.getSettings();
                return settings.threshold || 10;
            }
            return 10; // 默认阈值
        } catch (error) {
            console.error('[Weibo Auto Listener] 获取阈值设置失败:', error);
            return 10;
        }
    }

    /**
     * 防抖自动生成（旧版本，保持兼容性）
     */
    debounceAutoGenerate() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(async () => {
            await this.safeDebounceAutoGenerate();
        }, this.settings.debounceMs);
    }

    /**
     * 安全的防抖自动生成微博内容
     */
    async safeDebounceAutoGenerate() {
        try {
            // 检查是否正在处理请求
            if (this.isProcessingRequest) {
                console.log('[Weibo Auto Listener] 正在处理请求中，跳过本次生成');
                this.updateStatus('正在处理中，跳过');
                return;
            }

            // 检查微博管理器是否正在处理
            if (window.weiboManager && window.weiboManager.isCurrentlyProcessing && window.weiboManager.isCurrentlyProcessing()) {
                console.log('[Weibo Auto Listener] 微博管理器正在处理中，跳过本次生成');
                this.updateStatus('管理器忙碌，跳过');
                return;
            }

            // 加锁
            this.isProcessingRequest = true;
            this.updateStatus('正在生成微博内容...');

            console.log('[Weibo Auto Listener] 开始自动生成微博内容...');

            // 调用微博管理器生成内容
            if (window.weiboManager && window.weiboManager.generateWeiboContent) {
                await window.weiboManager.generateWeiboContent();

                // 更新统计信息
                this.generationCount++;
                this.lastGenerationTime = new Date().toLocaleTimeString();
                this.lastProcessedMessageCount = this.lastMessageCount;

                console.log(`[Weibo Auto Listener] ✅ 自动生成完成 (第${this.generationCount}次)`);
                this.updateStatus(`生成完成 (第${this.generationCount}次)`);
            } else {
                console.error('[Weibo Auto Listener] 微博管理器未找到或生成方法不可用');
                this.updateStatus('生成器不可用');
            }

        } catch (error) {
            console.error('[Weibo Auto Listener] 自动生成微博内容失败:', error);
            this.updateStatus('生成失败');
        } finally {
            // 解锁
            this.isProcessingRequest = false;

            // 延迟恢复监听状态
            setTimeout(() => {
                if (this.isListening) {
                    this.updateStatus('监听中');
                }
            }, 3000);
        }
    }

    /**
     * 更新消息计数
     */
    updateMessageCount() {
        const count = this.getCurrentMessageCount();
        if (count !== null) {
            this.lastMessageCount = count;
            console.log(`[Weibo Auto Listener] 初始消息数量: ${count}`);
        }
    }

    /**
     * 初始化状态显示
     */
    initStatusDisplay() {
        // 创建状态显示元素（如果不存在）
        if (!document.getElementById('weibo-auto-listener-status')) {
            const statusDiv = document.createElement('div');
            statusDiv.id = 'weibo-auto-listener-status';
            statusDiv.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                z-index: 1000;
                font-family: monospace;
                pointer-events: none;
                opacity: 0.7;
                transition: opacity 0.3s;
                display: none !important;
            `;
            // document.body.appendChild(statusDiv);
        }

        this.statusElement = document.getElementById('weibo-auto-listener-status');
        this.updateStatusDisplay();
    }

    /**
     * 更新状态
     */
    updateStatus(status) {
        this.currentStatus = status;
        console.log(`[Weibo Auto Listener] 状态: ${status}`);
        this.updateStatusDisplay();
    }

    /**
     * 更新状态显示
     */
    updateStatusDisplay() {
        if (!this.statusElement) return;

        const timestamp = new Date().toLocaleTimeString();
        const threshold = this.getWeiboThreshold();

        this.statusElement.innerHTML = `
            🐦 微博监听器<br>
            状态: ${this.currentStatus}<br>
            阈值: ${threshold} | 生成次数: ${this.generationCount}<br>
            ${this.lastGenerationTime ? `最后生成: ${this.lastGenerationTime}` : ''}
        `;

        // 显示状态
        if (this.isListening) {
            this.statusElement.style.display = 'block';
        }
    }

    /**
     * 显示状态面板
     */
    showStatusPanel() {
        this.initStatusDisplay();
        if (this.statusElement) {
            this.statusElement.style.display = 'block';
            this.statusElement.style.opacity = '1';
        }
    }

    /**
     * 隐藏状态面板
     */
    hideStatusPanel() {
        if (this.statusElement) {
            this.statusElement.style.display = 'none';
        }
    }

    /**
     * 切换状态面板显示
     */
    toggleStatusPanel() {
        if (this.statusElement && this.statusElement.style.display === 'block') {
            this.hideStatusPanel();
        } else {
            this.showStatusPanel();
        }
    }

    /**
     * 获取监听统计信息
     */
    getStats() {
        return {
            isListening: this.isListening,
            isProcessing: this.isProcessingRequest,
            messageCount: this.lastMessageCount,
            generationCount: this.generationCount,
            lastGenerationTime: this.lastGenerationTime,
            currentStatus: this.currentStatus,
            settings: { ...this.settings }
        };
    }

    /**
     * 重置统计信息
     */
    resetStats() {
        this.generationCount = 0;
        this.lastGenerationTime = null;
        this.lastProcessedMessageCount = 0;
        this.updateStatus('统计已重置');
        console.log('[Weibo Auto Listener] 统计信息已重置');
    }

    /**
     * 设置配置
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        console.log('[Weibo Auto Listener] 设置已更新:', this.settings);

        // 如果改变了检查间隔，重启监听
        if (this.isListening && newSettings.checkIntervalMs) {
            this.stop();
            setTimeout(() => this.start(), 100);
        }
    }

    /**
     * 启用/禁用监听
     */
    setEnabled(enabled) {
        this.settings.enabled = enabled;
        this.updateStatus(enabled ? '监听已启用' : '监听已禁用');
        console.log(`[Weibo Auto Listener] 监听${enabled ? '已启用' : '已禁用'}`);
    }

    /**
     * 设置检查间隔
     */
    setCheckInterval(intervalMs) {
        this.updateSettings({ checkIntervalMs: intervalMs });
    }

    /**
     * 设置防抖延迟
     */
    setDebounceDelay(delayMs) {
        this.updateSettings({ debounceMs: delayMs });
    }

    /**
     * 手动触发生成
     */
    async manualTrigger() {
        console.log('[Weibo Auto Listener] 手动触发微博生成');
        this.updateStatus('手动触发生成...');
        await this.safeDebounceAutoGenerate();
    }

    /**
     * 诊断信息
     */
    diagnose() {
        const diagnosis = {
            listener: {
                isListening: this.isListening,
                isProcessing: this.isProcessingRequest,
                settings: this.settings,
                stats: this.getStats()
            },
            manager: {
                exists: !!window.weiboManager,
                isProcessing: window.weiboManager ? window.weiboManager.isCurrentlyProcessing() : false,
                settings: window.weiboManager ? window.weiboManager.getSettings() : null
            },
            context: {
                exists: !!window.mobileContextEditor,
                messageCount: this.getCurrentMessageCount()
            }
        };

        console.log('[Weibo Auto Listener] 诊断信息:', diagnosis);
        return diagnosis;
    }
}

// 创建全局实例
window.WeiboAutoListener = WeiboAutoListener;
window.weiboAutoListener = new WeiboAutoListener();

// 注册控制台命令
window.WeiboListener = window.weiboAutoListener; // 简短别名

console.log('%c🐦 微博自动监听器已加载', 'color: #ff8500; font-weight: bold; font-size: 16px;');
console.log('%c使用 WeiboListener.start() 开始监听', 'color: #4CAF50; font-size: 14px;');
console.log('%c使用 WeiboListener.stop() 停止监听', 'color: #f44336; font-size: 14px;');
console.log('%c使用 WeiboListener.diagnose() 查看诊断信息', 'color: #2196F3; font-size: 14px;');
console.log('%c使用 WeiboListener.toggleStatusPanel() 切换状态面板', 'color: #9C27B0; font-size: 14px;');

// 自动启动监听器
setTimeout(() => {
    try {
        console.log('[Weibo Auto Listener] 自动启动监听器...');
        if (window.weiboAutoListener && !window.weiboAutoListener.isListening) {
            window.weiboAutoListener.start();
            console.log('[Weibo Auto Listener] ✅ 自动启动成功');
        }
    } catch (error) {
        console.error('[Weibo Auto Listener] 自动启动失败:', error);
    }
}, 3000); // 等待3秒让页面完全加载

console.log('[Weibo Auto Listener] 微博自动监听器模块加载完成');
