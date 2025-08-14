// 测试优化版方案5：增量替换功能
// 在浏览器控制台中运行此脚本来测试数据增量更新是否正常工作

console.log('🧪 开始测试优化版方案5：增量替换功能...');

// 模拟测试数据
const testData = {
  // 测试场景1：只有热搜数据
  onlyHotSearch: `
<!-- WEIBO_CONTENT_START -->
【微博热议】

[热搜|1|测试热搜1|1000000]
[热搜|2|测试热搜2|800000]
[热搜|3|测试热搜3|600000]

---
[由微博管理器自动生成]
<!-- WEIBO_CONTENT_END -->
  `,
  
  // 测试场景2：只有榜单数据
  onlyRanking: `
<!-- WEIBO_CONTENT_START -->
【微博热议】

[榜单|测试榜单|明星榜]
[榜单项|1|明星A|500000]
[榜单项|2|明星B|400000]
[榜单项|3|明星C|300000]

---
[由微博管理器自动生成]
<!-- WEIBO_CONTENT_END -->
  `,
  
  // 测试场景3：只有榜单博文
  onlyRankingPosts: `
<!-- WEIBO_CONTENT_START -->
【微博热议】

[博文|用户A|r101|这是一条榜单相关的博文]
[博文|用户B|r102|另一条榜单博文]

---
[由微博管理器自动生成]
<!-- WEIBO_CONTENT_END -->
  `,
  
  // 测试场景4：只有粉丝数据
  onlyUserStats: `
<!-- WEIBO_CONTENT_START -->
【微博热议】

[粉丝数|123456]

---
[由微博管理器自动生成]
<!-- WEIBO_CONTENT_END -->
  `,
  
  // 测试场景5：混合数据
  mixedData: `
<!-- WEIBO_CONTENT_START -->
【微博热议】

[热搜|1|新热搜|2000000]
[榜单|新榜单|综艺榜]
[榜单项|1|综艺A|600000]
[博文|用户C|r103|新的榜单博文]
[粉丝数|654321]

---
[由微博管理器自动生成]
<!-- WEIBO_CONTENT_END -->
  `,
  
  // 测试场景6：普通博文（不应该影响特殊数据）
  normalPosts: `
<!-- WEIBO_CONTENT_START -->
【微博热议】

[博文|用户D|u101|这是普通用户博文]
[博文|用户E|h101|这是热搜博文]
[评论|用户F|u101|这是评论]

---
[由微博管理器自动生成]
<!-- WEIBO_CONTENT_END -->
  `
};

// 测试函数
function testIncrementalUpdate() {
  console.log('=== 增量替换测试 ===');
  
  // 检查必要的组件是否存在
  if (!window.weiboUI) {
    console.error('❌ weiboUI 未找到');
    return;
  }
  
  console.log('📊 初始持久化数据状态:', {
    hotSearches: window.weiboUI.persistentData.hotSearches.length,
    rankings: window.weiboUI.persistentData.rankings.length,
    rankingPosts: window.weiboUI.persistentData.rankingPosts.length,
    userStats: window.weiboUI.persistentData.userStats
  });
  
  // 测试场景1：只更新热搜
  console.log('\n🔥 测试场景1：只更新热搜数据');
  const result1 = window.weiboUI.parseWeiboContent(testData.onlyHotSearch);
  console.log('结果1:', {
    hotSearches: result1.hotSearches.length,
    rankings: result1.rankings.length,
    rankingPosts: result1.rankingPosts.length,
    userStats: result1.userStats
  });
  
  // 测试场景2：只更新榜单
  console.log('\n📊 测试场景2：只更新榜单数据');
  const result2 = window.weiboUI.parseWeiboContent(testData.onlyRanking);
  console.log('结果2:', {
    hotSearches: result2.hotSearches.length, // 应该保持场景1的数据
    rankings: result2.rankings.length, // 应该更新
    rankingPosts: result2.rankingPosts.length,
    userStats: result2.userStats
  });
  
  // 测试场景3：只更新榜单博文
  console.log('\n📝 测试场景3：只更新榜单博文');
  const result3 = window.weiboUI.parseWeiboContent(testData.onlyRankingPosts);
  console.log('结果3:', {
    hotSearches: result3.hotSearches.length, // 应该保持场景1的数据
    rankings: result3.rankings.length, // 应该保持场景2的数据
    rankingPosts: result3.rankingPosts.length, // 应该更新
    userStats: result3.userStats
  });
  
  // 测试场景4：只更新粉丝数据
  console.log('\n👥 测试场景4：只更新粉丝数据');
  const result4 = window.weiboUI.parseWeiboContent(testData.onlyUserStats);
  console.log('结果4:', {
    hotSearches: result4.hotSearches.length, // 应该保持场景1的数据
    rankings: result4.rankings.length, // 应该保持场景2的数据
    rankingPosts: result4.rankingPosts.length, // 应该保持场景3的数据
    userStats: result4.userStats // 应该更新
  });
  
  // 测试场景5：混合更新
  console.log('\n🔄 测试场景5：混合数据更新');
  const result5 = window.weiboUI.parseWeiboContent(testData.mixedData);
  console.log('结果5:', {
    hotSearches: result5.hotSearches.length, // 应该更新
    rankings: result5.rankings.length, // 应该更新
    rankingPosts: result5.rankingPosts.length, // 应该更新
    userStats: result5.userStats // 应该更新
  });
  
  // 测试场景6：普通博文（不应该影响特殊数据）
  console.log('\n📄 测试场景6：普通博文（不应该影响特殊数据）');
  const result6 = window.weiboUI.parseWeiboContent(testData.normalPosts);
  console.log('结果6:', {
    hotSearches: result6.hotSearches.length, // 应该保持场景5的数据
    rankings: result6.rankings.length, // 应该保持场景5的数据
    rankingPosts: result6.rankingPosts.length, // 应该保持场景5的数据
    userStats: result6.userStats, // 应该保持场景5的数据
    posts: result6.posts.length // 应该有新的普通博文
  });
  
  console.log('\n📋 最终持久化数据状态:', {
    hotSearches: window.weiboUI.persistentData.hotSearches.length,
    rankings: window.weiboUI.persistentData.rankings.length,
    rankingPosts: window.weiboUI.persistentData.rankingPosts.length,
    userStats: window.weiboUI.persistentData.userStats
  });
  
  console.log('🎉 增量替换测试完成！');
}

// 性能测试函数
function testPerformance() {
  console.log('\n⚡ 性能测试开始...');
  
  const iterations = 100;
  const startTime = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    window.weiboUI.parseWeiboContent(testData.mixedData);
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / iterations;
  
  console.log(`📊 性能测试结果:`);
  console.log(`- 总时间: ${totalTime.toFixed(2)}ms`);
  console.log(`- 平均时间: ${avgTime.toFixed(2)}ms`);
  console.log(`- 每秒处理: ${(1000 / avgTime).toFixed(0)}次`);
  
  if (avgTime < 20) {
    console.log('✅ 性能优秀（<20ms）');
  } else if (avgTime < 50) {
    console.log('✅ 性能良好（<50ms）');
  } else {
    console.log('⚠️ 性能需要优化（>50ms）');
  }
}

// 导出测试函数
window.testIncrementalUpdate = testIncrementalUpdate;
window.testPerformance = testPerformance;

console.log('📋 可用的测试命令:');
console.log('- testIncrementalUpdate(): 测试增量替换功能');
console.log('- testPerformance(): 测试性能');

// 自动执行测试
setTimeout(() => {
  if (window.weiboUI) {
    console.log('🚀 自动执行增量替换测试...');
    testIncrementalUpdate();
    testPerformance();
  } else {
    console.log('⚠️ 微博UI未就绪，请手动运行测试');
  }
}, 1000);
