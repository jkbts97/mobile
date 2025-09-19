// ==SillyTavern Forum Auto Listener==
// @name         Forum Auto Listener for Mobile Extension
// @version      1.0.1
// @description  Forum automatic listener, monitor chat changes and automatically trigger forum generation
// @author       Assistant

/**
 * Forum automatic listener class
 * Monitor chat changes and automatically generate forum content when the conditions are met.
 *
 * Configuration description：
 * - checkIntervalMs: Check the interval（Millisecond，Tacitly approve5000）
 * - debounceMs: Anti-shake delay time（Millisecond，Tacitly approve500）
 * - immediateOnThreshold: Whether to execute immediately when the threshold is reached（Tacitly approvetrue）
 * - enabled: Whether to enable monitoring（Tacitly approvetrue）
 * - maxRetries: Maximum number of retries（Tacitly approve3）
 * - autoStartWithUI: Whether to start and stop automatically with the interface（Tacitly approvetrue）
 */
class ForumAutoListener {
  constructor() {
    this.isListening = false;
    this.lastMessageCount = 0;
    this.lastCheckTime = Date.now();
    this.checkInterval = null; // Initialise asnull，The timer is not created automatically.
    this.debounceTimer = null;
    this.isProcessingRequest = false; // Add：Request processing lock
    this.lastProcessedMessageCount = 0; // New: the number of messages processed at the end
    this.currentStatus = 'On standby'; // New addition: current status
    this.statusElement = null; // New: Status display element
    this.lastGenerationTime = null; // New addition: the last generation time
    this.generationCount = 0; // New addition: statistics on the number of generations
    this.uiObserver = null; // New: Interface Observer
    this.settings = {
      enabled: true,
      checkIntervalMs: 5000, //Check once every 5 seconds
      debounceMs: 500, // Anti-shake for 0.5 seconds (reduced from 2 seconds to 0.5 seconds)
      immediateOnThreshold: true, // New: Execute immediately when the threshold is reached
      maxRetries: 3,
      autoStartWithUI: true, // New: Whether to start and stop automatically with the interface
    };

    // Binding method
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.checkForChanges = this.checkForChanges.bind(this);
    this.safeDebounceAutoGenerate = this.safeDebounceAutoGenerate.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.initStatusDisplay = this.initStatusDisplay.bind(this);
    this.setupUIObserver = this.setupUIObserver.bind(this); // New: Set up the interface observer
    this.checkForumAppState = this.checkForumAppState.bind(this); // New: Check the status of the forum application
  }

  /**
   * Start monitoring
   */
  start() {
    if (this.isListening) {
      console.log('[Forum Auto Listener] Already in the monitoring');
      return;
    }

    try {
      console.log('[Forum Auto Listener] Start monitoring chat changes...');

      // 初始化状态显示
      this.initStatusDisplay();

      // 更新状态
      this.updateStatus('Starting up', 'info');

      // 初始化当前消息数量
      this.initializeMessageCount();

      // 设置定时检查
      this.checkInterval = setInterval(this.checkForChanges, this.settings.checkIntervalMs);

      // 监听SillyTavern事件（如果可用）
      this.setupEventListeners();

      this.isListening = true;
      this.updateStatus('Monitoring', 'success');
      console.log('[Forum Auto Listener] ✅ Monitoring has been started.');
    } catch (error) {
      console.error('[Forum Auto Listener] Failed to start monitoring:', error);
      this.updateStatus('Failed to start', 'error');
    }
  }

  /**
   * 停止监听
   */
  stop() {
    if (!this.isListening) {
      console.log('[Forum Auto Listener] Not in the monitoring');
      return;
    }

    try {
      console.log('[Forum Auto Listener] Stop monitoring...');
      this.updateStatus('Stopping', 'warning');

      // 清除定时器
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }

      // 清除防抖定时器
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }

      // 移除事件监听器
      this.removeEventListeners();

      // 重置状态
      this.isProcessingRequest = false;

      this.isListening = false;
      this.updateStatus('Stopped', 'offline');
      console.log('[Forum Auto Listener] ✅ The monitoring has stopped.');
    } catch (error) {
      console.error('[Forum Auto Listener] Failed to stop monitoring:', error);
      this.updateStatus('Stop failing', 'error');
    }
  }

  /**
   * 初始化当前消息数量
   */
  async initializeMessageCount() {
    try {
      if (window.forumManager) {
        const chatData = await window.forumManager.getCurrentChatData();
        if (chatData && chatData.messages) {
          this.lastMessageCount = chatData.messages.length;
          // 修复：移除lastProcessedMessageCount的初始化，避免干扰消息检测
          // this.lastProcessedMessageCount = chatData.messages.length;
          console.log(`[Forum Auto Listener] 初始消息数量: ${this.lastMessageCount}`);
        }
      } else {
        // 备用方案：直接从SillyTavern获取
        const chatData = this.getCurrentChatDataDirect();
        if (chatData && chatData.messages) {
          this.lastMessageCount = chatData.messages.length;
          console.log(`[Forum Auto Listener] Initial number of messages (backup): ${this.lastMessageCount}`);
        }
      }
    } catch (error) {
      console.warn('[Forum Auto Listener] Failed to initialise the number of messages:', error);
    }
  }

  /**
   * 检查聊天变化 - 仅通过定时器触发
   */
  async checkForChanges() {
    // 如果未启动监听，直接返回
    if (!this.isListening || !this.settings.enabled) {
      return;
    }

    // 检查SillyTavern是否正在生成消息，如果是则等待
    if (this.isSillyTavernBusy()) {
      console.log('[Forum Auto Listener] SillyTavern is generating messages, waiting for completion....');
      return;
    }

    // 如果我们正在处理请求，也跳过这次检查
    if (this.isProcessingRequest) {
      console.log('[Forum Auto Listener] The request is being processed. Skip this check.');
      return;
    }

    try {
      // 获取当前聊天数据 - 使用备用方案
      let chatData = null;
      if (window.forumManager && window.forumManager.getCurrentChatData) {
        chatData = await window.forumManager.getCurrentChatData();
      } else {
        // 备用方案：直接从SillyTavern获取
        chatData = this.getCurrentChatDataDirect();
      }

      if (!chatData || !chatData.messages) {
        return;
      }

      const currentMessageCount = chatData.messages.length;

      // 检查消息数量是否发生变化（修复：使用lastMessageCount而不是lastProcessedMessageCount）
      const messageIncrement = currentMessageCount - this.lastMessageCount;

      if (messageIncrement > 0) {
        console.log(
          `[Forum Auto Listener] New message detected: +${messageIncrement} (${this.lastMessageCount} -> ${currentMessageCount})`,
        );

        // 获取阈值（优先从论坛管理器，否则使用默认值）
        const threshold =
          window.forumManager && window.forumManager.currentSettings
            ? window.forumManager.currentSettings.threshold
            : 1; // 默认阈值为1

        console.log(`[Forum Auto Listener] 当前阈值: ${threshold}`);

        // 更新计数（修复：立即更新lastMessageCount）
        this.lastMessageCount = currentMessageCount;
        this.lastCheckTime = Date.now();

        // 检查是否达到阈值
        if (messageIncrement >= threshold) {
          console.log(`[Forum Auto Listener] If the threshold is reached, the trigger will be automatically generated immediately.`);
          this.updateStatus(`Generating (threshd:${threshold})`, 'processing');

          // 调试：检查forumManager状态
          console.log(`[Forum Auto Listener] Have a trial run - forumManagerexists: ${!!window.forumManager}`);
          console.log(
            `[Forum Auto Listener] Have a trial run - checkAutoGenerateExist: ${!!(
              window.forumManager && window.forumManager.checkAutoGenerate
            )}`,
          );
          console.log(`[Forum Auto Listener] Have a trial run - isProcessingRequest: ${this.isProcessingRequest}`);

          // 通知论坛管理器检查是否需要自动生成
          if (window.forumManager && window.forumManager.checkAutoGenerate) {
            console.log(`[Forum Auto Listener] StartCallingSafeDebounceAutoGenerate(true)`);
            try {
              // 达到阈值时立即执行，不使用防抖
              this.safeDebounceAutoGenerate(true);
              console.log(`[Forum Auto Listener] safeDebounceAutoGenerateCallcompleted`);
            } catch (error) {
              console.error(`[Forum Auto Listener] safeDebounceAutoGenerateFailed to call:`, error);
              this.updateStatus('Failed to generate', 'error');
            }
          } else {
            console.warn(
              `[Forum Auto Listener] Unable to call automatic generation - forumManager: ${!!window.forumManager}, checkAutoGenerate: ${!!(
                window.forumManager && window.forumManager.checkAutoGenerate
              )}`,
            );
            this.updateStatus('Forum Manager is not available', 'warning');
          }
        } else {
          console.log(`[Forum Auto Listener] Increment ${messageIncrement} The threshold has not been reached ${threshold}`);
          this.updateStatus(`Monitoring (${messageIncrement}/${threshold})`, 'info');
        }
      } else if (messageIncrement === 0) {
        // 没有新消息
        if (window.DEBUG_FORUM_AUTO_LISTENER) {
          console.log(`[Forum Auto Listener] No news (currently: ${currentMessageCount})`);
        }
      }
    } catch (error) {
      console.error('[Forum Auto Listener] Failed to check changes:', error);
    }
  }

  /**
   * 安全的防抖自动生成 - 带请求锁
   * @param {boolean} immediate - 是否立即执行，不使用防抖
   */
  safeDebounceAutoGenerate(immediate = false) {
    // 如果正在处理请求，跳过
    if (this.isProcessingRequest) {
      console.log('[Forum Auto Listener] The request is being processed. Skip the new trigger.');
      return;
    }

    // 如果设置了立即执行，直接执行
    if (immediate || this.settings.immediateOnThreshold) {
      console.log('[Forum Auto Listener] Perform an automatic generation check immediately...');
      this.executeAutoGenerate();
      return;
    }

    // 清除之前的定时器
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // 设置新的定时器
    this.debounceTimer = setTimeout(async () => {
      this.executeAutoGenerate();
    }, this.settings.debounceMs);
  }

  /**
   * 执行自动生成的核心逻辑
   */
  async executeAutoGenerate() {
    if (this.isProcessingRequest) {
      console.log('[Forum Auto Listener] The request is being processed, skip it');
      return;
    }

    console.log('[Forum Auto Listener] Trigger automatic generation check...');

    try {
      // 尝试初始化论坛管理器（如果不存在）
      if (!window.forumManager) {
        console.log('[Forum Auto Listener] The forum manager does not exist. Try to initialise it....');
        this.updateStatus('Initialise the forum manager', 'processing');
        await this.initializeForumManager();
      }

      // 检查论坛管理器状态
      if (window.forumManager && window.forumManager.isProcessing) {
        console.log('[Forum Auto Listener] The forum manager is being processed, skip');
        this.updateStatus('Waiting for the forum manager', 'waiting');
        return;
      }

      // 设置处理状态 - 在调用论坛管理器之前设置
      this.isProcessingRequest = true;

      // 执行自动生成 - 完全清除处理状态避免冲突
      if (window.forumManager && window.forumManager.checkAutoGenerate) {
        console.log('[Forum Auto Listener] Call the checkAutoGenerate of the forum manager...');
        this.updateStatus('Call the forum manager', 'processing');

        // 临时清除所有可能导致冲突的状态
        const originalProcessingState = this.isProcessingRequest;
        this.isProcessingRequest = false;

        // 设置标志告诉论坛管理器这是合法调用
        window.forumAutoListener._allowForumManagerCall = true;

        try {
          await window.forumManager.checkAutoGenerate();
          console.log('[Forum Auto Listener] Forum Manager Call Completed');
          this.generationCount++;
          this.lastGenerationTime = new Date();
          this.updateStatus(`The generation is complete (#${this.generationCount})`, 'success');
        } finally {
          // 恢复状态
          this.isProcessingRequest = originalProcessingState;
          delete window.forumAutoListener._allowForumManagerCall;
        }
      } else {
        // 如果论坛管理器仍然不可用，尝试直接生成
        console.log('[Forum Auto Listener] The forum manager is not available. Try to generate forum content directly....');
        this.updateStatus('Generate forum content directly', 'processing');
        await this.directForumGenerate();
        this.generationCount++;
        this.lastGenerationTime = new Date();
        this.updateStatus(`Directly generate and complete (#${this.generationCount})`, 'success');
      }

      // 更新已处理的消息数量
      // 修复：移除这行代码，因为它会导致监听器只生效一次
      // this.lastProcessedMessageCount = this.lastMessageCount;
      console.log(`[Forum Auto Listener] The generation is complete, and you can continue to listen to new messages.`);

      // 恢复监听状态
      setTimeout(() => {
        if (this.isListening) {
          this.updateStatus('Monitoring', 'success');
        }
      }, 2000);
    } catch (error) {
      console.error('[Forum Auto Listener] Automatic generation check failed:', error);
      this.updateStatus('Failed to generate a check', 'error');
    } finally {
      this.isProcessingRequest = false;
    }
  }

  /**
   * 初始化论坛管理器
   */
  async initializeForumManager() {
    try {
      console.log('[Forum Auto Listener] Try to load the forum manager...');

      // 尝试加载论坛相关脚本
      const forumScripts = [
        '/scripts/extensions/third-party/mobile/app/forum-app/forum-manager.js',
        '/scripts/extensions/third-party/mobile/app/forum-app/forum-app.js',
      ];

      for (const scriptPath of forumScripts) {
        if (!document.querySelector(`script[src*="${scriptPath}"]`)) {
          console.log(`[Forum Auto Listener] Load the script: ${scriptPath}`);
          await this.loadScript(scriptPath);
        }
      }

      // 等待一下让脚本初始化
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 尝试创建论坛管理器实例
      if (window.ForumManager && !window.forumManager) {
        console.log('[Forum Auto Listener] Create a forum manager instance...');
        window.forumManager = new window.ForumManager();
        if (window.forumManager.initialize) {
          await window.forumManager.initialize();
        }
      }

      if (window.forumManager) {
        console.log('[Forum Auto Listener] ✅ Forum Manager Initialisation Successfully');
      } else {
        console.warn('[Forum Auto Listener] ⚠️ Forum Manager Initialisation Failed');
      }
    } catch (error) {
      console.error('[Forum Auto Listener] Failed to initialise the forum manager:', error);
    }
  }

  /**
   * 加载脚本文件
   */
  async loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * 直接生成论坛内容（当论坛管理器不可用时）
   */
  async directForumGenerate() {
    try {
      console.log('[Forum Auto Listener] Generate forum content directly...');

      // 获取当前聊天数据
      const context = window.getContext ? window.getContext() : null;
      if (!context || !context.chat) {
        console.warn('[Forum Auto Listener] Unable to obtain the chat context');
        return;
      }

      // 构建论坛生成提示
      const forumPrompt = this.buildForumPrompt(context.chat);

      // 使用静默生成
      if (window.generateQuietPrompt) {
        console.log('[Forum Auto Listener] Use generateQuietPrompt to generate forum content...');
        const forumContent = await window.generateQuietPrompt(forumPrompt, false, false);

        if (forumContent) {
          console.log('[Forum Auto Listener] ✅ Forum content generated successfully');
          // 可以在这里添加保存或显示论坛内容的逻辑
          this.displayForumContent(forumContent);
        } else {
          console.warn('[Forum Auto Listener] The content of the forum became empty.');
        }
      } else {
        console.warn('[Forum Auto Listener] generateQuietPrompt Not available');
      }
    } catch (error) {
      console.error('[Forum Auto Listener] Failed to generate forum content directly:', error);
    }
  }

  /**
   * 构建论坛生成提示
   */
  buildForumPrompt(chatMessages) {
    const recentMessages = chatMessages.slice(-10); // 取最近10条消息

    let prompt = 'Generate a forum discussion post based on the following chat content. Please include the main points and discussion points.：\n\n';

    recentMessages.forEach((msg, index) => {
      if (!msg.is_system) {
        prompt += `${msg.name || 'Consumer'}: ${msg.mes}\n`;
      }
    });

    prompt += '\nPlease generate the forum discussion content.：';

    return prompt;
  }

  /**
   * 显示论坛内容
   */
  displayForumContent(content) {
    try {
      // 尝试将内容显示在聊天中或通知用户
      console.log('[Forum Auto Listener] The content of the forum has been generated:', content);

      // 可以添加到聊天中作为系统消息
      if (window.sendSystemMessage) {
        window.sendSystemMessage('GENERIC', `🏛️ The content of the forum has been generated：\n\n${content}`);
      } else {
        // 或者显示通知
        if (window.toastr) {
          window.toastr.success('The forum content has been automatically generated.', 'Forum listener');
        }
      }
    } catch (error) {
      console.error('[Forum Auto Listener] Show that the forum content failed:', error);
    }
  }

  /**
   * 检查SillyTavern是否正忙（生成消息中）
   */
  isSillyTavernBusy() {
    try {
      // 检查是否正在发送消息
      if (typeof window.is_send_press !== 'undefined' && window.is_send_press) {
        return true;
      }

      // 检查是否正在生成消息
      if (typeof window.is_generating !== 'undefined' && window.is_generating) {
        return true;
      }

      // 检查流式处理器状态
      if (window.streamingProcessor && !window.streamingProcessor.isFinished) {
        return true;
      }

      // 检查群组生成状态
      if (typeof window.is_group_generating !== 'undefined' && window.is_group_generating) {
        return true;
      }

      return false;
    } catch (error) {
      console.warn('[Forum Auto Listener] Failed to check the status of SillyTavern:', error);
      return false; // 如果检查失败，假设不忙
    }
  }

  /**
   * 直接从SillyTavern获取聊天数据
   */
  getCurrentChatDataDirect() {
    try {
      // 尝试从全局chat变量获取
      if (typeof window.chat !== 'undefined' && Array.isArray(window.chat)) {
        return {
          messages: window.chat,
          characterName: window.name2 || 'Role',
          chatId: window.getCurrentChatId ? window.getCurrentChatId() : 'unknown',
        };
      }

      // 尝试从context获取
      if (window.getContext) {
        const context = window.getContext();
        if (context && context.chat) {
          return {
            messages: context.chat,
            characterName: context.name2 || 'Role',
            chatId: context.chatId || 'unknown',
          };
        }
      }

      console.warn('[Forum Auto Listener] Chat data cannot be obtained directly.');
      return null;
    } catch (error) {
      console.error('[Forum Auto Listener] Failed to get chat data directly:', error);
      return null;
    }
  }

  /**
   * 防抖自动生成 - 保持向后兼容
   */
  debounceAutoGenerate() {
    this.safeDebounceAutoGenerate();
  }

  /**
   * 手动触发论坛生成（无状态冲突）
   */
  async manualTrigger() {
    console.log('[Forum Auto Listener] Manually trigger the forum generation...');
    this.updateStatus('Manually trigger generation', 'processing');

    try {
      // 尝试初始化论坛管理器（如果不存在）
      if (!window.forumManager) {
        console.log('[Forum Auto Listener] The forum manager does not exist. Try to initialise it....');
        this.updateStatus('Initialise the forum manager', 'processing');
        await this.initializeForumManager();
      }

      // 直接调用论坛管理器，清除状态避免冲突
      if (window.forumManager && window.forumManager.checkAutoGenerate) {
        console.log('[Forum Auto Listener] Call the forum manager directly...');
        this.updateStatus('Call the forum manager', 'processing');

        // 设置标志告诉论坛管理器这是合法的手动调用
        window.forumAutoListener._allowForumManagerCall = true;

        try {
          await window.forumManager.checkAutoGenerate();
          console.log('[Forum Auto Listener] ✅ Forum Manager Call Completed');
          this.generationCount++;
          this.lastGenerationTime = new Date();
          this.updateStatus(`Manual generation is completed (#${this.generationCount})`, 'success');
        } finally {
          delete window.forumAutoListener._allowForumManagerCall;
        }
      } else if (window.forumManager && window.forumManager.manualGenerate) {
        console.log('[Forum Auto Listener] Call the manual generation method...');
        this.updateStatus('Call manual generation', 'processing');

        // 设置标志
        window.forumAutoListener._allowForumManagerCall = true;

        try {
          await window.forumManager.manualGenerate();
          console.log('[Forum Auto Listener] ✅ Manual generation is completed');
          this.generationCount++;
          this.lastGenerationTime = new Date();
          this.updateStatus(`Manual generation is completed (#${this.generationCount})`, 'success');
        } finally {
          delete window.forumAutoListener._allowForumManagerCall;
        }
      } else {
        // 如果论坛管理器不可用，尝试直接生成
        console.log('[Forum Auto Listener] The forum manager is not available. Try to generate forum content directly....');
        this.updateStatus('Generate forum content directly', 'processing');
        await this.directForumGenerate();
        this.generationCount++;
        this.lastGenerationTime = new Date();
        this.updateStatus(`Directly generate and complete (#${this.generationCount})`, 'success');
      }

      // 恢复监听状态
      setTimeout(() => {
        if (this.isListening) {
          this.updateStatus('Monitoring', 'success');
        }
      }, 2000);
    } catch (error) {
      console.error('[Forum Auto Listener] Manual trigger failed:', error);
      this.updateStatus('Manual trigger failed', 'error');
    }
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    try {
      // 监听SillyTavern的消息事件（如果可用）
      if (window.eventSource && window.event_types) {
        // 监听消息接收事件
        if (window.event_types.MESSAGE_RECEIVED) {
          this.messageReceivedHandler = this.onMessageReceived.bind(this);
          window.eventSource.on(window.event_types.MESSAGE_RECEIVED, this.messageReceivedHandler);
        }

        // 监听消息发送事件
        if (window.event_types.MESSAGE_SENT) {
          this.messageSentHandler = this.onMessageSent.bind(this);
          window.eventSource.on(window.event_types.MESSAGE_SENT, this.messageSentHandler);
        }

        console.log('[Forum Auto Listener] SillyTavern event listener has been set up');
      } else {
        console.log('[Forum Auto Listener] The SillyTavern event system is not available, and only use a timer to check.');
      }

      // 不再设置DOM观察器，避免重复触发
      // this.setupDOMObserver();
    } catch (error) {
      console.warn('[Forum Auto Listener] Failed to set up the event listener:', error);
    }
  }

  /**
   * 移除事件监听器
   */
  removeEventListeners() {
    try {
      // 移除SillyTavern事件监听器
      if (window.eventSource) {
        if (this.messageReceivedHandler) {
          window.eventSource.off(window.event_types.MESSAGE_RECEIVED, this.messageReceivedHandler);
        }
        if (this.messageSentHandler) {
          window.eventSource.off(window.event_types.MESSAGE_SENT, this.messageSentHandler);
        }
      }

      // 移除DOM观察器
      if (this.domObserver) {
        this.domObserver.disconnect();
        this.domObserver = null;
      }

      console.log('[Forum Auto Listener] The event listener has been removed.');
    } catch (error) {
      console.warn('[Forum Auto Listener] Failed to remove the event listener:', error);
    }
  }

  /**
   * 消息接收事件处理 - 修复：不再直接增加计数
   */
  onMessageReceived(data) {
    console.log('[Forum Auto Listener] Received the news event:', data);
   // No longer directly increase the count, let the timer check and process
   // this.lastMessageCount++;
   // Trigger the check, but do not increase the count immediately
    this.safeDebounceAutoGenerate();
  }

  /**
   * 消息发送事件处理 - 修复：不再直接增加计数
   */
  onMessageSent(data) {
    console.log('[Forum Auto Listener] Send the message event:', data);
    // 不再直接增加计数，让定时器检查处理
    // this.lastMessageCount++;
    // 触发检查，但不立即增加计数
    this.safeDebounceAutoGenerate();
  }

  /**
   * 设置DOM观察器（暂时禁用，避免重复触发）
   */
  setupDOMObserver() {
    // 暂时禁用DOM观察器以避免重复触发
    console.log('[Forum Auto Listener] The DOM observer has been disabled to avoid repeated triggering.');
    return;

    try {
      // 观察聊天容器的变化
      const chatContainer =
        document.querySelector('#chat') ||
        document.querySelector('.chat-container') ||
        document.querySelector('[data-testid="chat"]');

      if (chatContainer) {
        this.domObserver = new MutationObserver(mutations => {
          let hasNewMessage = false;

          mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
              // 检查是否有新的消息节点
              mutation.addedNodes.forEach(node => {
                if (
                  node.nodeType === Node.ELEMENT_NODE &&
                  (node.classList.contains('message') ||
                    node.querySelector('.message') ||
                    node.classList.contains('mes'))
                ) {
                  hasNewMessage = true;
                }
              });
            }
          });

          if (hasNewMessage) {
            console.log('[Forum Auto Listener] DOM detected a new message');
            this.safeDebounceAutoGenerate();
          }
        });

        this.domObserver.observe(chatContainer, {
          childList: true,
          subtree: true,
        });

        console.log('[Forum Auto Listener] DOM observer has been set');
      } else {
        console.warn('[Forum Auto Listener] The chat container was not found, and the DOM observer could not be set.');
      }
    } catch (error) {
      console.warn('[Forum Auto Listener] Failed to set up the DOM observer:', error);
    }
  }

  /**
   * 设置界面观察器 - 监听论坛界面的显示和隐藏
   */
  setupUIObserver() {
    if (!this.settings.autoStartWithUI) {
      console.log('[Forum Auto Listener] The automatic start and stop of the interface has been disabled.');
      return;
    }

    try {
      console.log('[Forum Auto Listener] Set up the interface observer...');

      // 不再初始检查当前状态，只在点击按钮时启动

      // 移除旧的事件监听器
      document.removeEventListener('click', this._clickHandler);

      // 创建新的点击事件处理函数
      this._clickHandler = event => {
        // 检查是否点击了论坛应用按钮
        const forumAppButton = event.target.closest('[data-app="forum"]');
        if (forumAppButton) {
          console.log('[Forum Auto Listener] Detect the click of the forum application button');
          // 给DOM一点时间加载后启动监听
          setTimeout(() => {
            if (!this.isListening) {
              console.log('[Forum Auto Listener] Start monitoring');
              this.start();
            }
          }, 300);
        }

        // 检查是否点击了返回按钮或关闭手机界面
        const backButton = event.target.closest('.back-button');
        const closeButton = event.target.closest(
          '.mobile-phone-overlay, .close-button, .drawer-close, [data-action="close"]',
        );
        if (backButton || closeButton) {
          console.log('[Forum Auto Listener] Detect the click of the return button or the close button');
          // 停止监听
          if (this.isListening) {
            console.log('[Forum Auto Listener] Stop monitoring');
            this.stop();
          }
        }
      };

      // 添加点击事件监听
      document.addEventListener('click', this._clickHandler);

      console.log('[Forum Auto Listener] The interface observer has been set - it will only start when you click the forum button.');

      // 不再使用MutationObserver持续检查状态
      if (this.uiObserver) {
        this.uiObserver.disconnect();
        this.uiObserver = null;
      }
    } catch (error) {
      console.error('[Forum Auto Listener] Failed to set up the interface observer:', error);
    }
  }

  /**
   * 检查论坛应用状态 - 判断是否显示论坛界面
   */
  checkForumAppState() {
    // 不再主动检查状态，改为只响应点击事件
    console.log('[Forum Auto Listener] The status check has been changed to respond only to click events.');
  }

  /**
   * 设置是否随界面自动启停
   * @param {boolean} enabled - 是否启用
   */
  setAutoStartWithUI(enabled) {
    this.settings.autoStartWithUI = enabled;
    console.log(`[Forum Auto Listener] The automatic start-stop settings of the interface have been updated.: ${enabled}`);

    if (enabled) {
      this.setupUIObserver();
      // 立即检查当前状态
      this.checkForumAppState();
    } else if (this.uiObserver) {
      // 如果禁用，断开观察器
      this.uiObserver.disconnect();
      this.uiObserver = null;
    }
  }

  /**
   * 更新设置
   */
  updateSettings(newSettings) {
    const oldAutoStartWithUI = this.settings.autoStartWithUI;

    this.settings = { ...this.settings, ...newSettings };

    // 如果更新了检查间隔，重新启动定时器
    if (newSettings.checkIntervalMs && this.isListening) {
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
      }
      this.checkInterval = setInterval(this.checkForChanges, this.settings.checkIntervalMs);
    }

    // 如果更新了自动启停设置
    if (newSettings.autoStartWithUI !== undefined && newSettings.autoStartWithUI !== oldAutoStartWithUI) {
      this.setAutoStartWithUI(newSettings.autoStartWithUI);
    }
  }

  /**
   * 设置是否立即执行（达到阈值时）
   * @param {boolean} immediate - 是否立即执行
   */
  setImmediateOnThreshold(immediate) {
    this.settings.immediateOnThreshold = immediate;
    console.log(`[Forum Auto Listener] The settings have been updated immediately.: ${immediate}`);
  }

  /**
   * 设置防抖延迟时间
   * @param {number} delayMs - 延迟时间（毫秒）
   */
  setDebounceDelay(delayMs) {
    this.settings.debounceMs = delayMs;
    console.log(`[Forum Auto Listener] The anti-shake delay time has been updated.: ${delayMs}ms`);
  }

  /**
   * 获取状态
   */
  getStatus() {
    return {
      isListening: this.isListening,
      isProcessingRequest: this.isProcessingRequest,
      lastMessageCount: this.lastMessageCount,
      lastProcessedMessageCount: this.lastProcessedMessageCount,
      lastCheckTime: this.lastCheckTime,
      settings: this.settings,
    };
  }

  /**
   * 获取调试信息
   */
  getDebugInfo() {
    return {
      ...this.getStatus(),
      hasCheckInterval: !!this.checkInterval,
      hasDebounceTimer: !!this.debounceTimer,
      hasMessageReceivedHandler: !!this.messageReceivedHandler,
      hasMessageSentHandler: !!this.messageSentHandler,
      hasDOMObserver: !!this.domObserver,
      timeSinceLastCheck: Date.now() - this.lastCheckTime,
    };
  }

  /**
   * 强制检查
   */
  async forceCheck() {
    console.log('[Forum Auto Listener] Compulsory inspection...');
    await this.checkForChanges();
  }

  /**
   * 重置状态
   */
  reset() {
    this.lastMessageCount = 0;
    this.lastProcessedMessageCount = 0;
    this.lastCheckTime = Date.now();
    this.isProcessingRequest = false;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    console.log('[Forum Auto Listener] The status has been reset');
  }

  /**
   * 确保监听器持续运行 - 状态恢复机制
   */
  ensureContinuousListening() {
    // 不再自动启动监听器，只修复可能的状态问题

    // 如果处理状态卡住了，重置它
    if (this.isProcessingRequest) {
      const now = Date.now();
      const timeSinceLastCheck = now - this.lastCheckTime;

      // 如果超过30秒还在处理状态，认为卡住了
      if (timeSinceLastCheck > 30000) {
        console.warn('[Forum Auto Listener] Detect that the processing status is stuck, reset the status...');
        this.isProcessingRequest = false;
        this.lastCheckTime = now;
      }
    }

    // 检查定时器是否还在运行（如果监听器已启动）
    if (this.isListening && !this.checkInterval) {
      console.warn('[Forum Auto Listener] Detect the loss of the timer, reset it...');
      this.checkInterval = setInterval(this.checkForChanges, this.settings.checkIntervalMs);
    }
  }

  /**
   * 检查是否允许论坛管理器调用 - 供论坛管理器使用
   * @returns {boolean} 是否允许调用
   */
  isForumManagerCallAllowed() {
    // 检查是否有合法的调用标志
    if (window.forumAutoListener && window.forumAutoListener._allowForumManagerCall) {
      return true;
    }

    // 如果监听器未在处理中，也允许调用
    return !this.isProcessingRequest;
  }

  /**
   * 为论坛管理器提供的安全调用包装器
   */
  async safeForumManagerCall(callback) {
    if (!callback || typeof callback !== 'function') {
      throw new Error('The callback function is required.');
    }

    // 设置合法调用标志
    window.forumAutoListener._allowForumManagerCall = true;

    // 临时清除处理状态
    const originalState = this.isProcessingRequest;
    this.isProcessingRequest = false;

    try {
      console.log('[Forum Auto Listener] Execute the security forum manager call...');
      const result = await callback();
      console.log('[Forum Auto Listener] Secure call completed');
      return result;
    } finally {
      // 恢复状态
      this.isProcessingRequest = originalState;
      delete window.forumAutoListener._allowForumManagerCall;
    }
  }

  /**
   * 初始化状态显示
   */
  initStatusDisplay() {
    try {
      // 尝试查找现有的状态容器
      let statusContainer = document.getElementById('forum-auto-listener-status');

      if (!statusContainer) {
        // 创建状态显示容器
        statusContainer = document.createElement('div');
        statusContainer.id = 'forum-auto-listener-status';
        statusContainer.className = 'forum-status-container';

        // 创建状态内容
        statusContainer.innerHTML = `
                    <div class="forum-status-header">
                        <span class="forum-status-icon">🤖</span>
                        <span class="forum-status-title">Forum automatic listener</span>
                    </div>
                    <div class="forum-status-content">
                        <div class="forum-status-line">
                            <span class="forum-status-label">State:</span>
                            <span class="forum-status-value" id="forum-listener-status">Initialising</span>
                            <span class="forum-status-indicator" id="forum-listener-indicator"></span>
                        </div>
                        <div class="forum-status-line">
                            <span class="forum-status-label">Number of generations:</span>
                            <span class="forum-status-value" id="forum-listener-count">0</span>
                        </div>
                        <div class="forum-status-line">
                            <span class="forum-status-label">The final generation:</span>
                            <span class="forum-status-value" id="forum-listener-time">Never</span>
                        </div>
                    </div>
                `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
                    .forum-status-container {
                        background: #2d3748;
                        border: 1px solid #4a5568;
                        border-radius: 8px;
                        padding: 12px;
                        margin: 8px;
                        color: #e2e8f0;
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        font-size: 12px;
                        max-width: 300px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);display: none !important;
                    }
                    .forum-status-header {
                        display: flex;
                        align-items: center;
                        margin-bottom: 8px;
                        font-weight: bold;
                        border-bottom: 1px solid #4a5568;
                        padding-bottom: 6px;
                    }
                    .forum-status-icon {
                        margin-right: 6px;
                        font-size: 14px;
                    }
                    .forum-status-title {
                        color: #63b3ed;
                    }
                    .forum-status-line {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin: 4px 0;
                    }
                    .forum-status-label {
                        color: #a0aec0;
                        flex-shrink: 0;
                        margin-right: 8px;
                    }
                    .forum-status-value {
                        flex-grow: 1;
                        text-align: right;
                        margin-right: 6px;
                    }
                    .forum-status-indicator {
                        display: inline-block;
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        flex-shrink: 0;
                    }
                    .status-success { background-color: #48bb78; }
                    .status-error { background-color: #f56565; }
                    .status-warning { background-color: #ed8936; }
                    .status-info { background-color: #4299e1; }
                    .status-processing { background-color: #9f7aea; }
                    .status-waiting { background-color: #ecc94b; }
                    .status-offline { background-color: #718096; }
                `;

        if (!document.head.querySelector('#forum-auto-listener-styles')) {
          style.id = 'forum-auto-listener-styles';
          document.head.appendChild(style);
        }

        // 尝试添加到合适的位置
        const targetContainer =
          document.getElementById('extensions_settings') ||
          document.getElementById('floatingPrompt') ||
          document.getElementById('left-nav-panel') ||
          document.body;

        targetContainer.appendChild(statusContainer);
        console.log('[Forum Auto Listener] The status display has been initialised.');
      }

      this.statusElement = statusContainer;
    } catch (error) {
      console.warn('[Forum Auto Listener] Initialisation status display failed:', error);
    }
  }

  /**
   * 更新状态显示
   * @param {string} status - 状态文本
   * @param {string} type - 状态类型 (success, error, warning, info, processing, waiting, offline)
   */
  updateStatus(status, type = 'info') {
    try {
      this.currentStatus = status;

      // 更新页面显示
      const statusValueElement = document.getElementById('forum-listener-status');
      const statusIndicatorElement = document.getElementById('forum-listener-indicator');
      const countElement = document.getElementById('forum-listener-count');
      const timeElement = document.getElementById('forum-listener-time');

      if (statusValueElement) {
        statusValueElement.textContent = status;
      }

      if (statusIndicatorElement) {
        // 清除所有状态类
        statusIndicatorElement.className = 'forum-status-indicator';
        // 添加新状态类
        statusIndicatorElement.classList.add(`status-${type}`);
      }

      if (countElement) {
        countElement.textContent = this.generationCount.toString();
      }

      if (timeElement && this.lastGenerationTime) {
        timeElement.textContent = this.lastGenerationTime.toLocaleTimeString();
      }

      // 控制台日志
      const statusIcon = this.getStatusIcon(type);
      console.log(`[Forum Auto Listener] ${statusIcon} ${status}`);
    } catch (error) {
      console.warn('[Forum Auto Listener] 更新状态显示失败:', error);
    }
  }

  /**
   * 获取状态图标
   * @param {string} type - 状态类型
   * @returns {string} 状态图标
   */
  getStatusIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      processing: '⏳',
      waiting: '⏸️',
      offline: '⭕',
    };
    return icons[type] || 'ℹ️';
  }

  /**
   * 获取详细状态信息
   */
  getDetailedStatus() {
    return {
      ...this.getStatus(),
      currentStatus: this.currentStatus,
      generationCount: this.generationCount,
      lastGenerationTime: this.lastGenerationTime,
      hasStatusDisplay: !!this.statusElement,
    };
  }
}

// 创建全局实例
window.ForumAutoListener = ForumAutoListener;
window.forumAutoListener = new ForumAutoListener();

// 添加快捷查看状态的全局方法
window.showForumAutoListenerStatus = () => {
  const status = window.forumAutoListener.getDetailedStatus();
  console.table(status);
  return status;
};

// 导出类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ForumAutoListener;
}

// 设置界面观察器
setTimeout(() => {
  try {
    console.log('[Forum Auto Listener] Set up the interface observer...');
    if (window.forumAutoListener) {
      // 确保不会自动启动定时器
      if (window.forumAutoListener.checkInterval) {
        clearInterval(window.forumAutoListener.checkInterval);
        window.forumAutoListener.checkInterval = null;
        console.log('[Forum Auto Listener] Possible timers have been cleared.');
      }

      window.forumAutoListener.setupUIObserver();

      // 自动启动监听器
      console.log('[Forum Auto Listener] Automatically start the monitor...');
      if (!window.forumAutoListener.isListening) {
        window.forumAutoListener.start();
        console.log('[Forum Auto Listener] ✅ Automatic start-up successfully');
      }
    }
  } catch (error) {
    console.error('[Forum Auto Listener] Failed to set up the interface observer:', error);
  }
}, 2000); // 等待2秒让DOM加载完成

// 移除健康检查定时器，因为它可能会导致监听器自动重启
// 不再需要自动恢复监听功能，因为我们只想在用户明确点击时启动

console.log('[Forum Auto Listener] The forum automatic listener module has been loaded.');
console.log('[Forum Auto Listener] 🔧 Key improvements:');
console.log('[Forum Auto Listener]   ✅ Automatic start: automatically start monitoring after the page is loaded');
console.log('[Forum Auto Listener]   ✅ Automatic stop: automatically stop when you click the return or close button');
console.log('[Forum Auto Listener]   ✅ Queueing mechanism: wait for SillyTavern to be generated when it is idle');
console.log('[Forum Auto Listener]   ✅ Execute immediately: no delay trigger when the threshold is reached');
console.log('[Forum Auto Listener]   ✅ Status conflict resolution: avoid the problem of "Auto-listener is processing"');
console.log('[Forum Auto Listener]   ✅ Status display: real-time display of the running status of the listener');
console.log('[Forum Auto Listener] 💡 Test command: window.forumAutoListener.manualTrigger()');
console.log('[Forum Auto Listener] 📊 Check the status: window.showForumAutoListenerStatus()');
console.log('[Forum Auto Listener] 🔧 Check the status: window.forumAutoListener.isForumManagerCallAllowed()');
console.log('[Forum Auto Listener] 📊 Status panel：The "Forum Automatic Monitor" status card will be displayed in the interface.');
console.log('[Forum Auto Listener] 🚀 The monitor will start automatically.，The content of the forum will be generated automatically! The status can be viewed in real time in the interface!');
