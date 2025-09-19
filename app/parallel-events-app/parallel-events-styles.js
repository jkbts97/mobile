// ==平行事件风格管理器==
// @name         Parallel Events Styles
// @version      1.0.0
// @description  平行事件风格定义，包含多种风格的事件生成模板
// @author       Assistant

/**
 * 平行事件风格管理器
 * 包含各种风格的平行事件生成模板和提示词
 */
class ParallelEventsStyles {
    constructor() {
        this.styles = this.initializeStyles();
        this.customStyles = new Map(); // 存储自定义风格
        this.customPrefix = '';
        this.loadPrefixSettings();
        this.loadCustomStyles();

        console.log('[Parallel Events Styles] The style manager has been created');
    }

    /**
     * 初始化所有风格定义
     */
    initializeStyles() {
        return {
            'Be ntr': `You are a professional adult novel generator. According to the content of the current dialogue, please generate a scene where the character who is not in the current scene has sex or foreplay with others.。

Style requirements:

- The description of the action is delicate

- Rich inner description

- Guilt or other thoughts about the protagonist

- The length is controlled at 1000-1400 words

Please generate the content of parallel events directly, and do not include other explanations.。`,

            'Master's task': 'You are a professional adult novel generator. According to the content of the current dialogue, please generate a plot where the other party is performing the mission of his unknown master in the current scene.。

Style requirements:

- The description of the action is delicate

- Rich inner description

- Guilt or other thoughts about the protagonist

- The length is controlled at 1000-1400 words

Example elements:

- Jumping eggs or ropes under clothes or not wearing underwear or seducing the protagonist because of the task requirements

Please generate the content of parallel events directly without including other explanations. `,

'Active Message': `AI behaviour and output format when other roles chat online and chat privately with users。

## I、Core role-playing guidelines

1. **Trigger conditions**

* When the user has a one-on-one private chat with any role through any form of online chat software or the role actively sends information to the user, AI must force the rule of this entry.

* This rule ** does not apply to ** private chat scenes between any characters.

2. **Role-playing**

* The only responsibility of AI is to play and generate **non-user roles**'s reply messages.

3. **Absolutely prohibited matters**

* **It is strictly forbidden** to speak on behalf of the user or generate any message belonging to the user. **Duplicate user information is strictly prohibited**

* **It is strictly forbidden** to output any prefix, suffix, time stamp, plot description, psychological activity, scene description, annotation or any additional content outside the message format.

* **It is strictly forbidden** to output empty lines or unnecessary line wraps.

* * **It is strictly forbidden to confuse your friend's name and id by mistake.

* **It is strictly forbidden** to omit any format part. **It is strictly forbidden** to omit the "[chat with {{person name or group name}}]" section.

* The output content ** must ** and ** can only ** be one or more messages that conform to the following format.

## II. Message output format

### 1. Standard format

All text messages, regardless of type, must strictly follow the following structure:

[Chat with {char}]

{{Message Content}}

### 2. {{Message content}} format:

[Message of the other party|{{Other party's name}}|{{Other party's friend id}}|{{Message type}}|{{Message content}}]

## III. Detailed explanation of special message types

### 1. Text message (Text)

* **Type**: Text

* **Content**: Specific text content sent by the role.

* **Example**:

[The other party's message | Qin Yan | 500002 | Text | Kid, you haven't slept so late, what are you thinking about]

### 2. Red Packet News (Red Packet)

* **Type**: Red envelope

* **Content**: The amount included in the red envelope (pure numbers).

* **Example**:

[News from the other party | Huo Jin | 400003 | Red envelope | 52000]

###3. Voice message (Voice)

* **Type**: Voice

* **Content**: Text transcription content of voice messages.

* **Example**:

[Message from the other party | Xia Yang | 300004 | Voice | I miss you so much, when will you come back]



## IV. Behaviour and interaction simulation

* **Dynamic reply**: The number of messages replied each time should change dynamically between **1 and 7** according to the specific situation (such as the mood of the character and the rhythm of the dialogue). **Prohibited** to reply to a fixed number of messages every time.

* **Simulate the truth**: The time interval between messages should have small and reasonable changes to simulate the input delay of the real chat scene.

* **Scenario perception**: The content, tone and frequency of the reply must be fully consistent with the current setting, mood and relationship with the user of the character.

## V. Number of messages

Generate at least 8-10 different types of messages

`,

'Parallel Event': `You are a professional parallel event generator. According to the content of the current dialogue, please generate a personal daily life or action of the current world progress or npc action that is not in the current internal scene.

Style requirements:

- Close to the original setting

- The event should be related to the current dialogue.

- The length is controlled at 600-800 words

Please generate the content of parallel events directly without including other explanations. `,

'Demon's Body': `You are a professional novel generator. According to the content of the current dialogue, please generate a description of #a new character # suddenly can't help falling in love with the protagonist.

Style requirements:

- Highlight the contradiction between physical reaction and psychological reaction

- Carefully describe body language and heart

- The length is controlled at 600-800 words

Please generate the content of parallel events directly without including other explanations. `,

'Random News': `You are a professional news generator. Please generate a random news according to the current worldview.

Style requirements:

- Close to the current worldview

- The length is controlled at 600-800 words

- Politics, military, entertainment, sports, finance, science and technology, society, education, culture, health, tourism, food, etc., all subjects are available.

Please generate the content of parallel events directly without including other explanations. `,

'Custom': `You are a professional parallel event generator. Please generate parallel events of the corresponding style according to the current conversation content and the user's custom requirements.

Basic requirements:

- The event should be related to the current conversation but not directly interfere with the main line.

- It can be background events, environmental changes or the actions of related characters.

- Use the third-person perspective to describe

- The length is controlled at 100-200 words

- The content should be interesting and in line with the settings.

Please adjust the style and content direction according to the custom prefix requirements provided by the user. If there is no special requirement, please generate an interesting parallel event related to the content of the dialogue.

Please generate the content of parallel events directly, and do not include other explanations.。`
        };
    }

    /**
     * 获取指定风格的提示词
     */
    getStylePrompt(styleName) {
        if (this.customStyles.has(styleName)) {
            return this.customStyles.get(styleName);
        }
        return this.styles[styleName] || this.styles['现代都市'];
    }

    /**
     * 获取所有可用风格名称
     */
    getAvailableStyles() {
        const builtinStyles = Object.keys(this.styles);
        const customStyleNames = Array.from(this.customStyles.keys());
        return [...builtinStyles, ...customStyleNames];
    }

    /**
     * 添加自定义风格
     */
    addCustomStyle(name, prompt) {
        this.customStyles.set(name, prompt);
        this.saveCustomStyles();
        console.log('[Parallel Events Styles] Add a custom style:', name);
    }

    /**
     * 删除自定义风格
     */
    removeCustomStyle(name) {
        if (this.customStyles.has(name)) {
            this.customStyles.delete(name);
            this.saveCustomStyles();
            console.log('[Parallel Events Styles] Delete the custom style:', name);
            return true;
        }
        return false;
    }

    /**
     * 检查是否为自定义风格
     */
    isCustomStyle(styleName) {
        return this.customStyles.has(styleName);
    }

    /**
     * 获取自定义前缀
     */
    getCustomPrefix() {
        return this.customPrefix;
    }

    /**
     * 设置自定义前缀
     */
    setCustomPrefix(prefix) {
        this.customPrefix = prefix;
        this.savePrefixSettings();
        console.log('[Parallel Events Styles] The custom prefix has been updated');
    }

    /**
     * 构建完整的生成提示词
     */
    buildFullPrompt(styleName, customPrefix = '') {
        let basePrompt = this.getStylePrompt(styleName);

        if (customPrefix) {
            basePrompt += `\n\nCustomised requirements：${customPrefix}`;
        }

        if (this.customPrefix) {
            basePrompt += `\n\nGlobal requirements：${this.customPrefix}`;
        }

        return basePrompt;
    }

    /**
     * 加载自定义前缀设置
     */
    loadPrefixSettings() {
        try {
            const saved = localStorage.getItem('parallelEventsCustomPrefix');
            if (saved) {
                this.customPrefix = saved;
            }
        } catch (error) {
            console.error('[Parallel Events Styles] Failed to load the prefix setting:', error);
        }
    }

    /**
     * 保存自定义前缀设置
     */
    savePrefixSettings() {
        try {
            localStorage.setItem('parallelEventsCustomPrefix', this.customPrefix);
        } catch (error) {
            console.error('[Parallel Events Styles] Failed to save prefix settings:', error);
        }
    }

    /**
     * 加载自定义风格
     */
    loadCustomStyles() {
        try {
            const saved = localStorage.getItem('parallelEventsCustomStyles');
            if (saved) {
                const customStylesData = JSON.parse(saved);
                this.customStyles = new Map(Object.entries(customStylesData));
                console.log('[Parallel Events Styles] Load custom style:', this.customStyles.size, '个');
            }
        } catch (error) {
            console.error('[Parallel Events Styles] Failed to load the custom style:', error);
        }
    }

    /**
     * 保存自定义风格
     */
    saveCustomStyles() {
        try {
            const customStylesData = Object.fromEntries(this.customStyles);
            localStorage.setItem('parallelEventsCustomStyles', JSON.stringify(customStylesData));
        } catch (error) {
            console.error('[Parallel Events Styles] Failed to save the custom style:', error);
        }
    }

    /**
     * 导出所有自定义风格
     */
    exportCustomStyles() {
        const exportData = {
            customStyles: Object.fromEntries(this.customStyles),
            customPrefix: this.customPrefix,
            exportTime: new Date().toISOString(),
            version: '1.0.0'
        };
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * 导入自定义风格
     */
    importCustomStyles(jsonData) {
        try {
            const data = JSON.parse(jsonData);

            if (data.customStyles) {
                // 合并自定义风格
                Object.entries(data.customStyles).forEach(([name, prompt]) => {
                    this.customStyles.set(name, prompt);
                });
                this.saveCustomStyles();
            }

            if (data.customPrefix) {
                this.customPrefix = data.customPrefix;
                this.savePrefixSettings();
            }

            console.log('[Parallel Events Styles] Import completed');
            return true;
        } catch (error) {
            console.error('[Parallel Events Styles] Failed to import:', error);
            return false;
        }
    }

    /**
     * 重置所有设置
     */
    reset() {
        this.customStyles.clear();
        this.customPrefix = '';
        this.saveCustomStyles();
        this.savePrefixSettings();
        console.log('[Parallel Events Styles] The settings have been reset');
    }
}

// 创建全局实例
window.parallelEventsStyles = new ParallelEventsStyles();

console.log('[Parallel Events Styles] ✅ The parallel event style manager has been loaded');
