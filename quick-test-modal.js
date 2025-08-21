/**
 * 快速测试好友弹窗的脚本
 * 在浏览器控制台中运行
 */

// 快速测试函数
async function quickTestModal() {
  console.log('🧪 快速测试好友图片配置弹窗...');
  
  try {
    // 1. 检查文件是否存在
    console.log('\n=== 检查文件是否存在 ===');
    
    const files = [
      '/scripts/extensions/third-party/mobile/app/friend-image-config-modal.html',
      '/scripts/extensions/third-party/mobile/app/friend-image-config-modal.css',
      '/scripts/extensions/third-party/mobile/app/friend-image-config-modal.js'
    ];
    
    for (const file of files) {
      try {
        const response = await fetch(file);
        if (response.ok) {
          console.log(`✅ ${file} - 存在`);
        } else {
          console.warn(`⚠️ ${file} - HTTP ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ ${file} - 无法访问:`, error.message);
      }
    }

    // 2. 手动加载模块
    console.log('\n=== 手动加载模块 ===');
    
    if (!window.friendImageConfigModal) {
      console.log('⏳ 加载JavaScript模块...');
      
      const script = document.createElement('script');
      script.src = '/scripts/extensions/third-party/mobile/app/friend-image-config-modal.js';
      document.head.appendChild(script);
      
      await new Promise((resolve, reject) => {
        script.onload = () => {
          console.log('✅ JavaScript加载完成');
          setTimeout(resolve, 200); // 等待初始化
        };
        script.onerror = reject;
        setTimeout(() => reject(new Error('超时')), 5000);
      });
    }

    // 3. 测试弹窗功能
    console.log('\n=== 测试弹窗功能 ===');
    
    if (window.friendImageConfigModal) {
      console.log('✅ 模块实例存在');
      
      // 测试打开弹窗
      await window.friendImageConfigModal.open('test123', '测试好友', 'test-bg-123');
      
      // 检查弹窗是否显示
      const modal = document.getElementById('friend-image-config-modal');
      if (modal) {
        console.log('✅ 弹窗元素已创建');
        console.log(`📊 弹窗显示状态: ${modal.style.display}`);
        
        // 检查关键子元素
        const title = document.getElementById('friend-modal-title');
        if (title) {
          console.log(`✅ 标题元素存在: "${title.textContent}"`);
        }
        
        const tabs = modal.querySelectorAll('.tab-btn');
        console.log(`✅ 找到${tabs.length}个标签页按钮`);
        
        const saveBtn = document.getElementById('friend-config-save');
        if (saveBtn) {
          console.log('✅ 保存按钮存在');
        }
        
      } else {
        console.error('❌ 弹窗元素未创建');
      }
    } else {
      console.error('❌ 模块实例不存在');
    }

    console.log('\n🎉 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
  }
}

// 检查相片按键
function checkPhotoButton() {
  console.log('\n=== 检查相片按键 ===');
  
  const headerBtns = document.querySelectorAll('.app-header-btn');
  console.log(`📊 找到${headerBtns.length}个header按钮`);
  
  let photoBtn = null;
  headerBtns.forEach((btn, index) => {
    const icon = btn.querySelector('i.fa-image');
    if (icon) {
      photoBtn = btn;
      console.log(`✅ 找到相片按键: 按钮${index + 1}`);
      console.log(`📍 按键位置: ${btn.title || '无标题'}`);
    }
  });
  
  if (photoBtn) {
    console.log('🧪 测试点击相片按键...');
    photoBtn.click();
  } else {
    console.warn('⚠️ 未找到相片按键');
    console.log('💡 提示: 请确保在好友聊天详情页中');
  }
}

// 强制创建弹窗HTML（用于调试）
function createModalHTML() {
  console.log('\n=== 强制创建弹窗HTML ===');
  
  const modalHTML = `
    <div id="friend-image-config-modal" class="friend-image-config-modal" style="display: none;">
      <div class="modal-overlay"></div>
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title" id="friend-modal-title">好友设置</h2>
          <button class="modal-close-btn" id="friend-modal-close">×</button>
        </div>
        <div class="modal-tabs">
          <button class="tab-btn active" data-tab="avatar">角色头像</button>
          <button class="tab-btn" data-tab="background">聊天背景</button>
        </div>
        <div class="modal-body">
          <div class="tab-content active" id="avatar-tab">
            <div class="preview-section">
              <div class="preview-container">
                <div class="avatar-preview" id="friend-avatar-preview">
                  <div class="avatar-display" id="friend-avatar-display"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="tab-content" id="background-tab">
            <div class="preview-section">
              <div class="preview-container">
                <div class="background-preview" id="friend-background-preview">
                  <div class="background-display" id="friend-background-display"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="save-btn" id="friend-config-save">保存</button>
        </div>
      </div>
    </div>
  `;
  
  // 添加到手机容器
  const phoneFrame = document.querySelector('.mobile-phone-frame') || document.body;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = modalHTML;
  phoneFrame.appendChild(tempDiv.firstElementChild);
  
  console.log('✅ 弹窗HTML已创建');
  
  // 显示弹窗
  const modal = document.getElementById('friend-image-config-modal');
  if (modal) {
    modal.style.display = 'flex';
    console.log('✅ 弹窗已显示');
  }
}

// 导出函数
window.quickTest = {
  modal: quickTestModal,
  button: checkPhotoButton,
  createHTML: createModalHTML
};

console.log('\n📖 快速测试说明:');
console.log('1. 运行 quickTest.modal() 测试完整功能');
console.log('2. 运行 quickTest.button() 检查相片按键');
console.log('3. 运行 quickTest.createHTML() 强制创建弹窗HTML');

// 自动运行快速测试
quickTestModal();
