/**
 * Live App - 直播应用
 * 为mobile-phone.js提供直播功能
 */

// @ts-nocheck
// 避免重复定义
if (typeof window.LiveApp === 'undefined') {

    class LiveApp {
        constructor() {
            this.currentView = 'liveRoom'; // 'liveRoom', 'starting'
            this.isLiving = false;
            this.liveContent = '';
            this.liveCategory = '';
            this.contextMonitor = null;
            this.eventListenersSetup = false;
            this.contextCheckInterval = null;

            // 实时渲染相关
            this.lastMessageCount = 0;
            this.lastMessageId = null;
            this.isAutoRenderEnabled = true;
            this.lastRenderTime = 0;
            this.renderCooldown = 1000;

            // 弹幕和礼物数据
            this.danmuList = [];
            this.giftList = [];
            this.recommendInteractions = [];
            this.audienceCount = 0; // 本场人数

            // 预设回复（等待填写）
            this.categoryReplies = {
                '游戏': '', // 等待填写
                '闲谈': '', // 等待填写
                '才艺': '', // 等待填写
                '户外': ''  // 等待填写
            };

            this.init();
        }

        init() {
            console.log('[Live App] 直播应用初始化开始');

            // 立即解析一次直播信息
            this.parseInteractionsFromContext();

            // 异步初始化监控，避免阻塞界面渲染
            setTimeout(() => {
                this.setupContextMonitor();
            }, 100);

            console.log('[Live App] 直播应用初始化完成');
        }

        // 设置上下文监控
        setupContextMonitor() {
            console.log('[Live App] 设置上下文监控...');

            // 监听上下文变化事件
            if (window.addEventListener) {
                window.addEventListener('contextUpdate', (event) => {
                    this.handleContextChange(event);
                });

                window.addEventListener('messageUpdate', (event) => {
                    this.handleContextChange(event);
                });

                window.addEventListener('chatChanged', (event) => {
                    this.handleContextChange(event);
                });
            }

            // 定时检查上下文变化
            this.contextCheckInterval = setInterval(() => {
                this.checkContextChanges();
            }, 2000);

            // 监听SillyTavern的事件系统
            this.setupSillyTavernEventListeners();
        }

        // 处理上下文变化
        handleContextChange(event) {
            console.log('[Live App] 上下文变化:', event);
            this.parseInteractionsFromContext();
        }

        // 检查上下文变化
        checkContextChanges() {
            if (!this.isAutoRenderEnabled) return;

            const currentTime = Date.now();
            if (currentTime - this.lastRenderTime < this.renderCooldown) {
                return;
            }

            this.parseInteractionsFromContext();
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
                        this.parseInteractionsFromContext();
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
                    setTimeout(() => {
                        this.setupSillyTavernEventListeners();
                    }, 2000);
                }
            } catch (error) {
                console.warn('[Live App] 设置SillyTavern事件监听器失败:', error);
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

        // 从上下文解析直播互动信息（完全按照shop-app模式）
        parseInteractionsFromContext() {
            try {
                // 获取当前直播数据
                const liveData = this.getCurrentLiveData();

                // 更新弹幕和礼物列表
                if (liveData.danmu.length !== this.danmuList.length ||
                    liveData.gifts.length !== this.giftList.length ||
                    liveData.recommendations.length !== this.recommendInteractions.length ||
                    liveData.audienceCount !== this.audienceCount ||
                    this.hasInteractionsChanged(liveData)) {
                    this.danmuList = liveData.danmu;
                    this.giftList = liveData.gifts;
                    this.recommendInteractions = liveData.recommendations;
                    this.audienceCount = liveData.audienceCount;
                    this.updateLiveInteractions();
                }

            } catch (error) {
                console.error('[Live App] 解析直播互动信息失败:', error);
            }
        }

        // 检查互动数据是否有变化（参考shop-app的hasProductsChanged方法）
        hasInteractionsChanged(newData) {
            if (newData.danmu.length !== this.danmuList.length ||
                newData.gifts.length !== this.giftList.length ||
                newData.recommendations.length !== this.recommendInteractions.length) {
                return true;
            }

            // 检查弹幕是否有变化
            for (let i = 0; i < newData.danmu.length; i++) {
                const newItem = newData.danmu[i];
                const oldItem = this.danmuList[i];
                if (!oldItem || newItem.userId !== oldItem.userId || newItem.message !== oldItem.message) {
                    return true;
                }
            }

            // 检查礼物是否有变化
            for (let i = 0; i < newData.gifts.length; i++) {
                const newItem = newData.gifts[i];
                const oldItem = this.giftList[i];
                if (!oldItem || newItem.userId !== oldItem.userId || newItem.gift !== oldItem.gift) {
                    return true;
                }
            }

            return false;
        }

        // 获取当前直播数据（完全按照shop-app模式）
        getCurrentLiveData() {
            try {
                // 优先使用mobileContextEditor获取数据
                const mobileContextEditor = window['mobileContextEditor'];
                if (mobileContextEditor) {
                    const chatData = mobileContextEditor.getCurrentChatData();
                    if (chatData && chatData.messages && chatData.messages.length > 0) {
                        // 搜索所有消息，不限制第一条
                        const allContent = chatData.messages.map(msg => msg.mes || '').join('\n');
                        return this.parseLiveContent(allContent);
                    }
                }

                // 如果没有mobileContextEditor，尝试其他方式
                const chatData = this.getChatData();
                if (chatData && chatData.length > 0) {
                    // 合并所有消息内容进行解析
                    const allContent = chatData.map(msg => msg.mes || '').join('\n');
                    return this.parseLiveContent(allContent);
                }
            } catch (error) {
                console.warn('[Live App] 获取直播数据失败:', error);
            }

            return { danmu: [], gifts: [], recommendations: [], audienceCount: 0 };
        }

        // 从消息中实时解析直播内容（完全按照shop-app模式）
        parseLiveContent(content) {
            // 去掉标记限制，直接解析所有内容
            const danmu = [];
            const gifts = [];
            const recommendations = [];
            let audienceCount = 0;

            // 解析本场人数格式: [直播|本场人数|55535]
            const audienceRegex = /\[直播\|本场人数\|(\d+)\]/g;
            let audienceMatch;
            while ((audienceMatch = audienceRegex.exec(content)) !== null) {
                const [fullMatch, count] = audienceMatch;
                audienceCount = parseInt(count, 10);
            }

            // 解析弹幕格式: [直播|用户id|弹幕|老婆我爱你！]
            const danmuRegex = /\[直播\|([^|]+)\|弹幕\|([^\]]+)\]/g;
            let danmuMatch;
            while ((danmuMatch = danmuRegex.exec(content)) !== null) {
                const [fullMatch, userId, message] = danmuMatch;

                // 检查是否已存在相同弹幕（根据用户ID和消息内容判断）
                const existingDanmu = danmu.find(d =>
                    d.userId.trim() === userId.trim() &&
                    d.message.trim() === message.trim()
                );

                if (!existingDanmu) {
                    const newDanmu = {
                        id: `danmu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        userId: userId.trim(),
                        message: message.trim(),
                        timestamp: Date.now()
                    };
                    danmu.push(newDanmu);
                }
            }

                    // 解析礼物格式: [直播|用户id|礼物|璀璨火箭*2] 和 [直播|用户id|打赏|小电视飞船*1]
        const giftRegex = /\[直播\|([^|]+)\|(?:礼物|打赏)\|([^\]]+)\]/g;
        let giftMatch;
        while ((giftMatch = giftRegex.exec(content)) !== null) {
            const [fullMatch, userId, giftInfo] = giftMatch;

            // 检查是否已存在相同礼物
            const existingGift = gifts.find(g =>
                g.userId.trim() === userId.trim() &&
                g.gift.trim() === giftInfo.trim()
            );

            if (!existingGift) {
                const newGift = {
                    id: `gift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    userId: userId.trim(),
                    gift: giftInfo.trim(),
                    timestamp: Date.now()
                };
                gifts.push(newGift);
                console.log('[Live App] 新增礼物/打赏:', newGift);
            }
        }

            // 解析推荐互动格式: [直播|推荐互动|回答某某人的弹幕问题]
            const recommendRegex = /\[直播\|推荐互动\|([^\]]+)\]/g;
            let recommendMatch;
            while ((recommendMatch = recommendRegex.exec(content)) !== null) {
                const [fullMatch, action] = recommendMatch;

                // 检查是否已存在相同推荐
                const existingRecommend = recommendations.find(r =>
                    r.action.trim() === action.trim()
                );

                if (!existingRecommend) {
                    const newRecommend = {
                        id: `recommend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        action: action.trim(),
                        timestamp: Date.now()
                    };
                    recommendations.push(newRecommend);
                }
            }

            console.log('[Live App] 解析完成，弹幕数:', danmu.length, '礼物数:', gifts.length, '推荐数:', recommendations.length, '本场人数:', audienceCount);
            return { danmu, gifts, recommendations, audienceCount };
        }

        // 获取聊天数据（完全按照shop-app模式）
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
                console.error('[Live App] 获取聊天数据失败:', error);
                return [];
            }
        }

        // 获取应用内容
        getAppContent() {
            return `
            <div class="live-app">
                ${this.renderLiveRoom()}
            </div>
        `;
        }

        // 渲染直播间
        renderLiveRoom() {
            return `
            <div class="live-room">
                <div class="live-header">
                    <div class="live-title">
                        <span class="live-icon"></span>
                        <span>直播间</span>
                        ${this.audienceCount > 0 ? `<span class="audience-count">👥 ${this.audienceCount}</span>` : ''}
                    </div>
                    <div class="live-status ${this.isLiving ? 'living' : 'offline'}">
                        ${this.isLiving ? '直播中' : '未开播'}
                    </div>
                </div>

                <div class="live-content">
                    ${this.renderLivingContent()}
                </div>

                <div class="live-actions">
                    ${this.renderLivingActions()}
                </div>
            </div>
        `;
        }

        // 渲染直播中的内容
        renderLivingContent() {
            return `
            <div class="live-interactions">
                <div class="interaction-header">
                    <div class="interaction-tabs">
                        <button class="tab-btn active" data-tab="interactions">直播互动</button>
                        <button class="tab-btn" data-tab="gifts">礼物流水</button>
                    </div>
                    <span class="interaction-count">${this.danmuList.length + this.giftList.length} 条</span>
                </div>
                <div class="live-recommendations">
                <div class="recommendation-list">
                    ${this.isLiving ? this.renderRecommendationItems() : this.renderEmptyRecommendations()}
                </div>
                </div>


            </div>
                <div class="tab-content">
                    <div class="tab-panel active" id="interactions-panel">
                        <div class="interaction-list" id="interactionList">
                            ${this.isLiving ? this.renderInteractionItems() : this.renderEmptyInteractions()}
                        </div>
                    </div>

                    <div class="tab-panel" id="gifts-panel">
                        <div class="gift-flow-list" id="giftFlowList">
                            ${this.isLiving ? this.renderGiftFlowItems() : this.renderEmptyGifts()}
                        </div>
                    </div>
                </div>
            </div>


        `;
        }



        // 渲染互动项目
        renderInteractionItems() {
            const allInteractions = [];

            // 添加弹幕
            this.danmuList.forEach(danmu => {
                allInteractions.push({
                    type: 'danmu',
                    userId: danmu.userId,
                    content: danmu.message,
                    timestamp: danmu.timestamp
                });
            });

            // 添加礼物
            this.giftList.forEach(gift => {
                allInteractions.push({
                    type: 'gift',
                    userId: gift.userId,
                    content: gift.gift,
                    timestamp: gift.timestamp
                });
            });

            // 按时间排序
            allInteractions.sort((a, b) => b.timestamp - a.timestamp);

            return allInteractions.map(item => `
            <div class="interaction-item ${item.type}">
                <div class="interaction-user">
                    <span class="user-avatar">${item.type === 'danmu' ? '💬' : '🎁'}</span>
                    <span class="user-id">${item.userId}</span>
                </div>
                <div class="interaction-content ${item.type === 'gift' ? 'gift-content' : ''}">${item.content}</div>
                <div class="interaction-time">${this.formatTime(item.timestamp)}</div>
            </div>
        `).join('');
        }

        // 渲染推荐互动项目
        renderRecommendationItems() {
            console.log('[Live App] 渲染推荐互动项目，数量:', this.recommendInteractions.length);

            return this.recommendInteractions.slice(0, 4).map(item => {
                console.log('[Live App] 渲染推荐项:', item.action);
                return `
                <div class="recommendation-item" data-action="${item.action}">
                    <div class="recommendation-text">${item.action}</div>
                </div>
            `;
            }).join('');
        }

        // 渲染礼物流水项目
        renderGiftFlowItems() {
            // 将同一用户的礼物合并
            const giftsByUser = {};
            this.giftList.forEach(gift => {
                const userId = gift.userId;
                if (!giftsByUser[userId]) {
                    giftsByUser[userId] = {
                        userId: userId,
                        gifts: [],
                        totalValue: 0,
                        firstTimestamp: gift.timestamp
                    };
                }
                giftsByUser[userId].gifts.push(gift);
                giftsByUser[userId].firstTimestamp = Math.min(giftsByUser[userId].firstTimestamp, gift.timestamp);
            });

            // 按时间排序用户
            const sortedUsers = Object.values(giftsByUser).sort((a, b) => b.firstTimestamp - a.firstTimestamp);

            return sortedUsers.map(userGifts => {
                const giftList = userGifts.gifts.map(gift => gift.gift).join(', ');
                const giftCount = userGifts.gifts.length;

                return `
                <div class="gift-flow-item">
                    <div class="gift-flow-user">
                        <span class="gift-flow-avatar">🎁</span>
                        <span class="gift-flow-username">${userGifts.userId}</span>
                        <span class="gift-flow-count">${giftCount}件</span>
                    </div>
                    <div class="gift-flow-content">
                        <div class="gift-flow-list-detail">${giftList}</div>
                        <div class="gift-flow-time">${this.formatTime(userGifts.firstTimestamp)}</div>
                    </div>
                </div>
            `;
            }).join('');
        }

        // 渲染空的互动列表
        renderEmptyInteractions() {
            return `
            <div class="empty-state">
                <div class="empty-icon">💬</div>
                <div class="empty-text">暂无互动</div>
                <div class="empty-subtitle">开始直播后，弹幕和互动会在这里显示</div>
            </div>
        `;
        }

        // 渲染空的礼物列表
        renderEmptyGifts() {
            return `
            <div class="empty-state">
                <div class="empty-icon">🎁</div>
                <div class="empty-text">暂无礼物</div>
                <div class="empty-subtitle">开始直播后，礼物记录会在这里显示</div>
            </div>
        `;
        }

        // 渲染空的推荐列表
        renderEmptyRecommendations() {
            // 提供一些测试推荐项，让用户可以测试功能
            const testRecommendations = [
                { action: '', id: 'test_1' },
                { action: '', id: 'test_2' },
                { action: '', id: 'test_3' },
                { action: '', id: 'test_4' }
            ];

            return testRecommendations.map(item => `
            <div class="recommendation-item" data-action="${item.action}">
                <div class="recommendation-text">${item.action}</div>
            </div>
        `).join('');
        }

        // 渲染直播中的操作按钮
        renderLivingActions() {
            if (!this.isLiving) {
                // 未开播状态，显示开播按钮
                return `
                <div class="action-buttons">
                    <button class="action-btn start-live-btn" id="startLiveBtn">
                        <span class="btn-icon"></span>
                        <span class="btn-text">开始直播</span>
                    </button>
                </div>
            `;
            } else {
                // 已开播状态，显示互动和结束直播按钮
                return `
                <div class="action-buttons">
                    <button class="action-btn interaction-btn" id="interactionBtn">
                        <span class="btn-text">互动</span>
                    </button>

                    <button class="action-btn stop-live-btn" id="stopLiveBtn">
                        <span class="btn-text">结束直播</span>
                    </button>
                </div>
            `;
            }
        }



        // 更新直播互动
        updateLiveInteractions() {
            const interactionList = document.getElementById('interactionList');
            if (interactionList) {
                interactionList.innerHTML = this.renderInteractionItems();
                // 滚动到底部显示最新互动
                interactionList.scrollTop = interactionList.scrollHeight;
            }

            // 更新礼物流水列表
            const giftFlowList = document.getElementById('giftFlowList');
            if (giftFlowList) {
                giftFlowList.innerHTML = this.renderGiftFlowItems();
            }

            // 更新推荐互动
            const recommendationList = document.querySelector('.recommendation-list');
            if (recommendationList) {
                recommendationList.innerHTML = this.renderRecommendationItems();
                // 重新绑定推荐互动事件
                this.bindRecommendationEvents();
            }

            // 更新直播标题中的人数显示
            const liveTitle = document.querySelector('.live-title');
            if (liveTitle) {
                const audienceCountSpan = liveTitle.querySelector('.audience-count');
                if (this.audienceCount > 0) {
                    if (audienceCountSpan) {
                        audienceCountSpan.textContent = `👥 ${this.audienceCount}`;
                    } else {
                        const newAudienceSpan = document.createElement('span');
                        newAudienceSpan.className = 'audience-count';
                        newAudienceSpan.textContent = `👥 ${this.audienceCount}`;
                        liveTitle.appendChild(newAudienceSpan);
                    }
                } else if (audienceCountSpan) {
                    audienceCountSpan.remove();
                }
            }
        }

        // 更新应用内容
        updateAppContent() {
            const appContainer = document.querySelector('.live-app');
            if (appContainer) {
                appContainer.innerHTML = this.renderLiveRoom();
                this.bindEvents();
            } else {
                // 如果找不到容器，重新生成完整内容
                const appContent = document.getElementById('app-content');
                if (appContent) {
                    appContent.innerHTML = this.getAppContent();
                    this.bindEvents();
                }
            }

            // 确保推荐互动事件被正确绑定
            setTimeout(() => {
                this.bindRecommendationEvents();
            }, 100);
        }

        // 绑定事件
        bindEvents() {
            // 开始直播按钮
            const startLiveBtn = document.getElementById('startLiveBtn');
            if (startLiveBtn) {
                startLiveBtn.addEventListener('click', () => {
                    this.showStartLiveModal();
                });
            }

            // 结束直播按钮
            const stopLiveBtn = document.getElementById('stopLiveBtn');
            if (stopLiveBtn) {
                stopLiveBtn.addEventListener('click', () => {
                    this.stopLive();
                });
            }

            // 互动按钮
            const interactionBtn = document.getElementById('interactionBtn');
            if (interactionBtn) {
                interactionBtn.addEventListener('click', () => {
                    this.showInteractionModal();
                });
            }

            // 推荐互动按钮
            this.bindRecommendationEvents();

            // Tab切换按钮
            const tabBtns = document.querySelectorAll('.tab-btn');
            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const tabName = btn.getAttribute('data-tab');
                    this.switchTab(tabName);
                });
            });
        }

        // 绑定推荐互动事件
        bindRecommendationEvents() {
            const recommendationItems = document.querySelectorAll('.recommendation-item');
            console.log('[Live App] 绑定推荐互动事件，找到', recommendationItems.length, '个推荐项');

            recommendationItems.forEach((item, index) => {
                item.addEventListener('click', () => {
                    const action = item.getAttribute('data-action');
                    console.log('[Live App] 点击推荐互动:', action);
                    this.sendRecommendationAction(action);
                });
            });
        }

        // 切换tab
        switchTab(tabName) {
            // 移除所有tab按钮的active状态
            const tabBtns = document.querySelectorAll('.tab-btn');
            tabBtns.forEach(btn => btn.classList.remove('active'));

            // 移除所有tab面板的active状态
            const tabPanels = document.querySelectorAll('.tab-panel');
            tabPanels.forEach(panel => panel.classList.remove('active'));

            // 添加当前tab的active状态
            const currentTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
            if (currentTabBtn) {
                currentTabBtn.classList.add('active');
            }

            // 显示对应的tab面板
            const targetPanel = document.getElementById(`${tabName}-panel`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        }

        // 将直播格式转换为直播历史格式
        async convertLiveToHistory() {
            try {
                console.log('[Live App] 开始转换直播格式为直播历史格式');

                // 获取当前聊天数据
                const contextData = this.getChatData();
                if (!contextData || contextData.length === 0) {
                    console.log('[Live App] 没有找到聊天数据');
                    return;
                }

                // 查找包含直播内容的消息
                let hasLiveContent = false;
                let updatedCount = 0;

                for (let i = 0; i < contextData.length; i++) {
                    const message = contextData[i];
                    const content = message.mes || message.content || '';

                    if (content.includes('[直播|')) {
                        hasLiveContent = true;
                        // 转换格式
                        const convertedContent = this.convertLiveFormats(content);

                        if (convertedContent !== content) {
                            // 尝试通过编辑器功能更新消息
                            const success = await this.updateMessageContent(i, convertedContent);
                            if (success) {
                                updatedCount++;
                                console.log(`[Live App] 已转换消息 ${i}，原始长度: ${content.length}，转换后长度: ${convertedContent.length}`);
                            }
                        }
                    }
                }

                if (!hasLiveContent) {
                    console.log('[Live App] 没有找到需要转换的直播内容');
                } else {
                    console.log(`[Live App] 直播格式转换完成，共更新了 ${updatedCount} 条消息`);

                    // 保存聊天数据
                    if (updatedCount > 0) {
                        await this.saveChatData();
                        console.log('[Live App] 转换完成并已保存聊天数据');
                    }
                }

            } catch (error) {
                console.error('[Live App] 转换直播格式失败:', error);
                // 显示错误提示
                this.showToast('转换直播格式失败: ' + error.message, 'error');
            }
        }

        // 转换直播格式字符串
        convertLiveFormats(content) {
            // 转换所有直播格式
            let convertedContent = content;
            let conversionCount = 0;

            // 转换弹幕格式: [直播|用户|弹幕|内容] -> [直播历史|用户|弹幕|内容]
            const danmuMatches = convertedContent.match(/\[直播\|([^|]+)\|弹幕\|([^\]]+)\]/g);
            if (danmuMatches) {
                convertedContent = convertedContent.replace(/\[直播\|([^|]+)\|弹幕\|([^\]]+)\]/g, '[直播历史|$1|弹幕|$2]');
                conversionCount += danmuMatches.length;
            }

                    // 转换礼物格式: [直播|用户|礼物|内容] -> [直播历史|用户|礼物|内容]
        // 转换打赏格式: [直播|用户|打赏|内容] -> [直播历史|用户|打赏|内容]
        const giftMatches = convertedContent.match(/\[直播\|([^|]+)\|(?:礼物|打赏)\|([^\]]+)\]/g);
        if (giftMatches) {
            convertedContent = convertedContent.replace(/\[直播\|([^|]+)\|礼物\|([^\]]+)\]/g, '[直播历史|$1|礼物|$2]');
            convertedContent = convertedContent.replace(/\[直播\|([^|]+)\|打赏\|([^\]]+)\]/g, '[直播历史|$1|打赏|$2]');
            conversionCount += giftMatches.length;
        }

            // 转换推荐互动格式: [直播|推荐互动|内容] -> [直播历史|推荐互动|内容]
            const recommendMatches = convertedContent.match(/\[直播\|推荐互动\|([^\]]+)\]/g);
            if (recommendMatches) {
                convertedContent = convertedContent.replace(/\[直播\|推荐互动\|([^\]]+)\]/g, '[直播历史|推荐互动|$1]');
                conversionCount += recommendMatches.length;
            }

            // 转换本场人数格式: [直播|本场人数|数字] -> [直播历史|本场人数|数字]
            const audienceMatches = convertedContent.match(/\[直播\|本场人数\|(\d+)\]/g);
            if (audienceMatches) {
                convertedContent = convertedContent.replace(/\[直播\|本场人数\|(\d+)\]/g, '[直播历史|本场人数|$1]');
                conversionCount += audienceMatches.length;
            }

                    // 转换其他可能的直播格式 (兼容旧格式)
        const otherMatches = convertedContent.match(/\[直播\|([^|]+)\|([^\]]+)\]/g);
        if (otherMatches) {
            // 排除已经处理过的格式
            const filteredMatches = otherMatches.filter(match =>
                !match.includes('弹幕|') &&
                !match.includes('礼物|') &&
                !match.includes('打赏|') &&
                !match.includes('推荐互动|') &&
                !match.includes('本场人数|')
            );
            if (filteredMatches.length > 0) {
                convertedContent = convertedContent.replace(/\[直播\|([^|]+)\|([^\]]+)\]/g, (match, p1, p2) => {
                    if (!match.includes('弹幕|') &&
                        !match.includes('礼物|') &&
                        !match.includes('打赏|') &&
                        !match.includes('推荐互动|') &&
                        !match.includes('本场人数|')) {
                        return `[直播历史|${p1}|${p2}]`;
                    }
                    return match;
                });
                conversionCount += filteredMatches.length;
            }
        }

            if (conversionCount > 0) {
                console.log(`[Live App] 转换了 ${conversionCount} 个直播格式`);
            }

            return convertedContent;
        }

        // 更新消息内容
        async updateMessageContent(messageIndex, newContent) {
            try {
                console.log(`[Live App] 正在更新消息 ${messageIndex}:`, newContent.substring(0, 100) + '...');

                // 方法1: 使用全局chat数组直接更新
                const chat = window['chat'];
                if (chat && Array.isArray(chat) && chat[messageIndex]) {
                    const originalContent = chat[messageIndex].mes;
                    chat[messageIndex].mes = newContent;

                    // 如果消息有swipes，也需要更新
                    if (chat[messageIndex].swipes && chat[messageIndex].swipe_id !== undefined) {
                        chat[messageIndex].swipes[chat[messageIndex].swipe_id] = newContent;
                    }

                    // 标记聊天数据已被修改
                    if (window.chat_metadata) {
                        window.chat_metadata.tainted = true;
                    }

                    console.log(`[Live App] 已更新消息 ${messageIndex}，原内容长度:${originalContent.length}，新内容长度:${newContent.length}`);
                    return true;
                }

                // 方法2: 尝试通过编辑器功能更新
                if (window.mobileContextEditor && window.mobileContextEditor.modifyMessage) {
                    await window.mobileContextEditor.modifyMessage(messageIndex, newContent);
                    return true;
                }

                // 方法3: 尝试通过context-editor更新
                if (window.contextEditor && window.contextEditor.modifyMessage) {
                    await window.contextEditor.modifyMessage(messageIndex, newContent);
                    return true;
                }

                console.warn('[Live App] 没有找到有效的消息更新方法');
                return false;
            } catch (error) {
                console.error('[Live App] 更新消息内容失败:', error);
                return false;
            }
        }

        // 保存聊天数据
        async saveChatData() {
            try {
                console.log('[Live App] 开始保存聊天数据...');

                // 方法1: 使用SillyTavern的保存函数
                if (typeof window.saveChatConditional === 'function') {
                    await window.saveChatConditional();
                    console.log('[Live App] 已通过saveChatConditional保存聊天数据');
                    return true;
                }

                // 方法2: 使用延迟保存
                if (typeof window.saveChatDebounced === 'function') {
                    window.saveChatDebounced();
                    console.log('[Live App] 已通过saveChatDebounced保存聊天数据');
                    // 等待一下确保保存完成
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return true;
                }

                // 方法3: 使用编辑器的保存功能
                if (window.mobileContextEditor && typeof window.mobileContextEditor.saveChatData === 'function') {
                    await window.mobileContextEditor.saveChatData();
                    console.log('[Live App] 已通过mobileContextEditor保存聊天数据');
                    return true;
                }

                // 方法4: 使用context-editor的保存功能
                if (window.contextEditor && typeof window.contextEditor.saveChatData === 'function') {
                    await window.contextEditor.saveChatData();
                    console.log('[Live App] 已通过contextEditor保存聊天数据');
                    return true;
                }

                // 方法5: 尝试手动保存
                try {
                    if (window.jQuery && window.chat && window.this_chid) {
                        const response = await window.jQuery.ajax({
                            type: 'POST',
                            url: '/api/chats/save',
                            data: JSON.stringify({
                                ch_name: window.characters[window.this_chid]?.name || 'unknown',
                                file_name: window.chat_metadata?.file_name || 'default',
                                chat: window.chat,
                                avatar_url: window.characters[window.this_chid]?.avatar || 'none'
                            }),
                            cache: false,
                            dataType: 'json',
                            contentType: 'application/json'
                        });
                        console.log('[Live App] 已通过手动AJAX保存聊天数据');
                        return true;
                    }
                } catch (ajaxError) {
                    console.warn('[Live App] 手动AJAX保存失败:', ajaxError);
                }

                console.warn('[Live App] 没有找到有效的保存方法');
                return false;
            } catch (error) {
                console.error('[Live App] 保存聊天数据失败:', error);
                return false;
            }
        }

        // 测试转换功能
        testConversion() {
            const testContent = `这是一条测试消息
[直播|小明|弹幕|主播你好！今天吃的什么呀？]
[直播|小红|礼物|璀璨火箭*2]
[直播|推荐互动|回答小明的弹幕问题]
[直播|推荐互动|感谢小红的礼物]
[直播|本场人数|55535]
测试结束`;

            console.log('原始内容:', testContent);
            const converted = this.convertLiveFormats(testContent);
            console.log('转换后内容:', converted);

            return converted;
        }

        // 显示开始直播模态框
        showStartLiveModal() {
            const modal = document.createElement('div');
            modal.className = 'live-modal';
            modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>开始直播</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>直播内容</label>
                        <textarea id="liveContentInput" placeholder="输入这次直播的内容..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>直播分类</label>
                        <div class="category-buttons">
                            <button class="category-btn" data-category="游戏">游戏</button>
                            <button class="category-btn" data-category="闲谈">闲谈</button>
                            <button class="category-btn" data-category="才艺">才艺</button>
                            <button class="category-btn" data-category="户外">户外</button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelStartLive">取消</button>
                    <button class="btn btn-primary" id="confirmStartLive">开播</button>
                </div>
            </div>
        `;

            document.body.appendChild(modal);

            // 绑定模态框事件
            this.bindStartLiveModalEvents(modal);
        }

        // 绑定开始直播模态框事件
        bindStartLiveModalEvents(modal) {
            const closeBtn = modal.querySelector('.modal-close');
            const cancelBtn = modal.querySelector('#cancelStartLive');
            const confirmBtn = modal.querySelector('#confirmStartLive');
            const categoryBtns = modal.querySelectorAll('.category-btn');
            const contentInput = modal.querySelector('#liveContentInput');

            let selectedCategory = '';

            // 分类按钮点击
            categoryBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    categoryBtns.forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    selectedCategory = btn.getAttribute('data-category');
                });
            });

            // 关闭模态框
            const closeModal = () => {
                document.body.removeChild(modal);
            };

            closeBtn.addEventListener('click', closeModal);
            cancelBtn.addEventListener('click', closeModal);

            // 确认开播
            confirmBtn.addEventListener('click', () => {
                const content = contentInput.value.trim();
                if (!content) {
                    this.showToast('请输入直播内容', 'warning');
                    return;
                }

                this.startLive(content, selectedCategory);
                closeModal();
            });
        }

        // 开始直播
        async startLive(content, category = '') {
            try {
                this.liveContent = content;
                this.liveCategory = category;
                this.isLiving = true;

                // 发送开播消息到SillyTavern
                let message = `开启直播，内容为：${content}`;
                if (category && this.categoryReplies[category]) {
                    message += `\n${this.categoryReplies[category]}`;
                }

                await this.sendToSillyTavern(message);

                // 更新界面
                this.updateAppContent();

                this.showToast('直播已开始', 'success');
            } catch (error) {
                console.error('[Live App] 开始直播失败:', error);
                this.showToast('开始直播失败', 'error');
            }
        }

        // 结束直播
        async stopLive() {
            try {
                // 显示转换进度提示
                this.showToast('正在转换直播格式为历史记录...', 'info');

                // 在结束直播前，先转换格式
                await this.convertLiveToHistory();

                this.isLiving = false;
                this.liveContent = '';
                this.liveCategory = '';
                this.audienceCount = 0;
                this.danmuList = [];
                this.giftList = [];
                this.recommendInteractions = [];

                // 发送结束直播消息到SillyTavern
                await this.sendToSillyTavern('关闭直播，计算本次直播收益');

                // 更新界面
                this.updateAppContent();

                this.showToast('直播已结束，所有直播格式已转换为历史记录', 'success');
            } catch (error) {
                console.error('[Live App] 结束直播失败:', error);
                this.showToast('结束直播失败: ' + error.message, 'error');
            }
        }

        // 显示互动模态框
        showInteractionModal() {
            const modal = document.createElement('div');
            modal.className = 'live-modal';
            modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>直播互动</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>互动内容</label>
                        <textarea id="interactionInput" placeholder="输入互动内容..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelInteraction">取消</button>
                    <button class="btn btn-primary" id="confirmInteraction">发送</button>
                </div>
            </div>
        `;

            document.body.appendChild(modal);

            // 绑定模态框事件
            this.bindInteractionModalEvents(modal);
        }

        // 绑定互动模态框事件
        bindInteractionModalEvents(modal) {
            const closeBtn = modal.querySelector('.modal-close');
            const cancelBtn = modal.querySelector('#cancelInteraction');
            const confirmBtn = modal.querySelector('#confirmInteraction');
            const interactionInput = modal.querySelector('#interactionInput');

            // 关闭模态框
            const closeModal = () => {
                document.body.removeChild(modal);
            };

            closeBtn.addEventListener('click', closeModal);
            cancelBtn.addEventListener('click', closeModal);

            // 确认发送
            confirmBtn.addEventListener('click', () => {
                const content = interactionInput.value.trim();
                if (!content) {
                    this.showToast('请输入互动内容', 'warning');
                    return;
                }

                this.sendInteraction(content);
                closeModal();
            });
        }

        // 发送互动
        async sendInteraction(content) {
            try {
                const message = `开启直播，内容为：${content}`;
                await this.sendToSillyTavern(message);
                this.showToast('互动已发送', 'success');
            } catch (error) {
                console.error('[Live App] 发送互动失败:', error);
                this.showToast('发送互动失败', 'error');
            }
        }

        // 发送推荐操作
        async sendRecommendationAction(action) {
            try {
                console.log('[Live App] 开始发送推荐互动:', action);
                const message = `开启直播，内容为：${action}`;
                console.log('[Live App] 发送的消息:', message);

                const result = await this.sendToSillyTavern(message);
                console.log('[Live App] 发送结果:', result);

                if (result) {
                    this.showToast('推荐互动已发送', 'success');
                } else {
                    this.showToast('发送推荐互动失败', 'error');
                }
            } catch (error) {
                console.error('[Live App] 发送推荐互动失败:', error);
                this.showToast('发送推荐互动失败', 'error');
            }
        }

        // 发送消息到SillyTavern（完全按照shop-app模式）
        async sendToSillyTavern(message) {
            try {
                console.log('[Live App] 🔄 使用新版发送方法 v2.0 - 发送消息到SillyTavern:', message);

                // 方法1: 直接使用DOM元素（与消息app相同的方式）
                const originalInput = document.getElementById('send_textarea');
                const sendButton = document.getElementById('send_but');

                if (!originalInput || !sendButton) {
                    console.error('[Live App] 找不到输入框或发送按钮元素');
                    return this.sendToSillyTavernBackup(message);
                }

                // 检查输入框是否可用
                if (originalInput.disabled) {
                    console.warn('[Live App] 输入框被禁用');
                    return false;
                }

                // 检查发送按钮是否可用
                if (sendButton.classList.contains('disabled')) {
                    console.warn('[Live App] 发送按钮被禁用');
                    return false;
                }

                // 设置值
                originalInput.value = message;
                console.log('[Live App] 已设置输入框值:', originalInput.value);

                // 触发输入事件
                originalInput.dispatchEvent(new Event('input', { bubbles: true }));
                originalInput.dispatchEvent(new Event('change', { bubbles: true }));

                // 延迟点击发送按钮
                await new Promise(resolve => setTimeout(resolve, 300));
                sendButton.click();
                console.log('[Live App] 已点击发送按钮');

                return true;

            } catch (error) {
                console.error('[Live App] 发送消息时出错:', error);
                return this.sendToSillyTavernBackup(message);
            }
        }

        // 备用发送方法（完全按照shop-app模式）
        async sendToSillyTavernBackup(message) {
            try {
                console.log('[Live App] 尝试备用发送方法:', message);

                // 尝试查找其他可能的输入框
                const textareas = document.querySelectorAll('textarea');
                const inputs = document.querySelectorAll('input[type="text"]');

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
                console.error('[Live App] 备用发送方法失败:', error);
                return false;
            }
        }

        // 格式化时间
        formatTime(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }

        // 显示提示消息
        showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `live-toast ${type}`;
            toast.textContent = message;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.classList.add('show');
            }, 100);

            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 3000);
        }

        // 销毁应用
        destroy() {
            console.log('[Live App] 直播应用销毁');

            // 清理定时器
            if (this.contextCheckInterval) {
                clearInterval(this.contextCheckInterval);
                this.contextCheckInterval = null;
            }

            // 清理事件监听器
            this.eventListenersSetup = false;
        }
    }

    // 导出到全局
    window.LiveApp = LiveApp;

    // 全局函数：获取直播应用内容
    window.getLiveAppContent = function () {
        console.log('[Live App] 获取直播应用内容');

        // 确保LiveApp已经初始化
        if (!window.liveAppInstance) {
            console.log('[Live App] 创建直播应用实例');
            window.liveAppInstance = new LiveApp();
        }

        return window.liveAppInstance.getAppContent();
    };

    // 全局函数：绑定直播应用事件
    window.bindLiveAppEvents = function () {
        console.log('[Live App] 绑定直播应用事件');

        // 确保LiveApp已经初始化
        if (!window.liveAppInstance) {
            console.log('[Live App] 创建直播应用实例');
            window.liveAppInstance = new LiveApp();
        }

        // 延迟绑定事件，确保DOM已准备好
        setTimeout(() => {
            // 绑定事件
            window.liveAppInstance.bindEvents();

            // 启动实时监控
            if (window.liveAppInstance.setupContextMonitor) {
                window.liveAppInstance.setupContextMonitor();
            }
        }, 100);
    };

    // 测试转换功能的全局函数
    window.testLiveConversion = function () {
        console.log('[Live App] 开始测试转换功能...');

        if (!window.liveAppInstance) {
            console.log('[Live App] 创建直播应用实例');
            window.liveAppInstance = new LiveApp();
        }

        return window.liveAppInstance.testConversion();
    };

    // 手动触发转换的全局函数
    window.convertLiveToHistory = function () {
        console.log('[Live App] 手动触发转换...');

        if (!window.liveAppInstance) {
            console.log('[Live App] 创建直播应用实例');
            window.liveAppInstance = new LiveApp();
        }

        return window.liveAppInstance.convertLiveToHistory();
    };

    // 测试推荐互动点击的全局函数
    window.testRecommendationClick = function () {
        console.log('[Live App] 测试推荐互动点击...');

        // 查找推荐互动项目
        const recommendationItems = document.querySelectorAll('.recommendation-item');
        console.log('[Live App] 找到推荐项数量:', recommendationItems.length);

        if (recommendationItems.length > 0) {
            // 点击第一个推荐项
            const firstItem = recommendationItems[0];
            const action = firstItem.getAttribute('data-action');
            console.log('[Live App] 即将点击推荐项:', action);

            // 模拟点击事件
            firstItem.click();
            return true;
        } else {
            console.log('[Live App] 没有找到推荐项');
            return false;
        }
    };

    // 调试推荐互动状态的全局函数
window.debugRecommendationStatus = function () {
    console.log('[Live App] 调试推荐互动状态...');

    const recommendationItems = document.querySelectorAll('.recommendation-item');
    console.log('[Live App] 推荐项数量:', recommendationItems.length);

    recommendationItems.forEach((item, index) => {
        const action = item.getAttribute('data-action');
        const hasClickListener = item.onclick !== null;
        console.log(`[Live App] 推荐项 ${index + 1}:`, {
            action: action,
            hasClickListener: hasClickListener,
            element: item
        });
    });

    // 检查应用实例状态
    if (window.liveAppInstance) {
        console.log('[Live App] 应用实例状态:', {
            isLiving: window.liveAppInstance.isLiving,
            recommendInteractions: window.liveAppInstance.recommendInteractions.length
        });
    }

    return {
        itemCount: recommendationItems.length,
        appInstance: !!window.liveAppInstance
    };
};

// 测试打赏格式解析的全局函数
window.testGiftParsing = function () {
    console.log('[Live App] 测试礼物/打赏格式解析...');

    const testContent = `测试内容
[直播|络络单推人|打赏|小电视飞船*1]
[直播|用户A|礼物|璀璨火箭*2]
[直播|用户B|打赏|星光棒*5]
[直播|用户C|礼物|鲜花*10]
测试结束`;

    if (!window.liveAppInstance) {
        console.log('[Live App] 创建直播应用实例');
        window.liveAppInstance = new LiveApp();
    }

    const result = window.liveAppInstance.parseLiveContent(testContent);
    console.log('[Live App] 解析结果:', result);

    return result;
};

}
