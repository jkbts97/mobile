# 附件发送功能增强总结

## 📋 需求概述

用户需要对附件发送功能进行以下增强：

1. **添加指导文本**：在发送附件时，在"向XX发送消息"后面添加指导文本
2. **新增输入框**：在发送附件弹窗中添加一个输入框，允许用户输入额外的消息
3. **支持多行消息**：用户可以使用换行分割，发送多条消息
4. **保持原有逻辑**：不修改原有的附件发送逻辑，只是增加新功能

## 🔧 实现的修改

### 1. message-app.js 修改

#### 1.1 附件面板HTML结构增强
- **位置**：`showAttachmentPanel()` 方法中的HTML模板
- **修改内容**：在文件预览区域后添加了新的输入框区域

```html
<div style="margin-bottom: 20px;">
    <h4 style="margin: 0 0 10px 0; color: #555; font-size: 14px;">附加消息（可选）：</h4>
    <textarea id="attachment-message-input" placeholder="输入要一起发送的消息内容，支持换行发送多条消息..." 
              style="width: 100%; min-height: 80px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; resize: vertical; font-size: 14px; font-family: inherit; box-sizing: border-box;"
              maxlength="1000"></textarea>
    <div style="font-size: 12px; color: #999; margin-top: 5px;">
        提示：每行内容将作为单独的消息发送，最多1000字符
    </div>
</div>
```

#### 1.2 发送按钮事件处理增强
- **位置**：`bindAttachmentPanelEvents()` 方法中的发送按钮事件
- **修改内容**：获取输入框内容并传递给attachment-sender

```javascript
// 获取附加消息内容
const messageInput = panel.querySelector('#attachment-message-input');
const additionalMessages = messageInput ? messageInput.value.trim() : '';

// 将附加消息传递给attachmentSender
const results = await window.attachmentSender.handleFileSelection(selectedFiles, additionalMessages);
```

### 2. attachment-sender.js 修改

#### 2.1 handleFileSelection 方法签名更新
- **修改前**：`async handleFileSelection(files)`
- **修改后**：`async handleFileSelection(files, additionalMessages = '')`

#### 2.2 sendAttachmentMessage 方法签名更新
- **修改前**：`async sendAttachmentMessage(uploadResult)`
- **修改后**：`async sendAttachmentMessage(uploadResult, additionalMessages = '')`

#### 2.3 消息构建逻辑增强
在 `sendAttachmentMessage` 方法中的消息构建部分添加了：

1. **指导文本添加**：
```javascript
if (this.isCurrentChatGroup) {
    messageContent = `向${this.currentChatName}（${this.currentChatTarget}）发送群聊消息\n\n`;
    messageContent += `请按照线上聊天群聊消息中的要求和格式生成角色回复，回复需要符合角色人设和当前剧情\n\n`;
} else {
    messageContent = `向${this.currentChatName}（${this.currentChatTarget}）发送消息\n\n`;
    messageContent += `请按照线上聊天私聊消息中的要求和格式生成角色回复，回复需要符合角色人设和当前剧情\n\n`;
}
```

2. **附加消息处理**：
```javascript
if (additionalMessages && additionalMessages.trim()) {
    const messageLines = additionalMessages.split('\n').filter(line => line.trim());
    
    for (const line of messageLines) {
        const trimmedLine = line.trim();
        if (trimmedLine) {
            messageContent += `[我方消息|${this.currentChatName}|${this.currentChatTarget}|文字|${trimmedLine}]\n`;
        }
    }
    messageContent += '\n';
}
```

#### 2.4 方法调用更新
在 `handleFileSelection` 方法中更新了对 `sendAttachmentMessage` 的调用：
```javascript
const sendSuccess = await this.sendAttachmentMessage(uploadResult, additionalMessages);
```

## 📝 消息格式示例

### 原始格式（仅附件）
```
向秦倦（500002）发送消息

[我方消息|秦倦|500002|附件|图片: IMG_1160(20250821-022207).PNG]
```

### 增强后格式（附件 + 指导文本 + 用户消息）
```
向秦倦（500002）发送消息

请按照线上聊天私聊消息中的要求和格式生成角色回复，回复需要符合角色人设和当前剧情

[我方消息|秦倦|500002|文字|这是第一条消息]
[我方消息|秦倦|500002|文字|这是第二条消息]

[我方消息|秦倦|500002|附件|图片: IMG_1160(20250821-022207).PNG]
```

## ✅ 功能特性

1. **向后兼容**：如果用户不输入附加消息，功能与原来完全一致
2. **多行支持**：用户可以输入多行文本，每行作为单独的消息发送
3. **格式正确**：使用正确的message-app格式 `[我方消息|好友名|好友ID|文字|消息内容]`
4. **指导文本**：自动添加AI回复指导文本，区分私聊和群聊
5. **用户友好**：提供清晰的界面提示和说明

## 🧪 测试

创建了 `test-attachment-enhancement.html` 测试页面，可以：
- 测试消息构建逻辑
- 验证不同参数组合的输出
- 查看预期的消息格式

## 📁 修改的文件

1. `app/message-app.js` - 附件面板UI和事件处理
2. `app/attachment-sender.js` - 消息构建和发送逻辑
3. `test-attachment-enhancement.html` - 功能测试页面（新增）
4. `ATTACHMENT_ENHANCEMENT_SUMMARY.md` - 本文档（新增）

## 🎯 使用方法

1. 用户点击附件按钮打开发送附件弹窗
2. 选择要发送的文件
3. 在"附加消息（可选）"输入框中输入额外的文本消息
4. 支持多行输入，每行将作为单独的消息发送
5. 点击"发送附件"按钮
6. 系统将按顺序发送：指导文本 + 用户输入的消息 + 附件信息

所有修改都保持了原有功能的完整性，只是在现有基础上增加了新的功能。
