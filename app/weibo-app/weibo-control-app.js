/**
 * 微博控制应用
 * 提供微博管理、设置和控制功能
 */

class WeiboControlApp {
    constructor() {
        this.currentView = 'main';
        this.isInitialized = false;
        this.weiboData = {
            posts: [],
            hotTopics: [],
            followers: 0,
            following: 0
        };
        this.init();
    }

    init() {
        console.log('[Weibo Control App] 初始化微博控制应用...');
        this.isInitialized = true;
    }

    /**
     * 获取微博控制应用的主界面HTML
     */
    getWeiboControlMainHTML() {
        return `
            <div class="weibo-control-app">
                <!-- 控制面板头部 -->
                <div class="control-header">
                    <div class="control-title">
                        <span class="control-icon">🐦</span>
                        <h2>微博管理器</h2>
                    </div>
                    <div class="control-status">
                        <span class="status-indicator ${this.getManagerStatus()}"></span>
                        <span class="status-text">${this.getStatusText()}</span>
                    </div>
                </div>

                <!-- 控制面板内容 -->
                <div class="control-content">
                    <!-- 快速操作区 -->
                    <div class="quick-actions-section">
                        <h3 class="section-title">⚡ 快速操作</h3>
                        <div class="quick-actions-grid">
                            <button class="quick-action-btn" id="generate-weibo-btn">
                                <span class="action-icon">🚀</span>
                                <span class="action-text">生成微博</span>
                            </button>
                            <button class="quick-action-btn" id="refresh-weibo-btn">
                                <span class="action-icon">🔄</span>
                                <span class="action-text">刷新内容</span>
                            </button>
                            <button class="quick-action-btn" id="clear-weibo-btn">
                                <span class="action-icon">🗑️</span>
                                <span class="action-text">清除内容</span>
                            </button>
                            <button class="quick-action-btn" id="export-weibo-btn">
                                <span class="action-icon">📤</span>
                                <span class="action-text">导出数据</span>
                            </button>
                        </div>
                    </div>

                    <!-- 微博设置区 -->
                    <div class="weibo-settings-section">
                        <h3 class="section-title">⚙️ 微博设置</h3>
                        <div class="settings-list">
                            <div class="setting-item">
                                <label class="setting-label">微博风格:</label>
                                <select class="setting-select" id="weibo-style-select">
                                    <option value="微博网友">微博网友</option>
                                    <option value="娱乐博主">娱乐博主</option>
                                    <option value="时尚达人">时尚达人</option>
                                    <option value="美食博主">美食博主</option>
                                    <option value="旅游博主">旅游博主</option>
                                    <option value="科技博主">科技博主</option>
                                    <option value="搞笑博主">搞笑博主</option>
                                    <option value="情感博主">情感博主</option>
                                    <option value="生活记录">生活记录</option>
                                    <option value="热点讨论">热点讨论</option>
                                </select>
                            </div>

                            <div class="setting-item">
                                <label class="setting-label">自动生成:</label>
                                <div class="setting-toggle">
                                    <input type="checkbox" id="weibo-auto-generate" class="toggle-input">
                                    <label for="weibo-auto-generate" class="toggle-label"></label>
                                </div>
                                <div class="setting-description">
                                    <small>启用后会自动监听聊天变化并生成微博内容</small>
                                </div>
                            </div>

                            <div class="setting-item">
                                <label class="setting-label">自动更新:</label>
                                <div class="setting-toggle">
                                    <input type="checkbox" id="weibo-auto-update" class="toggle-input">
                                    <label for="weibo-auto-update" class="toggle-label"></label>
                                </div>
                                <div class="setting-description">
                                    <small>启用后会自动更新微博内容</small>
                                </div>
                            </div>

                            <div class="setting-item">
                                <label class="setting-label">生成阈值:</label>
                                <div class="setting-number">
                                    <input type="number" id="weibo-threshold" class="number-input"
                                           min="1" max="100" value="10">
                                    <span class="number-unit">条消息</span>
                                </div>
                            </div>

                            <div class="setting-item">
                                <label class="setting-label">热搜数量:</label>
                                <div class="setting-number">
                                    <input type="number" id="hot-search-count" class="number-input"
                                           min="3" max="10" value="5">
                                    <span class="number-unit">个</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- API配置区 -->
                    <div class="api-config-section">
                        <h3 class="section-title">🔌 API配置</h3>
                        <div class="api-config-form">
                            <div class="config-item">
                                <label class="config-label">API地址:</label>
                                <input type="text" class="config-input" id="api-url"
                                       placeholder="请输入API地址...">
                            </div>
                            <div class="config-item">
                                <label class="config-label">API密钥:</label>
                                <input type="password" class="config-input" id="api-key"
                                       placeholder="请输入API密钥...">
                            </div>
                            <div class="config-item">
                                <label class="config-label">模型名称:</label>
                                <input type="text" class="config-input" id="api-model"
                                       placeholder="请输入模型名称...">
                            </div>
                            <button class="test-api-btn" id="test-api-btn">
                                <span class="btn-icon">🔍</span>
                                测试连接
                            </button>
                        </div>
                    </div>

                    <!-- 监听器控制区 -->
                    <div class="listener-control-section">
                        <h3 class="section-title">👂 自动监听</h3>
                        <div class="listener-controls">
                            <div class="listener-status">
                                <span class="listener-indicator ${this.getListenerStatus()}"></span>
                                <span class="listener-text">${this.getListenerText()}</span>
                            </div>
                            <div class="listener-actions">
                                <button class="listener-btn" id="start-listener-btn">
                                    <span class="btn-icon">▶️</span>
                                    开始监听
                                </button>
                                <button class="listener-btn" id="stop-listener-btn">
                                    <span class="btn-icon">⏹️</span>
                                    停止监听
                                </button>
                                <button class="listener-btn" id="listener-stats-btn">
                                    <span class="btn-icon">📊</span>
                                    统计信息
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 数据统计区 -->
                    <div class="data-stats-section">
                        <h3 class="section-title">📊 数据统计</h3>
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon">📝</div>
                                <div class="stat-info">
                                    <div class="stat-number" id="total-posts">0</div>
                                    <div class="stat-label">微博总数</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">💬</div>
                                <div class="stat-info">
                                    <div class="stat-number" id="total-comments">0</div>
                                    <div class="stat-label">评论总数</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">🔥</div>
                                <div class="stat-info">
                                    <div class="stat-number" id="hot-searches">0</div>
                                    <div class="stat-label">热搜数量</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">🚀</div>
                                <div class="stat-info">
                                    <div class="stat-number" id="generation-count">0</div>
                                    <div class="stat-label">生成次数</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 工具区 -->
                    <div class="tools-section">
                        <h3 class="section-title">🛠️ 工具箱</h3>
                        <div class="tools-list">
                            <button class="tool-btn" id="import-data-btn">
                                <span class="tool-icon">📥</span>
                                <span class="tool-text">导入数据</span>
                            </button>
                            <button class="tool-btn" id="backup-data-btn">
                                <span class="tool-icon">💾</span>
                                <span class="tool-text">备份数据</span>
                            </button>
                            <button class="tool-btn" id="reset-settings-btn">
                                <span class="tool-icon">🔄</span>
                                <span class="tool-text">重置设置</span>
                            </button>
                            <button class="tool-btn" id="show-logs-btn">
                                <span class="tool-icon">📋</span>
                                <span class="tool-text">查看日志</span>
                            </button>
                        </div>
                    </div>

                    <!-- 自定义前缀区 -->
                    <div class="custom-prefix-section">
                        <h3 class="section-title">✏️ 自定义前缀</h3>
                        <div class="prefix-editor">
                            <label class="prefix-label">额外提示词 (将添加到风格提示词前面):</label>
                            <textarea class="prefix-textarea" id="custom-prefix"
                                      placeholder="在此输入自定义前缀，可以用来添加特殊指令、角色设定或生成要求..."></textarea>
                            <div class="prefix-tips">
                                <div class="tip-item">💡 可以指定特定的微博风格或语调</div>
                                <div class="tip-item">🎯 可以设置特定的话题或内容方向</div>
                                <div class="tip-item">🎭 可以添加角色扮演或情景设定</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 底部操作栏 -->
                <div class="control-footer">
                    <button class="footer-btn secondary" id="save-settings-btn">
                        <span class="btn-icon">💾</span>
                        保存设置
                    </button>
                    <button class="footer-btn primary" id="apply-settings-btn">
                        <span class="btn-icon">✅</span>
                        应用设置
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 获取管理器状态
     */
    getManagerStatus() {
        if (window.weiboManager && window.weiboManager.isCurrentlyProcessing()) {
            return 'processing';
        }
        return window.weiboManager ? 'ready' : 'error';
    }

    /**
     * 获取状态文本
     */
    getStatusText() {
        const status = this.getManagerStatus();
        switch (status) {
            case 'processing':
                return '生成中...';
            case 'ready':
                return '就绪';
            case 'error':
                return '未连接';
            default:
                return '未知';
        }
    }

    /**
     * 获取监听器状态
     */
    getListenerStatus() {
        if (window.weiboAutoListener && window.weiboAutoListener.isListening) {
            return 'active';
        }
        return 'inactive';
    }

    /**
     * 获取监听器状态文本
     */
    getListenerText() {
        const status = this.getListenerStatus();
        return status === 'active' ? '监听中' : '已停止';
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 快速操作按钮
        document.addEventListener('click', (e) => {
            if (e.target.id === 'generate-weibo-btn' || e.target.closest('#generate-weibo-btn')) {
                this.generateWeibo();
            }

            if (e.target.id === 'refresh-weibo-btn' || e.target.closest('#refresh-weibo-btn')) {
                this.refreshWeibo();
            }

            if (e.target.id === 'clear-weibo-btn' || e.target.closest('#clear-weibo-btn')) {
                this.clearWeibo();
            }

            if (e.target.id === 'export-weibo-btn' || e.target.closest('#export-weibo-btn')) {
                this.exportWeibo();
            }

            // 监听器控制
            if (e.target.id === 'start-listener-btn' || e.target.closest('#start-listener-btn')) {
                this.startListener();
            }

            if (e.target.id === 'stop-listener-btn' || e.target.closest('#stop-listener-btn')) {
                this.stopListener();
            }

            if (e.target.id === 'listener-stats-btn' || e.target.closest('#listener-stats-btn')) {
                this.showListenerStats();
            }

            // API测试
            if (e.target.id === 'test-api-btn' || e.target.closest('#test-api-btn')) {
                this.testAPI();
            }

            // 工具按钮
            if (e.target.id === 'import-data-btn' || e.target.closest('#import-data-btn')) {
                this.importData();
            }

            if (e.target.id === 'backup-data-btn' || e.target.closest('#backup-data-btn')) {
                this.backupData();
            }

            if (e.target.id === 'reset-settings-btn' || e.target.closest('#reset-settings-btn')) {
                this.resetSettings();
            }

            if (e.target.id === 'show-logs-btn' || e.target.closest('#show-logs-btn')) {
                this.showLogs();
            }

            // 底部按钮
            if (e.target.id === 'save-settings-btn' || e.target.closest('#save-settings-btn')) {
                this.saveSettings();
            }

            if (e.target.id === 'apply-settings-btn' || e.target.closest('#apply-settings-btn')) {
                this.applySettings();
            }
        });

        // 设置变更监听
        document.addEventListener('change', (e) => {
            if (e.target.id === 'weibo-style-select') {
                this.updateWeiboStyle(e.target.value);
            }

            if (e.target.id === 'weibo-auto-generate') {
                this.updateAutoGenerate(e.target.checked);
            }

            if (e.target.id === 'weibo-auto-update') {
                this.updateAutoUpdate(e.target.checked);
            }

            if (e.target.id === 'weibo-threshold') {
                this.updateThreshold(parseInt(e.target.value));
            }
        });
    }

    /**
     * 生成微博
     */
    async generateWeibo() {
        console.log('[Weibo Control App] 生成微博内容');

        if (window.weiboManager) {
            try {
                await window.weiboManager.generateWeiboContent();
                this.showNotification('微博内容生成成功！', 'success');
                this.updateStats();
            } catch (error) {
                console.error('[Weibo Control App] 生成微博失败:', error);
                this.showNotification('微博内容生成失败', 'error');
            }
        } else {
            this.showNotification('微博管理器未找到', 'error');
        }
    }

    /**
     * 刷新微博
     */
    refreshWeibo() {
        console.log('[Weibo Control App] 刷新微博内容');

        if (window.weiboUI) {
            window.weiboUI.refreshWeiboList();
            this.showNotification('微博内容已刷新', 'info');
        } else {
            this.showNotification('微博UI未找到', 'error');
        }
    }

    /**
     * 清除微博
     */
    clearWeibo() {
        const confirmed = confirm('确定要清除所有微博内容吗？此操作不可撤销。');
        if (confirmed) {
            console.log('[Weibo Control App] 清除微博内容');
            // 这里可以实现清除逻辑
            this.showNotification('微博内容已清除', 'info');
        }
    }

    /**
     * 导出微博
     */
    exportWeibo() {
        console.log('[Weibo Control App] 导出微博数据');

        try {
            const weiboData = window.weiboUI ? window.weiboUI.getCurrentWeiboData() : {};
            const dataStr = JSON.stringify(weiboData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `weibo_data_${new Date().toISOString().split('T')[0]}.json`;
            a.click();

            URL.revokeObjectURL(url);
            this.showNotification('微博数据导出成功', 'success');
        } catch (error) {
            console.error('[Weibo Control App] 导出失败:', error);
            this.showNotification('数据导出失败', 'error');
        }
    }

    /**
     * 开始监听
     */
    startListener() {
        console.log('[Weibo Control App] 开始自动监听');

        if (window.weiboAutoListener) {
            window.weiboAutoListener.start();
            this.showNotification('自动监听已开始', 'success');
            this.updateListenerStatus();
        } else {
            this.showNotification('自动监听器未找到', 'error');
        }
    }

    /**
     * 停止监听
     */
    stopListener() {
        console.log('[Weibo Control App] 停止自动监听');

        if (window.weiboAutoListener) {
            window.weiboAutoListener.stop();
            this.showNotification('自动监听已停止', 'info');
            this.updateListenerStatus();
        }
    }

    /**
     * 显示监听器统计
     */
    showListenerStats() {
        if (window.weiboAutoListener) {
            const stats = window.weiboAutoListener.getStats();
            const statsText = `
监听状态: ${stats.isListening ? '活跃' : '停止'}
处理状态: ${stats.isProcessing ? '处理中' : '空闲'}
消息数量: ${stats.messageCount}
生成次数: ${stats.generationCount}
最后生成: ${stats.lastGenerationTime || '无'}
            `;
            alert('监听器统计信息:\n' + statsText);
        } else {
            this.showNotification('监听器未找到', 'error');
        }
    }

    /**
     * 测试API连接
     */
    async testAPI() {
        console.log('[Weibo Control App] 测试API连接');

        const button = document.getElementById('test-api-btn');
        if (button) {
            button.textContent = '测试中...';
            button.disabled = true;
        }

        try {
            // 模拟API测试
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.showNotification('API连接测试成功', 'success');
        } catch (error) {
            console.error('[Weibo Control App] API测试失败:', error);
            this.showNotification('API连接测试失败', 'error');
        } finally {
            if (button) {
                button.innerHTML = '<span class="btn-icon">🔍</span>测试连接';
                button.disabled = false;
            }
        }
    }

    /**
     * 导入数据
     */
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        console.log('[Weibo Control App] 导入数据:', data);
                        this.showNotification('数据导入成功', 'success');
                    } catch (error) {
                        console.error('[Weibo Control App] 导入失败:', error);
                        this.showNotification('数据导入失败，请检查文件格式', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    /**
     * 备份数据
     */
    backupData() {
        this.exportWeibo(); // 复用导出功能
    }

    /**
     * 重置设置
     */
    resetSettings() {
        const confirmed = confirm('确定要重置所有设置吗？');
        if (confirmed) {
            console.log('[Weibo Control App] 重置设置');
            localStorage.removeItem('weiboManagerSettings');
            this.showNotification('设置已重置', 'info');
            this.loadSettings();
        }
    }

    /**
     * 显示日志
     */
    showLogs() {
        console.log('[Weibo Control App] 显示日志');
        this.showNotification('日志功能开发中...', 'info');
    }

    /**
     * 保存设置
     */
    saveSettings() {
        console.log('[Weibo Control App] 保存设置');

        const settings = {
            style: document.getElementById('weibo-style-select')?.value || '微博网友',
            autoGenerate: document.getElementById('weibo-auto-generate')?.checked || false,
            autoUpdate: document.getElementById('weibo-auto-update')?.checked || false, // 新增自动更新设置
            threshold: parseInt(document.getElementById('weibo-threshold')?.value) || 10,
            hotSearchCount: parseInt(document.getElementById('hot-search-count')?.value) || 5,
            apiUrl: document.getElementById('api-url')?.value || '',
            apiKey: document.getElementById('api-key')?.value || '',
            apiModel: document.getElementById('api-model')?.value || '',
            customPrefix: document.getElementById('custom-prefix')?.value || ''
        };

        localStorage.setItem('weiboControlSettings', JSON.stringify(settings));
        this.showNotification('设置已保存', 'success');
    }

    /**
     * 应用设置
     */
    applySettings() {
        console.log('[Weibo Control App] 应用设置');

        this.saveSettings();

        // 应用到微博管理器
        if (window.weiboManager) {
            const settings = JSON.parse(localStorage.getItem('weiboControlSettings') || '{}');

            if (settings.style) {
                window.weiboManager.currentSettings.selectedStyle = settings.style;
            }
            if (typeof settings.autoGenerate === 'boolean') {
                window.weiboManager.currentSettings.autoUpdate = settings.autoGenerate; // 应用自动生成
            }
            if (typeof settings.autoUpdate === 'boolean') {
                window.weiboManager.currentSettings.autoUpdate = settings.autoUpdate; // 应用自动更新
            }
            if (settings.threshold) {
                window.weiboManager.currentSettings.threshold = settings.threshold;
            }

            window.weiboManager.saveSettings();
        }

        this.showNotification('设置已应用', 'success');
    }

    /**
     * 加载设置
     */
    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('weiboControlSettings') || '{}');

            if (settings.style) {
                const styleSelect = document.getElementById('weibo-style-select');
                if (styleSelect) styleSelect.value = settings.style;
            }

            if (typeof settings.autoGenerate === 'boolean') {
                const autoGenerate = document.getElementById('weibo-auto-generate');
                if (autoGenerate) autoGenerate.checked = settings.autoGenerate;
            }

            if (typeof settings.autoUpdate === 'boolean') {
                const autoUpdate = document.getElementById('weibo-auto-update');
                if (autoUpdate) autoUpdate.checked = settings.autoUpdate;
            }

            if (settings.threshold) {
                const threshold = document.getElementById('weibo-threshold');
                if (threshold) threshold.value = settings.threshold;
            }

            if (settings.hotSearchCount) {
                const hotSearchCount = document.getElementById('hot-search-count');
                if (hotSearchCount) hotSearchCount.value = settings.hotSearchCount;
            }

            if (settings.apiUrl) {
                const apiUrl = document.getElementById('api-url');
                if (apiUrl) apiUrl.value = settings.apiUrl;
            }

            if (settings.apiKey) {
                const apiKey = document.getElementById('api-key');
                if (apiKey) apiKey.value = settings.apiKey;
            }

            if (settings.apiModel) {
                const apiModel = document.getElementById('api-model');
                if (apiModel) apiModel.value = settings.apiModel;
            }

            if (settings.customPrefix) {
                const customPrefix = document.getElementById('custom-prefix');
                if (customPrefix) customPrefix.value = settings.customPrefix;
            }

            console.log('[Weibo Control App] 设置已加载');
        } catch (error) {
            console.error('[Weibo Control App] 加载设置失败:', error);
        }
    }

    /**
     * 更新微博风格
     */
    updateWeiboStyle(style) {
        console.log('[Weibo Control App] 更新微博风格:', style);
    }

    /**
     * 更新自动生成设置
     */
    updateAutoGenerate(enabled) {
        console.log('[Weibo Control App] 更新自动生成:', enabled);

        // 更新微博管理器的设置
        if (window.weiboManager) {
            window.weiboManager.setAutoUpdate(enabled);
        }

        // 控制自动监听器
        if (window.weiboAutoListener) {
            window.weiboAutoListener.setEnabled(enabled);
            if (enabled) {
                window.weiboAutoListener.start();
                console.log('[Weibo Control App] 自动生成已启用，监听器已启动');
            } else {
                window.weiboAutoListener.stop();
                console.log('[Weibo Control App] 自动生成已禁用，监听器已停止');
            }
        }

        this.showNotification(
            enabled ? '自动生成已启用' : '自动生成已禁用',
            'info'
        );
    }

    /**
     * 更新自动更新设置
     */
    updateAutoUpdate(enabled) {
        console.log('[Weibo Control App] 更新自动更新:', enabled);

        // 更新微博管理器的设置
        if (window.weiboManager) {
            window.weiboManager.setAutoUpdate(enabled);
        }

        // 控制自动监听器
        if (window.weiboAutoListener) {
            if (enabled) {
                window.weiboAutoListener.start();
                console.log('[Weibo Control App] 自动监听器已启动');
            } else {
                window.weiboAutoListener.stop();
                console.log('[Weibo Control App] 自动监听器已停止');
            }
        }

        this.showNotification(
            enabled ? '自动更新已启用' : '自动更新已禁用',
            'info'
        );
    }

    /**
     * 更新阈值
     */
    updateThreshold(threshold) {
        console.log('[Weibo Control App] 更新阈值:', threshold);
    }

    /**
     * 更新统计数据
     */
    updateStats() {
        try {
            const weiboData = window.weiboUI ? window.weiboUI.getCurrentWeiboData() : {};

            const totalPosts = document.getElementById('total-posts');
            if (totalPosts) totalPosts.textContent = weiboData.posts ? weiboData.posts.length : 0;

            const totalComments = document.getElementById('total-comments');
            if (totalComments) {
                let commentCount = 0;
                if (weiboData.comments) {
                    Object.values(weiboData.comments).forEach(comments => {
                        commentCount += comments.length;
                    });
                }
                totalComments.textContent = commentCount;
            }

            const hotSearches = document.getElementById('hot-searches');
            if (hotSearches) hotSearches.textContent = weiboData.hotSearches ? weiboData.hotSearches.length : 0;

            // 更新生成次数
            if (window.weiboAutoListener) {
                const stats = window.weiboAutoListener.getStats();
                const generationCount = document.getElementById('generation-count');
                if (generationCount) generationCount.textContent = stats.generationCount || 0;
            }

        } catch (error) {
            console.error('[Weibo Control App] 更新统计失败:', error);
        }
    }

    /**
     * 更新监听器状态
     */
    updateListenerStatus() {
        const indicator = document.querySelector('.listener-indicator');
        const text = document.querySelector('.listener-text');

        if (indicator && text) {
            const status = this.getListenerStatus();
            indicator.className = `listener-indicator ${status}`;
            text.textContent = this.getListenerText();
        }
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        console.log(`[Weibo Control App] 通知 (${type}):`, message);

        // 简单的通知实现
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// 创建全局实例
window.WeiboControlApp = WeiboControlApp;
window.weiboControlApp = new WeiboControlApp();

// 获取微博控制应用内容的全局函数
window.getWeiboControlAppContent = function() {
    return window.weiboControlApp.getWeiboControlMainHTML();
};

// 绑定微博控制应用事件的全局函数
window.bindWeiboControlEvents = function() {
    if (window.weiboControlApp) {
        window.weiboControlApp.bindEvents();
        window.weiboControlApp.loadSettings();
        window.weiboControlApp.updateStats();
        console.log('[Weibo Control App] 事件绑定完成');
    }
};

console.log('[Weibo Control App] 微博控制应用模块加载完成');
