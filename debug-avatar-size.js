// 调试头像尺寸问题的脚本
// 在浏览器控制台中运行此脚本来检查当前配置

console.log('=== 头像尺寸调试信息 ===');

// 1. 检查当前配置
if (window.styleConfigManager) {
  const config = window.styleConfigManager.getConfig();
  console.log('当前用户头像配置:', config.messageSentAvatar);
  
  if (config.messageSentAvatar && config.messageSentAvatar.scale) {
    const scale = parseFloat(config.messageSentAvatar.scale);
    console.log(`用户头像scale值: ${scale}`);
    console.log(`计算后的头像尺寸: ${40 * scale}px`);
    
    if (scale > 1) {
      console.warn(`⚠️ 发现问题：scale值为${scale}，导致头像被放大到${40 * scale}px`);
    }
  }
} else {
  console.log('styleConfigManager未找到');
}

// 2. 检查DOM中的头像元素
const avatars = document.querySelectorAll('.message-avatar');
console.log(`找到${avatars.length}个头像元素`);

avatars.forEach((avatar, index) => {
  const rect = avatar.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(avatar);
  console.log(`头像${index + 1}:`, {
    width: rect.width,
    height: rect.height,
    cssWidth: computedStyle.width,
    cssHeight: computedStyle.height,
    transform: computedStyle.transform
  });
});

// 3. 检查是否有动态生成的CSS
const styleElements = document.querySelectorAll('style[id*="avatar"], style[id*="mobile"]');
console.log(`找到${styleElements.length}个相关样式元素`);

styleElements.forEach((style, index) => {
  if (style.textContent.includes('message-avatar') || style.textContent.includes('scale')) {
    console.log(`样式${index + 1} (${style.id}):`, style.textContent);
  }
});

console.log('=== 调试信息结束 ===');
