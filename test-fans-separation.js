// 测试大小号粉丝数量分离管理功能
// 验证粉丝数据的解析、存储、切换是否正常工作

console.log('🧪 开始测试大小号粉丝数量分离管理功能...');

// 模拟测试数据
const testData = {
  // 包含新格式粉丝数据的内容
  withFansData: `
<!-- WEIBO_CONTENT_START -->
[热搜|1|测试热搜|1000000]

[博文|用户A|h101|测试博文内容]
[评论|用户B|h101|测试评论]

[粉丝数|50000|300]
<!-- WEIBO_CONTENT_END -->
  `,
  
  // 不包含粉丝数据的内容
  withoutFansData: `
<!-- WEIBO_CONTENT_START -->
[博文|用户C|h102|另一条测试博文]
<!-- WEIBO_CONTENT_END -->
  `,
  
  // 包含更新粉丝数据的内容
  updatedFansData: `
<!-- WEIBO_CONTENT_START -->
[粉丝数|75000|500]
<!-- WEIBO_CONTENT_END -->
  `
};

// 测试函数
function testFansSeparation() {
  console.log('=== 大小号粉丝数量分离测试 ===');
  
  // 检查必要的组件是否存在
  if (!window.weiboUI) {
    console.error('❌ weiboUI 未找到');
    return;
  }
  
  if (!window.weiboManager) {
    console.error('❌ weiboManager 未找到');
    return;
  }
  
  console.log('📊 测试场景1：解析包含粉丝数据的内容');
  
  // 测试微博UI解析
  const uiResult = window.weiboUI.parseWeiboContent(testData.withFansData);
  console.log('微博UI解析结果:', {
    userStats: uiResult.userStats,
    hasMainAccountFans: uiResult.userStats?.mainAccountFans,
    hasAliasAccountFans: uiResult.userStats?.aliasAccountFans
  });
  
  // 测试微博管理器解析
  const managerResult = window.weiboManager.parseWeiboContent(testData.withFansData);
  console.log('微博管理器解析结果:', {
    userStats: managerResult.userStats,
    hasMainAccountFans: managerResult.userStats?.mainAccountFans,
    hasAliasAccountFans: managerResult.userStats?.aliasAccountFans
  });
  
  console.log('\n📊 测试场景2：不包含粉丝数据的内容');
  const noFansResult = window.weiboUI.parseWeiboContent(testData.withoutFansData);
  console.log('无粉丝数据解析结果:', {
    userStats: noFansResult.userStats
  });
  
  console.log('\n📊 测试场景3：粉丝数据更新');
  const updatedResult = window.weiboUI.parseWeiboContent(testData.updatedFansData);
  console.log('更新后粉丝数据:', {
    userStats: updatedResult.userStats,
    mainAccountFans: updatedResult.userStats?.mainAccountFans,
    aliasAccountFans: updatedResult.userStats?.aliasAccountFans
  });
}

// 测试账户切换功能
function testAccountSwitching() {
  console.log('\n=== 账户切换粉丝数显示测试 ===');
  
  if (!window.weiboUI || !window.weiboManager) {
    console.error('❌ 必要组件未找到');
    return;
  }
  
  // 设置测试粉丝数据
  window.weiboUI.persistentData.userStats = {
    mainAccountFans: '50000',
    aliasAccountFans: '300',
    following: '100',
    posts: 5
  };
  
  console.log('📊 设置测试数据:', window.weiboUI.persistentData.userStats);
  
  // 测试大号状态
  console.log('\n🔍 测试大号状态:');
  const currentAccountType = window.weiboUI.getCurrentAccountType();
  console.log('当前账户类型:', currentAccountType);
  
  const isMainAccount = currentAccountType === '大号';
  const expectedFans = isMainAccount ? '50000' : '300';
  console.log('预期粉丝数:', expectedFans);
  
  // 模拟用户页面渲染
  const mockData = {
    posts: [],
    comments: {},
    userStats: window.weiboUI.persistentData.userStats
  };
  
  try {
    const userPageHTML = window.weiboUI.renderUserPage(mockData);
    console.log('✅ 用户页面渲染成功');
    
    // 检查是否包含正确的粉丝数
    const fansMatch = userPageHTML.match(/<div class="stat-number">(\d+)<\/div>/g);
    if (fansMatch) {
      console.log('页面中的统计数字:', fansMatch);
    }
    
  } catch (error) {
    console.error('❌ 用户页面渲染失败:', error);
  }
}

// 测试内容构建功能
function testContentBuilding() {
  console.log('\n=== 内容构建测试 ===');
  
  if (!window.weiboManager) {
    console.error('❌ weiboManager 未找到');
    return;
  }
  
  // 创建测试数据
  const testPosts = new Map();
  const testComments = new Map();
  const testRankingPosts = [];
  const testHotSearches = [];
  const testRankings = [];
  const testUserStats = {
    mainAccountFans: '75000',
    aliasAccountFans: '500',
    following: '100',
    posts: 3
  };
  
  console.log('📊 测试用户统计数据:', testUserStats);
  
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
    
    // 检查是否包含正确的粉丝数格式
    const fansMatch = builtContent.match(/\[粉丝数\|([^|]+)\|([^\]]+)\]/);
    if (fansMatch) {
      console.log('✅ 找到粉丝数据:', {
        format: fansMatch[0],
        mainAccountFans: fansMatch[1],
        aliasAccountFans: fansMatch[2]
      });
    } else {
      console.log('❌ 未找到粉丝数据格式');
    }
    
    console.log('\n📄 构建的内容预览:');
    console.log(builtContent || '(空内容)');
    
  } catch (error) {
    console.error('❌ 内容构建失败:', error);
  }
}

// 测试合并逻辑
function testMergeLogic() {
  console.log('\n=== 合并逻辑测试 ===');
  
  if (!window.weiboManager) {
    console.error('❌ weiboManager 未找到');
    return;
  }
  
  const existingContent = `
<!-- WEIBO_CONTENT_START -->
[博文|用户A|h101|旧博文]
[粉丝数|30000|200]
<!-- WEIBO_CONTENT_END -->
  `;
  
  const newContent = `
[粉丝数|60000|400]
[博文|用户B|h102|新博文]
  `;
  
  console.log('📊 测试合并现有内容和新内容');
  console.log('现有粉丝数: 大号30000, 小号200');
  console.log('新粉丝数: 大号60000, 小号400');
  
  try {
    const mergedContent = window.weiboManager.mergeWeiboContent(existingContent, newContent);
    console.log('✅ 合并完成');
    
    // 检查合并后的粉丝数
    const fansMatch = mergedContent.match(/\[粉丝数\|([^|]+)\|([^\]]+)\]/);
    if (fansMatch) {
      console.log('✅ 合并后粉丝数据:', {
        mainAccountFans: fansMatch[1],
        aliasAccountFans: fansMatch[2]
      });
      
      if (fansMatch[1] === '60000' && fansMatch[2] === '400') {
        console.log('✅ 粉丝数据正确替换');
      } else {
        console.log('❌ 粉丝数据替换异常');
      }
    } else {
      console.log('❌ 合并后未找到粉丝数据');
    }
    
  } catch (error) {
    console.error('❌ 合并失败:', error);
  }
}

// 导出测试函数
window.testFansSeparation = testFansSeparation;
window.testAccountSwitching = testAccountSwitching;
window.testContentBuilding = testContentBuilding;
window.testMergeLogic = testMergeLogic;

console.log('📋 可用的测试命令:');
console.log('- testFansSeparation(): 测试粉丝数据解析');
console.log('- testAccountSwitching(): 测试账户切换');
console.log('- testContentBuilding(): 测试内容构建');
console.log('- testMergeLogic(): 测试合并逻辑');

// 自动执行测试
setTimeout(() => {
  if (window.weiboUI && window.weiboManager) {
    console.log('🚀 自动执行大小号粉丝数量分离测试...');
    testFansSeparation();
    testAccountSwitching();
    testContentBuilding();
    testMergeLogic();
  } else {
    console.log('⚠️ 微博组件未就绪，请手动运行测试');
  }
}, 1000);
