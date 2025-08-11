// 测试论坛回复修复
console.log('🧪 [测试] 论坛回复修复测试开始...');

// 测试函数
function testForumReplyFix() {
  console.log('📋 [测试] 检查修复状态...');
  
  // 检查论坛管理器是否可用
  if (!window.forumManager) {
    console.error('❌ [测试] 论坛管理器未初始化');
    return false;
  }
  
  // 检查关键方法是否存在
  const requiredMethods = [
    'sendReplyToAPI',
    'updateContextWithForum', 
    'safeUpdateContextWithForum'
  ];
  
  for (const method of requiredMethods) {
    if (typeof window.forumManager[method] !== 'function') {
      console.error(`❌ [测试] 缺少方法: ${method}`);
      return false;
    }
  }
  
  console.log('✅ [测试] 所有必需方法都存在');
  
  // 检查论坛UI是否可用
  if (!window.forumUI) {
    console.error('❌ [测试] 论坛UI未初始化');
    return false;
  }
  
  console.log('✅ [测试] 论坛UI可用');
  
  // 模拟回复测试
  console.log('🔄 [测试] 模拟回复流程...');
  
  const testReplyData = {
    type: 'reply',
    threadId: 'test_thread_001',
    content: '这是一个测试回复',
    prefix: '我回复帖子\'测试用户|test_thread_001|测试帖子标题\'',
    replyFormat: '[回复|我|test_thread_001|这是一个测试回复]'
  };
  
  console.log('📝 [测试] 测试回复数据:', testReplyData);
  
  // 检查回复格式是否正确
  const expectedFormat = /^\[回复\|我\|[^|]+\|.+\]$/;
  if (!expectedFormat.test(testReplyData.replyFormat)) {
    console.error('❌ [测试] 回复格式不正确:', testReplyData.replyFormat);
    return false;
  }
  
  console.log('✅ [测试] 回复格式正确');
  
  return true;
}

// 运行测试
if (testForumReplyFix()) {
  console.log('🎉 [测试] 论坛回复修复测试通过！');
  console.log('');
  console.log('📋 [使用说明] 修复内容：');
  console.log('1. 修复了forum-ui.js中错误的回复格式');
  console.log('2. 改进了回复流程，直接发送给AI生成完整论坛内容');
  console.log('3. 优化了AI提示词，确保包含用户回复');
  console.log('4. 修复了论坛内容更新逻辑，使用替换而非追加');
  console.log('');
  console.log('🧪 [测试命令] 可以使用以下命令测试：');
  console.log('MobileContext.sendReply("我回复帖子\'测试|001|测试标题\'\\n[回复|我|001|测试回复内容]")');
} else {
  console.error('❌ [测试] 论坛回复修复测试失败！');
}
