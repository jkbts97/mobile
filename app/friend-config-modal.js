/**
 * 好友专用图片配置弹窗管理器
 * 完全复刻原弹窗的功能和样式
 */

// 避免重复定义
if (typeof window.FriendImageConfigModal === 'undefined') {
  window.FriendImageConfigModal = class FriendImageConfigModal {
    constructor() {
      this.isInitialized = false;
      this.currentFriendId = null;
      this.currentFriendName = null;
      this.currentBackgroundId = null;
      this.currentTab = 'avatar';
      this.isDragging = false;
      this.dragStart = { x: 0, y: 0 };
      this.currentConfig = {
        avatar: {
          image: '',
          position: 'center center',
          rotation: 0,
          scale: 1
        },
        background: {
          image: '',
          position: 'center center',
          rotation: 0,
          scale: 1
        }
      };
    }

    /**
     * 初始化弹窗
     */
    async init() {
      if (this.isInitialized) return;

      try {
        // 加载HTML结构
        await this.loadHTML();
        
        // 加载CSS样式
        await this.loadCSS();
        
        // 绑定事件
        this.bindEvents();
        
        this.isInitialized = true;
        console.log('[Friend Image Config] 好友图片配置弹窗初始化完成');
      } catch (error) {
        console.error('[Friend Image Config] 初始化失败:', error);
      }
    }

    /**
     * 加载HTML结构
     */
    async loadHTML() {
      try {
        const response = await fetch('/scripts/extensions/third-party/mobile/app/friend-image-config-modal.html');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const html = await response.text();
        
        // 将HTML添加到手机容器中
        const phoneContainer = document.querySelector('.mobile-phone-frame') || document.body;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        phoneContainer.appendChild(tempDiv.firstElementChild);
      } catch (error) {
        console.error('[Friend Image Config] 加载HTML失败:', error);
        throw error;
      }
    }

    /**
     * 加载CSS样式
     */
    async loadCSS() {
      try {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/scripts/extensions/third-party/mobile/app/friend-config-modal.css';
        link.onload = () => console.log('[Friend Image Config] CSS加载完成');
        link.onerror = () => console.error('[Friend Image Config] CSS加载失败');
        document.head.appendChild(link);
      } catch (error) {
        console.error('[Friend Image Config] 加载CSS失败:', error);
        throw error;
      }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
      const modal = document.getElementById('friend-image-config-modal');
      if (!modal) return;

      // 关闭按钮
      const closeBtn = document.getElementById('friend-modal-close');
      closeBtn?.addEventListener('click', () => this.close());

      // 点击遮罩关闭
      const overlay = modal.querySelector('.modal-overlay');
      overlay?.addEventListener('click', () => this.close());

      // 标签页切换
      const tabBtns = modal.querySelectorAll('.tab-btn');
      tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const tab = e.target.dataset.tab;
          this.switchTab(tab);
        });
      });

      // 文件上传按钮
      modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('upload-btn')) {
          const targetId = e.target.dataset.target;
          const fileInput = document.getElementById(targetId);
          if (fileInput) {
            fileInput.click();
          }
        }
      });

      // 文件上传处理
      const avatarFileInput = document.getElementById('friend-avatar-file-input');
      avatarFileInput?.addEventListener('change', (e) => this.handleFileUpload(e, 'avatar'));

      const backgroundFileInput = document.getElementById('friend-background-file-input');
      backgroundFileInput?.addEventListener('change', (e) => this.handleFileUpload(e, 'background'));

      // URL输入处理
      modal.addEventListener('input', (e) => {
        if (e.target.classList.contains('url-input')) {
          const type = e.target.dataset.type;
          const url = e.target.value.trim();
          if (url) {
            this.handleUrlInput(url, type);
          }
        }
      });

      // 滑块控制
      modal.addEventListener('input', (e) => {
        if (e.target.classList.contains('control-slider')) {
          const type = e.target.dataset.type;
          const property = e.target.dataset.property;
          const value = parseFloat(e.target.value);
          this.updateProperty(type, property, value);
        }
      });

      // 保存按钮
      const saveBtn = document.getElementById('friend-config-save');
      saveBtn?.addEventListener('click', () => this.saveConfig());

      // 拖拽功能
      this.bindDragEvents();
    }

    /**
     * 打开弹窗
     */
    async open(friendId, friendName, backgroundId) {
      if (!this.isInitialized) {
        await this.init();
      }

      this.currentFriendId = friendId;
      this.currentFriendName = friendName;
      this.currentBackgroundId = backgroundId;

      // 更新标题
      const title = document.getElementById('friend-modal-title');
      if (title) {
        title.textContent = `${friendName} - 图片设置`;
      }

      // 加载当前好友的配置
      await this.loadFriendConfig();

      // 显示弹窗
      const modal = document.getElementById('friend-image-config-modal');
      if (modal) {
        modal.style.display = 'flex';
        // 添加动画效果
        setTimeout(() => {
          modal.classList.add('show');
        }, 10);
      }

      console.log(`[Friend Image Config] 打开好友配置: ${friendName} (ID: ${friendId})`);
    }

    /**
     * 关闭弹窗
     */
    close() {
      const modal = document.getElementById('friend-image-config-modal');
      if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
          modal.style.display = 'none';
        }, 200);
      }
    }

    /**
     * 切换标签页
     */
    switchTab(tabName) {
      this.currentTab = tabName;

      // 更新标签按钮状态
      const tabBtns = document.querySelectorAll('#friend-image-config-modal .tab-btn');
      tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
      });

      // 更新内容显示
      const tabContents = document.querySelectorAll('#friend-image-config-modal .tab-content');
      tabContents.forEach(content => {
        if (content.dataset.tab === tabName) {
          content.style.display = 'block';
        } else {
          content.style.display = 'none';
        }
      });
    }

    /**
     * 处理文件上传
     */
    async handleFileUpload(event, type) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        // 转换为base64
        const base64 = await this.fileToBase64(file);
        
        // 更新配置
        this.currentConfig[type].image = base64;
        this.currentConfig[type].position = 'center center';
        this.currentConfig[type].rotation = 0;
        this.currentConfig[type].scale = 1;

        // 更新预览
        this.updatePreview(type);
        
        // 重置控制器
        this.resetControls(type);

        console.log(`[Friend Image Config] ${type} 图片上传成功`);
      } catch (error) {
        console.error(`[Friend Image Config] ${type} 图片上传失败:`, error);
      }
    }

    /**
     * 处理URL输入
     */
    async handleUrlInput(url, type) {
      try {
        // 验证URL
        new URL(url);
        
        // 更新配置
        this.currentConfig[type].image = url;
        this.currentConfig[type].position = 'center center';
        this.currentConfig[type].rotation = 0;
        this.currentConfig[type].scale = 1;

        // 更新预览
        this.updatePreview(type);
        
        // 重置控制器
        this.resetControls(type);

        console.log(`[Friend Image Config] ${type} URL设置成功`);
      } catch (error) {
        console.error(`[Friend Image Config] ${type} URL无效:`, error);
      }
    }

    /**
     * 文件转Base64
     */
    fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
