# 📱 手机界面拖拽功能说明

## 🎯 功能概述

为SillyTavern的手机界面触发按钮添加了自由拖拽功能，支持PC端和移动端。

## ✨ 主要特性

### 🖱️ 拖拽功能
- **PC端支持**: 鼠标拖拽
- **移动端支持**: 触摸拖拽  
- **智能识别**: 自动区分点击和拖拽操作
- **边界限制**: 按钮不会被拖拽到屏幕外
- **位置记忆**: 自动保存和恢复按钮位置

### 🎨 视觉效果
- **拖拽反馈**: 拖拽时按钮有缩放和阴影效果
- **平滑动画**: 流畅的过渡动画
- **移动端优化**: 针对触摸设备的样式优化

### 🔧 技术特性
- **非侵入式**: 不影响原有的点击功能
- **模块化设计**: 独立的拖拽插件，可复用
- **兼容性好**: 支持各种设备和浏览器

## 📁 文件结构

```
public/scripts/extensions/third-party/mobile/
├── mobile-phone.js       # 主要的手机界面脚本（已修改）
├── drag-helper.js        # 通用拖拽辅助插件（新增）
├── drag-helper.css       # 拖拽相关样式（新增）
└── README.md            # 说明文档（本文件）
```

## 🚀 使用方法

### 基础使用
1. 手机按钮会自动加载拖拽功能
2. **点击**: 轻点按钮打开/关闭手机界面
3. **拖拽**: 按住并移动按钮到desired位置

### 高级功能
- 按钮位置会自动保存到localStorage
- 页面刷新后位置会自动恢复
- 支持在不同屏幕尺寸间切换

## 🔧 技术实现

### DragHelper类
拖拽功能由独立的`DragHelper`类实现，具有以下特性：

```javascript
// 基本用法
const dragHelper = new DragHelper(element, {
    boundary: document.body,        // 拖拽边界
    clickThreshold: 8,             // 点击阈值（像素）
    dragClass: 'dragging',         // 拖拽时的CSS类
    savePosition: true,            // 是否保存位置
    storageKey: 'element-position' // localStorage键名
});

// 静态方法快速使用
DragHelper.makeDraggable(element, options);
```

### 关键算法
1. **点击检测**: 通过移动距离阈值区分点击和拖拽
2. **边界约束**: 实时计算可视区域边界
3. **位置保存**: 使用localStorage持久化位置信息
4. **事件管理**: 智能处理鼠标和触摸事件

## 📱 移动端优化

### 触摸事件处理
- 支持`touchstart`, `touchmove`, `touchend`事件
- 防止默认的滚动行为干扰
- 优化的触摸反馈

### 响应式设计
- 不同屏幕尺寸的样式适配
- 触摸设备专用的光标样式
- 移动端优化的动画效果

## 🎨 自定义样式

可以通过修改`drag-helper.css`来自定义拖拽效果：

```css
/* 自定义拖拽时的样式 */
.mobile-phone-trigger-dragging {
    opacity: 0.9;
    transform: scale(1.15) rotate(5deg);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

/* 自定义悬停效果 */
.mobile-phone-trigger:hover {
    transform: scale(1.1);
}
```

## 🐛 故障排除

### 常见问题

1. **拖拽功能不工作**
   - 检查`drag-helper.js`是否正确加载
   - 查看浏览器控制台的错误信息
   - 确保`DragHelper`类已正确注册到全局作用域

2. **点击功能失效**
   - 检查`clickThreshold`设置是否合适
   - 确认事件处理顺序正确
   - 验证CSS类名是否冲突

3. **位置保存失败**
   - 检查localStorage是否可用
   - 确认`savePosition`选项已启用
   - 验证`storageKey`的唯一性

### 调试模式

在浏览器控制台中运行以下代码开启调试：

```javascript
// 检查DragHelper是否可用
console.log('DragHelper available:', typeof DragHelper !== 'undefined');

// 查看当前拖拽实例
if (window.mobilePhone) {
    console.log('Drag helper:', window.mobilePhone.dragHelper);
}

// 清除保存的位置
localStorage.removeItem('mobile-phone-trigger-position');
```

## 🔄 版本更新

### v1.0.0
- ✅ 基础拖拽功能
- ✅ PC端和移动端支持
- ✅ 位置保存和恢复
- ✅ 边界限制
- ✅ 点击功能保护
- ✅ 视觉反馈效果

## 📞 技术支持

如有问题或建议，请查看：
1. 浏览器控制台的错误信息
2. 确认文件路径正确
3. 检查CSS样式是否正确加载
4. 验证localStorage权限

---

*本功能完全兼容原有的手机界面功能，只是增加了拖拽能力，不会影响任何现有功能。*
