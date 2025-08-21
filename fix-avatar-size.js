/**
 * 修复头像尺寸问题的脚本
 * 在浏览器控制台中运行此脚本来检查和修复52px问题
 */

console.log('🔧 开始修复头像尺寸问题...');

// 1. 检查当前配置
function checkCurrentConfig() {
  console.log('\n=== 检查当前配置 ===');
  
  if (!window.styleConfigManager) {
    console.error('❌ styleConfigManager未找到');
    return null;
  }

  const config = window.styleConfigManager.getConfig();
  console.log('📋 当前完整配置:', config);

  if (config.messageSentAvatar) {
    const scale = parseFloat(config.messageSentAvatar.scale || 1);
    console.log(`👤 用户头像scale值: ${scale}`);
    console.log(`📏 计算后的头像尺寸: ${40 * scale}px`);
    
    if (Math.abs(40 * scale - 52) < 1) {
      console.warn(`⚠️ 发现问题：scale值为${scale}，导致头像被放大到${40 * scale}px ≈ 52px`);
      return { scale, needsFix: true };
    }
  }

  return { scale: config.messageSentAvatar?.scale || 1, needsFix: false };
}

// 2. 修复scale配置
async function fixAvatarScale() {
  console.log('\n=== 修复头像scale配置 ===');
  
  try {
    if (!window.styleConfigManager) {
      throw new Error('styleConfigManager未找到');
    }

    const config = window.styleConfigManager.getConfig();
    
    // 修复用户头像scale
    if (config.messageSentAvatar) {
      const oldScale = config.messageSentAvatar.scale;
      config.messageSentAvatar.scale = '1'; // 重置为1
      console.log(`✅ 用户头像scale: ${oldScale} → 1`);
    }

    // 修复好友头像scale
    if (config.messageReceivedAvatars && Array.isArray(config.messageReceivedAvatars)) {
      config.messageReceivedAvatars.forEach((avatar, index) => {
        if (avatar.scale && parseFloat(avatar.scale) !== 1) {
          const oldScale = avatar.scale;
          avatar.scale = '1';
          console.log(`✅ 好友头像${index + 1} scale: ${oldScale} → 1`);
        }
      });
    }

    // 保存配置
    window.styleConfigManager.currentConfig = config;
    await window.styleConfigManager.saveConfig();
    
    // 重新应用样式
    window.styleConfigManager.applyStyles();
    
    console.log('✅ 头像scale配置修复完成！');
    console.log('🔄 请刷新页面查看效果');
    
    return true;
  } catch (error) {
    console.error('❌ 修复失败:', error);
    return false;
  }
}

// 3. 检查DOM中的头像尺寸
function checkDOMSizes() {
  console.log('\n=== 检查DOM中的头像尺寸 ===');
  
  const avatars = document.querySelectorAll('.message-avatar');
  console.log(`📊 找到${avatars.length}个头像元素`);

  avatars.forEach((avatar, index) => {
    const rect = avatar.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(avatar);
    
    console.log(`头像${index + 1}:`, {
      '显示尺寸': `${Math.round(rect.width)}x${Math.round(rect.height)}px`,
      'CSS尺寸': `${computedStyle.width} x ${computedStyle.height}`,
      'transform': computedStyle.transform,
      '类名': avatar.className,
      '父元素': avatar.parentElement?.className
    });

    // 检查是否为52px
    if (Math.abs(rect.width - 52) < 1 || Math.abs(rect.height - 52) < 1) {
      console.warn(`⚠️ 发现52px头像: 头像${index + 1}`);
    }
  });
}

// 4. 主要修复函数
async function fixAvatarSizeIssue() {
  console.log('🚀 开始头像尺寸修复流程...');
  
  // 检查配置
  const configCheck = checkCurrentConfig();
  
  // 检查DOM
  checkDOMSizes();
  
  // 如果需要修复
  if (configCheck && configCheck.needsFix) {
    console.log('\n🔧 检测到需要修复，开始修复...');
    const success = await fixAvatarScale();
    
    if (success) {
      console.log('\n✅ 修复完成！建议刷新页面查看效果。');
    } else {
      console.log('\n❌ 修复失败，请检查控制台错误信息。');
    }
  } else {
    console.log('\n✅ 配置正常，无需修复。');
    console.log('💡 如果头像仍显示为52px，可能是CSS缓存问题，请尝试刷新页面。');
  }
}

// 5. 强制重置所有头像尺寸的CSS
function forceResetAvatarCSS() {
  console.log('\n🔧 强制重置头像CSS...');
  
  // 移除所有相关的动态样式
  const styleElements = document.querySelectorAll('style[id*="avatar"], style[id*="mobile"]');
  styleElements.forEach(style => {
    if (style.textContent.includes('message-avatar')) {
      console.log(`🗑️ 移除样式: ${style.id}`);
      style.remove();
    }
  });

  // 添加强制40px的CSS
  const forceCSS = `
    /* 强制头像尺寸为40px - 紧急修复 */
    .message-avatar {
      width: 40px !important;
      height: 40px !important;
      min-width: 40px !important;
      max-width: 40px !important;
      min-height: 40px !important;
      max-height: 40px !important;
      transform: none !important;
    }
    
    .message-sent > .message-avatar,
    .message-received > .message-avatar {
      width: 40px !important;
      height: 40px !important;
      min-width: 40px !important;
      max-width: 40px !important;
      min-height: 40px !important;
      max-height: 40px !important;
      transform: none !important;
    }
  `;

  const style = document.createElement('style');
  style.id = 'force-avatar-size-fix';
  style.textContent = forceCSS;
  document.head.appendChild(style);

  console.log('✅ 强制CSS已应用');
  console.log('🔄 请检查头像尺寸是否已修复为40px');
}

// 导出函数供控制台使用
window.debugAvatarSize = {
  check: checkCurrentConfig,
  checkDOM: checkDOMSizes,
  fix: fixAvatarSizeIssue,
  forceReset: forceResetAvatarCSS
};

console.log('\n📖 使用说明:');
console.log('1. 运行 debugAvatarSize.check() 检查配置');
console.log('2. 运行 debugAvatarSize.checkDOM() 检查DOM尺寸');
console.log('3. 运行 debugAvatarSize.fix() 自动修复');
console.log('4. 运行 debugAvatarSize.forceReset() 强制重置CSS');

// 自动运行检查
fixAvatarSizeIssue();
