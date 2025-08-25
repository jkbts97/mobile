# SillyTavern Mobile Context Monitor 开发者指南

## 开发环境设置

### 1. 项目结构理解
在开始开发之前，需要理解项目的核心架构：
- **主控制器** (`index.js`): 负责模块加载和初始化
- **监控器核心** (`context-monitor.js`): 数据监控和提取
- **界面框架** (`mobile-phone.js`): 手机界面容器
- **应用模块** (`app/`): 各种功能应用
- **工具模块**: 性能优化、调试诊断等

### 2. 开发工具配置
项目包含 `jsconfig.json` 配置文件，支持：
- TypeScript类型检查
- 模块解析配置
- 代码智能提示
- 调试支持

### 3. 调试环境
使用浏览器开发者工具：
```javascript
// 基础调试命令
MobileContext.debugChatData()      // 调试聊天数据
MobileContext.debugJsonlData()     // 调试JSONL数据
window.debugMobileUI()             // 完整系统诊断
```

## 核心开发概念

### 4. 模块加载机制
扩展使用优化的模块加载策略：

```javascript
// 核心模块 (高优先级，并行加载)
const coreModules = [
    { src: 'context-monitor.js', priority: 'high', required: true },
    { src: 'mobile-upload.js', priority: 'high', required: true },
    { src: 'mobile-phone.js', priority: 'high', required: true }
];

// 扩展模块 (中优先级，延迟加载)
const extensionModules = [
    { src: 'context-editor.js', priority: 'medium', required: false },
    { src: 'custom-api-config.js', priority: 'medium', required: false }
];
```

### 5. 事件驱动架构
系统基于事件驱动，主要事件类型：

```javascript
// SillyTavern事件
const events = [
    'message_sent', 'message_received', 'message_edited',
    'chat_id_changed', 'character_selected',
    'generation_started', 'generation_ended'
];

// 自定义事件
window.addEventListener('contextUpdate', handler);
window.addEventListener('messageUpdate', handler);
window.addEventListener('chatChanged', handler);
```

### 6. 数据提取系统
支持多种数据格式的自动提取：

```javascript
// 添加自定义数据格式
MobileContext.addFormat(
    'customFormat',                           // 格式名称
    /\[自定义\|([^|]*)\|([^|]*)\|([^\]]*)\]/g, // 正则表达式
    ['field1', 'field2', 'field3'],          // 字段映射
    '自定义格式描述'                          // 描述
);

// 提取数据
const result = await MobileContext.extractFromChat('customFormat');
```

## 应用开发指南

### 7. 创建新应用
创建新应用需要以下步骤：

#### 步骤1: 创建应用文件
在 `app/` 目录下创建 `my-app.js`:

```javascript
// 避免重复定义
if (typeof window.MyApp === 'undefined') {

class MyApp {
    constructor() {
        this.currentView = 'main';
        this.data = [];
        this.init();
    }

    init() {
        console.log('[My App] 应用初始化');
        this.setupEventListeners();
    }

    // 必需方法：显示应用
    show() {
        return `
            <div class="my-app-container">
                <div class="app-header">
                    <h2>我的应用</h2>
                    <button class="back-btn" onclick="mobilePhone.goBack()">返回</button>
                </div>
                <div class="app-content">
                    <!-- 应用内容 -->
                </div>
            </div>
        `;
    }

    // 必需方法：隐藏应用
    hide() {
        // 清理资源
    }

    // 可选方法：应用激活时调用
    onActivate() {
        console.log('[My App] 应用激活');
    }

    // 可选方法：应用失活时调用
    onDeactivate() {
        console.log('[My App] 应用失活');
    }

    setupEventListeners() {
        // 设置事件监听器
    }
}

// 暴露到全局
window.MyApp = MyApp;

} // 结束重复定义检查
```

#### 步骤2: 创建样式文件
创建 `app/my-app.css`:

```css
.my-app-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #f5f5f5;
}

.app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: white;
    border-bottom: 1px solid #e0e0e0;
}

.app-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}
```

#### 步骤3: 注册应用
在 `mobile-phone.js` 的 `registerApps()` 方法中添加：

```javascript
registerApps() {
    // 现有应用...
    
    // 注册新应用
    this.registerApp('myapp', {
        name: '我的应用',
        icon: '🎯',
        app: window.MyApp,
        description: '我的自定义应用'
    });
}
```

#### 步骤4: 更新主入口文件
在 `index.js` 中添加加载逻辑：

```javascript
// 在适当位置添加
const myAppScript = document.createElement('script');
myAppScript.src = './scripts/extensions/third-party/mobile/app/my-app.js';
myAppScript.onload = () => {
    console.log('[Mobile Context] 我的应用加载完成');
};
document.head.appendChild(myAppScript);

// 加载样式
const myAppStyle = document.createElement('link');
myAppStyle.rel = 'stylesheet';
myAppStyle.href = './scripts/extensions/third-party/mobile/app/my-app.css';
document.head.appendChild(myAppStyle);
```

### 8. 应用间通信
使用事件系统进行应用间通信：

```javascript
// 发送事件
window.dispatchEvent(new CustomEvent('myAppEvent', {
    detail: { data: 'some data' }
}));

// 监听事件
window.addEventListener('myAppEvent', (event) => {
    console.log('收到事件:', event.detail);
});
```

### 9. 数据持久化
使用localStorage进行数据持久化：

```javascript
class MyApp {
    saveData() {
        localStorage.setItem('myApp_data', JSON.stringify(this.data));
    }

    loadData() {
        const saved = localStorage.getItem('myApp_data');
        if (saved) {
            this.data = JSON.parse(saved);
        }
    }
}
```

## 高级开发技巧

### 10. 性能优化
#### 增量渲染
```javascript
class MyApp {
    render() {
        // 只渲染变化的部分
        const newItems = this.getNewItems();
        if (newItems.length > 0) {
            this.appendItems(newItems);
        }
    }

    getNewItems() {
        return this.data.slice(this.lastRenderedIndex);
    }
}
```

#### 防抖处理
```javascript
class MyApp {
    constructor() {
        this.debouncedUpdate = this.debounce(this.update.bind(this), 300);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}
```

### 11. 错误处理
```javascript
class MyApp {
    async loadData() {
        try {
            const data = await this.fetchData();
            this.processData(data);
        } catch (error) {
            console.error('[My App] 数据加载失败:', error);
            this.showErrorMessage('数据加载失败，请重试');
        }
    }

    showErrorMessage(message) {
        // 显示用户友好的错误信息
    }
}
```

### 12. 内存管理
```javascript
class MyApp {
    constructor() {
        this.eventListeners = [];
        this.timers = [];
    }

    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    destroy() {
        // 清理事件监听器
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });

        // 清理定时器
        this.timers.forEach(timer => clearTimeout(timer));
        
        // 清理其他资源
        this.data = null;
    }
}
```

## 调试和测试

### 13. 调试技巧
```javascript
// 启用详细日志
MobileContext.setLogLevel('debug');

// 检查应用状态
console.log('应用状态:', {
    currentApp: mobilePhone.currentApp,
    appStack: mobilePhone.appStack,
    isVisible: mobilePhone.isVisible
});

// 检查数据提取
const formats = MobileContext.listFormats();
console.log('支持的格式:', formats);
```

### 14. 性能测试
```javascript
// 测试渲染性能
console.time('render');
myApp.render();
console.timeEnd('render');

// 测试内存使用
const memoryBefore = performance.memory?.usedJSHeapSize;
myApp.loadLargeDataset();
const memoryAfter = performance.memory?.usedJSHeapSize;
console.log('内存增长:', memoryAfter - memoryBefore, 'bytes');
```

### 15. 单元测试
```javascript
// 简单的测试框架
function test(name, testFunc) {
    try {
        testFunc();
        console.log(`✅ ${name} - 通过`);
    } catch (error) {
        console.error(`❌ ${name} - 失败:`, error);
    }
}

// 测试示例
test('数据提取测试', () => {
    const testText = '[测试|数据1|数据2|数据3]';
    const result = MobileContext.extractFromText(testText, 'testFormat');
    if (result.length !== 1) {
        throw new Error('提取结果数量不正确');
    }
});
```

## 最佳实践

### 16. 代码规范
- 使用一致的命名约定
- 添加详细的注释
- 实现错误处理
- 避免全局变量污染
- 使用模块化设计

### 17. 用户体验
- 提供加载状态指示
- 实现流畅的动画效果
- 支持键盘导航
- 提供用户反馈
- 保持界面响应性

### 18. 安全考虑
- 验证用户输入
- 防止XSS攻击
- 安全存储敏感数据
- 限制API调用频率
- 实现适当的权限控制

## 常见问题解决

### 19. 模块加载失败
```javascript
// 检查模块是否加载
if (!window.MyApp) {
    console.error('MyApp 模块未加载');
    // 尝试重新加载
    loadMyAppModule();
}
```

### 20. 事件监听器不工作
```javascript
// 确保在DOM加载完成后添加监听器
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

// 或使用jQuery
$(document).ready(() => {
    setupEventListeners();
});
```

### 21. 样式冲突
```javascript
// 使用命名空间避免样式冲突
.my-app-container .button {
    /* 应用特定样式 */
}

// 或使用CSS模块
.myApp_button_xyz123 {
    /* 唯一的类名 */
}
```

## 部署和发布

### 22. 版本管理
- 更新 `manifest.json` 中的版本号
- 添加变更日志
- 测试新功能
- 检查向后兼容性

### 23. 性能优化
- 压缩JavaScript和CSS文件
- 优化图片资源
- 减少HTTP请求
- 实现缓存策略

### 24. 文档更新
- 更新README文件
- 添加API文档
- 提供使用示例
- 记录已知问题

通过遵循这个开发者指南，你可以有效地扩展和维护SillyTavern Mobile Context Monitor，创建功能丰富且性能优良的移动端应用。
