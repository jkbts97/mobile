/**
 * Message App - 信息应用
 * 为mobile-phone.js提供消息功能
 */

// 延迟加载SillyTavern的事件系统
let eventSource, event_types, chat, characters, this_chid, name1, name2;
let sillyTavernImportAttempted = false;

// 尝试导入SillyTavern的核心模块
async function importSillyTavernModules() {
    if (sillyTavernImportAttempted) {
        return;
    }
    sillyTavernImportAttempted = true;

    console.log('[Message App] 🔍 开始导入SillyTavern模块...');

    // 详细检查全局对象中的可用变量
    console.log('[Message App] 🔍 检查全局对象中的变量:');
    console.log('  - window.eventSource:', typeof window['eventSource'], window['eventSource']);
    console.log('  - window.event_types:', typeof window['event_types'], window['event_types']);
    console.log('  - window.chat:', typeof window['chat'], !!window['chat']);
    console.log('  - window.characters:', typeof window['characters'], !!window['characters']);

    // 检查一些可能的其他变量名
    console.log('[Message App] 🔍 检查可能的其他变量名:');
    console.log('  - window.SillyTavern:', typeof window['SillyTavern'], !!window['SillyTavern']);
    console.log('  - window.ST:', typeof window['ST'], !!window['ST']);
    console.log('  - window.main_api:', typeof window['main_api'], !!window['main_api']);

    // 检查所有以 event 开头的属性
    const eventProps = Object.keys(window).filter(key => key.toLowerCase().includes('event'));
    console.log('[Message App] 🔍 所有包含"event"的全局属性:', eventProps);

    try {
        // 首先尝试从全局对象获取
        eventSource = window['eventSource'];
        event_types = window['event_types'];
        chat = window['chat'];
        characters = window['characters'];
        this_chid = window['this_chid'];
        name1 = window['name1'];
        name2 = window['name2'];

        console.log('[Message App] 🔍 从全局对象获取结果:');
        console.log('  - eventSource:', !!eventSource, typeof eventSource);
        console.log('  - event_types:', !!event_types, typeof event_types);
        console.log('  - chat:', !!chat, Array.isArray(chat) ? `array(${chat.length})` : typeof chat);

        if (eventSource && event_types) {
            console.log('[Message App] ✅ 成功从全局对象获取SillyTavern模块');
            return;
        }
    } catch (error) {
        console.warn('[Message App] 无法从全局对象获取SillyTavern模块:', error);
    }

    try {
        // @ts-ignore - 动态导入可能失败，这里进行安全处理
        const scriptModule = await import('../../../script.js').catch(() => null);
        if (scriptModule) {
            console.log('[Message App] 🔍 动态导入模块内容:', Object.keys(scriptModule));
            ({ eventSource, event_types, chat, characters, this_chid, name1, name2 } = scriptModule);
            console.log('[Message App] ✅ 成功通过动态导入获取SillyTavern模块');
            console.log('  - eventSource:', !!eventSource, typeof eventSource);
            console.log('  - event_types:', !!event_types, typeof event_types);
        } else {
            console.warn('[Message App] 动态导入返回null');
        }
    } catch (error) {
        console.warn('[Message App] 无法通过动态导入获取SillyTavern模块:', error);
    }

    // 最终状态检查
    console.log('[Message App] 🔍 最终导入状态:');
    console.log('  - eventSource:', !!eventSource, eventSource?.constructor?.name);
    console.log('  - event_types:', !!event_types, event_types ? Object.keys(event_types).length + ' events' : 'null');
}

// 避免重复定义
if (typeof window.MessageApp === 'undefined') {

class MessageApp {
    constructor() {
        this.currentView = 'list'; // 'list', 'addFriend', 'messageDetail'
        this.currentTab = 'add'; // 'add', 'delete', 'createGroup', 'deleteGroup'
        this.friendRenderer = null;
        this.currentFriendId = null;
        this.currentFriendName = null;
        this.currentIsGroup = null; // 当前聊天是否为群聊
        this.currentSelectedFriend = null; // 当前选中的好友，用于发送消息

        // 实时监控相关
        this.realtimeMonitor = null;
        this.lastMessageCount = 0;
        this.lastMessageId = null;
        this.isAutoRenderEnabled = true;
        this.lastRenderTime = 0;
        this.renderCooldown = 1000; // 渲染冷却时间，避免过于频繁

        // 实时同步器集成
        this.realTimeSync = null;
        this.syncEnabled = true;

        // 增量渲染相关
        this.incrementalRenderer = null;
        this.useIncrementalRender = true; // 默认启用增量渲染
        this.fullRenderMode = false; // 是否使用全量渲染模式

        this.init();
    }

    init() {
        console.log('[Message App] 信息应用初始化开始');

        // 立即绑定事件（包括返回按钮）
        this.bindEvents();

        // 使用异步初始化，避免阻塞界面渲染
        setTimeout(() => {
            this.loadFriendRenderer();
        }, 50);

        setTimeout(() => {
            this.setupIncrementalRenderer();
        }, 100);

        setTimeout(() => {
            this.setupRealtimeMonitor();
        }, 150);

        console.log('[Message App] 信息应用初始化完成');

        // 延迟集成实时同步器
        setTimeout(() => {
            this.integrateRealTimeSync();
        }, 2000);
    }

        // 设置增量渲染器
    setupIncrementalRenderer() {
        console.log('[Message App] 设置增量渲染器...');

        // 延迟创建增量渲染器，确保依赖已加载
        setTimeout(() => {
            this.createIncrementalRenderer();
        }, 500);
    }

    // 创建增量渲染器
    createIncrementalRenderer() {
        try {
            // @ts-ignore - 使用类型断言访问全局对象
            if (window['IncrementalRenderer']) {
                // @ts-ignore - 使用类型断言创建实例
                this.incrementalRenderer = new window['IncrementalRenderer']();

                // 监听增量更新事件
                window.addEventListener('incrementalRenderUpdate', (event) => {
                    // @ts-ignore - 事件类型断言
                    this.handleIncrementalUpdate(event.detail);
                });

                console.log('[Message App] ✅ 增量渲染器已创建');
            } else {
                console.log('[Message App] IncrementalRenderer 暂不可用，将稍后重试');
                this.useIncrementalRender = false;
            }
        } catch (error) {
            console.warn('[Message App] 创建增量渲染器失败:', error);
            this.useIncrementalRender = false;
        }
    }

    // 处理增量更新
    handleIncrementalUpdate(detail) {
        console.log('[Message App] 收到增量更新:', detail);

        if (!this.useIncrementalRender) {
            return;
        }

        // 支持两种数据格式：旧的detail格式和新的SillyTavern事件格式
        if (detail.eventType && detail.chatData) {
            // 新格式：来自SillyTavern事件
            console.log('[Message App] 处理SillyTavern事件格式的增量更新');

            // 如果有增量渲染器，让它处理新消息
            if (this.incrementalRenderer && detail.chatData.messages) {
                try {
                    // 将SillyTavern的消息格式传递给增量渲染器
                    this.incrementalRenderer.processNewMessages(detail.chatData.messages);
                } catch (error) {
                    console.error('[Message App] 增量渲染器处理失败:', error);
                }
            }

            // 更新界面
            this.updateMessageListIncrementally();
        } else {
            // 旧格式：兼容性处理
            console.log('[Message App] 处理传统格式的增量更新');
            this.updateMessageListIncrementally();
        }
    }

    // 增量更新消息列表
    updateMessageListIncrementally() {
        try {
            console.log('[Message App] 🔄 开始增量更新消息列表...');

            // 如果当前不在消息列表页面，跳过更新
            if (this.currentView !== 'list') {
                console.log('[Message App] 当前不在消息列表页面，跳过更新');
                return;
            }

            // 获取消息列表容器
            const messageListContainer = document.querySelector('.message-list');
            if (!messageListContainer) {
                console.warn('[Message App] 找不到消息列表容器');
                return;
            }

            // 重新渲染整个好友列表
            this.refreshFriendListUI();

            console.log('[Message App] ✅ 消息列表已增量更新');
        } catch (error) {
            console.error('[Message App] 增量更新消息列表失败:', error);
        }
    }

    // 刷新好友列表UI
    refreshFriendListUI() {
        try {
            console.log('[Message App] 🔄 刷新好友列表UI...');

            // 获取消息列表容器
            const messageListContainer = document.querySelector('.message-list');
            if (!messageListContainer) {
                console.warn('[Message App] 找不到消息列表容器');
                return;
            }

            // 检查好友渲染器是否可用
            if (typeof window.renderFriendsFromContext !== 'function') {
                console.warn('[Message App] 好友渲染器不可用，尝试重新加载...');
                this.loadFriendRenderer();
                return;
            }

            // 重新渲染好友列表
            const friendsHTML = window.renderFriendsFromContext();
            messageListContainer.innerHTML = friendsHTML;

            // 重新绑定事件
            this.bindMessageListEvents();

            console.log('[Message App] ✅ 好友列表UI已刷新');
        } catch (error) {
            console.error('[Message App] 刷新好友列表UI失败:', error);
        }
    }

    // 更新项目未读计数
    updateItemUnreadCount(item) {
        try {
            const unreadElement = item.querySelector('.unread-count');
            if (unreadElement) {
                // 这里可以添加实际的未读计数逻辑
                // 暂时保持现有显示
            }
        } catch (error) {
            console.error('[Message App] 更新未读计数失败:', error);
        }
    }

    // 更新项目时间显示
    updateItemTimeDisplay(item) {
        try {
            const timeElement = item.querySelector('.time');
            if (timeElement) {
                // 更新为当前时间
                timeElement.textContent = new Date().toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        } catch (error) {
            console.error('[Message App] 更新时间显示失败:', error);
        }
    }

    // 设置实时监控
    setupRealtimeMonitor() {
        console.log('[Message App] 设置SillyTavern原生事件监控...');

        // 使用SillyTavern的原生事件系统
        this.setupSillyTavernEventListeners();
    }

    // 集成实时同步器
    integrateRealTimeSync() {
        try {
            console.log('[Message App] 🔗 集成实时同步器...');

            // 初始化重试计数器
            if (!this.syncRetryCount) {
                this.syncRetryCount = 0;
            }

            // 检查实时同步器是否可用
            if (!window.realTimeSync) {
                this.syncRetryCount++;

                if (this.syncRetryCount <= 3) { // 最多重试3次
                    console.warn(`[Message App] 实时同步器不可用，第${this.syncRetryCount}次重试...`);

                    // 尝试动态加载实时同步器
                    this.loadRealTimeSyncModule();

                    setTimeout(() => {
                        this.integrateRealTimeSync();
                    }, 3000);
                } else {
                    console.error('[Message App] ❌ 实时同步器加载失败，已达到最大重试次数');
                    this.setupFallbackSync(); // 启用备用同步机制
                }
                return;
            }

            // 重置重试计数器
            this.syncRetryCount = 0;

            // @ts-ignore - 实时同步器类型声明
            this.realTimeSync = window.realTimeSync;

            // 监听实时同步事件
            window.addEventListener('realTimeSyncUpdate', (event) => {
                // @ts-ignore - 事件类型声明
                this.handleRealTimeSyncUpdate(event.detail);
            });

            console.log('[Message App] ✅ 实时同步器集成完成');
        } catch (error) {
            console.error('[Message App] 集成实时同步器失败:', error);
        }
    }

    // 动态加载实时同步器模块
    loadRealTimeSyncModule() {
        try {
            console.log('[Message App] 🔄 尝试动态加载实时同步器...');

            // 检查脚本是否已经存在
            const existingScript = document.querySelector('script[src*="real-time-sync.js"]');
            if (existingScript) {
                console.log('[Message App] 实时同步器脚本已存在');
                return;
            }

            // 创建脚本标签
            const script = document.createElement('script');
            script.src = 'scripts/extensions/third-party/mobile/app/real-time-sync.js';
            script.onload = () => {
                console.log('[Message App] ✅ 实时同步器脚本加载完成');
            };
            script.onerror = (error) => {
                console.error('[Message App] ❌ 实时同步器脚本加载失败:', error);
            };

            document.head.appendChild(script);
        } catch (error) {
            console.error('[Message App] 动态加载实时同步器失败:', error);
        }
    }

    // 设置备用同步机制
    setupFallbackSync() {
        try {
            console.log('[Message App] 🔄 启动备用同步机制...');

            // 使用简单的轮询机制
            if (this.fallbackSyncTimer) {
                clearInterval(this.fallbackSyncTimer);
            }

            this.fallbackSyncTimer = setInterval(() => {
                this.performFallbackSync();
            }, 5000); // 5秒轮询

            console.log('[Message App] ✅ 备用同步机制已启动');
        } catch (error) {
            console.error('[Message App] 备用同步机制启动失败:', error);
        }
    }

    // 执行备用同步
    async performFallbackSync() {
        try {
            // 只在消息列表页面执行同步
            if (this.currentView !== 'list') {
                return;
            }

            // 检查上下文是否有变化
            if (window.contextMonitor) {
                // @ts-ignore - 上下文监控器类型声明
                const chatData = await window.contextMonitor.getCurrentChatMessages();
                if (chatData && chatData.totalMessages !== this.lastMessageCount) {
                    console.log('[Message App] 🔄 备用同步检测到消息变化，刷新列表');
                    this.updateMessageListIncrementally();
                    this.lastMessageCount = chatData.totalMessages;
                }
            }
        } catch (error) {
            console.error('[Message App] 备用同步执行失败:', error);
        }
    }

    // 处理实时同步更新
    handleRealTimeSyncUpdate(detail) {
        try {
            console.log('[Message App] 📡 收到实时同步更新:', detail);

            if (!this.syncEnabled) {
                return;
            }

            // 根据当前视图决定如何处理更新
            if (this.currentView === 'list') {
                // 在消息列表视图中，更新好友列表
                this.handleFriendListUpdate(detail);
            } else if (this.currentView === 'messageDetail') {
                // 在消息详情视图中，更新消息内容
                this.handleMessageDetailUpdate(detail);
            }

        } catch (error) {
            console.error('[Message App] 处理实时同步更新失败:', error);
        }
    }

    // 处理好友列表更新
    handleFriendListUpdate(detail) {
        try {
            console.log('[Message App] 👥 处理好友列表更新:', detail);

            // 检查是否有新的好友或消息
            if (detail.hasNewFriends || detail.hasNewMessages) {
                console.log('[Message App] 🔄 检测到新好友或消息，刷新好友列表');

                // 强制刷新好友列表UI
                this.refreshFriendListUI();
            } else {
                console.log('[Message App] 🔄 执行轻量级更新');

                // 只更新时间和计数等轻量级信息
                this.updateExistingItemsOnly();
            }
        } catch (error) {
            console.error('[Message App] 处理好友列表更新失败:', error);
        }
    }

    // 只更新现有项目的信息
    updateExistingItemsOnly() {
        try {
            const messageItems = document.querySelectorAll('.message-item');

            messageItems.forEach(item => {
                // 更新未读计数显示
                this.updateItemUnreadCount(item);

                // 更新时间显示
                this.updateItemTimeDisplay(item);
            });

            console.log('[Message App] ✅ 现有项目已更新');
        } catch (error) {
            console.error('[Message App] 更新现有项目失败:', error);
        }
    }

    // 处理消息详情更新
    handleMessageDetailUpdate(detail) {
        try {
            if (detail.hasNewMessages) {
                console.log('[Message App] 💬 更新消息详情');

                // 刷新消息详情页面
                this.refreshMessageDetail();
            }
        } catch (error) {
            console.error('[Message App] 处理消息详情更新失败:', error);
        }
    }

    // 启用/禁用实时同步
    setSyncEnabled(enabled) {
        this.syncEnabled = enabled;
        console.log(`[Message App] 实时同步 ${enabled ? '启用' : '禁用'}`);
    }

    // 获取实时同步状态
    getRealTimeSyncStatus() {
        return {
            syncEnabled: this.syncEnabled,
            hasRealTimeSync: !!this.realTimeSync,
            realTimeSyncStatus: this.realTimeSync ? this.realTimeSync.getSyncStatus() : null
        };
    }

    // 设置SillyTavern事件监听器
    async setupSillyTavernEventListeners() {
        try {
            // 首先尝试导入SillyTavern模块
            await importSillyTavernModules();

            // 更智能的事件系统检测
            const detectionResult = this.smartDetectEventSystem();
            if (detectionResult.found) {
                console.log('[Message App] ✅ 智能检测找到事件系统:', detectionResult);
                // @ts-ignore - 智能检测返回的结果包含eventSource和event_types
                eventSource = detectionResult.eventSource;
                // @ts-ignore - 智能检测返回的结果包含eventSource和event_types
                event_types = detectionResult.event_types;
            }

            // 检查SillyTavern是否已加载
            if (!eventSource || !event_types) {
                console.warn('[Message App] SillyTavern事件系统未准备就绪，延迟监听...');

                // 增加检测次数限制，避免无限循环
                if (!this.retryCount) this.retryCount = 0;
                this.retryCount++;

                if (this.retryCount <= 5) { // 减少重试次数
                    console.log(`[Message App] 重试次数: ${this.retryCount}/5`);
                    setTimeout(() => {
                        this.setupSillyTavernEventListeners();
                    }, 1000 + (this.retryCount * 200)); // 减少延迟
                } else {
                    console.error('[Message App] 达到最大重试次数，切换到轮询模式');
                    this.fallbackToPolling();
                }
                return;
            }

            // 重置重试计数
            this.retryCount = 0;

            // 监听消息接收事件
            eventSource.on(event_types.MESSAGE_RECEIVED, (messageId) => {
                console.log('[Message App] 🔥 监听到MESSAGE_RECEIVED事件:', messageId);
                this.handleSillyTavernMessage('received', messageId);
            });

            // 监听角色消息渲染完成事件
            eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, (messageId) => {
                console.log('[Message App] 🎨 监听到CHARACTER_MESSAGE_RENDERED事件:', messageId);
                this.handleSillyTavernMessage('character_rendered', messageId);
            });

            // 监听用户消息渲染完成事件
            eventSource.on(event_types.USER_MESSAGE_RENDERED, (messageId) => {
                console.log('[Message App] 👤 监听到USER_MESSAGE_RENDERED事件:', messageId);
                this.handleSillyTavernMessage('user_rendered', messageId);
            });

            // 监听消息发送事件
            eventSource.on(event_types.MESSAGE_SENT, (messageId) => {
                console.log('[Message App] 📤 监听到MESSAGE_SENT事件:', messageId);
                this.handleSillyTavernMessage('sent', messageId);
            });

            // 监听聊天切换事件
            eventSource.on(event_types.CHAT_CHANGED, (chatId) => {
                console.log('[Message App] 🔄 监听到CHAT_CHANGED事件:', chatId);
                this.handleChatChanged(chatId);
            });

            // 监听消息编辑事件
            eventSource.on(event_types.MESSAGE_EDITED, (messageId) => {
                console.log('[Message App] ✏️ 监听到MESSAGE_EDITED事件:', messageId);
                this.handleSillyTavernMessage('edited', messageId);
            });

            // 监听消息删除事件
            eventSource.on(event_types.MESSAGE_DELETED, (messageId) => {
                console.log('[Message App] 🗑️ 监听到MESSAGE_DELETED事件:', messageId);
                this.handleSillyTavernMessage('deleted', messageId);
            });

            console.log('[Message App] ✅ SillyTavern事件监听器已设置');
            this.realtimeMonitor = {
                isRunning: true,
                type: 'sillytavern_events',
                eventSource,
                event_types
            };

        } catch (error) {
            console.error('[Message App] 设置SillyTavern事件监听器失败:', error);
            this.fallbackToPolling();
        }
    }

    // 智能检测事件系统
    smartDetectEventSystem() {
        console.log('[Message App] 🧠 开始智能检测事件系统...');

        const detectionMethods = [
            // 方法1：直接全局访问
            () => ({
                eventSource: window['eventSource'],
                event_types: window['event_types']
            }),

                        // 方法2：通过SillyTavern对象
            () => ({
                eventSource: window['SillyTavern']?.eventSource,
                event_types: window['SillyTavern']?.event_types
            }),

            // 方法3：通过ST简写
            () => ({
                eventSource: window['ST']?.eventSource,
                event_types: window['ST']?.event_types
            }),

            // 方法4：深度搜索
            () => {
                // 搜索所有可能包含eventSource的对象
                const globalKeys = Object.keys(window);
                for (const key of globalKeys) {
                    try {
                        const obj = window[key];
                        if (obj && typeof obj === 'object') {
                            if (obj.eventSource && obj.event_types) {
                                return {
                                    eventSource: obj.eventSource,
                                    event_types: obj.event_types,
                                    foundIn: key
                                };
                            }
                        }
                    } catch (e) {
                        // 忽略访问错误
                    }
                }
                return null;
            },

            // 方法5：通过已知的事件发射器查找
            () => {
                // 寻找具有事件监听能力的对象
                const globalKeys = Object.keys(window);
                for (const key of globalKeys) {
                    try {
                        const obj = window[key];
                        if (obj && typeof obj === 'object' && typeof obj.on === 'function') {
                            // 尝试检查是否有事件类型
                            const possibleEventTypes = window[key + '_types'] || window[key.replace(/Source$/, '_types')];
                            if (possibleEventTypes) {
                                return {
                                    eventSource: obj,
                                    event_types: possibleEventTypes,
                                    foundIn: key
                                };
                            }
                        }
                    } catch (e) {
                        // 忽略访问错误
                    }
                }
                return null;
            }
        ];

        for (let i = 0; i < detectionMethods.length; i++) {
            try {
                const result = detectionMethods[i]();
                if (result && result.eventSource && result.event_types) {
                    console.log(`[Message App] ✅ 方法${i + 1}检测成功:`, result);
                    return {
                        found: true,
                        method: i + 1,
                        ...result
                    };
                }
            } catch (error) {
                console.warn(`[Message App] 方法${i + 1}检测失败:`, error);
            }
        }

        console.warn('[Message App] ❌ 所有检测方法都失败了');
        return { found: false };
    }

    // 处理SillyTavern消息事件
    handleSillyTavernMessage(eventType, messageId) {
        if (!this.isAutoRenderEnabled) {
            return;
        }

        // 防抖处理 - 对群聊消息使用更短的冷却时间
        const now = Date.now();
        const cooldownTime = this.isGroupMessageEvent(eventType, messageId) ?
            Math.min(this.renderCooldown, 500) : this.renderCooldown;

        if (now - this.lastRenderTime < cooldownTime) {
            return;
        }

        this.lastRenderTime = now;

        console.log(`[Message App] 处理SillyTavern消息事件: ${eventType}, messageId: ${messageId}`);

        // 获取最新的聊天数据
        const chatData = this.getSillyTavernChatData();
        if (!chatData) {
            console.warn('[Message App] 无法获取SillyTavern聊天数据');
            return;
        }

        // 检查是否包含群聊消息
        const hasGroupMessage = this.checkForGroupMessagesInChatData(chatData);
        if (hasGroupMessage) {
            console.log('[Message App] 🔄 检测到群聊消息，强制触发实时渲染');
            // 对群聊消息使用强制全量渲染，确保实时更新
            this.forceGroupChatRender();
        }

        // 更新内部状态
        this.lastMessageCount = chatData.messages.length;
        this.lastMessageId = chatData.lastMessageId;

        // 根据渲染模式选择处理方式
        if (this.useIncrementalRender && this.incrementalRenderer && !hasGroupMessage) {
            console.log('[Message App] 使用增量渲染处理SillyTavern事件');
            this.handleIncrementalUpdate({
                eventType,
                messageId,
                chatData,
                timestamp: now
            });
        } else {
            console.log('[Message App] 使用全量渲染处理SillyTavern事件');
            this.triggerAutoRender();
        }

        // 发送自定义事件
        this.dispatchSillyTavernSyncEvent(eventType, messageId, chatData);
    }

    // 检查是否为群聊消息事件
    isGroupMessageEvent(eventType, messageId) {
        try {
            const chatData = this.getSillyTavernChatData();
            if (!chatData || !chatData.messages || chatData.messages.length === 0) {
                return false;
            }

            // 检查最近的消息是否包含群聊格式
            const recentMessages = chatData.messages.slice(-3); // 检查最近3条消息
            return recentMessages.some(message => {
                if (message.mes && typeof message.mes === 'string') {
                    return message.mes.includes('[群聊消息|') ||
                           message.mes.includes('[我方群聊消息|');
                }
                return false;
            });
        } catch (error) {
            console.error('[Message App] 检查群聊消息事件失败:', error);
            return false;
        }
    }

    // 检查聊天数据中是否包含群聊消息
    checkForGroupMessagesInChatData(chatData) {
        try {
            if (!chatData || !chatData.messages || chatData.messages.length === 0) {
                return false;
            }

            // 检查最新的几条消息
            const recentMessages = chatData.messages.slice(-5);
            const hasGroupMessages = recentMessages.some(message => {
                if (message.mes && typeof message.mes === 'string') {
                    // 检查各种群聊消息格式
                    const groupPatterns = [
                        /\[群聊消息\|[^|]+\|[^|]+\|[^|]+\|[^\]]+\]/,
                        /\[我方群聊消息\|我\|[^|]+\|[^|]+\|[^\]]+\]/,
                        /\[群聊\|[^|]+\|[^|]+\|[^\]]+\]/
                    ];

                    return groupPatterns.some(pattern => pattern.test(message.mes));
                }
                return false;
            });

            if (hasGroupMessages) {
                console.log('[Message App] 📱 在聊天数据中检测到群聊消息');
            }

            return hasGroupMessages;
        } catch (error) {
            console.error('[Message App] 检查聊天数据中的群聊消息失败:', error);
            return false;
        }
    }

    // 强制群聊渲染
    forceGroupChatRender() {
        try {
            console.log('[Message App] 🔄 执行强制群聊渲染...');

            // 1. 清除任何缓存
            if (this.incrementalRenderer) {
                this.incrementalRenderer.clearCache();
            }

            // 2. 强制刷新好友渲染器
            if (window.friendRenderer && typeof window.friendRenderer.refresh === 'function') {
                window.friendRenderer.refresh();
            }

            // 3. 根据当前视图执行对应的强制渲染
            if (this.currentView === 'list') {
                // 强制刷新消息列表
                setTimeout(() => {
                    this.forceRefreshMessageList();
                }, 100);
            } else if (this.currentView === 'messageDetail' && this.currentFriendId) {
                // 强制刷新消息详情
                setTimeout(() => {
                    this.forceRefreshMessageDetail();
                }, 100);
            }

            // 4. 重置冷却时间，允许快速更新
            this.lastRenderTime = Date.now() - this.renderCooldown;

            console.log('[Message App] ✅ 强制群聊渲染完成');
        } catch (error) {
            console.error('[Message App] 强制群聊渲染失败:', error);
        }
    }

    // 强制刷新消息列表
    forceRefreshMessageList() {
        try {
            console.log('[Message App] 🔄 强制刷新消息列表...');

            const messageList = document.getElementById('message-list');
            if (messageList && window.renderFriendsFromContext) {
                // 添加加载提示
                const loadingDiv = document.createElement('div');
                loadingDiv.className = 'group-loading-hint';
                loadingDiv.innerHTML = '🔄 更新群聊消息...';
                loadingDiv.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: #2196F3;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 15px;
                    font-size: 12px;
                    z-index: 1000;
                    animation: pulse 0.5s ease-in-out;
                `;
                messageList.appendChild(loadingDiv);

                // 获取新的HTML内容
                const newFriendsHtml = window.renderFriendsFromContext();
                messageList.innerHTML = newFriendsHtml;

                // 重新绑定事件
                this.bindMessageListEvents();

                // 移除加载提示
                setTimeout(() => {
                    if (loadingDiv.parentNode) {
                        loadingDiv.remove();
                    }
                }, 1000);

                console.log('[Message App] ✅ 消息列表强制刷新完成');
            }
        } catch (error) {
            console.error('[Message App] 强制刷新消息列表失败:', error);
        }
    }

    // 强制刷新消息详情
    forceRefreshMessageDetail() {
        try {
            console.log('[Message App] 🔄 强制刷新消息详情...');

            if (this.currentView === 'messageDetail' && this.currentFriendId) {
                // 重新加载消息详情
                this.loadMessageDetailAsync();
                console.log('[Message App] ✅ 消息详情强制刷新完成');
            }
        } catch (error) {
            console.error('[Message App] 强制刷新消息详情失败:', error);
        }
    }

    // 处理聊天切换事件
    handleChatChanged(chatId) {
        console.log('[Message App] 聊天已切换:', chatId);

        // 重置状态
        this.lastMessageCount = 0;
        this.lastMessageId = null;

        // 如果使用增量渲染，清除缓存
        if (this.incrementalRenderer) {
            this.incrementalRenderer.clearCache();
        }

        // 触发界面更新
        if (this.currentView === 'list') {
            this.triggerAutoRender();
        }
    }

    // 获取SillyTavern聊天数据
    getSillyTavernChatData() {
        try {
            if (!chat || !Array.isArray(chat)) {
                return null;
            }

            const messages = chat;
            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

            return {
                messages: messages,
                messageCount: messages.length,
                lastMessageId: lastMessage ? (lastMessage.send_date || lastMessage.id || messages.length - 1) : null,
                currentCharacter: characters && this_chid !== undefined ? characters[this_chid] : null,
                userName: name1 || 'User',
                characterName: name2 || 'Assistant'
            };
        } catch (error) {
            console.error('[Message App] 获取SillyTavern聊天数据失败:', error);
            return null;
        }
    }

    // 发送SillyTavern同步事件
    dispatchSillyTavernSyncEvent(eventType, messageId, chatData) {
        try {
            const event = new CustomEvent('messageAppSillyTavernSync', {
                detail: {
                    eventType,
                    messageId,
                    chatData,
                    timestamp: Date.now(),
                    view: this.currentView,
                    renderMode: this.useIncrementalRender ? 'incremental' : 'full'
                }
            });
            window.dispatchEvent(event);
        } catch (error) {
            console.error('[Message App] 发送SillyTavern同步事件失败:', error);
        }
    }

    // 回退到轮询模式（如果事件监听失败）
    fallbackToPolling() {
        console.warn('[Message App] 回退到轮询模式...');
        this.startSimplePolling();
    }

    // 启动实时监控
    startRealtimeMonitor() {
        // 这个方法现在由setupSillyTavernEventListeners处理
        console.log('[Message App] startRealtimeMonitor已被setupSillyTavernEventListeners替代');
    }

    // 简单轮询备选方案
    startSimplePolling() {
        console.log('[Message App] 启动简单轮询监控（备选方案）...');

        setInterval(() => {
            this.checkForNewMessages();
        }, 2000); // 降低轮询频率，因为这只是备选方案
    }

    // 检查新消息（轮询方式）
    checkForNewMessages() {
        try {
            const chatData = this.getSillyTavernChatData();
            if (!chatData) {
                return;
            }

            // 检查是否有新消息
            if (chatData.messageCount > this.lastMessageCount ||
                (chatData.lastMessageId && chatData.lastMessageId !== this.lastMessageId)) {

                console.log('[Message App] 轮询检测到新消息:', {
                    oldCount: this.lastMessageCount,
                    newCount: chatData.messageCount,
                    oldId: this.lastMessageId,
                    newId: chatData.lastMessageId
                });

                // 更新记录
                this.lastMessageCount = chatData.messageCount;
                this.lastMessageId = chatData.lastMessageId;

                // 触发处理
                this.handleSillyTavernMessage('polling_detected', chatData.messageCount - 1);
            }
        } catch (error) {
            console.error('[Message App] 轮询检查新消息失败:', error);
        }
    }

    // 获取当前消息数量
    getCurrentMessageCount() {
        try {
            if (chat && Array.isArray(chat)) {
                return chat.length;
            }

            // 尝试从SillyTavern上下文获取
            const sillyTavern = window['SillyTavern'];
            if (sillyTavern && typeof sillyTavern.getContext === 'function') {
                const context = sillyTavern.getContext();
                if (context && context.chat) {
                    return context.chat.length;
                }
            }

            return 0;
        } catch (error) {
            console.error('[Message App] 获取消息数量失败:', error);
            return 0;
        }
    }

    // 获取最后一条消息ID
    getCurrentLastMessageId() {
        try {
            if (chat && Array.isArray(chat) && chat.length > 0) {
                const lastMessage = chat[chat.length - 1];
                return lastMessage.send_date || lastMessage.id || JSON.stringify(lastMessage).substring(0, 50);
            }

            // 尝试从SillyTavern上下文获取
            const sillyTavern = window['SillyTavern'];
            if (sillyTavern && typeof sillyTavern.getContext === 'function') {
                const context = sillyTavern.getContext();
                if (context && context.chat && context.chat.length > 0) {
                    const lastMessage = context.chat[context.chat.length - 1];
                    return lastMessage.send_date || lastMessage.id || JSON.stringify(lastMessage).substring(0, 50);
                }
            }

            return null;
        } catch (error) {
            console.error('[Message App] 获取最后消息ID失败:', error);
            return null;
        }
    }

    // 处理上下文变化
    handleContextChange() {
        if (!this.isAutoRenderEnabled) {
            return;
        }

        const now = Date.now();

        // 检查渲染冷却时间
        if (now - this.lastRenderTime < this.renderCooldown) {
            return;
        }

        this.lastRenderTime = now;

        console.log('[Message App] 上下文变化，触发自动渲染...');

        // 根据渲染模式选择不同的处理方式
        if (this.useIncrementalRender && this.incrementalRenderer) {
            // 使用增量渲染（不会造成界面跳动）
            console.log('[Message App] 使用增量渲染模式');
            // 增量渲染器会自动处理新消息，这里只需要轻量级的界面更新
            this.triggerLightweightUpdate();
        } else {
            // 使用传统全量渲染
            console.log('[Message App] 使用全量渲染模式');
            this.triggerAutoRender();
        }
    }

    // 触发轻量级更新（不重新渲染，只更新状态）
    triggerLightweightUpdate() {
        try {
            console.log('[Message App] 执行轻量级更新...');

            // 1. 更新消息计数（不重新渲染列表）
            if (this.currentView === 'list') {
                this.updateMessageCountsOnly();
            }

            // 2. 如果在消息详情页面，检查是否有新消息需要追加
            if (this.currentView === 'messageDetail' && this.currentFriendId) {
                this.checkForNewMessagesInCurrentChat();
            }

            // 3. 触发轻量级事件通知
            this.dispatchLightweightRenderEvent();

            console.log('[Message App] ✅ 轻量级更新完成');
        } catch (error) {
            console.error('[Message App] 轻量级更新失败:', error);
        }
    }

    // 仅更新消息计数
    updateMessageCountsOnly() {
        try {
            const messageItems = document.querySelectorAll('.message-item');

            messageItems.forEach(item => {
                // 更新未读计数样式
                const unreadCount = item.querySelector('.unread-count');
                if (unreadCount) {
                    // 添加"有新消息"的视觉提示
                    unreadCount.classList.add('has-new-message');

                    // 3秒后移除提示
                    setTimeout(() => {
                        unreadCount.classList.remove('has-new-message');
                    }, 3000);
                }

                // 更新时间显示为"刚刚"
                const timeElement = item.querySelector('.time');
                if (timeElement) {
                    timeElement.textContent = '刚刚';
                    timeElement.classList.add('just-updated');

                    // 5秒后恢复正常时间显示
                    setTimeout(() => {
                        timeElement.classList.remove('just-updated');
                        timeElement.textContent = new Date().toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    }, 5000);
                }
            });

            console.log('[Message App] ✅ 消息计数已更新');
        } catch (error) {
            console.error('[Message App] 更新消息计数失败:', error);
        }
    }

    // 检查当前聊天的新消息
    checkForNewMessagesInCurrentChat() {
        try {
            // 这里可以添加检查当前聊天是否有新消息的逻辑
            // 如果有新消息，可以在聊天界面底部显示提示
            const messageContainer = document.querySelector('.message-detail-content');
            if (messageContainer) {
                // 添加新消息提示
                const newMessageHint = document.createElement('div');
                newMessageHint.className = 'new-message-hint';
                newMessageHint.innerHTML = '💬 有新消息';
                newMessageHint.style.cssText = `
                    position: absolute;
                    bottom: 20px;
                    right: 20px;
                    background: #2196F3;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 12px;
                    animation: fadeInOut 3s ease-in-out;
                `;

                messageContainer.appendChild(newMessageHint);

                // 3秒后自动移除
                setTimeout(() => {
                    if (newMessageHint.parentNode) {
                        newMessageHint.parentNode.removeChild(newMessageHint);
                    }
                }, 3000);
            }
        } catch (error) {
            console.error('[Message App] 检查新消息失败:', error);
        }
    }

    // 派发轻量级渲染事件
    dispatchLightweightRenderEvent() {
        try {
            const event = new CustomEvent('messageAppLightweightRender', {
                detail: {
                    timestamp: Date.now(),
                    view: this.currentView,
                    mode: 'incremental',
                    friendId: this.currentFriendId,
                    selectedFriend: this.currentSelectedFriend
                }
            });
            window.dispatchEvent(event);
        } catch (error) {
            console.error('[Message App] 派发轻量级渲染事件失败:', error);
        }
    }

    // 触发自动渲染
    async triggerAutoRender() {
        try {
            // 1. 更新好友列表渲染
            await this.updateFriendListRender();

            // 2. 如果当前在消息列表页面，刷新列表
            if (this.currentView === 'list') {
                this.refreshMessageList();
            }

            // 3. 如果当前在消息详情页面，刷新详情
            if (this.currentView === 'messageDetail' && this.currentFriendId) {
                this.refreshMessageDetail();
            }

            // 4. 触发自定义事件，通知其他组件
            this.dispatchRenderEvent();

            console.log('[Message App] ✅ 自动渲染完成');
        } catch (error) {
            console.error('[Message App] 自动渲染失败:', error);
        }
    }

    // 更新好友列表渲染
    async updateFriendListRender() {
        try {
            if (window.renderFriendsFromContext) {
                // 更新好友渲染器的数据
                if (this.friendRenderer && typeof this.friendRenderer.refresh === 'function') {
                    await this.friendRenderer.refresh();
                }
            }
        } catch (error) {
            console.error('[Message App] 更新好友列表渲染失败:', error);
        }
    }

    // 刷新消息列表
    refreshMessageList() {
        try {
            if (this.currentView === 'list') {
                const messageList = document.getElementById('message-list');
                if (messageList && window.renderFriendsFromContext) {
                    const newFriendsHtml = window.renderFriendsFromContext();
                    messageList.innerHTML = newFriendsHtml;

                    // 重新绑定事件
                    this.bindMessageListEvents();
                }
            }
        } catch (error) {
            console.error('[Message App] 刷新消息列表失败:', error);
        }
    }

    // 刷新消息详情
    refreshMessageDetail() {
        try {
            if (this.currentView === 'messageDetail' && this.currentFriendId) {
                // 重新加载消息详情
                this.loadMessageDetailAsync();
            }
        } catch (error) {
            console.error('[Message App] 刷新消息详情失败:', error);
        }
    }

    // 绑定消息列表事件
    bindMessageListEvents() {
        const messageItems = document.querySelectorAll('.message-item');
        messageItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const friendId = target && target.getAttribute ? target.getAttribute('data-friend-id') : null;
                if (friendId) {
                    this.selectFriend(friendId);
                }
            });
        });
    }

    // 派发渲染事件
    dispatchRenderEvent() {
        try {
            const event = new CustomEvent('messageAppRender', {
                detail: {
                    timestamp: Date.now(),
                    view: this.currentView,
                    friendId: this.currentFriendId,
                    selectedFriend: this.currentSelectedFriend
                }
            });
            window.dispatchEvent(event);
        } catch (error) {
            console.error('[Message App] 派发渲染事件失败:', error);
        }
    }

    // 启用/禁用自动渲染
    setAutoRenderEnabled(enabled) {
        this.isAutoRenderEnabled = enabled;
        console.log(`[Message App] 自动渲染 ${enabled ? '启用' : '禁用'}`);
    }

    // 设置渲染冷却时间
    setRenderCooldown(ms) {
        this.renderCooldown = ms;
        console.log(`[Message App] 渲染冷却时间设置为 ${ms}ms`);
    }

    // 停止实时监控
    stopRealtimeMonitor() {
        if (this.realtimeMonitor && typeof this.realtimeMonitor.stop === 'function') {
            this.realtimeMonitor.stop();
            console.log('[Message App] 实时监控已停止');
        }
    }

    // 获取监控状态
    getMonitorStatus() {
        return {
            isEnabled: this.isAutoRenderEnabled,
            hasMonitor: !!this.realtimeMonitor,
            isRunning: this.realtimeMonitor?.isRunning || false,
            lastMessageCount: this.lastMessageCount,
            lastMessageId: this.lastMessageId,
            lastRenderTime: this.lastRenderTime,
            renderCooldown: this.renderCooldown,
            // 增量渲染状态
            useIncrementalRender: this.useIncrementalRender,
            hasIncrementalRenderer: !!this.incrementalRenderer,
            incrementalStatus: this.incrementalRenderer?.getStatus() || null,
            fullRenderMode: this.fullRenderMode
        };
    }

    // 切换渲染模式
    toggleRenderMode() {
        this.useIncrementalRender = !this.useIncrementalRender;
        this.fullRenderMode = !this.useIncrementalRender;

        if (this.useIncrementalRender) {
            console.log('[Message App] 🔄 已切换到增量渲染模式（防跳动）');
            this.renderCooldown = 3000; // 增加冷却时间
        } else {
            console.log('[Message App] 🔄 已切换到全量渲染模式（实时更新）');
            this.renderCooldown = 1000; // 恢复原来的冷却时间
        }

        return this.useIncrementalRender;
    }

    // 启用增量渲染
    enableIncrementalRender() {
        this.useIncrementalRender = true;
        this.fullRenderMode = false;
        this.renderCooldown = 3000;

        if (this.incrementalRenderer) {
            this.incrementalRenderer.setEnabled(true);
        }

        console.log('[Message App] ✅ 增量渲染已启用');
    }

    // 禁用增量渲染
    disableIncrementalRender() {
        this.useIncrementalRender = false;
        this.fullRenderMode = true;
        this.renderCooldown = 1000;

        if (this.incrementalRenderer) {
            this.incrementalRenderer.setEnabled(false);
        }

        console.log('[Message App] ⚠️ 增量渲染已禁用，使用全量渲染');
    }

    // 强制全量渲染
    forceFullRender() {
        console.log('[Message App] 🔄 执行强制全量渲染...');

        // 临时禁用增量渲染
        const originalMode = this.useIncrementalRender;
        this.useIncrementalRender = false;

        // 执行全量渲染
        this.triggerAutoRender();

        // 恢复原来的模式
        setTimeout(() => {
            this.useIncrementalRender = originalMode;
        }, 1000);
    }

    // 清除增量渲染缓存
    clearIncrementalCache() {
        if (this.incrementalRenderer) {
            this.incrementalRenderer.clearCache();
            console.log('[Message App] 🗑️ 增量渲染缓存已清除');
        }
    }

    // 获取渲染性能统计
    getRenderPerformanceStats() {
        const stats = {
            renderMode: this.useIncrementalRender ? 'incremental' : 'full',
            renderCooldown: this.renderCooldown,
            lastRenderTime: this.lastRenderTime,
            renderCount: 0, // 可以添加计数器
            incrementalStats: null
        };

        if (this.incrementalRenderer) {
            stats.incrementalStats = this.incrementalRenderer.getStatus();
        }

        return stats;
    }

    // 加载好友渲染器
    async loadFriendRenderer() {
        if (window.friendRenderer) {
            this.friendRenderer = window.friendRenderer;
            console.log('[Message App] 好友渲染器已加载');
            return;
        }

        // 如果还没有加载，等待一下
        setTimeout(() => {
            // @ts-ignore - 好友渲染器类型声明
            if (window.friendRenderer) {
                // @ts-ignore - 好友渲染器类型声明
                this.friendRenderer = window.friendRenderer;
                console.log('[Message App] 好友渲染器延迟加载完成');
            } else {
                console.log('[Message App] 好友渲染器暂不可用');
            }
        }, 100);
    }

    // 获取应用内容
    getAppContent() {
        switch (this.currentView) {
            case 'list':
                return this.renderMessageList();
            case 'addFriend':
                return this.renderAddFriend();
            case 'messageDetail':
                return this.renderMessageDetail();
            default:
                return this.renderMessageList();
        }
    }

    // 渲染消息列表
    renderMessageList() {
        // 使用好友渲染器从上下文中提取好友信息
        let friendsHtml = '';

        // @ts-ignore - 好友渲染器类型声明
        if (window.renderFriendsFromContext) {
            // @ts-ignore - 好友渲染器类型声明
            friendsHtml = window.renderFriendsFromContext();
        } else {
            friendsHtml = `
                <div class="empty-state">
                    <div class="empty-icon">💬</div>
                    <div class="empty-text">暂无好友</div>
                    <div class="empty-hint">点击右上角"添加"按钮添加好友</div>
                </div>
            `;
        }

        return `
            <div class="messages-app">
                <div class="message-list" id="message-list">
                    ${friendsHtml}
                </div>
                <div class="message-list-footer">
                    <div class="current-chat-info" id="current-chat-info">
                        <div class="no-chat-selected">
                            <span class="chat-icon">💬</span>
                            <span>点击好友进入聊天</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 渲染添加好友界面
    renderAddFriend() {
        return `
            <div class="add-friend-app">
                <!-- Tab导航 -->
                <div class="tab-navigation">
                    <button class="tab-btn ${this.currentTab === 'add' ? 'active' : ''}" data-tab="add">
                        <span class="tab-icon"></span>
                        <span>添加</span>
                    </button>
                    <button class="tab-btn ${this.currentTab === 'delete' ? 'active' : ''}" data-tab="delete">
                        <span class="tab-icon"></span>
                        <span>删除</span>
                    </button>
                    <button class="tab-btn ${this.currentTab === 'createGroup' ? 'active' : ''}" data-tab="createGroup">
                        <span class="tab-icon"></span>
                        <span>创群</span>
                    </button>
                    <button class="tab-btn ${this.currentTab === 'deleteGroup' ? 'active' : ''}" data-tab="deleteGroup">
                        <span class="tab-icon"></span>
                        <span>删群</span>
                    </button>
                </div>

                <!-- Tab内容 -->
                <div class="tab-content">
                    ${this.renderCurrentTabContent()}
                </div>
            </div>
        `;
    }

    // 渲染当前tab内容
    renderCurrentTabContent() {
        switch (this.currentTab) {
            case 'add':
                return this.renderAddFriendTab();
            case 'delete':
                return this.renderDeleteFriendTab();
            case 'createGroup':
                return this.renderCreateGroupTab();
            case 'deleteGroup':
                return this.renderDeleteGroupTab();
            default:
                return this.renderAddFriendTab();
        }
    }

    // 渲染添加好友tab
    renderAddFriendTab() {
        return `
            <div class="add-friend-form">
                <div class="form-group">
                    <label for="friend-name">好友名称</label>
                    <input type="text" id="friend-name" class="form-input" placeholder="请输入好友名称">
                </div>
                <div class="form-group">
                    <label for="friend-number">数字ID</label>
                    <input type="number" id="friend-number" class="form-input" placeholder="请输入数字ID">
                </div>
                <button class="add-friend-submit" id="add-friend-submit">
                    <span class="submit-icon">✅</span>
                    <span>添加好友</span>
                </button>
            </div>
            <div class="add-friend-tips">
                <div class="tip-item">
                    <span class="tip-icon">💡</span>
                    <span>添加好友后，信息会自动编辑到最新楼层</span>
                </div>
                <div class="tip-item">
                    <span class="tip-icon">📝</span>
                    <span>格式：[好友id|好友名字|数字ID]</span>
                </div>
            </div>
        `;
    }

    // 渲染删除好友tab
    renderDeleteFriendTab() {
        return `
            <div class="delete-friend-content">
                <div class="delete-friend-header">
                    <div class="delete-info">
                        <span class="delete-icon">⚠️</span>
                        <span>选择要删除的好友</span>
                    </div>
                    <button class="refresh-friend-list" id="refresh-friend-list">
                        <span class="refresh-icon">🔄</span>
                        <span>刷新</span>
                    </button>
                </div>
                <div class="delete-friend-list" id="delete-friend-list">
                    ${this.renderDeleteFriendList()}
                </div>
                <div class="delete-friend-tips">
                    <div class="tip-item">
                        <span class="tip-icon">⚠️</span>
                        <span>删除好友会移除所有相关消息记录</span>
                    </div>
                    <div class="tip-item">
                        <span class="tip-icon">🔍</span>
                        <span>从上下文中查找并删除所有匹配的好友信息</span>
                    </div>
                </div>
            </div>
        `;
    }

    // 渲染删除好友列表
    renderDeleteFriendList() {
        if (!window.friendRenderer) {
            return `
                <div class="loading-state">
                    <div class="loading-icon">⏳</div>
                    <div class="loading-text">正在加载好友列表...</div>
                </div>
            `;
        }

        try {
            const friends = window.friendRenderer.extractFriendsFromContext();

            if (friends.length === 0) {
                return `
                    <div class="empty-state">
                        <div class="empty-icon">👥</div>
                        <div class="empty-text">暂无好友</div>
                        <div class="empty-hint">请先添加好友</div>
                    </div>
                `;
            }

            const friendsHTML = friends.map(friend => {
                const avatar = this.getRandomAvatar();
                const timeStr = this.formatTime(friend.addTime);

                return `
                    <div class="delete-friend-item">
                        <div class="friend-info">
                            <div class="friend-avatar">${avatar}</div>
                            <div class="friend-details">
                                <div class="friend-name">${friend.name}</div>
                                <div class="friend-id">ID: ${friend.number}</div>
                                <div class="friend-time">添加时间: ${timeStr}</div>
                            </div>
                        </div>
                        <button class="delete-friend-btn" data-friend-id="${friend.number}" data-friend-name="${friend.name}">
                            <span class="delete-icon">❌</span>
                            <span>删除</span>
                        </button>
                    </div>
                `;
            }).join('');

            return friendsHTML;
        } catch (error) {
            console.error('[Message App] 渲染删除好友列表失败:', error);
            return `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <div class="error-text">加载好友列表失败</div>
                    <div class="error-details">${error.message}</div>
                </div>
            `;
        }
    }

    // 渲染创建群聊tab
    renderCreateGroupTab() {
        return `
            <div class="create-group-form">
                <div class="form-group">
                    <label for="group-name">群聊名称</label>
                    <input type="text" id="group-name" class="form-input" placeholder="请输入群聊名称">
                </div>
                <div class="form-group">
                    <label for="group-id">群聊ID</label>
                    <input type="number" id="group-id" class="form-input" placeholder="请输入群聊ID">
                </div>
                <div class="form-group">
                    <label>选择群成员</label>
                    <div class="friends-selection-container">
                        <div class="friends-selection-header">
                            <span>可选好友 (点击选择)</span>
                            <button class="select-all-friends" id="select-all-friends">全选</button>
                        </div>
                        <div class="friends-selection-list" id="friends-selection-list">
                            ${this.renderFriendsSelection()}
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>已选成员</label>
                    <div class="selected-members" id="selected-members">
                        <div class="selected-member default-member">
                            <span class="member-name">我</span>
                            <span class="member-type">(群主)</span>
                        </div>
                    </div>
                </div>
                <button class="create-group-submit" id="create-group-submit">
                    <span class="submit-icon">✅</span>
                    <span>创建群聊</span>
                </button>
            </div>
            <div class="create-group-tips">
                <div class="tip-item">
                    <span class="tip-icon">💡</span>
                    <span>创建群聊后，信息会自动编辑到最新楼层</span>
                </div>
                <div class="tip-item">
                    <span class="tip-icon">📝</span>
                    <span>格式：[群聊|群名|群ID|群成员]</span>
                </div>
            </div>
        `;
    }

    // 渲染删除群聊tab
    renderDeleteGroupTab() {
        return `
            <div class="delete-group-content">
                <div class="delete-group-header">
                    <div class="delete-info">
                        <span class="delete-icon">⚠️</span>
                        <span>选择要删除的群聊</span>
                    </div>
                    <button class="refresh-group-list" id="refresh-group-list">
                        <span class="refresh-icon">🔄</span>
                        <span>刷新</span>
                    </button>
                </div>
                <div class="delete-group-list" id="delete-group-list">
                    ${this.renderDeleteGroupList()}
                </div>
                <div class="delete-group-tips">
                    <div class="tip-item">
                        <span class="tip-icon">⚠️</span>
                        <span>删除群聊会移除所有相关消息记录</span>
                    </div>
                    <div class="tip-item">
                        <span class="tip-icon">🔍</span>
                        <span>从上下文中查找并删除所有匹配的群聊信息</span>
                    </div>
                </div>
            </div>
        `;
    }

    // 渲染好友选择列表
    renderFriendsSelection() {
        try {
            if (!window.friendRenderer) {
                console.warn('[Message App] friendRenderer未加载，显示占位符');
                return `
                    <div class="loading-state">
                        <div class="loading-icon">⏳</div>
                        <div class="loading-text">正在加载好友列表...</div>
                    </div>
                `;
            }

            const friends = window.friendRenderer.extractFriendsFromContext();

            if (!friends || friends.length === 0) {
                return `
                    <div class="empty-state">
                        <div class="empty-icon">👥</div>
                        <div class="empty-text">暂无好友</div>
                        <div class="empty-hint">请先添加好友</div>
                    </div>
                `;
            }

            const friendsHTML = friends.map(friend => {
                try {
                    const avatar = this.getRandomAvatar();
                    const friendName = friend.name || '未知好友';
                    const friendNumber = friend.number || '未知';

                    return `
                        <div class="friend-selection-item" data-friend-id="${friendNumber}" data-friend-name="${friendName}">
                            <div class="friend-checkbox">
                                <input type="checkbox" id="friend-${friendNumber}" class="friend-checkbox-input">
                                <label for="friend-${friendNumber}" class="friend-checkbox-label"></label>
                            </div>
                            <div class="friend-info">
                                <div class="friend-avatar">${avatar}</div>
                                <div class="friend-details">
                                    <div class="friend-name">${friendName}</div>
                                    <div class="friend-id">ID: ${friendNumber}</div>
                                </div>
                            </div>
                        </div>
                    `;
                } catch (itemError) {
                    console.error('[Message App] 渲染单个好友项失败:', itemError, friend);
                    return ''; // 跳过有问题的好友项
                }
            }).filter(html => html).join(''); // 过滤掉空的html

            return friendsHTML || `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <div class="error-text">好友列表渲染失败</div>
                    <div class="error-hint">请刷新重试</div>
                </div>
            `;

        } catch (error) {
            console.error('[Message App] 渲染好友选择列表失败:', error);
            return `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <div class="error-text">加载好友列表失败</div>
                    <div class="error-details">${error.message}</div>
                </div>
            `;
        }
    }

    // 渲染删除群聊列表
    renderDeleteGroupList() {
        // 返回加载占位符，然后异步加载群聊数据
        setTimeout(async () => {
            await this.loadDeleteGroupListAsync();
        }, 100);

        return `
            <div class="loading-state">
                <div class="loading-icon">⏳</div>
                <div class="loading-text">正在加载群聊列表...</div>
            </div>
        `;
    }

    // 异步加载删除群聊列表
    async loadDeleteGroupListAsync() {
        try {
            // 获取群聊列表（从上下文中提取）
            const groups = await this.extractGroupsFromContext();

            const deleteGroupListContainer = document.querySelector('#delete-group-list');
            if (!deleteGroupListContainer) {
                return;
            }

            if (groups.length === 0) {
                deleteGroupListContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">👥</div>
                        <div class="empty-text">暂无群聊</div>
                        <div class="empty-hint">请先创建群聊</div>
                    </div>
                `;
                return;
            }

            const groupsHTML = groups.map(group => {
                const avatar = '👥';
                const timeStr = this.formatTime(group.addTime);

                return `
                    <div class="delete-group-item">
                        <div class="group-info">
                            <div class="group-avatar">${avatar}</div>
                            <div class="group-details">
                                <div class="group-name">${group.name}</div>
                                <div class="group-id">群ID: ${group.id}</div>
                                <div class="group-members">成员: ${group.members}</div>
                                <div class="group-time">创建时间: ${timeStr}</div>
                            </div>
                        </div>
                        <button class="delete-group-btn" data-group-id="${group.id}" data-group-name="${group.name}">
                            <span class="delete-icon">❌</span>
                            <span>删除</span>
                        </button>
                    </div>
                `;
            }).join('');

            deleteGroupListContainer.innerHTML = groupsHTML;

            // 重新绑定删除群聊事件
            this.bindDeleteGroupEvents(document);

        } catch (error) {
            console.error('[Message App] 加载删除群聊列表失败:', error);
            const deleteGroupListContainer = document.querySelector('#delete-group-list');
            if (deleteGroupListContainer) {
                deleteGroupListContainer.innerHTML = `
                    <div class="error-state">
                        <div class="error-icon">⚠️</div>
                        <div class="error-text">加载群聊列表失败</div>
                        <div class="error-details">${error.message}</div>
                    </div>
                `;
            }
        }
    }

        // 从上下文提取群聊信息
    async extractGroupsFromContext() {
        try {
            if (!window.contextMonitor) {
                console.warn('[Message App] 上下文监控器不可用');
                return [];
            }

            // 获取聊天消息
            const chatData = await window.contextMonitor.getCurrentChatMessages();
            if (!chatData || !chatData.messages) {
                console.warn('[Message App] 无法获取聊天消息');
                return [];
            }

            const groups = [];
            const groupRegex = /\[群聊\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;

            // 遍历所有消息，查找群聊信息
            chatData.messages.forEach((message, messageIndex) => {
                if (message.mes && typeof message.mes === 'string') {
                    let match;
                    while ((match = groupRegex.exec(message.mes)) !== null) {
                        const [fullMatch, groupName, groupId, members] = match;

                        // 检查是否已存在（避免重复）
                        if (!groups.find(g => g.id === groupId)) {
                            groups.push({
                                name: groupName,
                                id: groupId,
                                members: members,
                                addTime: message.send_date || Date.now(),
                                messageIndex: messageIndex
                            });
                        }
                    }
                    // 重置正则表达式
                    groupRegex.lastIndex = 0;
                }
            });

            console.log(`[Message App] 找到 ${groups.length} 个群聊`);
            return groups;
        } catch (error) {
            console.error('[Message App] 提取群聊信息失败:', error);
            return [];
        }
    }

    // 格式化时间
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) {
            return '刚刚';
        } else if (diffMins < 60) {
            return `${diffMins}分钟前`;
        } else if (diffHours < 24) {
            return `${diffHours}小时前`;
        } else if (diffDays < 7) {
            return `${diffDays}天前`;
        } else {
            return date.toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric'
            });
        }
    }

    // 绑定事件
    bindEvents() {
        const appContent = document.getElementById('app-content');
        if (!appContent) return;

        // 绑定返回按钮事件
        const backButton = document.getElementById('back-button');
        if (backButton) {
            // 移除之前的事件监听器（如果存在）
            backButton.removeEventListener('click', this.handleBackButtonClick);

            // 创建事件处理函数
            this.handleBackButtonClick = () => {
                console.log('[Message App] 返回按钮被点击');
                if (this.currentView === 'detail' || this.currentView === 'messageDetail') {
                    // 如果当前在消息详情页面，返回到消息列表
                    this.showMessageList();
                } else if (this.currentView === 'addFriend') {
                    // 如果当前在添加好友页面，返回到消息列表
                    this.showMessageList();
                } else {
                    // 默认返回到消息列表
                    this.showMessageList();
                }
            };

            // 添加新的事件监听器
            backButton.addEventListener('click', this.handleBackButtonClick);
        }

        // 添加好友按钮
        const addFriendBtn = appContent.querySelector('#add-friend-btn');
        if (addFriendBtn) {
            addFriendBtn.addEventListener('click', () => {
                this.showAddFriend();
            });
        }

        // Tab切换按钮
        const tabBtns = appContent.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault(); // 阻止默认行为
                e.stopPropagation(); // 阻止事件冒泡

                const target = e.currentTarget;
                const tabName = target.getAttribute('data-tab');
                if (tabName) {
                    console.log(`[Message App] Tab切换: ${tabName}`);
                    this.switchTab(tabName);
                }
            });
        });

        // 添加好友提交按钮
        const submitBtn = appContent.querySelector('#add-friend-submit');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.addFriend();
            });
        }

        // 刷新好友列表按钮
        const refreshBtn = appContent.querySelector('#refresh-friend-list');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshDeleteFriendList();
            });
        }

        // 删除好友按钮
        const deleteFriendBtns = appContent.querySelectorAll('.delete-friend-btn');
        deleteFriendBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const friendId = target.getAttribute('data-friend-id');
                const friendName = target.getAttribute('data-friend-name');
                if (friendId && friendName) {
                    this.deleteFriend(friendId, friendName);
                }
            });
        });

        // 创建群聊相关事件
        this.bindCreateGroupEvents(appContent);

        // 删除群聊相关事件
        this.bindDeleteGroupEvents(appContent);

        // 好友列表点击事件
        const messageItems = appContent.querySelectorAll('.message-item');
        messageItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const friendId = target && target.getAttribute ? target.getAttribute('data-friend-id') : null;
                if (friendId) {
                    this.selectFriend(friendId); // 新增：选择好友而不是直接打开聊天
                }
            });
        });

        // 绑定发送相关事件
        this.bindSendEvents();

        // 绑定消息详情页面的发送事件
        this.bindDetailSendEvents();
    }

    // 绑定发送相关事件
    bindSendEvents() {
        if (this.currentView !== 'list') return;

        const appContent = document.getElementById('app-content');
        if (!appContent) return;

        // 获取发送相关元素
        const sendInput = appContent.querySelector('#message-send-input');
        const sendButton = appContent.querySelector('#send-message-btn');
        const emojiBtn = appContent.querySelector('#send-emoji-btn');
        const stickerBtn = appContent.querySelector('#send-sticker-btn');
        const voiceBtn = appContent.querySelector('#send-voice-btn');
        const redpackBtn = appContent.querySelector('#send-redpack-btn');

        // 确保MessageSender已加载
        if (!window.messageSender) {
            console.warn('[Message App] MessageSender未加载，延迟绑定事件');
            setTimeout(() => this.bindSendEvents(), 1000);
            return;
        }

        // 输入框事件
        if (sendInput) {
            // 自动调整高度
            sendInput.addEventListener('input', () => {
                window.messageSender.adjustTextareaHeight(sendInput);
                this.updateCharCount(sendInput);
            });

            // 回车发送
            sendInput.addEventListener('keydown', (e) => {
                window.messageSender.handleEnterSend(e, sendInput);
            });
        }

        // 发送按钮事件
        if (sendButton) {
            sendButton.addEventListener('click', async () => {
                if (sendInput && this.currentSelectedFriend) {
                    const message = sendInput.value.trim();
                    if (message) {
                        const success = await window.messageSender.sendMessage(message);
                        if (success) {
                            sendInput.value = '';
                            window.messageSender.adjustTextareaHeight(sendInput);
                            this.updateCharCount(sendInput);
                        }
                    }
                }
            });
        }

        // 特殊功能按钮事件
        if (emojiBtn) {
            emojiBtn.addEventListener('click', () => {
                this.showEmojiPanel();
            });
        }

        if (stickerBtn) {
            stickerBtn.addEventListener('click', () => {
                this.showStickerPanel();
            });
        }

        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                this.showVoicePanel();
            });
        }

        if (redpackBtn) {
            redpackBtn.addEventListener('click', () => {
                this.showRedpackPanel();
            });
        }
    }

    // 绑定消息详情页面的发送事件
    bindDetailSendEvents() {
        if (this.currentView !== 'messageDetail') return;

        const appContent = document.getElementById('app-content');
        if (!appContent) return;

        // 获取消息详情页面的发送相关元素
        const detailInput = appContent.querySelector('#message-detail-input');
        const detailSendBtn = appContent.querySelector('#detail-send-btn');
        const detailToolToggleBtn = appContent.querySelector('#detail-tool-toggle-btn');
        const detailEmojiBtn = appContent.querySelector('#detail-emoji-btn');
        const detailStickerBtn = appContent.querySelector('#detail-sticker-btn');
        const detailVoiceBtn = appContent.querySelector('#detail-voice-btn');
        const detailRedpackBtn = appContent.querySelector('#detail-redpack-btn');

        // 确保MessageSender已加载
        if (!window.messageSender) {
            console.warn('[Message App] MessageSender未加载，延迟绑定详情页面事件');
            setTimeout(() => this.bindDetailSendEvents(), 1000);
            return;
        }

        // 设置当前聊天对象
        if (this.currentFriendId) {
            // 根据currentSelectedFriend或从DOM判断是否为群聊
            const isGroup = this.isCurrentChatGroup();
            window.messageSender.setCurrentChat(this.currentFriendId, this.currentFriendName, isGroup);
        }

        // 输入框事件
        if (detailInput) {
            // 自动调整高度
            detailInput.addEventListener('input', () => {
                window.messageSender.adjustTextareaHeight(detailInput);
                this.updateCharCount(detailInput);
            });

            // 回车发送
            detailInput.addEventListener('keydown', (e) => {
                window.messageSender.handleEnterSend(e, detailInput);
            });
        }

        // 发送按钮事件
        if (detailSendBtn) {
            detailSendBtn.addEventListener('click', async () => {
                if (detailInput && this.currentFriendId) {
                    const message = detailInput.value.trim();
                    if (message) {
                        const success = await window.messageSender.sendMessage(message);
                        if (success) {
                            detailInput.value = '';
                            window.messageSender.adjustTextareaHeight(detailInput);
                            this.updateCharCount(detailInput);
                        }
                    }
                }
            });
        }

        // 工具切换按钮事件
        if (detailToolToggleBtn) {
            detailToolToggleBtn.addEventListener('click', () => {
                this.toggleToolsFloatingPanel();
            });
        }

        // 特殊功能按钮事件
        if (detailEmojiBtn) {
            detailEmojiBtn.addEventListener('click', () => {
                this.showEmojiPanel();
            });
        }

        if (detailStickerBtn) {
            detailStickerBtn.addEventListener('click', () => {
                this.showStickerPanel();
            });
        }

        if (detailVoiceBtn) {
            detailVoiceBtn.addEventListener('click', () => {
                this.showVoicePanel();
            });
        }

        if (detailRedpackBtn) {
            detailRedpackBtn.addEventListener('click', () => {
                this.showRedpackPanel();
            });
        }
    }

    // 选择好友
    selectFriend(friendId) {
        try {
            // 获取好友信息
            let friendName = null;
            let isGroup = false;

            if (window.friendRenderer) {
                const friend = window.friendRenderer.getFriendById(friendId);
                friendName = friend ? friend.name : `好友 ${friendId}`;
                isGroup = friend ? friend.isGroup : false;
            } else {
                friendName = `好友 ${friendId}`;
            }

            // 保存群聊状态
            this.currentIsGroup = isGroup;

            // 直接进入聊天详情页面
            this.showMessageDetail(friendId, friendName);

        } catch (error) {
            console.error('[Message App] 选择好友失败:', error);
        }
    }

    // 判断当前聊天是否为群聊
    isCurrentChatGroup() {
        // 优先使用保存的状态
        if (this.currentIsGroup !== undefined) {
            return this.currentIsGroup;
        }

        // 从DOM元素判断
        const messageItem = document.querySelector(`[data-friend-id="${this.currentFriendId}"]`);
        if (messageItem) {
            const isGroupAttr = messageItem.getAttribute('data-is-group');
            return isGroupAttr === 'true';
        }

        // 从friend renderer判断
        if (window.friendRenderer) {
            const friend = window.friendRenderer.getFriendById(this.currentFriendId);
            return friend ? friend.isGroup : false;
        }

        return false;
    }



    // 更新字数统计
    updateCharCount(inputElement) {
        const appContent = document.getElementById('app-content');
        if (!appContent) return;

        let charCountElement = appContent.querySelector('.char-count');
        if (!charCountElement) {
            // 创建字数统计元素
            charCountElement = document.createElement('div');
            charCountElement.className = 'char-count';
            const sendArea = appContent.querySelector('.message-send-area');
            if (sendArea) {
                sendArea.appendChild(charCountElement);
            }
        }

        const currentLength = inputElement.value.length;
        const maxLength = inputElement.maxLength || 1000;

        charCountElement.textContent = `${currentLength}/${maxLength}`;

        // 根据字数设置样式
        if (currentLength > maxLength * 0.9) {
            charCountElement.className = 'char-count error';
        } else if (currentLength > maxLength * 0.7) {
            charCountElement.className = 'char-count warning';
        } else {
            charCountElement.className = 'char-count';
        }
    }

    // 显示表情面板
    showEmojiPanel() {
        const emojis = [
            '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
            '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
            '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
            '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
            '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
            '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
            '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
            '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
            '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
            '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾'
        ];

        const panel = document.createElement('div');
        panel.className = 'special-panel';
        panel.innerHTML = `
            <div class="special-panel-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3>选择表情</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 18px; cursor: pointer;">✕</button>
                </div>
                <div style="display: grid; grid-template-columns: repeat(10, 1fr); gap: 10px; max-height: 200px; overflow-y: auto;">
                    ${emojis.map(emoji => `
                        <button onclick="window.messageSender.insertSpecialFormat('emoji', {emoji: '${emoji}'}); this.parentElement.parentElement.parentElement.remove();"
                                style="background: none; border: 1px solid #ddd; border-radius: 8px; padding: 8px; cursor: pointer; font-size: 20px;">
                            ${emoji}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(panel);
    }

    // 显示表情包面板
    showStickerPanel() {
        console.log('[Message App] 显示表情包面板');

        // 检查是否已存在表情包面板
        const existingPanel = document.getElementById('sticker-input-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        // 表情包图片列表（从实际图片目录获取）
        const stickerImages = [
            'zjlr8e.jpg', 'emzckz.jpg', 'ivtswg.jpg', 'lgply8.jpg', 'au4ay5.jpg',
            'qasebg.jpg', '5kqdkh.jpg', '8kvr4u.jpg', 'aotnxp.jpg', 'xigzwa.jpg',
            'y7px4h.jpg', 'z2sxmv.jpg', 's10h5m.jpg', 'hoghwb.jpg', 'kin0oj.jpg',
            'l9nqv0.jpg', 'kv2ubl.gif', '6eyt6n.jpg'
        ];

        // 创建表情包输入面板
        const panel = document.createElement('div');
        panel.id = 'sticker-input-panel';
        panel.className = 'special-panel';

        const stickerGrid = stickerImages.map(filename => `
            <div class="sticker-item" onclick="window.messageApp.insertStickerMessage('${filename}')"
                 style="cursor: pointer; padding: 4px; border: 2px solid transparent; border-radius: 8px; transition: all 0.3s ease;"
                 onmouseover="this.style.borderColor='#667eea'; this.style.transform='scale(1.1)'"
                 onmouseout="this.style.borderColor='transparent'; this.style.transform='scale(1)'">
                <img src="/scripts/extensions/third-party/mobile/images/${filename}"
                     alt="${filename}"
                     style="width: 24px; height: 24px; object-fit: cover; border-radius: 4px; display: block;"
                     title="${filename}">
            </div>
        `).join('');

        panel.innerHTML = `
            <div class="special-panel-content" style="max-width: 500px; width: 90%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                    <h3 style="margin: 0; color: #333; font-size: 18px;">😄 选择表情包</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()"
                            style="background: none; border: none; font-size: 20px; cursor: pointer; color: #999; padding: 5px;">✕</button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)); gap: 8px; max-height: 300px; overflow-y: auto; padding: 10px; background: #f8f9fa; border-radius: 12px;">
                    ${stickerGrid}
                </div>

                <div style="margin-top: 15px; text-align: center; font-size: 12px; color: #666;">
                    点击表情包插入到消息中
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        // 点击外部关闭
        panel.addEventListener('click', (e) => {
            if (e.target === panel) {
                panel.remove();
            }
        });
    }

    // 显示语音面板
    showVoicePanel() {
        // 检查是否已存在语音面板
        const existingPanel = document.getElementById('voice-input-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        // 创建语音输入面板
        const panel = document.createElement('div');
        panel.id = 'voice-input-panel';
        panel.className = 'special-panel';
        panel.innerHTML = `
            <div class="special-panel-content" style="max-width: 400px; width: 90%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                    <h3 style="margin: 0; color: #333; font-size: 18px;">🎤 语音消息</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()"
                            style="background: none; border: none; font-size: 20px; cursor: pointer; color: #999; padding: 5px;">✕</button>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #555; font-weight: 500;">请输入语音内容：</label>
                    <textarea id="voice-content-input"
                             placeholder="请输入要发送的语音内容，例如：我叫个外卖"
                             style="width: 100%; min-height: 80px; max-height: 150px; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; resize: vertical; font-family: inherit; line-height: 1.4; outline: none; transition: border-color 0.3s ease;"
                             maxlength="200"></textarea>
                    <div style="text-align: right; margin-top: 5px; font-size: 12px; color: #999;">
                        <span id="voice-char-count">0</span>/200 字符
                    </div>
                </div>

                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()"
                            style="padding: 10px 20px; border: 1px solid #ddd; border-radius: 6px; background: #f8f9fa; color: #333; cursor: pointer; font-size: 14px; transition: all 0.3s ease;">
                        取消
                    </button>
                    <button id="voice-send-confirm-btn"
                            style="padding: 10px 20px; border: none; border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.3s ease;">
                        发送语音
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        // 绑定事件
        const input = document.getElementById('voice-content-input');
        const charCount = document.getElementById('voice-char-count');
        const sendBtn = document.getElementById('voice-send-confirm-btn');

        // 字数统计
        if (input && charCount) {
            input.addEventListener('input', () => {
                const count = input.value.length;
                charCount.textContent = count;

                // 样式变化
                if (count > 180) {
                    charCount.style.color = '#dc3545';
                } else if (count > 140) {
                    charCount.style.color = '#ffc107';
                } else {
                    charCount.style.color = '#999';
                }
            });

            // 回车发送（Ctrl+Enter或Shift+Enter换行）
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
                    e.preventDefault();
                    sendBtn.click();
                }
            });
        }

        // 发送按钮事件
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.insertVoiceMessage();
            });
        }

        // 聚焦到输入框
        setTimeout(() => {
            if (input) {
                input.focus();
            }
        }, 100);

        // 点击外部关闭
        panel.addEventListener('click', (e) => {
            if (e.target === panel) {
                panel.remove();
            }
        });
    }

    /**
     * 插入语音消息到输入框
     */
    insertVoiceMessage() {
        const input = document.getElementById('voice-content-input');
        const panel = document.getElementById('voice-input-panel');

        if (!input) {
            console.error('找不到语音输入框');
            return;
        }

        const voiceContent = input.value.trim();
        if (!voiceContent) {
            // 输入框变红提示
            input.style.borderColor = '#dc3545';
            input.placeholder = '请输入语音内容';
            setTimeout(() => {
                input.style.borderColor = '#ddd';
                input.placeholder = '请输入要发送的语音内容，例如：我叫个外卖';
            }, 2000);
            return;
        }

        // 获取当前的输入框
        const appContent = document.getElementById('app-content');
        let targetInput = null;

        if (appContent) {
            // 优先查找消息详情页面的输入框
            targetInput = appContent.querySelector('#message-detail-input') ||
                         appContent.querySelector('#message-send-input');
        }

        if (!targetInput) {
            console.error('找不到目标输入框');
            this.showToast('未找到输入框，请先打开聊天窗口', 'error');
            return;
        }

        // 生成语音消息格式 [我方消息|我|好友ID|语音|内容]
        // 获取当前聊天对象的ID和群聊状态
        let targetId = null;
        let isGroup = false;

        // 尝试从当前应用状态获取好友ID和群聊状态
        if (this.currentFriendId) {
            targetId = this.currentFriendId;
            isGroup = this.isGroup || false;
        }

        // 如果没有获取到，尝试从 MessageSender 获取
        if (!targetId && window.messageSender && window.messageSender.currentFriendId) {
            targetId = window.messageSender.currentFriendId;
            isGroup = window.messageSender.isGroup || false;
        }

        // 如果还是没有，使用默认值
        if (!targetId) {
            targetId = '223456'; // 默认好友ID
            console.warn('[Message App] 未能获取当前好友ID，使用默认值:', targetId);
        }

        // 生成语音消息格式 - 区分群聊和私聊
        let voiceMessage;
        if (isGroup) {
            voiceMessage = `[群聊消息|${targetId}|我|语音|${voiceContent}]`;
        } else {
            voiceMessage = `[我方消息|我|${targetId}|语音|${voiceContent}]`;
        }

        // 插入到输入框
        const currentValue = targetInput.value || '';
        const separator = currentValue ? '\n' : '';
        targetInput.value = currentValue + separator + voiceMessage;

        // 触发输入事件，更新字数统计等
        const inputEvent = new Event('input', { bubbles: true });
        targetInput.dispatchEvent(inputEvent);

        // 聚焦到输入框
        targetInput.focus();

        // 关闭面板
        if (panel) {
            panel.remove();
        }

        // 显示成功提示
        this.showToast('语音消息已插入到输入框', 'success');

        console.log('语音消息已插入:', voiceMessage);
    }

    /**
     * 插入表情包消息到输入框
     */
    insertStickerMessage(filename) {
        if (!filename) {
            console.error('表情包文件名不能为空');
            return;
        }

        // 获取当前的输入框
        const appContent = document.getElementById('app-content');
        let targetInput = null;

        if (appContent) {
            // 优先查找消息详情页面的输入框
            targetInput = appContent.querySelector('#message-detail-input') ||
                         appContent.querySelector('#message-send-input');
        }

        if (!targetInput) {
            console.error('找不到目标输入框');
            this.showToast('未找到输入框，请先打开聊天窗口', 'error');
            return;
        }

        // 获取当前聊天对象的ID和群聊状态
        let targetId = null;
        let isGroup = false;

        // 尝试从当前应用状态获取好友ID和群聊状态
        if (this.currentFriendId) {
            targetId = this.currentFriendId;
            isGroup = this.isGroup || false;
        }

        // 如果没有获取到，尝试从 MessageSender 获取
        if (!targetId && window.messageSender && window.messageSender.currentFriendId) {
            targetId = window.messageSender.currentFriendId;
            isGroup = window.messageSender.isGroup || false;
        }

        // 如果还是没有，使用默认值
        if (!targetId) {
            targetId = '223456'; // 默认好友ID
            console.warn('[Message App] 未能获取当前好友ID，使用默认值:', targetId);
        }

        // 生成表情包消息格式 - 区分群聊和私聊
        let stickerMessage;
        if (isGroup) {
            stickerMessage = `[群聊消息|${targetId}|我|表情包|${filename}]`;
        } else {
            stickerMessage = `[我方消息|我|${targetId}|表情包|${filename}]`;
        }

        // 插入到输入框
        const currentValue = targetInput.value || '';
        const separator = currentValue ? '\n' : '';
        targetInput.value = currentValue + separator + stickerMessage;

        // 触发输入事件，更新字数统计等
        const inputEvent = new Event('input', { bubbles: true });
        targetInput.dispatchEvent(inputEvent);

        // 聚焦到输入框
        targetInput.focus();

        // 关闭面板
        const panel = document.getElementById('sticker-input-panel');
        if (panel) {
            panel.remove();
        }

        // 显示成功提示
        this.showToast('表情包已插入到输入框', 'success');

        console.log('表情包消息已插入:', stickerMessage);
    }

    // 显示红包面板
    showRedpackPanel() {
        // 检查是否已存在红包面板
        const existingPanel = document.getElementById('redpack-input-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        // 创建红包输入面板
        const panel = document.createElement('div');
        panel.id = 'redpack-input-panel';
        panel.className = 'special-panel';
        panel.innerHTML = `
            <div class="special-panel-content" style="max-width: 400px; width: 90%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                    <h3 style="margin: 0; color: #333; font-size: 18px;">🧧 发红包</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()"
                            style="background: none; border: none; font-size: 20px; cursor: pointer; color: #999; padding: 5px;">✕</button>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #555; font-weight: 500;">请输入红包金额：</label>
                    <input type="number" id="redpack-amount-input"
                           placeholder="请输入金额，例如：88.88"
                           step="0.01" min="0.01" max="9999999"
                           style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.3s ease;" />
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px; font-size: 12px; color: #999;">
                        <span>金额范围：0.01 - 9999999.00 元</span>
                        <span id="redpack-amount-display">￥0.00</span>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #555; font-weight: 500;">红包祝福语（可选）：</label>
                    <input type="text" id="redpack-message-input"
                           placeholder="恭喜发财，大吉大利"
                           maxlength="20"
                           style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.3s ease;" />
                    <div style="text-align: right; margin-top: 5px; font-size: 12px; color: #999;">
                        <span id="redpack-message-count">0</span>/20 字符
                    </div>
                </div>

                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()"
                            style="padding: 10px 20px; border: 1px solid #ddd; border-radius: 6px; background: #f8f9fa; color: #333; cursor: pointer; font-size: 14px; transition: all 0.3s ease;">
                        取消
                    </button>
                    <button id="redpack-send-confirm-btn"
                            style="padding: 10px 20px; border: none; border-radius: 6px; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.3s ease;">
                        发红包
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        // 绑定事件
        const amountInput = document.getElementById('redpack-amount-input');
        const messageInput = document.getElementById('redpack-message-input');
        const amountDisplay = document.getElementById('redpack-amount-display');
        const messageCount = document.getElementById('redpack-message-count');
        const sendBtn = document.getElementById('redpack-send-confirm-btn');

        // 金额实时显示
        if (amountInput && amountDisplay) {
            amountInput.addEventListener('input', () => {
                const amount = parseFloat(amountInput.value) || 0;
                amountDisplay.textContent = `￥${amount.toFixed(2)}`;

                // 样式变化
                if (amount > 9999999) {
                    amountInput.style.borderColor = '#dc3545';
                    amountDisplay.style.color = '#dc3545';
                } else if (amount < 0.01 && amount > 0) {
                    amountInput.style.borderColor = '#ffc107';
                    amountDisplay.style.color = '#ffc107';
                } else {
                    amountInput.style.borderColor = '#ddd';
                    amountDisplay.style.color = '#28a745';
                }
            });
        }

        // 祝福语字数统计
        if (messageInput && messageCount) {
            messageInput.addEventListener('input', () => {
                const count = messageInput.value.length;
                messageCount.textContent = count;

                if (count > 18) {
                    messageCount.style.color = '#dc3545';
                } else if (count > 15) {
                    messageCount.style.color = '#ffc107';
                } else {
                    messageCount.style.color = '#999';
                }
            });
        }

        // 回车发送
        if (amountInput) {
            amountInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    sendBtn.click();
                }
            });
        }

        if (messageInput) {
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    sendBtn.click();
                }
            });
        }

        // 发送按钮事件
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.insertRedpackMessage();
            });
        }

        // 聚焦到金额输入框
        setTimeout(() => {
            if (amountInput) {
                amountInput.focus();
            }
        }, 100);

        // 点击外部关闭
        panel.addEventListener('click', (e) => {
            if (e.target === panel) {
                panel.remove();
            }
        });
    }

    /**
     * 插入红包消息到输入框
     */
    insertRedpackMessage() {
        const amountInput = document.getElementById('redpack-amount-input');
        const messageInput = document.getElementById('redpack-message-input');
        const panel = document.getElementById('redpack-input-panel');

        if (!amountInput) {
            console.error('找不到红包金额输入框');
            return;
        }

        const amount = parseFloat(amountInput.value);
        if (!amount || amount < 0.01 || amount > 9999999) {
            // 输入框变红提示
            amountInput.style.borderColor = '#dc3545';
            amountInput.placeholder = '请输入0.01-9999999.00之间的金额';
            setTimeout(() => {
                amountInput.style.borderColor = '#ddd';
                amountInput.placeholder = '请输入金额，例如：88.88';
            }, 2000);
            return;
        }

        const message = messageInput ? messageInput.value.trim() : '';
        const blessing = message || '恭喜发财，大吉大利';

        // 获取当前的输入框
        const appContent = document.getElementById('app-content');
        let targetInput = null;

        if (appContent) {
            // 优先查找消息详情页面的输入框
            targetInput = appContent.querySelector('#message-detail-input') ||
                         appContent.querySelector('#message-send-input');
        }

        if (!targetInput) {
            console.error('找不到目标输入框');
            this.showToast('未找到输入框，请先打开聊天窗口', 'error');
            return;
        }

        // 获取当前聊天对象的ID和群聊状态
        let targetId = null;
        let isGroup = false;

        // 尝试从当前应用状态获取好友ID和群聊状态
        if (this.currentFriendId) {
            targetId = this.currentFriendId;
            isGroup = this.isGroup || false;
        }

        // 如果没有获取到，尝试从 MessageSender 获取
        if (!targetId && window.messageSender && window.messageSender.currentFriendId) {
            targetId = window.messageSender.currentFriendId;
            isGroup = window.messageSender.isGroup || false;
        }

        // 如果还是没有，使用默认值
        if (!targetId) {
            targetId = '223456'; // 默认好友ID
            console.warn('[Message App] 未能获取当前好友ID，使用默认值:', targetId);
        }

        // 生成红包消息格式 - 区分群聊和私聊
        let redpackMessage;
        if (isGroup) {
            redpackMessage = `[群聊消息|${targetId}|我|红包|${amount.toFixed(2)}]`;
        } else {
            redpackMessage = `[我方消息|我|${targetId}|红包|${amount.toFixed(2)}]`;
        }

        // 插入到输入框
        const currentValue = targetInput.value || '';
        const separator = currentValue ? '\n' : '';
        targetInput.value = currentValue + separator + redpackMessage;

        // 触发输入事件，更新字数统计等
        const inputEvent = new Event('input', { bubbles: true });
        targetInput.dispatchEvent(inputEvent);

        // 聚焦到输入框
        targetInput.focus();

        // 关闭面板
        if (panel) {
            panel.remove();
        }

        // 显示成功提示
        this.showToast(`红包已插入到输入框：￥${amount.toFixed(2)}`, 'success');

        console.log('红包消息已插入:', redpackMessage);
    }

    // 显示提示
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `send-status-toast ${type}`;
        toast.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">${message}</div>
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }

    // 显示添加好友界面
    showAddFriend() {
        this.currentView = 'addFriend';
        this.currentTab = 'add'; // 默认显示添加tab

        // 通知主框架更新应用状态
        if (window.MobilePhone) {
            const addFriendState = {
                app: 'messages',
                title: '添加好友',
                view: 'addFriend'
            };
            window.MobilePhone.pushAppState(addFriendState);
        }

        this.updateAppContent();
    }

    // 显示消息列表
    showMessageList() {
        console.log('[Message App] 显示消息列表');

        this.currentView = 'list'; // 修复：保持与getAppContent中的case一致
        this.currentFriendId = null;
        this.currentFriendName = null;
        this.currentIsGroup = false; // 重置群聊状态

        // 通知主框架更新应用状态
        if (window.MobilePhone) {
            const listState = {
                app: 'messages',
                title: '信息',
                view: 'messageList' // 主框架用这个值来区分状态
            };
            window.MobilePhone.pushAppState(listState);
        }

        // 更新应用内容
        this.updateAppContent();
    }

    // 切换标签页
    switchTab(tabName) {
        console.log(`[Message App] 切换标签页: ${tabName}`);

        try {
            // 正确的状态管理：currentView保持为'addFriend'，currentTab切换为具体的tab
            this.currentTab = tabName; // 设置当前tab
            // this.currentView保持为'addFriend'，不要修改

            // 通知主框架更新应用状态（如果需要的话）
            if (window.MobilePhone && this.currentView === 'addFriend') {
                let title = '添加好友';
                if (tabName === 'delete') {
                    title = '删除好友';
                } else if (tabName === 'createGroup') {
                    title = '创建群聊';
                } else if (tabName === 'deleteGroup') {
                    title = '删除群聊';
                }

                // 更新当前状态的标题，但不改变view
                if (window.MobilePhone.currentAppState) {
                    window.MobilePhone.currentAppState.title = title;
                    window.MobilePhone.updateAppHeader(window.MobilePhone.currentAppState);
                }
            }

            // 确保DOM更新完成后再重新绑定事件
            setTimeout(() => {
                this.updateAppContent();
                // 额外确保tab-navigation仍然存在并可见
                this.ensureTabNavigationVisible();
            }, 10);

        } catch (error) {
            console.error('[Message App] 切换标签页时出错:', error);
            // 如果出错，尝试恢复到默认状态
            this.currentTab = 'add';
            this.updateAppContent();
        }
    }

    // 确保tab-navigation可见的辅助方法
    ensureTabNavigationVisible() {
        try {
            const tabNavigation = document.querySelector('.tab-navigation');
            if (tabNavigation) {
                // 确保tab-navigation可见
                tabNavigation.style.display = 'flex';

                // 确保当前tab的active状态正确
                const allTabs = tabNavigation.querySelectorAll('.tab-btn');
                allTabs.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-tab') === this.currentTab) {
                        btn.classList.add('active');
                    }
                });

                console.log(`[Message App] Tab导航已确保可见，当前tab: ${this.currentTab}`);
            } else {
                console.warn('[Message App] Tab导航元素未找到，可能需要重新渲染');
                // 如果tab-navigation不存在，强制重新渲染
                setTimeout(() => {
                    this.updateAppContent();
                }, 100);
            }
        } catch (error) {
            console.error('[Message App] 确保tab导航可见时出错:', error);
        }
    }

    // 刷新删除好友列表
    refreshDeleteFriendList() {
        if (this.currentView === 'addFriend' && this.currentTab === 'delete') {
            this.updateAppContent();
        }
    }

    // 更新应用内容
    updateAppContent() {
        try {
            const appContent = document.getElementById('app-content');
            if (!appContent) {
                console.error('[Message App] app-content元素不存在');
                return;
            }

            // 保存当前的滚动位置（如果需要的话）
            const currentScrollTop = appContent.scrollTop;

            // 更新内容
            const newContent = this.getAppContent();
            if (!newContent) {
                console.error('[Message App] getAppContent返回空内容');
                return;
            }

            appContent.innerHTML = newContent;

            // 确保内容更新完成后再绑定事件
            setTimeout(() => {
                try {
                    this.bindEvents();
                    console.log('[Message App] 事件绑定完成');
                } catch (bindError) {
                    console.error('[Message App] 绑定事件时出错:', bindError);
                }
            }, 20);

            // 恢复滚动位置（如果需要的话）
            if (currentScrollTop > 0) {
                setTimeout(() => {
                    appContent.scrollTop = currentScrollTop;
                }, 50);
            }

        } catch (error) {
            console.error('[Message App] 更新应用内容时出错:', error);
            // 尝试显示错误状态
            const appContent = document.getElementById('app-content');
            if (appContent) {
                appContent.innerHTML = `
                    <div class="error-state">
                        <div class="error-icon">⚠️</div>
                        <div class="error-text">界面更新失败</div>
                        <div class="error-details">${error.message}</div>
                        <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">重新加载</button>
                    </div>
                `;
            }
        }
    }

    // 渲染消息详情页面
    renderMessageDetail() {
        console.log('[Message App] 渲染消息详情');

        if (!this.currentFriendId) {
            console.error('[Message App] 没有选中的好友');
            return '<div class="error-message">没有选中的好友</div>';
        }

        if (window.renderMessageDetailForFriend) {
            // 返回加载占位符，然后异步加载真实内容
            setTimeout(() => {
                this.loadMessageDetailAsync();
            }, 100);

            // 根据是否为群聊添加对应的CSS class
            const isGroup = this.isCurrentChatGroup();
            const appClass = isGroup ? 'message-detail-app group-chat' : 'message-detail-app';
            const placeholder = isGroup ? '发送群聊消息...' : '发送消息...';

            return `
                <div class="${appClass}">
                    <div class="message-detail-content">
                        <div class="messages-loading">
                            <div class="loading-spinner"></div>
                            <span>正在加载消息...</span>
                        </div>
                    </div>
                    <div class="message-detail-footer">
                        <div class="message-send-area">
                            <div class="send-input-container">
                            <button class="send-tool-toggle-btn" id="detail-tool-toggle-btn" title="工具">🔧</button>
                                <textarea id="message-detail-input" placeholder="${placeholder}" maxlength="1000"></textarea>
                                <div class="send-tools" style="display: none;">
                                    <button class="send-tool-btn" id="detail-emoji-btn" title="表情">😊</button>
                                    <button class="send-tool-btn" id="detail-sticker-btn" title="表情包">🎭</button>
                                    <button class="send-tool-btn" id="detail-voice-btn" title="语音">🎤</button>
                                    <button class="send-tool-btn" id="detail-redpack-btn" title="红包">🧧</button>
                                </div>

                                <button class="send-message-btn" id="detail-send-btn">发送</button>
                            </div>

                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="message-detail-app">
                    <div class="message-detail-content">
                        <div class="error-messages">
                            <div class="error-icon">⚠️</div>
                            <div class="error-text">消息渲染器未加载</div>
                        </div>
                    </div>
                    <div class="message-detail-footer">
                        <div class="message-send-area">
                            <div class="send-input-container">
                            <button class="send-tool-toggle-btn" id="detail-tool-toggle-btn" title="工具">🔧</button>
                                <textarea id="message-detail-input" placeholder="发送消息..." maxlength="1000"></textarea>
                                <div class="send-tools" style="display: none;">
                                    <button class="send-tool-btn" id="detail-emoji-btn" title="表情">😊</button>
                                    <button class="send-tool-btn" id="detail-sticker-btn" title="表情包">🎭</button>
                                    <button class="send-tool-btn" id="detail-voice-btn" title="语音">🎤</button>
                                    <button class="send-tool-btn" id="detail-redpack-btn" title="红包">🧧</button>
                                </div>

                                <button class="send-message-btn" id="detail-send-btn">发送</button>
                            </div>

                        </div>
                    </div>
                </div>
            `;
        }
    }

    // 异步加载消息详情
    async loadMessageDetailAsync() {
        try {
            if (!window.renderMessageDetailForFriend) {
                throw new Error('消息渲染器未加载');
            }

            const content = await window.renderMessageDetailForFriend(this.currentFriendId, this.currentFriendName);

            const appContent = document.getElementById('app-content');
            if (appContent && this.currentView === 'messageDetail') {
                // 创建临时容器来处理内容
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = content;

                // 移除 message-detail-header
                const header = tempDiv.querySelector('.message-detail-header');
                if (header) {
                    header.remove();
                }

                // 处理发送区域 - 无论是否存在都要替换
                let finalContent = tempDiv.innerHTML;

                // 创建我们的新发送区域HTML
                const newFooterHTML = `
                    <div class="message-detail-footer">
                        <div class="message-send-area">
                            <div class="send-input-container">
                            <button class="send-tool-toggle-btn" id="detail-tool-toggle-btn" title="工具">🔧</button>
                                <textarea id="message-detail-input" placeholder="发送消息..." maxlength="1000"></textarea>
                                <div class="send-tools" style="display: none;">
                                    <button class="send-tool-btn" id="detail-emoji-btn" title="表情">😊</button>
                                    <button class="send-tool-btn" id="detail-sticker-btn" title="表情包">🎭</button>
                                    <button class="send-tool-btn" id="detail-voice-btn" title="语音">🎤</button>
                                    <button class="send-tool-btn" id="detail-redpack-btn" title="红包">🧧</button>
                                </div>

                                <button class="send-message-btn" id="detail-send-btn">✈</button>
                            </div>
                        </div>
                    </div>`;

                // 如果存在旧的发送区域，移除它
                const existingFooter = tempDiv.querySelector('.message-detail-footer');
                if (existingFooter) {
                    existingFooter.remove();
                    console.log('[Message App] 移除了现有的发送区域');
                }

                // 在主容器末尾添加新的发送区域
                const mainContainer = tempDiv.querySelector('.message-detail-app, .message-detail-content');
                if (mainContainer) {
                    mainContainer.insertAdjacentHTML('afterend', newFooterHTML);
                } else {
                    // 如果没找到主容器，直接在最后添加
                    tempDiv.insertAdjacentHTML('beforeend', newFooterHTML);
                }

                finalContent = tempDiv.innerHTML;
                appContent.innerHTML = finalContent;

                console.log('[Message App] 已设置新的发送区域结构');

                // 绑定新的事件
                if (window.bindMessageDetailEvents) {
                    window.bindMessageDetailEvents();
                }

                // 绑定详情页面的发送事件
                this.bindDetailSendEvents();
            }
        } catch (error) {
            console.error('[Message App] 加载消息详情失败:', error);
            const appContent = document.getElementById('app-content');
            if (appContent && this.currentView === 'messageDetail') {
                appContent.innerHTML = `
                    <div class="message-detail-app">
                        <div class="message-detail-content">
                            <div class="error-messages">
                                <div class="error-icon">⚠️</div>
                                <div class="error-text">加载消息失败</div>
                                <div class="error-details">${error.message}</div>
                            </div>
                        </div>
                        <div class="message-detail-footer">
                            <div class="message-send-area">
                                <div class="send-input-container">
                                <button class="send-tool-toggle-btn" id="detail-tool-toggle-btn" title="工具">🔧</button>
                                    <textarea id="message-detail-input" placeholder="发送消息..." maxlength="1000"></textarea>
                                    <div class="send-tools" style="display: none;">
                                        <button class="send-tool-btn" id="detail-emoji-btn" title="表情">😊</button>
                                        <button class="send-tool-btn" id="detail-sticker-btn" title="表情包">🎭</button>
                                        <button class="send-tool-btn" id="detail-voice-btn" title="语音">🎤</button>
                                        <button class="send-tool-btn" id="detail-redpack-btn" title="红包">🧧</button>
                                    </div>

                                    <button class="send-message-btn" id="detail-send-btn">发送</button>
                                </div>

                            </div>
                        </div>
                    </div>
                `;
                this.bindEvents();
                this.bindDetailSendEvents();
            }
        }
    }

        // 添加好友
    async addFriend() {
        const nameInput = document.getElementById('friend-name');
        const numberInput = document.getElementById('friend-number');

        if (!nameInput || !numberInput) {
            this.showMessage('输入框未找到', 'error');
            return;
        }

        const name = nameInput.value.trim();
        const number = numberInput.value.trim();

        if (!name || !number) {
            this.showMessage('请填写所有字段', 'error');
            return;
        }

        // 无需检查重复，因为不再使用本地存储
        // 上下文编辑器会处理重复消息

        // 调用上下文编辑器添加到最新楼层
        try {
            await this.addToContext(name, number);
            this.showMessage('好友添加成功，已编辑到最新楼层！', 'success');

            // 延迟返回列表
            setTimeout(() => {
                this.showMessageList();
            }, 1500);
        } catch (error) {
            console.error('[Message App] 添加到上下文失败:', error);
            this.showMessage('好友添加成功，但编辑到上下文失败', 'warning');
        }
    }

    // 删除好友
    async deleteFriend(friendId, friendName) {
        // 确认删除
        if (!confirm(`确定要删除好友 "${friendName}" (ID: ${friendId}) 吗？\n\n这会删除消息中的好友格式标记和相关的消息记录。`)) {
            return;
        }

        try {
            // 使用上下文监控器提取相关消息
            if (!window.contextMonitor) {
                throw new Error('上下文监控器未加载');
            }

            this.showMessage('正在查找相关消息...', 'info');

            // 获取聊天消息
            const chatData = await window.contextMonitor.getCurrentChatMessages();
            if (!chatData || !chatData.messages) {
                throw new Error('无法获取聊天消息');
            }

            // 查找包含该好友信息的消息
            const messagesToProcess = [];

            // 使用统一的正则表达式管理器
            const contextMonitor = window['contextMonitor'] || (window['ContextMonitor'] ? new window['ContextMonitor']() : null);
            if (!contextMonitor) {
                throw new Error('上下文监控器未初始化');
            }

            // 创建好友相关的匹配器
            const friendMatchers = contextMonitor.createFriendMessageMatchers(friendId);
            const friendNameMatcher = contextMonitor.createFriendNameMatcher(friendName);

            // 创建好友格式标记的正则表达式
            const friendFormatRegex = new RegExp(`\\[好友id\\|${friendName}\\|${friendId}\\]`, 'g');

            chatData.messages.forEach((message, index) => {
                if (message.mes && typeof message.mes === 'string') {
                    let messageModified = false;
                    let newMessageContent = message.mes;
                    let hasMyMessage = false;
                    let hasOtherMessage = false;

                    // 预处理：移除thinking标签包裹的内容进行检测
                    const messageForCheck = this.removeThinkingTags(message.mes);

                    // 检查是否包含好友格式标记（在移除thinking标签后的内容中）
                    if (friendFormatRegex.test(messageForCheck)) {
                        // 只移除不在thinking标签内的好友格式标记
                        newMessageContent = this.removePatternOutsideThinkingTags(message.mes, friendFormatRegex);
                        messageModified = newMessageContent !== message.mes;
                        if (messageModified) {
                            console.log(`[Message App] 消息 ${index} 包含好友格式标记，移除后内容: "${newMessageContent}"`);
                        }
                    }

                    // 检查是否包含我方消息或对方消息格式（也要排除thinking标签内的内容）
                    const messageForChatCheck = this.removeThinkingTags(message.mes);
                    hasMyMessage = friendMatchers.myMessage.test(messageForChatCheck);
                    hasOtherMessage = friendMatchers.otherMessage.test(messageForChatCheck);

                    console.log(`[Message App] 消息 ${index} 分析结果:`, {
                        hasFormatTag: messageModified,
                        hasMyMessage,
                        hasOtherMessage,
                        originalLength: message.mes.length,
                        newLength: newMessageContent.length,
                        preview: message.mes.substring(0, 50) + '...'
                    });

                    // 决定处理方式
                    if (hasMyMessage || hasOtherMessage) {
                        // 如果包含聊天记录格式，删除整条消息
                        messagesToProcess.push({
                            index: index,
                            id: message.id || index,
                            action: 'delete',
                            reason: '包含聊天记录格式',
                            originalContent: message.mes,
                            preview: message.mes.length > 50 ? message.mes.substring(0, 50) + '...' : message.mes
                        });
                    } else if (messageModified) {
                        // 只是移除格式标记，不删除整条消息
                        messagesToProcess.push({
                            index: index,
                            id: message.id || index,
                            action: 'modify',
                            reason: '只移除好友格式标记',
                            originalContent: message.mes,
                            newContent: newMessageContent.trim(),
                            preview: message.mes.length > 50 ? message.mes.substring(0, 50) + '...' : message.mes
                        });
                    }

                    // 重置正则表达式
                    friendFormatRegex.lastIndex = 0;
                    friendMatchers.myMessage.lastIndex = 0;
                    friendMatchers.otherMessage.lastIndex = 0;
                }
            });

            if (messagesToProcess.length === 0) {
                this.showMessage('未找到相关消息记录', 'warning');
                return;
            }

            this.showMessage(`找到 ${messagesToProcess.length} 条相关消息，正在处理...`, 'info');

            // 检查移动端上下文编辑器是否可用
            if (!window.mobileContextEditor) {
                throw new Error('移动端上下文编辑器未加载');
            }

            if (!window.mobileContextEditor.isSillyTavernReady()) {
                throw new Error('SillyTavern未准备就绪');
            }

            // 从后往前处理，避免索引变化
            const sortedMessages = messagesToProcess.sort((a, b) => b.index - a.index);
            let processedCount = 0;

            for (const msgInfo of sortedMessages) {
                try {
                    console.log(`[Message App] 处理消息 ${msgInfo.index}:`, {
                        action: msgInfo.action,
                        reason: msgInfo.reason,
                        originalContent: msgInfo.originalContent?.substring(0, 100) + '...',
                        newContent: msgInfo.newContent?.substring(0, 100) + '...'
                    });

                    if (msgInfo.action === 'delete') {
                        // 删除整条消息（聊天记录）
                        console.log(`[Message App] 删除消息 ${msgInfo.index}: ${msgInfo.reason}`);
                        await window.mobileContextEditor.deleteMessage(msgInfo.index);
                        console.log(`[Message App] ✅ 已删除消息 ${msgInfo.index}`);
                    } else if (msgInfo.action === 'modify') {
                        // 修改消息内容（移除格式标记）
                        console.log(`[Message App] 修改消息 ${msgInfo.index}: ${msgInfo.reason}`);
                        if (msgInfo.newContent.length > 0) {
                            await window.mobileContextEditor.modifyMessage(msgInfo.index, msgInfo.newContent);
                            console.log(`[Message App] ✅ 已修改消息 ${msgInfo.index}, 新内容: "${msgInfo.newContent}"`);
                        } else {
                            // 如果移除格式标记后消息为空，则删除整条消息
                            console.log(`[Message App] 消息 ${msgInfo.index} 修改后为空，删除整条消息`);
                            await window.mobileContextEditor.deleteMessage(msgInfo.index);
                            console.log(`[Message App] ✅ 已删除空消息 ${msgInfo.index}`);
                        }
                    }
                    processedCount++;
                } catch (error) {
                    console.error(`[Message App] ❌ 处理消息 ${msgInfo.index} 失败:`, error);
                }
            }

            if (processedCount > 0) {
                this.showMessage(`成功处理好友 "${friendName}" 相关的 ${processedCount} 条消息`, 'success');

                // 刷新界面
                setTimeout(() => {
                    this.refreshDeleteFriendList();
                }, 1000);
            } else {
                this.showMessage('处理失败', 'error');
            }

        } catch (error) {
            console.error('[Message App] 删除好友失败:', error);
            this.showMessage(`删除好友失败: ${error.message}`, 'error');
        }
    }

            // 添加到上下文
    async addToContext(friendName, friendNumber) {
        // 检查移动端上下文编辑器是否可用
        if (!window.mobileContextEditor) {
            throw new Error('移动端上下文编辑器未加载');
        }

        // 检查SillyTavern是否准备就绪
        if (!window.mobileContextEditor.isSillyTavernReady()) {
            throw new Error('SillyTavern未准备就绪');
        }

        // 格式化好友信息 - 使用固定的"好友id"文本
        const friendInfo = `[好友id|${friendName}|${friendNumber}]`;

        // 添加到最新楼层
        try {
            const messageIndex = await window.mobileContextEditor.addMessage(friendInfo, false, '系统');

            console.log(`[Message App] 好友信息已添加到消息 ${messageIndex}: ${friendInfo}`);

            // 自动保存已经在addMessage方法中完成

            return messageIndex;
        } catch (error) {
            console.error('[Message App] 添加消息失败:', error);
            throw error;
        }
    }

    // 获取随机头像
    getRandomAvatar() {
        // 返回空字符串，不显示表情符号，只显示背景图片
        return '';
    }

    // 显示消息
    showMessage(text, type = 'info') {
        // 创建消息提示
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-toast ${type}`;
        messageDiv.textContent = text;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            padding: 12px 24px;
            border-radius: 25px;
            color: white;
            font-size: 14px;
            max-width: 300px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#2196F3'};
            animation: messageSlideIn 0.3s ease-out;
        `;

        // 添加动画样式
        if (!document.getElementById('message-toast-style')) {
            const style = document.createElement('style');
            style.id = 'message-toast-style';
            style.textContent = `
                @keyframes messageSlideIn {
                    from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
                @keyframes messageSlideOut {
                    from { transform: translateX(-50%) translateY(0); opacity: 1; }
                    to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(messageDiv);

        // 3秒后自动消失
        setTimeout(() => {
            messageDiv.style.animation = 'messageSlideOut 0.3s ease-out';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }

    // 打开聊天界面
    openChat(friendId) {
        // 使用好友渲染器获取好友信息
        if (window.friendRenderer) {
            const friend = window.friendRenderer.getFriendById(friendId);
            if (friend) {
                this.showMessageDetail(friendId, friend.name);
            } else {
                this.showMessage('好友信息未找到', 'error');
            }
        } else {
            this.showMessageDetail(friendId, null);
        }
    }

    // 显示消息详情页面
    showMessageDetail(friendId, friendName) {
        console.log(`[Message App] 显示消息详情: ${friendId}, ${friendName}`);

        this.currentView = 'messageDetail';
        this.currentFriendId = friendId;
        this.currentFriendName = friendName;
        // 注意：currentIsGroup 状态在 selectFriend() 方法中已经设置

        // 通知主框架更新应用状态
        if (window.MobilePhone) {
            const detailState = {
                app: 'messages',
                title: friendName || `好友 ${friendId}`,
                view: 'messageDetail',
                friendId: friendId,
                friendName: friendName
            };
            window.MobilePhone.pushAppState(detailState);
        }

        // 更新应用内容
        this.updateAppContent();
    }

    // 调试删除好友功能（不实际删除）
    async debugDeleteFriend(friendId, friendName) {
        console.log(`[Message App] 🔍 调试删除好友功能: ${friendName} (ID: ${friendId})`);

        try {
            // 使用上下文监控器提取相关消息
            if (!window.contextMonitor) {
                throw new Error('上下文监控器未加载');
            }

            // 获取聊天消息
            const chatData = await window.contextMonitor.getCurrentChatMessages();
            if (!chatData || !chatData.messages) {
                throw new Error('无法获取聊天消息');
            }

            console.log(`[Message App] 📊 总共有 ${chatData.messages.length} 条消息`);

            // 创建匹配器
            const contextMonitor = window['contextMonitor'] || (window['ContextMonitor'] ? new window['ContextMonitor']() : null);
            const friendMatchers = contextMonitor.createFriendMessageMatchers(friendId);
            const friendFormatRegex = new RegExp(`\\[好友id\\|${friendName}\\|${friendId}\\]`, 'g');

            let foundMessages = [];

            chatData.messages.forEach((message, index) => {
                if (message.mes && typeof message.mes === 'string') {
                    let hasFormatTag = friendFormatRegex.test(message.mes);
                    let hasMyMessage = friendMatchers.myMessage.test(message.mes);
                    let hasOtherMessage = friendMatchers.otherMessage.test(message.mes);

                    if (hasFormatTag || hasMyMessage || hasOtherMessage) {
                        let newContent = message.mes.replace(friendFormatRegex, '');
                        foundMessages.push({
                            index,
                            hasFormatTag,
                            hasMyMessage,
                            hasOtherMessage,
                            originalContent: message.mes,
                            newContent: newContent.trim(),
                            wouldDelete: hasMyMessage || hasOtherMessage,
                            wouldModify: hasFormatTag && !hasMyMessage && !hasOtherMessage,
                            preview: message.mes.substring(0, 100) + (message.mes.length > 100 ? '...' : '')
                        });
                    }

                    // 重置正则表达式
                    friendFormatRegex.lastIndex = 0;
                    friendMatchers.myMessage.lastIndex = 0;
                    friendMatchers.otherMessage.lastIndex = 0;
                }
            });

            console.log(`[Message App] 📋 找到 ${foundMessages.length} 条相关消息:`);
            foundMessages.forEach(msg => {
                console.log(`[Message App] 消息 ${msg.index}:`, {
                    '操作类型': msg.wouldDelete ? '🗑️ 删除整条消息' : (msg.wouldModify ? '✏️ 修改消息内容' : '❓ 未知'),
                    '包含格式标记': msg.hasFormatTag ? '✅' : '❌',
                    '包含我方消息': msg.hasMyMessage ? '✅' : '❌',
                    '包含对方消息': msg.hasOtherMessage ? '✅' : '❌',
                    '原始内容': msg.preview,
                    '修改后内容': msg.newContent ? msg.newContent.substring(0, 100) + '...' : '(空)'
                });
            });

            return foundMessages;
        } catch (error) {
            console.error('[Message App] 调试删除好友失败:', error);
            return [];
        }
    }

    // 绑定创建群聊事件
    bindCreateGroupEvents(appContent) {
        if (this.currentTab !== 'createGroup') return;

        // 全选好友按钮
        const selectAllBtn = appContent.querySelector('#select-all-friends');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                this.toggleSelectAllFriends();
            });
        }

        // 好友选择事件
        const friendItems = appContent.querySelectorAll('.friend-selection-item');
        friendItems.forEach(item => {
            const checkbox = item.querySelector('.friend-checkbox-input');
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.handleFriendSelection(e.target, item);
                });
            }
        });

        // 创建群聊提交按钮
        const submitBtn = appContent.querySelector('#create-group-submit');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.createGroup();
            });
        }
    }

    // 绑定删除群聊事件
    bindDeleteGroupEvents(appContent) {
        if (this.currentTab !== 'deleteGroup') return;

        // 刷新群聊列表按钮
        const refreshBtn = appContent.querySelector('#refresh-group-list');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshDeleteGroupList();
            });
        }

        // 删除群聊按钮
        const deleteGroupBtns = appContent.querySelectorAll('.delete-group-btn');
        deleteGroupBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const groupId = target.getAttribute('data-group-id');
                const groupName = target.getAttribute('data-group-name');
                if (groupId && groupName) {
                    this.deleteGroup(groupId, groupName);
                }
            });
        });
    }

    // 切换全选好友
    toggleSelectAllFriends() {
        const checkboxes = document.querySelectorAll('.friend-checkbox-input');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);

        checkboxes.forEach(cb => {
            cb.checked = !allChecked;
            const item = cb.closest('.friend-selection-item');
            this.handleFriendSelection(cb, item);
        });

        // 更新按钮文本
        const selectAllBtn = document.querySelector('#select-all-friends');
        if (selectAllBtn) {
            selectAllBtn.textContent = allChecked ? '全选' : '取消全选';
        }
    }

    // 处理好友选择
    handleFriendSelection(checkbox, item) {
        const friendId = item.getAttribute('data-friend-id');
        const friendName = item.getAttribute('data-friend-name');
        const selectedMembersContainer = document.querySelector('#selected-members');

        if (checkbox.checked) {
            // 添加到已选成员
            const memberElement = document.createElement('div');
            memberElement.className = 'selected-member';
            memberElement.setAttribute('data-member-id', friendId);
            memberElement.innerHTML = `
                <span class="member-name">${friendName}</span>
                <button class="remove-member-btn" onclick="this.parentElement.remove(); document.querySelector('#friend-${friendId}').checked = false;">✕</button>
            `;
            selectedMembersContainer.appendChild(memberElement);
        } else {
            // 从已选成员中移除
            const memberElement = selectedMembersContainer.querySelector(`[data-member-id="${friendId}"]`);
            if (memberElement) {
                memberElement.remove();
            }
        }
    }

    // 创建群聊
    async createGroup() {
        const groupNameInput = document.getElementById('group-name');
        const groupIdInput = document.getElementById('group-id');

        if (!groupNameInput || !groupIdInput) {
            this.showMessage('输入框未找到', 'error');
            return;
        }

        const groupName = groupNameInput.value.trim();
        const groupId = groupIdInput.value.trim();

        if (!groupName || !groupId) {
            this.showMessage('请填写群聊名称和群聊ID', 'error');
            return;
        }

        // 获取已选成员
        const selectedMembers = this.getSelectedMembers();
        if (selectedMembers.length === 0) {
            this.showMessage('请至少选择一个群成员', 'error');
            return;
        }

        try {
            await this.addGroupToContext(groupName, groupId, selectedMembers);
            this.showMessage('群聊创建成功，已编辑到最新楼层！', 'success');

            // 延迟返回列表
            setTimeout(() => {
                this.showMessageList();
            }, 1500);
        } catch (error) {
            console.error('[Message App] 创建群聊失败:', error);
            this.showMessage('群聊创建失败', 'error');
        }
    }

    // 获取已选成员
    getSelectedMembers() {
        const selectedMembers = ['我']; // 群主默认在群里
        const memberElements = document.querySelectorAll('#selected-members .selected-member:not(.default-member)');

        memberElements.forEach(element => {
            const memberName = element.querySelector('.member-name').textContent;
            selectedMembers.push(memberName);
        });

        return selectedMembers;
    }

    // 将群聊信息添加到上下文
    async addGroupToContext(groupName, groupId, members) {
        // 检查移动端上下文编辑器是否可用
        if (!window.mobileContextEditor) {
            throw new Error('移动端上下文编辑器未加载');
        }

        // 检查SillyTavern是否准备就绪
        if (!window.mobileContextEditor.isSillyTavernReady()) {
            throw new Error('SillyTavern未准备就绪');
        }

        // 格式化群聊信息：[群聊|群名|群ID|群成员]
        const membersStr = members.join('、');
        const groupInfo = `[群聊|${groupName}|${groupId}|${membersStr}]`;

        // 添加到最新楼层
        try {
            const messageIndex = await window.mobileContextEditor.addMessage(groupInfo, false, '系统');
            console.log(`[Message App] 群聊信息已添加到消息 ${messageIndex}: ${groupInfo}`);
            return messageIndex;
        } catch (error) {
            console.error('[Message App] 添加群聊消息失败:', error);
            throw error;
        }
    }

    // 删除群聊
    async deleteGroup(groupId, groupName) {
        // 确认删除
        if (!confirm(`确定要删除群聊 "${groupName}" (ID: ${groupId}) 吗？\n\n这会删除消息中的群聊格式标记和相关的消息记录。`)) {
            return;
        }

        try {
            // 使用类似删除好友的逻辑
            if (!window.contextMonitor) {
                throw new Error('上下文监控器未加载');
            }

            this.showMessage('正在查找相关群聊消息...', 'info');

            // 获取聊天消息
            const chatData = await window.contextMonitor.getCurrentChatMessages();
            if (!chatData || !chatData.messages) {
                throw new Error('无法获取聊天消息');
            }

            // 查找包含该群聊信息的消息
            const messagesToProcess = [];

            // 创建群聊格式标记的正则表达式
            const groupFormatRegex = new RegExp(`\\[群聊\\|${groupName}\\|${groupId}\\|([^\\]]+)\\]`, 'g');

            chatData.messages.forEach((message, index) => {
                if (message.mes && typeof message.mes === 'string') {
                    let messageModified = false;
                    let newMessageContent = message.mes;

                    // 预处理：移除thinking标签包裹的内容进行检测
                    const messageForCheck = this.removeThinkingTags(message.mes);

                    // 检查是否包含群聊格式标记（在移除thinking标签后的内容中）
                    if (groupFormatRegex.test(messageForCheck)) {
                        // 只移除不在thinking标签内的群聊格式标记
                        newMessageContent = this.removePatternOutsideThinkingTags(message.mes, groupFormatRegex);
                        messageModified = newMessageContent !== message.mes;
                        if (messageModified) {
                            console.log(`[Message App] 消息 ${index} 包含群聊格式标记，移除后内容: "${newMessageContent}"`);
                        }
                    }

                    if (messageModified) {
                        messagesToProcess.push({
                            index: index,
                            id: message.id || index,
                            action: newMessageContent.trim().length > 0 ? 'modify' : 'delete',
                            reason: '移除群聊格式标记',
                            originalContent: message.mes,
                            newContent: newMessageContent.trim(),
                            preview: message.mes.length > 50 ? message.mes.substring(0, 50) + '...' : message.mes
                        });
                    }

                    // 重置正则表达式
                    groupFormatRegex.lastIndex = 0;
                }
            });

            if (messagesToProcess.length === 0) {
                this.showMessage('未找到相关群聊记录', 'warning');
                return;
            }

            this.showMessage(`找到 ${messagesToProcess.length} 条相关消息，正在处理...`, 'info');

            // 检查移动端上下文编辑器是否可用
            if (!window.mobileContextEditor) {
                throw new Error('移动端上下文编辑器未加载');
            }

            if (!window.mobileContextEditor.isSillyTavernReady()) {
                throw new Error('SillyTavern未准备就绪');
            }

            // 从后往前处理，避免索引变化
            const sortedMessages = messagesToProcess.sort((a, b) => b.index - a.index);
            let processedCount = 0;

            for (const msgInfo of sortedMessages) {
                try {
                    if (msgInfo.action === 'delete') {
                        console.log(`[Message App] 删除消息 ${msgInfo.index}: ${msgInfo.reason}`);
                        await window.mobileContextEditor.deleteMessage(msgInfo.index);
                        console.log(`[Message App] ✅ 已删除消息 ${msgInfo.index}`);
                    } else if (msgInfo.action === 'modify') {
                        console.log(`[Message App] 修改消息 ${msgInfo.index}: ${msgInfo.reason}`);
                        await window.mobileContextEditor.modifyMessage(msgInfo.index, msgInfo.newContent);
                        console.log(`[Message App] ✅ 已修改消息 ${msgInfo.index}, 新内容: "${msgInfo.newContent}"`);
                    }
                    processedCount++;
                } catch (error) {
                    console.error(`[Message App] ❌ 处理消息 ${msgInfo.index} 失败:`, error);
                }
            }

            if (processedCount > 0) {
                this.showMessage(`成功处理群聊 "${groupName}" 相关的 ${processedCount} 条消息`, 'success');

                // 刷新界面
                setTimeout(() => {
                    this.refreshDeleteGroupList();
                }, 1000);
            } else {
                this.showMessage('处理失败', 'error');
            }

        } catch (error) {
            console.error('[Message App] 删除群聊失败:', error);
            this.showMessage(`删除群聊失败: ${error.message}`, 'error');
        }
    }

    // 刷新删除群聊列表
    refreshDeleteGroupList() {
        if (this.currentView === 'addFriend' && this.currentTab === 'deleteGroup') {
            this.updateAppContent();
        }
    }

        // 切换工具栏显示状态
    toggleToolsFloatingPanel() {
        const sendTools = document.querySelector('.send-tools');

        if (!sendTools) {
            console.warn('[Message App] 找不到工具栏元素');
            return;
        }

        // 切换显示状态
        if (sendTools.style.display === 'none') {
            // 显示工具栏
            sendTools.style.display = 'flex';
            console.log('[Message App] 工具栏已显示');
        } else {
            // 隐藏工具栏
            sendTools.style.display = 'none';
            console.log('[Message App] 工具栏已隐藏');
        }
    }



        // 调试工具切换按钮
    debugToolToggleButton() {
        console.log('[Message App Debug] 检查工具切换按钮状态:');
        console.log('  - 当前视图:', this.currentView);
        console.log('  - 当前好友ID:', this.currentFriendId);

        const toggleBtn = document.querySelector('#detail-tool-toggle-btn');
        console.log('  - 工具切换按钮存在:', !!toggleBtn);

        if (toggleBtn) {
            console.log('  - 按钮可见:', toggleBtn.style.display !== 'none');
            console.log('  - 按钮文本:', toggleBtn.textContent);
            console.log('  - 按钮位置:', toggleBtn.getBoundingClientRect());
        }

        const sendTools = document.querySelector('.send-tools');
        console.log('  - 发送工具区域存在:', !!sendTools);

        if (sendTools) {
            console.log('  - 发送工具区域可见:', sendTools.style.display !== 'none');
        }

        const sendInputContainer = document.querySelector('.send-input-container');
        console.log('  - 发送输入容器存在:', !!sendInputContainer);

        if (sendInputContainer) {
            console.log('  - 容器内的按钮数量:', sendInputContainer.querySelectorAll('button').length);
            const buttons = sendInputContainer.querySelectorAll('button');
            buttons.forEach((btn, index) => {
                console.log(`    按钮${index + 1}: ${btn.className} - ${btn.textContent}`);
            });
        }
    }

    // 强制刷新消息详情页面
    forceRefreshMessageDetailPage() {
        console.log('[Message App] 🔄 强制刷新消息详情页面...');

        if (this.currentView !== 'messageDetail' || !this.currentFriendId) {
            console.warn('[Message App] 当前不在消息详情页面');
            return;
        }

        // 重新触发消息详情异步加载
        setTimeout(() => {
            this.loadMessageDetailAsync();
        }, 100);

        console.log('[Message App] ✅ 已触发强制刷新');
    }

        // 调试thinking标签功能
    debugThinkingTagsFunction(testText) {
        console.log('[Message App Debug] 🧠 测试thinking标签功能');

        const sampleText = testText || `
测试内容1 [好友id|张三|123456]
<thinking>
这里是思考内容，包含一个好友：[好友id|李四|789012]
还有群聊：[群聊|测试群|555|张三、李四]
</thinking>
测试内容2 [群聊|工作群|888|张三、王五]
<think>
另一个思考：[好友id|王五|333444]
</think>
正常内容 [好友id|赵六|666777]
        `;

        console.log('原始文本:', sampleText);
        console.log('');

        // 测试移除thinking标签
        const textWithoutThinking = this.removeThinkingTags(sampleText);
        console.log('移除thinking标签后:', textWithoutThinking);
        console.log('');

        // 测试好友格式检测
        const friendRegex = /\[好友id\|([^|]+)\|([^|]+)\]/g;
        console.log('好友格式匹配（原始文本）:');
        let match;
        friendRegex.lastIndex = 0;
        while ((match = friendRegex.exec(sampleText)) !== null) {
            const start = match.index;
            const end = match.index + match[0].length;
            const isInThinking = this.isPatternInsideThinkingTags(sampleText, start, end);
            console.log(`  - ${match[0]} (位置${start}-${end}) 在thinking内: ${isInThinking}`);
        }
        console.log('');

        // 测试移除thinking外的好友格式
        const cleanedText = this.removePatternOutsideThinkingTags(sampleText, /\[好友id\|([^|]+)\|([^|]+)\]/g);
        console.log('移除thinking外好友格式后:', cleanedText);
        console.log('');

        // 测试群聊格式
        const groupRegex = /\[群聊\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;
        console.log('群聊格式匹配（原始文本）:');
        groupRegex.lastIndex = 0;
        while ((match = groupRegex.exec(sampleText)) !== null) {
            const start = match.index;
            const end = match.index + match[0].length;
            const isInThinking = this.isPatternInsideThinkingTags(sampleText, start, end);
            console.log(`  - ${match[0]} (位置${start}-${end}) 在thinking内: ${isInThinking}`);
        }

        const cleanedText2 = this.removePatternOutsideThinkingTags(cleanedText, /\[群聊\|([^|]+)\|([^|]+)\|([^\]]+)\]/g);
        console.log('移除thinking外群聊格式后:', cleanedText2);

        return {
            original: sampleText,
            withoutThinking: textWithoutThinking,
            afterFriendRemoval: cleanedText,
            afterGroupRemoval: cleanedText2
        };
    }

    // 调试好友渲染器的thinking标签处理
    debugFriendRendererThinking() {
        console.log('[Message App Debug] 🔍 检查好友渲染器的thinking标签处理');

        // 检查好友渲染器是否存在
        if (!window.friendRenderer) {
            console.warn('❌ 好友渲染器不存在');
            return {
                error: '好友渲染器不存在'
            };
        }

        console.log('✅ 好友渲染器已加载');

        // 检查好友渲染器是否有thinking标签处理方法
        const hasRemoveThinking = typeof window.friendRenderer.removeThinkingTags === 'function';
        const hasPatternOutside = typeof window.friendRenderer.removePatternOutsideThinkingTags === 'function';

        console.log('好友渲染器方法检查:');
        console.log('  - removeThinkingTags方法:', hasRemoveThinking ? '✅ 存在' : '❌ 不存在');
        console.log('  - removePatternOutsideThinkingTags方法:', hasPatternOutside ? '✅ 存在' : '❌ 不存在');

        // 获取当前提取的好友列表
        let extractedFriends = [];
        try {
            if (typeof window.friendRenderer.extractFriendsFromContext === 'function') {
                extractedFriends = window.friendRenderer.extractFriendsFromContext();
                console.log(`当前提取的好友数量: ${extractedFriends.length}`);

                // 显示前5个好友的详情
                extractedFriends.slice(0, 5).forEach((friend, index) => {
                    console.log(`好友 ${index + 1}:`, {
                        name: friend.name,
                        number: friend.number,
                        source: friend.source || '未知来源'
                    });
                });
            }
        } catch (error) {
            console.error('❌ 提取好友列表失败:', error);
        }

        // 建议修复方案
        if (!hasRemoveThinking || !hasPatternOutside) {
            console.log('');
            console.log('🔧 修复建议:');
            console.log('需要在好友渲染器中添加thinking标签处理方法。');
            console.log('可以将MessageApp中的thinking处理方法复制到好友渲染器中。');

            if (window.friendRenderer.addThinkingTagSupport && typeof window.friendRenderer.addThinkingTagSupport === 'function') {
                console.log('');
                console.log('🚀 尝试自动修复...');
                try {
                    // 将MessageApp的thinking方法添加到好友渲染器
                    window.friendRenderer.removeThinkingTags = this.removeThinkingTags.bind(this);
                    window.friendRenderer.isPatternInsideThinkingTags = this.isPatternInsideThinkingTags.bind(this);
                    window.friendRenderer.removePatternOutsideThinkingTags = this.removePatternOutsideThinkingTags.bind(this);

                    console.log('✅ 已将thinking处理方法添加到好友渲染器');

                    // 触发重新提取
                    if (typeof window.friendRenderer.refresh === 'function') {
                        window.friendRenderer.refresh();
                        console.log('✅ 已触发好友渲染器刷新');
                    }
                } catch (error) {
                    console.error('❌ 自动修复失败:', error);
                }
            }
        }

        return {
            hasThinkingSupport: hasRemoveThinking && hasPatternOutside,
            friendCount: extractedFriends.length,
            friends: extractedFriends.slice(0, 3), // 返回前3个好友作为示例
            canAutoFix: typeof window.friendRenderer.addThinkingTagSupport === 'function'
        };
    }

    // 移除thinking标签包裹的内容
    removeThinkingTags(text) {
        if (!text || typeof text !== 'string') {
            return text;
        }

        // 移除 <think>...</think> 和 <thinking>...</thinking> 标签及其内容
        const thinkingTagRegex = /<think>[\s\S]*?<\/think>|<thinking>[\s\S]*?<\/thinking>/gi;
        return text.replace(thinkingTagRegex, '');
    }

    // 检查格式标记是否在thinking标签内
    isPatternInsideThinkingTags(text, patternStart, patternEnd) {
        if (!text || typeof text !== 'string') {
            return false;
        }

        const thinkingTagRegex = /<think>[\s\S]*?<\/think>|<thinking>[\s\S]*?<\/thinking>/gi;
        let match;

        while ((match = thinkingTagRegex.exec(text)) !== null) {
            const thinkStart = match.index;
            const thinkEnd = match.index + match[0].length;

            // 检查格式标记是否完全在thinking标签内
            if (patternStart >= thinkStart && patternEnd <= thinkEnd) {
                return true;
            }
        }

        return false;
    }

    // 只移除不在thinking标签内的格式标记
    removePatternOutsideThinkingTags(text, pattern) {
        if (!text || typeof text !== 'string') {
            return text;
        }

        // 创建新的正则表达式实例，避免lastIndex问题
        const newPattern = new RegExp(pattern.source, pattern.flags);
        let result = text;
        const replacements = [];
        let match;

        // 找到所有匹配
        while ((match = newPattern.exec(text)) !== null) {
            const matchStart = match.index;
            const matchEnd = match.index + match[0].length;

            // 检查这个匹配是否在thinking标签内
            if (!this.isPatternInsideThinkingTags(text, matchStart, matchEnd)) {
                replacements.push({
                    start: matchStart,
                    end: matchEnd,
                    text: match[0]
                });
            }
        }

        // 从后往前替换，避免索引问题
        replacements.reverse().forEach(replacement => {
            result = result.substring(0, replacement.start) + result.substring(replacement.end);
        });

        return result;
    }
}

// 创建全局实例
window.MessageApp = MessageApp;

// 为mobile-phone.js提供的接口
window.getMessageAppContent = function() {
    console.log('[Message App] 获取应用内容');

    if (!window.messageApp) {
        console.log('[Message App] 创建新实例');
        window.messageApp = new MessageApp();
    }

    // 检查实例是否已经初始化完成
    if (!window.messageApp || window.messageApp.currentView === undefined) {
        console.log('[Message App] 实例未完全初始化，返回加载占位符');
        return `
            <div class="messages-app">
                <div class="loading-placeholder">
                    <div class="loading-icon">⏳</div>
                    <div class="loading-text">正在加载消息应用...</div>
                </div>
            </div>
        `;
    }

    // 确保currentView有效
    if (!['list', 'addFriend', 'messageDetail'].includes(window.messageApp.currentView)) {
        console.log('[Message App] 重置currentView为list');
        window.messageApp.currentView = 'list';
    }

    const content = window.messageApp.getAppContent();
    console.log('[Message App] 返回内容，长度:', content.length, '当前视图:', window.messageApp.currentView);
    return content;
};

window.bindMessageAppEvents = function() {
    console.log('[Message App] 绑定应用事件');
    if (window.messageApp) {
        window.messageApp.bindEvents();
        console.log('[Message App] 事件绑定完成');
    } else {
        console.warn('[Message App] 应用实例不存在');
    }
};

console.log('[Message App] 信息应用模块加载完成');

} // 结束 if (typeof window.MessageApp === 'undefined') 检查
