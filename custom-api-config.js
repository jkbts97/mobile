// ==Mobile Custom API Config==
// @name         Mobile Custom API Configuration
// @version      1.0.0
// @description  移动端自定义API配置管理器，支持多种API服务商
// @author       cd
// @license      MIT

/**
 * 移动端自定义API配置管理器
 * 移植自论坛应用和real-time-status-bar插件的API配置功能
 */
class MobileCustomAPIConfig {
    constructor() {
        this.isInitialized = false;
        this.currentSettings = this.getDefaultSettings();
        this.supportedProviders = this.getSupportedProviders();

        // 绑定到全局窗口对象
        window.mobileCustomAPIConfig = this;

        console.log('[Mobile API Config] 自定义API配置管理器已创建');
    }

    /**
     * 获取默认设置
     */
    getDefaultSettings() {
        return {
            enabled: false,
            provider: 'custom', // 修改：默认使用自定义API
            apiUrl: '',
            apiKey: '',
            model: '',
            temperature: 0.8,
            maxTokens: 30000,
            useProxy: false,
            proxyUrl: '',
            timeout: 30000,
            retryCount: 3,
            // 高级设置
            customHeaders: {},
            systemPrompt: '',
            streamEnabled: false
        };
    }

    /**
     * 获取支持的API服务商配置
     */
    getSupportedProviders() {
        return {
            custom: {
                name: '自定义API',
                defaultUrl: '',
                urlSuffix: 'chat/completions',
                modelsEndpoint: 'models',
                defaultModels: [],
                authType: 'Bearer',
                requiresKey: true, // 修复：允许填写密钥
                icon: '⚙️'
            }
        };
    }

    /**
     * 初始化API配置管理器
     */
    async initialize() {
        try {
            await this.loadSettings();
            this.createUI();
            this.bindEvents();
            this.isInitialized = true;

            console.log('[Mobile API Config] ✅ 自定义API配置管理器初始化完成');
            console.log('[Mobile API Config] 📋 当前设置:', {
                provider: this.currentSettings.provider,
                enabled: this.currentSettings.enabled,
                apiUrl: this.currentSettings.apiUrl || '(未设置)',
                hasApiKey: !!this.currentSettings.apiKey,
                model: this.currentSettings.model || '(未设置)',
                支持的服务商: Object.keys(this.supportedProviders)
            });
            return true;
        } catch (error) {
            console.error('[Mobile API Config] ❌ 初始化失败:', error);
            return false;
        }
    }

    /**
     * 加载设置
     */
    async loadSettings() {
        try {
            const savedSettings = localStorage.getItem('mobile_custom_api_settings');
            if (savedSettings) {
                this.currentSettings = { ...this.getDefaultSettings(), ...JSON.parse(savedSettings) };
            }

            // 强制设置provider为custom
            this.currentSettings.provider = 'custom';

            console.log('[Mobile API Config] 设置已加载:', this.currentSettings);
        } catch (error) {
            console.error('[Mobile API Config] 加载设置失败:', error);
            this.currentSettings = this.getDefaultSettings();
        }
    }

    /**
     * 保存设置
     */
    async saveSettings() {
        try {
            localStorage.setItem('mobile_custom_api_settings', JSON.stringify(this.currentSettings));
            console.log('[Mobile API Config] 设置已保存');

            // 触发设置更新事件
            document.dispatchEvent(new CustomEvent('mobile-api-config-updated', {
                detail: this.currentSettings
            }));

            return true;
        } catch (error) {
            console.error('[Mobile API Config] 保存设置失败:', error);
            return false;
        }
    }

    /**
     * 创建API配置UI
     */
    createUI() {
        // 创建触发按钮
        this.createTriggerButton();

        // 创建配置面板
        this.createConfigPanel();
    }

    /**
     * 创建触发按钮
     */
    createTriggerButton() {
        // 检查是否已存在按钮
        if (document.getElementById('mobile-api-config-trigger')) {
            return;
        }

        const triggerButton = document.createElement('button');
        triggerButton.id = 'mobile-api-config-trigger';
        triggerButton.className = 'mobile-api-config-btn';
        triggerButton.innerHTML = '🔧';
        triggerButton.title = 'API配置';
        triggerButton.style.cssText = `
            position: fixed;
            bottom: 200px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #8B5CF6, #EF4444);
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            z-index: 9997;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // 悬停效果
        triggerButton.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 6px 25px rgba(0,0,0,0.4)';
        });

        triggerButton.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
        });

        // 点击事件
        triggerButton.addEventListener('click', () => {
            this.showConfigPanel();
        });

        document.body.appendChild(triggerButton);
        console.log('[Mobile API Config] ✅ 触发按钮已创建');
    }

    /**
     * 创建配置面板
     */
    createConfigPanel() {
        if (document.getElementById('mobile-api-config-panel')) {
            return;
        }

        const panel = document.createElement('div');
        panel.id = 'mobile-api-config-panel';
        panel.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: none;
            backdrop-filter: blur(5px);
        `;

        const content = document.createElement('div');
        content.className = 'mobile-api-config-content';
        content.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 15px;
            padding: 20px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;

        content.innerHTML = this.getConfigPanelHTML();
        panel.appendChild(content);
        document.body.appendChild(panel);

        console.log('[Mobile API Config] ✅ 配置面板已创建');
    }

    /**
     * 获取配置面板HTML
     */
    getConfigPanelHTML() {
        const providers = this.supportedProviders;
        const settings = this.currentSettings;

        return `
            <div class="mobile-api-config-header">
                <h3 style="margin: 0 0 20px 0; color: #333; text-align: center;">
                    ⚙️ 自定义API配置
                </h3>
                <button id="close-api-config" style="
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #666;
                ">×</button>
            </div>

            <div class="mobile-api-config-form">
                <!-- 启用开关 -->
                <div style="margin-bottom: 20px;">
                    <label style="display: flex; align-items: center; gap: 10px; font-weight: 500;">
                        <input type="checkbox" id="api-enabled" ${settings.enabled ? 'checked' : ''}>
                        启用自定义API
                    </label>
                </div>

                <!-- 隐藏的服务商设置，固定为custom -->
                <input type="hidden" id="api-provider" value="custom">

                <!-- API URL -->
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">API URL:</label>
                    <input type="text" id="api-url" placeholder="https://api.openai.com"
                           value="${settings.apiUrl}"
                           style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;background-color: #fff;color: #000;">
                    <small style="color: #666; font-size: 12px;">留空使用默认URL</small>
                </div>

                <!-- API密钥 -->
                <div style="margin-bottom: 15px;" id="api-key-section">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">API密钥:</label>
                    <div style="position: relative;">
                        <input type="password" id="api-key" placeholder="sk-..."
                               value="${settings.apiKey}"
                               style="width: 100%; padding: 8px 35px 8px 8px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;background-color: #fff;color: #000;">
                        <button type="button" id="toggle-api-key" style="
                            position: absolute;
                            right: 8px;
                            top: 50%;
                            transform: translateY(-50%);
                            background: none;
                            border: none;
                            cursor: pointer;
                            color: #666;
                        ">👁️</button>
                    </div>
                </div>

                <!-- 模型选择 -->
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">模型:</label>
                    <div style="display: flex; gap: 10px;">
                        <select id="api-model" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                            <option value="">选择模型...</option>
                        </select>
                        <button type="button" id="refresh-models" style="
                            padding: 8px 15px;
                            background: #007bff;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                        ">📥</button>
                    </div>
                </div>

                <!-- 高级设置 -->
                <details style="margin-bottom: 15px;">
                    <summary style="cursor: pointer; font-weight: 500; margin-bottom: 10px;color: #000;">⚙️ 高级设置</summary>

                    <div style="margin-left: 15px;">
                        <!-- 温度 -->
                        <div style="margin-bottom: 10px;">
                            <label style="display: block; margin-bottom: 5px;color: #000;">温度 (0-2):</label>
                            <input type="range" id="api-temperature" min="0" max="2" step="0.1"
                                   value="${settings.temperature}"
                                   style="width: 100%;">
                            <span id="temperature-value" style="font-size: 12px; color: #666;">${settings.temperature}</span>
                        </div>

                        <!-- 最大令牌数 -->
                        <div style="margin-bottom: 10px;">
                            <label style="display: block; margin-bottom: 5px;">最大令牌数:</label>
                            <input type="number" id="api-max-tokens" min="1" max="80000"
                                   value="${settings.maxTokens}"
                                   style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 3px;background-color: #fff;color: #000;">
                        </div>

                        <!-- 系统提示词 -->
                        <div style="margin-bottom: 10px;">
                            <label style="display: block; margin-bottom: 5px;">系统提示词:</label>
                            <textarea id="api-system-prompt" rows="3"
                                      placeholder="可选的系统提示词..."
                                      style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 3px; resize: vertical; box-sizing: border-box;">${settings.systemPrompt}</textarea>
                        </div>
                    </div>
                </details>

                <!-- 按钮组 -->
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button type="button" id="test-api-connection" style="
                        flex: 1;
                        padding: 12px;
                        background: #28a745;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: 500;
                    ">🧪 测试连接</button>

                    <button type="button" id="save-api-config" style="
                        flex: 1;
                        padding: 12px;
                        background: #007bff;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: 500;
                    ">💾 保存配置</button>
                </div>

                <!-- 状态显示 -->
                <div id="api-config-status" style="
                    margin-top: 15px;
                    padding: 10px;
                    border-radius: 5px;
                    background: #f8f9fa;
                    border: 1px solid #e9ecef;
                    font-size: 14px;
                    display: none;
                "></div>
            </div>
        `;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 关闭面板
        $(document).on('click', '#close-api-config', () => {
            this.hideConfigPanel();
        });

        // 点击面板外部关闭
        $(document).on('click', '#mobile-api-config-panel', (e) => {
            if (e.target.id === 'mobile-api-config-panel') {
                this.hideConfigPanel();
            }
        });

        // 服务商选择变化
        $(document).on('change', '#api-provider', (e) => {
            this.onProviderChange(e.target.value);
        });

        // 密钥显示切换
        $(document).on('click', '#toggle-api-key', () => {
            const keyInput = document.getElementById('api-key');
            const isPassword = keyInput.type === 'password';
            keyInput.type = isPassword ? 'text' : 'password';
            document.getElementById('toggle-api-key').textContent = isPassword ? '🙈' : '👁️';
        });

        // 温度滑块
        $(document).on('input', '#api-temperature', (e) => {
            document.getElementById('temperature-value').textContent = e.target.value;
        });

        // 刷新模型列表
        $(document).on('click', '#refresh-models', () => {
            this.refreshModels();
        });

        // 测试连接
        $(document).on('click', '#test-api-connection', () => {
            this.testConnection();
        });

        // 保存配置
        $(document).on('click', '#save-api-config', () => {
            this.saveConfigFromUI();
        });
    }

    /**
     * 显示配置面板
     */
    showConfigPanel() {
        const panel = document.getElementById('mobile-api-config-panel');
        if (panel) {
            panel.style.display = 'block';
            this.updateUIFromSettings();
            this.onProviderChange(this.currentSettings.provider);
        }
    }

    /**
     * 隐藏配置面板
     */
    hideConfigPanel() {
        const panel = document.getElementById('mobile-api-config-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    }

    /**
     * 当服务商选择变化时
     */
    onProviderChange(providerKey) {
        // 固定使用custom provider
        const provider = this.supportedProviders['custom'];
        if (!provider) return;

        // 不更新URL默认值，保持用户输入
        // 自定义API不设置默认URL，让用户自己填写

        // 显示密钥输入框
        const keySection = document.getElementById('api-key-section');
        if (keySection) {
            keySection.style.display = 'block';
        }

        // 更新模型列表
        this.updateModelList(provider.defaultModels);
    }

    /**
     * 更新模型列表
     */
    updateModelList(models) {
        const modelSelect = document.getElementById('api-model');
        if (!modelSelect) return;

        modelSelect.innerHTML = '<option value="">选择模型...</option>';

        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            if (model === this.currentSettings.model) {
                option.selected = true;
            }
            modelSelect.appendChild(option);
        });
    }

    /**
     * 从UI更新设置
     */
    updateUIFromSettings() {
        const settings = this.currentSettings;

        // 更新各个字段
        const elements = {
            'api-enabled': settings.enabled,
            'api-provider': settings.provider,
            'api-url': settings.apiUrl,
            'api-key': settings.apiKey,
            'api-model': settings.model,
            'api-temperature': settings.temperature,
            'api-max-tokens': settings.maxTokens,
            'api-system-prompt': settings.systemPrompt
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        });

        // 更新温度显示
        const tempValue = document.getElementById('temperature-value');
        if (tempValue) {
            tempValue.textContent = settings.temperature;
        }
    }

    /**
     * 从UI保存配置
     */
    async saveConfigFromUI() {
        try {
            // 收集UI数据
            const formData = {
                enabled: document.getElementById('api-enabled')?.checked || false,
                provider: 'custom', // 固定使用custom provider
                apiUrl: document.getElementById('api-url')?.value || '',
                apiKey: document.getElementById('api-key')?.value || '',
                model: document.getElementById('api-model')?.value || '',
                temperature: parseFloat(document.getElementById('api-temperature')?.value || 0.8),
                maxTokens: parseInt(document.getElementById('api-max-tokens')?.value || 1500),
                systemPrompt: document.getElementById('api-system-prompt')?.value || ''
            };

            // 验证必填字段
            const provider = this.supportedProviders[formData.provider];
            if (provider?.requiresKey && !formData.apiKey) {
                this.showStatus('❌ 请填写API密钥', 'error');
                return;
            }

            // 更新设置
            this.currentSettings = { ...this.currentSettings, ...formData };

            // 保存到localStorage
            const saved = await this.saveSettings();

            if (saved) {
                this.showStatus('✅ 配置已保存', 'success');
                setTimeout(() => {
                    this.hideConfigPanel();
                }, 1500);
            } else {
                this.showStatus('❌ 保存失败', 'error');
            }

        } catch (error) {
            console.error('[Mobile API Config] 保存配置失败:', error);
            this.showStatus('❌ 保存失败: ' + error.message, 'error');
        }
    }

    /**
     * 刷新模型列表
     */
    async refreshModels() {
        const provider = 'custom'; // 固定使用custom provider
        const apiUrl = document.getElementById('api-url')?.value || '';
        const apiKey = document.getElementById('api-key')?.value || '';

        if (!apiUrl) {
            this.showStatus('❌ 请先填写API URL', 'error');
            return;
        }

        this.showStatus('🔄 正在获取模型列表...', 'info');

        try {
            const models = await this.fetchModels(provider, apiUrl, apiKey);
            this.updateModelList(models);
            this.showStatus(`✅ 已获取 ${models.length} 个模型`, 'success');
        } catch (error) {
            console.error('[Mobile API Config] 获取模型失败:', error);
            this.showStatus('❌ 获取模型失败: ' + error.message, 'error');
        }
    }

        /**
     * 获取模型列表 (完全兼容real-time-status-bar逻辑)
     */
    async fetchModels(provider, apiUrl, apiKey) {
        const providerConfig = this.supportedProviders[provider];
        if (!providerConfig) {
            throw new Error('不支持的服务商');
        }

        // 构建模型列表URL (完全模拟real-time-status-bar逻辑)
        let modelsUrl = apiUrl.trim();
        if (!modelsUrl.endsWith('/')) {
            modelsUrl += '/';
        }

        // 自定义API使用标准OpenAI兼容的URL构建
        if (modelsUrl.endsWith('/v1/')) {
            modelsUrl += 'models';
        } else if (!modelsUrl.includes('/models')) {
            modelsUrl += 'v1/models';
        }

        // 构建请求头
        const headers = { 'Content-Type': 'application/json' };

        // 自定义API使用Bearer认证
        if (providerConfig.requiresKey && apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        console.log('[Mobile API Config] 请求模型列表:', {
            url: modelsUrl,
            headers: { ...headers, Authorization: apiKey ? 'Bearer [HIDDEN]' : undefined }
        });

        const response = await fetch(modelsUrl, {
            method: 'GET',
            headers: headers,
            timeout: 10000
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        // 解析OpenAI兼容格式的响应
        let models = [];
        if (data.data && Array.isArray(data.data)) {
            // 标准OpenAI格式
            models = data.data.map(model => model.id);
        } else if (Array.isArray(data)) {
            // 直接数组格式
            models = data.map(model => model.id || model.name || model);
        }

        return models.filter(model => typeof model === 'string' && model.length > 0);
    }

    /**
     * 测试API连接
     */
    async testConnection() {
        const provider = 'custom'; // 固定使用custom provider
        const apiUrl = document.getElementById('api-url')?.value || '';
        const apiKey = document.getElementById('api-key')?.value || '';
        const model = document.getElementById('api-model')?.value || '';

        if (!apiUrl) {
            this.showStatus('❌ 请先填写API URL', 'error');
            return;
        }

        const providerConfig = this.supportedProviders[provider];
        if (providerConfig?.requiresKey && !apiKey) {
            this.showStatus('❌ 请先填写API密钥', 'error');
            return;
        }

        if (!model) {
            this.showStatus('❌ 请先选择模型', 'error');
            return;
        }

        this.showStatus('🧪 正在测试连接...', 'info');

        try {
            const result = await this.testAPICall(provider, apiUrl, apiKey, model);
            if (result.success) {
                this.showStatus('✅ 连接测试成功!', 'success');
            } else {
                this.showStatus('❌ 连接测试失败: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('[Mobile API Config] 连接测试失败:', error);
            this.showStatus('❌ 连接测试失败: ' + error.message, 'error');
        }
    }

    /**
     * 执行API测试调用
     */
    async testAPICall(provider, apiUrl, apiKey, model) {
        const providerConfig = this.supportedProviders[provider];

        // 构建请求URL
        let requestUrl = apiUrl.trim();
        if (!requestUrl.endsWith('/')) {
            requestUrl += '/';
        }
        requestUrl += providerConfig.urlSuffix.replace('{model}', model);

        // 构建请求头
        const headers = { 'Content-Type': 'application/json' };

        // 自定义API使用Bearer认证
        if (providerConfig.requiresKey && apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        // 构建请求体
        const requestBody = this.buildTestRequestBody(provider, model);

        console.log('[Mobile API Config] 测试请求:', {
            url: requestUrl,
            headers: { ...headers, Authorization: apiKey ? 'Bearer [HIDDEN]' : undefined },
            body: requestBody
        });

        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody),
            timeout: 15000
        });

        if (!response.ok) {
            const errorText = await response.text();
            return { success: false, error: `HTTP ${response.status}: ${errorText}` };
        }

        const data = await response.json();
        console.log('[Mobile API Config] 测试响应:', data);

        return { success: true, data: data };
    }

    /**
     * 构建测试请求体 (OpenAI兼容格式)
     */
    buildTestRequestBody(provider, model) {
        const testMessage = "Hello! This is a test message from Mobile API Config.";

        // 自定义API使用标准OpenAI兼容格式
        return {
            model: model,
            messages: [{ role: 'user', content: testMessage }],
            max_tokens: 50,
            temperature: 0.7
        };
    }

    /**
     * 显示状态信息
     */
    showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('api-config-status');
        if (!statusDiv) return;

        const colors = {
            info: '#17a2b8',
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107'
        };

        statusDiv.style.display = 'block';
        statusDiv.style.color = colors[type] || colors.info;
        statusDiv.textContent = message;

        // 自动隐藏成功消息
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        }
    }

    /**
     * 获取当前API配置（供外部调用）
     */
    getCurrentConfig() {
        return { ...this.currentSettings };
    }

    /**
     * 执行API调用（供其他模块使用）
     */
    async callAPI(messages, options = {}) {
        if (!this.currentSettings.enabled) {
            throw new Error('自定义API未启用');
        }

        const provider = this.currentSettings.provider;
        const apiUrl = this.currentSettings.apiUrl || this.supportedProviders[provider]?.defaultUrl;
        const apiKey = this.currentSettings.apiKey;
        const model = this.currentSettings.model;

        if (!apiUrl || !model) {
            throw new Error('API配置不完整');
        }

        const providerConfig = this.supportedProviders[provider];
        if (providerConfig?.requiresKey && !apiKey) {
            throw new Error('缺少API密钥');
        }

        // 构建请求
        let requestUrl = apiUrl.trim();
        if (!requestUrl.endsWith('/')) {
            requestUrl += '/';
        }
        requestUrl += providerConfig.urlSuffix.replace('{model}', model);

        const headers = { 'Content-Type': 'application/json' };

        // 自定义API使用Bearer认证
        if (providerConfig.requiresKey && apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const requestBody = this.buildRequestBody(provider, model, messages, options);

        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody),
            timeout: this.currentSettings.timeout || 30000
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API调用失败: HTTP ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return this.parseAPIResponse(provider, data);
    }

    /**
     * 构建API请求体 (OpenAI兼容格式)
     */
    buildRequestBody(provider, model, messages, options) {
        const settings = this.currentSettings;

        // 自定义API使用标准OpenAI兼容格式
        const body = {
            model: model,
            messages: messages,
            max_tokens: options.maxTokens || settings.maxTokens,
            temperature: options.temperature || settings.temperature,
            ...options.customParams
        };

        // 添加系统提示词
        if (settings.systemPrompt) {
            body.messages = [
                { role: 'system', content: settings.systemPrompt },
                ...body.messages
            ];
        }

        return body;
    }

    /**
     * 解析API响应 (OpenAI兼容格式)
     */
    parseAPIResponse(provider, data) {
        // 自定义API使用标准OpenAI兼容格式
        return {
            content: data.choices?.[0]?.message?.content || '',
            usage: data.usage
        };
    }

    /**
     * 检查API是否可用
     */
    isAPIAvailable() {
        return this.currentSettings.enabled &&
               this.currentSettings.apiUrl &&
               this.currentSettings.model &&
               (
                   !this.supportedProviders[this.currentSettings.provider]?.requiresKey ||
                   this.currentSettings.apiKey
               );
    }

    /**
     * 获取调试信息
     */
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            currentSettings: { ...this.currentSettings, apiKey: this.currentSettings.apiKey ? '[HIDDEN]' : '' },
            supportedProviders: Object.keys(this.supportedProviders),
            isAPIAvailable: this.isAPIAvailable(),
            providerConfig: this.supportedProviders[this.currentSettings.provider] || null
        };
    }

    /**
     * 调试函数：检查当前配置状态
     */
    debugConfig() {
        console.group('🔧 [Mobile API Config] 配置调试信息');
        console.log('✅ 初始化状态:', this.isInitialized);
        console.log('📋 当前设置:', {
            provider: this.currentSettings.provider,
            enabled: this.currentSettings.enabled,
            apiUrl: this.currentSettings.apiUrl || '(未设置)',
            hasApiKey: !!this.currentSettings.apiKey,
            model: this.currentSettings.model || '(未设置)',
            temperature: this.currentSettings.temperature,
            maxTokens: this.currentSettings.maxTokens
        });
        console.log('🌐 支持的服务商:', Object.keys(this.supportedProviders));
        console.log('⚙️ 当前Provider配置:', this.supportedProviders[this.currentSettings.provider]);
        console.log('🔗 API可用性:', this.isAPIAvailable());
        console.log('🔧 UI元素状态:', {
            'api-provider': document.getElementById('api-provider')?.value || '(未找到)',
            'api-url': document.getElementById('api-url')?.value || '(未找到)',
            'api-key': document.getElementById('api-key') ? '(存在)' : '(未找到)',
            'api-model': document.getElementById('api-model')?.value || '(未找到)'
        });
        console.groupEnd();
    }
}

// 自动初始化
jQuery(document).ready(() => {
    // 等待一小段时间确保其他模块加载完成
    setTimeout(() => {
        if (!window.mobileCustomAPIConfig) {
            const apiConfig = new MobileCustomAPIConfig();
            apiConfig.initialize().then(success => {
                if (success) {
                    console.log('[Mobile API Config] ✅ 自定义API配置模块已就绪');
                } else {
                    console.error('[Mobile API Config] ❌ 自定义API配置模块初始化失败');
                }
            });
            // 将实例设置为全局变量
            window.mobileCustomAPIConfig = apiConfig;
        }
    }, 1000);
});

// 导出类和实例到全局作用域
window.MobileCustomAPIConfig = MobileCustomAPIConfig;
