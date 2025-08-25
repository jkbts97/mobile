# Live App 正确事件监听系统分析

## 核心发现

Live App 成功实现了正确的 SillyTavern 事件监听，**没有使用轮询模式**，而是使用了正确的事件系统接口。

## 正确的事件监听实现

### 1. 事件监听的正确接口

#### 方法1: SillyTavern.getContext().eventSource（推荐）
```javascript
// app/live-app.js 第42-56行
if (
  typeof window !== 'undefined' &&
  window.SillyTavern &&
  typeof window.SillyTavern.getContext === 'function'
) {
  const context = window.SillyTavern.getContext();
  if (context && context.eventSource && typeof context.eventSource.on === 'function' && context.event_types) {
    console.log('[Live App] 使用SillyTavern.getContext().eventSource监听MESSAGE_RECEIVED事件');
    context.eventSource.on(context.event_types.MESSAGE_RECEIVED, this.messageReceivedHandler);
    this.isListening = true;
    console.log('[Live App] ✅ 成功开始监听SillyTavern消息事件 (context.eventSource)');
    return;
  }
}
```

#### 方法2: 全局 eventOn 函数
```javascript
// app/live-app.js 第59-67行
if (typeof eventOn === 'function' && typeof tavern_events !== 'undefined' && tavern_events.MESSAGE_RECEIVED) {
  console.log('[Live App] 使用全局eventOn监听MESSAGE_RECEIVED事件');
  eventOn(tavern_events.MESSAGE_RECEIVED, this.messageReceivedHandler);
  this.isListening = true;
  console.log('[Live App] ✅ 成功开始监听SillyTavern消息事件 (eventOn)');
  return;
}
```

#### 方法3: 父窗口 eventSource
```javascript
// app/live-app.js 第69-84行
if (
  typeof window !== 'undefined' &&
  window.parent &&
  window.parent.eventSource &&
  typeof window.parent.eventSource.on === 'function'
) {
  console.log('[Live App] 使用父窗口eventSource监听MESSAGE_RECEIVED事件');
  if (window.parent.event_types && window.parent.event_types.MESSAGE_RECEIVED) {
    window.parent.eventSource.on(window.parent.event_types.MESSAGE_RECEIVED, this.messageReceivedHandler);
    this.isListening = true;
    console.log('[Live App] ✅ 成功开始监听SillyTavern消息事件 (parent eventSource)');
    return;
  }
}
```

### 2. 关键差异分析

#### Message App 的错误做法
```javascript
// message-app.js 中的错误检测
const detectionMethods = [
  // 方法1：直接全局访问
  () => ({
    eventSource: window['eventSource'],        // ❌ 错误：直接访问全局变量
    event_types: window['event_types'],        // ❌ 错误：直接访问全局变量
  }),
  
  // 方法2：通过SillyTavern对象
  () => ({
    eventSource: window['SillyTavern']?.eventSource,     // ❌ 错误：直接访问属性
    event_types: window['SillyTavern']?.event_types,     // ❌ 错误：直接访问属性
  }),
];
```

#### Live App 的正确做法
```javascript
// live-app.js 中的正确检测
const context = window.SillyTavern.getContext();        // ✅ 正确：使用 getContext() 方法
if (context && context.eventSource && context.event_types) {
  context.eventSource.on(context.event_types.MESSAGE_RECEIVED, handler);  // ✅ 正确：使用上下文中的事件系统
}
```

## 正确的数据获取实现

### 1. 获取聊天消息数量

#### 正确方法1: SillyTavern.getContext().chat
```javascript
// app/live-app.js 第194-206行
if (
  typeof window !== 'undefined' &&
  window.SillyTavern &&
  typeof window.SillyTavern.getContext === 'function'
) {
  const context = window.SillyTavern.getContext();
  if (context && context.chat && Array.isArray(context.chat)) {
    const count = context.chat.length;
    console.log(`[Live App] 通过SillyTavern.getContext().chat获取到 ${count} 条消息`);
    return count;
  }
}
```

#### 备用方法: mobileContextEditor
```javascript
// app/live-app.js 第208-216行
const mobileContextEditor = window['mobileContextEditor'];
if (mobileContextEditor && typeof mobileContextEditor.getCurrentChatData === 'function') {
  const chatData = mobileContextEditor.getCurrentChatData();
  if (chatData && chatData.messages && Array.isArray(chatData.messages)) {
    console.log(`[Live App] 通过mobileContextEditor获取到 ${chatData.messages.length} 条消息`);
    return chatData.messages.length;
  }
}
```

### 2. 获取聊天消息内容

#### 正确方法: 通过 context.chat 获取完整消息
```javascript
// app/live-app.js 第505-520行
const context = window.SillyTavern.getContext();
if (context && context.chat && Array.isArray(context.chat)) {
  const messages = context.chat;
  if (messages && messages.length > 0) {
    const content = messages.map(msg => msg.mes || '').join('\n');
    console.log(`[Live App] 通过SillyTavern.getContext().chat获取到聊天内容，长度: ${content.length}`);
    return content;
  }
}
```

## 事件处理流程

### 1. 事件监听器设置
```javascript
// app/live-app.js 第14-21行
class LiveEventListener {
  constructor(liveApp) {
    this.liveApp = liveApp;
    this.isListening = false;
    this.lastMessageCount = 0;
    this.pollingInterval = null;
    this.messageReceivedHandler = this.onMessageReceived.bind(this);  // ✅ 正确：绑定处理函数
  }
}
```

### 2. 消息接收处理
```javascript
// app/live-app.js 第159-187行
async onMessageReceived(messageId) {
  try {
    console.log(`[Live App] 🎯 接收到AI消息事件，ID: ${messageId}`);
    
    // 检查是否有新消息
    const currentMessageCount = this.getCurrentMessageCount();
    console.log(`[Live App] 消息数量检查: 当前=${currentMessageCount}, 上次=${this.lastMessageCount}`);
    
    if (currentMessageCount <= this.lastMessageCount) {
      console.log('[Live App] 没有检测到新消息，跳过解析');
      return;
    }
    
    console.log(`[Live App] ✅ 检测到新消息，消息数量从 ${this.lastMessageCount} 增加到 ${currentMessageCount}`);
    this.lastMessageCount = currentMessageCount;
    
    // 触发数据解析
    await this.liveApp.parseNewLiveData();
  } catch (error) {
    console.error('[Live App] 处理消息接收事件失败:', error);
  }
}
```

## 关键成功因素

### 1. 使用正确的 API 接口
- ✅ `window.SillyTavern.getContext()` 而不是直接访问属性
- ✅ `context.eventSource` 而不是全局 `eventSource`
- ✅ `context.event_types.MESSAGE_RECEIVED` 而不是猜测事件名称

### 2. 多层级备用方案
- 主要方案：`SillyTavern.getContext()`
- 备用方案1：全局 `eventOn` 函数
- 备用方案2：父窗口 `eventSource`
- 最后备用：轮询模式

### 3. 正确的事件绑定
- ✅ 使用 `.on()` 方法绑定事件
- ✅ 使用 `.off()` 方法解绑事件
- ✅ 正确的事件类型：`MESSAGE_RECEIVED`

### 4. 健壮的错误处理
- 每个方法都有 try-catch 包装
- 详细的日志输出用于调试
- 优雅的降级到备用方案

## 为什么 Live App 成功而 Message App 失败

### Live App 成功的原因
1. **使用了正确的 API**: `window.SillyTavern.getContext()`
2. **正确的事件系统访问**: 通过 context 获取 eventSource
3. **正确的事件类型**: `MESSAGE_RECEIVED`
4. **多层级备用方案**: 3种不同的事件监听方法

### Message App 失败的原因
1. **错误的 API 访问**: 直接访问 `window.eventSource`
2. **错误的属性路径**: `window.SillyTavern.eventSource`
3. **缺少 getContext() 调用**: 没有使用正确的上下文获取方法
4. **检测方法不完整**: 缺少关键的检测路径

## 结论

Live App 的成功证明了正确的 SillyTavern 事件监听是完全可行的。关键在于：

1. **使用 `window.SillyTavern.getContext()` 获取上下文**
2. **通过上下文访问 `eventSource` 和 `event_types`**
3. **监听 `MESSAGE_RECEIVED` 事件**
4. **通过 `context.chat` 获取聊天数据**

这套方法已经在 Live App 中得到验证，可以完全替代 Message App 中的轮询方案。
