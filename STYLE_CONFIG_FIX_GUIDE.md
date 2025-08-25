# 样式配置器修复指南

## 🐛 问题描述

当清空浏览器localStorage后，样式配置器可能出现以下问题：
- 点击"样式编辑器"或"配置管理"按钮无响应
- 配置列表不显示
- 界面卡在设置页面，无法切换标签页

## 🔍 问题原因

1. **localStorage清空**：清空localStorage后，某些关键配置丢失
2. **事件绑定失效**：标签页切换事件可能没有正确绑定
3. **DOM状态异常**：标签页的active状态可能不正确

## 🛠️ 修复方法

### 方法1: 使用控制台命令（推荐）

在浏览器控制台中依次执行以下命令：

```javascript
// 1. 运行诊断
debugStyleConfig()

// 2. 尝试修复UI
fixStyleConfigUI()

// 3. 如果仍有问题，强制显示配置管理页面
forceShowConfigManager()
```

### 方法2: 手动操作

1. **刷新页面**：按F5或Ctrl+R刷新页面
2. **重新进入设置**：点击设置图标重新进入样式配置器
3. **检查控制台**：查看是否有错误信息

### 方法3: 完全重置

如果以上方法都无效，可以完全重置：

```javascript
// 清除所有样式配置数据
for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.includes('style_config')) {
        localStorage.removeItem(key);
    }
}

// 刷新页面
location.reload();
```

## 🔧 调试工具

### debugStyleConfig()
运行完整的诊断，检查：
- StyleConfigManager类和实例状态
- DOM元素存在性
- 标签页状态
- localStorage配置

### fixStyleConfigUI()
尝试修复界面：
- 强制切换到配置管理标签页
- 刷新配置列表
- 重新绑定事件

### forceShowConfigManager()
强制显示配置管理页面：
- 直接操作DOM显示/隐藏标签页
- 强制加载配置列表

## 📋 预防措施

1. **定期备份配置**：使用"导出"功能备份重要配置
2. **避免清空localStorage**：如需清理，选择性删除而非全部清空
3. **使用Data Bank**：配置会自动保存到SillyTavern的Data Bank中

## 🆘 如果问题仍然存在

1. **检查控制台错误**：按F12打开开发者工具，查看Console标签页的错误信息
2. **重新加载扩展**：在SillyTavern中重新加载mobile扩展
3. **联系支持**：提供控制台错误信息和debugStyleConfig()的输出

## 📝 修复记录

本次修复添加了以下功能：
- 增强的错误日志和调试信息
- 强制修复UI的函数
- 更健壮的标签页切换逻辑
- 详细的诊断工具

修改的文件：
- `app/style-config-manager.js` - 添加调试和修复函数
- `fix-style-config.html` - 修复工具页面

## 🎯 使用建议

1. **首次遇到问题**：先运行`debugStyleConfig()`查看状态
2. **标签页无响应**：使用`fixStyleConfigUI()`修复
3. **完全无法使用**：使用`forceShowConfigManager()`强制显示
4. **数据丢失**：检查Data Bank中是否有备份配置

记住：这些修复函数只在SillyTavern的移动端界面中可用。
