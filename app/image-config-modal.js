/**
 * Image Config Modal - 图片配置弹窗
 * 用于配置用户头像和消息背景图片
 */

// 避免重复定义
if (typeof window.ImageConfigModal === 'undefined') {
  class ImageConfigModal {
    constructor() {
      this.isVisible = false;
      this.currentTab = 'avatar'; // 'avatar' 或 'background'
      this.modalElement = null;
      this.currentConfig = {
        avatar: {
          image: '',
          position: { x: 50, y: 50 }, // 百分比位置
          rotation: 0,
          scale: 1,
        },
        background: {
          image: '',
          position: { x: 50, y: 50 },
          rotation: 0,
          scale: 1,
        },
      };

      this.isDragging = false;
      this.dragStartPos = { x: 0, y: 0 };
      this.dragStartImagePos = { x: 0, y: 0 };

      console.log('[Image Config Modal] 图片配置弹窗初始化完成');
    }

    // 显示弹窗
    show() {
      console.log('[Image Config Modal] 显示弹窗');

      // 加载当前配置
      this.loadCurrentConfig();

      // 创建弹窗HTML
      this.createModal();

      // 绑定事件
      this.bindEvents();

      // 显示弹窗
      this.isVisible = true;
      this.modalElement.style.display = 'flex';

      // 添加显示动画
      setTimeout(() => {
        this.modalElement.classList.add('show');
      }, 10);

      // 更新预览
      this.updatePreview();
    }

    // 隐藏弹窗
    hide() {
      console.log('[Image Config Modal] 隐藏弹窗');

      if (!this.modalElement) return;

      // 清理拖拽事件监听器
      this.cleanupDragEvents();

      // 添加隐藏动画
      this.modalElement.classList.remove('show');

      setTimeout(() => {
        if (this.modalElement && this.modalElement.parentNode) {
          this.modalElement.parentNode.removeChild(this.modalElement);
        }
        this.modalElement = null;
        this.isVisible = false;
      }, 300);
    }

    // 创建弹窗HTML
    createModal() {
      // 移除已存在的弹窗
      const existingModal = document.querySelector('.image-config-modal');
      if (existingModal) {
        existingModal.remove();
      }

      // 创建弹窗元素
      this.modalElement = document.createElement('div');
      this.modalElement.className = 'image-config-modal';
      this.modalElement.innerHTML = this.getModalHTML();

      // 添加到手机容器中，确保相对定位
      const phoneContainer =
        document.querySelector('#mobile-phone-container .mobile-phone-frame') ||
        document.querySelector('.mobile-phone-frame') ||
        document.querySelector('#mobile-phone-container') ||
        document.querySelector('.mobile-phone-container');

      if (phoneContainer) {
        // 确保手机容器有相对定位
        const computedStyle = getComputedStyle(phoneContainer);
        if (computedStyle.position === 'static') {
          phoneContainer.style.position = 'relative';
        }
        phoneContainer.appendChild(this.modalElement);
        console.log('[Image Config Modal] 弹窗已添加到手机容器:', phoneContainer.className || phoneContainer.id);
      } else {
        // 如果找不到手机容器，添加到body但使用fixed定位
        console.warn('[Image Config Modal] 未找到手机容器，使用body定位');
        this.modalElement.style.position = 'fixed';
        document.body.appendChild(this.modalElement);
      }
    }

    // 获取弹窗HTML模板
    getModalHTML() {
      return `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">图片设置</h3>
            <button class="modal-close-btn" type="button">✕</button>
          </div>
          
          <div class="modal-tabs">
            <button class="tab-btn ${this.currentTab === 'avatar' ? 'active' : ''}" data-tab="avatar">
              用户头像
            </button>
            <button class="tab-btn ${this.currentTab === 'background' ? 'active' : ''}" data-tab="background">
              消息主页背景
            </button>
          </div>
          
          <div class="modal-body">
            <div class="tab-content" data-tab="avatar" style="display: ${
              this.currentTab === 'avatar' ? 'block' : 'none'
            }">
              ${this.getAvatarTabHTML()}
            </div>
            <div class="tab-content" data-tab="background" style="display: ${
              this.currentTab === 'background' ? 'block' : 'none'
            }">
              ${this.getBackgroundTabHTML()}
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="save-btn" type="button">保存设置</button>
          </div>
        </div>
      `;
    }

    // 获取头像标签页HTML
    getAvatarTabHTML() {
      return `
        <div class="config-section">
          <div class="upload-section">
            <div class="upload-controls">
              <input type="file" id="avatar-file-input" accept="image/*" style="display: none;">
              <button class="upload-btn" data-target="avatar-file-input">选择图片</button>
              <input type="url" class="url-input" placeholder="或输入图片链接..." data-type="avatar">
            </div>
          </div>
          
          <div class="preview-section">
            <div class="preview-container avatar-preview">
              <div class="preview-image" id="avatar-preview"></div>
              <div class="drag-hint">拖拽调整位置</div>
            </div>
          </div>
          
          <div class="controls-section">
            <div class="control-row">
              <label>旋转:</label>
              <input type="range" class="control-slider" min="0" max="360" step="1" value="0" data-type="avatar" data-property="rotation">
              <span class="control-value">0°</span>
            </div>
            <div class="control-row">
              <label>缩放:</label>
              <input type="range" class="control-slider" min="0.5" max="2" step="0.1" value="1" data-type="avatar" data-property="scale">
              <span class="control-value">1.0x</span>
            </div>
          </div>
        </div>
      `;
    }

    // 获取背景标签页HTML
    getBackgroundTabHTML() {
      return `
        <div class="config-section">
          <div class="upload-section">
            <div class="upload-controls">
              <input type="file" id="background-file-input" accept="image/*" style="display: none;">
              <button class="upload-btn" data-target="background-file-input">选择图片</button>
              <input type="url" class="url-input" placeholder="或输入图片链接..." data-type="background">
            </div>
          </div>
          
          <div class="preview-section">
            <div class="preview-container background-preview">
              <div class="preview-image" id="background-preview"></div>
              <div class="drag-hint">拖拽调整位置</div>
            </div>
          </div>
          
          <div class="controls-section">
            <div class="control-row">
              <label>旋转:</label>
              <input type="range" class="control-slider" min="0" max="360" step="1" value="0" data-type="background" data-property="rotation">
              <span class="control-value">0°</span>
            </div>
            <div class="control-row">
              <label>缩放:</label>
              <input type="range" class="control-slider" min="0.5" max="2" step="0.1" value="1" data-type="background" data-property="scale">
              <span class="control-value">1.0x</span>
            </div>
          </div>
        </div>
      `;
    }

    // 加载当前配置
    loadCurrentConfig() {
      if (window.styleConfigManager && window.styleConfigManager.isReady) {
        const config = window.styleConfigManager.getConfig();

        // 加载用户头像配置
        if (config.messageSentAvatar) {
          this.currentConfig.avatar = {
            image: config.messageSentAvatar.backgroundImage || config.messageSentAvatar.backgroundImageUrl || '',
            position: this.parseBackgroundPosition(config.messageSentAvatar.backgroundPosition || 'center center'),
            rotation: parseFloat(config.messageSentAvatar.rotation || 0),
            scale: parseFloat(config.messageSentAvatar.scale || 1),
          };
        }

        // 加载消息背景配置
        if (config.messagesApp) {
          this.currentConfig.background = {
            image: config.messagesApp.backgroundImage || config.messagesApp.backgroundImageUrl || '',
            position: this.parseBackgroundPosition(config.messagesApp.backgroundPosition || 'center center'),
            rotation: parseFloat(config.messagesApp.rotation || 0),
            scale: parseFloat(config.messagesApp.scale || 1),
          };
        }

        console.log('[Image Config Modal] 已加载当前配置:', this.currentConfig);
      }
    }

    // 解析CSS background-position为坐标
    parseBackgroundPosition(positionStr) {
      const parts = positionStr.split(' ');
      let x = 50,
        y = 50;

      if (parts.length >= 2) {
        // 处理百分比值
        if (parts[0].includes('%')) {
          x = parseFloat(parts[0]);
        } else if (parts[0] === 'left') {
          x = 0;
        } else if (parts[0] === 'right') {
          x = 100;
        } else if (parts[0] === 'center') {
          x = 50;
        }

        if (parts[1].includes('%')) {
          y = parseFloat(parts[1]);
        } else if (parts[1] === 'top') {
          y = 0;
        } else if (parts[1] === 'bottom') {
          y = 100;
        } else if (parts[1] === 'center') {
          y = 50;
        }
      }

      return { x, y };
    }

    // 将坐标转换为CSS background-position
    formatBackgroundPosition(position) {
      return `${position.x}% ${position.y}%`;
    }

    // 切换标签页
    switchTab(tabName) {
      console.log(`[Image Config Modal] 切换到标签页: ${tabName}`);

      this.currentTab = tabName;

      // 更新标签按钮状态
      const tabBtns = this.modalElement.querySelectorAll('.tab-btn');
      tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
      });

      // 更新标签内容显示
      const tabContents = this.modalElement.querySelectorAll('.tab-content');
      tabContents.forEach(content => {
        content.style.display = content.dataset.tab === tabName ? 'block' : 'none';
      });

      // 更新预览
      this.updatePreview();
    }

    // 更新预览效果
    updatePreview() {
      const config = this.currentConfig[this.currentTab];
      const previewElement = this.modalElement.querySelector(`#${this.currentTab}-preview`);

      if (!previewElement || !config.image) return;

      const transform = `rotate(${config.rotation}deg) scale(${config.scale})`;
      const backgroundPosition = this.formatBackgroundPosition(config.position);

      previewElement.style.backgroundImage = `url(${config.image})`;
      previewElement.style.backgroundPosition = backgroundPosition;
      previewElement.style.backgroundSize = 'cover';
      previewElement.style.backgroundRepeat = 'no-repeat';
      previewElement.style.transform = transform;

      // 更新控制器的值
      this.updateControlValues();

      // 更新URL输入框的值
      this.updateUrlInput();

      console.log(`[Image Config Modal] 更新${this.currentTab}预览:`, {
        image: config.image.substring(0, 50) + '...',
        position: backgroundPosition,
        transform,
      });
    }

    // 更新URL输入框的值
    updateUrlInput() {
      if (!this.modalElement) return;

      const config = this.currentConfig[this.currentTab];
      const urlInput = this.modalElement.querySelector(`[data-type="${this.currentTab}"].url-input`);

      if (urlInput && config.image && !config.image.startsWith('data:')) {
        urlInput.value = config.image;
      }
    }

    // 更新控制器显示值
    updateControlValues() {
      if (!this.modalElement) return;

      const config = this.currentConfig[this.currentTab];

      // 更新旋转滑块
      const rotationSlider = this.modalElement.querySelector(
        `[data-type="${this.currentTab}"][data-property="rotation"]`,
      );
      // 查找旋转滑块对应的值显示元素
      const rotationRow = rotationSlider?.closest('.control-row');
      const rotationValue = rotationRow?.querySelector('.control-value');
      if (rotationSlider && rotationValue) {
        rotationSlider.value = config.rotation;
        rotationValue.textContent = `${config.rotation}°`;
      }

      // 更新缩放滑块
      const scaleSlider = this.modalElement.querySelector(`[data-type="${this.currentTab}"][data-property="scale"]`);
      // 查找缩放滑块对应的值显示元素
      const scaleRow = scaleSlider?.closest('.control-row');
      const scaleValue = scaleRow?.querySelector('.control-value');
      if (scaleSlider && scaleValue) {
        scaleSlider.value = config.scale;
        scaleValue.textContent = `${config.scale.toFixed(1)}x`;
      }
    }

    // 绑定事件
    bindEvents() {
      if (!this.modalElement) return;

      // 关闭按钮
      const closeBtn = this.modalElement.querySelector('.modal-close-btn');
      closeBtn?.addEventListener('click', () => this.hide());

      // 背景点击关闭
      const backdrop = this.modalElement.querySelector('.modal-backdrop');
      backdrop?.addEventListener('click', () => this.hide());

      // 标签页切换
      const tabBtns = this.modalElement.querySelectorAll('.tab-btn');
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
      });

      // 文件上传
      this.bindFileUploadEvents();

      // URL输入
      this.bindUrlInputEvents();

      // 拖拽事件
      this.bindDragEvents();

      // 控制滑块
      this.bindControlEvents();

      // 保存按钮
      const saveBtn = this.modalElement.querySelector('.save-btn');
      saveBtn?.addEventListener('click', () => this.saveConfig());
    }

    // 绑定文件上传事件
    bindFileUploadEvents() {
      const fileInputs = this.modalElement.querySelectorAll('input[type="file"]');
      const uploadBtns = this.modalElement.querySelectorAll('.upload-btn');

      uploadBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const targetId = btn.dataset.target;
          const fileInput = document.getElementById(targetId);
          fileInput?.click();
        });
      });

      fileInputs.forEach(input => {
        input.addEventListener('change', e => this.handleFileUpload(e));
      });
    }

    // 绑定URL输入事件
    bindUrlInputEvents() {
      const urlInputs = this.modalElement.querySelectorAll('.url-input');
      urlInputs.forEach(input => {
        input.addEventListener('input', e => this.handleUrlInput(e));
        input.addEventListener('paste', e => {
          setTimeout(() => this.handleUrlInput(e), 10);
        });
      });
    }

    // 处理文件上传
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      console.log(`[Image Config Modal] 处理文件上传:`, file.name);

      try {
        // 尝试上传到Data Bank
        let imageUrl = '';
        if (window.styleConfigManager && typeof window.styleConfigManager.uploadImageToDataBank === 'function') {
          imageUrl = await window.styleConfigManager.uploadImageToDataBank(file);
        }

        // 如果上传失败，转换为Base64
        if (!imageUrl) {
          imageUrl = await this.fileToBase64(file);
        }

        // 更新配置
        this.currentConfig[this.currentTab].image = imageUrl;

        // 更新预览
        this.updatePreview();

        console.log(`[Image Config Modal] 文件上传成功`);
      } catch (error) {
        console.error('[Image Config Modal] 文件上传失败:', error);
        if (window.MobilePhone && window.MobilePhone.showToast) {
          window.MobilePhone.showToast('图片上传失败', 'error');
        }
      }
    }

    // 处理URL输入
    handleUrlInput(event) {
      const url = event.target.value.trim();
      const type = event.target.dataset.type;

      if (url && this.isValidImageUrl(url)) {
        console.log(`[Image Config Modal] 设置${type}图片URL:`, url);
        this.currentConfig[type].image = url;
        this.updatePreview();
      }
    }

    // 验证图片URL
    isValidImageUrl(url) {
      try {
        new URL(url);
        return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url) || url.startsWith('data:image/');
      } catch {
        return url.startsWith('data:image/');
      }
    }

    // 文件转Base64
    fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    // 绑定拖拽事件
    bindDragEvents() {
      const previewContainers = this.modalElement.querySelectorAll('.preview-container');

      previewContainers.forEach(container => {
        // 鼠标事件
        container.addEventListener('mousedown', e => this.startDrag(e, container));

        // 触摸事件
        container.addEventListener('touchstart', e => this.startDrag(e, container), { passive: false });

        // 防止默认的拖拽行为
        container.addEventListener('dragstart', e => e.preventDefault());
      });

      // 全局拖拽移动和结束事件（绑定到document确保在容器外也能响应）
      this.dragMoveHandler = e => this.handleDrag(e);
      this.dragEndHandler = () => this.endDrag();

      document.addEventListener('mousemove', this.dragMoveHandler);
      document.addEventListener('mouseup', this.dragEndHandler);
      document.addEventListener('touchmove', this.dragMoveHandler, { passive: false });
      document.addEventListener('touchend', this.dragEndHandler);
    }

    // 清理拖拽事件监听器
    cleanupDragEvents() {
      if (this.dragMoveHandler) {
        document.removeEventListener('mousemove', this.dragMoveHandler);
        document.removeEventListener('touchmove', this.dragMoveHandler);
      }
      if (this.dragEndHandler) {
        document.removeEventListener('mouseup', this.dragEndHandler);
        document.removeEventListener('touchend', this.dragEndHandler);
      }
    }

    // 开始拖拽
    startDrag(event, container) {
      event.preventDefault();

      this.isDragging = true;
      this.dragContainer = container;

      const rect = container.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;

      this.dragStartPos = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };

      this.dragStartImagePos = { ...this.currentConfig[this.currentTab].position };

      container.style.cursor = 'grabbing';
      console.log('[Image Config Modal] 开始拖拽');
    }

    // 处理拖拽
    handleDrag(event) {
      if (!this.isDragging || !this.dragContainer) return;

      event.preventDefault();

      const rect = this.dragContainer.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;

      // 计算当前鼠标在容器中的位置（百分比）
      const currentX = ((clientX - rect.left) / rect.width) * 100;
      const currentY = ((clientY - rect.top) / rect.height) * 100;

      // 计算拖拽开始时鼠标在容器中的位置（百分比）
      const startX = (this.dragStartPos.x / rect.width) * 100;
      const startY = (this.dragStartPos.y / rect.height) * 100;

      // 计算偏移量
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;

      // 更新图片位置（注意：拖拽方向与background-position相反）
      const newX = Math.max(0, Math.min(100, this.dragStartImagePos.x - deltaX));
      const newY = Math.max(0, Math.min(100, this.dragStartImagePos.y - deltaY));

      this.currentConfig[this.currentTab].position = { x: newX, y: newY };

      // 实时更新预览（仅更新位置，避免重复更新其他属性）
      const previewElement = this.modalElement.querySelector(`#${this.currentTab}-preview`);
      if (previewElement) {
        previewElement.style.backgroundPosition = this.formatBackgroundPosition({ x: newX, y: newY });
      }
    }

    // 结束拖拽
    endDrag() {
      if (this.isDragging) {
        this.isDragging = false;
        if (this.dragContainer) {
          this.dragContainer.style.cursor = 'grab';
          this.dragContainer = null;
        }
        console.log('[Image Config Modal] 结束拖拽');
      }
    }

    // 绑定控制事件
    bindControlEvents() {
      const sliders = this.modalElement.querySelectorAll('.control-slider');

      sliders.forEach(slider => {
        slider.addEventListener('input', e => this.handleControlChange(e));
      });
    }

    // 处理控制器变化
    handleControlChange(event) {
      const type = event.target.dataset.type;
      const property = event.target.dataset.property;
      const value = parseFloat(event.target.value);

      if (type && property) {
        this.currentConfig[type][property] = value;

        // 更新显示值
        const valueSpan = event.target.parentNode.querySelector('.control-value');
        if (valueSpan) {
          if (property === 'rotation') {
            valueSpan.textContent = `${value}°`;
          } else if (property === 'scale') {
            valueSpan.textContent = `${value.toFixed(1)}x`;
          }
        }

        // 更新预览
        this.updatePreview();

        console.log(`[Image Config Modal] 更新${type}的${property}:`, value);
      }
    }

    // 保存配置
    async saveConfig() {
      console.log('[Image Config Modal] 保存配置');

      if (!window.styleConfigManager || !window.styleConfigManager.isReady) {
        console.error('[Image Config Modal] StyleConfigManager未就绪');
        if (window.MobilePhone && window.MobilePhone.showToast) {
          window.MobilePhone.showToast('配置管理器未就绪', 'error');
        }
        return;
      }

      try {
        // 获取当前配置的副本
        const config = JSON.parse(JSON.stringify(window.styleConfigManager.currentConfig));

        // 更新用户头像配置
        if (this.currentConfig.avatar.image) {
          if (!config.messageSentAvatar) {
            config.messageSentAvatar = {
              backgroundImage: '',
              backgroundImageUrl: '',
              backgroundPosition: 'center center',
              rotation: '0',
              scale: '1',
              description: '发送消息头像背景',
            };
          }

          config.messageSentAvatar.backgroundImage = this.currentConfig.avatar.image.startsWith('data:')
            ? this.currentConfig.avatar.image
            : '';
          config.messageSentAvatar.backgroundImageUrl = !this.currentConfig.avatar.image.startsWith('data:')
            ? this.currentConfig.avatar.image
            : '';
          config.messageSentAvatar.backgroundPosition = this.formatBackgroundPosition(
            this.currentConfig.avatar.position,
          );
          config.messageSentAvatar.rotation = this.currentConfig.avatar.rotation.toString();
          config.messageSentAvatar.scale = this.currentConfig.avatar.scale.toString();
        }

        // 更新消息背景配置
        if (this.currentConfig.background.image) {
          if (!config.messagesApp) {
            config.messagesApp = {
              backgroundImage: '',
              backgroundImageUrl: '',
              backgroundPosition: 'center center',
              rotation: '0',
              scale: '1',
              description: '消息应用背景',
            };
          }

          config.messagesApp.backgroundImage = this.currentConfig.background.image.startsWith('data:')
            ? this.currentConfig.background.image
            : '';
          config.messagesApp.backgroundImageUrl = !this.currentConfig.background.image.startsWith('data:')
            ? this.currentConfig.background.image
            : '';
          config.messagesApp.backgroundPosition = this.formatBackgroundPosition(this.currentConfig.background.position);
          config.messagesApp.rotation = this.currentConfig.background.rotation.toString();
          config.messagesApp.scale = this.currentConfig.background.scale.toString();
        }

        // 更新StyleConfigManager的配置
        window.styleConfigManager.currentConfig = config;

        // 保存配置
        const success = await window.styleConfigManager.saveConfig();

        if (success) {
          console.log('[Image Config Modal] 配置保存成功');
          if (window.MobilePhone && window.MobilePhone.showToast) {
            window.MobilePhone.showToast('设置已保存', 'success');
          }
          this.hide();
        } else {
          throw new Error('保存失败');
        }
      } catch (error) {
        console.error('[Image Config Modal] 保存配置失败:', error);
        if (window.MobilePhone && window.MobilePhone.showToast) {
          window.MobilePhone.showToast('保存失败，请重试', 'error');
        }
      }
    }
  }

  // 创建全局实例
  window.ImageConfigModal = new ImageConfigModal();

  console.log('[Image Config Modal] 图片配置弹窗模块加载完成');
}
