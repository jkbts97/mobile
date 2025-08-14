// 测试账户切换功能的脚本
// 在浏览器控制台中运行此脚本来测试用户名切换是否正常工作

console.log('🧪 开始测试账户切换功能...');

// 测试函数
function testAccountSwitch() {
    console.log('=== 账户切换测试 ===');
    
    // 检查必要的组件是否存在
    if (!window.weiboManager) {
        console.error('❌ weiboManager 未找到');
        return;
    }
    
    if (!window.weiboUI) {
        console.error('❌ weiboUI 未找到');
        return;
    }
    
    // 获取当前状态
    const currentAccount = window.weiboManager.currentAccount;
    console.log('📊 当前账户状态:', {
        isMainAccount: currentAccount.isMainAccount,
        mainAccountName: currentAccount.mainAccountName,
        aliasAccountName: currentAccount.aliasAccountName,
        currentUsername: window.weiboManager.getCurrentUsername()
    });
    
    // 检查DOM元素
    const profileNameElement = document.querySelector('.profile-name');
    const accountTypeElement = document.querySelector('.account-type');
    
    console.log('📋 当前DOM显示:', {
        profileName: profileNameElement ? profileNameElement.textContent : '未找到',
        accountType: accountTypeElement ? accountTypeElement.textContent : '未找到'
    });
    
    // 执行切换
    console.log('🔄 执行账户切换...');
    const newIsMainAccount = window.weiboManager.switchAccount();
    
    console.log('✅ 切换完成，新状态:', {
        isMainAccount: newIsMainAccount,
        currentUsername: window.weiboManager.getCurrentUsername()
    });
    
    // 立即更新显示
    if (window.weiboUI.updateUsernameDisplay) {
        window.weiboUI.updateUsernameDisplay();
        console.log('🔄 已调用 updateUsernameDisplay()');
    }
    
    // 检查更新后的DOM
    setTimeout(() => {
        console.log('📋 更新后的DOM显示:', {
            profileName: profileNameElement ? profileNameElement.textContent : '未找到',
            accountType: accountTypeElement ? accountTypeElement.textContent : '未找到'
        });
        
        // 验证是否正确更新
        const expectedUsername = newIsMainAccount ? 
            currentAccount.mainAccountName : 
            currentAccount.aliasAccountName;
        const expectedAccountType = newIsMainAccount ? '大号' : '小号';
        
        const actualUsername = profileNameElement ? profileNameElement.textContent : '';
        const actualAccountType = accountTypeElement ? accountTypeElement.textContent : '';
        
        console.log('🎯 验证结果:');
        console.log(`用户名: 期望="${expectedUsername}", 实际="${actualUsername}", ${expectedUsername === actualUsername ? '✅' : '❌'}`);
        console.log(`账户类型: 期望="${expectedAccountType}", 实际="${actualAccountType}", ${expectedAccountType === actualAccountType ? '✅' : '❌'}`);
        
        if (expectedUsername === actualUsername && expectedAccountType === actualAccountType) {
            console.log('🎉 账户切换测试通过！');
        } else {
            console.log('❌ 账户切换测试失败！');
        }
    }, 100);
}

// 设置账户名称的辅助函数
function setupTestAccounts() {
    console.log('🔧 设置测试账户名称...');
    
    if (!window.weiboManager) {
        console.error('❌ weiboManager 未找到');
        return;
    }
    
    // 设置大号名称
    window.weiboManager.setUsername('女明星-沐夕', true);
    console.log('✅ 大号名称已设置: 女明星-沐夕');
    
    // 设置小号名称
    window.weiboManager.setUsername('可爱多', false);
    console.log('✅ 小号名称已设置: 可爱多');
    
    // 刷新显示
    if (window.weiboUI && window.weiboUI.updateUsernameDisplay) {
        window.weiboUI.updateUsernameDisplay();
    }
    
    console.log('🎯 账户设置完成，当前状态:', {
        isMainAccount: window.weiboManager.currentAccount.isMainAccount,
        currentUsername: window.weiboManager.getCurrentUsername()
    });
}

// 连续切换测试
function testMultipleSwitches() {
    console.log('🔄 开始连续切换测试...');
    
    let switchCount = 0;
    const maxSwitches = 4;
    
    const switchInterval = setInterval(() => {
        switchCount++;
        console.log(`\n--- 第 ${switchCount} 次切换 ---`);
        
        const beforeSwitch = {
            isMainAccount: window.weiboManager.currentAccount.isMainAccount,
            username: window.weiboManager.getCurrentUsername()
        };
        
        // 执行切换
        const newIsMainAccount = window.weiboManager.switchAccount();
        
        // 更新显示
        if (window.weiboUI.updateUsernameDisplay) {
            window.weiboUI.updateUsernameDisplay();
        }
        
        const afterSwitch = {
            isMainAccount: newIsMainAccount,
            username: window.weiboManager.getCurrentUsername()
        };
        
        console.log('切换前:', beforeSwitch);
        console.log('切换后:', afterSwitch);
        
        // 检查DOM更新
        setTimeout(() => {
            const profileNameElement = document.querySelector('.profile-name');
            const actualUsername = profileNameElement ? profileNameElement.textContent : '';
            console.log(`DOM显示: ${actualUsername}, 匹配: ${actualUsername === afterSwitch.username ? '✅' : '❌'}`);
        }, 50);
        
        if (switchCount >= maxSwitches) {
            clearInterval(switchInterval);
            console.log('🏁 连续切换测试完成');
        }
    }, 1000);
}

// 导出测试函数
window.testAccountSwitch = testAccountSwitch;
window.setupTestAccounts = setupTestAccounts;
window.testMultipleSwitches = testMultipleSwitches;

console.log('📋 可用的测试命令:');
console.log('- setupTestAccounts(): 设置测试账户名称');
console.log('- testAccountSwitch(): 执行单次切换测试');
console.log('- testMultipleSwitches(): 执行连续切换测试');

// 自动执行初始设置
setTimeout(() => {
    if (window.weiboManager && window.weiboUI) {
        console.log('🚀 自动执行初始测试...');
        setupTestAccounts();
        setTimeout(testAccountSwitch, 500);
    } else {
        console.log('⚠️ 微博组件未就绪，请手动运行测试');
    }
}, 1000);
