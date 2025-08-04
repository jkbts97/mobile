// ==SillyTavern Weibo Manager==
// @name         Weibo Manager for Mobile Extension
// @version      1.0.0
// @description  微博自动更新管理器
// @author       Assistant

/**
 * 微博管理器类
 * 负责管理微博动态生成、API调用和与上下文编辑器的集成
 */
class WeiboManager {
    constructor() {
        this.isInitialized = false;
        this.currentSettings = {
            enabled: true,
            selectedStyle: '微博网友',
            autoUpdate: false, // 修改默认值为false，需要用户手动启用
            threshold: 10,
            apiConfig: {
                url: '',
                apiKey: '',
                model: ''
            }
        };
        this.isProcessing = false;
        this.lastProcessedCount = 0;

        // 新增：生成状态监控相关
        this.isMonitoringGeneration = false;
        this.pendingInsertions = []; // 待插入的消息队列
        this.generationCheckInterval = null;
        this.statusUpdateTimer = null; // 状态更新定时器
        this.maxWaitTime = 300000; // 最大等待时间: 5分钟

        // 绑定方法
        this.initialize = this.initialize.bind(this);
        this.generateWeiboContent = this.generateWeiboContent.bind(this);
        this.updateContextWithWeibo = this.updateContextWithWeibo.bind(this);
        this.checkGenerationStatus = this.checkGenerationStatus.bind(this);
        this.waitForGenerationComplete = this.waitForGenerationComplete.bind(this);
    }

    /**
     * 初始化微博管理器
     */
    async initialize() {
        try {
            console.log('[Weibo Manager] 初始化开始...');

            // 加载设置
            this.loadSettings();

            // 等待其他模块初始化完成
            await this.waitForDependencies();

            // 创建UI
            this.createWeiboUI();

            // 注册控制台命令
            this.registerConsoleCommands();

            this.isInitialized = true;
            console.log('[Weibo Manager] ✅ 初始化完成');

            // 浏览器兼容性检测和提示
            this.detectBrowserAndShowTips();

        } catch (error) {
            console.error('[Weibo Manager] 初始化失败:', error);
        }
    }

    /**
     * 检测浏览器并显示兼容性提示
     */
    detectBrowserAndShowTips() {
        const userAgent = navigator.userAgent;
        const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
        const isVia = /Via/.test(userAgent);

        if (isSafari || isVia) {
            console.log('%c🐦 Safari/Via兼容性提示', 'color: #ff6b6b; font-weight: bold; font-size: 14px;');
            console.log('%c如果遇到按钮无响应问题，请运行: MobileContext.fixBrowserCompatibility()', 'color: #4ecdc4; font-size: 12px;');
            console.log('%c更多诊断信息: MobileContext.quickDiagnosis()', 'color: #45b7d1; font-size: 12px;');
        }
    }

    /**
     * 等待依赖模块加载完成
     */
    async waitForDependencies() {
        return new Promise((resolve) => {
            const checkDeps = () => {
                const contextEditorReady = window.mobileContextEditor !== undefined;
                const customAPIReady = window.mobileCustomAPIConfig !== undefined;

                if (contextEditorReady && customAPIReady) {
                    console.log('[Weibo Manager] 依赖模块已就绪');
                    resolve();
                } else {
                    console.log('[Weibo Manager] 等待依赖模块...', {
                        contextEditor: contextEditorReady,
                        customAPI: customAPIReady
                    });
                    setTimeout(checkDeps, 500);
                }
            };
            checkDeps();
        });
    }

    /**
     * 创建微博UI按钮 - 已移除浮动按钮，现在通过手机框架集成
     */
    createWeiboUI() {
        console.log('[Weibo Manager] ✅ 微博UI已集成到手机框架中');
    }

    /**
     * 显示微博控制面板
     */
    showWeiboPanel() {
        // 如果面板已存在，直接显示
        if (document.getElementById('weibo-panel-overlay')) {
            document.getElementById('weibo-panel-overlay').style.display = 'flex';
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'weibo-panel-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const panel = document.createElement('div');
        panel.id = 'weibo-control-panel';
        panel.style.cssText = `
            background: #fff;
            border-radius: 15px;
            padding: 30px;
            width: 90%;
            max-width: 500px;
            max-height: 80%;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            color: white;
        `;

        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #ff8500;">🐦 微博管理器</h2>
                <button id="close-weibo-panel" style="background: none; border: none; color: #ccc; font-size: 24px; cursor: pointer;">×</button>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 10px; color: #333;">选择微博风格:</label>
                <select id="weibo-style-select" style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #444; background: #eee; color: #333;">
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

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 10px; color: #333;">自定义前缀 (发送给模型的额外提示词):</label>
                <textarea id="weibo-custom-prefix" placeholder="在此输入自定义前缀，将添加到风格提示词前面..."
                          style="width: 100%; height: 80px; padding: 10px; border-radius: 5px; border: 1px solid #444; background: #eee; color: #333; resize: vertical; font-family: monospace; font-size: 16px;"></textarea>
                <div style="margin-top: 5px; font-size: 16px; color: #333;">
                    提示: 可以用来添加特殊指令、角色设定或生成要求
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 10px; color: #333;">消息阈值 (触发微博生成):</label>
                <input type="number" id="weibo-threshold" value="${this.currentSettings.threshold}" min="1" max="100"
                       style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #444; background: #eee; color: #333;">
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: flex; align-items: center; color: #333; cursor: pointer;">
                    <input type="checkbox" id="weibo-auto-update" ${this.currentSettings.autoUpdate ? 'checked' : ''}
                           style="margin-right: 10px;background: #fff;color: #333;">
                    自动生成微博内容
                </label>
            </div>

            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button id="generate-weibo-btn" style="flex: 1; min-width: 120px; padding: 12px; background: linear-gradient(135deg, #ff8500, #ff6600); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">🚀 生成微博</button>
                <button id="refresh-weibo-btn" style="flex: 1; min-width: 120px; padding: 12px; background: linear-gradient(135deg, #4CAF50, #45a049); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">🔄 刷新</button>
            </div>

            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
                <h4 style="margin: 0 0 10px 0; color: #495057;">📊 状态信息</h4>
                <div id="weibo-status-info" style="color: #6c757d; font-size: 14px;">
                    状态: 就绪 | 生成次数: 0 | 阈值: ${this.currentSettings.threshold}
                </div>
            </div>

            <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px;">
                <div style="color: #856404; font-size: 14px;">
                    <strong>💡 使用提示:</strong><br>
                    • 微博内容会自动添加到第一条消息中<br>
                    • 支持自动监听聊天变化并生成内容<br>
                    • 可通过阈值控制生成频率
                </div>
            </div>
        `;

        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        // 绑定事件
        this.bindPanelEvents();
    }

    /**
     * 绑定面板事件
     */
    bindPanelEvents() {
        // 关闭按钮
        document.getElementById('close-weibo-panel')?.addEventListener('click', () => {
            document.getElementById('weibo-panel-overlay').style.display = 'none';
        });

        // 点击遮罩关闭
        document.getElementById('weibo-panel-overlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'weibo-panel-overlay') {
                document.getElementById('weibo-panel-overlay').style.display = 'none';
            }
        });

        // 生成按钮
        document.getElementById('generate-weibo-btn')?.addEventListener('click', () => {
            this.generateWeiboContent();
        });

        // 刷新按钮
        document.getElementById('refresh-weibo-btn')?.addEventListener('click', () => {
            this.refreshWeiboContent();
        });

        // 设置变更
        document.getElementById('weibo-style-select')?.addEventListener('change', (e) => {
            this.currentSettings.selectedStyle = e.target.value;
            this.saveSettings();
        });

        document.getElementById('weibo-threshold')?.addEventListener('change', (e) => {
            this.currentSettings.threshold = parseInt(e.target.value);
            this.saveSettings();
        });

        document.getElementById('weibo-auto-update')?.addEventListener('change', (e) => {
            this.currentSettings.autoUpdate = e.target.checked;
            this.saveSettings();
        });

        // 设置初始值
        document.getElementById('weibo-style-select').value = this.currentSettings.selectedStyle;
    }

    /**
     * 生成微博内容
     */
    async generateWeiboContent() {
        try {
            if (this.isProcessing) {
                console.log('[Weibo Manager] 正在处理中，跳过本次请求');
                return;
            }

            this.isProcessing = true;
            this.updateGenerationStatus('正在生成微博内容...');

            // 检查API配置
            if (!window.mobileCustomAPIConfig || !window.mobileCustomAPIConfig.isAPIAvailable()) {
                throw new Error('请先配置API');
            }

            // 获取当前聊天数据
            const chatData = await this.getCurrentChatData();
            if (!chatData || !chatData.messages || chatData.messages.length === 0) {
                throw new Error('无法获取聊天数据');
            }

            // 构建上下文信息
            const contextInfo = this.buildContextInfo(chatData);

            // 获取自定义前缀
            const customPrefix = document.getElementById('weibo-custom-prefix')?.value?.trim() || '';

            // 构建提示词
            const stylePrompts = this.getStylePrompts();
            const selectedStyle = this.currentSettings.selectedStyle;
            const stylePrompt = stylePrompts[selectedStyle] || stylePrompts['微博网友'];

            console.log('📋 [微博生成] 系统提示词:');
            console.log(stylePrompt);
            console.log('\n📝 [微博生成] 聊天上下文:');
            console.log(contextInfo);

            // 构建完整的用户消息
            const userMessage = `请根据以下聊天记录生成微博内容：\n\n${contextInfo}`;
            console.log('\n📝 [微博生成] 完整用户消息:');
            console.log(userMessage);

            // 组合最终提示词
            let systemPrompt = stylePrompt;
            if (customPrefix) {
                systemPrompt = `${customPrefix}\n\n${stylePrompt}`;
            }

            // 构建API请求
            const messages = [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userMessage
                }
            ];

            console.log('📡 [微博生成] 完整API请求:');
            console.log(JSON.stringify(messages, null, 2));

            console.log('[Weibo Manager] 开始生成微博内容，风格:', selectedStyle);

            // 调用API
            const response = await window.mobileCustomAPIConfig.callAPI(messages, {
                temperature: 0.8,
                max_tokens: 2000
            });

            console.log('📥 [微博生成] 模型返回内容:');
            console.log(response);

            if (response && response.content) {
                console.log('✅ [微博生成] 生成的微博内容:');
                console.log(response.content);

                // 安全更新微博内容（带生成状态检查）
                const success = await this.updateContextWithWeibo(response.content);
                if (success) {
                    console.log('[Weibo Manager] ✅ 微博内容生成完成');
                    this.updateGenerationStatus('微博内容生成完成');

                    // 显示成功提示
                    if (window.showMobileToast) {
                        window.showMobileToast('✅ 微博内容已成功插入到第1楼层', 'success');
                    }

                    this.refreshWeiboContent(); // 刷新UI
                    return true;
                } else {
                    if (window.showMobileToast) {
                        window.showMobileToast('❌ 微博内容插入失败', 'error');
                    }
                    throw new Error('更新微博内容失败');
                }
            } else {
                throw new Error('API返回格式错误');
            }

        } catch (error) {
            console.error('[Weibo Manager] 生成微博内容时发生错误:', error);
            this.updateGenerationStatus('生成过程中发生错误');

            // 显示错误提示
            if (window.showMobileToast) {
                window.showMobileToast(`❌ 微博生成失败: ${error.message}`, 'error');
            }

            return false;
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * 获取微博风格提示词
     */
    getStylePrompts() {
        return {
            '微博网友': `请基于当前对话生成微博热搜和网友讨论内容。格式要求：

<!-- WEIBO_CONTENT_START -->
[热搜|话题标题|热度值]
[博文|博主昵称|博文ID|博文内容|点赞数|转发数|评论数]
[评论|评论者昵称|博文ID|评论内容|点赞数]
[转发|转发者昵称|博文ID|转发评论]
<!-- WEIBO_CONTENT_END -->

要求：
1. 生成3-5个相关热搜话题
2. 每个话题下生成2-3条博文
3. 每条博文生成3-5条评论
4. 内容要贴近微博用户语言风格
5. 适当添加表情符号和网络用语`,

            '娱乐博主': `请基于当前对话生成娱乐圈相关的微博内容。格式要求：

<!-- WEIBO_CONTENT_START -->
[热搜|#娱乐话题#|热度值]
[博文|娱乐博主昵称|博文ID|爆料内容|点赞数|转发数|评论数]
[评论|粉丝昵称|博文ID|粉丝评论|点赞数]
[转发|路人昵称|博文ID|吃瓜评论]
<!-- WEIBO_CONTENT_END -->

要求：
1. 内容偏向娱乐八卦风格
2. 使用娱乐圈常见词汇
3. 适当添加震惊、惊叹的语气
4. 包含粉丝互动和路人围观`,

            '时尚达人': `请基于当前对话生成时尚穿搭相关的微博内容。格式要求：

<!-- WEIBO_CONTENT_START -->
[热搜|#时尚穿搭#|热度值]
[博文|时尚博主昵称|博文ID|穿搭分享内容|点赞数|转发数|评论数]
[评论|时尚爱好者昵称|博文ID|穿搭讨论|点赞数]
[转发|种草姐妹昵称|博文ID|种草评论]
<!-- WEIBO_CONTENT_END -->

要求：
1. 内容聚焦时尚穿搭、美妆护肤
2. 使用时尚圈专业术语
3. 包含种草、拔草类评论
4. 体现时尚敏感度和审美`,

            '美食博主': `请基于当前对话生成美食相关的微博内容。格式要求：

<!-- WEIBO_CONTENT_START -->
[热搜|#美食探店#|热度值]
[博文|美食博主昵称|博文ID|美食分享内容|点赞数|转发数|评论数]
[评论|吃货昵称|博文ID|美食评价|点赞数]
[转发|美食爱好者昵称|博文ID|种草评论]
<!-- WEIBO_CONTENT_END -->

要求：
1. 内容围绕美食制作、探店体验
2. 使用诱人的美食描述词汇
3. 包含制作教程或探店攻略
4. 体现对美食的热爱和专业性`,

            '旅游博主': `请基于当前对话生成旅游相关的微博内容。格式要求：

<!-- WEIBO_CONTENT_START -->
[热搜|#旅游攻略#|热度值]
[博文|旅游博主昵称|博文ID|旅游分享内容|点赞数|转发数|评论数]
[评论|旅游爱好者昵称|博文ID|旅游讨论|点赞数]
[转发|计划出行昵称|博文ID|收藏评论]
<!-- WEIBO_CONTENT_END -->

要求：
1. 内容包含旅游攻略、风景分享
2. 使用生动的景色描述
3. 提供实用的旅游建议
4. 激发读者的旅游兴趣`,

            '科技博主': `请基于当前对话生成科技数码相关的微博内容。格式要求：

<!-- WEIBO_CONTENT_START -->
[热搜|#科技前沿#|热度值]
[博文|科技博主昵称|博文ID|科技内容|点赞数|转发数|评论数]
[评论|数码爱好者昵称|博文ID|技术讨论|点赞数]
[转发|科技迷昵称|博文ID|专业评论]
<!-- WEIBO_CONTENT_END -->

要求：
1. 内容聚焦科技趋势、数码产品
2. 使用专业的科技术语
3. 提供客观的产品评测
4. 体现技术专业性`,

            '搞笑博主': `请基于当前对话生成搞笑幽默的微博内容。格式要求：

<!-- WEIBO_CONTENT_START -->
[热搜|#搞笑日常#|热度值]
[博文|搞笑博主昵称|博文ID|搞笑内容|点赞数|转发数|评论数]
[评论|网友昵称|博文ID|搞笑回复|点赞数]
[转发|段子手昵称|博文ID|幽默评论]
<!-- WEIBO_CONTENT_END -->

要求：
1. 内容以搞笑幽默为主
2. 使用网络梗和流行段子
3. 营造轻松愉快的氛围
4. 引发用户笑点和共鸣`,

            '情感博主': `请基于当前对话生成情感类微博内容。格式要求：

<!-- WEIBO_CONTENT_START -->
[热搜|#情感话题#|热度值]
[博文|情感博主昵称|博文ID|情感内容|点赞数|转发数|评论数]
[评论|读者昵称|博文ID|情感共鸣|点赞数]
[转发|感同身受昵称|博文ID|情感回应]
<!-- WEIBO_CONTENT_END -->

要求：
1. 内容涉及情感故事、人生感悟
2. 语言温暖治愈，富有感染力
3. 引发读者情感共鸣
4. 提供正能量和人生启发`,

            '生活记录': `请基于当前对话生成日常生活记录类微博内容。格式要求：

<!-- WEIBO_CONTENT_START -->
[热搜|#生活日常#|热度值]
[博文|生活博主昵称|博文ID|生活分享|点赞数|转发数|评论数]
[评论|同城网友昵称|博文ID|生活交流|点赞数]
[转发|生活达人昵称|博文ID|生活感悟]
<!-- WEIBO_CONTENT_END -->

要求：
1. 内容贴近普通人的日常生活
2. 语言自然真实，有烟火气
3. 分享生活小确幸和日常感悟
4. 体现生活的美好和温暖`,

            '热点讨论': `请基于当前对话生成热点话题讨论类微博内容。格式要求：

<!-- WEIBO_CONTENT_START -->
[热搜|#热点话题#|热度值]
[博文|意见领袖昵称|博文ID|观点分析|点赞数|转发数|评论数]
[评论|网友昵称|博文ID|观点讨论|点赞数]
[转发|理性网友昵称|博文ID|深度思考]
<!-- WEIBO_CONTENT_END -->

要求：
1. 内容围绕社会热点话题
2. 提供多角度的观点分析
3. 引发理性讨论和思考
4. 体现社会责任感和正能量`
        };
    }

    /**
     * 调用自定义API
     */
    async callCustomAPI(prompt) {
        try {
            if (!window.mobileCustomAPIConfig) {
                throw new Error('自定义API配置模块未找到');
            }

            const apiConfig = window.mobileCustomAPIConfig.getCurrentConfig();
            console.log('[Weibo Manager] 获取到的API配置:', apiConfig);

            if (!apiConfig) {
                throw new Error('API配置为空');
            }

            // 检查配置字段（可能字段名不同）
            const hasValidConfig = (apiConfig.url || apiConfig.apiUrl || apiConfig.endpoint) &&
                                 (apiConfig.apiKey || apiConfig.key || apiConfig.token);

            if (!hasValidConfig) {
                console.log('[Weibo Manager] API配置字段检查失败，配置内容:', JSON.stringify(apiConfig, null, 2));
                throw new Error('API配置不完整，请检查URL和API密钥是否已设置');
            }

            console.log('[Weibo Manager] 开始调用自定义API...');
            console.log('[Weibo Manager] 发送给API的内容:');
            console.log('='.repeat(50));
            console.log(prompt);
            console.log('='.repeat(50));

            // 构建消息格式
            const messages = [
                {
                    role: 'user',
                    content: prompt
                }
            ];

            const success = await window.mobileCustomAPIConfig.callAPI(messages, {
                onSuccess: () => {
                    console.log('[Weibo Manager] API调用成功');
                    // 开始监控生成状态
                    this.startGenerationMonitoring();
                },
                onError: (error) => {
                    console.error('[Weibo Manager] API调用失败:', error);
                    this.updateGenerationStatus('API调用失败');
                }
            });

            return success;

        } catch (error) {
            console.error('[Weibo Manager] 调用API时发生错误:', error);
            this.updateGenerationStatus('API调用错误');
            return false;
        }
    }

    /**
     * 开始监控生成状态
     */
    startGenerationMonitoring() {
        if (this.isMonitoringGeneration) {
            console.log('[Weibo Manager] 已在监控生成状态');
            return;
        }

        this.isMonitoringGeneration = true;
        this.updateGenerationStatus('等待AI回复...');

        console.log('[Weibo Manager] 开始监控生成状态');

        // 启动状态检查
        this.generationCheckInterval = setInterval(() => {
            this.checkGenerationStatus();
        }, 1000);

        // 设置超时
        setTimeout(() => {
            if (this.isMonitoringGeneration) {
                console.warn('[Weibo Manager] 生成监控超时');
                this.stopGenerationMonitoring();
                this.updateGenerationStatus('生成超时');
            }
        }, this.maxWaitTime);
    }

    /**
     * 检查生成状态
     */
    checkGenerationStatus() {
        try {
            // 检查是否有新的AI回复
            if (window.mobileContextEditor) {
                const chatData = window.mobileContextEditor.getCurrentChatData();
                if (chatData && chatData.messages && chatData.messages.length > 0) {
                    const lastMessage = chatData.messages[chatData.messages.length - 1];

                    // 检查最后一条消息是否是AI回复且包含微博内容
                    if (lastMessage && !lastMessage.is_user && lastMessage.mes) {
                        const hasWeiboContent = lastMessage.mes.includes('<!-- WEIBO_CONTENT_START -->') &&
                                               lastMessage.mes.includes('<!-- WEIBO_CONTENT_END -->');

                        if (hasWeiboContent) {
                            console.log('[Weibo Manager] 检测到新的微博内容');
                            this.stopGenerationMonitoring();
                            this.updateGenerationStatus('生成完成，正在插入...');
                            this.waitForGenerationComplete().then(() => {
                                this.updateGenerationStatus('微博内容插入完成');
                            });
                            return;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('[Weibo Manager] 检查生成状态时出错:', error);
        }
    }

    /**
     * 停止监控生成状态
     */
    stopGenerationMonitoring() {
        this.isMonitoringGeneration = false;
        if (this.generationCheckInterval) {
            clearInterval(this.generationCheckInterval);
            this.generationCheckInterval = null;
        }
        console.log('[Weibo Manager] 停止监控生成状态');
    }

    /**
     * 等待生成完成并插入到第一层
     */
    async waitForGenerationComplete() {
        try {
            console.log('[Weibo Manager] 等待生成完成...');

            // 等待一段时间确保生成完全结束
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 获取最新的聊天数据
            if (!window.mobileContextEditor) {
                throw new Error('上下文编辑器未找到');
            }

            const chatData = window.mobileContextEditor.getCurrentChatData();
            if (!chatData || !chatData.messages || chatData.messages.length === 0) {
                throw new Error('没有找到聊天数据');
            }

            // 查找包含微博内容的最新消息
            let weiboMessage = null;
            for (let i = chatData.messages.length - 1; i >= 0; i--) {
                const message = chatData.messages[i];
                if (message && message.mes &&
                    message.mes.includes('<!-- WEIBO_CONTENT_START -->') &&
                    message.mes.includes('<!-- WEIBO_CONTENT_END -->')) {
                    weiboMessage = message;
                    break;
                }
            }

            if (!weiboMessage) {
                throw new Error('没有找到包含微博内容的消息');
            }

            console.log('[Weibo Manager] 找到微博内容，开始插入到第一层...');

            // 提取微博内容
            const weiboContent = this.extractWeiboContent(weiboMessage.mes);
            if (!weiboContent) {
                throw new Error('无法提取微博内容');
            }

            // 插入到第一层
            await this.updateContextWithWeibo(weiboContent);

            console.log('[Weibo Manager] ✅ 微博内容已成功插入到第一层');

        } catch (error) {
            console.error('[Weibo Manager] 等待生成完成时发生错误:', error);
            this.updateGenerationStatus('插入失败');
        }
    }

    /**
     * 提取微博内容
     */
    extractWeiboContent(messageContent) {
        try {
            const startMarker = '<!-- WEIBO_CONTENT_START -->';
            const endMarker = '<!-- WEIBO_CONTENT_END -->';

            const startIndex = messageContent.indexOf(startMarker);
            const endIndex = messageContent.indexOf(endMarker);

            if (startIndex === -1 || endIndex === -1) {
                console.error('[Weibo Manager] 未找到微博内容标记');
                return null;
            }

            const content = messageContent.substring(startIndex, endIndex + endMarker.length);
            console.log('[Weibo Manager] 成功提取微博内容，长度:', content.length);
            return content;

        } catch (error) {
            console.error('[Weibo Manager] 提取微博内容时发生错误:', error);
            return null;
        }
    }

    /**
     * 更新上下文中的微博内容
     */
    async updateContextWithWeibo(weiboContent) {
        try {
            console.log('[Weibo Manager] 开始在第1楼层更新微博内容...');
            console.log('[Weibo Manager] 传入的微博内容长度:', weiboContent.length);
            console.log('[Weibo Manager] 微博内容预览:', weiboContent.substring(0, 200) + '...');

            // 确保上下文编辑器可用
            if (!window.mobileContextEditor) {
                throw new Error('上下文编辑器未就绪');
            }

            // 获取当前聊天数据
            const chatData = window.mobileContextEditor.getCurrentChatData();
            if (!chatData || !chatData.messages || chatData.messages.length === 0) {
                throw new Error('无聊天数据可更新');
            }

            console.log('[Weibo Manager] 当前聊天数据状态:', {
                messageCount: chatData.messages.length,
                firstMessageExists: chatData.messages.length > 0,
                firstMessageLength: chatData.messages.length > 0 ? (chatData.messages[0].mes || '').length : 0
            });

            // 构建微博内容格式（使用特殊标记包装）
            const weiboSection = `\n\n<!-- WEIBO_CONTENT_START -->\n${weiboContent}\n<!-- WEIBO_CONTENT_END -->`;
            console.log('[Weibo Manager] 构建的微博区块长度:', weiboSection.length);

            // 检查第1楼层是否存在
            if (chatData.messages.length >= 1) {
                const firstMessage = chatData.messages[0];
                let originalContent = firstMessage.mes || '';
                console.log('[Weibo Manager] 第1楼层原始内容长度:', originalContent.length);

                // 检查是否已经包含微博内容
                const existingWeiboRegex = /<!-- WEIBO_CONTENT_START -->[\s\S]*?<!-- WEIBO_CONTENT_END -->/;
                const hasExistingWeibo = existingWeiboRegex.test(originalContent);
                console.log('[Weibo Manager] 是否已存在微博内容:', hasExistingWeibo);

                if (!hasExistingWeibo) {
                    // 如果不存在微博内容，直接追加
                    console.log('[Weibo Manager] 未检测到微博内容，直接追加');
                    const newContent = originalContent + weiboSection;
                    console.log('[Weibo Manager] 新内容总长度:', newContent.length);

                    // 更新第1楼层
                    const success = await window.mobileContextEditor.modifyMessage(0, newContent);
                    if (success) {
                        console.log('[Weibo Manager] ✅ 第1楼层追加微博内容成功');
                        this.updateGenerationStatus('微博内容更新完成');
                        return true;
                    } else {
                        throw new Error('modifyMessage返回false');
                    }
                } else {
                    // 如果已存在微博内容，替换为新内容
                    console.log('[Weibo Manager] 检测到已存在微博内容，替换为新内容');
                    console.log('[Weibo Manager] 原有内容长度:', originalContent.length);

                    // 移除原有的微博内容，保留其他内容
                    const contentWithoutWeibo = originalContent.replace(existingWeiboRegex, '').trim();
                    console.log('[Weibo Manager] 移除微博内容后长度:', contentWithoutWeibo.length);

                    // 构建新内容：原有内容 + 新的微博内容
                    const newContent = contentWithoutWeibo + weiboSection;
                    console.log('[Weibo Manager] 新内容长度:', newContent.length);
                    console.log('[Weibo Manager] 新微博内容预览:', weiboContent.substring(0, 200) + '...');

                    // 更新第1楼层
                    const success = await window.mobileContextEditor.modifyMessage(0, newContent);
                    if (success) {
                        console.log('[Weibo Manager] ✅ 第1楼层微博内容替换成功');

                        // 验证更新是否成功
                        setTimeout(async () => {
                            try {
                                const updatedChatData = window.mobileContextEditor.getCurrentChatData();
                                if (updatedChatData && updatedChatData.messages && updatedChatData.messages.length > 0) {
                                    const updatedContent = updatedChatData.messages[0].mes || '';
                                    const hasNewWeibo = updatedContent.includes('<!-- WEIBO_CONTENT_START -->') &&
                                                       updatedContent.includes('<!-- WEIBO_CONTENT_END -->');
                                    console.log('[Weibo Manager] 验证更新结果:', {
                                        hasNewWeibo,
                                        contentLength: updatedContent.length,
                                        containsNewContent: updatedContent.includes(weiboContent.substring(0, 50))
                                    });
                                }
                            } catch (error) {
                                console.error('[Weibo Manager] 验证更新失败:', error);
                            }
                        }, 1000);

                        this.updateGenerationStatus('微博内容更新完成');

                        // 强制刷新UI
                        if (window.mobileContextEditor && window.mobileContextEditor.refreshUI) {
                            setTimeout(() => {
                                try {
                                    window.mobileContextEditor.refreshUI();
                                    console.log('[Weibo Manager] UI已强制刷新');
                                } catch (error) {
                                    console.error('[Weibo Manager] UI刷新失败:', error);
                                }
                            }, 500);
                        }

                        return true;
                    } else {
                        throw new Error('modifyMessage返回false');
                    }
                }
            } else {
                // 如果没有消息，创建新消息（只包含微博内容）
                const messageIndex = await window.mobileContextEditor.addMessage(weiboSection.trim(), false, '微博系统');
                if (messageIndex >= 0) {
                    console.log('[Weibo Manager] ✅ 新增第1楼层（包含微博内容）成功');
                    this.updateGenerationStatus('微博内容更新完成');
                    return true;
                } else {
                    throw new Error('addMessage返回负数');
                }
            }

        } catch (error) {
            console.error('[Weibo Manager] 更新上下文失败:', error);
            this.updateGenerationStatus('更新失败');
            return false;
        }
    }

    /**
     * 刷新微博内容
     */
    refreshWeiboContent() {
        console.log('[Weibo Manager] 刷新微博内容');
        if (window.weiboUI) {
            window.weiboUI.refreshWeiboList();
        }
        this.updateGenerationStatus('内容已刷新');
    }

    /**
     * 更新生成状态
     */
    updateGenerationStatus(status) {
        const statusElement = document.getElementById('weibo-status-info');
        if (statusElement) {
            const timestamp = new Date().toLocaleTimeString();
            statusElement.textContent = `状态: ${status} | 时间: ${timestamp} | 阈值: ${this.currentSettings.threshold}`;
        }
        console.log(`[Weibo Manager] 状态更新: ${status}`);
    }

    /**
     * 发帖API - 供UI调用
     */
    async sendPostToAPI(postContent) {
        try {
            console.log('📝 [微博发帖API] ===== 开始发布新微博 =====');
            this.updateGenerationStatus('正在发布微博...');

            // 检查API配置
            if (!window.mobileCustomAPIConfig || !window.mobileCustomAPIConfig.isAPIAvailable()) {
                throw new Error('请先配置API');
            }

            // 获取当前聊天数据
            const chatData = await this.getCurrentChatData();
            if (!chatData || !chatData.messages || chatData.messages.length === 0) {
                throw new Error('无法获取聊天数据');
            }

            // 构建上下文信息
            const contextInfo = this.buildContextInfo(chatData);

            // 获取风格提示词
            const stylePrompts = this.getStylePrompts();
            const selectedStyle = this.currentSettings.selectedStyle;
            const stylePrompt = stylePrompts[selectedStyle] || stylePrompts['微博网友'];

            console.log('📋 [微博发帖API] 系统提示词:');
            console.log(stylePrompt);
            console.log('\n📝 [微博发帖API] 用户发布的微博:');
            console.log(postContent);
            console.log('\n📝 [微博发帖API] 完整用户消息:');
            const userMessage = `请根据以下聊天记录和用户发布的新微博，更新微博内容：\n\n${contextInfo}\n\n用户发布的新微博：${postContent}`;
            console.log(userMessage);

            // 构建API请求，包含用户的新微博
            const messages = [
                {
                    role: 'system',
                    content: stylePrompt
                },
                {
                    role: 'user',
                    content: userMessage
                }
            ];

            console.log('📡 [微博发帖API] 完整API请求:');
            console.log(JSON.stringify(messages, null, 2));

            // 调用API
            const response = await window.mobileCustomAPIConfig.callAPI(messages, {
                temperature: 0.8,
                max_tokens: 2000
            });

            console.log('📥 [微博发帖API] 模型返回内容:');
            console.log(response);

            if (response && response.content) {
                console.log('✅ [微博发帖API] 更新后的微博内容:');
                console.log(response.content);

                // 安全更新微博内容（带生成状态检查）
                const success = await this.updateContextWithWeibo(response.content);
                if (success) {
                    this.updateGenerationStatus('微博已发布并更新内容');
                    this.refreshWeiboContent(); // 刷新UI
                    console.log('🏁 [微博发帖API] ===== 新微博发布完成 =====\n');
                    return true;
                } else {
                    throw new Error('更新微博内容失败');
                }
            } else {
                throw new Error('API返回格式错误');
            }

        } catch (error) {
            console.error('❌ [微博发帖API] 发布微博失败:', error);
            console.log('🏁 [微博发帖API] ===== 新微博发布失败 =====\n');
            this.updateGenerationStatus(`发布微博失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 获取当前聊天数据
     */
    async getCurrentChatData() {
        if (!window.mobileContextEditor) {
            throw new Error('上下文编辑器未找到');
        }
        return window.mobileContextEditor.getCurrentChatData();
    }

    /**
     * 构建上下文信息
     */
    buildContextInfo(chatData) {
        try {
            if (!chatData || !chatData.messages || chatData.messages.length === 0) {
                return '无聊天记录';
            }

            // 提取最近的消息作为上下文
            const recentMessages = chatData.messages.slice(-10); // 最近10条消息
            let contextText = '';

            for (const message of recentMessages) {
                if (!message) continue;

                const role = message.is_user ? '用户' : 'AI';
                let content = message.mes || '';

                // 清理内容中的微博标记
                content = content.replace(/<!-- WEIBO_CONTENT_START -->[\s\S]*?<!-- WEIBO_CONTENT_END -->/g, '[微博内容已省略]');

                // 忽略空消息
                if (content.trim() === '') continue;

                contextText += `${role}: ${content}\n\n`;
            }

            return contextText.trim();
        } catch (error) {
            console.error('[Weibo Manager] 构建上下文信息失败:', error);
            return '构建上下文失败';
        }
    }

    /**
     * 发送回复API - 供UI调用
     */
    async sendReplyToAPI(replyContent) {
        try {
            console.log('💬 [微博回复API] ===== 开始发送用户回复 =====');
            this.updateGenerationStatus('正在发送回复...');

            // 检查API配置
            if (!window.mobileCustomAPIConfig || !window.mobileCustomAPIConfig.isAPIAvailable()) {
                throw new Error('请先配置API');
            }

            // 获取当前聊天数据
            const chatData = await this.getCurrentChatData();
            if (!chatData || !chatData.messages || chatData.messages.length === 0) {
                throw new Error('无法获取聊天数据');
            }

            // 构建上下文信息
            const contextInfo = this.buildContextInfo(chatData);

            // 获取风格提示词
            const stylePrompts = this.getStylePrompts();
            const selectedStyle = this.currentSettings.selectedStyle;
            const stylePrompt = stylePrompts[selectedStyle] || stylePrompts['微博网友'];

            console.log('📋 [微博回复API] 系统提示词:');
            console.log(stylePrompt);
            console.log('\n💭 [微博回复API] 用户回复内容:');
            console.log(replyContent);
            console.log('\n📝 [微博回复API] 完整用户消息:');
            const userMessage = `请根据以下聊天记录和用户回复，更新微博内容：\n\n${contextInfo}\n\n用户回复：${replyContent}`;
            console.log(userMessage);

            // 构建API请求，包含用户的回复
            const messages = [
                {
                    role: 'system',
                    content: stylePrompt
                },
                {
                    role: 'user',
                    content: userMessage
                }
            ];

            console.log('📡 [微博回复API] 完整API请求:');
            console.log(JSON.stringify(messages, null, 2));

            // 调用API
            const response = await window.mobileCustomAPIConfig.callAPI(messages, {
                temperature: 0.8,
                max_tokens: 2000
            });

            console.log('📥 [微博回复API] 模型返回内容:');
            console.log(response);

            if (response && response.content) {
                console.log('✅ [微博回复API] 更新后的微博内容:');
                console.log(response.content);

                // 安全更新微博内容（带生成状态检查）
                const success = await this.updateContextWithWeibo(response.content);
                if (success) {
                    this.updateGenerationStatus('回复已发送并更新微博内容');
                    this.refreshWeiboContent(); // 刷新UI
                    console.log('🏁 [微博回复API] ===== 用户回复处理完成 =====\n');
                    return true;
                } else {
                    throw new Error('更新微博内容失败');
                }
            } else {
                throw new Error('API返回格式错误');
            }

        } catch (error) {
            console.error('❌ [微博回复API] 发送回复失败:', error);
            console.log('🏁 [微博回复API] ===== 用户回复处理失败 =====\n');
            this.updateGenerationStatus(`发送回复失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 插入回复到第一层 - 供UI调用
     */
    async insertReplyToFirstLayer(prefix, replyFormat) {
        try {
            console.log('[Weibo Manager] 插入回复到第一层:', { prefix, replyFormat });

            // 确保上下文编辑器可用
            if (!window.mobileContextEditor) {
                throw new Error('上下文编辑器未就绪');
            }

            // 获取当前聊天数据
            const chatData = window.mobileContextEditor.getCurrentChatData();
            if (!chatData || !chatData.messages || chatData.messages.length === 0) {
                throw new Error('无聊天数据可更新');
            }

            // 构建完整的回复内容，包含微博格式
            const weiboSection = `\n\n<!-- WEIBO_CONTENT_START -->\n${replyFormat}\n<!-- WEIBO_CONTENT_END -->`;

            // 检查第1楼层是否存在
            if (chatData.messages.length >= 1) {
                const firstMessage = chatData.messages[0];
                let originalContent = firstMessage.mes || '';

                // 检查是否已经包含微博内容
                const existingWeiboRegex = /<!-- WEIBO_CONTENT_START -->[\s\S]*?<!-- WEIBO_CONTENT_END -->/;

                if (!existingWeiboRegex.test(originalContent)) {
                    // 如果不存在微博内容，直接追加
                    console.log('[Weibo Manager] 未检测到微博内容，直接追加');
                    const newContent = originalContent + weiboSection;

                    // 更新第1楼层
                    const success = await window.mobileContextEditor.modifyMessage(0, newContent);
                    if (success) {
                        console.log('[Weibo Manager] ✅ 回复已插入到第一层');
                        return true;
                    } else {
                        throw new Error('modifyMessage返回false');
                    }
                } else {
                    // 如果已存在微博内容，替换为新内容
                    console.log('[Weibo Manager] 检测到已存在微博内容，替换为新内容');
                    console.log('[Weibo Manager] 原有内容长度:', originalContent.length);

                    // 移除原有的微博内容，保留其他内容
                    const contentWithoutWeibo = originalContent.replace(existingWeiboRegex, '').trim();
                    console.log('[Weibo Manager] 移除微博内容后长度:', contentWithoutWeibo.length);

                    // 构建新内容：原有内容 + 新的微博内容
                    const newContent = contentWithoutWeibo + weiboSection;
                    console.log('[Weibo Manager] 新内容长度:', newContent.length);
                    console.log('[Weibo Manager] 新回复内容预览:', replyFormat.substring(0, 200) + '...');

                    // 更新第1楼层
                    const success = await window.mobileContextEditor.modifyMessage(0, newContent);
                    if (success) {
                        console.log('[Weibo Manager] ✅ 回复已替换到第一层');
                        return true;
                    } else {
                        throw new Error('modifyMessage返回false');
                    }
                }
            } else {
                // 如果没有消息，创建新消息（只包含微博内容）
                const messageIndex = await window.mobileContextEditor.addMessage(weiboSection.trim(), false, '微博系统');
                if (messageIndex >= 0) {
                    console.log('[Weibo Manager] ✅ 新增第1楼层（包含回复内容）成功');
                    return true;
                } else {
                    throw new Error('addMessage返回负数');
                }
            }

        } catch (error) {
            console.error('[Weibo Manager] 插入回复失败:', error);
            throw error;
        }
    }

    /**
     * 清除微博内容
     */
    async clearWeiboContent() {
        try {
            console.log('[Weibo Manager] 开始清除微博内容...');

            // 确保上下文编辑器可用
            if (!window.mobileContextEditor) {
                throw new Error('上下文编辑器未就绪');
            }

            // 获取当前聊天数据
            const chatData = window.mobileContextEditor.getCurrentChatData();
            if (!chatData || !chatData.messages || chatData.messages.length === 0) {
                throw new Error('无聊天数据可清除');
            }

            // 检查第1楼层是否存在
            if (chatData.messages.length >= 1) {
                const firstMessage = chatData.messages[0];
                let originalContent = firstMessage.mes || '';

                // 检查是否包含微博内容
                const weiboRegex = /<!-- WEIBO_CONTENT_START -->[\s\S]*?<!-- WEIBO_CONTENT_END -->/g;

                if (weiboRegex.test(originalContent)) {
                    // 移除微博内容，保留其他内容
                    const cleanedContent = originalContent.replace(weiboRegex, '').trim();

                    // 更新第1楼层
                    const success = await window.mobileContextEditor.modifyMessage(0, cleanedContent);
                    if (success) {
                        console.log('[Weibo Manager] ✅ 微博内容清除成功');
                        this.updateGenerationStatus('微博内容已清除');

                        // 显示成功提示
                        if (window.showMobileToast) {
                            window.showMobileToast('✅ 微博内容已清除', 'success');
                        }

                        return true;
                    } else {
                        throw new Error('modifyMessage返回false');
                    }
                } else {
                    console.log('[Weibo Manager] 第1楼层不包含微博内容，无需清除');
                    this.updateGenerationStatus('无需清除微博内容');

                    if (window.showMobileToast) {
                        window.showMobileToast('ℹ️ 第1楼层不包含微博内容', 'info');
                    }

                    return true;
                }
            } else {
                console.log('[Weibo Manager] 没有第1楼层，无需清除');
                this.updateGenerationStatus('无内容可清除');
                return true;
            }

        } catch (error) {
            console.error('[Weibo Manager] 清除微博内容失败:', error);
            this.updateGenerationStatus('清除失败');

            // 显示错误提示
            if (window.showMobileToast) {
                window.showMobileToast(`❌ 清除失败: ${error.message}`, 'error');
            }

            return false;
        }
    }

    /**
     * 注册控制台命令
     */
    registerConsoleCommands() {
        window.WeiboManager = this;

        console.log('%c🐦 微博管理器控制台命令已注册', 'color: #ff8500; font-weight: bold; font-size: 16px;');
        console.log('%c使用 WeiboManager.generateWeiboContent() 生成微博内容', 'color: #4CAF50; font-size: 14px;');
        console.log('%c使用 WeiboManager.showWeiboPanel() 显示控制面板', 'color: #2196F3; font-size: 14px;');
        console.log('%c使用 WeiboManager.testWeiboUpdate() 测试微博内容更新', 'color: #FF9800; font-size: 14px;');
        console.log('%c使用 WeiboManager.checkFirstLayerStatus() 检查第1楼层状态', 'color: #9C27B0; font-size: 14px;');
    }

    /**
     * 测试微博内容更新
     */
    async testWeiboUpdate() {
        try {
            console.log('🧪 [微博测试] 开始测试微博内容更新...');

            // 生成测试微博内容
            const testWeiboContent = `[热搜|#测试话题#|999万]
[博文|测试博主|123456|这是一条测试微博内容，用于验证更新功能是否正常工作|100|50|25]
[评论|测试用户1|123456|测试评论1|10]
[评论|测试用户2|123456|测试评论2|5]
[转发|转发用户|123456|测试转发评论]`;

            console.log('🧪 [微博测试] 测试内容:', testWeiboContent);

            // 调用更新方法
            const result = await this.updateContextWithWeibo(testWeiboContent);

            console.log('🧪 [微博测试] 更新结果:', result);

            if (result) {
                console.log('✅ [微博测试] 测试成功！');
            } else {
                console.log('❌ [微博测试] 测试失败！');
            }

            return result;
        } catch (error) {
            console.error('❌ [微博测试] 测试过程中发生错误:', error);
            return false;
        }
    }

    /**
     * 检查第1楼层内容状态
     */
    checkFirstLayerStatus() {
        try {
            console.log('🔍 [状态检查] 检查第1楼层内容状态...');

            if (!window.mobileContextEditor) {
                console.error('❌ [状态检查] 上下文编辑器未找到');
                return null;
            }

            const chatData = window.mobileContextEditor.getCurrentChatData();
            if (!chatData || !chatData.messages || chatData.messages.length === 0) {
                console.log('ℹ️ [状态检查] 没有聊天数据');
                return null;
            }

            const firstMessage = chatData.messages[0];
            const content = firstMessage.mes || '';

            const status = {
                messageCount: chatData.messages.length,
                firstMessageLength: content.length,
                hasWeiboContent: content.includes('<!-- WEIBO_CONTENT_START -->') && content.includes('<!-- WEIBO_CONTENT_END -->'),
                weiboStartIndex: content.indexOf('<!-- WEIBO_CONTENT_START -->'),
                weiboEndIndex: content.indexOf('<!-- WEIBO_CONTENT_END -->'),
                contentPreview: content.substring(0, 200) + '...'
            };

            console.log('📊 [状态检查] 第1楼层状态:', status);

            if (status.hasWeiboContent) {
                const weiboMatch = content.match(/<!-- WEIBO_CONTENT_START -->([\s\S]*?)<!-- WEIBO_CONTENT_END -->/);
                if (weiboMatch) {
                    console.log('📝 [状态检查] 当前微博内容:', weiboMatch[1].substring(0, 200) + '...');
                }
            }

            return status;
        } catch (error) {
            console.error('❌ [状态检查] 检查状态时发生错误:', error);
            return null;
        }
    }

    /**
     * 加载设置
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('weiboManagerSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.currentSettings = { ...this.currentSettings, ...settings };
                console.log('[Weibo Manager] 设置已加载:', this.currentSettings);
            }
        } catch (error) {
            console.error('[Weibo Manager] 加载设置失败:', error);
        }
    }

    /**
     * 保存设置
     */
    saveSettings() {
        try {
            localStorage.setItem('weiboManagerSettings', JSON.stringify(this.currentSettings));
            console.log('[Weibo Manager] 设置已保存');
        } catch (error) {
            console.error('[Weibo Manager] 保存设置失败:', error);
        }
    }

    /**
     * 获取设置
     */
    getSettings() {
        return { ...this.currentSettings };
    }

    /**
     * 设置阈值
     */
    setThreshold(threshold) {
        this.currentSettings.threshold = threshold;
        this.saveSettings();
        console.log('[Weibo Manager] 阈值已设置为:', threshold);
    }

    /**
     * 设置自动更新
     */
    setAutoUpdate(enabled) {
        this.currentSettings.autoUpdate = enabled;
        this.saveSettings();
        console.log('[Weibo Manager] 自动更新已设置为:', enabled);
    }

    /**
     * 获取处理状态
     */
    isCurrentlyProcessing() {
        return this.isProcessing;
    }
}

// 创建全局实例
window.WeiboManager = WeiboManager;
window.weiboManager = new WeiboManager();

// 智能初始化：检查DOM状态，决定立即初始化还是等待
function initializeWeiboManager() {
    if (window.weiboManager && !window.weiboManager.isInitialized) {
        console.log('[Weibo Manager] 开始初始化微博管理器...');
        window.weiboManager.initialize();
    }
}

// 如果DOM已经加载完成，立即初始化；否则等待DOMContentLoaded
if (document.readyState === 'loading') {
    console.log('[Weibo Manager] DOM正在加载，等待DOMContentLoaded事件');
    document.addEventListener('DOMContentLoaded', initializeWeiboManager);
} else {
    console.log('[Weibo Manager] DOM已加载完成，立即初始化');
    // 使用setTimeout确保模块完全加载后再初始化
    setTimeout(initializeWeiboManager, 0);
}

console.log('[Weibo Manager] 微博管理器模块加载完成');
