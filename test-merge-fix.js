// 测试合并机制修复
// 验证热搜、榜单、粉丝数据的增量替换是否正常工作

console.log('🧪 开始测试合并机制修复...');

// 模拟测试数据
const testScenarios = {
  // 场景1：现有内容（包含旧的特殊数据）
  existingContent: `
<!-- WEIBO_CONTENT_START -->
[热搜|1|旧热搜1|1000000]
[热搜|2|旧热搜2|800000]

[榜单|旧榜单|明星榜]
[榜单项|1|旧明星A|500000]
[榜单项|2|旧明星B|400000]

[博文|用户A|h101|这是旧的热搜博文]
[博文|用户B|r101|这是旧的榜单博文]
[博文|用户C|u101|这是旧的用户博文]

[粉丝数|12345]
<!-- WEIBO_CONTENT_END -->
  `,
  
  // 场景2：新生成内容（只包含热搜和新榜单博文）
  newContent: `
[热搜|1|新热搜1|2000000]
[热搜|2|新热搜2|1800000]
[热搜|3|新热搜3|1600000]

[博文|用户D|h102|这是新的热搜博文]
[博文|用户E|r102|这是新的榜单博文]
[评论|用户F|h102|这是新评论]
  `,
  
  // 场景3：只有榜单数据的新内容
  onlyRankingContent: `
[榜单|新榜单|综艺榜]
[榜单项|1|新综艺A|600000]
[榜单项|2|新综艺B|500000]
  `,
  
  // 场景4：只有粉丝数据的新内容
  onlyFansContent: `
[粉丝数|54321]
  `
};

// 测试函数
function testMergeFix() {
  console.log('=== 合并机制修复测试 ===');
  
  // 检查必要的组件是否存在
  if (!window.weiboManager) {
    console.error('❌ weiboManager 未找到');
    return;
  }
  
  console.log('📊 开始测试场景1：热搜数据替换 + 榜单博文替换');
  
  // 模拟现有内容
  const existingData = window.weiboManager.parseWeiboContent(testScenarios.existingContent);
  console.log('现有数据解析结果:', {
    posts: existingData.posts.length,
    hotSearches: existingData.hotSearches.length,
    rankings: existingData.rankings.length,
    userStats: existingData.userStats
  });
  
  // 模拟新内容
  const newData = window.weiboManager.parseWeiboContent(testScenarios.newContent);
  console.log('新数据解析结果:', {
    posts: newData.posts.length,
    hotSearches: newData.hotSearches.length,
    rankings: newData.rankings.length,
    userStats: newData.userStats
  });
  
  // 测试合并逻辑
  console.log('\n🔄 测试合并逻辑...');
  
  // 检测数据变化
  const hasNewHotSearches = /\[热搜\|/.test(testScenarios.newContent);
  const hasNewRankings = /\[榜单\|/.test(testScenarios.newContent);
  const hasNewRankingPosts = /\[博文\|[^|]+\|r\d+\|/.test(testScenarios.newContent);
  const hasNewUserStats = /\[粉丝数\|/.test(testScenarios.newContent);
  
  console.log('变化检测结果:', {
    hasNewHotSearches,
    hasNewRankings,
    hasNewRankingPosts,
    hasNewUserStats
  });
  
  // 模拟合并结果
  let finalHotSearches = existingData.hotSearches || [];
  let finalRankings = existingData.rankings || [];
  let finalUserStats = existingData.userStats;
  let mergedRankingPosts = [];
  
  if (hasNewHotSearches && newData.hotSearches && newData.hotSearches.length > 0) {
    finalHotSearches = newData.hotSearches;
    console.log('✅ 热搜数据应该被替换');
  }
  
  if (hasNewRankings && newData.rankings && newData.rankings.length > 0) {
    finalRankings = newData.rankings;
    console.log('✅ 榜单数据应该被替换');
  } else {
    console.log('📋 榜单数据应该保持不变');
  }
  
  if (hasNewRankingPosts) {
    mergedRankingPosts = newData.posts.filter(post => post.id.startsWith('r'));
    console.log('✅ 榜单博文应该被替换');
  } else {
    mergedRankingPosts = existingData.posts.filter(post => post.id.startsWith('r'));
    console.log('📋 榜单博文应该保持不变');
  }
  
  if (hasNewUserStats && newData.userStats) {
    finalUserStats = newData.userStats;
    console.log('✅ 粉丝数据应该被替换');
  } else {
    console.log('📋 粉丝数据应该保持不变');
  }
  
  console.log('\n📋 预期合并结果:', {
    hotSearches: finalHotSearches.length,
    rankings: finalRankings.length,
    rankingPosts: mergedRankingPosts.length,
    userStats: finalUserStats
  });
}

// 测试构建内容功能
function testBuildContent() {
  console.log('\n=== 测试内容构建功能 ===');
  
  if (!window.weiboManager) {
    console.error('❌ weiboManager 未找到');
    return;
  }
  
  // 创建测试数据
  const testPosts = new Map();
  testPosts.set('h101', {
    id: 'h101',
    author: '测试用户',
    content: '测试博文内容',
    timestamp: new Date().toLocaleString(),
    latestActivityTime: new Date()
  });
  
  const testComments = new Map();
  testComments.set('h101', [{
    id: 'c1',
    postId: 'h101',
    author: '评论用户',
    content: '测试评论',
    timestamp: new Date().toLocaleString()
  }]);
  
  const testRankingPosts = [{
    id: 'r101',
    author: '榜单用户',
    content: '榜单博文内容',
    timestamp: new Date().toLocaleString(),
    latestActivityTime: new Date()
  }];
  
  const testHotSearches = [
    { rank: 1, title: '测试热搜1', heat: '1000000' },
    { rank: 2, title: '测试热搜2', heat: '800000' }
  ];
  
  const testRankings = [{
    title: '测试榜单',
    type: '明星榜',
    items: [
      { rank: 1, name: '明星A', heat: '500000' },
      { rank: 2, name: '明星B', heat: '400000' }
    ]
  }];
  
  const testUserStats = {
    fans: '12345',
    following: '100',
    posts: 1
  };
  
  // 测试构建内容
  try {
    const builtContent = window.weiboManager.buildWeiboContent(
      testPosts,
      testComments,
      testRankingPosts,
      testHotSearches,
      testRankings,
      testUserStats
    );
    
    console.log('✅ 内容构建成功');
    console.log('构建的内容包含:');
    console.log('- 热搜数据:', /\[热搜\|/.test(builtContent) ? '✅' : '❌');
    console.log('- 榜单数据:', /\[榜单\|/.test(builtContent) ? '✅' : '❌');
    console.log('- 榜单博文:', /\[博文\|[^|]+\|r\d+\|/.test(builtContent) ? '✅' : '❌');
    console.log('- 普通博文:', /\[博文\|[^|]+\|h\d+\|/.test(builtContent) ? '✅' : '❌');
    console.log('- 粉丝数据:', /\[粉丝数\|/.test(builtContent) ? '✅' : '❌');
    
    console.log('\n📄 构建的内容预览:');
    console.log(builtContent.substring(0, 500) + '...');
    
  } catch (error) {
    console.error('❌ 内容构建失败:', error);
  }
}

// 完整流程测试
function testCompleteFlow() {
  console.log('\n=== 完整流程测试 ===');
  
  if (!window.weiboManager) {
    console.error('❌ weiboManager 未找到');
    return;
  }
  
  console.log('🔄 模拟完整的合并流程...');
  
  try {
    // 模拟调用合并方法
    const result = window.weiboManager.mergeWeiboContent(
      testScenarios.existingContent,
      testScenarios.newContent
    );
    
    console.log('✅ 合并流程完成');
    console.log('合并结果包含:');
    console.log('- 新热搜数据:', /新热搜/.test(result) ? '✅' : '❌');
    console.log('- 旧榜单数据保留:', /旧榜单/.test(result) ? '✅' : '❌');
    console.log('- 新榜单博文:', /\[博文\|[^|]+\|r102\|/.test(result) ? '✅' : '❌');
    console.log('- 旧粉丝数据保留:', /12345/.test(result) ? '✅' : '❌');
    
  } catch (error) {
    console.error('❌ 完整流程测试失败:', error);
  }
}

// 导出测试函数
window.testMergeFix = testMergeFix;
window.testBuildContent = testBuildContent;
window.testCompleteFlow = testCompleteFlow;

console.log('📋 可用的测试命令:');
console.log('- testMergeFix(): 测试合并逻辑修复');
console.log('- testBuildContent(): 测试内容构建功能');
console.log('- testCompleteFlow(): 测试完整流程');

// 自动执行测试
setTimeout(() => {
  if (window.weiboManager) {
    console.log('🚀 自动执行合并机制测试...');
    testMergeFix();
    testBuildContent();
    testCompleteFlow();
  } else {
    console.log('⚠️ 微博管理器未就绪，请手动运行测试');
  }
}, 1000);
