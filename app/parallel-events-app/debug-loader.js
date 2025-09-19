// 平行事件应用调试加载器
console.log('🔍 [Debug Loader] Start debugging the parallel event application loading process...');

// 检查当前环境
console.log('📋 [Debug Loader] Environmental inspection:');
console.log('  - Current URL:', window.location.href);
console.log('  - User agent:', navigator.userAgent);

// 检查文件路径
const expectedPaths = [
    './scripts/extensions/third-party/mobile/app/parallel-events-app/parallel-events-app.css',
    './scripts/extensions/third-party/mobile/app/parallel-events-app/parallel-events-styles.js',
    './scripts/extensions/third-party/mobile/app/parallel-events-app/parallel-events-app.js'
];

console.log('📁 [Debug Loader] Expected file path:');
expectedPaths.forEach((path, index) => {
    console.log(`  ${index + 1}. ${path}`);
});

// 测试文件是否可访问
async function testFileAccess() {
    console.log('🌐 [Debug Loader] Test file accessibility...');
    
    for (let i = 0; i < expectedPaths.length; i++) {
        const path = expectedPaths[i];
        try {
            const response = await fetch(path);
            console.log(`  ✅ ${path} - State: ${response.status}`);
        } catch (error) {
            console.log(`  ❌ ${path} - Wrong: ${error.message}`);
        }
    }
}

// 监控全局变量变化
const checkGlobals = () => {
    const globals = {
        'ParallelEventsApp': window.ParallelEventsApp,
        'parallelEventsManager': window.parallelEventsManager,
        'parallelEventsStyles': window.parallelEventsStyles,
        'getParallelEventsAppContent': window.getParallelEventsAppContent,
        'bindParallelEventsAppEvents': window.bindParallelEventsAppEvents
    };
    
    console.log('🔍 [Debug Loader] Global variable state:');
    Object.entries(globals).forEach(([name, value]) => {
        const type = typeof value;
        const exists = value !== undefined;
        console.log(`  - ${name}: ${exists ? '✅' : '❌'} (${type})`);
    });
    
    return globals;
};

// 初始检查
checkGlobals();

// 测试文件访问
testFileAccess();

// 定期检查全局变量变化
let checkCount = 0;
const maxChecks = 20;
const checkInterval = setInterval(() => {
    checkCount++;
    console.log(`🔄 [Debug Loader] Examine ${checkCount}/${maxChecks}:`);
    
    const globals = checkGlobals();
    
    // 如果所有变量都存在，停止检查
    const allExists = Object.values(globals).every(v => v !== undefined);
    if (allExists) {
        console.log('🎉 [Debug Loader] All global variables are ready.！');
        clearInterval(checkInterval);
        
        // 尝试调用调试函数
        if (window.debugParallelEventsApp) {
            console.log('🔧 [Debug Loader] Call the debugging function...');
            window.debugParallelEventsApp();
        }
    } else if (checkCount >= maxChecks) {
        console.log('⏰ [Debug Loader] Check the timeout and stop monitoring.');
        clearInterval(checkInterval);
    }
}, 1000);

console.log('🔍 [Debug Loader] The debugging loader has been started, and the global variable changes will be monitored....');
