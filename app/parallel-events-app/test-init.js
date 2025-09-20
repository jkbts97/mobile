// 平行事件应用初始化测试脚本
console.log('=== Parallel event application initialisation test ===');

// 检查文件是否正确加载
console.log('1. Check global variables:');
console.log('   - ParallelEventsApp:', typeof ParallelEventsApp);
console.log('   - parallelEventsManager:', typeof window.parallelEventsManager);
console.log('   - parallelEventsStyles:', typeof window.parallelEventsStyles);
console.log('   - getParallelEventsAppContent:', typeof window.getParallelEventsAppContent);
console.log('   - bindParallelEventsAppEvents:', typeof window.bindParallelEventsAppEvents);

// 检查管理器状态
if (window.parallelEventsManager) {
    console.log('2. Manager status:');
    console.log('   - isInitialized:', window.parallelEventsManager.isInitialized);
    console.log('   - isListening:', window.parallelEventsManager.isListening);
    console.log('   - currentSettings:', window.parallelEventsManager.currentSettings);
    console.log('   - eventQueue length:', window.parallelEventsManager.eventQueue?.length);
} else {
    console.log('2. ❌ The manager has not been created');
}

// 检查风格管理器
if (window.parallelEventsStyles) {
    console.log('3. Style Manager Status:');
    console.log('   - Useable style:', window.parallelEventsStyles.getAvailableStyles());
    console.log('   - Custom prefix:', window.parallelEventsStyles.getCustomPrefix());
} else {
    console.log('3. ❌ The style manager has not been created');
}

// 检查依赖模块
console.log('4. Dependent module status:');
console.log('   - mobileContextEditor:', typeof window.mobileContextEditor);
console.log('   - mobileCustomAPIConfig:', typeof window.mobileCustomAPIConfig);

console.log('=== Test completed ===');
