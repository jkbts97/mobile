/**
 * 微博UI管理器
 * 负责微博界面的显示和数据处理
 */
class WeiboUI {
    constructor() {
        this.currentWeiboId = null;
        this.currentTab = 'hot'; // 当前tab: hot, personal, cp
        this.init();
    }

    init() {
        console.log('[Weibo UI] 微博UI管理器初始化');
    }

    /**
     * 从消息中实时解析微博内容
     */
    parseWeiboContent(content) {
        // 先尝试提取微博标记之间的内容
        const weiboRegex = /<!-- WEIBO_CONTENT_START -->([\s\S]*?)<!-- WEIBO_CONTENT_END -->/;
        const match = content.match(weiboRegex);

        let weiboContent;
        if (match) {
            weiboContent = match[1];
            console.log('[Weibo UI] 找到标记微博内容');
        } else {
            // 如果没有标记，直接使用整个内容
            weiboContent = content;
            console.log('[Weibo UI] 未找到微博标记，使用全部内容解析');
        }
        const hotSearches = [];
        const posts = [];
        const comments = {};
        const reposts = {};

        // 解析热搜格式: [热搜|话题标题|热度值]
        const hotSearchRegex = /\[热搜\|([^|]+)\|([^\]]+)\]/g;
        // 解析博文格式: [博文|博主昵称|博文ID|博文内容|点赞数|转发数|评论数]
        const postRegex = /\[博文\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;
        // 解析评论格式: [评论|评论者昵称|博文ID|评论内容|点赞数]
        const commentRegex = /\[评论\|([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;
        // 解析转发格式: [转发|转发者昵称|博文ID|转发评论]
        const repostRegex = /\[转发\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;

        let match_hotSearch;
        let match_post;
        let match_comment;
        let match_repost;

        // 解析热搜
        while ((match_hotSearch = hotSearchRegex.exec(weiboContent)) !== null) {
            const hotSearch = {
                id: `hot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                title: match_hotSearch[1],
                heat: match_hotSearch[2],
                timestamp: new Date().toLocaleString()
            };
            hotSearches.push(hotSearch);
        }

        // 解析博文
        while ((match_post = postRegex.exec(weiboContent)) !== null) {
            const post = {
                id: match_post[2],
                author: match_post[1],
                content: match_post[3],
                likes: parseInt(match_post[4]) || Math.floor(Math.random() * 1000),
                reposts: parseInt(match_post[5]) || Math.floor(Math.random() * 500),
                commentCount: parseInt(match_post[6]) || Math.floor(Math.random() * 200),
                timestamp: new Date().toLocaleString(),
                isVerified: Math.random() > 0.7, // 随机认证状态
                avatar: this.generateAvatar(match_post[1])
            };
            posts.push(post);
            comments[post.id] = [];
            reposts[post.id] = [];
        }

        // 解析评论
        while ((match_comment = commentRegex.exec(weiboContent)) !== null) {
            const comment = {
                id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                postId: match_comment[2],
                author: match_comment[1],
                content: match_comment[3],
                likes: parseInt(match_comment[4]) || Math.floor(Math.random() * 50),
                timestamp: new Date().toLocaleString(),
                avatar: this.generateAvatar(match_comment[1])
            };

            if (!comments[comment.postId]) {
                comments[comment.postId] = [];
            }
            comments[comment.postId].push(comment);
        }

        // 解析转发
        while ((match_repost = repostRegex.exec(weiboContent)) !== null) {
            const repost = {
                id: `repost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                postId: match_repost[2],
                author: match_repost[1],
                content: match_repost[3],
                timestamp: new Date().toLocaleString(),
                avatar: this.generateAvatar(match_repost[1])
            };

            if (!reposts[repost.postId]) {
                reposts[repost.postId] = [];
            }
            reposts[repost.postId].push(repost);
        }

        console.log('[Weibo UI] 解析完成，热搜数:', hotSearches.length, '博文数:', posts.length);
        console.log('[Weibo UI] 解析的微博内容片段:', weiboContent.substring(0, 200) + '...');
        if (posts.length > 0) {
            console.log('[Weibo UI] 解析到的博文:', posts);
        }
        if (hotSearches.length > 0) {
            console.log('[Weibo UI] 解析到的热搜:', hotSearches);
        }
        return { hotSearches, posts, comments, reposts };
    }

    /**
     * 生成头像
     */
    generateAvatar(name) {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
        const colorIndex = name.length % colors.length;
        return {
            bg: colors[colorIndex],
            text: name[0] || '?'
        };
    }

    /**
     * 获取微博主界面HTML
     */
    getWeiboMainHTML() {
        return `
            <div class="weibo-app">
                <!-- 微博头部 -->
                <div class="weibo-header">
                    <div class="weibo-nav">
                        <div class="nav-item ${this.currentTab === 'hot' ? 'active' : ''}" data-tab="hot">🔥 热门</div>
                        <div class="nav-item ${this.currentTab === 'personal' ? 'active' : ''}" data-tab="personal">👤 个人</div>
                        <div class="nav-item ${this.currentTab === 'cp' ? 'active' : ''}" data-tab="cp">💕 CP榜</div>
                    </div>

                </div>

                <!-- 微博内容 -->
                <div class="weibo-content" id="weibo-content">
                    ${this.getCurrentTabHTML()}
                </div>

                <!-- 发微博对话框 -->
                <div class="post-dialog" id="post-dialog" style="display: none;">
                    <div class="dialog-overlay" id="dialog-overlay"></div>
                    <div class="dialog-content">
                        <div class="dialog-header">
                            <h3>发微博</h3>
                            <button class="close-btn" id="close-dialog-btn">×</button>
                        </div>
                        <div class="dialog-body">
                            <textarea class="post-content-input" id="post-content" placeholder="有什么新鲜事想告诉大家？"></textarea>
                            <div class="post-tools">
                                <div class="emoji-tools">
                                    <span class="emoji-btn">😀</span>
                                    <span class="emoji-btn">😂</span>
                                    <span class="emoji-btn">❤️</span>
                                    <span class="emoji-btn">👍</span>
                                    <span class="emoji-btn">🔥</span>
                                </div>
                                <div class="post-privacy">
                                    <select id="post-privacy">
                                        <option value="public">公开</option>
                                        <option value="friends">仅好友</option>
                                        <option value="self">仅自己</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="dialog-footer">
                            <button class="cancel-btn" id="cancel-post-btn">取消</button>
                            <button class="submit-btn" id="submit-post-btn">发布</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 获取当前选中tab的HTML内容
     */
    getCurrentTabHTML() {
        switch (this.currentTab) {
            case 'hot':
                return this.getHotTabHTML();
            case 'personal':
                return this.getPersonalTabHTML();
            case 'cp':
                return this.getCPTabHTML();
            default:
                return this.getHotTabHTML();
        }
    }

    /**
     * 获取热门tab的HTML
     */
    getHotTabHTML() {
        const weiboData = this.getCurrentWeiboData();

        if (weiboData.posts.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">🐦</div>
                    <div class="empty-text">暂无微博</div>
                    <div class="empty-hint">点击右上角设置按钮生成微博内容～</div>
                </div>
            `;
        }

        return `
            <!-- 热搜榜 -->
            <div class="hot-search-section">
                <div class="section-title">🔥 微博热搜</div>
                <div class="hot-search-list">
                    ${this.getHotSearchHTML(weiboData.hotSearches)}
                </div>
            </div>

            <!-- 微博列表 -->
            <div class="weibo-list">
                ${weiboData.posts.map(post => this.getPostHTML(post, weiboData.comments[post.id] || [], weiboData.reposts[post.id] || [])).join('')}
            </div>
        `;
    }

    /**
     * 获取个人主页tab的HTML
     */
    getPersonalTabHTML() {
        const weiboData = this.getCurrentWeiboData();
        const myPosts = weiboData.posts.filter(post => post.author === '我');

        return `
            <div class="personal-page">
                <!-- 个人信息卡片 -->
                <div class="profile-card">
                    <div class="profile-header">
                        <div class="profile-avatar">
                            <div class="avatar-large" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">我</div>
                            <div class="verified-badge">✓</div>
                        </div>
                        <div class="profile-info">
                            <div class="profile-name">我的微博</div>
                            <div class="profile-desc">记录生活，分享快乐</div>
                        </div>
                    </div>
                    <div class="profile-stats">
                        <div class="stat-item">
                            <div class="stat-number">${myPosts.length}</div>
                            <div class="stat-label">微博</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${Math.floor(Math.random() * 1000)}</div>
                            <div class="stat-label">关注</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${Math.floor(Math.random() * 5000)}</div>
                            <div class="stat-label">粉丝</div>
                        </div>
                    </div>
                </div>

                <!-- 个人微博列表 -->
                <div class="personal-weibo-list">
                    ${myPosts.length > 0 ?
                        myPosts.map(post => this.getPostHTML(post, weiboData.comments[post.id] || [], weiboData.reposts[post.id] || [])).join('') :
                        `<div class="empty-state">
                            <div class="empty-icon">📝</div>
                            <div class="empty-text">还没有发过微博</div>
                            <div class="empty-hint">发布第一条微博，记录美好时刻</div>
                        </div>`
                    }
                </div>
            </div>
        `;
    }

    /**
     * 获取CP榜单tab的HTML
     */
    getCPTabHTML() {
        const cpData = this.generateCPData();

        return `
            <div class="cp-page">
                <!-- CP榜单头部 -->
                <div class="cp-header">
                    <div class="cp-title">💕 CP榜单</div>
                    <div class="cp-subtitle">今日最受关注的CP组合</div>
                </div>

                <!-- CP榜单列表 -->
                <div class="cp-ranking-list">
                    ${cpData.map((cp, index) => `
                        <div class="cp-item" data-rank="${index + 1}">
                            <div class="cp-rank">
                                <span class="rank-number ${index < 3 ? 'top-three' : ''}">${index + 1}</span>
                            </div>
                            <div class="cp-info">
                                <div class="cp-names">
                                    <span class="cp-name">${cp.name1}</span>
                                    <span class="cp-connector">×</span>
                                    <span class="cp-name">${cp.name2}</span>
                                </div>
                                <div class="cp-tag">${cp.tag}</div>
                            </div>
                            <div class="cp-stats">
                                <div class="cp-heat">${cp.heat}</div>
                                <div class="cp-trend ${cp.trend}">
                                    ${cp.trend === 'up' ? '↗️' : cp.trend === 'down' ? '↘️' : '→'}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- CP相关微博 -->
                <div class="cp-weibo-section">
                    <div class="section-title">💌 CP相关微博</div>
                    <div class="cp-weibo-list">
                        ${this.generateCPWeiboHTML()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 生成CP数据
     */
    generateCPData() {
        const cpList = [
            { name1: '晨曦', name2: '暮雪', tag: '#晨雪CP#', heat: '1.2亿', trend: 'up' },
            { name1: '云起', name2: '月落', tag: '#云月CP#', heat: '9876万', trend: 'up' },
            { name1: '星河', name2: '深海', tag: '#星海CP#', heat: '8543万', trend: 'down' },
            { name1: '风语', name2: '花香', tag: '#风花CP#', heat: '7234万', trend: 'same' },
            { name1: '雨落', name2: '梧桐', tag: '#雨桐CP#', heat: '6789万', trend: 'up' },
            { name1: '琴心', name2: '剑魄', tag: '#琴剑CP#', heat: '5432万', trend: 'down' },
            { name1: '书香', name2: '墨韵', tag: '#书墨CP#', heat: '4321万', trend: 'up' },
            { name1: '茶韵', name2: '酒香', tag: '#茶酒CP#', heat: '3456万', trend: 'same' }
        ];

        return cpList;
    }

    /**
     * 生成CP相关微博HTML
     */
    generateCPWeiboHTML() {
        const cpWeibos = [
            {
                author: 'CP粉丝001',
                content: '晨雪CP今天的互动也太甜了吧！！！这个眼神杀我不行了 #晨雪CP# #真的在一起#',
                likes: 1234,
                reposts: 567,
                comments: 89
            },
            {
                author: '云月守护者',
                content: '云起和月落的新剧花絮出来了！！这个身高差绝了，官方发糖我先干为敬 #云月CP#',
                likes: 2345,
                reposts: 678,
                comments: 123
            },
            {
                author: '星海永远',
                content: '虽然星河和深海今天没营业，但是我还是要打卡签到！星海CP永远滴神！ #星海CP#',
                likes: 876,
                reposts: 234,
                comments: 45
            }
        ];

        return cpWeibos.map(weibo => `
            <div class="cp-weibo-item">
                <div class="weibo-author">
                    <div class="author-avatar" style="background: ${this.generateAvatar(weibo.author).bg}">
                        ${this.generateAvatar(weibo.author).text}
                    </div>
                    <span class="author-name">${weibo.author}</span>
                </div>
                <div class="weibo-content">${this.formatContent(weibo.content)}</div>
                <div class="weibo-stats">
                    <span class="stat-item">👍 ${weibo.likes}</span>
                    <span class="stat-item">🔄 ${weibo.reposts}</span>
                    <span class="stat-item">💬 ${weibo.comments}</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * 获取热搜HTML
     */
    getHotSearchHTML(hotSearches) {
        if (hotSearches.length === 0) {
            return '<div class="no-hot-search">暂无热搜</div>';
        }

        return hotSearches.slice(0, 5).map((hotSearch, index) => `
            <div class="hot-search-item" data-rank="${index + 1}">
                <span class="search-rank">${index + 1}</span>
                <span class="search-title">${hotSearch.title}</span>
                <span class="search-heat">${hotSearch.heat}</span>
            </div>
        `).join('');
    }

    /**
     * 获取微博帖子HTML
     */
    getPostHTML(post, comments, reposts) {
        return `
            <div class="weibo-post" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-author">
                        <div class="author-avatar" style="background: ${post.avatar.bg}">
                            ${post.avatar.text}
                        </div>
                        <div class="author-info">
                            <div class="author-name">
                                ${post.author}
                                ${post.isVerified ? '<span class="verified-icon">✓</span>' : ''}
                            </div>
                            <div class="post-time">${post.timestamp}</div>
                        </div>
                    </div>
                    <div class="post-more">⋯</div>
                </div>

                <div class="post-content">${this.formatContent(post.content)}</div>

                <div class="post-actions">
                    <button class="action-btn comment-btn" data-action="comment" data-post-id="${post.id}">
                        <span class="action-icon">💬</span>
                        <span class="action-count">${post.commentCount}</span>
                    </button>
                    <button class="action-btn repost-btn" data-action="repost" data-post-id="${post.id}">
                        <span class="action-icon">🔄</span>
                        <span class="action-count">${post.reposts}</span>
                    </button>
                    <button class="action-btn like-btn" data-action="like" data-post-id="${post.id}">
                        <span class="action-icon">👍</span>
                        <span class="action-count">${post.likes}</span>
                    </button>
                </div>

                <!-- 评论区 -->
                ${comments.length > 0 ? `
                    <div class="comments-section">
                        <div class="comments-header">
                            <span class="comments-title">评论 ${comments.length}</span>
                        </div>
                        <div class="comments-list">
                            ${comments.slice(0, 3).map(comment => `
                                <div class="comment-item" data-comment-id="${comment.id}">
                                    <div class="comment-avatar" style="background: ${comment.avatar.bg}">
                                        ${comment.avatar.text}
                                    </div>
                                    <div class="comment-content">
                                        <div class="comment-author">${comment.author}</div>
                                        <div class="comment-text">${this.formatContent(comment.content)}</div>
                                        <div class="comment-actions">
                                            <span class="comment-time">${comment.timestamp}</span>
                                            <button class="comment-like">👍 ${comment.likes}</button>
                                            <button class="comment-reply">回复</button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                            ${comments.length > 3 ? `
                                <div class="view-more-comments">
                                    <button class="view-more-btn" data-post-id="${post.id}">查看全部${comments.length}条评论</button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                <!-- 评论输入框 -->
                <div class="comment-input-container" id="comment-input-${post.id}" style="display: none;">
                    <div class="comment-input-box">
                        <textarea class="comment-input" placeholder="写评论..." rows="2"></textarea>
                        <div class="comment-input-actions">
                            <button class="cancel-comment-btn" data-post-id="${post.id}">取消</button>
                            <button class="submit-comment-btn" data-post-id="${post.id}">发布</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 从消息中获取当前微博数据
     */
    getCurrentWeiboData() {
        try {
            if (window.mobileContextEditor) {
                const chatData = window.mobileContextEditor.getCurrentChatData();
                if (chatData && chatData.messages && chatData.messages.length > 0) {
                    // 从最新的消息开始检查微博内容
                    for (let i = chatData.messages.length - 1; i >= 0; i--) {
                        const message = chatData.messages[i];
                        if (message && message.mes) {
                            const weiboData = this.parseWeiboContent(message.mes);
                            // 如果找到了微博内容（有posts或hotSearches），就返回
                            if (weiboData.posts.length > 0 || weiboData.hotSearches.length > 0) {
                                console.log(`[Weibo UI] 在第${i+1}条消息中找到微博内容`);
                                return weiboData;
                            }
                        }
                    }
                    console.log('[Weibo UI] 遍历所有消息，未找到微博内容');
                }
            }
        } catch (error) {
            console.warn('[Weibo UI] 获取微博数据失败:', error);
        }

        return { hotSearches: [], posts: [], comments: {}, reposts: {} };
    }

    /**
     * 格式化内容（处理表情包、话题标签等）
     */
    formatContent(content) {
        // 处理话题标签
        let formatted = content.replace(/#([^#\s]+)#/g, '<span class="topic-tag">#$1#</span>');

        // 处理@用户
        formatted = formatted.replace(/@([^\s]+)/g, '<span class="mention">@$1</span>');

        // 处理表情符号
        formatted = formatted.replace(/:\s*([^,\s]+)/g, '<span class="emoji-placeholder">[$1]</span>');

        // 处理链接
        formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="weibo-link">$1</a>');

        // 处理换行
        formatted = formatted.replace(/\n/g, '<br>');

        return formatted;
    }

    /**
     * 切换tab
     */
    switchTab(tabName) {
        this.currentTab = tabName;
        console.log('[Weibo UI] 切换到tab:', tabName);

        // 更新导航状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

        // 更新内容
        const contentContainer = document.getElementById('weibo-content');
        if (contentContainer) {
            contentContainer.innerHTML = this.getCurrentTabHTML();
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // Tab切换事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-item')) {
                const tab = e.target.dataset.tab;
                if (tab) {
                    this.switchTab(tab);
                }
            }
        });

        // 微博操作事件
        document.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn')) {
                const btn = e.target.closest('.action-btn');
                const action = btn.dataset.action;
                const postId = btn.dataset.postId;

                switch (action) {
                    case 'comment':
                        this.showCommentInput(postId);
                        break;
                    case 'repost':
                        this.handleRepost(postId);
                        break;
                    case 'like':
                        this.handleLike(postId);
                        break;
                    case 'share':
                        this.handleShare(postId);
                        break;
                }
            }
        });

        // 微博控制按钮
        const weiboControlBtn = document.getElementById('weibo-control-btn');
        if (weiboControlBtn) {
            weiboControlBtn.addEventListener('click', () => this.showWeiboControl());
        }

        // 生成演示内容按钮
        const generateBtn = document.getElementById('generate-demo-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateDemoContent());
        }

        // 对话框相关事件
        this.bindDialogEvents();

        // 评论相关事件
        this.bindCommentEvents();
    }

    /**
     * 绑定对话框事件
     */
    bindDialogEvents() {
        // 关闭对话框
        const closeBtn = document.getElementById('close-dialog-btn');
        const cancelBtn = document.getElementById('cancel-post-btn');
        const overlay = document.getElementById('dialog-overlay');

        [closeBtn, cancelBtn, overlay].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => this.hidePostDialog());
            }
        });

        // 提交微博
        const submitBtn = document.getElementById('submit-post-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitNewPost());
        }

        // 表情按钮
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('emoji-btn')) {
                this.insertEmoji(e.target.textContent);
            }
        });
    }

    /**
     * 绑定评论事件
     */
    bindCommentEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cancel-comment-btn')) {
                const postId = e.target.dataset.postId;
                this.hideCommentInput(postId);
            }

            if (e.target.classList.contains('submit-comment-btn')) {
                const postId = e.target.dataset.postId;
                this.submitComment(postId);
            }

            if (e.target.classList.contains('view-more-btn')) {
                const postId = e.target.dataset.postId;
                this.showAllComments(postId);
            }
        });
    }

    /**
     * 显示评论输入框
     */
    showCommentInput(postId) {
        // 隐藏所有其他评论输入框
        document.querySelectorAll('.comment-input-container').forEach(container => {
            container.style.display = 'none';
        });

        // 显示当前评论输入框
        const container = document.getElementById(`comment-input-${postId}`);
        if (container) {
            container.style.display = 'block';
            const textarea = container.querySelector('.comment-input');
            if (textarea) {
                textarea.focus();
            }
        }
    }

    /**
     * 隐藏评论输入框
     */
    hideCommentInput(postId) {
        const container = document.getElementById(`comment-input-${postId}`);
        if (container) {
            container.style.display = 'none';
            const textarea = container.querySelector('.comment-input');
            if (textarea) {
                textarea.value = '';
            }
        }
    }

    /**
     * 提交评论
     */
    submitComment(postId) {
        const container = document.getElementById(`comment-input-${postId}`);
        if (!container) return;

        const textarea = container.querySelector('.comment-input');
        if (!textarea) return;

        const content = textarea.value.trim();
        if (!content) {
            alert('请输入评论内容');
            return;
        }

        // 获取当前微博数据，找到被评论的微博信息
        const weiboData = this.getCurrentWeiboData();
        const currentPost = weiboData.posts.find(p => p.id === postId);

        if (!currentPost) {
            alert('无法找到被评论的微博信息');
            return;
        }

        // 构建评论格式：[评论|我|博文ID|评论内容|点赞数]
        const commentFormat = `[评论|我|${postId}|${content}|0]`;

        const commentData = {
            type: 'comment',
            postId: postId,
            content: content,
            commentFormat: commentFormat
        };

        // 调用微博管理器发送评论
        this.sendCommentToWeibo(commentData);

        // 隐藏输入框
        this.hideCommentInput(postId);
    }

    /**
     * 发送评论到微博管理器
     */
    sendCommentToWeibo(commentData) {
        if (!window.weiboManager) {
            alert('微博管理器未初始化，请稍后再试');
            return;
        }

        console.log('[Weibo UI] 发送评论到微博管理器:', commentData);

        // 询问用户是否确认发送评论
        const choice = confirm('确认发送评论？\n\n点击"确定"：发送评论给模型\n点击"取消"：取消评论');

        if (choice) {
            // 直接通过API发送评论给模型，不再插入到第一层
            if (window.weiboManager.sendReplyToAPI) {
                const fullReply = `我评论了这条微博：${commentData.content}`;
                window.weiboManager.sendReplyToAPI(fullReply).then(() => {
                    console.log('[Weibo UI] 评论已通过API发送给模型');

                    // 刷新微博内容
                    setTimeout(() => {
                        this.refreshWeiboList();
                    }, 500);
                }).catch(error => {
                    console.error('[Weibo UI] API发送评论失败:', error);
                    alert('发送评论失败，请重试');
                });
            } else {
                alert('评论功能需要通过微博管理器重新生成微博内容来实现。请使用微博管理器功能。');
                console.log('[Weibo UI] 用户尝试评论:', commentData);
            }
        }
    }

    /**
     * 处理点赞
     */
    handleLike(postId) {
        const btn = document.querySelector(`[data-action="like"][data-post-id="${postId}"]`);
        if (btn) {
            const countSpan = btn.querySelector('.action-count');
            if (countSpan) {
                const currentCount = parseInt(countSpan.textContent) || 0;
                countSpan.textContent = currentCount + 1;
                btn.classList.add('liked');
            }
        }
        console.log('[Weibo UI] 点赞微博:', postId);
    }

    /**
     * 处理转发
     */
    handleRepost(postId) {
        const choice = confirm('转发这条微博？');
        if (choice) {
            const btn = document.querySelector(`[data-action="repost"][data-post-id="${postId}"]`);
            if (btn) {
                const countSpan = btn.querySelector('.action-count');
                if (countSpan) {
                    const currentCount = parseInt(countSpan.textContent) || 0;
                    countSpan.textContent = currentCount + 1;
                }
            }
            console.log('[Weibo UI] 转发微博:', postId);
        }
    }

    /**
     * 处理分享
     */
    handleShare(postId) {
        if (navigator.share) {
            navigator.share({
                title: '分享微博',
                text: '来看看这条有趣的微博',
                url: window.location.href
            });
        } else {
            // 复制链接到剪贴板
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('链接已复制到剪贴板');
            });
        }
        console.log('[Weibo UI] 分享微博:', postId);
    }

    /**
     * 显示发微博对话框
     */
    showPostDialog() {
        const dialog = document.getElementById('post-dialog');
        if (dialog) {
            dialog.style.display = 'flex';
            // 清空输入框
            document.getElementById('post-content').value = '';
        }
    }

    /**
     * 隐藏发微博对话框
     */
    hidePostDialog() {
        const dialog = document.getElementById('post-dialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
    }

    /**
     * 插入表情
     */
    insertEmoji(emoji) {
        const textarea = document.getElementById('post-content');
        if (textarea) {
            const cursorPos = textarea.selectionStart;
            const textBefore = textarea.value.substring(0, cursorPos);
            const textAfter = textarea.value.substring(textarea.selectionEnd);
            textarea.value = textBefore + emoji + textAfter;
            textarea.selectionStart = textarea.selectionEnd = cursorPos + emoji.length;
            textarea.focus();
        }
    }

    /**
     * 提交新微博
     */
    submitNewPost() {
        const content = document.getElementById('post-content').value.trim();

        if (!content) {
            alert('请输入微博内容');
            return;
        }

        // 隐藏对话框
        this.hidePostDialog();

        if (!window.weiboManager) {
            alert('微博管理器未初始化，请稍后再试');
            return;
        }

        // 构建发微博格式：[博文|我|微博ID|微博内容|点赞数|转发数|评论数]
        const postFormat = `[博文|我|微博${Date.now()}|${content}|0|0|0]`;

        console.log('[Weibo UI] 用户发微博:', { content, postFormat });

        // 询问用户是否确认发微博
        const choice = confirm('确认发布微博？\n\n点击"确定"：发布微博（插入微博内容并发送给模型）\n点击"取消"：取消发布');

        if (choice) {
            // 调用微博管理器的发微博API
            if (window.weiboManager.sendPostToAPI) {
                window.weiboManager.sendPostToAPI(postFormat).then(() => {
                    console.log('[Weibo UI] 微博已发布');
                    // 刷新微博内容
                    setTimeout(() => {
                        this.refreshWeiboList();
                    }, 1000);
                }).catch(error => {
                    console.error('[Weibo UI] 发微博失败:', error);
                    alert('发微博失败，请重试');
                });
            } else {
                alert('发微博功能不可用，请检查微博管理器配置');
                console.error('[Weibo UI] sendPostToAPI方法不存在');
            }
        } else {
            // 用户取消发微博
            console.log('[Weibo UI] 用户取消发微博');
        }
    }

    /**
     * 刷新微博列表
     */
    refreshWeiboList() {
        console.log('[Weibo UI] 刷新微博内容');
        const content = document.getElementById('weibo-content');
        if (content) {
            content.innerHTML = this.getCurrentTabHTML();
        }
    }

    /**
     * 生成演示内容
     */
    generateDemoContent() {
        if (window.weiboManager) {
            console.log('[Weibo UI] 调用微博管理器生成内容');
            window.weiboManager.generateWeiboContent().then(() => {
                // 生成完成后刷新界面
                setTimeout(() => {
                    this.refreshWeiboList();
                }, 1000);
            });
        } else {
            console.warn('[Weibo UI] 微博管理器未找到');
            alert('微博管理器未初始化，请稍后再试');
        }
    }

    /**
     * 显示微博控制面板
     */
    showWeiboControl() {
        // 推送新状态到应用栈，切换到微博控制页面
        if (window.mobilePhone) {
            const state = {
                app: 'weibo',
                title: '微博设置',
                view: 'weiboControl'
            };
            window.mobilePhone.pushAppState(state);
        }

        // 如果没有手机框架，回退到原有的弹出面板
        if (!window.mobilePhone && window.weiboManager) {
            window.weiboManager.showWeiboPanel();
        }
    }

    /**
     * 显示全部评论
     */
    showAllComments(postId) {
        // 这里可以实现展开全部评论的功能
        console.log('[Weibo UI] 显示全部评论:', postId);
        // 实际实现中可以创建一个新的页面或者展开当前评论区
    }
}

// 创建全局实例
window.WeiboUI = WeiboUI;
window.weiboUI = new WeiboUI();

// 获取微博应用内容的全局函数
window.getWeiboAppContent = function() {
    return window.weiboUI.getWeiboMainHTML();
};

// 绑定微博应用事件的全局函数
window.bindWeiboEvents = function() {
    if (window.weiboUI) {
        window.weiboUI.bindEvents();
        console.log('[Weibo UI] 事件绑定完成');
    }
};

console.log('[Weibo UI] 微博UI模块加载完成');
