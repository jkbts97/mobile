// 测试论坛改进功能
console.log('🧪 [测试] 论坛改进功能测试开始...');

// 测试1: 检查生成按钮提示功能
function testGenerateButtonToast() {
  console.log('📋 [测试] 检查生成按钮提示功能...');
  
  // 检查showMobileToast函数是否存在
  if (typeof window.showMobileToast === 'function') {
    console.log('✅ [测试] showMobileToast函数存在');
    
    // 模拟测试提示
    try {
      window.showMobileToast('🧪 测试提示功能', 'info');
      console.log('✅ [测试] 提示功能正常工作');
      return true;
    } catch (error) {
      console.error('❌ [测试] 提示功能出错:', error);
      return false;
    }
  } else {
    console.log('❌ [测试] showMobileToast函数不存在');
    return false;
  }
}

// 测试2: 检查论坛排序功能
function testForumSorting() {
  console.log('📋 [测试] 检查论坛排序功能...');
  
  if (!window.forumManager || typeof window.forumManager.buildForumContent !== 'function') {
    console.log('❌ [测试] buildForumContent方法不存在');
    return false;
  }
  
  // 创建测试数据
  const testThreads = new Map();
  const testReplies = new Map();
  
  // 添加旧帖子
  const oldThread = {
    id: 'old_001',
    author: '老用户',
    title: '旧帖子',
    content: '这是一个旧帖子',
    timestamp: '2024-01-01 10:00:00'
  };
  testThreads.set('old_001', oldThread);
  testReplies.set('old_001', []);
  
  // 添加新帖子
  const newThread = {
    id: 'new_001',
    author: '新用户',
    title: '新帖子',
    content: '这是一个新帖子',
    timestamp: new Date().toLocaleString()
  };
  testThreads.set('new_001', newThread);
  testReplies.set('new_001', []);
  
  // 为旧帖子添加新回复
  const newReply = {
    id: 'reply_001',
    author: '回复用户',
    content: '这是新回复',
    timestamp: new Date().toLocaleString(),
    type: 'reply'
  };
  testReplies.set('old_001', [newReply]);
  
  try {
    const result = window.forumManager.buildForumContent(testThreads, testReplies);
    console.log('📊 [测试] 构建的论坛内容:');
    console.log(result);
    
    // 检查排序是否正确（有新回复的旧帖子应该在前面）
    const lines = result.split('\n');
    const firstThreadLine = lines.find(line => line.includes('[标题|'));
    
    if (firstThreadLine && firstThreadLine.includes('old_001')) {
      console.log('✅ [测试] 排序正确：有新回复的旧帖子排在前面');
      return true;
    } else if (firstThreadLine && firstThreadLine.includes('new_001')) {
      console.log('⚠️ [测试] 排序可能有问题：新帖子排在前面，但旧帖子有新回复');
      return false;
    } else {
      console.log('❌ [测试] 无法确定排序结果');
      return false;
    }
  } catch (error) {
    console.error('❌ [测试] 构建论坛内容失败:', error);
    return false;
  }
}

// 测试3: 检查UI排序功能
function testUISorting() {
  console.log('📋 [测试] 检查UI排序功能...');
  
  if (!window.forumUI) {
    console.log('❌ [测试] forumUI不存在');
    return false;
  }
  
  // 模拟论坛数据
  const mockForumData = {
    threads: [
      {
        id: 'thread1',
        title: '旧帖子',
        author: '用户1',
        content: '旧内容',
        timestamp: '2024-01-01 10:00:00',
        replies: []
      },
      {
        id: 'thread2',
        title: '新帖子',
        author: '用户2',
        content: '新内容',
        timestamp: new Date().toLocaleString(),
        replies: [
          {
            timestamp: new Date().toLocaleString(),
            author: '回复者',
            content: '新回复'
          }
        ]
      }
    ]
  };
  
  // 临时替换getCurrentForumData方法
  const originalMethod = window.forumUI.getCurrentForumData;
  window.forumUI.getCurrentForumData = () => mockForumData;
  
  try {
    const html = window.forumUI.getThreadListHTML();
    console.log('📊 [测试] 生成的HTML长度:', html.length);
    
    // 检查HTML中帖子的顺序
    const thread1Index = html.indexOf('thread1');
    const thread2Index = html.indexOf('thread2');
    
    if (thread2Index < thread1Index && thread2Index !== -1 && thread1Index !== -1) {
      console.log('✅ [测试] UI排序正确：有新回复的帖子排在前面');
      return true;
    } else {
      console.log('❌ [测试] UI排序可能有问题');
      console.log(`thread1位置: ${thread1Index}, thread2位置: ${thread2Index}`);
      return false;
    }
  } catch (error) {
    console.error('❌ [测试] UI排序测试失败:', error);
    return false;
  } finally {
    // 恢复原方法
    window.forumUI.getCurrentForumData = originalMethod;
  }
}

// 测试4: 检查时间戳设置
function testTimestampSetting() {
  console.log('📋 [测试] 检查时间戳设置功能...');
  
  if (!window.forumManager || typeof window.forumManager.parseForumContent !== 'function') {
    console.log('❌ [测试] parseForumContent方法不存在');
    return false;
  }
  
  const testContent = `[标题|测试用户|test_001|测试标题|测试内容]
[回复|回复用户|test_001|测试回复]`;
  
  try {
    const parsed = window.forumManager.parseForumContent(testContent);
    console.log('📊 [测试] 解析结果:', parsed);
    
    // 检查是否有时间戳
    const hasThreadTimestamp = parsed.threads.length > 0 && parsed.threads[0].timestamp;
    const hasReplyTimestamp = parsed.replies['test_001'] && 
                             parsed.replies['test_001'].length > 0 && 
                             parsed.replies['test_001'][0].timestamp;
    
    if (hasThreadTimestamp && hasReplyTimestamp) {
      console.log('✅ [测试] 时间戳设置正确');
      return true;
    } else {
      console.log('❌ [测试] 时间戳设置有问题');
      console.log(`帖子时间戳: ${hasThreadTimestamp}, 回复时间戳: ${hasReplyTimestamp}`);
      return false;
    }
  } catch (error) {
    console.error('❌ [测试] 时间戳测试失败:', error);
    return false;
  }
}

// 运行所有测试
function runAllTests() {
  console.log('🚀 [测试] 开始运行所有改进功能测试...');
  console.log('');
  
  const results = [];
  
  // 延迟执行，确保所有组件已加载
  setTimeout(() => {
    results.push(testGenerateButtonToast());
    console.log('');
    
    results.push(testForumSorting());
    console.log('');
    
    results.push(testUISorting());
    console.log('');
    
    results.push(testTimestampSetting());
    console.log('');
    
    const passedTests = results.filter(r => r).length;
    const totalTests = results.length;
    
    if (passedTests === totalTests) {
      console.log('🎉 [测试] 所有改进功能测试通过！');
      console.log('');
      console.log('📝 [改进总结]:');
      console.log('1. ✅ 头部生成按钮现在会显示"正在生成论坛内容..."提示');
      console.log('2. ✅ 最新的帖子和有新回复的帖子会排在论坛最上方');
      console.log('3. ✅ 论坛内容按最新活动时间排序（包括回复时间）');
      console.log('4. ✅ 新内容会自动设置当前时间戳确保正确排序');
    } else {
      console.error(`❌ [测试] ${totalTests - passedTests}/${totalTests} 个测试失败！`);
    }
  }, 1000);
}

// 导出测试函数
window.testForumImprovements = runAllTests;
window.testGenerateButtonToast = testGenerateButtonToast;
window.testForumSorting = testForumSorting;
window.testUISorting = testUISorting;
window.testTimestampSetting = testTimestampSetting;

// 自动运行测试
runAllTests();
