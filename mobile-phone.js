/**
 * 手机前端框架
 * 可爱的iOS风格手机界面
 */

class MobilePhone {
    constructor() {
        this.isVisible = false;
        this.currentApp = null;
        this.apps = {};
        this.appStack = []; // 添加应用栈来管理页面导航
        this.currentAppState = null; // 当前应用状态
        this.init();
    }

    init() {
        this.createPhoneButton();
        this.createPhoneContainer();
        this.registerApps();
        this.startClock();
    }

    // 创建弹出按钮
    createPhoneButton() {
        try {
            // 检查是否已经存在按钮
            const existingButton = document.getElementById('mobile-phone-trigger');
            if (existingButton) {
                console.log('[Mobile Phone] 按钮已存在，移除旧按钮');
                existingButton.remove();
            }

            const button = document.createElement('button');
            button.id = 'mobile-phone-trigger';
            button.className = 'mobile-phone-trigger';
            button.innerHTML = '📱';
            button.title = '打开手机界面';
            button.addEventListener('click', () => this.togglePhone());

            // 确保body存在
            if (!document.body) {
                console.error('[Mobile Phone] document.body 不存在，延迟创建按钮');
                setTimeout(() => this.createPhoneButton(), 100);
                return;
            }

            document.body.appendChild(button);
            console.log('[Mobile Phone] 手机按钮创建成功');
        } catch (error) {
            console.error('[Mobile Phone] 创建按钮时发生错误:', error);
        }
    }

    // 创建手机容器
    createPhoneContainer() {
        try {
            // 检查是否已经存在容器
            const existingContainer = document.getElementById('mobile-phone-container');
            if (existingContainer) {
                console.log('[Mobile Phone] 容器已存在，移除旧容器');
                existingContainer.remove();
            }

            const container = document.createElement('div');
            container.id = 'mobile-phone-container';
            container.className = 'mobile-phone-container';
            container.style.display = 'none';

            container.innerHTML = `
                <div class="mobile-phone-overlay"></div>
                <div class="mobile-phone-frame">
                    <div class="mobile-phone-screen">
                        <!-- 状态栏 -->
                        <div class="mobile-status-bar">
                            <div class="status-left">
                                <span class="time" id="mobile-time">08:08</span>
                            </div>
                            <div class="status-center">
                                <div class="dynamic-island"></div>
                            </div>
                            <div class="status-right">
                                <span class="battery">
                                    <span class="battery-icon">🔋</span>
                                    <span class="battery-text">100%</span>
                                </span>
                            </div>
                        </div>

                        <!-- 主内容区域 -->
                        <div class="mobile-content" id="mobile-content">
                            <!-- 主界面 -->
                            <div class="home-screen" id="home-screen">
                                <!-- 时间天气卡片 -->
                                <div class="weather-card">
                                    <div class="weather-time">
                                        <span class="current-time" id="home-time">08:08</span>
                                        <span class="current-date" id="home-date">08/21</span>
                                    </div>
                                    <div class="weather-info">
                                        <span class="weather-desc">多云转小雨 · 上海</span>
                                    </div>
                                </div>


                                <!-- 应用图标网格 -->
                                <div class="app-grid">
                                    <div class="app-row">
                                        <div class="app-icon" data-app="messages">
                                            <div class="app-icon-bg pink">💬</div>
                                            <span class="app-label">信息</span>
                                        </div>
                                        <div class="app-icon" data-app="gallery" style="display: none;">
                                            <div class="app-icon-bg blue">📸</div>
                                            <span class="app-label">相册</span>
                                        </div>
                                        <div class="app-icon" data-app="task">
                                            <div class="app-icon-bg purple">📰</div>
                                            <span class="app-label">任务</span>
                                        </div>
                                        <div class="app-icon" data-app="settings">
                                            <div class="app-icon-bg purple">⚙️</div>
                                            <span class="app-label">设置</span>
                                        </div>
                                        <div class="app-icon" data-app="mail" style="display: none;">
                                            <div class="app-icon-bg orange">✉️</div>
                                            <span class="app-label">邮件</span>
                                        </div>
                                    </div>
                                    <div class="app-row">
                                        <div class="app-icon" data-app="forum">
                                            <div class="app-icon-bg red">📰</div>
                                            <span class="app-label">论坛</span>
                                        </div>

                                        <div class="app-icon" data-app="shop">
                                            <div class="app-icon-bg purple">购</div>
                                            <span class="app-label">购物</span>
                                        </div>
                                        <div class="app-icon" data-app="backpack">
                                            <div class="app-icon-bg orange">🎒</div>
                                            <span class="app-label">背包</span>
                                        </div>
                                    </div>
                                     <div class="app-row">
                                        <div class="app-icon" data-app="live">
                                            <div class="app-icon-bg red">🎬</div>
                                            <span class="app-label">直播</span>
                                        </div>
                                        <div class="app-icon" data-app="weibo">
                                            <div class="app-icon-bg orange">📱</div>
                                            <span class="app-label">微博</span>
                                        </div>
                                        <div class="app-icon" data-app="api">
                                            <div class="app-icon-bg orange"></div>
                                            <span class="app-label">api</span>
                                        </div>
                                     </div>
                                </div>
                                <!-- 底部小动物装饰 -->
                                <div class="bottom-decoration">
                                    <div class="cute-animal">🐱</div>
                                    <div class="cute-animal">🐶</div>
                                </div>
                            </div>

                            <!-- 应用界面容器 -->
                            <div class="app-screen" id="app-screen" style="display: none;">
                                <div class="app-header" id="app-header">
                                    <button class="back-button" id="back-button">
                                        <span class="back-icon">←</span>
                                    </button>
                                    <h1 class="app-title" id="app-title">应用</h1>
                                    <div class="app-header-right" id="app-header-right">
                                        <!-- 动态功能按钮将在这里添加 -->
                                    </div>
                                </div>
                                <div class="app-content" id="app-content">
                                    <!-- 应用内容将在这里动态加载 -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // 确保body存在
            if (!document.body) {
                console.error('[Mobile Phone] document.body 不存在，延迟创建容器');
                setTimeout(() => this.createPhoneContainer(), 100);
                return;
            }

            document.body.appendChild(container);
            this.bindEvents();
            console.log('[Mobile Phone] 手机容器创建成功');
        } catch (error) {
            console.error('[Mobile Phone] 创建容器时发生错误:', error);
        }
    }

    // 绑定事件
    bindEvents() {
        // 点击遮罩层关闭
        document.querySelector('.mobile-phone-overlay').addEventListener('click', () => {
            this.hidePhone();
        });

        // 返回按钮
        document.getElementById('back-button').addEventListener('click', () => {
            this.handleBackButton();
        });

        // 应用图标点击事件
        document.querySelectorAll('.app-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                const appName = e.currentTarget.getAttribute('data-app');
                this.openApp(appName);
            });
        });
    }

    // 处理返回按钮
    handleBackButton() {
        console.log('[Mobile Phone] 处理返回按钮，当前应用栈长度:', this.appStack.length);
        console.log('[Mobile Phone] 当前应用栈:', JSON.stringify(this.appStack, null, 2));

        // 检查是否在应用的根页面
        if (this.currentAppState) {
            const isRootPage = this.isAppRootPage(this.currentAppState);
            console.log('[Mobile Phone] 是否在应用根页面:', isRootPage);

            if (isRootPage) {
                // 在根页面，直接返回主界面
                console.log('[Mobile Phone] 在应用根页面，返回主界面');
                this.goHome();
                return;
            }
        }

        if (this.appStack.length > 1) {
            // 如果有应用栈，返回上一个状态
            this.appStack.pop();
            const previousState = this.appStack[this.appStack.length - 1];
            console.log('[Mobile Phone] 返回到上一个状态:', JSON.stringify(previousState, null, 2));
            this.restoreAppState(previousState);
        } else {
            // 否则返回主界面
            console.log('[Mobile Phone] 应用栈为空或只有一个元素，返回主界面');
            this.goHome();
        }
    }

    // 判断是否在应用的根页面
    isAppRootPage(state) {
        if (!state) return false;

        // 消息应用的根页面只有消息列表
        if (state.app === 'messages') {
            return state.view === 'messageList' || state.view === 'main' || state.view === 'list';
            // addFriend、messageDetail等都不是根页面，应该可以返回到消息列表
        }

        // 论坛应用的根页面是main视图或没有view属性（主列表）
        if (state.app === 'forum') {
            return state.view === 'main' || !state.view || state.view === 'list';
        }

        // 其他应用的根页面是main视图
        return state.view === 'main';
    }

    // 恢复应用状态
    restoreAppState(state) {
        console.log('[Mobile Phone] 恢复应用状态:', JSON.stringify(state, null, 2));
        this.currentAppState = state;
        this.updateAppHeader(state);

        // 如果是消息应用的特殊状态
        if (state.app === 'messages') {
            if (state.view === 'messageList' || state.view === 'list') {
                // 直接调用messageApp的内部方法，不触发状态推送
                if (window.messageApp) {
                    window.messageApp.currentView = 'list';
                    window.messageApp.currentFriendId = null;
                    window.messageApp.currentFriendName = null;
                    window.messageApp.updateAppContent();
                }
            } else if (state.view === 'messageDetail') {
                // 直接调用messageApp的内部方法，不触发状态推送
                if (window.messageApp) {
                    window.messageApp.currentView = 'messageDetail';
                    window.messageApp.currentFriendId = state.friendId;
                    window.messageApp.currentFriendName = state.friendName;
                    window.messageApp.updateAppContent();
                }
            } else if (state.view === 'addFriend') {
                // 直接调用messageApp的内部方法，不触发状态推送
                if (window.messageApp) {
                    window.messageApp.currentView = 'addFriend';
                    window.messageApp.currentTab = 'add';
                    window.messageApp.updateAppContent();
                }
            }
        } else if (state.app === 'forum') {
            // 如果是论坛应用的特殊状态
            if (state.view === 'threadDetail' && state.threadId) {
                // 恢复论坛帖子详情视图
                if (window.forumUI) {
                    window.forumUI.currentThreadId = state.threadId;
                    document.getElementById('forum-content').innerHTML = window.forumUI.getThreadDetailHTML(state.threadId);
                    window.forumUI.bindReplyEvents();
                }
            } else {
                // 默认显示主列表
                if (window.forumUI) {
                    window.forumUI.currentThreadId = null;
                    document.getElementById('forum-content').innerHTML = window.forumUI.getThreadListHTML();
                }
            }
        }
    }

    // 更新应用头部
    updateAppHeader(state) {
        const titleElement = document.getElementById('app-title');
        const headerRight = document.getElementById('app-header-right');

        if (!state) {
            titleElement.textContent = '应用';
            headerRight.innerHTML = '';
            return;
        }

        // 设置标题
        titleElement.textContent = state.title || this.apps[state.app]?.name || '应用';

        // 清除旧的功能按钮
        headerRight.innerHTML = '';

        // 根据应用状态添加功能按钮
        if (state.app === 'messages') {
            if (state.view === 'messageList' || state.view === 'list') {
                // 消息列表页面：添加好友按钮
                const addFriendBtn = document.createElement('button');
                addFriendBtn.className = 'app-header-btn';
                addFriendBtn.innerHTML = '➕';
                addFriendBtn.title = '添加好友';
                addFriendBtn.addEventListener('click', () => this.showAddFriend());
                headerRight.appendChild(addFriendBtn);
            } else if (state.view === 'messageDetail') {
                // 消息详情页面：添加刷新按钮
                const refreshBtn = document.createElement('button');
                refreshBtn.className = 'app-header-btn';
                refreshBtn.innerHTML = '🔄';
                refreshBtn.title = '刷新消息';
                refreshBtn.addEventListener('click', () => this.refreshMessageDetail());
                headerRight.appendChild(refreshBtn);
            } else if (state.view === 'addFriend') {
                // 添加好友页面：可以添加保存按钮或其他功能
                const saveBtn = document.createElement('button');
                saveBtn.className = 'app-header-btn';
                saveBtn.innerHTML = '✅';
                saveBtn.title = '保存';
                saveBtn.addEventListener('click', () => this.saveAddFriend());
                headerRight.appendChild(saveBtn);
            }
        } else if (state.app === 'gallery') {
            // 相册应用：添加选择按钮
            const selectBtn = document.createElement('button');
            selectBtn.className = 'app-header-btn';
            selectBtn.innerHTML = '✓';
            selectBtn.title = '选择';
            selectBtn.addEventListener('click', () => this.toggleGallerySelect());
            headerRight.appendChild(selectBtn);
        } else if (state.app === 'forum') {
            // 论坛应用：根据不同视图添加不同按钮
            if (state.view === 'threadDetail') {
                // 帖子详情页面：添加刷新按钮
                const refreshBtn = document.createElement('button');
                refreshBtn.className = 'app-header-btn';
                refreshBtn.innerHTML = '🔄';
                refreshBtn.title = '刷新';
                refreshBtn.addEventListener('click', () => {
                    if (window.forumUI) {
                        window.forumUI.refreshForum();
                    }
                });
                headerRight.appendChild(refreshBtn);
            } else {
                // 论坛主页：添加发帖和刷新按钮
                const postBtn = document.createElement('button');
                postBtn.className = 'app-header-btn';
                postBtn.innerHTML = '✏️';
                postBtn.title = '发帖';
                postBtn.addEventListener('click', () => {
                    if (window.forumUI) {
                        window.forumUI.showPostDialog();
                    }
                });
                headerRight.appendChild(postBtn);

                const refreshBtn = document.createElement('button');
                refreshBtn.className = 'app-header-btn';
                refreshBtn.innerHTML = '🔄';
                refreshBtn.title = '刷新';
                refreshBtn.addEventListener('click', () => {
                    if (window.forumUI) {
                        window.forumUI.refreshForum();
                    }
                });
                headerRight.appendChild(refreshBtn);
            }
        } else if (state.app === 'settings') {
            // 设置应用：添加搜索按钮
            const searchBtn = document.createElement('button');
            searchBtn.className = 'app-header-btn';
            searchBtn.innerHTML = '🔍';
            searchBtn.title = '搜索';
            searchBtn.addEventListener('click', () => this.showSettingsSearch());
            headerRight.appendChild(searchBtn);
        } else if (state.app === 'shop') {
            // 购物应用：添加购物车和查看商品按钮
            const viewBtn = document.createElement('button');
            viewBtn.className = 'app-header-btn';
            viewBtn.innerHTML = '查看';
            viewBtn.title = '查看商品';
            viewBtn.addEventListener('click', () => {
                if (window.shopAppSendViewMessage) {
                    window.shopAppSendViewMessage();
                }
            });
            headerRight.appendChild(viewBtn);

            const cartBtn = document.createElement('button');
            cartBtn.className = 'app-header-btn cart-header-btn';
            cartBtn.innerHTML = '🛒';
            cartBtn.title = '购物车';
            cartBtn.addEventListener('click', () => {
                if (window.shopAppShowCart) {
                    window.shopAppShowCart();
                }
            });
            headerRight.appendChild(cartBtn);
        } else if (state.app === 'task') {
            // 任务应用：添加查看任务按钮
            const viewBtn = document.createElement('button');
            viewBtn.className = 'app-header-btn';
            viewBtn.innerHTML = '查看';
            viewBtn.title = '查看任务';
            viewBtn.addEventListener('click', () => {
                if (window.taskAppSendViewMessage) {
                    window.taskAppSendViewMessage();
                }
            });
            headerRight.appendChild(viewBtn);
        } else if (state.app === 'backpack') {
            // 背包应用：添加刷新和使用按钮
            const refreshBtn = document.createElement('button');
            refreshBtn.className = 'app-header-btn';
            refreshBtn.innerHTML = '🔄';
            refreshBtn.title = '刷新背包';
            refreshBtn.addEventListener('click', () => {
                if (window.backpackAppRefresh) {
                    window.backpackAppRefresh();
                }
            });
            headerRight.appendChild(refreshBtn);
        }
    }

    // 添加应用状态到栈
    pushAppState(state) {
        console.log('[Mobile Phone] 推送应用状态:', JSON.stringify(state, null, 2));
        this.appStack.push(state);
        this.currentAppState = state;
        this.updateAppHeader(state);
        console.log('[Mobile Phone] 推送后应用栈长度:', this.appStack.length);
    }

    // 刷新消息列表
    refreshMessages() {
        if (window.messageApp && window.messageApp.refreshMessageList) {
            window.messageApp.refreshMessageList();
        }
    }

    // 刷新消息详情
    refreshMessageDetail() {
        if (window.messageApp && window.messageApp.refreshMessageDetail) {
            window.messageApp.refreshMessageDetail();
        }
    }

    // 显示消息列表
    showMessageList() {
        console.log('[Mobile Phone] 显示消息列表');
        if (window.messageApp && window.messageApp.showMessageList) {
            window.messageApp.showMessageList();
        } else {
            console.error('[Mobile Phone] messageApp实例不存在或showMessageList方法不可用');
        }
    }

    // 显示消息详情
    showMessageDetail(friendId, friendName) {
        console.log('[Mobile Phone] 显示消息详情:', friendId, friendName);
        if (window.messageApp && window.messageApp.showMessageDetail) {
            window.messageApp.showMessageDetail(friendId, friendName);
        } else {
            console.error('[Mobile Phone] messageApp实例不存在或showMessageDetail方法不可用');
        }
    }

    // 切换相册选择模式
    toggleGallerySelect() {
        console.log('[Mobile Phone] 切换相册选择模式');
        // 这里可以添加相册选择模式的实现
    }

    // 显示设置搜索
    showSettingsSearch() {
        console.log('[Mobile Phone] 显示设置搜索');
        // 这里可以添加设置搜索的实现
    }

    // 显示添加好友界面
    showAddFriend() {
        console.log('[Mobile Phone] 显示添加好友界面');
        if (window.messageApp && window.messageApp.showAddFriend) {
            window.messageApp.showAddFriend();
        } else {
            console.error('[Mobile Phone] messageApp实例不存在或showAddFriend方法不可用');
        }
    }

    // 保存添加好友
    saveAddFriend() {
        console.log('[Mobile Phone] 保存添加好友');
        if (window.messageApp && window.messageApp.addFriend) {
            window.messageApp.addFriend();
        } else {
            console.error('[Mobile Phone] messageApp实例不存在或addFriend方法不可用');
        }
    }

    // 注册应用
    registerApps() {
        this.apps = {
            messages: {
                name: '信息',
                content: null, // 将由message-app动态生成
                isCustomApp: true,
                customHandler: this.handleMessagesApp.bind(this)
            },
            gallery: {
                name: '相册',
                content: `
                    <div class="gallery-app">
                        <div class="photo-grid">
                            <div class="photo-item">🖼️</div>
                            <div class="photo-item">🌸</div>
                            <div class="photo-item">🌙</div>
                            <div class="photo-item">⭐</div>
                            <div class="photo-item">🎀</div>
                            <div class="photo-item">💐</div>
                        </div>
                    </div>
                `
            },
            settings: {
                name: '设置',
                content: null, // 将由样式配置管理器动态生成
                isCustomApp: true,
                customHandler: this.handleSettingsApp.bind(this)
            },
            forum: {
                name: '论坛',
                content: null, // 将由论坛UI动态生成
                isCustomApp: true,
                customHandler: this.handleForumApp.bind(this)
            },
            weibo: {
                name: '微博',
                content: null, // 将由微博UI动态生成
                isCustomApp: true,
                customHandler: this.handleWeiboApp.bind(this)
            },
            api: {
                name: 'API设置',
                content: null, // 将由统一API设置面板动态生成
                isCustomApp: true,
                customHandler: this.handleApiApp.bind(this)
            },
            diary: {
                name: '日记',
                content: `
                    <div class="diary-app">
                        <div class="diary-header">
                            <h3>我的日记 📝</h3>
                        </div>
                        <div class="diary-content">
                            <div class="diary-entry">
                                <div class="entry-date">今天</div>
                                <div class="entry-text">今天天气很好，心情也很棒！在SillyTavern里遇到了很多有趣的角色～</div>
                            </div>
                            <div class="diary-entry">
                                <div class="entry-date">昨天</div>
                                <div class="entry-text">学习了新的前端技术，感觉很有成就感。</div>
                            </div>
                        </div>
                    </div>
                `
            },
            mail: {
                name: '邮件',
                content: `
                    <div class="mail-app">
                        <div class="mail-list">
                            <div class="mail-item unread">
                                <div class="mail-sender">SillyTavern</div>
                                <div class="mail-subject">欢迎使用手机界面</div>
                                <div class="mail-preview">这是一个可爱的手机界面框架...</div>
                                <div class="mail-time">1小时前</div>
                            </div>
                            <div class="mail-item">
                                <div class="mail-sender">系统通知</div>
                                <div class="mail-subject">插件更新提醒</div>
                                <div class="mail-preview">Mobile Context插件已更新...</div>
                                <div class="mail-time">2小时前</div>
                            </div>
                        </div>
                    </div>
                `
            },
            shop: {
                name: '购物',
                content: null, // 将由shop-app动态生成
                isCustomApp: true,
                customHandler: this.handleShopApp.bind(this)
            },
            backpack: {
                name: '背包',
                content: null, // 将由backpack-app动态生成
                isCustomApp: true,
                customHandler: this.handleBackpackApp.bind(this)
            },
            task: {
                name: '任务',
                content: null, // 将由task-app动态生成
                isCustomApp: true,
                customHandler: this.handleTaskApp.bind(this)
            },
            live: {
                name: '直播',
                content: null, // 将由live-app动态生成
                isCustomApp: true,
                customHandler: this.handleLiveApp.bind(this)
            }
        };
    }

    // 显示/隐藏手机界面
    togglePhone() {
        if (this.isVisible) {
            this.hidePhone();
        } else {
            this.showPhone();
        }
    }

    showPhone() {
        const container = document.getElementById('mobile-phone-container');
        container.style.display = 'flex';
        setTimeout(() => {
            container.classList.add('active');
        }, 10);
        this.isVisible = true;

        // 初始化样式配置管理器（如果还没有初始化）
        this.initStyleConfigManager();

        // 如果有当前应用状态，恢复应用界面
        if (this.currentAppState) {
            console.log('[Mobile Phone] 恢复应用界面状态:', this.currentAppState);
            // 显示应用界面，隐藏主界面
            document.getElementById('home-screen').style.display = 'none';
            document.getElementById('app-screen').style.display = 'block';

            // 恢复应用状态
            this.restoreAppState(this.currentAppState);
        }
    }

    hidePhone() {
        const container = document.getElementById('mobile-phone-container');
        container.classList.remove('active');
        setTimeout(() => {
            container.style.display = 'none';
        }, 300);
        this.isVisible = false;
    }

    // 初始化样式配置管理器
    initStyleConfigManager() {
        // 检查是否已经初始化
        if (window.styleConfigManager && window.styleConfigManager.isConfigReady && window.styleConfigManager.isConfigReady()) {
            console.log('[Mobile Phone] 样式配置管理器已经初始化并准备就绪');
            return;
        }

        if (window.StyleConfigManager && !window.styleConfigManager) {
            console.log('[Mobile Phone] 创建样式配置管理器实例');
            try {
                window.styleConfigManager = new window.StyleConfigManager();
                console.log('[Mobile Phone] ✅ 样式配置管理器实例创建成功');
            } catch (error) {
                console.error('[Mobile Phone] ❌ 创建样式配置管理器实例失败:', error);
            }
        } else if (!window.StyleConfigManager) {
            // 如果 StyleConfigManager 类还未加载，尝试加载
            console.log('[Mobile Phone] StyleConfigManager 类尚未加载，尝试动态加载');
            this.loadStyleConfigManager();
        } else {
            console.log('[Mobile Phone] 样式配置管理器实例已存在');
        }
    }

    // 动态加载样式配置管理器
    async loadStyleConfigManager() {
        try {
            console.log('[Mobile Phone] 🔄 开始动态加载样式配置管理器...');

            // 检查脚本是否已经存在
            const existingScript = document.querySelector('script[src*="style-config-manager.js"]');
            if (existingScript) {
                console.log('[Mobile Phone] 样式配置管理器脚本已存在，等待加载完成');
                // 等待一段时间让脚本完成加载
                setTimeout(() => {
                    if (window.StyleConfigManager && !window.styleConfigManager) {
                        window.styleConfigManager = new window.StyleConfigManager();
                        console.log('[Mobile Phone] ✅ 延迟创建样式配置管理器实例成功');
                    }
                }, 1000);
                return;
            }

            // 创建脚本元素
            const script = document.createElement('script');
            script.src = '/scripts/extensions/third-party/mobile/app/style-config-manager.js';
            script.type = 'text/javascript';

            // 设置加载完成回调
            script.onload = () => {
                console.log('[Mobile Phone] ✅ 样式配置管理器脚本加载完成');

                // 等待一小段时间确保脚本完全执行
                setTimeout(() => {
                    if (window.StyleConfigManager && !window.styleConfigManager) {
                        try {
                            window.styleConfigManager = new window.StyleConfigManager();
                            console.log('[Mobile Phone] ✅ 样式配置管理器实例创建成功');
                        } catch (error) {
                            console.error('[Mobile Phone] ❌ 创建样式配置管理器实例失败:', error);
                        }
                    } else if (window.styleConfigManager) {
                        console.log('[Mobile Phone] 样式配置管理器实例已存在');
                    } else {
                        console.warn('[Mobile Phone] ⚠️ StyleConfigManager 类未正确加载');
                    }
                }, 500);
            };

            // 设置加载失败回调
            script.onerror = (error) => {
                console.error('[Mobile Phone] ❌ 样式配置管理器脚本加载失败:', error);
            };

            // 添加到页面
            document.head.appendChild(script);
            console.log('[Mobile Phone] 样式配置管理器脚本已添加到页面');

        } catch (error) {
            console.error('[Mobile Phone] ❌ 动态加载样式配置管理器失败:', error);
        }
    }

    // 打开应用
    openApp(appName) {
        const app = this.apps[appName];
        if (!app) return;

        this.currentApp = appName;

        // 创建应用状态
        const appState = {
            app: appName,
            title: app.name,
            view: appName === 'messages' ? 'messageList' : 'main' // 消息应用直接设为messageList
        };

        // 清空应用栈并添加新状态
        this.appStack = [appState];
        this.currentAppState = appState;
        this.updateAppHeader(appState);

        // 处理自定义应用
        if (app.isCustomApp && app.customHandler) {
            app.customHandler();
        } else {
            document.getElementById('app-content').innerHTML = app.content;
        }

        // 显示应用界面，隐藏主界面
        document.getElementById('home-screen').style.display = 'none';
        document.getElementById('app-screen').style.display = 'block';

        // 添加动画效果
        document.getElementById('app-screen').classList.add('slide-in');
        setTimeout(() => {
            document.getElementById('app-screen').classList.remove('slide-in');
        }, 300);
    }

    // 处理论坛应用
    async handleForumApp() {
        try {
            console.log('[Mobile Phone] 开始处理论坛应用...');

            // 显示加载状态
            document.getElementById('app-content').innerHTML = `
                <div class="loading-placeholder">
                    <div class="loading-icon">⏳</div>
                    <div class="loading-text">正在加载论坛...</div>
                </div>
            `;

            // 确保论坛UI模块已加载
            console.log('[Mobile Phone] 加载论坛UI模块...');
            await this.loadForumApp();

            // 推送论坛应用的初始状态到应用栈
            const initialState = {
                app: 'forum',
                title: '论坛',
                view: 'main'
            };
            this.pushAppState(initialState);

            // 获取当前应用状态
            const currentState = this.appStack[this.appStack.length - 1] || { view: 'main' };
            const view = currentState.view || 'main';

            console.log('[Mobile Phone] 当前论坛视图:', view);

            let content = '';

            if (view === 'forumControl') {
                // 显示论坛控制界面
                if (!window.getForumControlAppContent) {
                    throw new Error('getForumControlAppContent 函数未找到');
                }
                console.log('[Mobile Phone] 获取论坛控制内容...');
                content = window.getForumControlAppContent();
            } else {
                // 显示主论坛界面
                if (!window.getForumAppContent) {
                    throw new Error('getForumAppContent 函数未找到');
                }
                console.log('[Mobile Phone] 获取论坛主界面内容...');
                content = window.getForumAppContent();
            }

            if (!content || content.trim() === '') {
                throw new Error(`论坛${view === 'forumControl' ? '控制' : '主界面'}内容为空`);
            }

            document.getElementById('app-content').innerHTML = content;

            // 绑定相应的事件
            console.log('[Mobile Phone] 绑定论坛事件...');
            if (view === 'forumControl') {
                // 绑定论坛控制事件
                if (window.bindForumControlEvents) {
                    window.bindForumControlEvents();
                    console.log('[Mobile Phone] 论坛控制事件绑定完成');
                }
            } else {
                // 绑定主论坛事件
                if (window.bindForumEvents) {
                    window.bindForumEvents();
                    console.log('[Mobile Phone] 论坛主界面事件绑定完成');
                }
            }

            console.log('[Mobile Phone] ✅ 论坛应用加载完成');

        } catch (error) {
            console.error('[Mobile Phone] 处理论坛应用失败:', error);
            document.getElementById('app-content').innerHTML = `
                <div class="error-placeholder">
                    <div class="error-icon">❌</div>
                    <div class="error-text">论坛加载失败</div>
                    <div class="error-detail">${error.message}</div>
                    <button onclick="window.mobilePhone.handleForumApp()" class="retry-button">重试</button>
                </div>
            `;
        }
    }

    // 处理微博应用
    async handleWeiboApp() {
        try {
            console.log('[Mobile Phone] 开始处理微博应用...');

            // 显示加载状态
            document.getElementById('app-content').innerHTML = `
                <div class="loading-placeholder">
                    <div class="loading-icon">⏳</div>
                    <div class="loading-text">正在加载微博...</div>
                </div>
            `;

            // 确保微博UI模块已加载
            console.log('[Mobile Phone] 加载微博UI模块...');
            await this.loadWeiboApp();

            // 获取当前应用状态
            const currentState = this.appStack[this.appStack.length - 1] || { view: 'main' };
            const view = currentState.view || 'main';

            console.log('[Mobile Phone] 当前微博视图:', view);

            let content = '';

            if (view === 'weiboControl') {
                // 显示微博控制界面
                if (!window.getWeiboControlAppContent) {
                    throw new Error('getWeiboControlAppContent 函数未找到');
                }
                console.log('[Mobile Phone] 获取微博控制内容...');
                content = window.getWeiboControlAppContent();
            } else {
                // 显示主微博界面
                if (!window.getWeiboAppContent) {
                    throw new Error('getWeiboAppContent 函数未找到');
                }
                console.log('[Mobile Phone] 获取微博主界面内容...');
                content = window.getWeiboAppContent();
            }

            if (!content || content.trim() === '') {
                throw new Error(`微博${view === 'weiboControl' ? '控制' : '主界面'}内容为空`);
            }

            document.getElementById('app-content').innerHTML = content;

            // 绑定相应的事件
            console.log('[Mobile Phone] 绑定微博事件...');
            if (view === 'weiboControl') {
                // 绑定微博控制事件
                if (window.bindWeiboControlEvents) {
                    window.bindWeiboControlEvents();
                    console.log('[Mobile Phone] 微博控制事件绑定完成');
                }
            } else {
                // 绑定主微博事件
                if (window.bindWeiboEvents) {
                    window.bindWeiboEvents();
                    console.log('[Mobile Phone] 微博主界面事件绑定完成');
                }
            }

            console.log('[Mobile Phone] ✅ 微博应用加载完成');

        } catch (error) {
            console.error('[Mobile Phone] 处理微博应用失败:', error);
            document.getElementById('app-content').innerHTML = `
                <div class="error-placeholder">
                    <div class="error-icon">❌</div>
                    <div class="error-text">微博加载失败</div>
                    <div class="error-detail">${error.message}</div>
                    <button onclick="window.mobilePhone.handleWeiboApp()" class="retry-button">重试</button>
                </div>
            `;
        }
    }

    // 处理设置应用
    async handleSettingsApp() {
        try {
            console.log('[Mobile Phone] 开始处理设置应用...');

            // 显示加载状态
            document.getElementById('app-content').innerHTML = `
                <div class="loading-placeholder">
                    <div class="loading-icon">⏳</div>
                    <div class="loading-text">正在加载样式设置...</div>
                </div>
            `;

            // 确保样式配置管理器已加载
            console.log('[Mobile Phone] 加载样式配置管理器模块...');
            await this.loadStyleConfigApp();

            // 直接使用全局函数获取内容
            if (!window.getStyleConfigAppContent) {
                throw new Error('getStyleConfigAppContent 函数未找到');
            }

            // 获取样式配置应用内容
            console.log('[Mobile Phone] 获取样式配置内容...');
            const content = window.getStyleConfigAppContent();

            if (!content || content.trim() === '') {
                throw new Error('样式配置应用内容为空');
            }

            document.getElementById('app-content').innerHTML = content;

            // 绑定样式配置应用事件
            console.log('[Mobile Phone] 绑定样式配置事件...');
            if (window.bindStyleConfigEvents) {
                // bindStyleConfigEvents 现在会自动等待管理器准备就绪
                window.bindStyleConfigEvents();
            }

            // 如果样式配置管理器还没有准备就绪，显示加载状态
            if (window.styleConfigManager && !window.styleConfigManager.isConfigReady()) {
                console.log('[Mobile Phone] 等待样式配置管理器准备就绪...');

                // 添加加载提示
                const loadingHint = document.createElement('div');
                loadingHint.className = 'config-loading-hint';
                loadingHint.innerHTML = `
                    <div style="
                        position: fixed;
                        top: 20px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: #2196F3;
                        color: white;
                        padding: 10px 20px;
                        border-radius: 20px;
                        font-size: 14px;
                        z-index: 10000;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    ">
                        ⏳ 正在初始化样式配置管理器...
                    </div>
                `;
                document.body.appendChild(loadingHint);

                // 等待准备就绪后移除提示
                window.styleConfigManager.waitForReady().then(() => {
                    console.log('[Mobile Phone] 样式配置管理器已准备就绪');
                    if (loadingHint.parentNode) {
                        loadingHint.remove();
                    }
                }).catch(error => {
                    console.error('[Mobile Phone] 等待样式配置管理器失败:', error);
                    if (loadingHint.parentNode) {
                        loadingHint.innerHTML = `
                            <div style="
                                position: fixed;
                                top: 20px;
                                left: 50%;
                                transform: translateX(-50%);
                                background: #ff4444;
                                color: white;
                                padding: 10px 20px;
                                border-radius: 20px;
                                font-size: 14px;
                                z-index: 10000;
                                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                            ">
                                ❌ 样式配置管理器初始化失败
                            </div>
                        `;
                        setTimeout(() => loadingHint.remove(), 3000);
                    }
                });
            }

            console.log('[Mobile Phone] ✅ 设置应用加载完成');
        } catch (error) {
            console.error('[Mobile Phone] 处理设置应用失败:', error);
            document.getElementById('app-content').innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <div class="error-title">设置应用加载失败</div>
                    <div class="error-message">${error.message}</div>
                    <button onclick="window.mobilePhone.handleSettingsApp()" class="retry-button">重试</button>
                </div>
            `;
        }
    }

    // 处理消息应用
    async handleMessagesApp() {
        try {
            console.log('[Mobile Phone] 开始处理消息应用...');

            // 显示加载状态
            document.getElementById('app-content').innerHTML = `
                <div class="loading-placeholder">
                    <div class="loading-icon">⏳</div>
                    <div class="loading-text">正在加载消息应用...</div>
                </div>
            `;

            // 确保message-app已加载
            console.log('[Mobile Phone] 加载消息应用模块...');
            await this.loadMessageApp();

            // 直接使用全局函数获取内容
            if (!window.getMessageAppContent) {
                throw new Error('getMessageAppContent 函数未找到');
            }

            // 获取消息应用内容
            console.log('[Mobile Phone] 获取应用内容...');
            const content = window.getMessageAppContent();

            if (!content || content.trim() === '') {
                throw new Error('消息应用内容为空');
            }

            document.getElementById('app-content').innerHTML = content;

            // 绑定消息应用事件
            console.log('[Mobile Phone] 绑定事件...');
            if (window.bindMessageAppEvents) {
                window.bindMessageAppEvents();
            }

            // 确保应用状态正确（不重新创建，使用已有状态）
            if (!this.currentAppState || this.currentAppState.app !== 'messages') {
                const messageState = {
                    app: 'messages',
                    title: '信息',
                    view: 'messageList'
                };
                this.currentAppState = messageState;
                this.appStack = [messageState];
                this.updateAppHeader(messageState);
            }

            console.log('[Mobile Phone] 消息应用加载完成');
        } catch (error) {
            console.error('[Mobile Phone] 加载消息应用失败:', error);

            // 显示友好的错误信息
            document.getElementById('app-content').innerHTML = `
                <div class="error-message">
                    <div class="error-icon">⚠️</div>
                    <div class="error-title">加载失败</div>
                    <div class="error-details">${error.message}</div>
                    <button class="retry-button" onclick="window.MobilePhone.openApp('messages')">
                        重试
                    </button>
                </div>
            `;
        }
    }

    // 处理购物应用
    async handleShopApp() {
        try {
            console.log('[Mobile Phone] 开始处理购物应用...');

            // 显示加载状态
            document.getElementById('app-content').innerHTML = `
                <div class="loading-placeholder">
                    <div class="loading-icon">⏳</div>
                    <div class="loading-text">正在加载购物应用...</div>
                </div>
            `;

            // 确保shop-app已加载
            console.log('[Mobile Phone] 加载购物应用模块...');
            await this.loadShopApp();

            // 直接使用全局函数获取内容
            if (!window.getShopAppContent) {
                throw new Error('getShopAppContent 函数未找到');
            }

            // 获取购物应用内容
            console.log('[Mobile Phone] 获取购物应用内容...');
            const content = window.getShopAppContent();

            if (!content || content.trim() === '') {
                throw new Error('购物应用内容为空');
            }

            document.getElementById('app-content').innerHTML = content;

            // 绑定购物应用事件
            console.log('[Mobile Phone] 绑定购物应用事件...');
            if (window.bindShopAppEvents) {
                window.bindShopAppEvents();
            }

            console.log('[Mobile Phone] ✅ 购物应用加载完成');

        } catch (error) {
            console.error('[Mobile Phone] 处理购物应用失败:', error);
            document.getElementById('app-content').innerHTML = `
                <div class="error-placeholder">
                    <div class="error-icon">❌</div>
                    <div class="error-text">购物应用加载失败</div>
                    <div class="error-detail">${error.message}</div>
                    <button onclick="window.mobilePhone.handleShopApp()" class="retry-button">重试</button>
                </div>
            `;
        }
    }

    // 处理背包应用
    async handleBackpackApp() {
        try {
            console.log('[Mobile Phone] 开始处理背包应用...');

            // 显示加载状态
            document.getElementById('app-content').innerHTML = `
                <div class="loading-placeholder">
                    <div class="loading-icon">⏳</div>
                    <div class="loading-text">正在加载背包应用...</div>
                </div>
            `;

            // 确保backpack-app已加载
            console.log('[Mobile Phone] 加载背包应用模块...');
            await this.loadBackpackApp();

            // 直接使用全局函数获取内容
            if (!window.getBackpackAppContent) {
                throw new Error('getBackpackAppContent 函数未找到');
            }

            // 获取背包应用内容
            console.log('[Mobile Phone] 获取背包应用内容...');
            const content = window.getBackpackAppContent();

            if (!content || content.trim() === '') {
                throw new Error('背包应用内容为空');
            }

            document.getElementById('app-content').innerHTML = content;

            // 绑定背包应用事件
            console.log('[Mobile Phone] 绑定背包应用事件...');
            if (window.bindBackpackAppEvents) {
                window.bindBackpackAppEvents();
            }

            console.log('[Mobile Phone] ✅ 背包应用加载完成');

        } catch (error) {
            console.error('[Mobile Phone] 处理背包应用失败:', error);
            document.getElementById('app-content').innerHTML = `
                <div class="error-placeholder">
                    <div class="error-icon">❌</div>
                    <div class="error-text">背包应用加载失败</div>
                    <div class="error-detail">${error.message}</div>
                    <button onclick="window.mobilePhone.handleBackpackApp()" class="retry-button">重试</button>
                </div>
            `;
        }
    }

    // 处理任务应用
    async handleTaskApp() {
        try {
            console.log('[Mobile Phone] 开始处理任务应用...');

            // 显示加载状态
            document.getElementById('app-content').innerHTML = `
                <div class="loading-placeholder">
                    <div class="loading-icon">⏳</div>
                    <div class="loading-text">正在加载任务应用...</div>
                </div>
            `;

            // 确保task-app已加载
            console.log('[Mobile Phone] 加载任务应用模块...');
            await this.loadTaskApp();

            // 直接使用全局函数获取内容
            if (!window.getTaskAppContent) {
                throw new Error('getTaskAppContent 函数未找到');
            }

            // 获取任务应用内容
            console.log('[Mobile Phone] 获取任务应用内容...');
            const content = window.getTaskAppContent();

            if (!content || content.trim() === '') {
                throw new Error('任务应用内容为空');
            }

            document.getElementById('app-content').innerHTML = content;

            // 绑定任务应用事件
            console.log('[Mobile Phone] 绑定任务应用事件...');
            if (window.bindTaskAppEvents) {
                window.bindTaskAppEvents();
            }

            console.log('[Mobile Phone] ✅ 任务应用加载完成');

        } catch (error) {
            console.error('[Mobile Phone] 处理任务应用失败:', error);
            document.getElementById('app-content').innerHTML = `
                <div class="error-placeholder">
                    <div class="error-icon">❌</div>
                    <div class="error-text">任务应用加载失败</div>
                    <div class="error-detail">${error.message}</div>
                    <button onclick="window.mobilePhone.handleTaskApp()" class="retry-button">重试</button>
                </div>
            `;
        }
    }

    // 处理直播应用
    async handleLiveApp() {
        try {
            console.log('[Mobile Phone] 开始处理直播应用...');

            // 显示加载状态
            document.getElementById('app-content').innerHTML = `
                <div class="loading-placeholder">
                    <div class="loading-icon">⏳</div>
                    <div class="loading-text">正在加载直播应用...</div>
                </div>
            `;

            // 确保live-app已加载
            console.log('[Mobile Phone] 加载直播应用模块...');
            await this.loadLiveApp();

            // 直接使用全局函数获取内容
            if (!window.getLiveAppContent) {
                throw new Error('getLiveAppContent 函数未找到');
            }

            // 获取直播应用内容
            console.log('[Mobile Phone] 获取直播应用内容...');
            const content = window.getLiveAppContent();

            if (!content || content.trim() === '') {
                throw new Error('直播应用内容为空');
            }

            document.getElementById('app-content').innerHTML = content;

            // 绑定直播应用事件
            console.log('[Mobile Phone] 绑定直播应用事件...');
            if (window.bindLiveAppEvents) {
                window.bindLiveAppEvents();
            }

            console.log('[Mobile Phone] ✅ 直播应用加载完成');

        } catch (error) {
            console.error('[Mobile Phone] 处理直播应用失败:', error);
            document.getElementById('app-content').innerHTML = `
                <div class="error-placeholder">
                    <div class="error-icon">❌</div>
                    <div class="error-text">直播应用加载失败</div>
                    <div class="error-detail">${error.message}</div>
                    <button onclick="window.mobilePhone.handleLiveApp()" class="retry-button">重试</button>
                </div>
            `;
        }
    }

    // 处理统一API设置应用
    async handleApiApp() {
        try {
            console.log('[Mobile Phone] 开始处理统一API设置应用...');

            // 显示加载状态
            document.getElementById('app-content').innerHTML = `
                <div class="loading-placeholder">
                    <div class="loading-icon">⏳</div>
                    <div class="loading-text">正在加载API设置...</div>
                </div>
            `;

            // 确保必要的模块已加载
            console.log('[Mobile Phone] 确保论坛和微博模块已加载...');
            await Promise.all([
                this.loadForumApp().catch(e => console.warn('[Mobile Phone] 论坛模块加载失败:', e)),
                this.loadWeiboApp().catch(e => console.warn('[Mobile Phone] 微博模块加载失败:', e))
            ]);

            // 生成统一的API设置面板HTML
            const content = this.getUnifiedApiSettingsHTML();

            document.getElementById('app-content').innerHTML = content;

            // 绑定统一API设置事件
            console.log('[Mobile Phone] 绑定统一API设置事件...');
            this.bindUnifiedApiEvents();

            console.log('[Mobile Phone] ✅ 统一API设置应用加载完成');

        } catch (error) {
            console.error('[Mobile Phone] 处理统一API设置应用失败:', error);
            document.getElementById('app-content').innerHTML = `
                <div class="error-placeholder">
                    <div class="error-icon">❌</div>
                    <div class="error-text">API设置加载失败</div>
                    <div class="error-detail">${error.message}</div>
                    <button onclick="window.mobilePhone.handleApiApp()" class="retry-button">重试</button>
                </div>
            `;
        }
    }

    // 生成统一的API设置面板HTML
    getUnifiedApiSettingsHTML() {
        // 获取当前设置
        const forumSettings = window.forumManager ? window.forumManager.currentSettings : {
            selectedStyle: '贴吧老哥',
            autoUpdate: true,
            threshold: 10
        };

        const weiboSettings = window.weiboManager ? window.weiboManager.currentSettings : {
            selectedStyle: '微博网友',
            autoUpdate: true,
            threshold: 10
        };

        return `
            <div class="unified-api-settings">


                <div class="settings-tabs">
                    <div class="tab-buttons">
                        <button class="tab-btn active" data-tab="forum">论坛</button>
                        <button class="tab-btn" data-tab="weibo">微博</button>
                        <button class="tab-btn" data-tab="api">API</button>
                    </div>

                    <div class="tab-content" id="forum-tab" style="display: block;">
                        <div class="setting-group">
                            <label>论坛风格:</label>
                            <select id="forum-style-select">
                                <option value="贴吧老哥" ${forumSettings.selectedStyle === '贴吧老哥' ? 'selected' : ''}>贴吧老哥</option>
                                <option value="知乎精英" ${forumSettings.selectedStyle === '知乎精英' ? 'selected' : ''}>知乎精英</option>
                                <option value="小红书种草" ${forumSettings.selectedStyle === '小红书种草' ? 'selected' : ''}>小红书种草</option>
                                <option value="抖音达人" ${forumSettings.selectedStyle === '抖音达人' ? 'selected' : ''}>抖音达人</option>
                                <option value="B站UP主" ${forumSettings.selectedStyle === 'B站UP主' ? 'selected' : ''}>B站UP主</option>
                                <option value="海角老司机" ${forumSettings.selectedStyle === '海角老司机' ? 'selected' : ''}>海角老司机</option>
                                <option value="八卦小报记者" ${forumSettings.selectedStyle === '八卦小报记者' ? 'selected' : ''}>八卦小报记者</option>
                                <option value="天涯老涯友" ${forumSettings.selectedStyle === '天涯老涯友' ? 'selected' : ''}>天涯老涯友</option>
                                <option value="校园论坛" ${forumSettings.selectedStyle === '校园论坛' ? 'selected' : ''}>校园论坛</option>
                                <option value="微博" ${forumSettings.selectedStyle === '微博' ? 'selected' : ''}>微博</option>
                            </select>
                        </div>

                        <div class="setting-group">
                            <label>自定义前缀:</label>
                            <textarea id="forum-custom-prefix" placeholder="论坛生成的自定义提示词...">${window.forumStyles ? window.forumStyles.getCustomPrefix() : ''}</textarea>
                        </div>

                        <div class="setting-group">
                            <label>消息阈值:</label>
                            <input type="number" id="forum-threshold" value="${forumSettings.threshold}" min="1" max="100">
                        </div>

                        <div class="setting-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="forum-auto-update" ${forumSettings.autoUpdate ? 'checked' : ''}>
                                自动生成论坛内容
                            </label>
                        </div>

                        <div class="action-buttons">
                            <button id="generate-forum-now" class="btn-primary">🚀 立即生成论坛</button>
                            <button id="clear-forum-content" class="btn-danger">🗑️ 清除论坛内容</button>
                        </div>
                    </div>

                    <div class="tab-content" id="weibo-tab" style="display: none;">
                        <div class="setting-group">
                            <label>微博风格:</label>
                            <select id="weibo-style-select">
                                <option value="微博网友" ${weiboSettings.selectedStyle === '微博网友' ? 'selected' : ''}>微博网友</option>
                                <option value="娱乐博主" ${weiboSettings.selectedStyle === '娱乐博主' ? 'selected' : ''}>娱乐博主</option>
                                <option value="时尚达人" ${weiboSettings.selectedStyle === '时尚达人' ? 'selected' : ''}>时尚达人</option>
                                <option value="美食博主" ${weiboSettings.selectedStyle === '美食博主' ? 'selected' : ''}>美食博主</option>
                                <option value="旅游博主" ${weiboSettings.selectedStyle === '旅游博主' ? 'selected' : ''}>旅游博主</option>
                                <option value="科技博主" ${weiboSettings.selectedStyle === '科技博主' ? 'selected' : ''}>科技博主</option>
                                <option value="搞笑博主" ${weiboSettings.selectedStyle === '搞笑博主' ? 'selected' : ''}>搞笑博主</option>
                                <option value="情感博主" ${weiboSettings.selectedStyle === '情感博主' ? 'selected' : ''}>情感博主</option>
                                <option value="生活记录" ${weiboSettings.selectedStyle === '生活记录' ? 'selected' : ''}>生活记录</option>
                                <option value="热点讨论" ${weiboSettings.selectedStyle === '热点讨论' ? 'selected' : ''}>热点讨论</option>
                            </select>
                        </div>

                        <div class="setting-group">
                            <label>自定义前缀:</label>
                            <textarea id="weibo-custom-prefix" placeholder="微博生成的自定义提示词...">${window.weiboStyles ? window.weiboStyles.getCustomPrefix() : ''}</textarea>
                        </div>

                        <div class="setting-group">
                            <label>消息阈值:</label>
                            <input type="number" id="weibo-threshold" value="${weiboSettings.threshold}" min="1" max="100">
                        </div>

                        <div class="setting-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="weibo-auto-update" ${weiboSettings.autoUpdate ? 'checked' : ''}>
                                自动生成微博内容
                            </label>
                        </div>

                        <div class="action-buttons">
                            <button id="generate-weibo-now" class="btn-primary">🚀 立即生成微博</button>
                            <button id="clear-weibo-content" class="btn-danger">🗑️ 清除微博内容</button>
                        </div>
                    </div>

                    <div class="tab-content" id="api-tab" style="display: none;">
                        <div class="setting-group">
                            <label>API配置:</label>
                            <button id="open-api-config" class="btn-secondary">🔧 打开API配置面板</button>
                            <p class="setting-description">配置用于生成论坛和微博内容的API设置</p>
                        </div>

                        <div class="setting-group">
                            <label>状态监控:</label>
                            <div class="status-display">
                                <div class="status-item">
                                    <span class="status-label">论坛管理器:</span>
                                    <span id="forum-status" class="status-value">检查中...</span>
                                </div>
                                <div class="status-item">
                                    <span class="status-label">微博管理器:</span>
                                    <span id="weibo-status" class="status-value">检查中...</span>
                                </div>
                                <div class="status-item">
                                    <span class="status-label">API配置:</span>
                                    <span id="api-config-status" class="status-value">检查中...</span>
                                </div>
                            </div>
                        </div>

                        <div class="action-buttons">
                            <button id="refresh-status" class="btn-secondary">🔄 刷新状态</button>
                            <button id="reset-all-settings" class="btn-warning">⚠️ 重置所有设置</button>
                        </div>
                    </div>
                </div>

                <style>
                    .unified-api-settings {
                        padding: 20px 0;
                        max-width: 100%;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    }



                    .settings-tabs {
                        background: white;
                        border-radius: 10px;
                        overflow: hidden;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }

                    .tab-buttons {
                        display: flex;
                        background: #f5f5f5;
                        border-bottom: 1px solid #e0e0e0;
                    }

                    .tab-btn {
                        flex: 1;
                        padding: 15px 10px;
                        border: none;
                        background: transparent;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        color: #666;
                        transition: all 0.3s ease;
                    }

                    .tab-btn.active {
                        background: white;
                        color: #333;
                        border-bottom: 3px solid #007AFF;
                    }

                    .tab-btn:hover {
                        background: rgba(0,122,255,0.1);
                        color: #007AFF;
                    }

                    .tab-content {
                        padding: 25px;
                    }

                    .setting-group {
                        margin-bottom: 25px;
                    }

                    .setting-group label {
                        display: block;
                        margin-bottom: 8px;
                        font-weight: 600;
                        color: #333;
                        font-size: 14px;
                    }

                    .setting-group select,
                    .setting-group input[type="number"],
                    .setting-group textarea {
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e0e0e0;
                        border-radius: 8px;
                        font-size: 14px;
                        transition: border-color 0.3s ease;
                        box-sizing: border-box;
                    }

                    .setting-group select:focus,
                    .setting-group input:focus,
                    .setting-group textarea:focus {
                        outline: none;
                        border-color: #007AFF;
                        box-shadow: 0 0 0 3px rgba(0,122,255,0.1);
                    }

                    .setting-group textarea {
                        height: 80px;
                        resize: vertical;
                        font-family: monospace;
                    }

                    .checkbox-label {
                        display: flex !important;
                        align-items: center;
                        cursor: pointer;
                        font-weight: normal !important;
                    }

                    .checkbox-label input[type="checkbox"] {
                        width: auto !important;
                        margin-right: 10px;
                        transform: scale(1.2);
                    }

                    .action-buttons {
                        display: flex;
                        gap: 10px;
                        flex-wrap: wrap;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e0e0e0;
                    }

                    .action-buttons button {
                        flex: 1;
                        min-width: 140px;
                        padding: 12px 16px;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }

                    .btn-primary {
                        background: #007AFF;
                        color: white;
                    }

                    .btn-primary:hover {
                        background: #0056CC;
                        transform: translateY(-1px);
                    }

                    .btn-danger {
                        background: #FF3B30;
                        color: white;
                    }

                    .btn-danger:hover {
                        background: #CC2E24;
                        transform: translateY(-1px);
                    }

                    .btn-secondary {
                        background: #8E8E93;
                        color: white;
                    }

                    .btn-secondary:hover {
                        background: #6D6D70;
                        transform: translateY(-1px);
                    }

                    .btn-warning {
                        background: #FF9500;
                        color: white;
                    }

                    .btn-warning:hover {
                        background: #CC7700;
                        transform: translateY(-1px);
                    }

                    .status-display {
                        background: #f8f9fa;
                        border: 1px solid #e0e0e0;
                        border-radius: 8px;
                        padding: 15px;
                    }

                    .status-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;
                    }

                    .status-item:last-child {
                        margin-bottom: 0;
                    }

                    .status-label {
                        font-weight: 500;
                        color: #333;
                    }

                    .status-value {
                        font-family: monospace;
                        background: #e9ecef;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                    }

                    .setting-description {
                        margin-top: 5px;
                        font-size: 12px;
                        color: #666;
                        font-style: italic;
                    }

                    @media (max-width: 480px) {


                        .action-buttons {
                            flex-direction: column;
                        }

                        .action-buttons button {
                            flex: none;
                            width: 100%;
                        }
                    }
                </style>
            </div>
        `;
    }

    // 绑定统一API设置事件
    bindUnifiedApiEvents() {
        // 标签页切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchApiTab(tabName);
            });
        });

        // 论坛设置事件
        this.bindForumSettingsEvents();

        // 微博设置事件
        this.bindWeiboSettingsEvents();

        // API配置事件
        this.bindApiConfigEvents();

        // 初始化状态显示
        this.updateApiStatus();

        // 启动自动状态刷新（每2秒检查一次，最多检查30次）
        this.startApiStatusAutoRefresh();

        console.log('[Mobile Phone] 统一API设置事件绑定完成');
    }

    // 切换API设置标签页
    switchApiTab(tabName) {
        // 切换按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 切换内容显示
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`${tabName}-tab`).style.display = 'block';

        console.log('[Mobile Phone] 切换到API设置标签页:', tabName);
    }

    // 绑定论坛设置事件
    bindForumSettingsEvents() {
        // 论坛风格选择
        const forumStyleSelect = document.getElementById('forum-style-select');
        if (forumStyleSelect) {
            forumStyleSelect.addEventListener('change', (e) => {
                if (window.forumManager) {
                    window.forumManager.currentSettings.selectedStyle = e.target.value;
                    window.forumManager.saveSettings();
                    console.log('[Mobile Phone] 论坛风格已更新:', e.target.value);
                }
            });
        }

        // 论坛自定义前缀
        const forumPrefixTextarea = document.getElementById('forum-custom-prefix');
        if (forumPrefixTextarea) {
            forumPrefixTextarea.addEventListener('blur', (e) => {
                if (window.forumStyles) {
                    window.forumStyles.setCustomPrefix(e.target.value);
                    console.log('[Mobile Phone] 论坛自定义前缀已更新');
                }
            });
        }

        // 论坛消息阈值
        const forumThresholdInput = document.getElementById('forum-threshold');
        if (forumThresholdInput) {
            forumThresholdInput.addEventListener('change', (e) => {
                if (window.forumManager) {
                    window.forumManager.currentSettings.threshold = parseInt(e.target.value);
                    window.forumManager.saveSettings();
                    console.log('[Mobile Phone] 论坛消息阈值已更新:', e.target.value);
                }
            });
        }

        // 论坛自动更新
        const forumAutoUpdateCheckbox = document.getElementById('forum-auto-update');
        if (forumAutoUpdateCheckbox) {
            forumAutoUpdateCheckbox.addEventListener('change', (e) => {
                if (window.forumManager) {
                    window.forumManager.currentSettings.autoUpdate = e.target.checked;
                    window.forumManager.saveSettings();
                    console.log('[Mobile Phone] 论坛自动更新已更新:', e.target.checked);
                }
            });
        }

        // 立即生成论坛
        const generateForumBtn = document.getElementById('generate-forum-now');
        if (generateForumBtn) {
            generateForumBtn.addEventListener('click', async () => {
                if (window.forumManager) {
                    console.log('[Mobile Phone] 触发立即生成论坛');

                    // 显示处理中提示
                    MobilePhone.showToast('🔄 开始生成论坛内容...', 'processing');

                    try {
                        const result = await window.forumManager.generateForumContent(true);
                        if (result) {
                            MobilePhone.showToast('✅ 论坛内容生成成功！已插入到第1楼层', 'success');
                            // 刷新状态显示
                            setTimeout(() => this.updateApiStatus(), 500);
                        } else {
                            MobilePhone.showToast('❌ 论坛内容生成失败，请查看控制台了解详情', 'error');
                        }
                    } catch (error) {
                        console.error('[Mobile Phone] 论坛生成出错:', error);
                        MobilePhone.showToast(`❌ 论坛生成出错: ${error.message}`, 'error');
                    }
                } else {
                    MobilePhone.showToast('❌ 论坛管理器未初始化', 'error');
                }
            });
        }

        // 清除论坛内容
        const clearForumBtn = document.getElementById('clear-forum-content');
        if (clearForumBtn) {
            clearForumBtn.addEventListener('click', async () => {
                if (window.forumManager) {
                    if (confirm('确认清除所有论坛内容？')) {
                        console.log('[Mobile Phone] 触发清除论坛内容');

                        // 显示处理中提示
                        MobilePhone.showToast('🔄 正在清除论坛内容...', 'processing');

                        try {
                            await window.forumManager.clearForumContent();
                            MobilePhone.showToast('✅ 论坛内容已清除', 'success');
                            // 刷新状态显示
                            setTimeout(() => this.updateApiStatus(), 500);
                        } catch (error) {
                            console.error('[Mobile Phone] 清除论坛内容出错:', error);
                            MobilePhone.showToast(`❌ 清除论坛内容出错: ${error.message}`, 'error');
                        }
                    }
                } else {
                    MobilePhone.showToast('❌ 论坛管理器未初始化', 'error');
                }
            });
        }
    }

    // 绑定微博设置事件
    bindWeiboSettingsEvents() {
        // 微博风格选择
        const weiboStyleSelect = document.getElementById('weibo-style-select');
        if (weiboStyleSelect) {
            weiboStyleSelect.addEventListener('change', (e) => {
                if (window.weiboManager) {
                    window.weiboManager.currentSettings.selectedStyle = e.target.value;
                    window.weiboManager.saveSettings();
                    console.log('[Mobile Phone] 微博风格已更新:', e.target.value);
                }
            });
        }

        // 微博自定义前缀
        const weiboPrefixTextarea = document.getElementById('weibo-custom-prefix');
        if (weiboPrefixTextarea) {
            weiboPrefixTextarea.addEventListener('blur', (e) => {
                if (window.weiboStyles) {
                    window.weiboStyles.setCustomPrefix(e.target.value);
                    console.log('[Mobile Phone] 微博自定义前缀已更新');
                }
            });
        }

        // 微博消息阈值
        const weiboThresholdInput = document.getElementById('weibo-threshold');
        if (weiboThresholdInput) {
            weiboThresholdInput.addEventListener('change', (e) => {
                if (window.weiboManager) {
                    window.weiboManager.currentSettings.threshold = parseInt(e.target.value);
                    window.weiboManager.saveSettings();
                    console.log('[Mobile Phone] 微博消息阈值已更新:', e.target.value);
                }
            });
        }

        // 微博自动更新
        const weiboAutoUpdateCheckbox = document.getElementById('weibo-auto-update');
        if (weiboAutoUpdateCheckbox) {
            weiboAutoUpdateCheckbox.addEventListener('change', (e) => {
                if (window.weiboManager) {
                    window.weiboManager.currentSettings.autoUpdate = e.target.checked;
                    window.weiboManager.saveSettings();
                    console.log('[Mobile Phone] 微博自动更新已更新:', e.target.checked);
                }
            });
        }

        // 立即生成微博
        const generateWeiboBtn = document.getElementById('generate-weibo-now');
        if (generateWeiboBtn) {
            generateWeiboBtn.addEventListener('click', async () => {
                if (window.weiboManager) {
                    console.log('[Mobile Phone] 触发立即生成微博');

                    // 显示处理中提示
                    MobilePhone.showToast('🔄 开始生成微博内容...', 'processing');

                    try {
                        const result = await window.weiboManager.generateWeiboContent(true);
                        if (result) {
                            MobilePhone.showToast('✅ 微博内容生成成功！已插入到第1楼层', 'success');
                            // 刷新状态显示
                            setTimeout(() => this.updateApiStatus(), 500);
                        } else {
                            MobilePhone.showToast('❌ 微博内容生成失败，请查看控制台了解详情', 'error');
                        }
                    } catch (error) {
                        console.error('[Mobile Phone] 微博生成出错:', error);
                        MobilePhone.showToast(`❌ 微博生成出错: ${error.message}`, 'error');
                    }
                } else {
                    MobilePhone.showToast('❌ 微博管理器未初始化', 'error');
                }
            });
        }

        // 清除微博内容
        const clearWeiboBtn = document.getElementById('clear-weibo-content');
        if (clearWeiboBtn) {
            clearWeiboBtn.addEventListener('click', async () => {
                if (window.weiboManager) {
                    if (confirm('确认清除所有微博内容？')) {
                        console.log('[Mobile Phone] 触发清除微博内容');

                        // 显示处理中提示
                        MobilePhone.showToast('🔄 正在清除微博内容...', 'processing');

                        try {
                            await window.weiboManager.clearWeiboContent();
                            MobilePhone.showToast('✅ 微博内容已清除', 'success');
                            // 刷新状态显示
                            setTimeout(() => this.updateApiStatus(), 500);
                        } catch (error) {
                            console.error('[Mobile Phone] 清除微博内容出错:', error);
                            MobilePhone.showToast(`❌ 清除微博内容出错: ${error.message}`, 'error');
                        }
                    }
                } else {
                    MobilePhone.showToast('❌ 微博管理器未初始化', 'error');
                }
            });
        }
    }

    // 绑定API配置事件
    bindApiConfigEvents() {
        // 打开API配置面板
        const openApiConfigBtn = document.getElementById('open-api-config');
        if (openApiConfigBtn) {
            openApiConfigBtn.addEventListener('click', () => {
                if (window.mobileCustomAPIConfig) {
                    window.mobileCustomAPIConfig.showConfigPanel();
                } else {
                    alert('API配置模块未初始化');
                }
            });
        }

        // 刷新状态
        const refreshStatusBtn = document.getElementById('refresh-status');
        if (refreshStatusBtn) {
            refreshStatusBtn.addEventListener('click', () => {
                this.updateApiStatus();
            });
        }

        // 重置所有设置
        const resetAllBtn = document.getElementById('reset-all-settings');
        if (resetAllBtn) {
            resetAllBtn.addEventListener('click', () => {
                if (confirm('确认重置所有论坛和微博设置？这将恢复到默认配置。')) {
                    this.resetAllApiSettings();
                }
            });
        }
    }

    // 更新API状态显示
    updateApiStatus() {
        const forumStatusEl = document.getElementById('forum-status');
        const weiboStatusEl = document.getElementById('weibo-status');
        const apiConfigStatusEl = document.getElementById('api-config-status');

        // 详细的状态检查和调试信息
        console.log('[Mobile Phone] 开始状态检查...');
        console.log('[Mobile Phone] 论坛管理器:', {
            exists: !!window.forumManager,
            isInitialized: window.forumManager ? window.forumManager.isInitialized : false
        });
        console.log('[Mobile Phone] 微博管理器:', {
            exists: !!window.weiboManager,
            isInitialized: window.weiboManager ? window.weiboManager.isInitialized : false
        });

        if (forumStatusEl) {
            if (window.forumManager && window.forumManager.isInitialized) {
                // 检查是否正在处理
                if (window.forumManager.isProcessing) {
                    forumStatusEl.textContent = '🔄 正在生成论坛...';
                    forumStatusEl.style.color = '#007bff';
                } else {
                    forumStatusEl.textContent = '✅ 已就绪';
                    forumStatusEl.style.color = '#28a745';
                }
            } else if (window.forumManager) {
                forumStatusEl.textContent = '⚠️ 初始化中...';
                forumStatusEl.style.color = '#ffc107';
            } else {
                forumStatusEl.textContent = '❌ 未加载';
                forumStatusEl.style.color = '#dc3545';
            }
        }

        if (weiboStatusEl) {
            if (window.weiboManager && window.weiboManager.isInitialized) {
                // 检查是否正在处理
                if (window.weiboManager.isProcessing) {
                    weiboStatusEl.textContent = '🔄 正在生成微博...';
                    weiboStatusEl.style.color = '#007bff';
                } else {
                    weiboStatusEl.textContent = '✅ 已就绪';
                    weiboStatusEl.style.color = '#28a745';
                }
            } else if (window.weiboManager) {
                weiboStatusEl.textContent = '⚠️ 初始化中...';
                weiboStatusEl.style.color = '#ffc107';
            } else {
                weiboStatusEl.textContent = '❌ 未加载';
                weiboStatusEl.style.color = '#dc3545';
            }
        }

        if (apiConfigStatusEl) {
            if (window.mobileCustomAPIConfig && window.mobileCustomAPIConfig.isAPIAvailable && window.mobileCustomAPIConfig.isAPIAvailable()) {
                apiConfigStatusEl.textContent = '✅ 已配置';
                apiConfigStatusEl.style.color = '#28a745';
            } else if (window.mobileCustomAPIConfig) {
                apiConfigStatusEl.textContent = '⚠️ 未配置';
                apiConfigStatusEl.style.color = '#ffc107';
            } else {
                apiConfigStatusEl.textContent = '❌ 未加载';
                apiConfigStatusEl.style.color = '#dc3545';
            }
        }

        console.log('[Mobile Phone] API状态检查完成');
    }

    // 启动API状态自动刷新
    startApiStatusAutoRefresh() {
        let refreshCount = 0;
        const maxRefresh = 30; // 最多刷新30次（1分钟）

        const refreshInterval = setInterval(() => {
            refreshCount++;

            // 检查是否所有管理器都已初始化完成
            const forumReady = window.forumManager && window.forumManager.isInitialized;
            const weiboReady = window.weiboManager && window.weiboManager.isInitialized;
            const apiReady = window.mobileCustomAPIConfig && window.mobileCustomAPIConfig.isAPIAvailable && window.mobileCustomAPIConfig.isAPIAvailable();

            console.log(`[Mobile Phone] 自动状态刷新 #${refreshCount}:`, {
                forumReady,
                weiboReady,
                apiReady
            });

            // 更新状态显示
            this.updateApiStatus();

            // 如果所有服务都已就绪，或者达到最大刷新次数，停止自动刷新
            if ((forumReady && weiboReady) || refreshCount >= maxRefresh) {
                clearInterval(refreshInterval);
                console.log('[Mobile Phone] 自动状态刷新已停止:', {
                    reason: (forumReady && weiboReady) ? '所有服务已就绪' : '达到最大刷新次数',
                    totalRefreshes: refreshCount
                });
            }
        }, 2000); // 每2秒刷新一次

        console.log('[Mobile Phone] 已启动API状态自动刷新');
    }

    // 显示渐隐弹窗提示
    static showToast(message, type = 'info', duration = 2000) {
        // 移除已有的toast
        const existingToast = document.getElementById('mobile-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // 创建toast元素
        const toast = document.createElement('div');
        toast.id = 'mobile-toast';
        toast.className = `mobile-toast toast-${type}`;

        // 根据类型设置图标
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            processing: '🔄'
        };

        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icons[type] || icons.info}</span>
                <span class="toast-message">${message}</span>
            </div>
        `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .mobile-toast {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                border-radius: 12px;
                padding: 16px 24px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                z-index: 10000;
                min-width: 300px;
                max-width: 500px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
                transition: all 0.3s ease;
            }

            .mobile-toast.show {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }

            .mobile-toast.hide {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }

            .toast-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .toast-icon {
                font-size: 18px;
                flex-shrink: 0;
            }

            .toast-message {
                color: #333;
                line-height: 1.4;
                word-break: break-word;
            }

            .toast-success {
                border-left: 4px solid #28a745;
                background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
            }

            .toast-error {
                border-left: 4px solid #dc3545;
                background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
            }

            .toast-warning {
                border-left: 4px solid #ffc107;
                background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            }

            .toast-info {
                border-left: 4px solid #17a2b8;
                background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
            }

            .toast-processing {
                border-left: 4px solid #007bff;
                background: linear-gradient(135deg, #d1ecf1 0%, #c3e4f0 100%);
            }

            .toast-processing .toast-icon {
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;

        // 添加样式到头部（如果不存在）
        if (!document.getElementById('mobile-toast-styles')) {
            style.id = 'mobile-toast-styles';
            document.head.appendChild(style);
        }

        // 添加到body
        document.body.appendChild(toast);

        // 显示动画
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // 自动隐藏
        if (duration > 0) {
            setTimeout(() => {
                toast.classList.add('hide');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }, duration);
        }

        console.log(`[Mobile Phone] Toast显示: ${type} - ${message}`);
        return toast;
    }

    // 重置所有API设置
    resetAllApiSettings() {
        try {
            // 重置论坛设置
            if (window.forumManager) {
                window.forumManager.currentSettings = {
                    enabled: true,
                    selectedStyle: '贴吧老哥',
                    autoUpdate: true,
                    threshold: 10,
                    apiConfig: {
                        url: '',
                        apiKey: '',
                        model: ''
                    }
                };
                window.forumManager.saveSettings();
                console.log('[Mobile Phone] 论坛设置已重置');
            }

            // 重置微博设置
            if (window.weiboManager) {
                window.weiboManager.currentSettings = {
                    enabled: true,
                    selectedStyle: '微博网友',
                    autoUpdate: true,
                    threshold: 10,
                    apiConfig: {
                        url: '',
                        apiKey: '',
                        model: ''
                    }
                };
                window.weiboManager.saveSettings();
                console.log('[Mobile Phone] 微博设置已重置');
            }

            // 重置自定义前缀
            if (window.forumStyles) {
                window.forumStyles.setCustomPrefix('');
            }
            if (window.weiboStyles) {
                window.weiboStyles.setCustomPrefix('');
            }

            // 刷新界面
            this.handleApiApp();

            alert('所有设置已重置为默认值');
            console.log('[Mobile Phone] 所有API设置已重置');

        } catch (error) {
            console.error('[Mobile Phone] 重置设置时出错:', error);
            alert('重置设置时出错，请查看控制台');
        }
    }

    // 加载样式配置应用
    async loadStyleConfigApp() {
        console.log('[Mobile Phone] 开始加载样式配置管理器模块...');

        // 检查是否已加载
        if (window.getStyleConfigAppContent && window.bindStyleConfigEvents) {
            console.log('[Mobile Phone] Style Config 模块已存在，跳过加载');
            return Promise.resolve();
        }

        // 检查是否正在加载
        if (window._styleConfigLoading) {
            console.log('[Mobile Phone] Style Config 正在加载中，等待完成');
            return window._styleConfigLoading;
        }

        // 标记正在加载
        window._styleConfigLoading = new Promise((resolve, reject) => {
            let loadedCount = 0;
            const totalFiles = 2; // style-config-manager.css + style-config-manager.js

            const checkComplete = () => {
                loadedCount++;
                console.log(`[Mobile Phone] 已加载 ${loadedCount}/${totalFiles} 个样式配置文件`);
                if (loadedCount === totalFiles) {
                    console.log('[Mobile Phone] 所有样式配置文件加载完成，等待模块初始化...');

                    // 等待模块完全初始化
                    setTimeout(() => {
                        if (window.getStyleConfigAppContent && window.bindStyleConfigEvents) {
                            console.log('[Mobile Phone] ✅ Style Config 模块加载并初始化完成');
                            window._styleConfigLoading = null;
                            resolve();
                        } else {
                            console.error('[Mobile Phone] ❌ 样式配置模块加载完成但全局变量未正确设置');
                            console.log('[Mobile Phone] 检查结果:', {
                                getStyleConfigAppContent: !!window.getStyleConfigAppContent,
                                bindStyleConfigEvents: !!window.bindStyleConfigEvents
                            });
                            window._styleConfigLoading = null;
                            reject(new Error('样式配置模块初始化失败'));
                        }
                    }, 500); // 等待0.5秒让模块完成初始化
                }
            };

            const handleError = (name) => {
                console.error(`[Mobile Phone] ${name} 加载失败`);
                window._styleConfigLoading = null;
                reject(new Error(`${name} 加载失败`));
            };

            // 检查并移除已存在的样式配置标签
            const removeExistingTags = () => {
                const existingCss = document.querySelector('link[href*="style-config-manager.css"]');
                if (existingCss) {
                    console.log('[Mobile Phone] 移除已存在的 style-config-manager.css');
                    existingCss.remove();
                }

                const existingScript = document.querySelector('script[src*="style-config-manager.js"]');
                if (existingScript) {
                    console.log('[Mobile Phone] 移除已存在的 style-config-manager.js');
                    existingScript.remove();
                }
            };

            removeExistingTags();

            // 加载CSS文件
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = '/scripts/extensions/third-party/mobile/app/style-config-manager.css';
            cssLink.onload = () => {
                console.log('[Mobile Phone] style-config-manager.css 加载完成');
                checkComplete();
            };
            cssLink.onerror = () => handleError('style-config-manager.css');
            document.head.appendChild(cssLink);

            // 加载JS文件
            const jsScript = document.createElement('script');
            jsScript.src = '/scripts/extensions/third-party/mobile/app/style-config-manager.js';
            jsScript.onload = () => {
                console.log('[Mobile Phone] style-config-manager.js 加载完成');
                checkComplete();
            };
            jsScript.onerror = () => handleError('style-config-manager.js');
            document.head.appendChild(jsScript);
        });

        return window._styleConfigLoading;
    }

    // 加载论坛应用
        async loadForumApp() {
        console.log('[Mobile Phone] 开始加载论坛应用模块...');

        // 检查是否已加载 - 只检查必要的全局变量
        if (window.forumUI && window.getForumAppContent && window.bindForumEvents && window.forumControlApp && window.ForumAutoListener && window.forumManager && window.forumStyles) {
            console.log('[Mobile Phone] Forum App 模块已存在，跳过加载');
            return Promise.resolve();
        }

        // 检查是否正在加载
        if (window._forumAppLoading) {
            console.log('[Mobile Phone] Forum App 正在加载中，等待完成');
            return window._forumAppLoading;
        }

        // 标记正在加载
        window._forumAppLoading = new Promise((resolve, reject) => {
            let loadedCount = 0;
            const totalFiles = 7; // forum-ui.css + forum-control-app.css + forum-manager.js + forum-styles.js + forum-ui.js + forum-control-app.js + forum-auto-listener.js

            const checkComplete = () => {
                loadedCount++;
                console.log(`[Mobile Phone] 已加载 ${loadedCount}/${totalFiles} 个论坛文件`);
                if (loadedCount === totalFiles) {
                    console.log('[Mobile Phone] 所有论坛文件加载完成，等待模块初始化...');

                    // 等待论坛模块完全初始化
                    setTimeout(() => {
                        if (window.forumUI && window.getForumAppContent && window.bindForumEvents && window.forumControlApp && window.ForumAutoListener && window.forumManager && window.forumStyles) {
                            console.log('[Mobile Phone] ✅ Forum App 模块加载并初始化完成');
                            window._forumAppLoading = null;
                            resolve();
                        } else {
                            console.error('[Mobile Phone] ❌ 论坛模块加载完成但全局变量未正确设置');
                            console.log('[Mobile Phone] 检查结果:', {
                                forumUI: !!window.forumUI,
                                getForumAppContent: !!window.getForumAppContent,
                                bindForumEvents: !!window.bindForumEvents,
                                forumControlApp: !!window.forumControlApp,
                                ForumAutoListener: !!window.ForumAutoListener,
                                forumManager: !!window.forumManager,
                                forumStyles: !!window.forumStyles
                            });
                            window._forumAppLoading = null;
                            reject(new Error('论坛模块初始化失败'));
                        }
                    }, 1000); // 等待1秒让模块完成初始化
                }
            };

            const handleError = (name) => {
                console.error(`[Mobile Phone] ${name} 加载失败`);
                window._forumAppLoading = null;
                reject(new Error(`${name} 加载失败`));
            };



            // 加载CSS文件
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = './scripts/extensions/third-party/mobile/app/forum-app/forum-ui.css';
            cssLink.onload = () => {
                console.log('[Mobile Phone] forum-ui.css 加载完成');
                checkComplete();
            };
            cssLink.onerror = () => handleError('forum-ui.css');
            document.head.appendChild(cssLink);

            // 加载控制应用CSS文件
            const controlCssLink = document.createElement('link');
            controlCssLink.rel = 'stylesheet';
            controlCssLink.href = './scripts/extensions/third-party/mobile/app/forum-app/forum-control-app.css';
            controlCssLink.onload = () => {
                console.log('[Mobile Phone] forum-control-app.css 加载完成');
                checkComplete();
            };
            controlCssLink.onerror = () => handleError('forum-control-app.css');
            document.head.appendChild(controlCssLink);

            // 加载论坛管理器 JS文件
            const managerScript = document.createElement('script');
            managerScript.src = './scripts/extensions/third-party/mobile/app/forum-app/forum-manager.js';
            managerScript.onload = () => {
                console.log('[Mobile Phone] forum-manager.js 加载完成');
                checkComplete();
            };
            managerScript.onerror = () => handleError('forum-manager.js');
            document.head.appendChild(managerScript);

            // 加载论坛样式管理器 JS文件
            const stylesScript = document.createElement('script');
            stylesScript.src = './scripts/extensions/third-party/mobile/app/forum-app/forum-styles.js';
            stylesScript.onload = () => {
                console.log('[Mobile Phone] forum-styles.js 加载完成');
                checkComplete();
            };
            stylesScript.onerror = () => handleError('forum-styles.js');
            document.head.appendChild(stylesScript);

            // 加载主UI JS文件
            const jsScript = document.createElement('script');
            jsScript.src = './scripts/extensions/third-party/mobile/app/forum-app/forum-ui.js';
            jsScript.onload = () => {
                console.log('[Mobile Phone] forum-ui.js 加载完成');
                checkComplete();
            };
            jsScript.onerror = () => handleError('forum-ui.js');
            document.head.appendChild(jsScript);

            // 加载论坛控制应用 JS文件
            const controlScript = document.createElement('script');
            controlScript.src = './scripts/extensions/third-party/mobile/app/forum-app/forum-control-app.js';
            controlScript.onload = () => {
                console.log('[Mobile Phone] forum-control-app.js 加载完成');
                checkComplete();
            };
            controlScript.onerror = () => handleError('forum-control-app.js');
            document.head.appendChild(controlScript);

            // 加载论坛自动监听器 JS文件
            const autoListenerScript = document.createElement('script');
            autoListenerScript.src = './scripts/extensions/third-party/mobile/app/forum-app/forum-auto-listener.js';
            autoListenerScript.onload = () => {
                console.log('[Mobile Phone] forum-auto-listener.js 加载完成');
                checkComplete();
            };
            autoListenerScript.onerror = () => handleError('forum-auto-listener.js');
            document.head.appendChild(autoListenerScript);
        });

        return window._forumAppLoading;
    }

    // 加载微博应用
    async loadWeiboApp() {
        console.log('[Mobile Phone] 开始加载微博应用模块...');

        // 检查是否已加载 - 只检查必要的全局变量
        if (window.weiboUI && window.getWeiboAppContent && window.bindWeiboEvents && window.weiboControlApp && window.WeiboAutoListener && window.weiboManager && window.weiboStyles) {
            console.log('[Mobile Phone] Weibo App 模块已存在，跳过加载');
            return Promise.resolve();
        }

        // 检查是否正在加载
        if (window._weiboAppLoading) {
            console.log('[Mobile Phone] Weibo App 正在加载中，等待完成');
            return window._weiboAppLoading;
        }

        // 标记正在加载
        window._weiboAppLoading = new Promise((resolve, reject) => {
            let loadedCount = 0;
            const totalFiles = 7; // weibo-ui.css + weibo-control-app.css + weibo-manager.js + weibo-styles.js + weibo-ui.js + weibo-control-app.js + weibo-auto-listener.js

            const checkComplete = () => {
                loadedCount++;
                console.log(`[Mobile Phone] 已加载 ${loadedCount}/${totalFiles} 个微博文件`);
                if (loadedCount === totalFiles) {
                    console.log('[Mobile Phone] 所有微博文件加载完成，等待模块初始化...');

                    // 等待微博模块完全初始化
                    setTimeout(() => {
                        if (window.weiboUI && window.getWeiboAppContent && window.bindWeiboEvents && window.weiboControlApp && window.WeiboAutoListener && window.weiboManager && window.weiboStyles) {
                            console.log('[Mobile Phone] ✅ Weibo App 模块加载并初始化完成');
                            window._weiboAppLoading = null;
                            resolve();
                        } else {
                            console.error('[Mobile Phone] ❌ 微博模块加载完成但全局变量未正确设置');
                            console.log('[Mobile Phone] 检查结果:', {
                                weiboUI: !!window.weiboUI,
                                getWeiboAppContent: !!window.getWeiboAppContent,
                                bindWeiboEvents: !!window.bindWeiboEvents,
                                weiboControlApp: !!window.weiboControlApp,
                                WeiboAutoListener: !!window.WeiboAutoListener,
                                weiboManager: !!window.weiboManager,
                                weiboStyles: !!window.weiboStyles
                            });
                            window._weiboAppLoading = null;
                            reject(new Error('微博模块初始化失败'));
                        }
                    }, 1000); // 等待1秒让模块完成初始化
                }
            };

            const handleError = (name) => {
                console.error(`[Mobile Phone] ${name} 加载失败`);
                window._weiboAppLoading = null;
                reject(new Error(`${name} 加载失败`));
            };

            // 加载CSS文件
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = './scripts/extensions/third-party/mobile/app/weibo-app/weibo-ui.css';
            cssLink.onload = () => {
                console.log('[Mobile Phone] weibo-ui.css 加载完成');
                checkComplete();
            };
            cssLink.onerror = () => handleError('weibo-ui.css');
            document.head.appendChild(cssLink);

            // 加载控制应用CSS文件
            const controlCssLink = document.createElement('link');
            controlCssLink.rel = 'stylesheet';
            controlCssLink.href = './scripts/extensions/third-party/mobile/app/weibo-app/weibo-control-app.css';
            controlCssLink.onload = () => {
                console.log('[Mobile Phone] weibo-control-app.css 加载完成');
                checkComplete();
            };
            controlCssLink.onerror = () => handleError('weibo-control-app.css');
            document.head.appendChild(controlCssLink);

            // 加载微博管理器 JS文件
            const managerScript = document.createElement('script');
            managerScript.src = './scripts/extensions/third-party/mobile/app/weibo-app/weibo-manager.js';
            managerScript.onload = () => {
                console.log('[Mobile Phone] weibo-manager.js 加载完成');
                checkComplete();
            };
            managerScript.onerror = () => handleError('weibo-manager.js');
            document.head.appendChild(managerScript);

            // 加载微博样式管理器 JS文件
            const stylesScript = document.createElement('script');
            stylesScript.src = './scripts/extensions/third-party/mobile/app/weibo-app/weibo-styles.js';
            stylesScript.onload = () => {
                console.log('[Mobile Phone] weibo-styles.js 加载完成');
                checkComplete();
            };
            stylesScript.onerror = () => handleError('weibo-styles.js');
            document.head.appendChild(stylesScript);

            // 加载主UI JS文件
            const jsScript = document.createElement('script');
            jsScript.src = './scripts/extensions/third-party/mobile/app/weibo-app/weibo-ui.js';
            jsScript.onload = () => {
                console.log('[Mobile Phone] weibo-ui.js 加载完成');
                checkComplete();
            };
            jsScript.onerror = () => handleError('weibo-ui.js');
            document.head.appendChild(jsScript);

            // 加载微博控制应用 JS文件
            const controlScript = document.createElement('script');
            controlScript.src = './scripts/extensions/third-party/mobile/app/weibo-app/weibo-control-app.js';
            controlScript.onload = () => {
                console.log('[Mobile Phone] weibo-control-app.js 加载完成');
                checkComplete();
            };
            controlScript.onerror = () => handleError('weibo-control-app.js');
            document.head.appendChild(controlScript);

            // 加载微博自动监听器 JS文件
            const autoListenerScript = document.createElement('script');
            autoListenerScript.src = './scripts/extensions/third-party/mobile/app/weibo-app/weibo-auto-listener.js';
            autoListenerScript.onload = () => {
                console.log('[Mobile Phone] weibo-auto-listener.js 加载完成');
                checkComplete();
            };
            autoListenerScript.onerror = () => handleError('weibo-auto-listener.js');
            document.head.appendChild(autoListenerScript);
        });

        return window._weiboAppLoading;
    }

    // 加载消息应用
    async loadMessageApp() {
        console.log('[Mobile Phone] 开始加载消息应用模块...');

        // 检查是否已加载 - 只检查必要的全局变量
        if (window.MessageApp && window.getMessageAppContent && window.bindMessageAppEvents) {
            console.log('[Mobile Phone] Message App 模块已存在，跳过加载');
            return Promise.resolve();
        }

        // 检查是否正在加载
        if (window._messageAppLoading) {
            console.log('[Mobile Phone] Message App 正在加载中，等待完成');
            return window._messageAppLoading;
        }

        // 标记正在加载
        window._messageAppLoading = new Promise((resolve, reject) => {
            let loadedCount = 0;
            const totalFiles = 6; // message-app.css + message-renderer.css + friend-renderer.js + message-renderer.js + message-sender.js + message-app.js

            const checkComplete = () => {
                loadedCount++;
                console.log(`[Mobile Phone] 已加载 ${loadedCount}/${totalFiles} 个文件`);
                if (loadedCount === totalFiles) {
                    console.log('[Mobile Phone] 所有文件加载完成，等待模块初始化...');

                    // 等待所有模块完全初始化
                    setTimeout(() => {
                        if (window.MessageApp && window.getMessageAppContent && window.bindMessageAppEvents) {
                            console.log('[Mobile Phone] ✅ Message App 模块加载并初始化完成');
                            window._messageAppLoading = null;
                            resolve();
                        } else {
                            console.error('[Mobile Phone] ❌ 模块加载完成但全局变量未正确设置');
                            console.log('[Mobile Phone] 检查结果:', {
                                MessageApp: !!window.MessageApp,
                                getMessageAppContent: !!window.getMessageAppContent,
                                bindMessageAppEvents: !!window.bindMessageAppEvents
                            });
                            window._messageAppLoading = null;
                            reject(new Error('模块初始化失败'));
                        }
                    }, 1000); // 等待1秒让所有模块完成初始化
                }
            };

            const handleError = (name) => {
                console.error(`[Mobile Phone] ${name} 加载失败`);
                window._messageAppLoading = null;
                reject(new Error(`${name} 加载失败`));
            };

            // 检查并移除已存在的标签
            const removeExistingTags = () => {
                const existingCss = document.querySelector('link[href*="message-app.css"]');
                if (existingCss) {
                    console.log('[Mobile Phone] 移除已存在的 message-app.css');
                    existingCss.remove();
                }

                const existingRendererCss = document.querySelector('link[href*="message-renderer.css"]');
                if (existingRendererCss) {
                    console.log('[Mobile Phone] 移除已存在的 message-renderer.css');
                    existingRendererCss.remove();
                }

                const existingScripts = document.querySelectorAll('script[src*="mobile/app/"]');
                if (existingScripts.length > 0) {
                    console.log(`[Mobile Phone] 移除 ${existingScripts.length} 个已存在的脚本`);
                    existingScripts.forEach(script => script.remove());
                }
            };

            removeExistingTags();

            // 加载CSS文件
            const cssFiles = [
                '/scripts/extensions/third-party/mobile/app/message-app.css',
                '/scripts/extensions/third-party/mobile/app/message-renderer.css'
            ];

            cssFiles.forEach(href => {
                const cssLink = document.createElement('link');
                cssLink.rel = 'stylesheet';
                cssLink.href = href;
                cssLink.onload = () => {
                    console.log(`[Mobile Phone] CSS 加载完成: ${href}`);
                    checkComplete();
                };
                cssLink.onerror = () => handleError(`CSS: ${href}`);
                document.head.appendChild(cssLink);
            });

            // 加载JavaScript文件 - 按正确顺序
            const jsFiles = [
                '/scripts/extensions/third-party/mobile/app/friend-renderer.js',
                '/scripts/extensions/third-party/mobile/app/message-renderer.js',
                '/scripts/extensions/third-party/mobile/app/message-sender.js',
                '/scripts/extensions/third-party/mobile/app/message-app.js'
            ];

            jsFiles.forEach(src => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => {
                    console.log(`[Mobile Phone] JS 加载完成: ${src}`);
                    checkComplete();
                };
                script.onerror = () => handleError(`JS: ${src}`);
                document.head.appendChild(script);
            });
        });

        return window._messageAppLoading;
    }

    // 加载购物应用
    async loadShopApp() {
        console.log('[Mobile Phone] 开始加载购物应用模块...');

        // 检查是否已加载
        if (window.ShopApp && window.getShopAppContent && window.bindShopAppEvents) {
            console.log('[Mobile Phone] Shop App 模块已存在，跳过加载');
            return Promise.resolve();
        }

        // 检查是否正在加载
        if (window._shopAppLoading) {
            console.log('[Mobile Phone] Shop App 正在加载中，等待完成');
            return window._shopAppLoading;
        }

        // 标记正在加载
        window._shopAppLoading = new Promise((resolve, reject) => {
            let loadedCount = 0;
            const totalFiles = 2; // shop-app.css + shop-app.js

            const checkComplete = () => {
                loadedCount++;
                console.log(`[Mobile Phone] 已加载 ${loadedCount}/${totalFiles} 个购物应用文件`);
                if (loadedCount === totalFiles) {
                    console.log('[Mobile Phone] 所有购物应用文件加载完成，等待模块初始化...');

                    // 等待模块完全初始化
                    setTimeout(() => {
                        if (window.ShopApp && window.getShopAppContent && window.bindShopAppEvents) {
                            console.log('[Mobile Phone] ✅ Shop App 模块加载并初始化完成');
                            window._shopAppLoading = null;
                            resolve();
                        } else {
                            console.error('[Mobile Phone] ❌ 购物应用模块加载完成但全局变量未正确设置');
                            console.log('[Mobile Phone] 检查结果:', {
                                ShopApp: !!window.ShopApp,
                                getShopAppContent: !!window.getShopAppContent,
                                bindShopAppEvents: !!window.bindShopAppEvents
                            });
                            window._shopAppLoading = null;
                            reject(new Error('购物应用模块初始化失败'));
                        }
                    }, 500); // 等待0.5秒让模块完成初始化
                }
            };

            const handleError = (name) => {
                console.error(`[Mobile Phone] ${name} 加载失败`);
                window._shopAppLoading = null;
                reject(new Error(`${name} 加载失败`));
            };

            // 检查并移除已存在的标签
            const removeExistingTags = () => {
                const existingCss = document.querySelector('link[href*="shop-app.css"]');
                if (existingCss) {
                    console.log('[Mobile Phone] 移除已存在的 shop-app.css');
                    existingCss.remove();
                }

                const existingScript = document.querySelector('script[src*="shop-app.js"]');
                if (existingScript) {
                    console.log('[Mobile Phone] 移除已存在的 shop-app.js');
                    existingScript.remove();
                }
            };

            removeExistingTags();

            // 加载CSS文件
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = '/scripts/extensions/third-party/mobile/app/shop-app.css';
            cssLink.onload = () => {
                console.log('[Mobile Phone] shop-app.css 加载完成');
                checkComplete();
            };
            cssLink.onerror = () => handleError('shop-app.css');
            document.head.appendChild(cssLink);

            // 加载JS文件
            const jsScript = document.createElement('script');
            jsScript.src = '/scripts/extensions/third-party/mobile/app/shop-app.js';
            jsScript.onload = () => {
                console.log('[Mobile Phone] shop-app.js 加载完成');
                checkComplete();
            };
            jsScript.onerror = () => handleError('shop-app.js');
            document.head.appendChild(jsScript);
        });

        return window._shopAppLoading;
    }

    // 加载背包应用
    async loadBackpackApp() {
        console.log('[Mobile Phone] 开始加载背包应用模块...');

        // 检查是否已加载
        if (window.BackpackApp && window.getBackpackAppContent && window.bindBackpackAppEvents) {
            console.log('[Mobile Phone] Backpack App 模块已存在，跳过加载');
            return Promise.resolve();
        }

        // 检查是否正在加载
        if (window._backpackAppLoading) {
            console.log('[Mobile Phone] Backpack App 正在加载中，等待完成');
            return window._backpackAppLoading;
        }

        // 标记正在加载
        window._backpackAppLoading = new Promise((resolve, reject) => {
            let loadedCount = 0;
            const totalFiles = 2; // backpack-app.css + backpack-app.js

            const checkComplete = () => {
                loadedCount++;
                console.log(`[Mobile Phone] 已加载 ${loadedCount}/${totalFiles} 个背包应用文件`);
                if (loadedCount === totalFiles) {
                    console.log('[Mobile Phone] 所有背包应用文件加载完成，等待模块初始化...');

                    // 等待模块完全初始化
                    setTimeout(() => {
                        if (window.BackpackApp && window.getBackpackAppContent && window.bindBackpackAppEvents) {
                            console.log('[Mobile Phone] ✅ Backpack App 模块加载并初始化完成');
                            window._backpackAppLoading = null;
                            resolve();
                        } else {
                            console.error('[Mobile Phone] ❌ 背包应用模块加载完成但全局变量未正确设置');
                            console.log('[Mobile Phone] 检查结果:', {
                                BackpackApp: !!window.BackpackApp,
                                getBackpackAppContent: !!window.getBackpackAppContent,
                                bindBackpackAppEvents: !!window.bindBackpackAppEvents
                            });
                            window._backpackAppLoading = null;
                            reject(new Error('背包应用模块初始化失败'));
                        }
                    }, 500); // 等待0.5秒让模块完成初始化
                }
            };

            const handleError = (name) => {
                console.error(`[Mobile Phone] ${name} 加载失败`);
                window._backpackAppLoading = null;
                reject(new Error(`${name} 加载失败`));
            };

            // 检查并移除已存在的标签
            const removeExistingTags = () => {
                const existingCss = document.querySelector('link[href*="backpack-app.css"]');
                if (existingCss) {
                    console.log('[Mobile Phone] 移除已存在的 backpack-app.css');
                    existingCss.remove();
                }

                const existingScript = document.querySelector('script[src*="backpack-app.js"]');
                if (existingScript) {
                    console.log('[Mobile Phone] 移除已存在的 backpack-app.js');
                    existingScript.remove();
                }
            };

            removeExistingTags();

            // 加载CSS文件
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = '/scripts/extensions/third-party/mobile/app/backpack-app.css';
            cssLink.onload = () => {
                console.log('[Mobile Phone] backpack-app.css 加载完成');
                checkComplete();
            };
            cssLink.onerror = () => handleError('backpack-app.css');
            document.head.appendChild(cssLink);

            // 加载JS文件
            const jsScript = document.createElement('script');
            jsScript.src = '/scripts/extensions/third-party/mobile/app/backpack-app.js';
            jsScript.onload = () => {
                console.log('[Mobile Phone] backpack-app.js 加载完成');
                checkComplete();
            };
            jsScript.onerror = () => handleError('backpack-app.js');
            document.head.appendChild(jsScript);
        });

        return window._backpackAppLoading;
    }

    // 加载任务应用
    async loadTaskApp() {
        console.log('[Mobile Phone] 开始加载任务应用模块...');

        // 检查是否已加载
        if (window.TaskApp && window.getTaskAppContent && window.bindTaskAppEvents) {
            console.log('[Mobile Phone] Task App 模块已存在，跳过加载');
            return Promise.resolve();
        }

        // 检查是否正在加载
        if (window._taskAppLoading) {
            console.log('[Mobile Phone] Task App 正在加载中，等待完成');
            return window._taskAppLoading;
        }

        // 标记正在加载
        window._taskAppLoading = new Promise((resolve, reject) => {
            let loadedCount = 0;
            const totalFiles = 2; // task-app.css + task-app.js

            const checkComplete = () => {
                loadedCount++;
                console.log(`[Mobile Phone] 已加载 ${loadedCount}/${totalFiles} 个任务应用文件`);
                if (loadedCount === totalFiles) {
                    console.log('[Mobile Phone] 所有任务应用文件加载完成，等待模块初始化...');

                    // 等待模块完全初始化
                    setTimeout(() => {
                        if (window.TaskApp && window.getTaskAppContent && window.bindTaskAppEvents) {
                            console.log('[Mobile Phone] ✅ Task App 模块加载并初始化完成');
                            window._taskAppLoading = null;
                            resolve();
                        } else {
                            console.error('[Mobile Phone] ❌ 任务应用模块加载完成但全局变量未正确设置');
                            console.log('[Mobile Phone] 检查结果:', {
                                TaskApp: !!window.TaskApp,
                                getTaskAppContent: !!window.getTaskAppContent,
                                bindTaskAppEvents: !!window.bindTaskAppEvents
                            });
                            window._taskAppLoading = null;
                            reject(new Error('任务应用模块初始化失败'));
                        }
                    }, 500); // 等待0.5秒让模块完成初始化
                }
            };

            const handleError = (name) => {
                console.error(`[Mobile Phone] ${name} 加载失败`);
                window._taskAppLoading = null;
                reject(new Error(`${name} 加载失败`));
            };

            // 检查并移除已存在的标签
            const removeExistingTags = () => {
                const existingCss = document.querySelector('link[href*="task-app.css"]');
                if (existingCss) {
                    console.log('[Mobile Phone] 移除已存在的 task-app.css');
                    existingCss.remove();
                }

                const existingScript = document.querySelector('script[src*="task-app.js"]');
                if (existingScript) {
                    console.log('[Mobile Phone] 移除已存在的 task-app.js');
                    existingScript.remove();
                }
            };

            removeExistingTags();

            // 加载CSS文件
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = '/scripts/extensions/third-party/mobile/app/task-app.css';
            cssLink.onload = () => {
                console.log('[Mobile Phone] task-app.css 加载完成');
                checkComplete();
            };
            cssLink.onerror = () => handleError('task-app.css');
            document.head.appendChild(cssLink);

            // 加载JS文件
            const jsScript = document.createElement('script');
            jsScript.src = '/scripts/extensions/third-party/mobile/app/task-app.js';
            jsScript.onload = () => {
                console.log('[Mobile Phone] task-app.js 加载完成');
                checkComplete();
            };
            jsScript.onerror = () => handleError('task-app.js');
            document.head.appendChild(jsScript);
        });

        return window._taskAppLoading;
    }

    // 加载直播应用
    async loadLiveApp() {
        console.log('[Mobile Phone] 开始加载直播应用模块...');

        // 检查是否已加载
        if (window.LiveApp && window.getLiveAppContent && window.bindLiveAppEvents) {
            console.log('[Mobile Phone] Live App 模块已存在，跳过加载');
            return Promise.resolve();
        }

        // 检查是否正在加载
        if (window._liveAppLoading) {
            console.log('[Mobile Phone] Live App 正在加载中，等待完成');
            return window._liveAppLoading;
        }

        // 标记正在加载
        window._liveAppLoading = new Promise((resolve, reject) => {
            let loadedCount = 0;
            const totalFiles = 2; // live-app.css + live-app.js

            const checkComplete = () => {
                loadedCount++;
                console.log(`[Mobile Phone] 已加载 ${loadedCount}/${totalFiles} 个直播应用文件`);
                if (loadedCount === totalFiles) {
                    console.log('[Mobile Phone] 所有直播应用文件加载完成，等待模块初始化...');

                    // 等待模块完全初始化
                    setTimeout(() => {
                        if (window.LiveApp && window.getLiveAppContent && window.bindLiveAppEvents) {
                            console.log('[Mobile Phone] ✅ Live App 模块加载并初始化完成');
                            window._liveAppLoading = null;
                            resolve();
                        } else {
                            console.error('[Mobile Phone] ❌ 直播应用模块加载完成但全局变量未正确设置');
                            console.log('[Mobile Phone] 检查结果:', {
                                LiveApp: !!window.LiveApp,
                                getLiveAppContent: !!window.getLiveAppContent,
                                bindLiveAppEvents: !!window.bindLiveAppEvents
                            });
                            window._liveAppLoading = null;
                            reject(new Error('直播应用模块初始化失败'));
                        }
                    }, 500); // 等待0.5秒让模块完成初始化
                }
            };

            const handleError = (name) => {
                console.error(`[Mobile Phone] ${name} 加载失败`);
                window._liveAppLoading = null;
                reject(new Error(`${name} 加载失败`));
            };

            // 检查并移除已存在的标签
            const removeExistingTags = () => {
                const existingCss = document.querySelector('link[href*="live-app.css"]');
                if (existingCss) {
                    console.log('[Mobile Phone] 移除已存在的 live-app.css');
                    existingCss.remove();
                }

                const existingScript = document.querySelector('script[src*="live-app.js"]');
                if (existingScript) {
                    console.log('[Mobile Phone] 移除已存在的 live-app.js');
                    existingScript.remove();
                }
            };

            removeExistingTags();

            // 加载CSS文件
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = '/scripts/extensions/third-party/mobile/app/live-app.css';
            cssLink.onload = () => {
                console.log('[Mobile Phone] live-app.css 加载完成');
                checkComplete();
            };
            cssLink.onerror = () => handleError('live-app.css');
            document.head.appendChild(cssLink);

            // 加载JS文件
            const jsScript = document.createElement('script');
            jsScript.src = '/scripts/extensions/third-party/mobile/app/live-app.js';
            jsScript.onload = () => {
                console.log('[Mobile Phone] live-app.js 加载完成');
                checkComplete();
            };
            jsScript.onerror = () => handleError('live-app.js');
            document.head.appendChild(jsScript);
        });

        return window._liveAppLoading;
    }

    // 返回主界面
    goHome() {
        console.log('[Mobile Phone] 返回主界面');
        this.currentApp = null;
        this.currentAppState = null;
        this.appStack = []; // 清空应用栈
        document.getElementById('home-screen').style.display = 'block';
        document.getElementById('app-screen').style.display = 'none';
    }

    // 开始时钟
    startClock() {
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            const dateString = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;

            // 更新状态栏时间
            const mobileTime = document.getElementById('mobile-time');
            if (mobileTime) {
                mobileTime.textContent = timeString;
            }

            // 更新主界面时间
            const homeTime = document.getElementById('home-time');
            const homeDate = document.getElementById('home-date');
            if (homeTime) {
                homeTime.textContent = timeString;
            }
            if (homeDate) {
                homeDate.textContent = dateString;
            }
        };

        updateTime();
        setInterval(updateTime, 1000);
    }
}

// 初始化手机界面
function initMobilePhone() {
    if (document.readyState === 'loading') {
        // 如果文档还在加载，等待DOMContentLoaded
        document.addEventListener('DOMContentLoaded', () => {
            window.mobilePhone = new MobilePhone();
            console.log('[Mobile Phone] 手机界面初始化完成');
        });
    } else {
        // 如果文档已经加载完成，直接初始化
        window.mobilePhone = new MobilePhone();
        console.log('[Mobile Phone] 手机界面初始化完成');
    }
}

// 立即执行初始化
initMobilePhone();

// 创建全局的showToast函数供其他模块使用
window.showMobileToast = MobilePhone.showToast.bind(MobilePhone);
