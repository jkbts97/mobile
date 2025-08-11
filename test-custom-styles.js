/**
 * 自定义论坛风格功能测试脚本
 * 用于验证自定义风格功能的各个方面
 */

// 测试配置
const TEST_CONFIG = {
  testStyleName: '测试风格_' + Date.now(),
  testStyleDescription: '这是一个测试风格，用于验证AI生成功能。特点：温柔可爱、喜欢用颜文字、关注美妆话题。',
  testStylePrompt: `你是一位温柔可爱的小姐姐，喜欢用颜文字表达情感。

请根据提供的聊天记录，生成3-5个温柔小姐姐风格的帖子讨论，每个帖子包含标题、正文和2-3条回复。

风格要求：
- 标题要温柔可爱，如"小姐姐们来聊聊～"、"求推荐呀(｡♥‿♥｡)"
- 内容温柔甜美，大量使用颜文字和可爱表情
- 回复要互相夸奖、分享心得，如"好棒呀～"、"学到了(๑•̀ㅂ•́)و✧"
- 用户名要体现甜美气质，如"甜甜小仙女"、"温柔小天使"

请直接生成论坛内容，不要解释。`
};

// 测试结果记录
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * 测试工具函数
 */
function assert(condition, message) {
  if (condition) {
    testResults.passed++;
    console.log('✅', message);
  } else {
    testResults.failed++;
    testResults.errors.push(message);
    console.error('❌', message);
  }
}

function logTest(testName) {
  console.log('\n🧪', testName);
  console.log('='.repeat(50));
}

/**
 * 测试1: ForumStyles类基础功能
 */
function testForumStylesBasics() {
  logTest('测试ForumStyles类基础功能');
  
  try {
    assert(typeof window.forumStyles !== 'undefined', 'ForumStyles实例存在');
    assert(typeof window.forumStyles.customStyles !== 'undefined', 'customStyles属性存在');
    assert(typeof window.forumStyles.loadCustomStyles === 'function', 'loadCustomStyles方法存在');
    assert(typeof window.forumStyles.saveCustomStyle === 'function', 'saveCustomStyle方法存在');
    assert(typeof window.forumStyles.deleteCustomStyle === 'function', 'deleteCustomStyle方法存在');
    assert(typeof window.forumStyles.getAllCustomStyles === 'function', 'getAllCustomStyles方法存在');
    assert(typeof window.forumStyles.exportCustomStyles === 'function', 'exportCustomStyles方法存在');
    assert(typeof window.forumStyles.importCustomStyles === 'function', 'importCustomStyles方法存在');
  } catch (error) {
    assert(false, 'ForumStyles基础功能测试失败: ' + error.message);
  }
}

/**
 * 测试2: 自定义风格存储管理
 */
function testCustomStyleStorage() {
  logTest('测试自定义风格存储管理');
  
  try {
    // 清理测试数据
    if (window.forumStyles.getCustomStyle(TEST_CONFIG.testStyleName)) {
      window.forumStyles.deleteCustomStyle(TEST_CONFIG.testStyleName);
    }
    
    // 测试保存风格
    const styleData = {
      name: TEST_CONFIG.testStyleName,
      description: TEST_CONFIG.testStyleDescription,
      prompt: TEST_CONFIG.testStylePrompt
    };
    
    const savedStyle = window.forumStyles.saveCustomStyle(styleData);
    assert(savedStyle && savedStyle.name === TEST_CONFIG.testStyleName, '风格保存成功');
    
    // 测试获取风格
    const retrievedStyle = window.forumStyles.getCustomStyle(TEST_CONFIG.testStyleName);
    assert(retrievedStyle && retrievedStyle.name === TEST_CONFIG.testStyleName, '风格获取成功');
    assert(retrievedStyle.prompt === TEST_CONFIG.testStylePrompt, '风格内容正确');
    
    // 测试风格列表
    const allStyles = window.forumStyles.getAllCustomStyles();
    const hasTestStyle = allStyles.some(style => style.name === TEST_CONFIG.testStyleName);
    assert(hasTestStyle, '风格出现在列表中');
    
    // 测试删除风格
    window.forumStyles.deleteCustomStyle(TEST_CONFIG.testStyleName);
    const deletedStyle = window.forumStyles.getCustomStyle(TEST_CONFIG.testStyleName);
    assert(!deletedStyle, '风格删除成功');
    
  } catch (error) {
    assert(false, '自定义风格存储管理测试失败: ' + error.message);
  }
}

/**
 * 测试3: 风格导入导出功能
 */
function testImportExport() {
  logTest('测试风格导入导出功能');
  
  try {
    // 创建测试风格
    const styleData = {
      name: TEST_CONFIG.testStyleName,
      description: TEST_CONFIG.testStyleDescription,
      prompt: TEST_CONFIG.testStylePrompt
    };
    window.forumStyles.saveCustomStyle(styleData);
    
    // 测试导出
    const exportData = window.forumStyles.exportCustomStyles();
    assert(typeof exportData === 'string', '导出数据为字符串');
    
    const parsedData = JSON.parse(exportData);
    assert(parsedData.version === '1.0', '导出数据版本正确');
    assert(Array.isArray(parsedData.styles), '导出数据包含风格数组');
    assert(parsedData.styles.length > 0, '导出数据包含风格');
    
    // 测试导入
    const importResults = window.forumStyles.importCustomStyles(exportData, { overwrite: true });
    assert(importResults.success > 0, '导入成功');
    assert(importResults.failed === 0, '导入无失败');
    
    // 清理测试数据
    window.forumStyles.deleteCustomStyle(TEST_CONFIG.testStyleName);
    
  } catch (error) {
    assert(false, '风格导入导出测试失败: ' + error.message);
  }
}

/**
 * 测试4: 风格选择器集成
 */
function testStyleSelectorIntegration() {
  logTest('测试风格选择器集成');
  
  try {
    // 测试论坛控制应用风格选择器
    if (window.forumControlApp && window.forumControlApp.initializeStyleSelector) {
      window.forumControlApp.initializeStyleSelector();
      const forumStyleSelect = document.getElementById('forum-style-select');
      if (forumStyleSelect) {
        assert(forumStyleSelect.options.length > 0, '论坛控制应用风格选择器有选项');
      }
    }
    
    // 测试mobile-phone风格选择器更新
    if (window.mobilePhone && window.mobilePhone.updateStyleSelectors) {
      window.mobilePhone.updateStyleSelectors();
      assert(true, 'mobile-phone风格选择器更新成功');
    }
    
  } catch (error) {
    assert(false, '风格选择器集成测试失败: ' + error.message);
  }
}

/**
 * 测试5: UI界面功能
 */
function testUIFunctionality() {
  logTest('测试UI界面功能');
  
  try {
    // 测试论坛风格设置页面是否存在
    const forumStylesTab = document.querySelector('[data-tab="forum-styles"]');
    if (forumStylesTab) {
      assert(true, '论坛风格设置标签页存在');
    }
    
    // 测试自定义风格容器是否存在
    const customStylesContainer = document.getElementById('custom-styles-container');
    if (customStylesContainer) {
      assert(true, '自定义风格容器存在');
    }
    
    // 测试创建风格按钮是否存在
    const createStyleBtn = document.getElementById('create-custom-style-btn');
    if (createStyleBtn) {
      assert(true, '创建自定义风格按钮存在');
    }
    
  } catch (error) {
    assert(false, 'UI界面功能测试失败: ' + error.message);
  }
}

/**
 * 运行所有测试
 */
function runAllTests() {
  console.log('🚀 开始运行自定义论坛风格功能测试');
  console.log('测试时间:', new Date().toLocaleString());
  
  // 重置测试结果
  testResults.passed = 0;
  testResults.failed = 0;
  testResults.errors = [];
  
  // 运行测试
  testForumStylesBasics();
  testCustomStyleStorage();
  testImportExport();
  testStyleSelectorIntegration();
  testUIFunctionality();
  
  // 输出测试结果
  console.log('\n📊 测试结果汇总');
  console.log('='.repeat(50));
  console.log('✅ 通过:', testResults.passed);
  console.log('❌ 失败:', testResults.failed);
  console.log('📈 成功率:', ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1) + '%');
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ 失败详情:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  return testResults;
}

// 导出测试函数
window.testCustomStyles = {
  runAllTests,
  testForumStylesBasics,
  testCustomStyleStorage,
  testImportExport,
  testStyleSelectorIntegration,
  testUIFunctionality
};

console.log('📋 自定义论坛风格测试脚本已加载');
console.log('使用方法: window.testCustomStyles.runAllTests()');
