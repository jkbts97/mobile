// 测试移除确认弹窗功能
console.log('🧪 [确认弹窗测试] 开始测试移除确认弹窗功能...');

// 测试是否移除了所有确认弹窗
window.testNoConfirmDialogs = function() {
  console.log('📋 [确认弹窗测试] 检查是否移除了所有确认弹窗...');
  
  if (!window.forumUI) {
    console.log('❌ [确认弹窗测试] forumUI不存在');
    return false;
  }
  
  // 检查各个方法的源码是否还包含confirm调用
  const methods = [
    'submitMainReply',
    'sendReplyToForum', 
    'submitNewPost'
  ];
  
  let hasConfirm = false;
  const methodResults = {};
  
  methods.forEach(methodName => {
    if (typeof window.forumUI[methodName] === 'function') {
      const methodStr = window.forumUI[methodName].toString();
      const containsConfirm = methodStr.includes('confirm(');
      methodResults[methodName] = containsConfirm;
      
      console.log(`📊 [确认弹窗测试] ${methodName}包含confirm: ${containsConfirm}`);
      
      if (containsConfirm) {
        hasConfirm = true;
      }
    } else {
      console.log(`⚠️ [确认弹窗测试] ${methodName}方法不存在`);
      methodResults[methodName] = 'not_found';
    }
  });
  
  if (!hasConfirm) {
    console.log('✅ [确认弹窗测试] 所有方法都已移除确认弹窗');
    return true;
  } else {
    console.log('❌ [确认弹窗测试] 仍有方法包含确认弹窗');
    return false;
  }
};

// 测试成功提示功能
window.testSuccessToast = function() {
  console.log('📋 [成功提示测试] 检查成功提示功能...');
  
  if (!window.forumUI) {
    console.log('❌ [成功提示测试] forumUI不存在');
    return false;
  }
  
  // 检查各个方法是否包含成功提示
  const methods = [
    'submitMainReply',
    'sendReplyToForum',
    'submitNewPost'
  ];
  
  let hasSuccessToast = true;
  const methodResults = {};
  
  methods.forEach(methodName => {
    if (typeof window.forumUI[methodName] === 'function') {
      const methodStr = window.forumUI[methodName].toString();
      const containsToast = methodStr.includes('showMobileToast') || methodStr.includes('已发送') || methodStr.includes('已发布');
      methodResults[methodName] = containsToast;
      
      console.log(`📊 [成功提示测试] ${methodName}包含成功提示: ${containsToast}`);
      
      if (!containsToast) {
        hasSuccessToast = false;
      }
    } else {
      console.log(`⚠️ [成功提示测试] ${methodName}方法不存在`);
      methodResults[methodName] = 'not_found';
      hasSuccessToast = false;
    }
  });
  
  if (hasSuccessToast) {
    console.log('✅ [成功提示测试] 所有方法都包含成功提示');
    return true;
  } else {
    console.log('❌ [成功提示测试] 部分方法缺少成功提示');
    return false;
  }
};

// 测试Toast功能是否可用
window.testToastFunction = function() {
  console.log('📋 [Toast功能测试] 检查Toast功能是否可用...');
  
  if (typeof window.showMobileToast === 'function') {
    console.log('✅ [Toast功能测试] showMobileToast函数存在');
    
    // 测试Toast功能
    try {
      window.showMobileToast('🧪 测试Toast功能', 'info');
      console.log('✅ [Toast功能测试] Toast功能正常工作');
      return true;
    } catch (error) {
      console.error('❌ [Toast功能测试] Toast功能出错:', error);
      return false;
    }
  } else {
    console.log('⚠️ [Toast功能测试] showMobileToast函数不存在，将使用alert作为备选');
    return true; // 这不算失败，因为有alert作为备选
  }
};

// 模拟回复流程测试（不实际发送）
window.simulateReplyWithoutConfirm = function() {
  console.log('📋 [回复流程测试] 模拟无确认弹窗的回复流程...');
  
  if (!window.forumUI) {
    console.log('❌ [回复流程测试] forumUI不存在');
    return false;
  }
  
  // 检查submitMainReply方法的逻辑
  if (typeof window.forumUI.submitMainReply === 'function') {
    const methodStr = window.forumUI.submitMainReply.toString();
    
    // 检查是否直接发送而不是先确认
    const hasDirectSend = methodStr.includes('sendReplyToAPI') && !methodStr.includes('if (choice)');
    const hasSuccessMessage = methodStr.includes('回复已发送') || methodStr.includes('showMobileToast');
    
    console.log(`📊 [回复流程测试] 直接发送（无确认）: ${hasDirectSend}`);
    console.log(`📊 [回复流程测试] 包含成功消息: ${hasSuccessMessage}`);
    
    if (hasDirectSend && hasSuccessMessage) {
      console.log('✅ [回复流程测试] 回复流程正确：直接发送并显示成功消息');
      return true;
    } else {
      console.log('❌ [回复流程测试] 回复流程有问题');
      return false;
    }
  } else {
    console.log('❌ [回复流程测试] submitMainReply方法不存在');
    return false;
  }
};

// 模拟发帖流程测试（不实际发送）
window.simulatePostWithoutConfirm = function() {
  console.log('📋 [发帖流程测试] 模拟无确认弹窗的发帖流程...');
  
  if (!window.forumUI) {
    console.log('❌ [发帖流程测试] forumUI不存在');
    return false;
  }
  
  // 检查submitNewPost方法的逻辑
  if (typeof window.forumUI.submitNewPost === 'function') {
    const methodStr = window.forumUI.submitNewPost.toString();
    
    // 检查是否直接发送而不是先确认
    const hasDirectSend = methodStr.includes('sendPostToAPI') && !methodStr.includes('if (choice)');
    const hasSuccessMessage = methodStr.includes('帖子已发布') || methodStr.includes('showMobileToast');
    
    console.log(`📊 [发帖流程测试] 直接发送（无确认）: ${hasDirectSend}`);
    console.log(`📊 [发帖流程测试] 包含成功消息: ${hasSuccessMessage}`);
    
    if (hasDirectSend && hasSuccessMessage) {
      console.log('✅ [发帖流程测试] 发帖流程正确：直接发送并显示成功消息');
      return true;
    } else {
      console.log('❌ [发帖流程测试] 发帖流程有问题');
      return false;
    }
  } else {
    console.log('❌ [发帖流程测试] submitNewPost方法不存在');
    return false;
  }
};

// 运行所有测试
function runAllConfirmDialogTests() {
  console.log('🚀 [确认弹窗测试] 开始运行所有确认弹窗移除测试...');
  console.log('');
  
  const results = [];
  
  results.push(testNoConfirmDialogs());
  console.log('');
  
  results.push(testSuccessToast());
  console.log('');
  
  results.push(testToastFunction());
  console.log('');
  
  results.push(simulateReplyWithoutConfirm());
  console.log('');
  
  results.push(simulatePostWithoutConfirm());
  console.log('');
  
  const passedTests = results.filter(r => r).length;
  const totalTests = results.length;
  
  if (passedTests === totalTests) {
    console.log('🎉 [确认弹窗测试] 所有测试通过！确认弹窗移除成功！');
    console.log('');
    console.log('📝 [修改总结]:');
    console.log('1. ✅ 移除了所有"确认发送回复"的弹窗');
    console.log('2. ✅ 移除了所有"确认发布帖子"的弹窗');
    console.log('3. ✅ 添加了"回复已发送"的成功提示');
    console.log('4. ✅ 添加了"帖子已发布"的成功提示');
    console.log('5. ✅ 用户操作直接执行，无需确认');
  } else {
    console.error(`❌ [确认弹窗测试] ${totalTests - passedTests}/${totalTests} 个测试失败！`);
  }
}

// 导出测试函数
window.testNoConfirmDialogs = testNoConfirmDialogs;
window.testSuccessToast = testSuccessToast;
window.testToastFunction = testToastFunction;
window.simulateReplyWithoutConfirm = simulateReplyWithoutConfirm;
window.simulatePostWithoutConfirm = simulatePostWithoutConfirm;
window.testConfirmDialogRemoval = runAllConfirmDialogTests;

// 立即运行测试
console.log('🔄 [确认弹窗测试] 自动运行测试...');
setTimeout(runAllConfirmDialogTests, 1000);
