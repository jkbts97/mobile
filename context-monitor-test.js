/**
 * 上下文监控器测试脚本
 * 用于验证上下文监控器是否正常工作
 */

// 等待DOM加载完成后执行测试
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(testContextMonitor, 2000); // 延迟2秒确保所有脚本都加载完成
});

function testContextMonitor() {
    console.log('=== 开始测试上下文监控器 ===');

    // 测试1: 检查类是否存在
    console.log('测试1: 检查ContextMonitor类');
    if (window.ContextMonitor) {
        console.log('✅ ContextMonitor类存在');
    } else {
        console.log('❌ ContextMonitor类不存在');
        return;
    }

    // 测试2: 检查实例是否存在
    console.log('测试2: 检查contextMonitor实例');
    if (window.contextMonitor) {
        console.log('✅ contextMonitor实例存在');
        console.log('实例类型:', typeof window.contextMonitor);
        console.log('实例构造函数:', window.contextMonitor.constructor.name);
    } else {
        console.log('❌ contextMonitor实例不存在');
        return;
    }

    // 测试3: 检查关键方法是否存在
    console.log('测试3: 检查关键方法');
    const methods = ['extractFromCurrentChat', 'getCurrentContext', 'start', 'stop'];
    methods.forEach(method => {
        if (typeof window.contextMonitor[method] === 'function') {
            console.log(`✅ ${method} 方法存在`);
        } else {
            console.log(`❌ ${method} 方法不存在`);
        }
    });

    // 测试4: 检查提取格式
    console.log('测试4: 检查提取格式');
    try {
        const formats = window.contextMonitor.getExtractorFormats();
        console.log('✅ 提取格式获取成功');
        console.log('可用格式:', Object.keys(formats));

        // 特别检查我们需要的格式
        if (formats.myMessage) {
            console.log('✅ myMessage格式存在');
        } else {
            console.log('❌ myMessage格式不存在');
        }

        if (formats.otherMessage) {
            console.log('✅ otherMessage格式存在');
        } else {
            console.log('❌ otherMessage格式不存在');
        }
    } catch (error) {
        console.log('❌ 获取提取格式失败:', error);
    }

    // 测试5: 测试MessageRenderer连接
    console.log('测试5: 测试MessageRenderer连接');
    if (window.messageRenderer) {
        console.log('✅ MessageRenderer存在');
        if (window.messageRenderer.contextMonitor) {
            console.log('✅ MessageRenderer已连接到上下文监控器');
        } else {
            console.log('❌ MessageRenderer未连接到上下文监控器');
        }
    } else {
        console.log('⚠️ MessageRenderer尚未加载');
    }

    console.log('=== 上下文监控器测试完成 ===');
}

// 导出测试函数，可以在控制台中手动调用
window.testContextMonitor = testContextMonitor;

console.log('[Context Monitor Test] 测试脚本已加载，将在DOM加载完成后自动运行');
