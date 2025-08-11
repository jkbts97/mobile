// 测试操作规范分类功能
console.log('🧪 [操作规范测试] 开始测试操作规范分类功能...');

// 测试三种不同的规范
window.testOperationRules = function() {
  console.log('📋 [操作规范测试] 检查三种操作规范...');
  
  if (!window.forumStyles) {
    console.log('❌ [操作规范测试] forumStyles不存在');
    return false;
  }
  
  // 检查三种规范方法是否存在
  const methods = [
    'getUserPostRules',
    'getForumGenerationRules', 
    'getUserReplyRules'
  ];
  
  let allMethodsExist = true;
  methods.forEach(methodName => {
    if (typeof window.forumStyles[methodName] === 'function') {
      console.log(`✅ [操作规范测试] ${methodName}方法存在`);
    } else {
      console.log(`❌ [操作规范测试] ${methodName}方法不存在`);
      allMethodsExist = false;
    }
  });
  
  return allMethodsExist;
};

// 测试getStylePrompt的操作类型参数
window.testStylePromptOperationTypes = function() {
  console.log('📋 [操作规范测试] 测试getStylePrompt的操作类型参数...');
  
  if (!window.forumStyles) {
    console.log('❌ [操作规范测试] forumStyles不存在');
    return false;
  }
  
  const operationTypes = ['post', 'reply', 'generate'];
  const styleName = '小红书种草'; // 使用小红书风格测试
  
  let allTypesWork = true;
  
  operationTypes.forEach(opType => {
    try {
      const prompt = window.forumStyles.getStylePrompt(styleName, opType);
      
      if (prompt && prompt.length > 0) {
        console.log(`✅ [操作规范测试] ${opType}类型提示词生成成功，长度: ${prompt.length}`);
        
        // 检查是否包含对应的规范关键词
        let hasCorrectRules = false;
        switch (opType) {
          case 'post':
            hasCorrectRules = prompt.includes('用户发帖规范') || prompt.includes('用户发帖处理规范');
            break;
          case 'reply':
            hasCorrectRules = prompt.includes('用户回复规范') || prompt.includes('用户回复处理规范');
            break;
          case 'generate':
            hasCorrectRules = prompt.includes('立即生成论坛规范') || prompt.includes('论坛生成规范');
            break;
        }
        
        if (hasCorrectRules) {
          console.log(`✅ [操作规范测试] ${opType}类型包含正确的规范内容`);
        } else {
          console.log(`❌ [操作规范测试] ${opType}类型缺少对应的规范内容`);
          allTypesWork = false;
        }
      } else {
        console.log(`❌ [操作规范测试] ${opType}类型提示词生成失败`);
        allTypesWork = false;
      }
    } catch (error) {
      console.error(`❌ [操作规范测试] ${opType}类型测试出错:`, error);
      allTypesWork = false;
    }
  });
  
  return allTypesWork;
};

// 测试规范内容的差异
window.testRulesDifferences = function() {
  console.log('📋 [操作规范测试] 测试三种规范的内容差异...');
  
  if (!window.forumStyles) {
    console.log('❌ [操作规范测试] forumStyles不存在');
    return false;
  }
  
  try {
    const postRules = window.forumStyles.getUserPostRules();
    const replyRules = window.forumStyles.getUserReplyRules();
    const generateRules = window.forumStyles.getForumGenerationRules();
    
    console.log('📊 [操作规范测试] 规范内容长度:');
    console.log(`  - 发帖规范: ${postRules.length} 字符`);
    console.log(`  - 回复规范: ${replyRules.length} 字符`);
    console.log(`  - 生成规范: ${generateRules.length} 字符`);
    
    // 检查关键词差异
    const postKeywords = ['用户发帖', '新帖子', '他人的回复'];
    const replyKeywords = ['用户回复', '新回复', '响应回复', '楼中楼'];
    const generateKeywords = ['立即生成', '完整的帖子', '3-5个'];
    
    let hasCorrectKeywords = true;
    
    // 检查发帖规范关键词
    postKeywords.forEach(keyword => {
      if (postRules.includes(keyword)) {
        console.log(`✅ [操作规范测试] 发帖规范包含关键词: ${keyword}`);
      } else {
        console.log(`❌ [操作规范测试] 发帖规范缺少关键词: ${keyword}`);
        hasCorrectKeywords = false;
      }
    });
    
    // 检查回复规范关键词
    replyKeywords.forEach(keyword => {
      if (replyRules.includes(keyword)) {
        console.log(`✅ [操作规范测试] 回复规范包含关键词: ${keyword}`);
      } else {
        console.log(`❌ [操作规范测试] 回复规范缺少关键词: ${keyword}`);
        hasCorrectKeywords = false;
      }
    });
    
    // 检查生成规范关键词
    generateKeywords.forEach(keyword => {
      if (generateRules.includes(keyword)) {
        console.log(`✅ [操作规范测试] 生成规范包含关键词: ${keyword}`);
      } else {
        console.log(`❌ [操作规范测试] 生成规范缺少关键词: ${keyword}`);
        hasCorrectKeywords = false;
      }
    });
    
    return hasCorrectKeywords;
  } catch (error) {
    console.error('❌ [操作规范测试] 测试规范差异失败:', error);
    return false;
  }
};

// 测试论坛管理器是否使用了正确的操作类型
window.testForumManagerOperationTypes = function() {
  console.log('📋 [操作规范测试] 测试论坛管理器是否使用了正确的操作类型...');
  
  if (!window.forumManager) {
    console.log('❌ [操作规范测试] forumManager不存在');
    return false;
  }
  
  // 检查方法是否存在
  const methods = [
    'generateForumContent',
    'sendReplyToAPI',
    'sendPostToAPI'
  ];
  
  let allMethodsExist = true;
  methods.forEach(methodName => {
    if (typeof window.forumManager[methodName] === 'function') {
      console.log(`✅ [操作规范测试] forumManager.${methodName}方法存在`);
    } else {
      console.log(`❌ [操作规范测试] forumManager.${methodName}方法不存在`);
      allMethodsExist = false;
    }
  });
  
  // 检查方法源码是否包含正确的操作类型参数
  if (allMethodsExist) {
    try {
      const generateMethod = window.forumManager.generateForumContent.toString();
      const replyMethod = window.forumManager.sendReplyToAPI.toString();
      const postMethod = window.forumManager.sendPostToAPI.toString();
      
      const hasGenerateType = generateMethod.includes("'generate'") || generateMethod.includes('"generate"');
      const hasReplyType = replyMethod.includes("'reply'") || replyMethod.includes('"reply"');
      const hasPostType = postMethod.includes("'post'") || postMethod.includes('"post"');
      
      console.log(`📊 [操作规范测试] 方法使用正确操作类型:`);
      console.log(`  - generateForumContent使用'generate': ${hasGenerateType}`);
      console.log(`  - sendReplyToAPI使用'reply': ${hasReplyType}`);
      console.log(`  - sendPostToAPI使用'post': ${hasPostType}`);
      
      return hasGenerateType && hasReplyType && hasPostType;
    } catch (error) {
      console.error('❌ [操作规范测试] 检查方法源码失败:', error);
      return false;
    }
  }
  
  return allMethodsExist;
};

// 运行所有测试
function runAllOperationRulesTests() {
  console.log('🚀 [操作规范测试] 开始运行所有操作规范测试...');
  console.log('');
  
  const results = [];
  
  results.push(testOperationRules());
  console.log('');
  
  results.push(testStylePromptOperationTypes());
  console.log('');
  
  results.push(testRulesDifferences());
  console.log('');
  
  results.push(testForumManagerOperationTypes());
  console.log('');
  
  const passedTests = results.filter(r => r).length;
  const totalTests = results.length;
  
  if (passedTests === totalTests) {
    console.log('🎉 [操作规范测试] 所有测试通过！操作规范分类成功！');
    console.log('');
    console.log('📝 [修改总结]:');
    console.log('1. ✅ 创建了三种不同的操作规范');
    console.log('2. ✅ 用户发帖规范：专门处理用户发布新帖子');
    console.log('3. ✅ 用户回复规范：专门处理用户回复和评论');
    console.log('4. ✅ 立即生成论坛规范：专门处理论坛内容生成');
    console.log('5. ✅ 论坛管理器根据操作类型使用不同规范');
  } else {
    console.error(`❌ [操作规范测试] ${totalTests - passedTests}/${totalTests} 个测试失败！`);
  }
}

// 导出测试函数
window.testOperationRules = testOperationRules;
window.testStylePromptOperationTypes = testStylePromptOperationTypes;
window.testRulesDifferences = testRulesDifferences;
window.testForumManagerOperationTypes = testForumManagerOperationTypes;
window.testOperationRulesAll = runAllOperationRulesTests;

// 立即运行测试
console.log('🔄 [操作规范测试] 自动运行测试...');
setTimeout(runAllOperationRulesTests, 1000);
