// 测试论坛智能合并功能
console.log('🧪 [测试] 论坛智能合并功能测试开始...');

// 模拟现有论坛内容
const existingForumContent = `<!-- FORUM_CONTENT_START -->
【论坛热议】

[标题|张三|thread_001|今天天气真好|阳光明媚，适合出门]

[回复|李四|thread_001|确实不错，我也想出去走走]
[回复|王五|thread_001|但是有点热，记得带水]

[标题|赵六|thread_002|推荐一家好餐厅|昨天去了新开的川菜馆，味道很棒]

[回复|钱七|thread_002|在哪里？我也想去试试]

---
[由论坛管理器自动生成]
<!-- FORUM_CONTENT_END -->`;

// 模拟新生成的论坛内容
const newForumContent = `[标题|孙八|thread_003|周末计划|大家周末有什么安排吗？]

[回复|我|thread_003|我想去爬山]
[回复|周九|thread_003|我要在家休息]

[回复|我|thread_001|我也觉得天气很好，适合户外活动]
[回复|吴十|thread_002|那家餐厅我去过，确实很棒！]`;

// 测试函数
async function testForumMerge() {
  console.log('📋 [测试] 开始测试论坛内容合并...');
  
  // 检查论坛管理器是否可用
  if (!window.forumManager) {
    console.error('❌ [测试] 论坛管理器未初始化');
    return false;
  }
  
  // 检查合并方法是否存在
  if (typeof window.forumManager.mergeForumContent !== 'function') {
    console.error('❌ [测试] mergeForumContent方法不存在');
    return false;
  }
  
  try {
    console.log('🔄 [测试] 执行内容合并...');
    const mergedContent = await window.forumManager.mergeForumContent(existingForumContent, newForumContent);
    
    console.log('✅ [测试] 合并完成！');
    console.log('📋 [测试] 合并后的内容:');
    console.log(mergedContent);
    
    // 验证合并结果
    const hasThread001 = mergedContent.includes('thread_001');
    const hasThread002 = mergedContent.includes('thread_002');
    const hasThread003 = mergedContent.includes('thread_003');
    const hasUserReply = mergedContent.includes('我也觉得天气很好');
    
    console.log('🔍 [测试] 验证结果:');
    console.log(`  - 包含历史帖子thread_001: ${hasThread001}`);
    console.log(`  - 包含历史帖子thread_002: ${hasThread002}`);
    console.log(`  - 包含新帖子thread_003: ${hasThread003}`);
    console.log(`  - 包含用户对历史帖子的回复: ${hasUserReply}`);
    
    if (hasThread001 && hasThread002 && hasThread003 && hasUserReply) {
      console.log('🎉 [测试] 智能合并功能测试通过！');
      return true;
    } else {
      console.error('❌ [测试] 智能合并功能测试失败！');
      return false;
    }
    
  } catch (error) {
    console.error('❌ [测试] 合并过程出错:', error);
    return false;
  }
}

// 测试解析功能
function testParseFunction() {
  console.log('📋 [测试] 测试解析功能...');
  
  if (!window.forumManager || typeof window.forumManager.parseForumContent !== 'function') {
    console.error('❌ [测试] parseForumContent方法不存在');
    return false;
  }
  
  const testContent = `[标题|测试用户|test_001|测试标题|测试内容]

[回复|回复用户|test_001|这是一个测试回复]
[楼中楼|楼中楼用户|test_001|回复用户|回复的回复]`;
  
  const parsed = window.forumManager.parseForumContent(testContent);
  
  console.log('📊 [测试] 解析结果:', parsed);
  
  const hasThread = parsed.threads.length > 0;
  const hasReply = parsed.replies['test_001'] && parsed.replies['test_001'].length > 0;
  
  console.log(`  - 解析到帖子: ${hasThread}`);
  console.log(`  - 解析到回复: ${hasReply}`);
  
  if (hasThread && hasReply) {
    console.log('✅ [测试] 解析功能测试通过！');
    return true;
  } else {
    console.error('❌ [测试] 解析功能测试失败！');
    return false;
  }
}

// 运行测试
console.log('🚀 [测试] 开始运行所有测试...');

// 延迟执行，确保论坛管理器已初始化
setTimeout(async () => {
  const parseTest = testParseFunction();
  const mergeTest = await testForumMerge();
  
  if (parseTest && mergeTest) {
    console.log('🎉 [测试] 所有测试通过！智能合并功能正常工作！');
    console.log('');
    console.log('📝 [使用说明] 现在当你点击"立即生成论坛"时：');
    console.log('1. 历史帖子会被保留');
    console.log('2. 新帖子会追加到历史帖子后面');
    console.log('3. 对历史帖子的新回复会插入到对应帖子中');
    console.log('4. 避免重复内容，保持论坛连贯性');
  } else {
    console.error('❌ [测试] 部分测试失败，请检查代码！');
  }
}, 1000);

// 导出测试函数供手动调用
window.testForumMerge = testForumMerge;
window.testParseFunction = testParseFunction;
