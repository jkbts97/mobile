# Message App 事件监听系统重构计划

## 重构目标

将 Message App 的事件监听系统从**错误的轮询模式**重构为**正确的事件监听模式**，参考 Live App 的成功实现。

## 问题分析

### 当前 Message App 的问题
1. **错误的事件系统检测**: 使用了错误的 API 路径
2. **缺少 getContext() 调用**: 没有使用 SillyTavern 的正确接口
3. **检测方法不完整**: 缺少关键的检测路径
4. **数据获取方式错误**: 没有使用正确的聊天数据获取方法

### Live App 的成功要素
1. **正确的 API 接口**: `window.SillyTavern.getContext()`
2. **正确的事件系统**: `context.eventSource` 和 `context.event_types`
3. **正确的事件类型**: `MESSAGE_RECEIVED`
4. **正确的数据获取**: `context.chat`

## 重构计划

### 阶段1: 替换事件检测系统

#### 1.1 替换 smartDetectEventSystem() 方法
**文件**: `app/message-app.js` 第611-700行

**当前错误实现**:
```javascript
// 错误的检测方法
() => ({
  eventSource: window['eventSource'],
  event_types: window['event_types'],
})
```

**新的正确实现**:
```javascript
smartDetectEventSystem() {
  console.log('[Message App] 🧠 开始智能检测事件系统...');
  
  const detectionMethods = [
    // 方法1: 使用SillyTavern.getContext().eventSource（推荐）
    () => {
      if (
        typeof window !== 'undefined' &&
        window.SillyTavern &&
        typeof window.SillyTavern.getContext === 'function'
      ) {
        const context = window.SillyTavern.getContext();
        if (context && context.eventSource && typeof context.eventSource.on === 'function' && context.event_types) {
          return {
            eventSource: context.eventSource,
            event_types: context.event_types,
            foundIn: 'SillyTavern.getContext()',
          };
        }
      }
      return null;
    },

    // 方法2: 使用全局 eventOn 函数
    () => {
      if (typeof eventOn === 'function' && typeof tavern_events !== 'undefined' && tavern_events.MESSAGE_RECEIVED) {
        return {
          eventSource: { on: eventOn, off: eventOff || (() => {}) },
          event_types: tavern_events,
          foundIn: 'global eventOn',
        };
      }
      return null;
    },

    // 方法3: 使用父窗口 eventSource
    () => {
      if (
        typeof window !== 'undefined' &&
        window.parent &&
        window.parent.eventSource &&
        typeof window.parent.eventSource.on === 'function'
      ) {
        if (window.parent.event_types && window.parent.event_types.MESSAGE_RECEIVED) {
          return {
            eventSource: window.parent.eventSource,
            event_types: window.parent.event_types,
            foundIn: 'parent.eventSource',
          };
        }
      }
      return null;
    },
  ];

  for (let i = 0; i < detectionMethods.length; i++) {
    try {
      const result = detectionMethods[i]();
      if (result && result.eventSource && result.event_types) {
        console.log(`[Message App] ✅ 方法${i + 1}检测成功:`, result);
        return {
          found: true,
          method: i + 1,
          ...result,
        };
      }
    } catch (error) {
      console.warn(`[Message App] 方法${i + 1}检测失败:`, error);
    }
  }

  console.warn('[Message App] ❌ 所有检测方法都失败了');
  return { found: false };
}
```

#### 1.2 修改事件监听设置
**文件**: `app/message-app.js` 第520-550行

**新的实现**:
```javascript
async setupSillyTavernEventListeners() {
  try {
    console.log('[Message App] 设置SillyTavern事件监听器...');

    // 使用新的智能检测系统
    const detectionResult = this.smartDetectEventSystem();
    if (detectionResult.found) {
      console.log('[Message App] ✅ 智能检测找到事件系统:', detectionResult);
      
      const eventSource = detectionResult.eventSource;
      const event_types = detectionResult.event_types;
      
      // 绑定消息接收事件
      if (event_types.MESSAGE_RECEIVED) {
        eventSource.on(event_types.MESSAGE_RECEIVED, this.onMessageReceived.bind(this));
        console.log('[Message App] ✅ 成功监听 MESSAGE_RECEIVED 事件');
        
        // 保存事件系统引用用于清理
        this.eventSource = eventSource;
        this.event_types = event_types;
        this.isEventListening = true;
        
        // 初始化消息计数
        this.updateMessageCount();
        return;
      }
    }

    // 如果事件监听失败，延迟重试
    if (!this.retryCount) this.retryCount = 0;
    this.retryCount++;

    if (this.retryCount <= 5) {
      console.log(`[Message App] 重试次数: ${this.retryCount}/5`);
      setTimeout(() => {
        this.setupSillyTavernEventListeners();
      }, 1000 + this.retryCount * 500); // 增加延迟时间
    } else {
      console.error('[Message App] 达到最大重试次数，切换到轮询模式');
      this.fallbackToPolling();
    }
  } catch (error) {
    console.error('[Message App] 设置事件监听失败:', error);
    this.fallbackToPolling();
  }
}
```

### 阶段2: 替换数据获取系统

#### 2.1 新增正确的数据获取方法
**文件**: `app/message-app.js`

**新增方法**:
```javascript
/**
 * 获取当前消息数量（使用正确的API）
 */
getCurrentMessageCount() {
  try {
    // 方法1: 使用SillyTavern.getContext().chat（正确的接口）
    if (
      typeof window !== 'undefined' &&
      window.SillyTavern &&
      typeof window.SillyTavern.getContext === 'function'
    ) {
      const context = window.SillyTavern.getContext();
      if (context && context.chat && Array.isArray(context.chat)) {
        const count = context.chat.length;
        console.log(`[Message App] 通过SillyTavern.getContext().chat获取到 ${count} 条消息`);
        return count;
      }
    }

    // 方法2: 使用mobileContextEditor作为备用
    const mobileContextEditor = window['mobileContextEditor'];
    if (mobileContextEditor && typeof mobileContextEditor.getCurrentChatData === 'function') {
      const chatData = mobileContextEditor.getCurrentChatData();
      if (chatData && chatData.messages && Array.isArray(chatData.messages)) {
        console.log(`[Message App] 通过mobileContextEditor获取到 ${chatData.messages.length} 条消息`);
        return chatData.messages.length;
      }
    }

    // 方法3: 尝试从父窗口获取chat变量
    if (typeof window !== 'undefined' && window.parent && window.parent.chat && Array.isArray(window.parent.chat)) {
      const count = window.parent.chat.length;
      console.log(`[Message App] 通过父窗口chat变量获取到 ${count} 条消息`);
      return count;
    }

    console.warn('[Message App] 无法获取消息数量，使用默认值0');
    return 0;
  } catch (error) {
    console.warn('[Message App] 获取消息数量失败:', error);
    return 0;
  }
}

/**
 * 获取聊天数据（使用正确的API）
 */
getSillyTavernChatData() {
  try {
    // 优先使用SillyTavern.getContext().chat
    if (
      typeof window !== 'undefined' &&
      window.SillyTavern &&
      typeof window.SillyTavern.getContext === 'function'
    ) {
      const context = window.SillyTavern.getContext();
      if (context && context.chat && Array.isArray(context.chat)) {
        return context.chat;
      }
    }

    // 尝试从全局变量获取
    const chat = window['chat'];
    if (chat && Array.isArray(chat)) {
      return chat;
    }

    return [];
  } catch (error) {
    console.error('[Message App] 获取聊天数据失败:', error);
    return [];
  }
}
```

#### 2.2 新增消息接收处理器
**文件**: `app/message-app.js`

**新增方法**:
```javascript
/**
 * 处理消息接收事件
 */
async onMessageReceived(messageId) {
  try {
    console.log(`[Message App] 🎯 接收到消息事件，ID: ${messageId}`);

    // 检查消息数量变化
    const currentMessageCount = this.getCurrentMessageCount();
    console.log(`[Message App] 消息数量检查: 当前=${currentMessageCount}, 上次=${this.lastMessageCount}`);

    if (currentMessageCount <= this.lastMessageCount) {
      console.log('[Message App] 没有检测到新消息，跳过处理');
      return;
    }

    console.log(`[Message App] ✅ 检测到新消息，消息数量从 ${this.lastMessageCount} 增加到 ${currentMessageCount}`);
    this.lastMessageCount = currentMessageCount;

    // 刷新消息显示
    this.refreshMessages();
    
    // 触发其他相关更新
    this.updateTimeDisplay();
    
  } catch (error) {
    console.error('[Message App] 处理消息接收事件失败:', error);
  }
}

/**
 * 更新消息计数
 */
updateMessageCount() {
  this.lastMessageCount = this.getCurrentMessageCount();
  console.log(`[Message App] 初始化消息计数: ${this.lastMessageCount}`);
}
```

### 阶段3: 清理和优化

#### 3.1 添加事件清理机制
**新增方法**:
```javascript
/**
 * 清理事件监听器
 */
cleanup() {
  try {
    if (this.isEventListening && this.eventSource && this.event_types) {
      if (typeof this.eventSource.off === 'function') {
        this.eventSource.off(this.event_types.MESSAGE_RECEIVED, this.onMessageReceived);
        console.log('[Message App] 已清理事件监听器');
      }
    }
    
    // 清理轮询
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    this.isEventListening = false;
  } catch (error) {
    console.error('[Message App] 清理事件监听器失败:', error);
  }
}
```

#### 3.2 修改初始化延迟
**文件**: `app/message-app.js` 第128行

**修改**:
```javascript
init() {
  setTimeout(() => {
    this.setupRealtimeMonitor();
  }, 2000); // 从100ms增加到2000ms，给SillyTavern更多加载时间
}
```

## 实施步骤

### 第一步: 备份现有代码
1. 备份 `app/message-app.js`
2. 创建测试分支

### 第二步: 实施阶段1（事件检测系统）
1. 替换 `smartDetectEventSystem()` 方法
2. 修改 `setupSillyTavernEventListeners()` 方法
3. 测试事件检测是否成功

### 第三步: 实施阶段2（数据获取系统）
1. 添加新的数据获取方法
2. 添加消息接收处理器
3. 测试消息监听是否正常

### 第四步: 实施阶段3（清理优化）
1. 添加事件清理机制
2. 调整初始化延迟
3. 全面测试功能

### 第五步: 验证和优化
1. 验证不再使用轮询模式
2. 验证消息实时更新
3. 性能测试和优化

## 预期效果

### 重构前（当前状态）
- ❌ 事件监听失败，使用轮询模式
- ❌ 消息更新有2秒延迟
- ❌ 增加浏览器负担

### 重构后（目标状态）
- ✅ 事件监听成功，实时响应
- ✅ 消息即时更新，无延迟
- ✅ 减少浏览器负担，提高性能

## 风险评估

### 低风险
- 保留轮询作为最后备选方案
- 逐步实施，可随时回滚
- 参考 Live App 的成功实现

### 注意事项
- 充分测试各种 SillyTavern 环境
- 确保向后兼容性
- 保持详细的日志输出用于调试

## 成功指标

1. **控制台不再出现轮询相关日志**
2. **出现 "✅ 成功监听 MESSAGE_RECEIVED 事件" 日志**
3. **消息更新变为即时响应**
4. **CPU 使用率降低**
