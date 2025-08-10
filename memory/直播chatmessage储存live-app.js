/**
 * Live App - 直播应用
 * 完全重写的直播应用，支持实时监听SillyTavern上下文并解析直播数据
 */

// ==================== 核心事件监听系统 ====================

/**
 * 直播事件监听器
 * 负责监听SillyTavern的消息事件并触发数据解析
 */
class LiveEventListener {
  constructor(liveApp) {
    this.liveApp = liveApp;
    this.isListening = false;
    this.lastMessageCount = 0;
    this.pollingInterval = null;
    this.messageReceivedHandler = this.onMessageReceived.bind(this);
  }

  /**
   * 开始监听SillyTavern事件
   */
  startListening() {
    if (this.isListening) {
      console.log('[Live App] 监听器已经在运行中');
      return;
    }

    try {
      // 检查SillyTavern接口可用性
      console.log('[Live App] 检查SillyTavern接口可用性:', {
        'window.SillyTavern': !!window?.SillyTavern,
        'window.SillyTavern.getContext': typeof window?.SillyTavern?.getContext,
        eventOn: typeof eventOn,
        tavern_events: typeof tavern_events,
        mobileContextEditor: !!window?.mobileContextEditor,
      });

      // 方法1: 优先使用SillyTavern.getContext().eventSource（iframe环境推荐）
      if (typeof window !== 'undefined' && window.SillyTavern && typeof window.SillyTavern.getContext === 'function') {
        const context = window.SillyTavern.getContext();
        if (context && context.eventSource && typeof context.eventSource.on === 'function' && context.event_types) {
          console.log('[Live App] 使用SillyTavern.getContext().eventSource监听MESSAGE_RECEIVED事件');
          context.eventSource.on(context.event_types.MESSAGE_RECEIVED, this.messageReceivedHandler);
          this.isListening = true;
          console.log('[Live App] ✅ 成功开始监听SillyTavern消息事件 (context.eventSource)');
          this.updateMessageCount();
          return;
        }
      }

      // 方法2: 尝试使用全局eventOn函数（如果可用）
      if (typeof eventOn === 'function' && typeof tavern_events !== 'undefined' && tavern_events.MESSAGE_RECEIVED) {
        console.log('[Live App] 使用全局eventOn监听MESSAGE_RECEIVED事件');
        eventOn(tavern_events.MESSAGE_RECEIVED, this.messageReceivedHandler);
        this.isListening = true;
        console.log('[Live App] ✅ 成功开始监听SillyTavern消息事件 (eventOn)');
        this.updateMessageCount();
        return;
      }

      // 方法2: 尝试从父窗口使用eventSource
      if (
        typeof window !== 'undefined' &&
        window.parent &&
        window.parent.eventSource &&
        typeof window.parent.eventSource.on === 'function'
      ) {
        console.log('[Live App] 使用父窗口eventSource监听MESSAGE_RECEIVED事件');
        if (window.parent.event_types && window.parent.event_types.MESSAGE_RECEIVED) {
          window.parent.eventSource.on(window.parent.event_types.MESSAGE_RECEIVED, this.messageReceivedHandler);
          this.isListening = true;
          console.log('[Live App] ✅ 成功开始监听SillyTavern消息事件 (parent eventSource)');
          this.updateMessageCount();
          return;
        }
      }

      // 如果事件监听不可用，使用轮询作为备用方案
      console.log('[Live App] ⚠️ 事件监听不可用，启用轮询模式');
      this.startPolling();
      this.isListening = true;
      this.updateMessageCount();

      console.log('[Live App] ✅ 轮询监听已启动');
    } catch (error) {
      console.error('[Live App] 启动监听器失败:', error);
      throw error;
    }
  }

  /**
   * 开始轮询模式（备用方案）
   */
  startPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(() => {
      if (this.liveApp && this.liveApp.isLiveActive) {
        const currentMessageCount = this.getCurrentMessageCount();

        // 添加详细的调试信息
        if (currentMessageCount !== this.lastMessageCount) {
          console.log(`[Live App] 🔄 轮询检测到消息变化: ${this.lastMessageCount} → ${currentMessageCount}`);

          if (currentMessageCount > this.lastMessageCount) {
            console.log('[Live App] ✅ 检测到新消息，开始解析数据');
            this.lastMessageCount = currentMessageCount;
            this.liveApp.parseNewLiveData().catch(error => {
              console.error('[Live App] 轮询解析数据失败:', error);
            });
          } else {
            console.log('[Live App] ⚠️ 消息数量减少，可能是聊天被重置');
            this.lastMessageCount = currentMessageCount;
          }
        }
      }
    }, 1500); // 每1.5秒检查一次，更频繁的检查

    console.log('[Live App] ✅ 轮询模式已启动 (间隔: 1.5秒)');
  }

  /**
   * 停止监听SillyTavern事件
   */
  stopListening() {
    if (!this.isListening) {
      console.log('[Live App] 监听器未在运行');
      return;
    }

    try {
      // 停止轮询
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
        console.log('[Live App] ✅ 轮询模式已停止');
      }

      // 尝试移除事件监听器
      if (typeof window !== 'undefined' && window.SillyTavern && window.SillyTavern.eventSource) {
        window.SillyTavern.eventSource.off('message_received', this.messageReceivedHandler);
        console.log('[Live App] ✅ 成功停止监听SillyTavern消息事件 (SillyTavern.eventSource)');
      } else if (
        typeof window !== 'undefined' &&
        window.parent &&
        window.parent.SillyTavern &&
        window.parent.SillyTavern.eventSource
      ) {
        window.parent.SillyTavern.eventSource.off('message_received', this.messageReceivedHandler);
        console.log('[Live App] ✅ 成功停止监听SillyTavern消息事件 (parent SillyTavern.eventSource)');
      } else if (typeof eventRemoveListener === 'function' && typeof tavern_events !== 'undefined') {
        eventRemoveListener(tavern_events.MESSAGE_RECEIVED, this.messageReceivedHandler);
        console.log('[Live App] ✅ 成功停止监听SillyTavern消息事件 (global eventRemoveListener)');
      } else if (
        typeof window !== 'undefined' &&
        window.parent &&
        typeof window.parent.eventRemoveListener === 'function' &&
        typeof window.parent.tavern_events !== 'undefined'
      ) {
        window.parent.eventRemoveListener(window.parent.tavern_events.MESSAGE_RECEIVED, this.messageReceivedHandler);
        console.log('[Live App] ✅ 成功停止监听SillyTavern消息事件 (parent eventRemoveListener)');
      }

      this.isListening = false;
    } catch (error) {
      console.error('[Live App] 停止监听器失败:', error);
    }
  }

  /**
   * 处理AI消息接收事件
   * @param {number} messageId - 接收到的消息ID
   */
  async onMessageReceived(messageId) {
    try {
      console.log(`[Live App] 🎯 接收到AI消息事件，ID: ${messageId}`);

      // 检查直播是否活跃
      if (!this.liveApp || !this.liveApp.isLiveActive) {
        console.log('[Live App] 直播未激活，跳过处理');
        return;
      }

      // 检查是否有新消息
      const currentMessageCount = this.getCurrentMessageCount();
      console.log(`[Live App] 消息数量检查: 当前=${currentMessageCount}, 上次=${this.lastMessageCount}`);

      if (currentMessageCount <= this.lastMessageCount) {
        console.log('[Live App] 没有检测到新消息，跳过解析');
        return;
      }

      console.log(`[Live App] ✅ 检测到新消息，消息数量从 ${this.lastMessageCount} 增加到 ${currentMessageCount}`);
      this.lastMessageCount = currentMessageCount;

      // 触发数据解析
      console.log('[Live App] 开始解析新的直播数据...');
      await this.liveApp.parseNewLiveData();
    } catch (error) {
      console.error('[Live App] 处理消息接收事件失败:', error);
    }
  }

  /**
   * 获取当前消息数量
   */
  getCurrentMessageCount() {
    try {
      // 方法1: 使用SillyTavern.getContext().chat（正确的接口）
      if (typeof window !== 'undefined' && window.SillyTavern && typeof window.SillyTavern.getContext === 'function') {
        const context = window.SillyTavern.getContext();
        if (context && context.chat && Array.isArray(context.chat)) {
          const count = context.chat.length;
          console.log(`[Live App] 通过SillyTavern.getContext().chat获取到 ${count} 条消息`);
          return count;
        }
      }

      // 方法2: 使用mobileContextEditor作为备用
      const mobileContextEditor = window['mobileContextEditor'];
      if (mobileContextEditor && typeof mobileContextEditor.getCurrentChatData === 'function') {
        const chatData = mobileContextEditor.getCurrentChatData();
        if (chatData && chatData.messages && Array.isArray(chatData.messages)) {
          console.log(`[Live App] 通过mobileContextEditor获取到 ${chatData.messages.length} 条消息`);
          return chatData.messages.length;
        }
      }

      // 方法2: 尝试从父窗口获取chat变量
      if (typeof window !== 'undefined' && window.parent && window.parent.chat && Array.isArray(window.parent.chat)) {
        const count = window.parent.chat.length;
        console.log(`[Live App] 通过父窗口chat变量获取到 ${count} 条消息`);
        return count;
      }

      // 方法3: 使用getContext()方法（如果可用）
      if (typeof window !== 'undefined' && window.getContext && typeof window.getContext === 'function') {
        const context = window.getContext();
        if (context && context.chat && Array.isArray(context.chat)) {
          const count = context.chat.length;
          console.log(`[Live App] 通过getContext()获取到 ${count} 条消息`);
          return count;
        }
      }

      // 方法4: 尝试从父窗口获取getContext
      if (
        typeof window !== 'undefined' &&
        window.parent &&
        window.parent.getContext &&
        typeof window.parent.getContext === 'function'
      ) {
        const context = window.parent.getContext();
        if (context && context.chat && Array.isArray(context.chat)) {
          const count = context.chat.length;
          console.log(`[Live App] 通过父窗口getContext()获取到 ${count} 条消息`);
          return count;
        }
      }

      // 方法5: 使用mobileContextEditor作为备用（已在方法1中检查过）

      // 方法6: 尝试从父窗口获取mobileContextEditor
      if (typeof window !== 'undefined' && window.parent && window.parent['mobileContextEditor']) {
        const parentMobileContextEditor = window.parent['mobileContextEditor'];
        if (parentMobileContextEditor && typeof parentMobileContextEditor.getCurrentChatData === 'function') {
          const chatData = parentMobileContextEditor.getCurrentChatData();
          if (chatData && chatData.messages && Array.isArray(chatData.messages)) {
            console.log(`[Live App] 通过父窗口mobileContextEditor获取到 ${chatData.messages.length} 条消息`);
            return chatData.messages.length;
          }
        }
      }

      console.warn('[Live App] 无法获取消息数量，使用默认值0');
      return 0;
    } catch (error) {
      console.warn('[Live App] 获取消息数量失败:', error);
      return 0;
    }
  }

  /**
   * 更新消息计数
   */
  updateMessageCount() {
    this.lastMessageCount = this.getCurrentMessageCount();
    console.log(`[Live App] 初始化消息计数: ${this.lastMessageCount}`);
  }
}

// ==================== 数据解析器 ====================

/**
 * 直播数据解析器
 * 负责解析SillyTavern消息中的直播格式数据
 */
class LiveDataParser {
  constructor() {
    // 正则表达式模式
    this.patterns = {
      viewerCount: /\[直播\|本场人数\|([^\]]+)\]/g,
      liveContent: /\[直播\|直播内容\|([^\]]+)\]/g,
      normalDanmaku: /\[直播\|([^\|]+)\|弹幕\|([^\]]+)\]/g,
      giftDanmaku: /\[直播\|([^\|]+)\|打赏\|([^\]]+)\]/g,
      recommendedInteraction: /\[直播\|推荐互动\|([^\]]+)\]/g,
    };
  }

  /**
   * 解析直播数据
   * @param {string} content - 要解析的文本内容
   * @returns {Object} 解析后的直播数据
   */
  parseLiveData(content) {
    const liveData = {
      viewerCount: 0,
      liveContent: '',
      danmakuList: [],
      giftList: [],
      recommendedInteractions: [],
    };

    if (!content || typeof content !== 'string') {
      return liveData;
    }

    // 1. 解析直播人数
    liveData.viewerCount = this.parseViewerCount(content);

    // 2. 解析直播内容
    liveData.liveContent = this.parseLiveContent(content);

    // 3. 解析普通弹幕
    liveData.danmakuList = this.parseNormalDanmaku(content);

    // 4. 解析打赏弹幕
    const { danmakuList: giftDanmaku, giftList } = this.parseGiftDanmaku(content);
    liveData.danmakuList = liveData.danmakuList.concat(giftDanmaku);
    liveData.giftList = giftList;

    // 5. 解析推荐互动
    liveData.recommendedInteractions = this.parseRecommendedInteractions(content);

    return liveData;
  }

  /**
   * 解析直播人数
   */
  parseViewerCount(content) {
    const matches = [...content.matchAll(this.patterns.viewerCount)];
    if (matches.length === 0) return 0;

    // 取最后一个匹配（最新的人数）
    const lastMatch = matches[matches.length - 1];
    const viewerStr = lastMatch[1].trim();

    return this.formatViewerCount(viewerStr);
  }

  /**
   * 格式化观看人数
   */
  formatViewerCount(viewerStr) {
    // 移除非数字字符，保留数字和字母
    const cleanStr = viewerStr.replace(/[^\d\w]/g, '');

    // 尝试解析数字
    const num = parseInt(cleanStr);
    if (isNaN(num)) return 0;

    // 格式化大数字
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + 'W';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }

    return num.toString();
  }

  /**
   * 解析直播内容
   */
  parseLiveContent(content) {
    const matches = [...content.matchAll(this.patterns.liveContent)];
    if (matches.length === 0) return '';

    // 取最后一个匹配（最新的内容）
    const lastMatch = matches[matches.length - 1];
    return lastMatch[1].trim();
  }

  /**
   * 解析普通弹幕
   */
  parseNormalDanmaku(content) {
    const danmakuList = [];
    const matches = [...content.matchAll(this.patterns.normalDanmaku)];

    matches.forEach((match, index) => {
      const username = match[1].trim();
      const danmakuContent = match[2].trim();

      danmakuList.push({
        id: Date.now() + index,
        username: username,
        content: danmakuContent,
        type: 'normal',
        timestamp: new Date().toLocaleString(),
      });
    });

    return danmakuList;
  }

  /**
   * 解析打赏弹幕
   */
  parseGiftDanmaku(content) {
    const danmakuList = [];
    const giftList = [];
    const matches = [...content.matchAll(this.patterns.giftDanmaku)];

    matches.forEach((match, index) => {
      const username = match[1].trim();
      const giftContent = match[2].trim();
      const timestamp = new Date().toLocaleString();

      // 添加到弹幕列表
      danmakuList.push({
        id: Date.now() + index + 10000, // 避免ID冲突
        username: username,
        content: giftContent,
        type: 'gift',
        timestamp: timestamp,
      });

      // 添加到礼物列表
      giftList.push({
        username: username,
        gift: giftContent,
        timestamp: timestamp,
      });
    });

    return { danmakuList, giftList };
  }

  /**
   * 解析推荐互动
   */
  parseRecommendedInteractions(content) {
    const interactions = [];
    const matches = [...content.matchAll(this.patterns.recommendedInteraction)];

    console.log(`[Live App] 推荐互动解析: 找到 ${matches.length} 个匹配项`);

    // 只取最后4个匹配项（最新的推荐互动）
    const recentMatches = matches.slice(-4);
    console.log(`[Live App] 取最新的 ${recentMatches.length} 个推荐互动`);

    recentMatches.forEach((match, index) => {
      const interactionContent = match[1].trim();
      console.log(`[Live App] 推荐互动 ${index + 1}: "${interactionContent}"`);
      if (!interactions.includes(interactionContent)) {
        interactions.push(interactionContent);
      }
    });

    console.log(`[Live App] 最终推荐互动列表:`, interactions);
    return interactions;
  }

  /**
   * 获取聊天消息内容
   */
  getChatContent() {
    try {
      // 方法1: 使用SillyTavern.getContext().chat（正确的接口）
      if (typeof window !== 'undefined' && window.SillyTavern && typeof window.SillyTavern.getContext === 'function') {
        const context = window.SillyTavern.getContext();
        if (context && context.chat && Array.isArray(context.chat)) {
          const messages = context.chat;
          if (messages && messages.length > 0) {
            const content = messages.map(msg => msg.mes || '').join('\n');
            console.log(`[Live App] 通过SillyTavern.getContext().chat获取到聊天内容，长度: ${content.length}`);
            return content;
          }
        }
      }

      // 方法2: 使用mobileContextEditor作为备用
      const mobileContextEditor = window['mobileContextEditor'];
      if (mobileContextEditor && typeof mobileContextEditor.getCurrentChatData === 'function') {
        const chatData = mobileContextEditor.getCurrentChatData();
        if (chatData && chatData.messages && Array.isArray(chatData.messages)) {
          const content = chatData.messages.map(msg => msg.mes || '').join('\n');
          console.log(`[Live App] 通过mobileContextEditor获取到聊天内容，长度: ${content.length}`);
          return content;
        }
      }

      // 方法2: 尝试从父窗口获取chat变量
      if (typeof window !== 'undefined' && window.parent && window.parent.chat && Array.isArray(window.parent.chat)) {
        const messages = window.parent.chat;
        if (messages && messages.length > 0) {
          const content = messages.map(msg => msg.mes || '').join('\n');
          console.log(`[Live App] 通过父窗口chat变量获取到聊天内容，长度: ${content.length}`);
          return content;
        }
      }

      // 方法3: 使用getContext()方法（如果可用）
      if (typeof window !== 'undefined' && window.getContext && typeof window.getContext === 'function') {
        const context = window.getContext();
        if (context && context.chat && Array.isArray(context.chat)) {
          const messages = context.chat;
          if (messages && messages.length > 0) {
            const content = messages.map(msg => msg.mes || '').join('\n');
            console.log(`[Live App] 通过getContext()获取到聊天内容，长度: ${content.length}`);
            return content;
          }
        }
      }

      // 方法4: 尝试从父窗口获取getContext
      if (
        typeof window !== 'undefined' &&
        window.parent &&
        window.parent.getContext &&
        typeof window.parent.getContext === 'function'
      ) {
        const context = window.parent.getContext();
        if (context && context.chat && Array.isArray(context.chat)) {
          const messages = context.chat;
          if (messages && messages.length > 0) {
            const content = messages.map(msg => msg.mes || '').join('\n');
            console.log(`[Live App] 通过父窗口getContext()获取到聊天内容，长度: ${content.length}`);
            return content;
          }
        }
      }

      // 方法5: 使用mobileContextEditor作为备用（已在方法1中检查过）

      // 方法6: 尝试从父窗口获取mobileContextEditor
      if (typeof window !== 'undefined' && window.parent && window.parent['mobileContextEditor']) {
        const parentMobileContextEditor = window.parent['mobileContextEditor'];
        if (parentMobileContextEditor && typeof parentMobileContextEditor.getCurrentChatData === 'function') {
          const chatData = parentMobileContextEditor.getCurrentChatData();
          if (chatData && chatData.messages && Array.isArray(chatData.messages)) {
            const content = chatData.messages.map(msg => msg.mes || '').join('\n');
            console.log(`[Live App] 通过父窗口mobileContextEditor获取到聊天内容，长度: ${content.length}`);
            return content;
          }
        }
      }

      console.warn('[Live App] 无法获取聊天内容');
      return '';
    } catch (error) {
      console.warn('[Live App] 获取聊天内容失败:', error);
      return '';
    }
  }
}

// ==================== 数据存储管理器 ====================

/**
 * 直播数据存储管理器 - 使用SillyTavern的chatMetadata实现跨设备同步
 */
class LiveDataStorage {
  constructor() {
    this.sessionId = null;
  }

  /**
   * 开始新的直播场次
   */
  startNewSession() {
    this.sessionId = Date.now().toString();
    this.clearSessionData();
    console.log(`[Live App] 开始新直播场次: ${this.sessionId}`);
  }

  /**
   * 初始化场次（不清空数据，用于应用启动时）
   */
  initializeSession() {
    try {
      const context = window.SillyTavern.getContext();
      const metadata = context.chatMetadata;

      // 如果已有场次ID，使用现有的
      if (metadata.live_app_session_id) {
        this.sessionId = metadata.live_app_session_id;
        console.log(`[Live App] 恢复现有场次: ${this.sessionId}`);
      } else {
        // 没有场次ID，创建新的但不清空（可能有历史数据）
        this.sessionId = Date.now().toString();
        console.log(`[Live App] 创建新场次: ${this.sessionId}`);
      }
    } catch (error) {
      console.error('[Live App] 初始化场次失败:', error);
      this.sessionId = Date.now().toString();
    }
  }

  /**
   * 保存弹幕到聊天元数据
   */
  async saveDanmaku(danmakuList) {
    try {
      const context = window.SillyTavern.getContext();

      context.updateChatMetadata(
        {
          live_app_danmaku: danmakuList,
          live_app_session_id: this.sessionId,
          live_app_last_updated: Date.now(),
        },
        false,
      );

      await context.saveChat();
      console.log(`[Live App] 弹幕已保存到chatMetadata (${danmakuList.length}条)`);
    } catch (error) {
      console.error('[Live App] 保存弹幕失败:', error);
    }
  }

  /**
   * 从聊天元数据加载弹幕
   */
  loadDanmaku() {
    try {
      const startTime = performance.now();
      const context = window.SillyTavern.getContext();
      const metadata = context.chatMetadata;

      // 检查是否有有效的场次ID
      if (!this.sessionId) {
        console.log('[Live App] 没有有效的场次ID，返回空弹幕列表');
        return [];
      }

      // 如果是同一个场次，返回历史弹幕
      if (metadata.live_app_session_id === this.sessionId) {
        const danmaku = metadata.live_app_danmaku || [];
        const loadTime = performance.now() - startTime;
        console.log(`[Live App] 从chatMetadata加载弹幕 (${danmaku.length}条) 耗时: ${loadTime.toFixed(2)}ms`);
        return danmaku;
      }

      // 不同场次或没有场次数据，返回空数组
      console.log('[Live App] 不同场次或无场次数据，返回空弹幕列表');
      return [];
    } catch (error) {
      console.error('[Live App] 加载弹幕失败:', error);
      return [];
    }
  }

  /**
   * 清空当前场次数据
   */
  async clearSessionData() {
    try {
      const context = window.SillyTavern.getContext();

      // 完全删除直播相关的chatMetadata字段
      delete context.chatMetadata.live_app_danmaku;
      delete context.chatMetadata.live_app_session_id;
      delete context.chatMetadata.live_app_last_updated;

      await context.saveChat();
      console.log('[Live App] 场次数据已完全清空');
    } catch (error) {
      console.error('[Live App] 清空场次数据失败:', error);
    }
  }

  /**
   * 检查是否有有效的场次
   */
  hasValidSession() {
    return this.sessionId !== null;
  }

  /**
   * 获取当前场次ID
   */
  getCurrentSessionId() {
    return this.sessionId;
  }
}

// ==================== 状态管理器 ====================

/**
 * 直播状态管理器
 * 负责管理直播状态、历史数据和当前数据
 */
class LiveStateManager {
  constructor() {
    this.currentLiveData = {
      viewerCount: 0,
      liveContent: '',
      danmakuList: [],
      giftList: [],
      recommendedInteractions: [],
    };
    this.historicalDanmaku = [];
    this.liveSessionId = null;
    this.isLiveActive = false;

    // 新增：数据存储管理器
    this.dataStorage = new LiveDataStorage();
  }

  /**
   * 开始新的直播会话
   */
  startLiveSession() {
    this.liveSessionId = Date.now().toString();
    this.isLiveActive = true;

    // 使用新的数据存储管理器
    this.dataStorage.startNewSession();

    // 清空当前数据
    this.historicalDanmaku = [];
    this.currentLiveData = {
      viewerCount: 0,
      liveContent: '',
      danmakuList: [],
      giftList: [],
      recommendedInteractions: [],
    };

    console.log(`[Live App] 开始新的直播会话: ${this.liveSessionId}`);
  }

  /**
   * 初始化会话（不清空历史数据）
   */
  initializeSession() {
    // 初始化数据存储的场次
    this.dataStorage.initializeSession();

    // 加载历史弹幕
    this.historicalDanmaku = this.dataStorage.loadDanmaku();
    this.currentLiveData.danmakuList = [...this.historicalDanmaku];

    console.log(`[Live App] 初始化会话，加载历史弹幕: ${this.historicalDanmaku.length}条`);
  }

  /**
   * 结束直播会话
   */
  endLiveSession() {
    this.isLiveActive = false;
    console.log(`[Live App] 结束直播会话: ${this.liveSessionId}`);

    // 保存最终状态
    this.saveState();
  }

  /**
   * 更新直播数据
   */
  async updateLiveData(newData) {
    // 更新基本信息（覆盖）
    if (newData.viewerCount !== undefined) {
      this.currentLiveData.viewerCount = newData.viewerCount;
    }

    if (newData.liveContent) {
      this.currentLiveData.liveContent = newData.liveContent;
    }

    if (newData.recommendedInteractions && newData.recommendedInteractions.length > 0) {
      this.currentLiveData.recommendedInteractions = newData.recommendedInteractions;
    }

    // 更新弹幕（累积）
    if (newData.danmakuList && newData.danmakuList.length > 0) {
      await this.addNewDanmaku(newData.danmakuList);
    }

    // 更新礼物列表（覆盖）
    if (newData.giftList && newData.giftList.length > 0) {
      this.currentLiveData.giftList = newData.giftList;
    }
  }

  /**
   * 添加新弹幕（避免重复）
   */
  async addNewDanmaku(newDanmaku) {
    // 先从chatMetadata加载历史弹幕
    this.historicalDanmaku = this.dataStorage.loadDanmaku();

    newDanmaku.forEach(danmaku => {
      // 检查是否已存在相同弹幕
      const exists = this.historicalDanmaku.some(
        existing =>
          existing.username === danmaku.username &&
          existing.content === danmaku.content &&
          existing.type === danmaku.type,
      );

      if (!exists) {
        this.historicalDanmaku.push(danmaku);
      }
    });

    // 保存到chatMetadata
    await this.dataStorage.saveDanmaku(this.historicalDanmaku);

    // 更新当前弹幕列表（显示所有历史弹幕）
    this.currentLiveData.danmakuList = [...this.historicalDanmaku];
  }

  /**
   * 获取当前直播数据
   */
  getCurrentLiveData() {
    return { ...this.currentLiveData };
  }

  /**
   * 保存状态到localStorage
   */
  saveState() {
    if (!this.liveSessionId) return;

    try {
      const stateData = {
        sessionId: this.liveSessionId,
        isActive: this.isLiveActive,
        currentData: this.currentLiveData,
        historicalDanmaku: this.historicalDanmaku,
        lastUpdated: Date.now(),
      };

      localStorage.setItem('liveApp_state', JSON.stringify(stateData));
      console.log('[Live App] 状态已保存到localStorage');
    } catch (error) {
      console.error('[Live App] 保存状态失败:', error);
    }
  }

  /**
   * 从localStorage加载状态
   */
  loadState() {
    try {
      const savedState = localStorage.getItem('liveApp_state');
      if (!savedState) return false;

      const stateData = JSON.parse(savedState);

      // 只在直播仍然活跃时恢复状态
      if (stateData.isActive) {
        this.liveSessionId = stateData.sessionId;
        this.isLiveActive = stateData.isActive;
        this.currentLiveData = stateData.currentData || this.currentLiveData;
        this.historicalDanmaku = stateData.historicalDanmaku || [];

        console.log(`[Live App] 从localStorage恢复状态: ${this.liveSessionId}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[Live App] 加载状态失败:', error);
      return false;
    }
  }

  /**
   * 清理状态
   */
  async clearState() {
    try {
      // 清空chatMetadata中的弹幕数据
      await this.dataStorage.clearSessionData();

      // 清空内存中的历史数据
      this.historicalDanmaku = [];
      this.currentLiveData = {
        viewerCount: 0,
        liveContent: '',
        danmakuList: [],
        giftList: [],
        recommendedInteractions: [],
      };

      // 清除localStorage（保持兼容性）
      localStorage.removeItem('liveApp_state');
      console.log('[Live App] 状态已清理（包括chatMetadata中的历史弹幕）');
    } catch (error) {
      console.error('[Live App] 清理状态失败:', error);
    }
  }

  /**
   * 销毁应用，清理所有资源（类似task-app的destroy方法）
   */
  destroy() {
    console.log('[Live App] 销毁应用，清理资源');

    // 如果正在直播，先结束直播
    if (this.isLiveActive) {
      this.endLive();
    }

    // 停止事件监听
    if (this.eventListener) {
      this.eventListener.stopListening();
    }

    // 清理DOM容器
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    // 重置状态
    this.isInitialized = false;
    this.isLiveActive = false;
    this.container = null;

    // 清空数据
    this.stateManager.currentLiveData = {
      viewerCount: 0,
      liveContent: '',
      danmakuList: [],
      giftList: [],
      recommendedInteractions: [],
    };
    this.stateManager.historicalDanmaku = [];
  }
}

// ==================== 消息发送器 ====================

/**
 * 消息发送器
 * 负责向SillyTavern发送消息
 */
class LiveMessageSender {
  constructor() {
    this.defaultInteractions = ['和观众打个招呼', '聊聊最近的趣事', '唱首歌给大家听', '回答观众的问题'];
  }

  /**
   * 发送开始直播消息
   * @param {string} interaction - 初始互动内容
   */
  async sendStartLiveMessage(interaction) {
    const messageContent = `用户开始直播，初始互动为（${interaction}），请按照正确的直播格式要求生成本场人数，直播内容，弹幕，打赏和推荐互动。此次回复内仅生成一次本场人数和直播内容格式，并在最后生成四条推荐互动。禁止使用错误格式。`;

    return await this.sendMessage(messageContent);
  }

  /**
   * 发送继续直播消息
   * @param {string} interaction - 互动内容
   */
  async sendContinueLiveMessage(interaction) {
    const messageContent = `用户继续直播，互动为（${interaction}），请按照正确的直播格式要求生成本场人数，直播内容，弹幕，打赏和推荐互动。此次回复内仅生成一次本场人数和直播内容格式，并在最后生成四条推荐互动。禁止使用错误格式。`;

    return await this.sendMessage(messageContent);
  }

  /**
   * 发送消息到SillyTavern
   * @param {string} messageContent - 消息内容
   */
  async sendMessage(messageContent) {
    try {
      console.log('[Live App] 准备发送消息:', messageContent);

      // 方法1: 使用SillyTavern的全局接口
      if (typeof window !== 'undefined' && window.SillyTavern && window.SillyTavern.generate) {
        console.log('[Live App] 使用SillyTavern.generate函数发送消息');
        const result = await window.SillyTavern.generate(messageContent);
        console.log('[Live App] ✅ 消息发送成功 (SillyTavern.generate)');
        return result;
      }

      // 方法2: 尝试从父窗口使用SillyTavern接口
      if (
        typeof window !== 'undefined' &&
        window.parent &&
        window.parent.SillyTavern &&
        window.parent.SillyTavern.generate
      ) {
        console.log('[Live App] 使用父窗口SillyTavern.generate函数发送消息');
        const result = await window.parent.SillyTavern.generate(messageContent);
        console.log('[Live App] ✅ 消息发送成功 (parent SillyTavern.generate)');
        return result;
      }

      // 方法3: 使用全局generate函数
      if (typeof generate === 'function') {
        console.log('[Live App] 使用全局generate函数发送消息');
        const result = await generate(messageContent);
        console.log('[Live App] ✅ 消息发送成功 (global generate)');
        return result;
      }

      // 方法4: 尝试从父窗口使用全局generate函数
      if (typeof window !== 'undefined' && window.parent && typeof window.parent.generate === 'function') {
        console.log('[Live App] 使用父窗口全局generate函数发送消息');
        const result = await window.parent.generate(messageContent);
        console.log('[Live App] ✅ 消息发送成功 (parent generate)');
        return result;
      }

      // 方法5: 直接操作DOM元素（备用方案）
      if (typeof window !== 'undefined' && window.parent) {
        console.log('[Live App] 使用DOM操作发送消息');

        const textarea = window.parent.document.querySelector('#send_textarea');
        const sendButton = window.parent.document.querySelector('#send_but');

        if (textarea && sendButton) {
          textarea.value = messageContent;

          // 触发输入事件
          const inputEvent = new Event('input', { bubbles: true });
          textarea.dispatchEvent(inputEvent);

          // 点击发送按钮
          sendButton.click();

          console.log('[Live App] ✅ 消息发送成功 (DOM)');
          return true;
        }
      }

      throw new Error('无法找到可用的消息发送方法');
    } catch (error) {
      console.error('[Live App] 发送消息失败:', error);
      throw error;
    }
  }

  /**
   * 获取默认互动选项
   */
  getDefaultInteractions() {
    return [...this.defaultInteractions];
  }
}

// ==================== 主应用类 ====================

/**
 * 直播应用主类
 * 协调各个组件的工作
 */
class LiveApp {
  constructor() {
    this.isLiveActive = false;
    this.currentView = 'start'; // 'start', 'live'

    // 初始化组件
    this.eventListener = new LiveEventListener(this);
    this.dataParser = new LiveDataParser();
    this.stateManager = new LiveStateManager();
    this.messageSender = new LiveMessageSender();

    // UI相关
    this.container = null;
    this.isInitialized = false;
  }

  /**
   * 初始化应用
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('[Live App] 应用已经初始化');
      return;
    }

    try {
      const startTime = performance.now();
      console.log('[Live App] 开始初始化直播应用...');

      // 尝试恢复之前的状态
      const stateStartTime = performance.now();
      const stateRestored = this.stateManager.loadState();
      if (stateRestored) {
        this.isLiveActive = this.stateManager.isLiveActive;
        console.log('[Live App] 恢复了之前的直播状态');
      }

      // 初始化会话（加载历史弹幕）
      this.stateManager.initializeSession();

      console.log(`[Live App] 状态恢复耗时: ${(performance.now() - stateStartTime).toFixed(2)}ms`);

      // 检查并重启监听器（解决关闭手机后监听器失效的问题）
      if (this.isLiveActive) {
        console.log('[Live App] 检查监听器状态...');
        if (!this.eventListener.isListening) {
          console.log('[Live App] 监听器未启动，重新启动监听器...');
          this.eventListener.startListening();
        } else {
          console.log('[Live App] 监听器已在运行');
        }
      }

      // 创建UI容器
      const containerStartTime = performance.now();
      this.createContainer();
      console.log(`[Live App] 容器创建耗时: ${(performance.now() - containerStartTime).toFixed(2)}ms`);

      // 渲染初始界面
      const renderStartTime = performance.now();
      this.renderCurrentView();
      console.log(`[Live App] 界面渲染耗时: ${(performance.now() - renderStartTime).toFixed(2)}ms`);

      this.isInitialized = true;
      const totalTime = performance.now() - startTime;
      console.log(`[Live App] ✅ 直播应用初始化完成，总耗时: ${totalTime.toFixed(2)}ms`);
    } catch (error) {
      console.error('[Live App] 初始化失败:', error);
      throw error;
    }
  }

  /**
   * 创建应用容器
   */
  createContainer() {
    // 移除现有容器
    const existingContainer = document.getElementById('live-app-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    // 创建新容器
    this.container = document.createElement('div');
    this.container.id = 'live-app-container';
    this.container.className = 'live-app-container';

    // 添加到app-content中
    const appContent = document.getElementById('app-content');
    if (appContent) {
      appContent.appendChild(this.container);
    } else {
      console.warn('[Live App] 未找到app-content容器，添加到body');
      document.body.appendChild(this.container);
    }
  }

  /**
   * 渲染当前视图
   */
  renderCurrentView() {
    if (!this.container) {
      console.error('[Live App] 容器未创建');
      return;
    }

    if (this.isLiveActive) {
      this.renderLiveView();
    } else {
      this.renderStartView();
    }
  }

  /**
   * 渲染开始直播视图
   */
  renderStartView() {
    this.currentView = 'start';
    const defaultInteractions = this.messageSender.getDefaultInteractions();

    this.container.innerHTML = `
      <div class="live-start-screen">
        <div class="start-header">
          <h2>开始直播</h2>
          <p>选择一个互动方式开始你的直播</p>
        </div>

        <div class="interaction-input">
          <textarea
            id="custom-interaction-input"
            placeholder="输入自定义互动内容..."
            rows="3"
          ></textarea>
          <button id="start-custom-btn" class="start-btn custom">
            开始自定义直播
          </button>
        </div>

        <div class="preset-interactions">
          <h3>预设互动</h3>
          <div class="preset-buttons">
            ${defaultInteractions
              .map(
                interaction =>
                  `<button class="preset-btn" data-interaction="${interaction}">
                ${interaction}
              </button>`,
              )
              .join('')}
          </div>
        </div>
      </div>
    `;

    this.bindStartViewEvents();
  }

  /**
   * 绑定开始视图事件
   */
  bindStartViewEvents() {
    // 自定义互动按钮
    const customBtn = this.container.querySelector('#start-custom-btn');
    const customInput = this.container.querySelector('#custom-interaction-input');

    if (customBtn && customInput) {
      customBtn.addEventListener('click', async () => {
        const interaction = customInput.value.trim();
        if (interaction) {
          await this.startLive(interaction);
        } else {
          alert('请输入互动内容');
        }
      });
    }

    // 预设互动按钮
    const presetBtns = this.container.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const interaction = btn.dataset.interaction;
        if (interaction) {
          await this.startLive(interaction);
        }
      });
    });
  }

  /**
   * 开始直播
   * @param {string} interaction - 初始互动内容
   */
  async startLive(interaction) {
    try {
      console.log(`[Live App] 开始直播，互动: ${interaction}`);

      // 显示加载状态
      this.showLoading('正在开始直播...');

      // 开始新的直播会话
      this.stateManager.startLiveSession();
      this.isLiveActive = true;

      // 开始监听事件
      this.eventListener.startListening();

      // 发送开始直播消息
      await this.messageSender.sendStartLiveMessage(interaction);

      // 切换到直播视图
      this.renderLiveView();

      console.log('[Live App] ✅ 直播已开始');
    } catch (error) {
      console.error('[Live App] 开始直播失败:', error);
      alert('开始直播失败: ' + error.message);

      // 恢复状态
      this.isLiveActive = false;
      this.stateManager.endLiveSession();
      this.eventListener.stopListening();
      this.renderStartView();
    }
  }

  /**
   * 显示加载状态
   */
  showLoading(message = '加载中...') {
    if (this.container) {
      this.container.innerHTML = `
        <div class="loading-screen">
          <div class="loading-spinner"></div>
          <p>${message}</p>
        </div>
      `;
    }
  }

  /**
   * 渲染直播视图
   */
  renderLiveView() {
    this.currentView = 'live';
    const liveData = this.stateManager.getCurrentLiveData();

    this.container.innerHTML = `
      <div class="live-room-screen">
        <!-- 状态栏 -->
        <div class="status-center">
          <div class="dynamic-island"></div>
        </div>

        <!-- 应用头部 -->
        <div class="app-header" id="app-header">
          <div class="app-header-left">
            <span class="back-icon">←</span>
            <span class="live-status-text">直播中</span>
          </div>
          <div class="app-header-right">
            <div class="viewer-count">
              <i class="fas fa-user-friends"></i>
              <span id="viewer-count-display">${liveData.viewerCount || '0'}</span>
            </div>
            <button class="app-header-btn" id="gift-log-btn" title="礼物记录">
              <i class="fas fa-gift"></i>
            </button>
            <button class="app-header-btn" id="end-live-btn" title="结束直播">
              <i class="fas fa-power-off"></i>
            </button>
          </div>
        </div>

        <!-- 视频框 -->
        <div class="video-placeholder">
          <div class="live-status-top">🎵 正在直播</div>
          <p class="live-content-text" id="live-content-text">
            ${liveData.liveContent || '等待直播内容...'}
          </p>
          <div class="live-status-bottom">
            <div class="live-dot"></div>
            <span>LIVE</span>
          </div>
        </div>

        <!-- 推荐互动 -->
        <div class="interaction-panel">
          <div class="interaction-header">
            <h4>推荐互动：</h4>
            <button class="interact-btn" id="custom-interact-btn">
              <i class="fas fa-pen-nib"></i> 自定义互动
            </button>
          </div>
          <div class="recommended-interactions" id="recommended-interactions">
            ${this.renderRecommendedInteractions(liveData.recommendedInteractions)}
          </div>
        </div>

        <!-- 弹幕容器 -->
        <div class="danmaku-container" id="danmaku-container">
          <div class="danmaku-list" id="danmaku-list">
            ${this.renderDanmakuList(liveData.danmakuList)}
          </div>
        </div>
      </div>

      <!-- 礼物记录弹窗 -->
      <div id="gift-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>礼物流水</h3>
            <button class="modal-close-btn">&times;</button>
          </div>
          <ul class="gift-list" id="gift-list">
            ${this.renderGiftList(liveData.giftList)}
          </ul>
        </div>
      </div>

      <!-- 自定义互动弹窗 -->
      <div id="interaction-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>自定义互动</h3>
            <button class="modal-close-btn">&times;</button>
          </div>
          <form id="interaction-form">
            <textarea
              id="custom-interaction-textarea"
              placeholder="输入你想要的互动内容..."
              rows="4"
            ></textarea>
            <button type="submit" class="submit-btn">发送</button>
          </form>
        </div>
      </div>
    `;

    this.bindLiveViewEvents();
    this.addButtonAnimations();
  }

  /**
   * 渲染推荐互动
   */
  renderRecommendedInteractions(interactions) {
    if (!interactions || interactions.length === 0) {
      return `
        <button class="rec-btn">等待推荐互动...</button>
        <button class="rec-btn">等待推荐互动...</button>
        <button class="rec-btn">等待推荐互动...</button>
        <button class="rec-btn">等待推荐互动...</button>
      `;
    }

    // 确保有4个按钮
    const paddedInteractions = [...interactions];
    while (paddedInteractions.length < 4) {
      paddedInteractions.push('等待更多互动...');
    }

    return paddedInteractions
      .slice(0, 4)
      .map(interaction => `<button class="rec-btn" data-interaction="${interaction}">${interaction}</button>`)
      .join('');
  }

  /**
   * 渲染弹幕列表（优化性能，限制显示数量）
   */
  renderDanmakuList(danmakuList) {
    if (!danmakuList || danmakuList.length === 0) {
      return '<div class="no-danmaku">等待弹幕...</div>';
    }

    // 性能优化：只显示最新的50条弹幕
    const maxDisplayCount = 50;
    const displayList = danmakuList.length > maxDisplayCount ? danmakuList.slice(-maxDisplayCount) : danmakuList;

    const startTime = performance.now();
    const html = displayList
      .map(danmaku => {
        if (danmaku.type === 'gift') {
          return `
          <div class="danmaku-item gift">
            <i class="fas fa-gift"></i>
            <span class="username">${danmaku.username}</span>
            <span class="content">送出 ${danmaku.content}</span>
          </div>
        `;
        } else {
          return `
          <div class="danmaku-item normal">
            <span class="username">${danmaku.username}:</span>
            <span class="content">${danmaku.content}</span>
          </div>
        `;
        }
      })
      .join('');

    const renderTime = performance.now() - startTime;
    if (renderTime > 10) {
      // 只在渲染时间超过10ms时记录
      console.log(
        `[Live App] 弹幕渲染耗时: ${renderTime.toFixed(2)}ms (显示${displayList.length}/${danmakuList.length}条)`,
      );
    }

    return html;
  }

  /**
   * 渲染礼物列表
   */
  renderGiftList(giftList) {
    if (!giftList || giftList.length === 0) {
      return '<li class="no-gifts">暂无礼物记录</li>';
    }

    return giftList
      .map(
        gift =>
          `<li>
        <span class="username">${gift.username}</span>送出
        <span class="gift-name">${gift.gift}</span>
        <span class="timestamp">${gift.timestamp}</span>
      </li>`,
      )
      .join('');
  }

  /**
   * 绑定直播视图事件
   */
  bindLiveViewEvents() {
    // 返回按钮
    const backIcon = this.container.querySelector('.back-icon');
    if (backIcon) {
      backIcon.addEventListener('click', () => {
        // 返回手机主屏幕的逻辑
        if (window.mobilePhone && window.mobilePhone.goHome) {
          window.mobilePhone.goHome();
        } else if (window.MobilePhone && window.MobilePhone.goHome) {
          window.MobilePhone.goHome();
        } else {
          console.warn('[Live App] 未找到手机框架的goHome方法');
        }
      });
    }

    // 结束直播按钮
    const endLiveBtn = this.container.querySelector('#end-live-btn');
    if (endLiveBtn) {
      endLiveBtn.addEventListener('click', () => {
        this.showEndLiveConfirm();
      });
    }

    // 礼物记录按钮
    const giftLogBtn = this.container.querySelector('#gift-log-btn');
    const giftModal = this.container.querySelector('#gift-modal');
    if (giftLogBtn && giftModal) {
      giftLogBtn.addEventListener('click', () => {
        giftModal.classList.add('active');
      });
    }

    // 自定义互动按钮
    const customInteractBtn = this.container.querySelector('#custom-interact-btn');
    const interactionModal = this.container.querySelector('#interaction-modal');
    if (customInteractBtn && interactionModal) {
      customInteractBtn.addEventListener('click', () => {
        interactionModal.classList.add('active');
      });
    }

    // 推荐互动按钮
    const recBtns = this.container.querySelectorAll('.rec-btn');
    recBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const interaction = btn.dataset.interaction;
        if (interaction && interaction !== '等待推荐互动...' && interaction !== '等待更多互动...') {
          await this.sendInteraction(interaction);
        }
      });
    });

    // 弹窗关闭按钮
    const closeBtns = this.container.querySelectorAll('.modal-close-btn');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        if (modal) {
          modal.classList.remove('active');
        }
      });
    });

    // 自定义互动表单
    const interactionForm = this.container.querySelector('#interaction-form');
    if (interactionForm) {
      interactionForm.addEventListener('submit', async e => {
        e.preventDefault();
        const textarea = this.container.querySelector('#custom-interaction-textarea');
        if (textarea) {
          const interaction = textarea.value.trim();
          if (interaction) {
            await this.sendInteraction(interaction);
            textarea.value = '';
            const modal = this.container.querySelector('#interaction-modal');
            if (modal) {
              modal.classList.remove('active');
            }
          }
        }
      });
    }

    // 弹窗背景点击关闭
    const modals = this.container.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.addEventListener('click', e => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });
  }

  /**
   * 发送互动消息
   */
  async sendInteraction(interaction) {
    try {
      console.log(`[Live App] 发送互动: ${interaction}`);
      await this.messageSender.sendContinueLiveMessage(interaction);
    } catch (error) {
      console.error('[Live App] 发送互动失败:', error);
      alert('发送互动失败: ' + error.message);
    }
  }

  /**
   * 显示结束直播确认
   */
  showEndLiveConfirm() {
    if (confirm('确定要结束直播吗？')) {
      this.endLive();
    }
  }

  /**
   * 结束直播
   */
  async endLive() {
    try {
      console.log('[Live App] 结束直播');

      // 停止监听
      this.eventListener.stopListening();

      // 结束直播会话
      this.stateManager.endLiveSession();
      this.isLiveActive = false;

      // 清理状态
      await this.stateManager.clearState();

      // 返回开始界面
      this.renderStartView();

      console.log('[Live App] ✅ 直播已结束');
    } catch (error) {
      console.error('[Live App] 结束直播失败:', error);
    }
  }

  /**
   * 解析新的直播数据
   */
  async parseNewLiveData() {
    try {
      console.log('[Live App] 开始解析新的直播数据');

      // 获取聊天内容
      const chatContent = this.dataParser.getChatContent();
      if (!chatContent) {
        console.log('[Live App] 没有获取到聊天内容');
        return;
      }

      // 解析直播数据
      const newLiveData = this.dataParser.parseLiveData(chatContent);

      // 检查是否有新数据
      if (this.hasNewData(newLiveData)) {
        console.log('[Live App] 检测到新的直播数据，更新界面');

        // 显示新消息提示
        this.showNewMessageIndicator();

        // 更新状态
        await this.stateManager.updateLiveData(newLiveData);

        // 重新渲染界面
        this.updateLiveView();

        // 保存状态
        this.stateManager.saveState();
      }
    } catch (error) {
      console.error('[Live App] 解析直播数据失败:', error);
    }
  }

  /**
   * 检查是否有新数据
   */
  hasNewData(newData) {
    const currentData = this.stateManager.getCurrentLiveData();

    return (
      newData.viewerCount !== currentData.viewerCount ||
      newData.liveContent !== currentData.liveContent ||
      newData.danmakuList.length > 0 ||
      newData.giftList.length > 0 ||
      newData.recommendedInteractions.length > 0
    );
  }

  /**
   * 更新直播视图
   */
  updateLiveView() {
    if (this.currentView !== 'live' || !this.container) {
      return;
    }

    const liveData = this.stateManager.getCurrentLiveData();

    // 更新观看人数（带动画效果）
    const viewerCountDisplay = this.container.querySelector('#viewer-count-display');
    if (viewerCountDisplay) {
      const oldCount = viewerCountDisplay.textContent;
      const newCount = liveData.viewerCount || '0';

      if (oldCount !== newCount) {
        viewerCountDisplay.classList.add('number-change');
        viewerCountDisplay.textContent = newCount;

        // 移除动画类
        setTimeout(() => {
          viewerCountDisplay.classList.remove('number-change');
        }, 500);
      }
    }

    // 更新直播内容（带打字机效果）
    const liveContentText = this.container.querySelector('#live-content-text');
    if (liveContentText && liveData.liveContent) {
      const oldContent = liveContentText.textContent;
      if (oldContent !== liveData.liveContent) {
        liveContentText.classList.add('typewriter');
        liveContentText.textContent = liveData.liveContent;

        // 移除打字机效果
        setTimeout(() => {
          liveContentText.classList.remove('typewriter');
        }, 2000);
      }
    }

    // 更新推荐互动（带悬浮效果）
    const recommendedInteractions = this.container.querySelector('#recommended-interactions');
    if (recommendedInteractions) {
      recommendedInteractions.innerHTML = this.renderRecommendedInteractions(liveData.recommendedInteractions);

      // 重新绑定推荐互动按钮事件并添加动画效果
      const recBtns = recommendedInteractions.querySelectorAll('.rec-btn');
      recBtns.forEach(btn => {
        // 添加悬浮和波纹效果
        btn.classList.add('hover-float', 'ripple-effect');

        btn.addEventListener('click', async () => {
          const interaction = btn.dataset.interaction;
          if (interaction && interaction !== '等待推荐互动...' && interaction !== '等待更多互动...') {
            await this.sendInteraction(interaction);
          }
        });
      });
    }

    // 更新弹幕列表（带滚动动画）
    const danmakuList = this.container.querySelector('#danmaku-list');
    if (danmakuList) {
      const oldDanmakuCount = danmakuList.children.length;
      danmakuList.innerHTML = this.renderDanmakuList(liveData.danmakuList);

      // 为新弹幕添加滚动动画
      const newDanmakuCount = danmakuList.children.length;
      if (newDanmakuCount > oldDanmakuCount) {
        const newDanmaku = Array.from(danmakuList.children).slice(oldDanmakuCount);
        newDanmaku.forEach((item, index) => {
          item.classList.add('danmaku-scroll');

          // 为礼物弹幕添加特效
          if (item.classList.contains('gift')) {
            item.classList.add('gift-sparkle');
          }

          // 延迟移除动画类
          setTimeout(() => {
            item.classList.remove('danmaku-scroll');
          }, 300 + index * 100);
        });
      }

      // 滚动到底部
      const danmakuContainer = this.container.querySelector('#danmaku-container');
      if (danmakuContainer) {
        danmakuContainer.scrollTop = danmakuContainer.scrollHeight;
      }
    }

    // 更新礼物列表
    const giftList = this.container.querySelector('#gift-list');
    if (giftList) {
      giftList.innerHTML = this.renderGiftList(liveData.giftList);
    }
  }

  /**
   * 添加按钮动画效果
   */
  addButtonAnimations() {
    // 为所有按钮添加波纹效果
    const buttons = this.container.querySelectorAll('button');
    buttons.forEach(button => {
      if (!button.classList.contains('ripple-effect')) {
        button.classList.add('ripple-effect');
      }
    });

    // 为开始直播按钮添加脉冲效果
    const startBtns = this.container.querySelectorAll('.start-btn, .preset-btn');
    startBtns.forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.classList.add('pulse');
      });

      btn.addEventListener('mouseleave', () => {
        btn.classList.remove('pulse');
      });
    });

    // 为LIVE指示器添加闪烁效果
    const liveDot = this.container.querySelector('.live-dot');
    if (liveDot) {
      liveDot.classList.add('new-message-indicator');
    }
  }

  /**
   * 显示新消息提示
   */
  showNewMessageIndicator() {
    const appHeader = this.container.querySelector('.app-header');
    if (appHeader) {
      appHeader.classList.add('new-message-indicator');

      setTimeout(() => {
        appHeader.classList.remove('new-message-indicator');
      }, 2000);
    }
  }
}

// ==================== 应用初始化 ====================

// 全局实例
let liveAppInstance = null;

// 立即导出类到全局作用域（手机框架需要）
if (typeof window !== 'undefined') {
  window.LiveApp = LiveApp;
  window.LiveEventListener = LiveEventListener;
  window.LiveDataParser = LiveDataParser;
  window.LiveDataStorage = LiveDataStorage;
  window.LiveStateManager = LiveStateManager;
  window.LiveMessageSender = LiveMessageSender;

  console.log('[Live App] ✅ 类已导出到全局作用域:', {
    LiveApp: !!window.LiveApp,
    LiveEventListener: !!window.LiveEventListener,
    LiveDataParser: !!window.LiveDataParser,
    LiveDataStorage: !!window.LiveDataStorage,
    LiveStateManager: !!window.LiveStateManager,
    LiveMessageSender: !!window.LiveMessageSender,
  });
}

/**
 * 初始化直播应用
 */
async function initializeLiveApp() {
  try {
    if (liveAppInstance) {
      console.log('[Live App] 应用实例已存在，检查状态...');

      // 检查实例是否正常
      if (liveAppInstance.container && liveAppInstance.isInitialized) {
        console.log('[Live App] 实例状态正常，重用现有实例');

        // 确保容器在DOM中
        const appContent = document.getElementById('app-content');
        if (appContent && !appContent.contains(liveAppInstance.container)) {
          console.log('[Live App] 容器不在DOM中，重新添加');
          appContent.appendChild(liveAppInstance.container);
        }

        return liveAppInstance;
      } else {
        console.log('[Live App] 实例状态异常，销毁并重新创建');
        liveAppInstance.destroy();
        liveAppInstance = null;
      }
    }

    console.log('[Live App] 创建新的应用实例');
    liveAppInstance = new LiveApp();
    await liveAppInstance.initialize();

    // 导出实例到全局作用域以便调试
    if (typeof window !== 'undefined') {
      window.liveAppInstance = liveAppInstance;
    }

    return liveAppInstance;
  } catch (error) {
    console.error('[Live App] 初始化应用失败:', error);
    // 清理异常实例
    if (liveAppInstance) {
      liveAppInstance.destroy();
      liveAppInstance = null;
    }
    throw error;
  }
}

// 导出类和函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LiveApp,
    LiveEventListener,
    LiveDataParser,
    LiveStateManager,
    LiveMessageSender,
    initializeLiveApp,
  };
}

// 类已在文件开头导出，这里不需要重复导出

// ==================== 手机框架集成 ====================

/**
 * 获取直播应用内容（手机框架集成接口）
 * @returns {string} 直播应用的HTML内容
 */
function getLiveAppContent() {
  console.log('[Live App] 获取直播应用内容');

  // 返回应用容器，实际内容将由LiveApp实例动态生成
  return `
    <div id="live-app-container" class="live-app-container">
      <div class="loading-screen">
        <div class="loading-spinner"></div>
        <p>正在初始化直播应用...</p>
      </div>
    </div>
  `;
}

/**
 * 绑定直播应用事件（手机框架集成接口）
 */
function bindLiveAppEvents() {
  console.log('[Live App] 绑定直播应用事件');

  // 初始化直播应用
  initializeLiveApp().catch(error => {
    console.error('[Live App] 初始化失败:', error);

    // 显示错误信息
    const container = document.getElementById('live-app-container');
    if (container) {
      container.innerHTML = `
        <div class="error-screen">
          <div class="error-icon">❌</div>
          <h3>初始化失败</h3>
          <p>${error.message}</p>
          <button onclick="bindLiveAppEvents()" class="retry-btn">重试</button>
        </div>
      `;
    }
  });
}

/**
 * 清理直播应用（手机框架集成接口）
 */
function cleanupLiveApp() {
  console.log('[Live App] 清理直播应用');

  if (liveAppInstance) {
    // 使用新的destroy方法清理所有资源
    liveAppInstance.destroy();

    // 清理全局引用
    liveAppInstance = null;
  }
}

/**
 * 强制重新加载直播应用（类似task-app的forceReload）
 */
function liveAppForceReload() {
  console.log('[Live App] 🔄 强制重新加载应用...');

  // 先销毁旧实例
  if (liveAppInstance) {
    liveAppInstance.destroy();
    liveAppInstance = null;
  }

  // 创建新实例将在下次调用initializeLiveApp时进行
  console.log('[Live App] ✅ 应用已准备重新加载');
}

// ==================== 调试和测试功能 ====================

/**
 * 调试工具类
 */
class LiveAppDebugger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
    };

    this.logs.push(logEntry);

    // 保持日志数量在限制内
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // 输出到控制台
    console[level](`[Live App Debug] ${message}`, data || '');
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}

/**
 * 测试直播数据解析
 */
function testLiveDataParsing() {
  console.log('[Live App Test] 开始测试数据解析功能');

  const parser = new LiveDataParser();
  const testContent = `
    [直播|本场人数|12345]
    [直播|直播内容|大家好，欢迎来到我的直播间！今天我们来聊聊有趣的话题。]
    [直播|小明|弹幕|主播好！]
    [直播|小红|弹幕|终于等到直播了！]
    [直播|土豪|打赏|火箭*3]
    [直播|推荐互动|和观众聊聊天]
    [直播|推荐互动|唱首歌]
    [直播|推荐互动|回答问题]
    [直播|推荐互动|分享故事]
  `;

  const result = parser.parseLiveData(testContent);
  console.log('[Live App Test] 解析结果:', result);

  // 验证解析结果
  const tests = [
    { name: '观看人数', condition: result.viewerCount === '12.3K' },
    { name: '直播内容', condition: result.liveContent.includes('大家好') },
    { name: '普通弹幕', condition: result.danmakuList.length >= 2 },
    { name: '打赏弹幕', condition: result.giftList.length >= 1 },
    { name: '推荐互动', condition: result.recommendedInteractions.length === 4 },
  ];

  tests.forEach(test => {
    console.log(`[Live App Test] ${test.name}: ${test.condition ? '✅ 通过' : '❌ 失败'}`);
  });

  return result;
}

/**
 * 测试手机框架集成
 */
function testMobileIntegration() {
  console.log('[Live App Test] 开始测试手机框架集成');

  const tests = [
    {
      name: 'getLiveAppContent函数',
      condition: typeof window.getLiveAppContent === 'function',
    },
    {
      name: 'bindLiveAppEvents函数',
      condition: typeof window.bindLiveAppEvents === 'function',
    },
    {
      name: 'cleanupLiveApp函数',
      condition: typeof window.cleanupLiveApp === 'function',
    },
  ];

  tests.forEach(test => {
    console.log(`[Live App Test] ${test.name}: ${test.condition ? '✅ 通过' : '❌ 失败'}`);
  });

  // 测试内容生成
  try {
    const content = window.getLiveAppContent();
    console.log(`[Live App Test] 内容生成: ${content ? '✅ 通过' : '❌ 失败'}`);
  } catch (error) {
    console.log(`[Live App Test] 内容生成: ❌ 失败 - ${error.message}`);
  }
}

/**
 * 测试数据获取功能
 */
function testDataRetrieval() {
  console.log('[Live App Test] 开始测试数据获取功能');

  const parser = new LiveDataParser();

  // 测试消息数量获取
  const eventListener = new LiveEventListener(null);
  const messageCount = eventListener.getCurrentMessageCount();
  console.log(
    `[Live App Test] 消息数量获取: ${messageCount > 0 ? '✅ 通过' : '❌ 失败'} (获取到 ${messageCount} 条消息)`,
  );

  // 测试聊天内容获取
  const chatContent = parser.getChatContent();
  console.log(
    `[Live App Test] 聊天内容获取: ${chatContent.length > 0 ? '✅ 通过' : '❌ 失败'} (内容长度: ${chatContent.length})`,
  );

  // 测试mobileContextEditor可用性
  const mobileContextEditor = window['mobileContextEditor'];
  console.log(`[Live App Test] mobileContextEditor可用性: ${mobileContextEditor ? '✅ 通过' : '❌ 失败'}`);

  if (mobileContextEditor && typeof mobileContextEditor.getCurrentChatData === 'function') {
    const chatData = mobileContextEditor.getCurrentChatData();
    console.log(
      `[Live App Test] mobileContextEditor数据获取: ${chatData && chatData.messages ? '✅ 通过' : '❌ 失败'} (消息数: ${
        chatData?.messages?.length || 0
      })`,
    );
  }
}

/**
 * 测试事件监听功能
 */
function testEventListening() {
  console.log('[Live App Test] 开始测试事件监听功能');

  // 检查事件系统可用性
  console.log('[Live App Test] 事件系统检查:', {
    eventOn: typeof eventOn,
    'SillyTavern.getContext': typeof window?.SillyTavern?.getContext,
  });

  // 检查SillyTavern.getContext()的事件系统
  if (window?.SillyTavern && typeof window.SillyTavern.getContext === 'function') {
    try {
      const context = window.SillyTavern.getContext();
      console.log('[Live App Test] SillyTavern context事件系统:', {
        eventSource: !!context?.eventSource,
        event_types: !!context?.event_types,
        MESSAGE_RECEIVED: context?.event_types?.MESSAGE_RECEIVED,
      });
    } catch (error) {
      console.error('[Live App Test] 获取context失败:', error);
    }
  }

  // 测试手动触发事件监听器
  if (window.liveAppInstance && window.liveAppInstance.eventListener) {
    const listener = window.liveAppInstance.eventListener;
    console.log('[Live App Test] 手动触发消息接收事件...');

    // 模拟消息接收事件
    listener
      .onMessageReceived(999)
      .then(() => {
        console.log('[Live App Test] 手动触发完成');
      })
      .catch(error => {
        console.error('[Live App Test] 手动触发失败:', error);
      });
  } else {
    console.log('[Live App Test] 直播应用实例不存在');
  }
}

/**
 * 测试事件系统连接
 */
function testEventConnection() {
  console.log('[Live App Test] 测试事件系统连接');

  // 创建测试监听器
  function testListener(messageId) {
    console.log(`[Live App Test] 🎯 测试监听器收到消息: ${messageId}`);
  }

  // 尝试注册测试监听器
  if (typeof eventOn === 'function' && typeof tavern_events !== 'undefined') {
    console.log('[Live App Test] 注册测试监听器...');
    eventOn(tavern_events.MESSAGE_RECEIVED, testListener);

    // 5秒后移除测试监听器
    setTimeout(() => {
      if (typeof eventRemoveListener === 'function') {
        eventRemoveListener(tavern_events.MESSAGE_RECEIVED, testListener);
        console.log('[Live App Test] 测试监听器已移除');
      }
    }, 5000);

    console.log('[Live App Test] 测试监听器已注册，将在5秒后自动移除');
  } else {
    console.log('[Live App Test] ❌ 事件系统不可用');
  }
}

/**
 * 测试推荐互动解析
 */
function testRecommendedInteractions() {
  console.log('[Live App Test] 测试推荐互动解析');

  // 获取当前聊天内容
  if (window?.SillyTavern && typeof window.SillyTavern.getContext === 'function') {
    const context = window.SillyTavern.getContext();
    if (context && context.chat && Array.isArray(context.chat)) {
      const messages = context.chat;
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        console.log('[Live App Test] 最后一条消息内容:', lastMessage.mes);

        // 测试推荐互动解析
        const parser = new LiveDataParser();
        const interactions = parser.parseRecommendedInteractions(lastMessage.mes);
        console.log('[Live App Test] 解析到的推荐互动:', interactions);

        // 检查是否包含推荐互动格式
        const pattern = /\[直播\|推荐互动\|([^\]]+)\]/g;
        const matches = [...lastMessage.mes.matchAll(pattern)];
        console.log(
          '[Live App Test] 正则匹配结果:',
          matches.map(m => m[1]),
        );
      }
    }
  }
}

/**
 * 测试新的数据存储系统
 */
async function testDataStorage() {
  console.log('[Live App Test] 测试chatMetadata数据存储系统');

  try {
    // 创建测试存储实例
    const storage = new LiveDataStorage();

    // 开始新场次
    storage.startNewSession();
    console.log('[Live App Test] 场次ID:', storage.getCurrentSessionId());

    // 测试保存弹幕
    const testDanmaku = [
      { username: '测试用户1', content: '测试弹幕1', type: 'normal' },
      { username: '测试用户2', content: '测试弹幕2', type: 'normal' },
    ];

    await storage.saveDanmaku(testDanmaku);
    console.log('[Live App Test] 测试弹幕已保存');

    // 测试加载弹幕
    const loadedDanmaku = storage.loadDanmaku();
    console.log('[Live App Test] 加载的弹幕:', loadedDanmaku);

    // 检查chatMetadata
    const context = window.SillyTavern.getContext();
    console.log('[Live App Test] chatMetadata中的数据:', {
      live_app_danmaku: context.chatMetadata.live_app_danmaku,
      live_app_session_id: context.chatMetadata.live_app_session_id,
      live_app_last_updated: context.chatMetadata.live_app_last_updated,
    });

    console.log('[Live App Test] ✅ 数据存储系统测试完成');
  } catch (error) {
    console.error('[Live App Test] ❌ 数据存储系统测试失败:', error);
  }
}

/**
 * 测试清空功能
 */
async function testClearData() {
  console.log('[Live App Test] 测试数据清空功能');

  try {
    const context = window.SillyTavern.getContext();

    // 显示清空前的数据
    console.log('[Live App Test] 清空前的chatMetadata:', {
      live_app_danmaku: context.chatMetadata.live_app_danmaku,
      live_app_session_id: context.chatMetadata.live_app_session_id,
      live_app_last_updated: context.chatMetadata.live_app_last_updated,
    });

    // 创建存储实例并清空
    const storage = new LiveDataStorage();
    storage.sessionId = context.chatMetadata.live_app_session_id; // 设置当前场次ID
    await storage.clearSessionData();

    // 显示清空后的数据
    console.log('[Live App Test] 清空后的chatMetadata:', {
      live_app_danmaku: context.chatMetadata.live_app_danmaku,
      live_app_session_id: context.chatMetadata.live_app_session_id,
      live_app_last_updated: context.chatMetadata.live_app_last_updated,
    });

    console.log('[Live App Test] ✅ 数据清空测试完成');
  } catch (error) {
    console.error('[Live App Test] ❌ 数据清空测试失败:', error);
  }
}

/**
 * 测试应用性能
 */
async function testPerformance() {
  console.log('[Live App Test] 测试应用性能');

  try {
    const startTime = performance.now();

    // 测试初始化性能
    console.log('[Live App Test] 测试初始化性能...');
    const app = new LiveApp();
    const initStartTime = performance.now();
    await app.initialize();
    const initTime = performance.now() - initStartTime;
    console.log(`[Live App Test] 初始化耗时: ${initTime.toFixed(2)}ms`);

    // 测试数据解析性能
    console.log('[Live App Test] 测试数据解析性能...');
    const parser = new LiveDataParser();
    const parseStartTime = performance.now();
    const testContent = `
      [直播|本场人数|12345]
      [直播|直播内容|测试直播内容]
      [直播|用户1|弹幕|测试弹幕1]
      [直播|用户2|弹幕|测试弹幕2]
      [直播|推荐互动|测试互动1]
      [直播|推荐互动|测试互动2]
    `;
    const parseResult = parser.parseLiveData(testContent);
    const parseTime = performance.now() - parseStartTime;
    console.log(`[Live App Test] 数据解析耗时: ${parseTime.toFixed(2)}ms`);
    console.log('[Live App Test] 解析结果:', parseResult);

    const totalTime = performance.now() - startTime;
    console.log(`[Live App Test] ✅ 性能测试完成，总耗时: ${totalTime.toFixed(2)}ms`);
  } catch (error) {
    console.error('[Live App Test] ❌ 性能测试失败:', error);
  }
}

/**
 * 测试SillyTavern接口
 */
function testSillyTavernInterface() {
  console.log('[Live App Test] 测试SillyTavern接口');

  // 检查SillyTavern接口可用性（根据文档的正确方法）
  const checks = [
    {
      name: 'window.SillyTavern',
      available: !!window?.SillyTavern,
      value: window?.SillyTavern ? 'object' : 'undefined',
    },
    {
      name: 'window.SillyTavern.getContext',
      available: typeof window?.SillyTavern?.getContext === 'function',
      value: typeof window?.SillyTavern?.getContext,
    },
    {
      name: 'eventOn',
      available: typeof eventOn === 'function',
      value: typeof eventOn,
    },
    {
      name: 'tavern_events',
      available: typeof tavern_events !== 'undefined',
      value: typeof tavern_events !== 'undefined' ? 'object' : 'undefined',
    },
    {
      name: 'tavern_events.MESSAGE_RECEIVED',
      available: typeof tavern_events !== 'undefined' && !!tavern_events?.MESSAGE_RECEIVED,
      value: typeof tavern_events !== 'undefined' ? tavern_events?.MESSAGE_RECEIVED || 'undefined' : 'undefined',
    },
  ];

  checks.forEach(check => {
    console.log(`[Live App Test] ${check.name}: ${check.available ? '✅' : '❌'} (${check.value})`);
  });

  // 测试消息获取（使用正确的方法）
  if (window?.SillyTavern && typeof window.SillyTavern.getContext === 'function') {
    try {
      const context = window.SillyTavern.getContext();
      if (context && context.chat && Array.isArray(context.chat)) {
        const messages = context.chat;
        console.log(`[Live App Test] 通过SillyTavern.getContext().chat: ✅ 成功 (${messages.length} 条消息)`);

        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          console.log(`[Live App Test] 最后一条消息预览: "${lastMessage.mes?.substring(0, 50)}..."`);
        }

        // 测试事件系统
        if (context.eventSource && context.event_types) {
          console.log(
            `[Live App Test] 事件系统可用: ✅ eventSource=${!!context.eventSource}, event_types=${!!context.event_types}`,
          );
          console.log(`[Live App Test] MESSAGE_RECEIVED事件: ${context.event_types.MESSAGE_RECEIVED}`);
        } else {
          console.log('[Live App Test] ❌ 事件系统不可用');
        }
      } else {
        console.log('[Live App Test] ❌ SillyTavern.getContext()返回的数据无效');
      }
    } catch (error) {
      console.log(`[Live App Test] ❌ SillyTavern.getContext()调用失败: ${error.message}`);
    }
  } else {
    console.log('[Live App Test] ❌ 无法访问SillyTavern.getContext()');
  }

  // 详细调试window.chat
  console.log('[Live App Test] 详细调试window.chat:');
  console.log('window.chat:', window?.chat);
  console.log('typeof window.chat:', typeof window?.chat);
  console.log('Array.isArray(window.chat):', Array.isArray(window?.chat));
  console.log('window.chat.length:', window?.chat?.length);

  if (window?.chat) {
    console.log('window.chat的前几个属性:', Object.keys(window.chat).slice(0, 10));
  }

  // 详细调试window.parent.chat
  console.log('[Live App Test] 详细调试window.parent.chat:');
  console.log('window.parent.chat:', window?.parent?.chat);
  console.log('typeof window.parent.chat:', typeof window?.parent?.chat);
  console.log('Array.isArray(window.parent.chat):', Array.isArray(window?.parent?.chat));
  console.log('window.parent.chat.length:', window?.parent?.chat?.length);

  if (window?.parent?.chat) {
    console.log('window.parent.chat的前几个属性:', Object.keys(window.parent.chat).slice(0, 10));
  }
}

/**
 * 运行所有测试
 */
function runAllTests() {
  console.log('[Live App Test] 🧪 开始运行所有测试');

  try {
    testLiveDataParsing();
    testMobileIntegration();
    testDataRetrieval();
    testEventListening();
    testEventConnection();
    testSillyTavernInterface();

    console.log('[Live App Test] ✅ 所有测试完成');
  } catch (error) {
    console.error('[Live App Test] ❌ 测试过程中出现错误:', error);
  }
}

// 创建全局调试器实例
const liveAppDebugger = new LiveAppDebugger();

// 导出全局函数
if (typeof window !== 'undefined') {
  window.getLiveAppContent = getLiveAppContent;
  window.bindLiveAppEvents = bindLiveAppEvents;
  window.cleanupLiveApp = cleanupLiveApp;
  window.liveAppForceReload = liveAppForceReload;

  // 导出调试和测试功能
  window.liveAppDebugger = liveAppDebugger;
  window.testLiveDataParsing = testLiveDataParsing;
  window.testMobileIntegration = testMobileIntegration;
  window.testDataRetrieval = testDataRetrieval;
  window.testEventListening = testEventListening;
  window.testEventConnection = testEventConnection;
  window.testRecommendedInteractions = testRecommendedInteractions;
  window.testDataStorage = testDataStorage;
  window.testClearData = testClearData;
  window.testPerformance = testPerformance;
  window.testSillyTavernInterface = testSillyTavernInterface;
  window.runAllTests = runAllTests;

  console.log('[Live App] ✅ 全局函数已导出:', {
    getLiveAppContent: !!window.getLiveAppContent,
    bindLiveAppEvents: !!window.bindLiveAppEvents,
    cleanupLiveApp: !!window.cleanupLiveApp,
    liveAppForceReload: !!window.liveAppForceReload,
  });
}

// 自动初始化（如果在浏览器环境中）
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('[Live App] DOM加载完成，准备初始化');
    });
  } else {
    console.log('[Live App] DOM已加载，准备初始化');
  }
}
