# Message App 事件监听系统重构详细计划

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
**文件**: `app/message-app.js` 第565-638行

**当前错误实现**:
```javascript
// 错误的检测方法
() => ({
  eventSource: window['eventSource'],
  event_types: window['event_types'],
})
```

**需要替换为 Live App 的正确实现**:
```javascript
smartDetectEventSystem() {
  console.log('[Message App] 🧠 开始智能检测事件系统...');

  const detectionMethods = [
    // 方法1: 使用SillyTavern.getContext().eventSource（推荐，Live App验证成功）
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

    // 方法2: 使用全局 eventOn 函数（Live App验证成功）
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

    // 方法3: 使用父窗口 eventSource（Live App验证成功）
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
**文件**: `app/message-app.js` 第516-562行

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

    // 如果检测失败，延迟重试
    console.warn('[Message App] SillyTavern事件系统未准备就绪，延迟监听...');
    this.retryCount++;
    console.log(`[Message App] 重试次数: ${this.retryCount}/${this.maxRetries}`);

    if (this.retryCount < this.maxRetries) {
      setTimeout(() => {
        this.setupSillyTavernEventListeners();
      }, this.retryDelay);
    } else {
      console.warn('[Message App] 达到最大重试次数，切换到轮询模式');
      this.fallbackToPolling();
    }
  } catch (error) {
    console.error('[Message App] 设置事件监听器失败:', error);
    this.fallbackToPolling();
  }
}
```

### 阶段2: 替换数据获取方法

#### 2.1 替换 getCurrentMessageCount() 方法
**文件**: `app/message-app.js` 第641-700行

**新的实现**:
```javascript
getCurrentMessageCount() {
  try {
    // 方法1: 使用SillyTavern.getContext().chat（正确的接口，Live App验证成功）
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

    // 方法4: 使用getContext()方法（如果可用）
    if (typeof window !== 'undefined' && window.getContext && typeof window.getContext === 'function') {
      const context = window.getContext();
      if (context && context.chat && Array.isArray(context.chat)) {
        const count = context.chat.length;
        console.log(`[Message App] 通过getContext()获取到 ${count} 条消息`);
        return count;
      }
    }

    console.warn('[Message App] 无法获取消息数量，使用默认值0');
    return 0;
  } catch (error) {
    console.error('[Message App] 获取消息数量失败:', error);
    return 0;
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
```

### 阶段3: 替换聊天数据获取方法

#### 3.1 替换 getSillyTavernChatData() 方法
**文件**: `app/message-app.js`

**新的实现**:
```javascript
getSillyTavernChatData() {
  try {
    // 方法1: 使用SillyTavern.getContext().chat（正确的接口，Live App验证成功）
    if (
      typeof window !== 'undefined' &&
      window.SillyTavern &&
      typeof window.SillyTavern.getContext === 'function'
    ) {
      const context = window.SillyTavern.getContext();
      if (context && context.chat && Array.isArray(context.chat)) {
        const messages = context.chat;
        console.log(`[Message App] 通过SillyTavern.getContext().chat获取到 ${messages.length} 条消息`);
        return {
          messages: messages,
          messageCount: messages.length,
          lastMessageId: messages.length > 0 ? messages[messages.length - 1].id || messages.length - 1 : null,
        };
      }
    }

    // 备用方法...（保持现有的备用方法）
    
    return null;
  } catch (error) {
    console.error('[Message App] 获取聊天数据失败:', error);
    return null;
  }
}
```

## 实施步骤

### 步骤1: 备份现有代码
在开始修改前，备份 `app/message-app.js` 文件

### 步骤2: 逐步替换方法
1. 先替换 `smartDetectEventSystem()` 方法
2. 然后替换 `setupSillyTavernEventListeners()` 方法
3. 添加 `onMessageReceived()` 方法
4. 替换数据获取相关方法

### 步骤3: 测试验证
1. 测试事件监听是否正常工作
2. 验证消息数据获取是否正确
3. 确认不再使用轮询模式

### 步骤4: 清理代码
移除不再需要的轮询相关代码

## 预期效果

重构完成后，Message App 将：
- ✅ 使用正确的事件监听系统
- ✅ 实时响应消息变化（无延迟）
- ✅ 减少浏览器负担（无轮询）
- ✅ 提高性能和稳定性

## 风险评估

### 低风险
- Live App 已经验证了这套方法的可行性
- 保留轮询作为最后的备用方案

### 注意事项
- 需要确保在正确的时机初始化事件监听
- 需要处理好事件监听器的清理工作

## 总结

这个重构计划基于 Live App 的成功经验，将 Message App 的事件监听系统从错误的轮询模式改为正确的事件驱动模式。关键是使用 `window.SillyTavern.getContext()` 获取正确的上下文，然后通过上下文访问事件系统和聊天数据。
