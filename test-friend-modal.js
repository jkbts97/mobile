/**
 * 测试好友图片配置弹窗的脚本
 * 在浏览器控制台中运行此脚本来测试弹窗功能
 */

console.log('🧪 开始测试好友图片配置弹窗...');

// 测试函数
async function testFriendModal() {
  try {
    console.log('\n=== 步骤1: 检查模块是否已加载 ===');
    
    if (window.friendImageConfigModal) {
      console.log('✅ 好友图片配置模块已存在');
    } else {
      console.log('⏳ 模块未加载，尝试手动加载...');
      
      // 手动加载模块
      const script = document.createElement('script');
      script.src = '/scripts/extensions/third-party/mobile/app/friend-image-config-modal.js';
      document.head.appendChild(script);
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        setTimeout(() => reject(new Error('加载超时')), 5000);
      });
      
      console.log('✅ 模块加载完成');
    }

    console.log('\n=== 步骤2: 测试弹窗打开 ===');
    
    // 测试打开弹窗
    await window.friendImageConfigModal.open('test123', '测试好友', 'test-bg-123');
    
    console.log('✅ 弹窗打开成功');
    
    // 检查弹窗是否可见
    const modal = document.getElementById('friend-image-config-modal');
    if (modal && modal.style.display !== 'none') {
      console.log('✅ 弹窗已显示');
    } else {
      console.warn('⚠️ 弹窗未显示');
    }

    console.log('\n=== 步骤3: 检查弹窗元素 ===');
    
    // 检查关键元素
    const elements = {
      '弹窗容器': document.getElementById('friend-image-config-modal'),
      '标题': document.getElementById('friend-modal-title'),
      '关闭按钮': document.getElementById('friend-modal-close'),
      '头像标签': document.querySelector('[data-tab="avatar"]'),
      '背景标签': document.querySelector('[data-tab="background"]'),
      '保存按钮': document.getElementById('friend-config-save')
    };

    Object.entries(elements).forEach(([name, element]) => {
      if (element) {
        console.log(`✅ ${name}: 存在`);
      } else {
        console.warn(`⚠️ ${name}: 缺失`);
      }
    });

    return true;
  } catch (error) {
    console.error('❌ 测试失败:', error);
    return false;
  }
}

// 测试相片按键是否存在
function testPhotoButton() {
  console.log('\n=== 检查相片按键 ===');
  
  const photoButtons = document.querySelectorAll('.app-header-btn');
  console.log(`📊 找到${photoButtons.length}个header按钮`);
  
  let photoButtonFound = false;
  photoButtons.forEach((btn, index) => {
    const icon = btn.querySelector('i');
    if (icon && icon.classList.contains('fa-image')) {
      console.log(`✅ 找到相片按键: 按钮${index + 1}`);
      photoButtonFound = true;
    }
  });
  
  if (!photoButtonFound) {
    console.warn('⚠️ 未找到相片按键，可能需要进入聊天详情页');
  }
  
  return photoButtonFound;
}

// 检查当前页面状态
function checkCurrentPage() {
  console.log('\n=== 检查当前页面状态 ===');
  
  const appHeader = document.getElementById('app-header');
  if (appHeader) {
    const view = appHeader.getAttribute('data-view');
    const app = appHeader.getAttribute('data-app');
    console.log(`📱 当前页面: ${app} - ${view}`);
    
    if (app === 'messages' && view === 'messageDetail') {
      console.log('✅ 当前在聊天详情页，相片按键应该可见');
      return true;
    } else {
      console.log('ℹ️ 不在聊天详情页，需要进入好友聊天才能看到相片按键');
      return false;
    }
  } else {
    console.log('⚠️ 未找到app-header元素');
    return false;
  }
}

// 主测试函数
async function runAllTests() {
  console.log('🚀 开始完整测试流程...');
  
  // 1. 检查页面状态
  const isDetailPage = checkCurrentPage();
  
  // 2. 检查相片按键
  const hasPhotoButton = testPhotoButton();
  
  // 3. 测试弹窗功能
  const modalWorks = await testFriendModal();
  
  console.log('\n=== 测试结果总结 ===');
  console.log(`📱 聊天详情页: ${isDetailPage ? '✅' : '❌'}`);
  console.log(`🖼️ 相片按键: ${hasPhotoButton ? '✅' : '❌'}`);
  console.log(`🪟 弹窗功能: ${modalWorks ? '✅' : '❌'}`);
  
  if (isDetailPage && hasPhotoButton && modalWorks) {
    console.log('\n🎉 所有测试通过！好友图片配置弹窗工作正常。');
  } else {
    console.log('\n⚠️ 部分测试失败，请检查上述问题。');
  }
}

// 导出测试函数
window.testFriendModal = {
  runAll: runAllTests,
  testModal: testFriendModal,
  testButton: testPhotoButton,
  checkPage: checkCurrentPage
};

console.log('\n📖 测试说明:');
console.log('1. 运行 testFriendModal.runAll() 进行完整测试');
console.log('2. 运行 testFriendModal.testModal() 只测试弹窗');
console.log('3. 运行 testFriendModal.testButton() 只检查按键');
console.log('4. 运行 testFriendModal.checkPage() 只检查页面状态');

// 自动运行测试
runAllTests();
