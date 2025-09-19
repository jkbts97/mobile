// ==SillyTavern Forum Manager==
// @name         Forum Manager for Mobile Extension
// @version      1.0.0
// @description  论坛自动更新管理器
// @author       Assistant

/**
 * 论坛管理器类
 * 负责管理论坛帖子生成、API调用和与上下文编辑器的集成
 */
class ForumManager {
  constructor() {
    this.isInitialized = false;
    this.currentSettings = {
      enabled: true,
      selectedStyle: 'Post it, brother.',
      autoUpdate: true,
      threshold: 10,
      apiConfig: {
        url: '',
        apiKey: '',
        model: '',
      },
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
    this.generateForumContent = this.generateForumContent.bind(this);
    this.updateContextWithForum = this.updateContextWithForum.bind(this);
    this.checkGenerationStatus = this.checkGenerationStatus.bind(this);
    this.waitForGenerationComplete = this.waitForGenerationComplete.bind(this);
    this.processInsertionQueue = this.processInsertionQueue.bind(this);
  }

  /**
   * 初始化论坛管理器
   */
  async initialize() {
    try {
      console.log('[Forum Manager] Initialisation start...');

      // 加载设置
      this.loadSettings();

      // 等待其他模块初始化完成
      await this.waitForDependencies();

      // 创建UI
      this.createForumUI();

      // 注册控制台命令
      this.registerConsoleCommands();

      this.isInitialized = true;
      console.log('[Forum Manager] ✅ Initialisation completed');

      // 浏览器兼容性检测和提示
      this.detectBrowserAndShowTips();
    } catch (error) {
      console.error('[Forum Manager] Initialisation failed:', error);
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
      console.log('%c🍎 Safari/ViaCompatibility Tips', 'color: #ff6b6b; font-weight: bold; font-size: 14px;');
      console.log(
        '%cIf you encounter the problem that the button is not responding, please run: MobileContext.fixBrowserCompatibility()',
        'color: #4ecdc4; font-size: 12px;',
      );
      console.log('%cMore diagnostic information: MobileContext.quickDiagnosis()', 'color: #45b7d1; font-size: 12px;');
    }
  }

  /**
   * 等待依赖模块加载完成
   */
  async waitForDependencies() {
    return new Promise(resolve => {
      const checkDeps = () => {
        const contextEditorReady = window.mobileContextEditor !== undefined;
        const customAPIReady = window.mobileCustomAPIConfig !== undefined;

        if (contextEditorReady && customAPIReady) {
          console.log('[Forum Manager] Dependency modules are ready.');
          resolve();
        } else {
          console.log('[Forum Manager] Waiting for the dependent module...', {
            contextEditor: contextEditorReady,
            customAPI: customAPIReady,
          });
          setTimeout(checkDeps, 500);
        }
      };
      checkDeps();
    });
  }

  /**
   * 创建论坛UI按钮 - 已移除浮动按钮，现在通过手机框架集成
   */
  createForumUI() {
    console.log('[Forum Manager] ✅ The forum UI has been integrated into the mobile phone framework.');
  }

  /**
   * 显示论坛控制面板
   */
  showForumPanel() {
    // 如果面板已存在，直接显示
    if (document.getElementById('forum-panel-overlay')) {
      document.getElementById('forum-panel-overlay').style.display = 'flex';
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'forum-panel-overlay';
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
    panel.id = 'forum-control-panel';
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
                <h2 style="margin: 0; color: #667eea;">📰 Forum Manager</h2>
                <button id="close-forum-panel" style="background: none; border: none; color: #ccc; font-size: 24px; cursor: pointer;">×</button>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 10px; color: #333;">Choose the forum style:</label>
                <select id="forum-style-select" style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #444; background: #eee; color: #333;">
                    <!-- Style options will be dynamically loaded by JavaScript.-->
                </select>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 10px; color: #333;">Custom prefix (additional prompts sent to the model):</label>
                <textarea id="forum-custom-prefix" placeholder="Enter the custom prefix here, which will be added before the style prompt...."
                          style="width: 100%; height: 80px; padding: 10px; border-radius: 5px; border: 1px solid #444; background: #eee; color: #333; resize: vertical; font-family: monospace; font-size: 16px;"></textarea>
                <div style="margin-top: 5px; font-size: 16px; color: #333;">
                    Tip: It can be used to add special instructions, role settings or generation requirements.
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 10px; color: #333;">Message threshold (trigger forum generation):</label>
                <input type="number" id="forum-threshold" value="${this.currentSettings.threshold}" min="1" max="100"
                       style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #444; background: #eee; color: #333;">
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: flex; align-items: center; color: #333; cursor: pointer;">
                    <input type="checkbox" id="forum-auto-update" ${this.currentSettings.autoUpdate ? 'checked' : ''}
                           style="margin-right: 10px;background: #fff;color: #333;">
                    自动生成论坛内容
                </label>
            </div>

            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button id="generate-forum-now" style="flex: 1; padding: 12px; background: #667eea; color: #fff; border: none; border-radius: 5px; cursor: pointer; min-width: 120px;">
                    立即生成论坛
                </button>
                <button id="clear-forum-content" style="flex: 1; padding: 12px; background: #e74c3c; color: #fff; border: none; border-radius: 5px; cursor: pointer; min-width: 120px;">
                    清除论坛内容
                </button>
                <button id="forum-settings" style="flex: 1; padding: 12px; background: #95a5a6; color: #fff; border: none; border-radius: 5px; cursor: pointer; min-width: 120px;">
                    API设置
                </button>
            </div>

            <div id="forum-status" style="margin-top: 20px; padding: 10px; background: #2c3e50; border-radius: 5px; font-size: 12px; color: #fff;">
                状态: 就绪
            </div>

            <div id="forum-queue-status" style="margin-top: 10px; padding: 8px; background: #34495e; border-radius: 5px; font-size: 11px; color: #ecf0f1;">
                <div style="font-weight: bold; margin-bottom: 5px;">🔄 Generate status monitoring</div>
                <div>SillyTavern generation status: <span id="generation-status">Checking...</span></div>
                <div>Queue to be inserted: <span id="queue-count">0</span> Item</div>
                <div style="margin-top: 5px;">
                    <button id="clear-queue-btn" style="background: #e67e22; color: #fff; border: none; padding: 3px 8px; border-radius: 3px; font-size: 10px; cursor: pointer;">ClearEmptyQueue</button>
                    <button id="refresh-status-btn" style="background: #3498db; color: #fff; border: none; padding: 3px 8px; border-radius: 3px; font-size: 10px; cursor: pointer; margin-left: 5px;">ChangeAppearance</button>
                </div>
            </div>
        `;

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // 初始化风格选择器
    this.initializePanelStyleSelector();

    // 设置前缀值
    if (window.forumStyles) {
      document.getElementById('forum-custom-prefix').value = window.forumStyles.getCustomPrefix();
    }

    // 绑定事件
    this.bindPanelEvents();
  }

  /**
   * 初始化面板风格选择器
   */
  initializePanelStyleSelector() {
    const styleSelect = document.getElementById('forum-style-select');
    if (!styleSelect) return;

    try {
      // 清空现有选项
      styleSelect.innerHTML = '';

      // 添加预设风格
      if (window.forumStyles && window.forumStyles.styles) {
        const presetStyles = Object.keys(window.forumStyles.styles);
        if (presetStyles.length > 0) {
          const presetGroup = document.createElement('optgroup');
          presetGroup.label = 'Preset style';

          presetStyles.forEach(styleName => {
            const option = document.createElement('option');
            option.value = styleName;
            option.textContent = styleName;
            presetGroup.appendChild(option);
          });

          styleSelect.appendChild(presetGroup);
        }
      }

      // 添加自定义风格
      if (window.forumStyles && window.forumStyles.getAllCustomStyles) {
        const customStyles = window.forumStyles.getAllCustomStyles();
        if (customStyles.length > 0) {
          const customGroup = document.createElement('optgroup');
          customGroup.label = 'Custom style';

          customStyles.forEach(style => {
            const option = document.createElement('option');
            option.value = style.name;
            option.textContent = `${style.name} (Customise)`;
            customGroup.appendChild(option);
          });

          styleSelect.appendChild(customGroup);
        }
      }

      // 设置当前选中的风格
      if (this.currentSettings.selectedStyle) {
        styleSelect.value = this.currentSettings.selectedStyle;
      }

      // 如果没有找到当前风格，默认选择第一个
      if (!styleSelect.value && styleSelect.options.length > 0) {
        styleSelect.selectedIndex = 0;
        this.currentSettings.selectedStyle = styleSelect.value;
        this.saveSettings();
      }

      console.log('[ForumManager] The panel style selector has been initialised, total', styleSelect.options.length, 'Not an option');
    } catch (error) {
      console.error('[ForumManager] Failed to initialise the panel style selector:', error);

      // 降级处理：添加默认风格
      styleSelect.innerHTML = '<option value="Post it, brother.">Post it, brother.</option>';
      styleSelect.value = 'Post it, brother.';
      this.currentSettings.selectedStyle = 'Post it, brother.';
    }
  }

  /**
   * 绑定面板事件
   */
  bindPanelEvents() {
    const overlay = document.getElementById('forum-panel-overlay');

    // 关闭面板
    document.getElementById('close-forum-panel').addEventListener('click', () => {
      overlay.style.display = 'none';
      this.stopStatusUpdateTimer();
    });

    // 点击遮罩层关闭
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        overlay.style.display = 'none';
        this.stopStatusUpdateTimer();
      }
    });

    // 风格选择
    document.getElementById('forum-style-select').addEventListener('change', e => {
      this.currentSettings.selectedStyle = e.target.value;
      this.saveSettings();
    });

    // 自定义前缀设置
    document.getElementById('forum-custom-prefix').addEventListener('input', e => {
      if (window.forumStyles) {
        window.forumStyles.setCustomPrefix(e.target.value);
      }
    });

    // 前缀输入框失焦时保存
    document.getElementById('forum-custom-prefix').addEventListener('blur', e => {
      if (window.forumStyles) {
        window.forumStyles.setCustomPrefix(e.target.value);
        console.log('[Forum Manager] The prefix has been updated');
      }
    });

    // 阈值设置
    document.getElementById('forum-threshold').addEventListener('change', e => {
      this.currentSettings.threshold = parseInt(e.target.value);
      this.saveSettings();
    });

    // 自动更新开关
    document.getElementById('forum-auto-update').addEventListener('change', e => {
      this.currentSettings.autoUpdate = e.target.checked;
      this.saveSettings();
    });

    // 立即生成论坛
    document.getElementById('generate-forum-now').addEventListener('click', () => {
      console.log('[Forum Manager] 🔘 The instant generation button is clicked (from forum-manager.js)');
      this.generateForumContent(true); // 强制生成，不检查消息增量
    });

    // 清除论坛内容
    document.getElementById('clear-forum-content').addEventListener('click', () => {
      this.clearForumContent();
    });

    // API设置
    document.getElementById('forum-settings').addEventListener('click', () => {
      if (window.mobileCustomAPIConfig) {
        window.mobileCustomAPIConfig.showConfigPanel();
      } else {
        this.updateStatus('The API configuration module is not ready', 'error');
      }
    });

    // 新增：队列管理按钮
    document.getElementById('clear-queue-btn').addEventListener('click', () => {
      this.clearQueue();
      this.updateQueueStatusDisplay();
    });

    document.getElementById('refresh-status-btn').addEventListener('click', () => {
      this.updateQueueStatusDisplay();
    });

    // 启动状态更新定时器
    this.startStatusUpdateTimer();
  }

  /**
   * 生成论坛内容
   */
  async generateForumContent(force = false) {
    // 记录调用源
    const caller = force ? 'Manual forced generation' : 'Automatically check and generate';
    console.log(`[Forum Manager] 📞 Call source: ${caller}`);

    // 如果是强制模式，立即阻止auto-listener
    if (force && window.forumAutoListener) {
      if (window.forumAutoListener.isProcessingRequest) {
        console.log('[Forum Manager] ⚠️ Auto-listener is being processed, but forced generation is prioritised.');
      }
      window.forumAutoListener.isProcessingRequest = true;
      console.log('[Forum Manager] 🚫 Auto-listener interference has been blocked.');
    }

    // 严格的重复请求防护 - 增强Safari兼容性
    if (this.isProcessing) {
      console.log('[Forum Manager] Detect that it is being processed. Check whether it is a Safari compatibility problem....');

      // Safari兼容性处理：如果是强制模式，给予一次机会重置状态
      if (force) {
        console.log('[Forum Manager] 🍎 Safari compatibility mode: forced reset status');
        this.isProcessing = false;
        if (window.forumAutoListener) {
          window.forumAutoListener.isProcessingRequest = false;
        }
        // 继续执行，不返回false
      } else {
        console.log('[Forum Manager] In process, skip the duplicate request');
        this.updateStatus('Processing, please wait a moment....', 'warning');

        // 如果是强制模式，恢复auto-listener状态
        if (force && window.forumAutoListener) {
          window.forumAutoListener.isProcessingRequest = false;
        }
        return false;
      }
    }

    // 如果是强制模式，临时暂停auto-listener
    let autoListenerPaused = false;
    if (force && window.forumAutoListener && window.forumAutoListener.isListening) {
      autoListenerPaused = true;
      // 设置处理请求锁，阻止auto-listener触发
      window.forumAutoListener.isProcessingRequest = true;
      console.log('[Forum Manager] 🔄 Temporarily suspend auto-listener (set processing lock)');
    }

    // 检查是否有足够的消息变化
    try {
      const chatData = await this.getCurrentChatData();
      if (!chatData || !chatData.messages || chatData.messages.length === 0) {
        console.log('[Forum Manager] No chat data, skip the generation');
        return false;
      }

      // 只有在非强制模式下才检查消息增量
      if (!force) {
        // 检查是否有足够的新消息
        const currentCount = chatData.messages.length;
        const increment = currentCount - this.lastProcessedCount;

        if (increment < this.currentSettings.threshold) {
          console.log(
            `[Forum Manager][Automatic Check] Insufficient message increment (${increment}/${this.currentSettings.threshold})，Skip generation`,
          );
          return false;
        }
      } else {
        console.log('[Forum Manager] 🚀 Forced generation mode, skip message incremental check');
      }

      // 开始处理
      this.isProcessing = true;
      this.updateStatus('Forum content is being generated...', 'info');

      const currentCount = chatData.messages.length;
      const increment = currentCount - this.lastProcessedCount;
      console.log(`[Forum Manager] Start to generate forum content (number of messages: ${currentCount}, Increment: ${increment}, Forced mode: ${force})`);

      // 2. 调用API生成论坛内容
      const forumContent = await this.callForumAPI(chatData);
      if (!forumContent) {
        throw new Error('API returns empty content');
      }

      // 3. 通过上下文编辑器安全更新到第1楼层（带生成状态检查）
      const success = await this.safeUpdateContextWithForum(forumContent);
      if (success) {
        this.updateStatus('The forum content has been added to the first floor.', 'success');
        this.lastProcessedCount = currentCount;

        // 同步到auto-listener
        if (window.forumAutoListener) {
          window.forumAutoListener.lastProcessedMessageCount = currentCount;
        }

        // 刷新论坛UI界面以显示新内容
        this.clearForumUICache();

        console.log(`[Forum Manager] ✅ Forum content generated successfully`);
        return true;
      } else {
        throw new Error('Failed to update the context');
      }
    } catch (error) {
      console.error('[Forum Manager] Failed to generate forum content:', error);
      this.updateStatus(`Failed to generate: ${error.message}`, 'error');

      // 显示错误提示
      if (window.showMobileToast) {
        window.showMobileToast(`❌ Forum generation failed: ${error.message}`, 'error');
      }

      return false;
    } finally {
      // 确保状态被重置
      this.isProcessing = false;

      // 恢复auto-listener
      if (autoListenerPaused && force) {
        setTimeout(() => {
          if (window.forumAutoListener) {
            window.forumAutoListener.isProcessingRequest = false;
            console.log('[Forum Manager] 🔄 Resumeauto-listener（Release the processing lock）');
          }
        }, 2000); // 2秒后恢复，确保手动操作完成
      }

      // 强制重置状态，防止卡住
      setTimeout(() => {
        if (this.isProcessing) {
          console.warn('[Forum Manager] Forced reset processing status');
          this.isProcessing = false;
        }
      }, 5000);

      // 通知auto-listener处理完成
      if (window.forumAutoListener) {
        window.forumAutoListener.isProcessingRequest = false;
      }
    }
  }

  /**
   * 获取当前聊天数据
   */
  async getCurrentChatData() {
    try {
      if (window.mobileContextEditor) {
        return window.mobileContextEditor.getCurrentChatData();
      } else if (window.MobileContext) {
        return await window.MobileContext.loadChatToEditor();
      } else {
        throw new Error('Context editor is not ready');
      }
    } catch (error) {
      console.error('[Forum Manager] Failed to obtain chat data:', error);
      throw error;
    }
  }

  /**
   * 调用论坛API
   */
  async callForumAPI(chatData) {
    try {
      console.log('🚀 [Forum API] ===== Start generating forum content =====');

      // 检查API配置
      if (!window.mobileCustomAPIConfig || !window.mobileCustomAPIConfig.isAPIAvailable()) {
        throw new Error('Please configure the API first.');
      }

      // 构建上下文信息
      const contextInfo = this.buildContextInfo(chatData);

      // 获取风格提示词（立即生成论坛）
      const stylePrompt = window.forumStyles
        ? window.forumStyles.getStylePrompt(this.currentSettings.selectedStyle, 'generate')
        : '';

      console.log('📋[Forum API] System prompts (generate a forum immediately):');
      console.log(stylePrompt);
      console.log('\n📝 [Forum API] User Message Content:');
      console.log(`Please generate the forum content according to the following chat records.：\n\n${contextInfo}`);

      // 构建API请求
      const messages = [
        {
          role: 'system',
          content: `${stylePrompt}\n\n🎯 【Pay special attention】：\n- Focus on the content of users' posts and replies, which are marked with ⭐ and special instructions\n- Continue the user's language style, topic preferences and interaction habits\n- Let the forum content reflect the user's participation characteristics and behaviour patterns\n- If the user has specific views or interests, please echo appropriately in the forum.`,
        },
        {
          role: 'user',
          content: `🎯 Please generate forum content according to the following chat records, and pay special attention to the user's posting and reply mode.：\n\n${contextInfo}`,
        },
      ];

      console.log('📡 [Forum API] Complete API Request:');
      console.log(JSON.stringify(messages, null, 2));

      // 调用API
      const response = await window.mobileCustomAPIConfig.callAPI(messages, {
        temperature: 0.8,
        max_tokens: 2000,
      });

      console.log('📥 [Forum API] Model Return Content:');
      console.log(response);

      if (response && response.content) {
        console.log('✅ [Forum API] Generated forum content:');
        console.log(response.content);
        console.log('🏁 [Forum API] ===== Forum content generation completed =====\n');
        return response.content;
      } else {
        throw new Error('API returns format error');
      }
    } catch (error) {
      console.error('❌ [Forum API] API call failed:', error);
      console.log('🏁 [Forum API] ===== Forum content generation failed =====\n');
      throw error;
    }
  }

  /**
   * 构建上下文信息（只发送倒数5层楼和第1层楼）
   */
  buildContextInfo(chatData) {
    let contextInfo = `Role: ${chatData.characterName || 'Unknown'}\n`;
    contextInfo += `Number of messages: ${chatData.messages.length}\n\n`;

    const messages = chatData.messages;
    const selectedMessages = [];

    // 1. 如果有第1层楼（索引0），且包含内容，添加到选择列表
    if (messages.length > 0 && messages[0].mes && messages[0].mes.trim()) {
      let firstFloorContent = messages[0].mes;

      // 检查是否包含论坛内容
      const forumRegex = /<!-- FORUM_CONTENT_START -->([\s\S]*?)<!-- FORUM_CONTENT_END -->/;
      const forumMatch = firstFloorContent.match(forumRegex);
      const hasForumContent = !!forumMatch;

      // 如果包含论坛内容，只提取论坛标记内的内容
      if (hasForumContent) {
        firstFloorContent = forumMatch[1].trim(); // 只保留标记内的内容
        console.log('📋 [Context construction] The first floor: extract the forum mark content');
        console.log('Extracted content:', firstFloorContent);
      } else {
        console.log('📋 [Context Construction] Floor 1: No forum tags, keep the full content');
      }

      selectedMessages.push({
        ...messages[0],
        mes: firstFloorContent,
        floor: 1,
        isFirstFloor: true,
        hasForumContent: hasForumContent,
      });
    }

    // 2. 取倒数3条消息（排除第1层楼，避免重复）
    const lastFiveMessages = messages.slice(-3);
    lastFiveMessages.forEach((msg, index) => {
      // 跳过第1层楼（已在上面处理）
      if (messages.indexOf(msg) !== 0) {
        selectedMessages.push({
          ...msg,
          floor: messages.indexOf(msg) + 1,
          isRecentMessage: true,
        });
      }
    });

    // 3. 去重并按楼层排序
    const uniqueMessages = [];
    const addedIndices = new Set();

    selectedMessages.forEach(msg => {
      const originalIndex = messages.findIndex(m => m === msg || (m.mes === msg.mes && m.is_user === msg.is_user));
      if (!addedIndices.has(originalIndex)) {
        addedIndices.add(originalIndex);
        uniqueMessages.push({
          ...msg,
          originalIndex,
        });
      }
    });

    // 按原始索引排序
    uniqueMessages.sort((a, b) => a.originalIndex - b.originalIndex);

    // 4. 分析用户参与模式
    const userMessages = uniqueMessages.filter(msg => msg.is_user);
    const userForumPosts = [];
    const userReplies = [];

    userMessages.forEach(msg => {
      if (msg.isFirstFloor && msg.hasForumContent) {
        userForumPosts.push(msg);
      } else if (msg.mes && msg.mes.trim()) {
        userReplies.push(msg);
      }
    });

    // 5. 构建增强注意力的内容
    contextInfo += 'Selected dialogue content:\n';

    // 特别标记用户的论坛参与行为
    if (userForumPosts.length > 0 || userReplies.length > 0) {
      contextInfo += '\n⭐ 【Focus on: User Forum Participation Mode】\n';

      if (userForumPosts.length > 0) {
        contextInfo += '👤 Content posted by users：\n';
        userForumPosts.forEach(msg => {
          contextInfo += `  📝 [Users post] ${msg.mes}\n`;
        });
        contextInfo += '\n';
      }

      if (userReplies.length > 0) {
        contextInfo += '💬 Content of the user's reply：\n';
        userReplies.forEach(msg => {
          contextInfo += `  💭 [User Reply] ${msg.mes}\n`;
        });
        contextInfo += '\n';
      }

      contextInfo += '⚠️ When generating forum content, please pay special attention to the continuation and echo of users' posting style, topic preferences and interaction patterns.！\n\n';
    }

    contextInfo += 'Complete transcript of the conversation:\n';
    uniqueMessages.forEach(msg => {
      const speaker = msg.is_user ? '👤Consumer' : `🤖${chatData.characterName || 'Role'}`;
      let floorInfo = '';
      let attentionMark = '';

      if (msg.isFirstFloor) {
        floorInfo = msg.hasForumContent ? '[The first floor - including the forum]' : '[The first floor]';
      } else if (msg.isRecentMessage) {
        floorInfo = '[Recent news]';
      }

      // 为用户消息添加特殊注意力标记
      if (msg.is_user) {
        attentionMark = '⭐ ';
      }

      contextInfo += `${attentionMark}${speaker}${floorInfo}: ${msg.mes}\n`;
    });

    console.log('📋[Context Construction] ===== Context Information Construction Completed=====');
    console.log(`[Context construction] Total number of messages: ${chatData.messages.length}`);
    console.log(`[Context Construction] Select the number of messages: ${uniqueMessages.length}`);
    console.log(`[Context Construction] Including the 1st floor: ${uniqueMessages.some(m => m.isFirstFloor)}`);
    console.log(`[Context Construction] The first floor contains forum content: ${uniqueMessages.some(m => m.isFirstFloor && m.hasForumContent)}`);
    console.log(`[Context Construction] Number of recent messages: ${uniqueMessages.filter(m => m.isRecentMessage).length}`);
    console.log('📝 [Context Construction] Constructed complete context information:');
    console.log(contextInfo);
    console.log('🏁 [Context construction] ===== Context information construction completed =====\n');

    return contextInfo;
  }

  /**
   * 通过上下文编辑器更新到第1楼层
   */
  async updateContextWithForum(forumContent) {
    try {
      console.log('[Forum Manager] Start adding forum content on the first floor...');

      // 确保上下文编辑器可用
      if (!window.mobileContextEditor) {
        throw new Error('Context editor is not ready');
      }

      // 获取当前聊天数据
      const chatData = window.mobileContextEditor.getCurrentChatData();
      if (!chatData || !chatData.messages || chatData.messages.length === 0) {
        throw new Error('No chat data can be updated');
      }

      // 构建论坛内容格式（使用特殊标记包装）
      const forumSection = `\n\n<!-- FORUM_CONTENT_START -->\n【Hot discussion in the forum】\n\n${forumContent}\n\n---\n[Automatically generated by the forum manager]\n<!-- FORUM_CONTENT_END -->`;

      // 检查第1楼层是否存在
      if (chatData.messages.length >= 1) {
        const firstMessage = chatData.messages[0];
        let originalContent = firstMessage.mes || '';

        // 检查是否已经包含论坛内容
        const existingForumRegex = /<!-- FORUM_CONTENT_START -->[\s\S]*?<!-- FORUM_CONTENT_END -->/;
        if (existingForumRegex.test(originalContent)) {
          // 如果已存在论坛内容，智能合并新旧内容
          console.log('[Forum Manager] It is detected that the forum content already exists, and start intelligent merging....');

          // 提取现有论坛内容
          const existingForumMatch = originalContent.match(existingForumRegex);
          const existingForumContent = existingForumMatch ? existingForumMatch[0] : '';

          // 智能合并论坛内容
          const mergedForumContent = await this.mergeForumContent(existingForumContent, forumContent);

          // 移除旧的论坛内容，保留其他内容
          originalContent = originalContent.replace(existingForumRegex, '').trim();

          // 使用合并后的内容
          const mergedForumSection = `\n\n<!-- FORUM_CONTENT_START -->\n【论坛热议】\n\n${mergedForumContent}\n\n---\n[Automatically generated by the forum manager]\n<!-- FORUM_CONTENT_END -->`;

          // 在原有内容后追加合并后的论坛内容
          const newContent = originalContent + mergedForumSection;

          // 更新第1楼层
          const success = await window.mobileContextEditor.modifyMessage(0, newContent);
          if (success) {
            console.log('[Forum Manager] ✅ Successful integration of forum content intelligently');
            return true;
          } else {
            throw new Error('modifyMessage returns false');
          }
        }

        // 在原有内容后追加新的论坛内容
        const newContent = originalContent + forumSection;

        // 更新第1楼层
        const success = await window.mobileContextEditor.modifyMessage(0, newContent);
        if (success) {
          console.log('[Forum Manager] ✅ The additional forum content on the first floor was successful.');
          return true;
        } else {
          throw new Error('modifyMessage returns false');
        }
      } else {
        // 如果没有消息，创建新消息（只包含论坛内容）
        const messageIndex = await window.mobileContextEditor.addMessage(forumSection.trim(), false, 'Forum system');
        if (messageIndex >= 0) {
          console.log('[Forum Manager] ✅ The first floor (including forum content) has been added successfully');
          return true;
        } else {
          throw new Error('addMessage returns a negative number');
        }
      }
    } catch (error) {
      console.error('[Forum Manager] Failed to update the first floor:', error);
      return false;
    }
  }

  /**
   * 智能合并论坛内容
   * @param {string} existingForumContent - 现有的论坛内容（包含标记）
   * @param {string} newForumContent - 新生成的论坛内容
   * @returns {string} 合并后的论坛内容
   */
  async mergeForumContent(existingForumContent, newForumContent) {
    try {
      console.log('[Forum Manager] 🔄 Start to integrate forum content intelligently...');

      // 提取现有论坛内容（去除标记）
      const existingContentMatch = existingForumContent.match(
        /<!-- FORUM_CONTENT_START -->\s*【Hot discussion in the forum】\s*([\s\S]*?)\s*---\s*\[Automatically generated by the forum manager\]\s*<!-- FORUM_CONTENT_END -->/,
      );
      const existingContent = existingContentMatch ? existingContentMatch[1].trim() : '';

      console.log('[Forum Manager] 📋 Existing forum content:');
      console.log(existingContent);
      console.log('[Forum Manager] 📋 Newly generated forum content:');
      console.log(newForumContent);

      // 解析现有内容
      const existingData = this.parseForumContent(existingContent);
      console.log('[Forum Manager] 📊 Analyse the existing content:', existingData);

      // 解析新内容
      const newData = this.parseForumContent(newForumContent);
      console.log('[Forum Manager] 📊 Analyse the new content:', newData);

      // 合并逻辑
      const mergedThreads = new Map();
      const mergedReplies = new Map();

      // 1. 先添加所有现有帖子
      existingData.threads.forEach(thread => {
        mergedThreads.set(thread.id, thread);
        mergedReplies.set(thread.id, existingData.replies[thread.id] || []);
      });

      // 2. 处理新内容
      const currentTime = new Date();
      newData.threads.forEach(newThread => {
        if (mergedThreads.has(newThread.id)) {
          // 如果是现有帖子，不覆盖，只合并回复
          console.log(`[Forum Manager] 📝 Discover the existing posts ${newThread.id} The content, combined reply...`);
        } else {
          // 如果是新帖子，直接添加并设置当前时间戳
          console.log(`[Forum Manager] ✨ Add a new post: ${newThread.id}`);
          newThread.timestamp = currentTime.toLocaleString();
          newThread.latestActivityTime = currentTime; // 设置为Date对象，用于排序
          mergedThreads.set(newThread.id, newThread);
          mergedReplies.set(newThread.id, []);
        }
      });

      // 3. 合并回复
      newData.threads.forEach(newThread => {
        const newThreadReplies = newData.replies[newThread.id] || [];
        const existingReplies = mergedReplies.get(newThread.id) || [];

        // 合并回复，避免重复
        const allReplies = [...existingReplies];
        newThreadReplies.forEach(newReply => {
          // 简单的重复检测：相同作者和相似内容
          const isDuplicate = allReplies.some(
            existingReply =>
              existingReply.author === newReply.author &&
              existingReply.content.includes(newReply.content.substring(0, 20)),
          );

          if (!isDuplicate) {
            // 为新回复设置当前时间戳，确保它们排在前面
            newReply.timestamp = currentTime.toLocaleString();
            newReply.sortTimestamp = currentTime.getTime(); // 用于排序的数值时间戳

            allReplies.push(newReply);
            console.log(`[Forum Manager] 💬 Add a new reply to the post ${newThread.id}: ${newReply.author}`);

            // 如果是对现有帖子的新回复，更新帖子的最新活动时间
            if (mergedThreads.has(newThread.id)) {
              const existingThread = mergedThreads.get(newThread.id);
              existingThread.latestActivityTime = currentTime;
              existingThread.timestamp = currentTime.toLocaleString(); // 也更新显示时间戳
              console.log(`[Forum Manager] 📝 Update the post ${newThread.id} The latest activity time of`);
            }
          }
        });

        mergedReplies.set(newThread.id, allReplies);
      });

      // 4. 重新构建论坛内容
      const mergedContent = this.buildForumContent(mergedThreads, mergedReplies);

      console.log('[Forum Manager] ✅ The content of the forum has been merged.');
      console.log('[Forum Manager] 📋 Consolidated content:');
      console.log(mergedContent);

      return mergedContent;
    } catch (error) {
      console.error('[Forum Manager] ❌ Failed to merge the content of the forum:', error);
      // 如果合并失败，返回新内容
      return newForumContent;
    }
  }

  /**
   * 解析论坛内容
   * @param {string} forumContent - 论坛内容文本
   * @returns {object} 解析后的数据 {threads: [], replies: {}}
   */
  parseForumContent(forumContent) {
    const threads = [];
    const replies = {};

    if (!forumContent || forumContent.trim() === '') {
      return { threads, replies };
    }

    // 解析标题格式: [标题|发帖人昵称|帖子id|标题内容|帖子详情]
    const titleRegex = /\[Heading\|([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;
    // 解析回复格式: [回复|回帖人昵称|帖子id|回复内容]
    const replyRegex = /\[Answer\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;
    // 解析楼中楼格式: [楼中楼|回帖人昵称|帖子id|父楼层|回复内容]
    const subReplyRegex = /\[Building in the middle of the reply\|([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;

    let match;

    // 解析标题
    let threadIndex = 0;
    while ((match = titleRegex.exec(forumContent)) !== null) {
      // 为现有帖子设置递增的时间戳，保持原有顺序
      const baseTime = new Date('2024-01-01 10:00:00');
      const threadTime = new Date(baseTime.getTime() + threadIndex * 60000); // 每个帖子间隔1分钟

      const thread = {
        id: match[2],
        author: match[1],
        title: match[3],
        content: match[4],
        timestamp: threadTime.toLocaleString(),
        latestActivityTime: threadTime, // 初始活动时间等于发布时间
      };

      threads.push(thread);
      replies[thread.id] = [];
      threadIndex++;
    }

    // 解析普通回复
    let replyIndex = 0;
    while ((match = replyRegex.exec(forumContent)) !== null) {
      // 为现有回复设置递增的时间戳，保持原有顺序
      const baseTime = new Date('2024-01-01 11:00:00');
      const replyTime = new Date(baseTime.getTime() + replyIndex * 30000); // 每个回复间隔30秒

      const reply = {
        id: `reply_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        threadId: match[2],
        author: match[1],
        content: match[3],
        timestamp: replyTime.toLocaleString(),
        type: 'reply',
        subReplies: [],
      };

      if (replies[reply.threadId]) {
        replies[reply.threadId].push(reply);

        // 更新对应帖子的最新活动时间
        const thread = threads.find(t => t.id === reply.threadId);
        if (thread && replyTime > thread.latestActivityTime) {
          thread.latestActivityTime = replyTime;
        }
      }
      replyIndex++;
    }

    // 解析楼中楼回复
    let subReplyIndex = 0;
    while ((match = subReplyRegex.exec(forumContent)) !== null) {
      // 为现有楼中楼回复设置递增的时间戳
      const baseTime = new Date('2024-01-01 12:00:00');
      const subReplyTime = new Date(baseTime.getTime() + subReplyIndex * 15000); // 每个楼中楼回复间隔15秒

      const subReply = {
        id: `subreply_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        threadId: match[2],
        author: match[1],
        content: match[4],
        parentFloor: match[3],
        timestamp: subReplyTime.toLocaleString(),
        type: 'subreply',
      };

      // 查找父回复并添加到其子回复中
      if (replies[subReply.threadId]) {
        const parentReply = replies[subReply.threadId].find(r => r.author === subReply.parentFloor);
        if (parentReply) {
          if (!parentReply.subReplies) {
            parentReply.subReplies = [];
          }
          parentReply.subReplies.push(subReply);
        } else {
          // 如果找不到父楼层，作为普通回复处理
          subReply.type = 'reply';
          subReply.subReplies = [];
          replies[subReply.threadId].push(subReply);
        }

        // 更新对应帖子的最新活动时间
        const thread = threads.find(t => t.id === subReply.threadId);
        if (thread && subReplyTime > thread.latestActivityTime) {
          thread.latestActivityTime = subReplyTime;
        }
      }
      subReplyIndex++;
    }

    return { threads, replies };
  }

  /**
   * 构建论坛内容
   * @param {Map} threadsMap - 帖子Map
   * @param {Map} repliesMap - 回复Map
   * @returns {string} 构建的论坛内容
   */
  buildForumContent(threadsMap, repliesMap) {
    let content = '';

    // 计算每个帖子的最新活动时间（包括回复时间）
    const threadsWithActivity = Array.from(threadsMap.values()).map(thread => {
      const threadReplies = repliesMap.get(thread.id) || [];
      let latestActivityTime = new Date(thread.timestamp);

      // 检查所有回复的时间，找到最新的
      threadReplies.forEach(reply => {
        const replyTime = new Date(reply.timestamp);
        if (replyTime > latestActivityTime) {
          latestActivityTime = replyTime;
        }

        // 检查楼中楼回复的时间
        if (reply.subReplies && reply.subReplies.length > 0) {
          reply.subReplies.forEach(subReply => {
            const subReplyTime = new Date(subReply.timestamp);
            if (subReplyTime > latestActivityTime) {
              latestActivityTime = subReplyTime;
            }
          });
        }
      });

      return {
        ...thread,
        latestActivityTime: latestActivityTime,
      };
    });

    // 按最新活动时间排序（最新活动的帖子在前）
    const sortedThreads = threadsWithActivity.sort((a, b) => {
      return new Date(b.latestActivityTime) - new Date(a.latestActivityTime);
    });

    sortedThreads.forEach(thread => {
      // 添加帖子
      content += `[Heading|${thread.author}|${thread.id}|${thread.title}|${thread.content}]\n\n`;

      // 添加回复
      const threadReplies = repliesMap.get(thread.id) || [];
      threadReplies.forEach(reply => {
        content += `[Answer|${reply.author}|${reply.threadId}|${reply.content}]\n`;

        // 添加楼中楼回复
        if (reply.subReplies && reply.subReplies.length > 0) {
          reply.subReplies.forEach(subReply => {
            content += `[Building in the middle of the reply|${subReply.author}|${subReply.threadId}|${subReply.parentFloor}|${subReply.content}]\n`;
          });
        }
      });

      content += '\n';
    });

    return content.trim();
  }

  /**
   * 获取当前论坛内容
   * @returns {string} 当前的论坛内容
   */
  async getCurrentForumContent() {
    try {
      if (!window.mobileContextEditor) {
        throw new Error('Context editor is not ready');
      }

      const chatData = window.mobileContextEditor.getCurrentChatData();
      if (!chatData || !chatData.messages || chatData.messages.length === 0) {
        return '';
      }

      const firstMessage = chatData.messages[0];
      if (!firstMessage || !firstMessage.mes) {
        return '';
      }

      // 提取论坛内容
      const forumRegex =
        /<!-- FORUM_CONTENT_START -->\s*【Hot discussion in the forum】\s*([\s\S]*?)\s*---\s*\[Automatically generated by the forum manager\]\s*<!-- FORUM_CONTENT_END -->/;
      const match = firstMessage.mes.match(forumRegex);

      return match ? match[1].trim() : '';
    } catch (error) {
      console.error('[Forum Manager] Failed to get the current forum content:', error);
      return '';
    }
  }

  /**
   * 清除论坛内容
   */
  async clearForumContent() {
    try {
      this.updateStatus('Clearing the forum content...', 'info');

      if (!window.mobileContextEditor) {
        throw new Error('Context editor is not ready');
      }

      const chatData = window.mobileContextEditor.getCurrentChatData();
      if (!chatData || !chatData.messages || chatData.messages.length === 0) {
        throw new Error('No data can be cleared.');
      }

      // 检查第1楼层是否包含论坛内容标记
      const firstMessage = chatData.messages[0];
      if (firstMessage && firstMessage.mes) {
        const originalContent = firstMessage.mes;
        const forumRegex = /<!-- FORUM_CONTENT_START -->[\s\S]*?<!-- FORUM_CONTENT_END -->/;

        if (forumRegex.test(originalContent)) {
          // 移除论坛内容标记及其包含的内容
          const cleanedContent = originalContent.replace(forumRegex, '').trim();

          if (cleanedContent === '') {
            // 如果清除论坛内容后消息变为空，删除整个消息
            const success = await window.mobileContextEditor.deleteMessage(0);
            if (success) {
              this.updateStatus('The forum content has been cleared (the message has been deleted)', 'success');
              console.log('[Forum Manager] ✅ The content of the forum on the first floor has been cleared and the message has been deleted.');
            } else {
              throw new Error('删除空消息失败');
            }
          } else {
            // 如果还有其他内容，只更新消息内容
            const success = await window.mobileContextEditor.modifyMessage(0, cleanedContent);
            if (success) {
              this.updateStatus('The content of the forum has been cleared (keep the original content)', 'success');
              console.log('[Forum Manager] ✅ The content of the forum on the first floor has been cleared, and the original content has been retained.');
            } else {
              throw new Error('Failed to update the message');
            }
          }
        } else {
          this.updateStatus('No forum content marks were found on the first floor.i', 'warning');
          console.log('[Forum Manager] No forum content marks were found on the first floor.');
        }
      } else {
        this.updateStatus('The message on the first floor is empty.', 'warning');
      }

      // 立即重置处理状态 - 兼容Safari
      this.isProcessing = false;

      // 重置auto-listener状态 - 确保不会被阻止
      if (window.forumAutoListener) {
        window.forumAutoListener.isProcessingRequest = false;
      }

      // 刷新论坛UI界面以反映数据变化
      this.clearForumUICache();

      console.log('[Forum Manager] 🔄 Cleared, the status has been reset (compatible with Safari)');
    } catch (error) {
      console.error('[Forum Manager] Failed to clear the forum content:', error);
      this.updateStatus(`Failed to clear: ${error.message}`, 'error');

      // 确保状态被重置 - 立即重置，不依赖setTimeout
      this.isProcessing = false;
      if (window.forumAutoListener) {
        window.forumAutoListener.isProcessingRequest = false;
      }
    } finally {
      // Safari兼容性：立即重置而不是延迟重置
      this.isProcessing = false;
      if (window.forumAutoListener) {
        window.forumAutoListener.isProcessingRequest = false;
      }

      // 额外的保险：仍然保留延迟重置作为最后保障
      setTimeout(() => {
        this.isProcessing = false;
        if (window.forumAutoListener) {
          window.forumAutoListener.isProcessingRequest = false;
        }
        console.log('[Forum Manager] 🛡️ Delayed status reset completed (final guarantee)');
      }, 500); // 减少到500ms，提升响应速度
    }
  }

  /**
   * 刷新论坛UI界面
   */
  clearForumUICache() {
    try {
      // 刷新论坛UI界面，因为论坛UI现在没有缓存数据，只需要重新渲染即可
      if (window.forumUI && window.forumUI.refreshThreadList) {
        window.forumUI.refreshThreadList();
        console.log('[Forum Manager] ✅ The forum UI interface has been refreshed.');
      }

      // 如果有其他论坛UI实例，也刷新它们
      if (window.mobileForumUI && window.mobileForumUI.refreshThreadList) {
        window.mobileForumUI.refreshThreadList();
        console.log('[Forum Manager] ✅ The mobile forum UI interface has been refreshed.');
      }

      // 清除localStorage中的论坛相关数据（如果有）
      const forumDataKeys = ['mobile_forum_threads', 'mobile_forum_replies', 'mobile_forum_cache'];

      forumDataKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`[Forum Manager] ✅ The ${key in localStorage has been cleared}`);
        }
      });
    } catch (error) {
      console.warn('[Forum Manager] A warning appears when refreshing the forum UI interface.:', error);
    }
  }

  /**
   * 发送回复到API
   */
  async sendReplyToAPI(replyFormat) {
    try {
      console.log('💬 [Reply API] ===== Start sending user replies =====');
      this.updateStatus('Sending a reply...', 'info');

      // 检查API配置
      if (!window.mobileCustomAPIConfig || !window.mobileCustomAPIConfig.isAPIAvailable()) {
        throw new Error('Please configure the API first.');
      }

      // 获取当前聊天数据
      const chatData = await this.getCurrentChatData();
      if (!chatData || !chatData.messages || chatData.messages.length === 0) {
        throw new Error('Chat data cannot be obtained.');
      }

      // 构建上下文信息
      const contextInfo = this.buildContextInfo(chatData);

      // 获取风格提示词（用户回复）
      const stylePrompt = window.forumStyles
        ? window.forumStyles.getStylePrompt(this.currentSettings.selectedStyle, 'reply')
        : '';

      console.log('📋 [Reply API] System prompt words (user reply):');
      console.log(stylePrompt);
      console.log('\n💭 [Reply API] User reply content:');
      console.log(replyFormat);
      console.log('\n📝 [Reply to API] Complete user message:');
      const userMessage = `🎯 Please generate complete forum content including user replies and AI replies based on the following chat records and user replies.：

📋 Chat records：
${contextInfo}

💬 Users' newly published replies：
${replyFormat}

🎯 【Important requirements】：
1. The reply just published by the user must be included in the forum content.

2. Generate replies and interactions from other netizens based on user replies

3. Maintain the lively atmosphere and realism of the forum

4. Generate complete forum content, including original posts, user replies, and other replies generated by AI.

5. Ensure that users' replies are reasonably responded to and interacted in the forum.`;
      console.log(userMessage);

      // 构建API请求，包含用户的回复
      const messages = [
        {
          role: 'system',
          content: `${stylePrompt}\n\n🎯 【Reply to the special instructions for handling】：\n- You are processing the user's forum reply\n- You must generate complete forum content containing the user's reply\n- The user's reply should be responded to and interacted with other netizens\n- Maintain the authenticity and activity of the forum\n- The generated content should be a complete forum page, not additional content.`,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ];

      console.log('📡 [Reply API] Complete API request:');
      console.log(JSON.stringify(messages, null, 2));

      // 调用API
      const response = await window.mobileCustomAPIConfig.callAPI(messages, {
        temperature: 0.8,
        max_tokens: 2000,
      });

      console.log('📥 [Reply API] Model return content:');
      console.log(response);

      if (response && response.content) {
        console.log('✅ [Reply API] Updated forum content:');
        console.log(response.content);

        // 安全更新论坛内容（带生成状态检查）
        const success = await this.safeUpdateContextWithForum(response.content);
        if (success) {
          this.updateStatus('Reply that the forum content has been sent and updated', 'success');
          this.clearForumUICache(); // 刷新UI
          console.log('🏁 [Reply API] ===== User reply processing completed=====\n');
          return true;
        } else {
          throw new Error('Failed to update the forum content');
        }
      } else {
        throw new Error('API returns format error');
      }
    } catch (error) {
      console.error('❌ [Reply API] Failed to send a reply:', error);
      console.log('🏁 [Reply API] ===== User reply processing failed=====\n');
      this.updateStatus(`Failed to send a reply: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * 发送新帖到API
   */
  async sendPostToAPI(postFormat) {
    try {
      console.log('📝 [Post API] ===== Start posting new posts =====');
      this.updateStatus('Posting...', 'info');

      // 检查API配置
      if (!window.mobileCustomAPIConfig || !window.mobileCustomAPIConfig.isAPIAvailable()) {
        throw new Error('Please configure the API first.');
      }

      // 获取当前聊天数据
      const chatData = await this.getCurrentChatData();
      if (!chatData || !chatData.messages || chatData.messages.length === 0) {
        throw new Error('Chat data cannot be obtained.');
      }

      // 构建上下文信息
      const contextInfo = this.buildContextInfo(chatData);

      // 获取风格提示词（用户发帖）
      const stylePrompt = window.forumStyles
        ? window.forumStyles.getStylePrompt(this.currentSettings.selectedStyle, 'post')
        : '';

      console.log('📋 [Posting API] System prompts (user posting）:');
      console.log(stylePrompt);
      console.log('\n📝 [Posting API] Posts posted by users:');
      console.log(postFormat);
      console.log('\n📝 [Posting API] Complete user message:');
      const userMessage = `Please update the forum content according to the following chat records and new posts published by users.：\n\n${contextInfo}\n\nNew posts by users：${postFormat}`;
      console.log(userMessage);

      // 构建API请求，包含用户的新帖
      const messages = [
        {
          role: 'system',
          content: stylePrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ];

      console.log('📡 [Posting API] Complete API Request:');
      console.log(JSON.stringify(messages, null, 2));

      // 调用API
      const response = await window.mobileCustomAPIConfig.callAPI(messages, {
        temperature: 0.8,
        max_tokens: 2000,
      });

      console.log('📥 [Posting API] Model return content:');
      console.log(response);

      if (response && response.content) {
        console.log('✅ [Posting API] Updated forum content:');
        console.log(response.content);

        // 安全更新论坛内容（带生成状态检查）
        const success = await this.safeUpdateContextWithForum(response.content);
        if (success) {
          this.updateStatus('The post has been published and the forum content has been updated.', 'success');
          this.clearForumUICache(); // 刷新UI
          console.log('🏁 [Posting API] ===== New post release completed =====\n');
          return true;
        } else {
          throw new Error('Failed to update the forum content');
        }
      } else {
        throw new Error('API returns format error');
      }
    } catch (error) {
      console.error('❌ [Posting API] Failed to post:', error);
      console.log('🏁 [Posting API] ===== Failed to publish new posts =====\n');
      this.updateStatus(`Failed to post: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * 直接将回复插入到第一层消息的论坛内容区域（带生成状态检查）
   */
  async insertReplyToFirstLayer(replyPrefix, replyFormat) {
    try {
      console.log('[Forum Manager] 🔒 Start the safe insertion and reply to the first floor....');

      // 检查是否正在生成
      if (this.checkGenerationStatus()) {
        console.log('[Forum Manager] ⚠️ It is detected that SillyTavern is generating replies, and the replies will be added to the queue....');
        return this.queueInsertion('reply', replyFormat, { replyPrefix, replyFormat });
      }

      this.updateStatus('Inserting a reply...', 'info');

      if (!window.mobileContextEditor) {
        throw new Error('Context editor is not ready');
      }

      const chatData = window.mobileContextEditor.getCurrentChatData();
      if (!chatData || !chatData.messages || chatData.messages.length === 0) {
        throw new Error('No data to insert');
      }

      // 获取第一条消息
      const firstMessage = chatData.messages[0];
      let newContent = '';

      if (firstMessage && firstMessage.mes) {
        const originalContent = firstMessage.mes;

        // 检查是否存在论坛内容标记
        const forumStartMarker = '<!-- FORUM_CONTENT_START -->';
        const forumEndMarker = '<!-- FORUM_CONTENT_END -->';

        const startIndex = originalContent.indexOf(forumStartMarker);
        const endIndex = originalContent.indexOf(forumEndMarker);

        if (startIndex !== -1 && endIndex !== -1) {
          // 如果存在论坛内容标记，在结束标记前插入回复
          const beforeForum = originalContent.substring(0, endIndex);
          const afterForum = originalContent.substring(endIndex);

          // 在论坛内容末尾添加回复
          newContent = beforeForum + '\n\n' + replyPrefix + '\n' + replyFormat + '\n' + afterForum;
        } else {
          // 如果不存在论坛内容标记，创建标记并插入回复
          newContent =
            originalContent +
            '\n\n' +
            forumStartMarker +
            '\n\n' +
            replyPrefix +
            '\n' +
            replyFormat +
            '\n\n' +
            forumEndMarker;
        }
      } else {
        // 如果第一条消息为空，创建完整的论坛内容结构
        newContent = `<!-- FORUM_CONTENT_START -->\n\n${replyPrefix}\n${replyFormat}\n\n<!-- FORUM_CONTENT_END -->`;
      }

      // 更新第一条消息
      const success = await window.mobileContextEditor.modifyMessage(0, newContent);
      if (success) {
        this.updateStatus('The reply has been inserted into the forum content area.', 'success');
        console.log('[Forum Manager] ✅ The reply has been inserted into the forum content area.');

        // 刷新UI
        this.clearForumUICache();
        return true;
      } else {
        throw new Error('Failed to update the message');
      }
    } catch (error) {
      console.error('[Forum Manager] Failed to insert the reply:', error);
      this.updateStatus(`Failed to insert the reply: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * 检查是否需要自动生成论坛内容
   */
  async checkAutoGenerate() {
    // 检查基本条件
    if (!this.currentSettings.autoUpdate || this.isProcessing) {
      return false;
    }

    // 检查auto-listener是否正在处理
    if (window.forumAutoListener && window.forumAutoListener.isProcessingRequest) {
      console.log('[Forum Manager] Auto-listenerProcessing, skip the check');
      return false;
    }

    try {
      const chatData = await this.getCurrentChatData();
      if (!chatData || !chatData.messages) {
        return false;
      }

      const currentCount = chatData.messages.length;
      const increment = currentCount - this.lastProcessedCount;

      console.log(
        `[Forum Manager] Check the automatic generation conditions: the number of current messages=${currentCount}, Processed=${this.lastProcessedCount}, Increment=${increment}, Threshold value=${this.currentSettings.threshold}`,
      );

      if (increment >= this.currentSettings.threshold) {
        console.log(`[Forum Manager] Automatically trigger the forum generation (Increment: ${increment})`);
        const result = await this.generateForumContent();
        return result;
      } else {
        console.log(`[Forum Manager] Insufficient increment, automatic generation is not triggered`);
        return false;
      }
    } catch (error) {
      console.error('[Forum Manager] Automatic check failed:', error);
      return false;
    }
  }

  /**
   * 更新状态显示
   */
  updateStatus(message, type = 'info') {
    const statusEl = document.getElementById('forum-status');
    if (statusEl) {
      const colors = {
        info: '#3498db',
        success: '#27ae60',
        warning: '#f39c12',
        error: '#e74c3c',
      };

      statusEl.textContent = `State: ${message}`;
      statusEl.style.color = colors[type] || colors.info;
    }

    console.log(`[Forum Manager] ${message}`);
  }

  /**
   * 保存设置
   */
  saveSettings() {
    try {
      localStorage.setItem('mobile_forum_settings', JSON.stringify(this.currentSettings));
      console.log('[Forum Manager] The settings have been saved');
    } catch (error) {
      console.error('[Forum Manager] Failed to save settings:', error);
    }
  }

  /**
   * 加载设置
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem('mobile_forum_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.currentSettings = { ...this.currentSettings, ...parsed };
        console.log('[Forum Manager] Settings have been loaded:', this.currentSettings);
      }
    } catch (error) {
      console.error('[Forum Manager] Failed to load settings:', error);
    }
  }

  /**
   * 注册控制台命令
   */
  registerConsoleCommands() {
    // 创建全局命令对象
    if (!window.MobileContext) {
      window.MobileContext = {};
    }

    // 论坛管理命令
    window.MobileContext.generateForum = (force = true) => this.generateForumContent(force); // 控制台命令默认强制生成
    window.MobileContext.forceGenerateForum = () => this.generateForumContent(true); // 专门的强制生成命令
    window.MobileContext.autoGenerateForum = () => this.generateForumContent(false); // 按规则自动生成
    window.MobileContext.showForum = () => this.showForumPanel();
    window.MobileContext.clearForum = () => this.clearForumContent();
    window.MobileContext.showForumPanel = () => this.showForumPanel();
    window.MobileContext.clearForumCache = () => this.clearForumUICache();
    window.MobileContext.sendReply = replyFormat => this.sendReplyToAPI(replyFormat);
    window.MobileContext.insertReply = (prefix, format) => this.insertReplyToFirstLayer(prefix, format);
    window.MobileContext.sendPost = postFormat => this.sendPostToAPI(postFormat);
    window.MobileContext.getForumStatus = () => this.getStatus();
    window.MobileContext.forceReset = () => this.forceReset(); // 注册强制重置命令

    // 新增：调试和测试命令
    window.MobileContext.testForceGenerate = () => {
      console.log('[Test] 🧪 Test the forced generation function...');
      return this.generateForumContent(true);
    };
    window.MobileContext.testDuplicateProtection = () => this.testDuplicateProtection();
    window.MobileContext.getListenerStatus = () => this.getListenerStatus();
    window.MobileContext.resetForumState = () => this.resetForumState();
    window.MobileContext.simulateMessageSpam = (count = 10) => this.simulateMessageSpam(count);

    // 浏览器兼容性命令
    window.MobileContext.fixBrowserCompatibility = () => this.fixBrowserCompatibility();
    window.MobileContext.quickDiagnosis = () => this.quickDiagnosis();

    // 生成状态监控命令
    window.MobileContext.checkGenerating = () => this.checkGenerationStatus();
    window.MobileContext.getQueueStatus = () => this.getQueueStatus();
    window.MobileContext.clearQueue = () => this.clearQueue();
    window.MobileContext.forceStopQueue = () => this.stopInsertionQueueProcessor();

    // 论坛内容合并测试命令
    window.MobileContext.testMergeContent = (existing, newContent) => this.mergeForumContent(existing, newContent);
    window.MobileContext.parseForumContent = content => this.parseForumContent(content);
    window.MobileContext.buildForumContent = (threads, replies) => this.buildForumContent(threads, replies);
    window.MobileContext.getCurrentForumContent = () => this.getCurrentForumContent();

    // 自动监听器命令
    window.MobileContext.startAutoListener = () => {
      if (window.forumAutoListener) {
        window.forumAutoListener.start();
      }
    };
    window.MobileContext.stopAutoListener = () => {
      if (window.forumAutoListener) {
        window.forumAutoListener.stop();
      }
    };
    window.MobileContext.getAutoListenerDebug = () => {
      if (window.forumAutoListener) {
        return window.forumAutoListener.getDebugInfo();
      }
    };

    // 帮助命令
    console.log('🚀 [Forum Manager] Console command has been registered:');
    console.log('');
    console.log('📝 [Basic command]:');
    console.log('  - MobileContext.generateForum(force=true) // Generate forum content (forced by default)');
    console.log('  - MobileContext.forceGenerateForum() // Forcibly generate forum content (ignore threshold)');
    console.log('  - MobileContext.autoGenerateForum() // Automatically generated according to the rules (check the threshold)');
    console.log('  - MobileContext.showForum() // Display Forum Panel');
    console.log('  - MobileContext.clearForum() // Clear the forum content');
    console.log('  - MobileContext.showForumPanel() // Display Forum Panel');
    console.log('  - MobileContext.clearForumCache() // Refresh the forum interface');
    console.log('  - MobileContext.sendReply(replyFormat) // Send a reply');
    console.log('  - MobileContext.insertReply(prefix, format) // Directly insert and return to the first layer');
    console.log('  - MobileContext.sendPost(postFormat) // Send a new post');
    console.log('  - MobileContext.getForumStatus() // Get the status of the forum');
    console.log('  - MobileContext.forceReset() // Force reset all statuses');
    console.log('');
    console.log('🔧 [Debugging and testing commands]:');
    console.log('  - MobileContext.testForceGenerate() // Test the forced generation function');
    console.log('  - MobileContext.testDuplicateProtection() // Test repeat request protection');
    console.log('  - MobileContext.getListenerStatus() // Get the status of the listener');
    console.log('  - MobileContext.resetForumState() // Reset the forum status');
    console.log('  - MobileContext.simulateMessageSpam(count) // Simulated message bombing test');
    console.log('');
    console.log('🍎 [Browser compatibility command]:');
    console.log('  - MobileContext.fixBrowserCompatibility() // Fix Safari/Via compatibility issues');
    console.log('  - MobileContext.quickDiagnosis() // Quickly diagnose the problem of the button not responding');
    console.log('');
    console.log('🎧 [Automatic listener command]:');
    console.log('  - MobileContext.startAutoListener() // Start the automatic listener');
    console.log('  - MobileContext.stopAutoListener() // Stop the automatic listener');
    console.log('  - MobileContext.getAutoListenerDebug() // Get the debugging information of the listener');
    console.log('');
    console.log('📊 [Generate status monitoring commands]:');
    console.log('  - MobileContext.checkGenerating() // Check whether SillyTavern is being generated');
    console.log('  - MobileContext.getQueueStatus() // Get the status of the insertion queue');
    console.log('  - MobileContext.clearQueue() // Empty the insertion queue');
    console.log('  - MobileContext.forceStopQueue() // Force to stop the queue processor');
    console.log('');
    console.log('� [Forum content merge command]:');
    console.log('  - MobileContext.getCurrentForumContent() // Get the current forum content');
    console.log('  - MobileContext.parseForumContent(content) // Analyse the content of the forum');
    console.log('  - MobileContext.buildForumContent(threads, replies) // Build the content of the forum');
    console.log('  - MobileContext.testMergeContent(existing, newContent) // Test content merging');
    console.log('');
    console.log('�📄[Forum Manager] 📄 All the content sent to the model will be displayed in detail in the console!') ;
    Console.log('🔍 Contains: system prompts, user messages, complete API requests, model return content, etc.');
    Console.log('📋 Check the console output to understand the complete process of forum generation');
    console.log('');
    console.log('📝 [Posting Format] Example: MobileContext.sendPost("[Title | Me | Post | My Title | My Content]")');
    Console.log('💬 [Reply Format] Example: MobileContext.sendReply("I reply to the post\'xxx\'\\n[Reply|I|Post id|Reply Content]")');
    console.log('');
    Console.log('🚀 [Generation Mode Description]:');
    Console.log(' - Forced generation: generate immediately, ignoring the threshold of the number of messages');
    Console.log(' - automatic generation: only generated when the message increment reaches the set threshold');
    Console.log(' - instant generation button = forced generation mode');
    Console.log(' - Auto-listener = auto-generated mode');
    console.log('');
    console.log('🛡️ [Duplicate Request Repair] If you encounter a duplicate request problem, please run: MobileContext.testDuplicateProtection()');
    Console.log('');
    Console.log('🔄 [Intelligent Merge Function] New Function Description:');
    Console.log(' - When the forum is generated immediately, the new content will be intelligently merged with historical posts');
    Console.log(' - historical posts will be retained, and new posts will be added later');
    Console.log(' - If the new content contains replies to historical posts, it will be automatically inserted into the corresponding posts');
    Console.log(' - avoid repeated replies and maintain the coherence of the forum content');
    console.log('');
    console.log('🍎[Safari/Via Compatibility] If the button is unresponsive, please run: MobileContext.fixBrowserCompatibility()');
    Console.log('📊 [Problem Diagnosis] If you encounter any problems, please run: MobileContext.quickDiagnosis()');
    console.log('');
  }

  /**
   * 测试重复请求防护
   */
  async testDuplicateProtection() {
    console.log('🛡️ [Repeat Request Protection Test] Start Testing...');

    const results = [];

    // 测试1: 多次快速调用generateForumContent
    console.log('📋 Test 1: Quickly call generateForumContent many times');
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(this.generateForumContent());
    }

    const testResults = await Promise.all(promises);
    const successCount = testResults.filter(r => r === true).length;

    console.log(`✅ Test 1 results: ${successCount}/5 times successful, the rest are blocked by protection`);
    results.push(`Test 1: ${successCount}/5 successes`);

    // 测试2: 检查状态同步
    console.log('📋 Test 2: Check status synchronisation');
    const managerStatus = this.isProcessing;
    const listenerStatus = window.forumAutoListener ? window.forumAutoListener.isProcessingRequest : false;

    console.log(`✅ Test 2 results: Manager processing status = ${managerStatus}, Listener processing status=${listenerStatus}`);
    results.push(`Test2: Manager=${managerStatus}, Listener=${listenerStatus}`);

    // 测试3: 检查计数同步
    console.log('📋 Test 3: Check the count synchronisation');
    const managerCount = this.lastProcessedCount;
    const listenerCount = window.forumAutoListener ? window.forumAutoListener.lastProcessedMessageCount : 0;

    console.log(`✅ Test 3 results: Manager count=${managerCount}, Listener count=${listenerCount}`);
    results.push(`Test3: Manager=${managerCount}, Listener=${listenerCount}`);

    console.log('🛡️ [Repeated request protection test] Completed');
    return results;
  }

  /**
   * 获取监听器状态
   */
  getListenerStatus() {
    const status = {
      forumManager: {
        isProcessing: this.isProcessing,
        lastProcessedCount: this.lastProcessedCount,
        settings: this.currentSettings,
      },
      forumAutoListener: window.forumAutoListener ? window.forumAutoListener.getDebugInfo() : null,
    };

    console.log('📊 [Monitor status]', status);
    return status;
  }

  /**
   * 重置论坛状态
   */
  resetForumState() {
    console.log('🔄 [Reset the forum status] Start reset...');

    // 重置管理器状态
    this.isProcessing = false;
    this.lastProcessedCount = 0;

    // 重置监听器状态
    if (window.forumAutoListener) {
      window.forumAutoListener.reset();
    }

    console.log('✅ [Reset the forum status] Done');
  }

  /**
   * 模拟消息轰炸测试
   */
  async simulateMessageSpam(count = 10) {
    console.log(`🔥 [Message bombing test] Simulate ${count} consecutive message events...`);

    if (!window.forumAutoListener) {
      console.log('❌ Auto-Listener not found');
      return;
    }

    const originalCount = window.forumAutoListener.lastMessageCount;

    for (let i = 0; i < count; i++) {
      window.forumAutoListener.onMessageReceived({ test: true, index: i });
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms间隔
    }

    const finalCount = window.forumAutoListener.lastMessageCount;
    console.log(`✅ [Message bombing test] completed. Original count: ${originalCount}, Final count: ${finalCount}`);
  }

  /**
   * 获取实例
   */
  static getInstance() {
    if (!window.forumManager) {
      window.forumManager = new ForumManager();
    }
    return window.forumManager;
  }

  /**
   * 检查SillyTavern是否正在生成回复
   */
  checkGenerationStatus() {
    try {
      // 方法1: 检查全局变量 is_send_press
      const is_send_press = window.is_send_press;
      if (is_send_press === true) {
        return true;
      }

      // 方法2: 检查 DOM 元素的 data-generating 属性
      const bodyElement = document.body;
      if (bodyElement && bodyElement.dataset.generating === 'true') {
        return true;
      }

      // 方法3: 检查是否有其他生成相关的标志
      const is_generation_stopped = window.is_generation_stopped;
      if (is_generation_stopped === false) {
        return true;
      }

      // 方法4: 检查群组生成状态（如果可用）
      const is_group_generating = window.is_group_generating;
      if (is_group_generating === true) {
        return true;
      }

      return false;
    } catch (error) {
      console.warn('[Forum Manager] An error occurred when checking the generation status.:', error);
      return false; // 出错时假设没有生成
    }
  }

  /**
   * 等待SillyTavern生成完成
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise<boolean>} - 是否成功等待完成
   */
  async waitForGenerationComplete(timeout = this.maxWaitTime) {
    return new Promise(resolve => {
      const startTime = Date.now();
      let checkCount = 0;

      console.log('[Forum Manager] 🕐 Start waiting for the completion of the SillyTavern generation...');

      const checkInterval = setInterval(() => {
        checkCount++;
        const isGenerating = this.checkGenerationStatus();
        const elapsed = Date.now() - startTime;

        // 每10次检查打印一次状态
        if (checkCount % 10 === 0) {
          console.log(`[Forum Manager] ⏳ Waiting... (${Math.round(elapsed / 1000)}s, Number of inspections: ${checkCount})`);
        }

        if (!isGenerating) {
          clearInterval(checkInterval);
          console.log(`[Forum Manager] ✅ SillyTavern has been generated.! (Waiting time: ${Math.round(elapsed / 1000)}s)`);
          resolve(true);
        } else if (elapsed >= timeout) {
          clearInterval(checkInterval);
          console.warn(`[Forum Manager] ⏰ Waiting for the timeout (${Math.round(timeout / 1000)}s)，Compulsory continuation`);
          resolve(false);
        }
      }, 500); // 每500ms检查一次
    });
  }

  /**
   * 安全地更新第1楼层（带生成状态检查）
   */
  async safeUpdateContextWithForum(forumContent) {
    try {
      console.log('[Forum Manager] 🔒 Start to update the first floor safely...');

      // 检查是否正在生成
      if (this.checkGenerationStatus()) {
        console.log('[Forum Manager] ⚠️ It is detected that SillyTavern is generating a reply and waiting for completion....');
        this.updateStatus('Wait for the completion of SillyTavern generation...', 'warning');

        // 等待生成完成
        const waitSuccess = await this.waitForGenerationComplete();
        if (!waitSuccess) {
          console.warn('[Forum Manager] ⏰ Waiting for a timeout, but still trying to update');
          this.updateStatus('Wait for the timeout and try to force the update....', 'warning');
        }
      }

      // 再次确认生成状态
      if (this.checkGenerationStatus()) {
        console.warn('[Forum Manager] ⚠️ The generation status is still active, and the message is added to the queue.');
        return this.queueInsertion('forum_content', forumContent);
      }

      // 执行实际更新
      console.log('[Forum Manager] 🚀 Start updating the content of the first floor...');
      const result = await this.updateContextWithForum(forumContent);

      // 显示结果提示
      if (result && window.showMobileToast) {
        window.showMobileToast('✅ The forum content has been successfully inserted into the first floor.', 'success');
      } else if (!result && window.showMobileToast) {
        window.showMobileToast('❌ Failed to insert the forum content', 'error');
      }

      return result;
    } catch (error) {
      console.error('[Forum Manager] Security update failed:', error);
      return false;
    }
  }

  /**
   * 将插入操作加入队列
   */
  async queueInsertion(type, content, additionalData = {}) {
    const insertion = {
      id: Date.now() + Math.random(),
      type: type,
      content: content,
      timestamp: new Date(),
      additionalData: additionalData,
    };

    this.pendingInsertions.push(insertion);
    console.log(`[Forum Manager] 📝 The message has been added to the queue (ID: ${insertion.id}, type: ${type})`);

    this.updateStatus(`The message has been added to the queue, waiting for insertion (queue length: ${this.pendingInsertions.length})`, 'info');

    // 开始处理队列
    this.startInsertionQueueProcessor();

    return true;
  }

  /**
   * 开始处理插入队列
   */
  startInsertionQueueProcessor() {
    if (this.isMonitoringGeneration) {
      return; // 已经在处理中
    }

    this.isMonitoringGeneration = true;
    console.log('[Forum Manager] 🎛️ Start the queue processor...');

    this.generationCheckInterval = setInterval(async () => {
      await this.processInsertionQueue();
    }, 1000); // 每秒检查一次
  }

  /**
   * 处理插入队列
   */
  async processInsertionQueue() {
    if (this.pendingInsertions.length === 0) {
      this.stopInsertionQueueProcessor();
      return;
    }

    // 检查是否正在生成
    if (this.checkGenerationStatus()) {
      console.log(`[Forum Manager] ⏳ SillyTavern is being generated, waiting... (Queue: ${this.pendingInsertions.length} Item)`);
      return;
    }

    // 处理队列中的第一个项目
    const insertion = this.pendingInsertions.shift();
    if (!insertion) return;

    console.log(`[Forum Manager] 🔄 Process queue items (ID: ${insertion.id}, type: ${insertion.type})`);

    try {
      let success = false;

      switch (insertion.type) {
        case 'forum_content':
          success = await this.updateContextWithForum(insertion.content);
          break;
        case 'reply':
          const { replyPrefix, replyFormat } = insertion.additionalData;
          success = await this.insertReplyToFirstLayer(replyPrefix, replyFormat);
          break;
        default:
          console.warn(`[Forum Manager] Unknown insertion type: ${insertion.type}`);
          success = false;
      }

      if (success) {
        console.log(`[Forum Manager] ✅ The queue project was processed successfully. (ID: ${insertion.id})`);
        this.updateStatus('Message inserted successfully', 'success');
      } else {
        console.error(`[Forum Manager] ❌ Queue project processing failed (ID: ${insertion.id})`);
        this.updateStatus('Message insertion failed', 'error');
      }
    } catch (error) {
      console.error(`[Forum Manager] An error occurred while processing queue items. (ID: ${insertion.id}):`, error);
    }

    // 如果还有项目，继续处理
    if (this.pendingInsertions.length > 0) {
      this.updateStatus(`Queue processing... (Remaining: ${this.pendingInsertions.length} item)`, 'info');
    }
  }

  /**
   * 停止队列处理器
   */
  stopInsertionQueueProcessor() {
    if (this.generationCheckInterval) {
      clearInterval(this.generationCheckInterval);
      this.generationCheckInterval = null;
    }
    this.isMonitoringGeneration = false;
    console.log('[Forum Manager] 🛑 The queue processor has stopped.');
  }

  /**
   * 获取队列状态
   */
  getQueueStatus() {
    return {
      isMonitoring: this.isMonitoringGeneration,
      pendingCount: this.pendingInsertions.length,
      isGenerating: this.checkGenerationStatus(),
      queue: this.pendingInsertions.map(item => ({
        id: item.id,
        type: item.type,
        timestamp: item.timestamp,
      })),
    };
  }

  /**
   * 清空队列
   */
  clearQueue() {
    this.pendingInsertions = [];
    this.stopInsertionQueueProcessor();
    console.log('[Forum Manager] 🗑️ The insertion queue has been emptied');
    this.updateStatus('The insertion queue has been emptied', 'info');
  }

  /**
   * 更新队列状态显示
   */
  updateQueueStatusDisplay() {
    try {
      const generationStatusEl = document.getElementById('generation-status');
      const queueCountEl = document.getElementById('queue-count');

      if (generationStatusEl) {
        const isGenerating = this.checkGenerationStatus();
        generationStatusEl.textContent = isGenerating ? '🟠 Generating' : '🟢 Free';
        generationStatusEl.style.color = isGenerating ? '#f39c12' : '#27ae60';
      }

      if (queueCountEl) {
        queueCountEl.textContent = this.pendingInsertions.length;
        queueCountEl.style.color = this.pendingInsertions.length > 0 ? '#e74c3c' : '#95a5a6';
      }
    } catch (error) {
      console.warn('[Forum Manager] An error occurred when updating the queue status display.:', error);
    }
  }

  /**
   * 启动状态更新定时器
   */
  startStatusUpdateTimer() {
    // 如果已有定时器，先清除
    if (this.statusUpdateTimer) {
      clearInterval(this.statusUpdateTimer);
    }

    // 立即更新一次
    this.updateQueueStatusDisplay();

    // 设置定时更新（每2秒）
    this.statusUpdateTimer = setInterval(() => {
      this.updateQueueStatusDisplay();
    }, 2000);

    console.log('[Forum Manager] 📊 The status update timer has been started.');
  }

  /**
   * 停止状态更新定时器
   */
  stopStatusUpdateTimer() {
    if (this.statusUpdateTimer) {
      clearInterval(this.statusUpdateTimer);
      this.statusUpdateTimer = null;
      console.log('[Forum Manager] 📊 The status update timer has stopped.');
    }
  }

  /**
   * 强制重置所有状态 - 用于解决按钮卡住问题
   */
  async forceReset() {
    console.log('[Forum Manager] 🔄 Perform a forced reset...');

    // 重置所有状态标志
    this.isProcessing = false;
    this.isMonitoringGeneration = false;

    // 清除所有定时器
    if (this.generationCheckInterval) {
      clearInterval(this.generationCheckInterval);
      this.generationCheckInterval = null;
    }

    if (this.statusUpdateTimer) {
      clearTimeout(this.statusUpdateTimer);
      this.statusUpdateTimer = null;
    }

    // 清空队列
    if (this.pendingInsertions) {
      this.pendingInsertions = [];
    }

    // 停止队列处理器
    this.stopInsertionQueueProcessor();

    // 重置计数器到当前消息数量
    await this.resetMessageCounts();

    // 重置auto-listener状态
    if (window.forumAutoListener) {
      window.forumAutoListener.isProcessingRequest = false;
      // 同时重置auto-listener的消息计数
      try {
        const chatData = await this.getCurrentChatData();
        if (chatData && chatData.messages && window.forumAutoListener) {
          const currentCount = chatData.messages.length;
          window.forumAutoListener.lastProcessedMessageCount = currentCount;
          window.forumAutoListener.lastMessageCount = currentCount;
          console.log(`[Forum Manager] 🔄 Synchronised auto-listener message count: ${currentCount}`);
        }
      } catch (err) {
        console.warn('[Forum Manager] Failed to synchronise the message count:', err);
      }
    }

    // 更新状态显示
    this.updateStatus('All statuses have been forcibly reset.', 'success');

    console.log('[Forum Manager] ✅ Completion of forced reset');

    return true;
  }

  /**
   * 浏览器兼容性检测和修复
   */
  async fixBrowserCompatibility() {
    console.log('[Forum Manager] 🍎 Start browser compatibility testing...');

    const userAgent = navigator.userAgent;
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isVia = /Via/.test(userAgent);
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);

    console.log(`[Forum Manager] Browser information:`, {
      userAgent: userAgent,
      isSafari: isSafari,
      isVia: isVia,
      isMobile: isMobile,
      currentProcessingState: this.isProcessing,
    });

    // Safari/Via 特殊处理
    if (isSafari || isVia) {
      console.log('[Forum Manager] 🔧 Safari/Via browser was detected, and the application compatibility was repaired....');

      // 1. 强制重置状态
      this.isProcessing = false;
      if (window.forumAutoListener) {
        window.forumAutoListener.isProcessingRequest = false;
      }

      // 2. 清除可能卡住的定时器
      if (this.statusUpdateTimer) {
        clearTimeout(this.statusUpdateTimer);
        this.statusUpdateTimer = null;
      }

      // 3. 立即更新状态显示
      this.updateStatus('Safari/Via compatibility repair completed', 'success');

      console.log('[Forum Manager] ✅ Safari/Via compatibility repair completed');
      return true;
    } else {
      console.log('[Forum Manager] ℹ️ Chrome browser, no need for special compatibility processing');
      return false;
    }
  }

  /**
   * 快速诊断方法 - 用于排查按钮无响应问题
   */
  quickDiagnosis() {
    const status = {
      timestamp: new Date().toISOString(),
      browser: navigator.userAgent,
      states: {
        isProcessing: this.isProcessing,
        isMonitoringGeneration: this.isMonitoringGeneration,
        pendingInsertionsCount: this.pendingInsertions.length,
        lastProcessedCount: this.lastProcessedCount,
      },
      timers: {
        generationCheckInterval: !!this.generationCheckInterval,
        statusUpdateTimer: !!this.statusUpdateTimer,
      },
      autoListener: window.forumAutoListener
        ? {
            isListening: window.forumAutoListener.isListening,
            isProcessingRequest: window.forumAutoListener.isProcessingRequest,
            lastProcessedMessageCount: window.forumAutoListener.lastProcessedMessageCount,
          }
        : null,
    };

    console.log('[Forum Manager] 📊 Quick diagnosis results:', status);
    return status;
  }

  /**
   * 重置消息计数器
   */
  async resetMessageCounts() {
    try {
      const chatData = await this.getCurrentChatData();
      if (chatData && chatData.messages) {
        const currentCount = chatData.messages.length;
        this.lastProcessedCount = currentCount;
        console.log(`[Forum Manager] 🔄 The message count has been reset: ${currentCount}`);
      }
    } catch (error) {
      console.warn('[Forum Manager] Failed to reset the message count:', error);
    }
  }

  /**
   * 获取调试信息
   */
  getDebugInfo() {
    return {
      isInitialized: this.isInitialized,
      isProcessing: this.isProcessing,
      lastProcessedCount: this.lastProcessedCount,
      currentSettings: this.currentSettings,
      isMonitoringGeneration: this.isMonitoringGeneration,
      pendingInsertionsCount: this.pendingInsertions ? this.pendingInsertions.length : 0,
      autoListenerStatus: window.forumAutoListener
        ? {
            isListening: window.forumAutoListener.isListening,
            isProcessingRequest: window.forumAutoListener.isProcessingRequest,
            lastProcessedMessageCount: window.forumAutoListener.lastProcessedMessageCount,
          }
        : null,
    };
  }
}

// 创建全局实例
window.forumManager = ForumManager.getInstance();

// 智能初始化：确保论坛管理器在动态加载时也能正确初始化
function initializeForumManager() {
  if (window.forumManager && !window.forumManager.isInitialized) {
    console.log('[Forum Manager] Start initialising the forum manager...');
    window.forumManager.initialize();
  }
}

// 如果DOM已经加载完成，立即初始化；否则等待DOMContentLoaded
if (document.readyState === 'loading') {
  console.log('[Forum Manager] DOM is loading, waiting for the DOMContentLoaded event');
  document.addEventListener('DOMContentLoaded', initializeForumManager);
} else {
  console.log('[Forum Manager] DOM has been loaded and initialised immediately.');
  // 使用setTimeout确保模块完全加载后再初始化
  setTimeout(initializeForumManager, 0);
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ForumManager;
}
