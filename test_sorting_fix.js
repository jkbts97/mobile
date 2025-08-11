// 简单的排序功能测试
console.log('🧪 [排序测试] 开始测试论坛排序功能...');

// 立即定义测试函数到全局作用域
window.testForumSorting = function() {
  console.log('📋 [排序测试] 检查论坛排序功能...');
  
  if (!window.forumManager || typeof window.forumManager.buildForumContent !== 'function') {
    console.log('❌ [排序测试] buildForumContent方法不存在');
    return false;
  }
  
  // 创建测试数据
  const testThreads = new Map();
  const testReplies = new Map();
  
  // 添加旧帖子（基础时间：2024-01-01 10:00:00）
  const oldThread = {
    id: 'old_001',
    author: '老用户',
    title: '旧帖子',
    content: '这是一个旧帖子',
    timestamp: '2024-01-01 10:00:00',
    latestActivityTime: new Date('2024-01-01 10:00:00')
  };
  testThreads.set('old_001', oldThread);
  
  // 添加新帖子（当前时间）
  const currentTime = new Date();
  const newThread = {
    id: 'new_001',
    author: '新用户',
    title: '新帖子',
    content: '这是一个新帖子',
    timestamp: currentTime.toLocaleString(),
    latestActivityTime: currentTime
  };
  testThreads.set('new_001', newThread);
  
  // 为旧帖子添加新回复（比新帖子更新的时间）
  const veryNewTime = new Date(currentTime.getTime() + 60000); // 比新帖子晚1分钟
  const newReply = {
    id: 'reply_001',
    author: '回复用户',
    content: '这是新回复',
    timestamp: veryNewTime.toLocaleString(),
    type: 'reply'
  };
  
  // 更新旧帖子的最新活动时间
  oldThread.latestActivityTime = veryNewTime;
  
  testReplies.set('old_001', [newReply]);
  testReplies.set('new_001', []);
  
  try {
    const result = window.forumManager.buildForumContent(testThreads, testReplies);
    console.log('📊 [排序测试] 构建的论坛内容:');
    console.log(result);
    
    // 检查排序是否正确（有新回复的旧帖子应该在前面）
    const lines = result.split('\n').filter(line => line.trim() !== '');
    const firstThreadLine = lines.find(line => line.includes('[标题|'));
    
    console.log('🔍 [排序测试] 第一个帖子行:', firstThreadLine);
    
    if (firstThreadLine && firstThreadLine.includes('old_001')) {
      console.log('✅ [排序测试] 排序正确：有新回复的旧帖子排在前面');
      return true;
    } else if (firstThreadLine && firstThreadLine.includes('new_001')) {
      console.log('❌ [排序测试] 排序错误：新帖子排在前面，但旧帖子有更新的回复');
      console.log('📊 [排序测试] 旧帖子最新活动时间:', oldThread.latestActivityTime);
      console.log('📊 [排序测试] 新帖子最新活动时间:', newThread.latestActivityTime);
      return false;
    } else {
      console.log('❌ [排序测试] 无法确定排序结果');
      return false;
    }
  } catch (error) {
    console.error('❌ [排序测试] 构建论坛内容失败:', error);
    return false;
  }
};

// 测试解析功能
window.testParseContent = function() {
  console.log('📋 [解析测试] 检查内容解析功能...');
  
  if (!window.forumManager || typeof window.forumManager.parseForumContent !== 'function') {
    console.log('❌ [解析测试] parseForumContent方法不存在');
    return false;
  }
  
  const testContent = `[标题|用户1|thread1|第一个帖子|这是第一个帖子的内容]

[回复|用户2|thread1|这是对第一个帖子的回复]

[标题|用户3|thread2|第二个帖子|这是第二个帖子的内容]

[回复|用户4|thread2|这是对第二个帖子的回复]
[回复|用户5|thread1|这是对第一个帖子的另一个回复]`;
  
  try {
    const parsed = window.forumManager.parseForumContent(testContent);
    console.log('📊 [解析测试] 解析结果:', parsed);
    
    // 检查解析结果
    const hasThreads = parsed.threads.length === 2;
    const hasReplies = parsed.replies['thread1'] && parsed.replies['thread1'].length === 2;
    const hasTimestamps = parsed.threads.every(t => t.timestamp && t.latestActivityTime);
    
    console.log(`📊 [解析测试] 帖子数量: ${parsed.threads.length}`);
    console.log(`📊 [解析测试] thread1回复数量: ${parsed.replies['thread1'] ? parsed.replies['thread1'].length : 0}`);
    console.log(`📊 [解析测试] 时间戳检查: ${hasTimestamps}`);
    
    if (hasThreads && hasReplies && hasTimestamps) {
      console.log('✅ [解析测试] 内容解析正确');
      
      // 检查最新活动时间是否正确更新
      const thread1 = parsed.threads.find(t => t.id === 'thread1');
      const thread2 = parsed.threads.find(t => t.id === 'thread2');
      
      if (thread1 && thread2) {
        console.log(`📊 [解析测试] thread1最新活动时间: ${thread1.latestActivityTime}`);
        console.log(`📊 [解析测试] thread2最新活动时间: ${thread2.latestActivityTime}`);
        
        // thread1有2个回复，thread2有1个回复，所以thread1的最新活动时间应该更晚
        if (thread1.latestActivityTime > thread2.latestActivityTime) {
          console.log('✅ [解析测试] 最新活动时间计算正确');
          return true;
        } else {
          console.log('❌ [解析测试] 最新活动时间计算错误');
          return false;
        }
      }
      
      return true;
    } else {
      console.log('❌ [解析测试] 内容解析有问题');
      return false;
    }
  } catch (error) {
    console.error('❌ [解析测试] 解析内容失败:', error);
    return false;
  }
};

// 测试UI排序
window.testUISorting = function() {
  console.log('📋 [UI测试] 检查UI排序功能...');
  
  if (!window.forumUI) {
    console.log('❌ [UI测试] forumUI不存在');
    return false;
  }
  
  // 模拟论坛数据
  const oldTime = new Date('2024-01-01 10:00:00');
  const newTime = new Date();
  
  const mockForumData = {
    threads: [
      {
        id: 'thread1',
        title: '旧帖子',
        author: '用户1',
        content: '旧内容',
        timestamp: oldTime.toLocaleString(),
        replies: [
          {
            timestamp: newTime.toLocaleString(), // 新回复
            author: '回复者',
            content: '新回复'
          }
        ]
      },
      {
        id: 'thread2',
        title: '新帖子',
        author: '用户2',
        content: '新内容',
        timestamp: newTime.toLocaleString(),
        replies: []
      }
    ]
  };
  
  // 临时替换getCurrentForumData方法
  const originalMethod = window.forumUI.getCurrentForumData;
  window.forumUI.getCurrentForumData = () => mockForumData;
  
  try {
    const html = window.forumUI.getThreadListHTML();
    console.log('📊 [UI测试] 生成的HTML长度:', html.length);
    
    // 检查HTML中帖子的顺序
    const thread1Index = html.indexOf('thread1');
    const thread2Index = html.indexOf('thread2');
    
    console.log(`📊 [UI测试] thread1位置: ${thread1Index}, thread2位置: ${thread2Index}`);
    
    if (thread1Index < thread2Index && thread1Index !== -1 && thread2Index !== -1) {
      console.log('✅ [UI测试] UI排序正确：有新回复的旧帖子排在前面');
      return true;
    } else {
      console.log('❌ [UI测试] UI排序可能有问题');
      return false;
    }
  } catch (error) {
    console.error('❌ [UI测试] UI排序测试失败:', error);
    return false;
  } finally {
    // 恢复原方法
    window.forumUI.getCurrentForumData = originalMethod;
  }
};

// 运行测试
console.log('🚀 [排序测试] 测试函数已定义，可以使用以下命令：');
console.log('  - testForumSorting() // 测试后端排序');
console.log('  - testParseContent() // 测试内容解析');
console.log('  - testUISorting() // 测试UI排序');
console.log('');

// 延迟自动运行测试
setTimeout(() => {
  console.log('🔄 [排序测试] 自动运行测试...');
  const result1 = window.testForumSorting();
  console.log('');
  const result2 = window.testParseContent();
  console.log('');
  const result3 = window.testUISorting();
  console.log('');
  
  if (result1 && result2 && result3) {
    console.log('🎉 [排序测试] 所有测试通过！排序功能正常工作！');
  } else {
    console.log('❌ [排序测试] 部分测试失败，需要进一步调试');
  }
}, 2000);
