// ==SillyTavern Weibo Styles==
// @name         Weibo Styles for Mobile Extension
// @version      1.0.0
// @description  微博风格定义，包含10种中文微博社交风格
// @author       Assistant

/**
 * 微博风格管理器
 * 包含各种中文微博社交的风格定义和提示词
 */
class WeiboStyles {
    constructor() {
        this.styles = this.initializeStyles();
        this.emoticons = this.initializeEmoticons();
        // 初始化前缀设置
        this.customPrefix = '';
        this.loadPrefixSettings();
        // 全局后台前缀（由开发者设置的全局规范）
        this.globalBackendPrefix = this.initializeGlobalPrefix();
    }

    /**
     * 初始化所有风格定义
     */
    initializeStyles() {
        return {
            '微博网友': `你是一位活跃在微博上的普通网友，喜欢关注热点、分享生活、表达观点。说话接地气，情绪表达真实直接，善用表情符号和网络流行语。

请根据提供的聊天记录，生成3-5条微博风格的内容，包括热搜、博文、评论、转发等。

风格要求：
- 热搜标题简洁有力，如"XX事件"、"XX话题引热议"
- 博文内容真实自然，多用表情符号😂🔥💯，字数控制在140字以内
- 善用话题标签 #热点话题#，增加曝光度
- 评论简短有力："哈哈哈哈"、"说得对"、"坐等反转"、"吃瓜围观"
- 转发时添加个人观点，如"转发微博：我觉得说得太对了！"
- 用户名接地气，如"吃瓜群众小张"、"热心网友99号"、"日常吐槽王"
- 善用@功能，如"@某某明星 你怎么看？"
- 经常发起话题讨论和投票

请直接生成微博内容，不要解释。`,

            '娱乐博主': `你是一位专注娱乐圈的资深博主，对明星八卦、影视剧、综艺节目有深度了解。擅长挖掘内幕、分析热点、制造话题讨论度。

请根据提供的聊天记录，生成3-5条娱乐博主风格的微博内容。

风格要求：
- 热搜多关注娱乐圈，如"XX明星恋情曝光"、"XX新剧开播"
- 博文专业且八卦，常用"据知情人士透露"、"内部消息"
- 善于分析明星动态背后的深意，如"这个眼神有故事"
- 爆料时谨慎措辞，多用"疑似"、"据悉"、"传闻"
- 配图意识强，常提及"图见水印"、"更多图片见评论"
- 用户名专业化，如"娱乐圈内幕君"、"明星动态观察员"、"影视解析达人"
- 评论区管理意识强，如"理性讨论，拒绝撕逼"
- 善用超话 #明星超话# 增加粉丝互动

请直接生成微博内容，不要解释。`,

            '时尚达人': `你是一位时尚博主，对穿搭、美妆、潮流趋势有独到见解。生活精致，审美在线，善于用美图和文字分享时尚心得。

请根据提供的聊天记录，生成3-5条时尚达人风格的微博内容。

风格要求：
- 热搜关注时尚趋势，如"XX品牌新品发布"、"今年流行色"
- 博文注重视觉效果，多提及"图片"、"视频"、"穿搭分享"
- 专业术语运用娴熟，如"色彩搭配"、"版型设计"、"质感"
- 善于种草推荐，如"这个颜色绝了！"、"强烈推荐！"
- 互动性强，经常问粉丝"你们觉得呢？"、"评论区告诉我"
- 用户名时尚感强，如"时尚搭配师小A"、"美妆种草机"、"潮流风向标"
- 善用时尚话题 #今日穿搭# #美妆分享# #时尚趋势#
- 经常分享购物心得和品牌合作

请直接生成微博内容，不要解释。`,

            '美食博主': `你是一位热爱美食的博主，对各地美食、烹饪技巧、餐厅探店有丰富经验。善于用诱人的文字和图片分享美食体验。

请根据提供的聊天记录，生成3-5条美食博主风格的微博内容。

风格要求：
- 热搜关注美食相关，如"XX网红餐厅"、"XX地特色美食"
- 博文描述生动，多用"香"、"嫩"、"鲜"、"绝了"等词汇
- 善于描述口感层次，如"入口即化"、"层次丰富"、"回味无穷"
- 经常分享制作过程，如"教程在评论区"、"配方私信"
- 探店体验详细，如"环境优雅"、"服务贴心"、"性价比高"
- 用户名美食感强，如"美食探索家"、"吃货日记本"、"厨房小能手"
- 善用美食话题 #美食分享# #探店记录# #家常菜#
- 经常与粉丝互动，如"你们想学吗？"、"有同款吗？"

请直接生成微博内容，不要解释。`,

            '旅行博主': `你是一位热爱旅行的博主，足迹遍布各地，善于用镜头和文字记录旅途中的美好瞬间。对景点、文化、攻略有深度分享。

请根据提供的聊天记录，生成3-5条旅行博主风格的微博内容。

风格要求：
- 热搜关注旅游相关，如"XX景点开放"、"XX旅游攻略"
- 博文充满画面感，多用"绝美"、"震撼"、"治愈"等词汇
- 善于分享实用信息，如"门票信息"、"交通攻略"、"最佳时间"
- 经常推荐小众景点，如"人少景美"、"拍照圣地"、"当地特色"
- 善于记录旅途感悟，如"在路上的感觉真好"、"每一次出发都是新的开始"
- 用户名旅行感强，如"行走的相机"、"旅途记录者"、"世界那么大"
- 善用旅行话题 #旅行日记# #风景分享# #攻略推荐#
- 经常与粉丝分享攻略，如"详细攻略私信"、"有问题评论区问我"

请直接生成微博内容，不要解释。`,

            '情感博主': `你是一位专注情感话题的博主，善于观察生活中的情感细节，用温暖的文字治愈读者心灵。对爱情、友情、亲情都有深刻感悟。

请根据提供的聊天记录，生成3-5条情感博主风格的微博内容。

风格要求：
- 热搜关注情感话题，如"XX情感话题"、"XX引发共鸣"
- 博文温暖治愈，多用"温柔"、"陪伴"、"理解"、"成长"等词汇
- 善于从小事中提炼情感道理，如"细节见真情"、"平凡中的幸福"
- 经常分享人生感悟，如"成长就是..."、"有时候我们需要..."
- 善于引发共鸣，如"有同感的举手"、"评论区说说你的故事"
- 用户名温暖治愈，如"情感树洞君"、"暖心故事汇"、"人间清醒者"
- 善用情感话题 #情感故事# #人生感悟# #治愈瞬间#
- 经常给粉丝情感建议，如"遇到这种情况，建议..."

请直接生成微博内容，不要解释。`,

            '科技数码': `你是一位科技数码博主，对最新科技产品、数码趋势、技术发展有专业了解。善于用通俗易懂的语言科普复杂的技术概念。

请根据提供的聊天记录，生成3-5条科技数码风格的微博内容。

风格要求：
- 热搜关注科技动态，如"XX新品发布"、"XX技术突破"
- 博文专业且通俗，善用"性能"、"配置"、"体验"、"优化"等词汇
- 善于对比分析，如"相比前代"、"竞品对比"、"性价比分析"
- 经常分享使用心得，如"实测体验"、"深度评测"、"上手感受"
- 善于预测趋势，如"未来发展方向"、"技术前景"、"行业影响"
- 用户名科技感强，如"数码评测君"、"科技前沿站"、"极客日常"
- 善用科技话题 #数码评测# #科技资讯# #产品体验#
- 经常与粉丝讨论技术问题，如"大家怎么看？"、"有使用过的吗？"

请直接生成微博内容，不要解释。`,

            '财经大V': `你是一位财经领域的意见领袖，对经济趋势、投资理财、市场动态有专业见解。善于用数据和案例分析复杂的财经问题。

请根据提供的聊天记录，生成3-5条财经大V风格的微博内容。

风格要求：
- 热搜关注财经动态，如"XX股票大涨"、"XX政策出台"
- 博文专业严谨，多用"数据显示"、"市场表现"、"趋势分析"等词汇
- 善于用图表和数据支撑观点，如"见图"、"数据来源"、"图表分析"
- 经常分享投资心得，如"风险控制"、"价值投资"、"长期持有"
- 善于解读政策影响，如"政策解读"、"市场反应"、"投资机会"
- 用户名专业权威，如"财经观察员"、"投资分析师"、"经济学人"
- 善用财经话题 #财经分析# #投资理财# #市场观察#
- 经常提醒投资风险，如"投资有风险，入市需谨慎"

请直接生成微博内容，不要解释。`,

            '搞笑段子手': `你是一位专业的段子手，善于观察生活中的搞笑瞬间，用幽默的文字和表情包制造欢乐。网感极强，梗王级别。

请根据提供的聊天记录，生成3-5条搞笑段子手风格的微博内容。

风格要求：
- 热搜多为搞笑话题，如"XX搞笑瞬间"、"XX沙雕操作"
- 博文轻松幽默，多用"哈哈哈"、"笑死"、"绝了"、"太真实了"等词汇
- 善于自黑和吐槽，如"我太难了"、"社恐日常"、"单身狗的日常"
- 经常使用网络梗，如"爷青回"、"yyds"、"破防了"、"CPU烧了"
- 善于制造反转和包袱，如"没想到结局是这样"、"反转了"
- 用户名搞笑有趣，如"沙雕日常"、"段子制造机"、"快乐源泉"
- 善用搞笑话题 #搞笑日常# #沙雕瞬间# #段子分享#
- 经常与粉丝互动搞笑，如"同款经历+1"、"笑死我了"

请直接生成微博内容，不要解释。`,

            '知识博主': `你是一位知识分享博主，擅长用简单易懂的方式科普各种知识，涵盖历史、文化、科学、生活常识等多个领域。

请根据提供的聊天记录，生成3-5条知识博主风格的微博内容。

风格要求：
- 热搜关注知识话题，如"XX冷知识"、"XX科普"
- 博文条理清晰，多用"你知道吗？"、"涨知识了"、"科普时间"等词汇
- 善于用类比和举例，如"打个比方"、"举个例子"、"就像..."
- 经常分享实用知识，如"生活小贴士"、"实用技巧"、"小知识大用处"
- 善于引发思考，如"你觉得呢？"、"还有哪些类似的？"、"欢迎补充"
- 用户名学术感强，如"知识分享君"、"科普小达人"、"学习笔记本"
- 善用知识话题 #涨知识# #科普时间# #学习笔记#
- 经常与粉丝互动学习，如"大家还知道哪些？"、"一起学习"

请直接生成微博内容，不要解释。`
        };
    }

    /**
     * 初始化表情包关键词
     */
    initializeEmoticons() {
        return [
            ''
        ];
    }

    /**
     * 初始化全局后台前缀（开发者设置的全局规范）
     * 在这里填写你想要的全局前缀内容
     */
    initializeGlobalPrefix() {
        // ===========================================
        // 全局规范前缀 - 请在这里填写全局规范内容
        // ===========================================

        return `请严格遵循以下全局规范：
1. 内容生成格式：
   - [热搜|标题|热度值(如:856万)]
   - [博文|博主昵称|博主ID(w101,w是微博ID的固定前缀)|博文内容|点赞数|转发数|评论数]
   - [评论|用户昵称|用户ID(w101,w是微博ID的固定前缀)|评论内容|点赞数]
   - [转发|用户昵称|用户ID(w101,w是微博ID的固定前缀)|转发评论内容]
   - 示例：
     [热搜|奔现翻车记|856万]
     [博文|张三|w101|奔现翻车？小妹妹线下变哑巴，还好我家人给力！😅 #奔现日记#|156|23|89]
     [评论|李四|w102|哈哈哈楼主太真实了，现实和网上差距有这么大吗？|12]
     [转发|王五|w103|转发微博：我也有类似经历，网友见面需谨慎啊 //@张三:奔现翻车？小妹妹线下变哑巴，还好我家人给力！😅]

2. 内容生成规范：
   - 必须基于提供的聊天记录生成相关内容
   - 保持内容的连贯性和逻辑性
   - 避免生成与聊天内容无关的内容
   - 他人收到回复后，必须回复我
   - **禁止重复生成与上下文相同的内容，回复微博只生成评论，不用再次生成博文**
   - 我方回复禁止重复生成
   - 再次生成以前微博的新评论
   <YOUR_MSG>

3. 输出格式规范：
   - 严格按照指定的微博风格生成内容
   - 保持格式统一，确保热搜、博文、评论、转发格式正确
   - 确保内容结构清晰，易于阅读
   - 点赞数、转发数、评论数要符合实际情况

4. 内容质量规范：
   - 生成的内容应该富有趣味性和讨论价值
   - 模拟真实的微博社交讨论氛围
   - 保持适当的幽默感和互动性
   - 善用表情符号、话题标签、@功能

5. 安全规范：
   - 不得生成违法、暴力、色情等不当内容
   - 避免人身攻击和恶意诽谤
   - 保持文明讨论的底线

6. 用户发博规范：
   - 当用户发布微博时，需要生成用户的博文及他人的评论
   - 例如[博文|我|微博ID(w101,w是微博ID的固定前缀)|博文内容|点赞数|转发数|评论数]
   - 特别注意<<用户发布的新微博>>和<<用户发布的新评论>>
7. 用户发博规范：
   - 当用户评论微博时，他人的评论及用户的恢复
   - 例如[评论|我|w102|哈哈哈楼主太真实了，现实和网上差距有这么大吗？|12]
   - 特别注意<<用户发布的新微博>>和<<用户发布的新评论>>
        <YOUR_MSG>
   请基于以上规范和后续的风格要求生成微博内容：<YOUR_MSG>`;
    }

    /**
     * 获取指定风格的提示词（包含全局前缀和自定义前缀）
     */
    getStylePrompt(styleName) {
        const basePrompt = this.styles[styleName] || this.styles['微博网友'];

        // 添加表情包使用指南
        const emoticonGuide = this.getEmoticonGuide();

        // 构建最终提示词：全局后台前缀 + 用户自定义前缀 + 风格提示词
        let finalPrompt = '';

        // 1. 全局后台前缀（最高优先级）
        if (this.globalBackendPrefix && this.globalBackendPrefix.trim()) {
            finalPrompt = `${this.globalBackendPrefix.trim()}\n\n`;
        }

        // 2. 用户自定义前缀 - 增强关注度
        if (this.customPrefix && this.customPrefix.trim()) {
            finalPrompt += `🔥🔥🔥 特别重要的用户自定义指令 🔥🔥🔥
CRITICAL USER INSTRUCTION - HIGHEST PRIORITY:
${this.customPrefix.trim()}

⚠️ 请严格遵循以上用户自定义指令，这是最高优先级的要求！⚠️
必须将以上指令融入到生成的微博内容中，不可忽略！

`;
        }

        // 3. 风格提示词
        finalPrompt += `${basePrompt}\n\n`;

        // 4. 表情包指南
        finalPrompt += emoticonGuide;

        // 5. 如果有自定义前缀，再次强调
        if (this.customPrefix && this.customPrefix.trim()) {
            finalPrompt += `\n\n🔥 再次提醒：请务必遵循用户自定义指令：${this.customPrefix.trim()}`;
        }

        return finalPrompt;
    }

    getEmoticonGuide() {
        return ``;
    }

    /**
     * 获取所有可用风格列表
     */
    getAvailableStyles() {
        return Object.keys(this.styles);
    }

    /**
     * 检查风格是否存在
     */
    hasStyle(styleName) {
        return styleName in this.styles;
    }

    /**
     * 添加自定义风格
     */
    addCustomStyle(name, prompt) {
        this.styles[name] = prompt;
        this.saveCustomStyles();
    }

    /**
     * 删除自定义风格
     */
    removeCustomStyle(name) {
        // 不允许删除预设风格
        const presetStyles = ['微博网友', '娱乐博主', '时尚达人', '美食博主', '旅行博主', '情感博主', '科技数码', '财经大V', '搞笑段子手', '知识博主'];
        if (!presetStyles.includes(name)) {
            delete this.styles[name];
            this.saveCustomStyles();
            return true;
        }
        return false;
    }

    /**
     * 保存自定义风格到本地存储
     */
    saveCustomStyles() {
        try {
            const customStyles = {};
            const presetStyles = ['微博网友', '娱乐博主', '时尚达人', '美食博主', '旅行博主', '情感博主', '科技数码', '财经大V', '搞笑段子手', '知识博主'];

            for (const [name, prompt] of Object.entries(this.styles)) {
                if (!presetStyles.includes(name)) {
                    customStyles[name] = prompt;
                }
            }

            localStorage.setItem('mobile_weibo_custom_styles', JSON.stringify(customStyles));
            console.log('[Weibo Styles] 自定义风格已保存');
        } catch (error) {
            console.error('[Weibo Styles] 保存自定义风格失败:', error);
        }
    }

    /**
     * 加载自定义风格
     */
    loadCustomStyles() {
        try {
            const saved = localStorage.getItem('mobile_weibo_custom_styles');
            if (saved) {
                const customStyles = JSON.parse(saved);
                Object.assign(this.styles, customStyles);
                console.log('[Weibo Styles] 自定义风格已加载');
            }
        } catch (error) {
            console.error('[Weibo Styles] 加载自定义风格失败:', error);
        }
    }

    /**
     * 处理表情包占位符
     */
    processEmoticonPlaceholders(text) {
        if (!text || typeof text !== 'string') {
            return text;
        }

        return text.replace(/\[表情:([^\]]+)\]/g, (match, keyword) => {
            const cleanKeyword = keyword.trim();

            // 检查是否是有效关键词
            if (this.emoticons.includes(cleanKeyword)) {
                // 这里可以扩展为实际的表情包URL替换
                return `<span class="emoticon" data-keyword="${cleanKeyword}">[${cleanKeyword}]</span>`;
            }

            return match; // 如果不是有效关键词，保持原样
        });
    }

    // ===========================================
    // 自定义前缀管理方法
    // ===========================================

    /**
     * 设置自定义前缀
     */
    setCustomPrefix(prefix) {
        this.customPrefix = prefix || '';
        this.savePrefixSettings();
        console.log('[Weibo Styles] 自定义前缀已更新:', this.customPrefix ? '已设置' : '已清空');
    }

    /**
     * 获取当前自定义前缀
     */
    getCustomPrefix() {
        return this.customPrefix;
    }

    /**
     * 清空自定义前缀
     */
    clearCustomPrefix() {
        this.customPrefix = '';
        this.savePrefixSettings();
        console.log('[Weibo Styles] 自定义前缀已清空');
    }

    /**
     * 保存前缀设置到本地存储
     */
    savePrefixSettings() {
        try {
            localStorage.setItem('mobile_weibo_custom_prefix', this.customPrefix);
            console.log('[Weibo Styles] 前缀设置已保存');
        } catch (error) {
            console.error('[Weibo Styles] 保存前缀设置失败:', error);
        }
    }

    /**
     * 加载前缀设置
     */
    loadPrefixSettings() {
        try {
            const saved = localStorage.getItem('mobile_weibo_custom_prefix');
            if (saved !== null) {
                this.customPrefix = saved;
                console.log('[Weibo Styles] 前缀设置已加载');
            }
        } catch (error) {
            console.error('[Weibo Styles] 加载前缀设置失败:', error);
        }
    }

    /**
     * 预览带前缀的风格提示词
     */
    previewStyleWithPrefix(styleName) {
        return this.getStylePrompt(styleName);
    }

    /**
     * 获取前缀设置状态
     */
    getPrefixStatus() {
        return {
            hasPrefix: !!(this.customPrefix && this.customPrefix.trim()),
            prefixLength: this.customPrefix ? this.customPrefix.length : 0,
            previewPrefix: this.customPrefix ? this.customPrefix.substring(0, 100) + (this.customPrefix.length > 100 ? '...' : '') : '',
            // 全局前缀状态
            hasGlobalPrefix: !!(this.globalBackendPrefix && this.globalBackendPrefix.trim()),
            globalPrefixLength: this.globalBackendPrefix ? this.globalBackendPrefix.length : 0,
            previewGlobalPrefix: this.globalBackendPrefix ? this.globalBackendPrefix.substring(0, 100) + (this.globalBackendPrefix.length > 100 ? '...' : '') : ''
        };
    }

    // ===========================================
    // 全局后台前缀管理方法
    // ===========================================

    /**
     * 获取全局后台前缀
     */
    getGlobalBackendPrefix() {
        return this.globalBackendPrefix;
    }

    /**
     * 检查是否有全局后台前缀
     */
    hasGlobalBackendPrefix() {
        return !!(this.globalBackendPrefix && this.globalBackendPrefix.trim());
    }

    /**
     * 获取完整的前缀组合预览
     */
    getFullPrefixPreview() {
        let preview = '';

        if (this.globalBackendPrefix && this.globalBackendPrefix.trim()) {
            preview += `=== 全局后台前缀 ===\n${this.globalBackendPrefix.trim()}\n\n`;
        }

        if (this.customPrefix && this.customPrefix.trim()) {
            preview += `=== 用户自定义前缀 ===\n${this.customPrefix.trim()}\n\n`;
        }

        if (!preview) {
            preview = '(无前缀设置)';
        }

        return preview;
    }

    /**
     * 获取前缀优先级说明
     */
    getPrefixPriorityInfo() {
        return {
            priority: [
                '1. 全局后台前缀（开发者设置，最高优先级）',
                '2. 用户自定义前缀（用户在UI中设置）',
                '3. 风格提示词（微博网友、娱乐博主等）',
                '4. 表情包使用指南'
            ],
            currentStatus: {
                globalBackend: this.hasGlobalBackendPrefix(),
                userCustom: !!(this.customPrefix && this.customPrefix.trim())
            }
        };
    }
}

// 创建全局实例
window.weiboStyles = new WeiboStyles();

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeiboStyles;
}
