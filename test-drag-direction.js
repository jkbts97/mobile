// 拖拽方向测试工具

function testDragDirection() {
  console.log('=== 拖拽方向测试 ===');
  
  const friendModal = document.querySelector('.friend-image-config-modal');
  if (!friendModal) {
    console.warn('⚠️ 请先打开好友弹窗');
    return;
  }
  
  const previewImage = friendModal.querySelector('#avatar-preview');
  if (!previewImage) {
    console.warn('⚠️ 请切换到头像设置标签');
    return;
  }
  
  // 获取当前位置
  const currentStyle = window.getComputedStyle(previewImage);
  const currentPosition = currentStyle.backgroundPosition;
  console.log('📍 当前背景位置:', currentPosition);
  
  // 解析当前位置
  const [currentX, currentY] = currentPosition.split(' ').map(v => parseFloat(v));
  console.log('📍 解析后位置:', { x: currentX, y: currentY });
  
  // 提供测试函数
  window.testMove = function(direction) {
    if (!window.FriendImageConfigModal || !window.FriendImageConfigModal.currentConfig) {
      console.error('❌ FriendImageConfigModal 不可用');
      return;
    }
    
    const currentPos = window.FriendImageConfigModal.currentConfig.avatar.position;
    let newX = currentPos.x;
    let newY = currentPos.y;
    
    const step = 10; // 移动10%
    
    switch(direction) {
      case 'right':
        newX = Math.max(0, Math.min(100, currentPos.x - step)); // 向右拖拽 = X值减小
        console.log('🔄 向右移动: X值从', currentPos.x, '变为', newX);
        break;
      case 'left':
        newX = Math.max(0, Math.min(100, currentPos.x + step)); // 向左拖拽 = X值增大
        console.log('🔄 向左移动: X值从', currentPos.x, '变为', newX);
        break;
      case 'down':
        newY = Math.max(0, Math.min(100, currentPos.y - step)); // 向下拖拽 = Y值减小
        console.log('🔄 向下移动: Y值从', currentPos.y, '变为', newY);
        break;
      case 'up':
        newY = Math.max(0, Math.min(100, currentPos.y + step)); // 向上拖拽 = Y值增大
        console.log('🔄 向上移动: Y值从', currentPos.y, '变为', newY);
        break;
    }
    
    // 更新配置和预览
    window.FriendImageConfigModal.currentConfig.avatar.position = { x: newX, y: newY };
    previewImage.style.backgroundPosition = `${newX}% ${newY}%`;
    
    console.log('✅ 新位置:', { x: newX, y: newY });
  };
  
  console.log('🧪 测试命令:');
  console.log('  testMove("right") - 测试向右移动');
  console.log('  testMove("left")  - 测试向左移动');
  console.log('  testMove("down")  - 测试向下移动');
  console.log('  testMove("up")    - 测试向上移动');
  console.log('');
  console.log('💡 预期效果:');
  console.log('  向右移动 → 应该看到图片的更右边部分');
  console.log('  向左移动 → 应该看到图片的更左边部分');
  console.log('  向下移动 → 应该看到图片的更下边部分');
  console.log('  向上移动 → 应该看到图片的更上边部分');
}

function explainBackgroundPosition() {
  console.log('=== background-position 原理解释 ===');
  console.log('');
  console.log('🎯 background-position 的工作原理:');
  console.log('  background-position: 0% 0%   → 图片左上角对齐容器左上角');
  console.log('  background-position: 100% 0% → 图片右上角对齐容器右上角');
  console.log('  background-position: 0% 100% → 图片左下角对齐容器左下角');
  console.log('  background-position: 50% 50% → 图片中心对齐容器中心');
  console.log('');
  console.log('🔄 拖拽逻辑:');
  console.log('  向右拖拽 → 想看图片右边 → 需要图片向左移 → X值减小');
  console.log('  向左拖拽 → 想看图片左边 → 需要图片向右移 → X值增大');
  console.log('  向下拖拽 → 想看图片下边 → 需要图片向上移 → Y值减小');
  console.log('  向上拖拽 → 想看图片上边 → 需要图片向下移 → Y值增大');
  console.log('');
  console.log('📐 数学关系:');
  console.log('  拖拽方向 = -background-position变化方向');
  console.log('  这就是为什么要用减法: newX = oldX - deltaX');
}

// 自动运行
console.log('🔧 拖拽方向测试工具已加载！');
console.log('');
console.log('📋 使用步骤:');
console.log('1. 打开好友弹窗，切换到头像设置');
console.log('2. 上传一张有明显方向性的图片');
console.log('3. 运行 testDragDirection() 开始测试');
console.log('4. 运行 explainBackgroundPosition() 了解原理');
console.log('');
explainBackgroundPosition();
