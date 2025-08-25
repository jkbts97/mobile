// Message-App 控制台日志一键清理脚本
// 使用方法：在浏览器控制台中复制粘贴以下代码并执行

console.log('🧹 开始清理 Message-App 控制台日志...');

// 关闭所有调试日志开关
window.DEBUG_MESSAGE_APP = false;
window.DEBUG_MESSAGE_RENDERER = false;
window.DEBUG_FRIEND_RENDERER = false;
window.DEBUG_CONTEXT_MONITOR = false;
window.DEBUG_CONTEXT_EDITOR = false;
window.DEBUG_REAL_TIME_SYNC = false;
window.DEBUG_FORUM_AUTO_LISTENER = false;
window.DEBUG_WEIBO_AUTO_LISTENER = false;

// 清空控制台
console.clear();

// 显示清理完成信息
console.log(`
🎉 Message-App 控制台日志清理完成！

✅ 已关闭的调试开关：
   • DEBUG_MESSAGE_APP (Message-App核心日志)
   • DEBUG_MESSAGE_RENDERER (消息渲染日志)
   • DEBUG_FRIEND_RENDERER (好友渲染日志)
   • DEBUG_CONTEXT_MONITOR (上下文监控日志)
   • DEBUG_CONTEXT_EDITOR (上下文编辑器日志)
   • DEBUG_REAL_TIME_SYNC (实时同步日志)
   • DEBUG_FORUM_AUTO_LISTENER (论坛自动监听日志)
   • DEBUG_WEIBO_AUTO_LISTENER (微博自动监听日志)

📊 预期效果：
   • 日志数量减少 95% 以上
   • 控制台保持清洁
   • 只显示关键错误和警告

🔧 如需重新启用调试日志，请执行：
   window.DEBUG_MESSAGE_APP = true; // 启用特定模块
   
💡 提示：刷新页面后需要重新执行此脚本
`);

// 创建快速控制函数
window.cleanMessageAppLogs = function() {
    window.DEBUG_MESSAGE_APP = false;
    window.DEBUG_MESSAGE_RENDERER = false;
    window.DEBUG_FRIEND_RENDERER = false;
    window.DEBUG_CONTEXT_MONITOR = false;
    window.DEBUG_CONTEXT_EDITOR = false;
    window.DEBUG_REAL_TIME_SYNC = false;
    window.DEBUG_FORUM_AUTO_LISTENER = false;
    window.DEBUG_WEIBO_AUTO_LISTENER = false;
    console.clear();
    console.log('✅ Message-App 日志已清理');
};

window.enableMessageAppLogs = function() {
    window.DEBUG_MESSAGE_APP = true;
    window.DEBUG_MESSAGE_RENDERER = true;
    window.DEBUG_FRIEND_RENDERER = true;
    window.DEBUG_CONTEXT_MONITOR = true;
    window.DEBUG_CONTEXT_EDITOR = true;
    window.DEBUG_REAL_TIME_SYNC = true;
    window.DEBUG_FORUM_AUTO_LISTENER = true;
    window.DEBUG_WEIBO_AUTO_LISTENER = true;
    console.log('✅ Message-App 所有调试日志已启用');
};

console.log(`
🚀 快捷函数已创建：
   • cleanMessageAppLogs() - 一键清理日志
   • enableMessageAppLogs() - 一键启用所有日志
`);
