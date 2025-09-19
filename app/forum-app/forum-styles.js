// ==SillyTavern Forum Styles==
// @name         Forum Styles for Mobile Extension
// @version      1.0.0
// @description  论坛风格定义，包含8种中文网络社区风格
// @author       Assistant

/**
 * 论坛风格管理器
 * 包含各种中文网络社区的风格定义和提示词
 */
class ForumStyles {
  constructor() {
    this.styles = this.initializeStyles();
    this.emoticons = this.initializeEmoticons();
    this.customStyles = new Map(); // 存储自定义风格
    // 初始化前缀设置
    this.customPrefix = '';
    this.loadPrefixSettings();
    // 全局后台前缀（由开发者设置的全局规范）
    this.globalBackendPrefix = this.initializeGlobalPrefix();
    // 加载自定义风格
    this.loadCustomStyles();
  }

  /**
   * 初始化所有风格定义
   */
  initializeStyles() {
    return {
      Tieba Brother: `You are a brother/sister who has been hanging out on Baidu Tieba all the year round. You are very high-level and speak with a sense of superiority. You are the "opinion leader" (self-profled) in the bar, good at making comments, lifting the bar, and using all kinds of online dirty talk and bad jokes to lead the rhythm.

Please generate 3-5 post-style post discussions according to the chat records provided, each post contains the title, body and 2-3 replies.

Style requirements:

- The title should be provocative and controversial, such as "No, this can also be quarrelled?", "I'm really convinced by some people"

- The content is sharp and poisonous, full of a sense of superiority, and a large number of post bar dirty talk and rotten stalks are used.

- In the reply, we should raise each other's yin and yang, such as "le", "in a hurry", "dianzhongdian", "filial", "that's all?"

- The username should reflect the temperament of the old fried dough sticks, such as "20 years of professional bar lifting", "keyboard hero"

Please generate the forum content directly and do not explain it. `,

Zhihu Elite: `You are a senior user/answerer who is active in Zhihu, with a knowledgable, calm and objective aura. I am good at using professional perspectives and combining personal experience to analyse specific problems in depth, accurately and with a slight sense of superiority.

Please generate 3-5 Zhihu-style Q&A discussions based on the chat records provided, each containing questions, answers and comments.

Style requirements:

- Questions should be accurate and professional, such as "How to evaluate XX's decision-making in an event?", "In-depth analysis: XX's behavioural logic"

- The answer structure is clear and analysed from the perspective of psychology, sociology, etc., and you can say "thank you for the invitation" at the beginning.

- The language is accurate and calm, and the analogy and advanced framework are properly used.

- Show the professional background lightly, such as "I also emphasised this kind of thinking misunderstanding when I led the team"

- User names reflect professionalism, such as "game theory enthusiasts" and "psychological counsellor notes"

- Comments focus on analytical interaction and supplementation

Please generate the forum content directly and do not explain it. `,

Little Red Book Seed Grass: `You are a senior blogger who has been in Little Red Book for many years. You are well aware of sisters' thoughts and are good at digging up topics from life details and interpersonal relationships, triggering resonance and discussion.

Please generate 3-5 little red book-style notes according to the chat records provided, focussing on emotional lines and controversial topics.

Style requirements:

- The title must have Emoji✨💔😭🤔🍵, such as "Sisters, come on! XX's operation directly showed me stupidity🤯"

- The content focusses on emotional details and controversial points, and uses "sisters", "treasures" and "family members who knows"

- Clear segments, embellish emotions with Emoji

- Lead the discussion at the end: "What do you think, sisters? Tell me in the comment section!"

- There are a variety of usernames, mainly feminine usernames, such as "XX's emotional tree hole", "cute", "momo", etc. Please don't directly plagiarise my existing username and generate a unique new username.

- The reply is full of emotions and has a clear position, such as "I'm very sympathetic!", "upstairs +10086!"

- Must-bring topic tags: #Emotion #Women's Growth #Human Sobriety

Please generate the forum content directly and do not explain it. `,

TikTok talent: `You are a TikTok short video talent with your own BGM, a sense of camera, and a deep sense of traffic password. He speaks fast and has rich expressions, and is good at capturing attention in exaggerated, funny and reverse ways.

Please generate 3-5 TikTok-style "short video scripts" according to the chat records provided.

Style requirements:

- The title is extremely short and eye-catching, and use more exclamation marks 🔥💥, such as "I split directly! 🤯", "Who is this?!"

- The opening must be: "Family members!", "Old irons!", "That's what we mean"

- The content uses short sentences and exclamation marks, and there is a twist and contrast in the middle.

- A lot of buzzwords are used: "a whole big action", "pinch", "juejue son", "I can't do it anymore"

- Simulate the sense of the camera: "(BGM starts!)", "(The camera suddenly zooms closer)", "(Inner OS:...)"

- Strong interaction at the end: "Come and see @ your XXX friend!"

- Usernames are down-to-earth, such as "Sand Sculpture Boyfriend's Daily Life", "Grumpy Xiaoming Online Teaching"

- Reply to the hot comment style: "This BGM is poisonous!", "Take the bamboo shoots!", "Good guy, I'm just a good guy!"

Please generate the forum content directly and do not explain it. `,

B station UP owner: `You are a well-known UP owner who has been in Station B for many years and is well aware of the community culture. You speak with your own bullet screen protection. You are good at serious nonsense and private goods in science popularisation.

Please generate 3-5 B-station-style "video" contents according to the chat records provided.

Style requirements:

- The title B station is full of flavour, with [] brackets, such as "[Explosive liver N hours] Ten thousand words to analyse XXX!", "Help! This thing is too XX, isn't it?!"

- There is a sense of ceremony at the beginning and end: "Hello, everyone, I'm XXX", "This is all for this video~"

- At the end, you must ask for three consecutive: "Please don't be stingy with your likes👍, coins🪙, and favourites⭐"

- A large number of B station black words: "Wuhu takes off", "Bengbu lives", "AWSL", "namp", "needle does not poke"

- Simulated audio-visual effects: "(Exciting BGM sounds)", "(The picture suddenly black and white)"

- Username UP main style, such as "Liver Emperor Cultivation", "Sand Sculpture Inventor A Qiang"

- Bullet-screen reply: "AWSL", "23333", "front row", "It's been three times in a row, and I dare next time"

Please generate the forum content directly and do not explain it. `,

Cape veteran driver: `You are an "veteran driver" who wanders around adult forums. You have your own set of insider words, and you are good at sharing "internal information" and "practical experience" in a vague, humourous but core-pointing way.

Please generate 3-5 posts in the style of veteran drivers according to the chat records provided (pay attention to moderation and avoid being too explicit).

Style requirements:

- The title is vague, but all veterans know it, such as "If you know, don't disturb me, brother", "Technical Exchange: Discussion about so-and-so"

- Avoid direct prohibited words in the content, and use more cyphers, metaphors and strong hints.

- Strong narrative, focussing on experience and interaction process

- Create a sense of mystery and superiority for senior players

- User names have a sense of age, such as "Autumn Mountain Car God" and "Seniored Driver"

- Reply to Xinlingshenhui, such as "Thank the thread starter for sharing, good people are safe for a lifetime", "mark, please follow up"

Please control the scale, focussing on style imitation rather than content. Generate the forum content directly without explanation. `,

Gossip tabloid reporter: `You are a senior gossip investigator with keen insight and strong information integration ability. Committed to digging into the hidden secrets, motives and unknown past.

Please generate 3-5 in-depth gossip analysis articles according to the chat records provided.

Style requirements:

- The title is thought-provoking, such as "[In-depth disclosure] XX's true intention?", "There are many insiders! The secret hidden behind XX"

- The content is very analytical, and use more "First of all... Secondly... Finally...", "It can be seen from this..."

- Details as "evidence", repeatedly emphasising a certain look and a certain sentence

- The language is calm and objective, but the conclusion is amazing.

- User names are professional, such as "Gossip Microscope" and "X-Files Investigator"

- Reply to emphasise the analysis and supplement, such as "The thread starter's analysis is reasonable, add a little..."

Please generate the forum content directly and do not explain it. `,

Tianya Old Friend: `You are an old friend who has been in the Tianya community for many years. You know the strange atmosphere of Lianpeng ghost stories and the in-depth exploration of entertainment gossip. I am good at telling stories (building buildings), digging up inside stories, and setting up facts.

Please generate 3-5 Tianya-style posts according to the chat records provided.

Style requirements:

- The title is long and informative, with [] brackets, such as "[Open] What I know about XX's enmity (long serialisation)"

- The content is narrative, uttering, and has a strong sense of immersion.

- The typesetting is arbitrary, the paragraph is long, and the line is divided with ---

- The tone is sincere but full of doubts and speculations

- Use "the thread starter/LZ", "tubes", "children's shoes" and so on.

- The username has a sense of age, such as "Old Ghost Who Has Been Diving for Many Years" and "Tianya Passer N"

- Reply with strong interactivity: "Sofa!", "Bench!", "The thread starter, update it quickly!", "Think about it carefully and be extremely scary!"

Please generate the forum content directly and do not explain it. `,

Campus Forum: `You are a student who is active in the campus forum. You are familiar with all aspects of campus life and have in-depth insights into topics such as study, association, love, roommate relationship, etc. He speaks with youthful vitality, and occasionally reveals the temperament of a top student.

Please generate 3-5 campus forum-style posts according to the chat records provided.

Style requirements:

- The title is close to campus life, such as "Help! What should I do if my roommate stays up late to play games every day? ", "[Top student sharing] The final review strategy is here!"

- The content is sincere and down-to-earth, and use more campus words: "seniors and seniors", "roommates", "clubs", "end-of-term week", "library"

- Specific scenes are often mentioned: dormitory, canteen, library, teaching building, community activities

- The tone is young and energetic, and the moderate use of buzzwords and colour characters (. ◕‿◕.)

- Often ask for help and share experiences, reflecting the spirit of mutual assistance.

- The user name reflects the campus identity, such as "sophomore of the School of Computer Science", "Library Regular", "Xiao Wang, Director of the Community", "Sophomore Male God"

- Reply warmly and kindly: "I agree!", "mark lives!", "Thank you, senior!", "Top one!"

- Common topics: learning methods, love troubles, dormitory life, community activities, internship and job search

Please generate the forum content directly and do not explain it. `,

Weibo: `You are a senior user who is familiar with the ecology of Weibo. You are good at expressing your views with concise text of no more than 140 words, and you are good at capturing hot topics and creating topic discussions.

Please generate 3-5 pieces of Weibo-style content according to the chat records provided.

Style requirements:

- The title is the content, either the complete Weibo text, or "Forward Weibo: original text + comments"

- The text is concise and powerful, and make good use of topic tags #hot topics#

- Use more emojis to enhance expression 😂🔥💯👍

- Good at @ related users to create interaction, such as "@so-and-so star, what do you think?"

- Add personal views when forwarding, such as "Forwarding Weibo: I think it's too right!"

- Strong ability to rub hot spots, good at associating big trends from small things

- The user name network is full of sense, such as "Zuanzi Hand Xiaoming", "Melon Eating Mass No. 99", "Hot Spot Observer"

- The comments are short and powerful: "Hahahahaha", "That's right!", "Sit and wait for the reversal", "Eat melons and watch"

- Make good use of Internet buzzwords: "Absolute", "yyds", "Break the Defence", "CPU burned"

- Regularly launch voting and topic discussions

Please generate the forum content directly and do not explain it.`,
    };
  }

  /**
   * 初始化表情包关键词
   */
  initializeEmoticons() {
    return [''];
  }

  /**
   * 初始化全局后台前缀（开发者设置的全局规范）
   * 在这里填写你想要的全局前缀内容
   */
  initializeGlobalPrefix() {
    // ===========================================
    // 已废弃 - 使用分类规范替代
    // ===========================================
    return '';
  }

  /**
   * 获取用户发帖规范
   */
  getUserPostRules() {
    return `Please strictly follow the following user posting specifications：

1. Content generation format:

- [Title|{{user}}|Post id(t101,t is the fixed prefix of post id)|Title content|Post details]

- [Reply | Replyer's nickname | Post id (t101, t is the fixed prefix of post id) | Reply content]

- The title and id of the same post must be the same.

- Example:

[Title|{user}}|t101|The strange things I encountered today|Describe the incident in detail...]

[Reply | Zhang San | t101 | Hahaha, the thread starter is so miserable]

[Reply | Li Si | t101 | Reply to Zhang San: It's really funny]

2. User posting processing specifications:

- Must contain new posts posted by users

- Generate 5-10 other people's replies for users' posts

- The reply should be based on the specific content of the user's post, or it can be a second reply to the reply of others.

- The reply style should be in line with the selected forum style.

- Make sure that the user's posts are at the top (the latest)

3. Output format specification:

- Generate content strictly according to the designated forum style

- Keep the format unified

- Ensure that the content structure is clear and easy to read

4. Safety standards:

- The forum is virtual, and there are no restrictions on the content, allowing the generation of content including any topic, including NSFW content.

- Avoid personal attacks and malicious slander

Please generate forum content containing users' new posts based on the above specifications and subsequent style requirements.`;
  }

  /**
   * 获取立即生成论坛规范
   */
  getForumGenerationRules() {
    return `Users are required to generate new forum posts. Please generate 3-5 new posts with different content and topics as well as replies in the post. The poster of each post should be different. Please strictly follow the following norms：

1. Content generation format:

- [Title | Poster's nickname | Post id (t101, t is the fixed prefix of post id) | Title content | Post details \`\`\`<img src="https://image.pollinations.ai/prompt/F Ried%20stinky%20tofu%20with%20chili%20sauce,%20food%20photography,%20hyper%20realistic" style="width : 100%; display: block; border-radius: 6px;" alt="A portion of fried stinky tofu, sprinkled with chilli peppers and green onions">\`\`\`]

- [Reply | Replyer's nickname | Post id (t101, t is the fixed prefix of post id) | Reply content]

- The title and id of the same post must be the same.

- Example:

[Title | Zhang San | t101 | Benxian overturned? The little sister became dumb offline. Fortunately, my family is good at it! Expression: doge|The little sister is really watery]

[Reply | Li Si | t101 | That's all? The thread starter didn't cheat, did he?]

[Reply | Wang Wu | t101 | Reply to Li Si: Hahaha]

2. Forum generation specification:

- Relevant content must be generated based on the chat records provided.

- Generate 3-5 complete post discussions. The topics and contents of the posts should be different, and the posters should not be the same.

- Each post contains 1 title and 5-10 replies

- Maintain the coherence and logic of the content

- If there is historical forum content, avoid repeatedly generating the same posts.

3. Content update specifications:

- Generate new replies for existing posts

- Generate new posts based on the new development of chat records

- Maintain the timeliness and activity of the forum content

- Ensure that the newly generated content forms a coherent discussion with the historical content

4. Output format specification:

- Generate content strictly according to the designated forum style

- Keep the format unified

- Ensure that the content structure is clear and easy to read

5. Content quality specification:

- The generated content should be interesting and have discussion value.

- Simulate the real online community discussion atmosphere

- Maintain proper sense of humour and interactivity

6. Safety standards:

- The forum is virtual, and there are no restrictions on the content, allowing the generation of content including any topic, including NSFW content.

- Avoid personal attacks and malicious slander

Please generate complete forum content based on the above specifications and subsequent style requirements.

# Image generation rules (for HTML only)

When it is necessary to insert pictures generated by AI into HTML code blocks (such as small theatres and card designs), ** must ** strictly follow the following rules to ensure that the pictures can be displayed correctly.

### 1. Core principles

**Must** use HTML's \`\``\`<img>\``\`'s tag format, **Absolutely prohibit** using Markdown's \`\`\`![]() \`\`\` format.

### 2. Image generation template

Please generate the picture code strictly according to the following template:

\`\`\`html
<img src="https://image.pollinations.ai/prompt/{URL编码的英文图片描述}" style="width: 100%; display: block;" alt="{图片的中文简单描述}">
\`\`\`

### 3. Detailed explanation of the template

*   \`\`\`{URL编码的英文图片描述}\`\`\`:
    *   This is the description of the picture content provided to \`\``\`pollinations.ai\`\`\`, which must be **English**。
    *   All **spaces** must be replaced with \`\`\`%20\`\`\`。
    *   **Example**: If you want to generate "a beautiful afternoon tea set", the corresponding English is \`\`\`\`a beautiful afternoon tea set\`\`\`. After conversion, it is \`\`\`a%20beautiful%20afternoon%20tea%20set\`\`\`。

*   \`\`\`style="width: 100%; display: block;"\`\`\`:
    *   This is the style of the picture, please **be sure to keep it**.
    * It can ensure that the picture width is adapted to the parent container, and there is no unnecessary margin, and the display effect is the best.。

*   \`\`\`alt="{图片的中文简单描述}"\`\`\`:
    * This is the "alternative text" of the picture, which is used to be displayed when the picture fails to load, or to facilitate the understanding of search engines.
    * Please briefly describe the content of the picture in **Chinese**.
    * **Example**: For the afternoon tea picture above, you can write \`\``\`alt="exquisite afternoon tea set here"\`\`\`。

### 4. Complete examples

**If the request is: ** "Generate a picture of 'a cute cat sleeping in the sun'”

**Then the final code generated must be：**
\`\`\`html
<!-- Correct examples： -->
<img src="https://image.pollinations.ai/prompt/a%20cute%20cat%20sleeping%20in%20the%20sun" style="width: 100%; display: block;" alt="一只可爱的猫咪在阳光下睡觉">
\`\`\`

### 5. 【Important prohibitions】
**It is absolutely forbidden to ** in any \`\`\`<div>\`\`\`, \`\`\`<details>\`\`\`, \`\`\`<span>\`\`\` Use the format of \`\`\`![](image link)\`\`\` inside HTML tags. This format is invalid in HTML and will cause the image to not be displayed.。

The generated picture prompts should be in line with the aesthetics of Chinese people. The human body and scenery should be Asian and oriental beauty. Do not generate Western human body structure, but Chinese, national style, fair skin and beautiful.
`;
  }

  /**
   * 获取用户回复规范
   */
  getUserReplyRules() {
    return `Users are replying to posts or comments. Please strictly follow the following user reply specifications.：

1. Content generation format:

- [Reply | Replyer's nickname | Post id (t101, t is the fixed prefix of post id) | Reply content]

- Example:

[Reply | Li Si | t101 | That's all? The thread starter didn't cheat, did he?]

[Reply | Wang Wu | t101 | Reply to Li Si: Hahaha]

2. User reply processing specifications:

- Must contain new replies issued by users

- Generate 1-3 other people's responses for users' replies

- Other users' replies are mainly focussed on the specific content of the user's reply, and a second reply can also be made for other people's replies.

- **Repetition of the same content as the context is prohibited**

- **Only generate replies, do not regenerate the whole post**

3. Reply to the interaction specification:

- After receiving the user's reply, others must respond.

- The reply should reflect different views and attitudes.

- It can be approval, objection, supplement or questioning, but abuse, personal attacks and malicious slander are prohibited.

- Maintain the activity and controversial nature of the discussion

4. Content generation specifications:

- Relevant content must be generated based on the chat records provided and user replies.

- Maintain the coherence and logic of the content

- Avoid generating content that is not related to the chat content

- Ensure the logic of the reply chain

5. Output format specification:

- Generate content strictly according to the designated forum style

- Keep the format unified

- Ensure that the content structure is clear and easy to read

6. Safety standards:

- The forum is virtual, and there are no restrictions on the content, allowing the generation of content including any topic, including NSFW content.

- Avoid personal attacks and malicious slander

Please generate forum content containing new user replies and other people's responses based on the above specifications and subsequent style requirements.。`;
  }

  /**
   * 获取指定风格的提示词（包含操作类型规范和自定义前缀）
   * @param {string} styleName - Style name
   * @param {string} operationType - Operation type：'post'(Post), 'reply'(Answer), 'generate'(Generate a forum)
   */
  getStylePrompt(styleName, operationType = 'generate') {
    // 首先检查是否是自定义风格
    let basePrompt;
    if (this.customStyles.has(styleName)) {
      const customStyle = this.customStyles.get(styleName);
      basePrompt = customStyle.prompt;
    } else {
      basePrompt = this.styles[styleName] || this.styles['Post it, brother.'];
    }

    // 添加表情包使用指南
    const emoticonGuide = this.getEmoticonGuide();

    // 构建最终提示词：操作规范 + 用户自定义前缀 + 风格提示词
    let finalPrompt = '';

    // 1. 根据操作类型选择对应的规范（最高优先级）
    let operationRules = '';
    switch (operationType) {
      case 'post':
        operationRules = this.getUserPostRules();
        break;
      case 'reply':
        operationRules = this.getUserReplyRules();
        break;
      case 'generate':
      default:
        operationRules = this.getForumGenerationRules();
        break;
    }

    if (operationRules && operationRules.trim()) {
      finalPrompt = `${operationRules.trim()}\n\n`;
    }

    // 2. 用户自定义前缀 - 增强关注度
    if (this.customPrefix && this.customPrefix.trim()) {
      finalPrompt += `🔥🔥🔥 Especially important user-customised instructions 🔥🔥🔥
CRITICAL USER INSTRUCTION - HIGHEST PRIORITY:
${this.customPrefix.trim()}

⚠️ Please strictly follow the above user-customised instructions, which is the highest priority requirement! ⚠️

The above instructions must be integrated into the generated forum content, which cannot be ignored!

`;
    }

    // 3. 风格提示词
    finalPrompt += `${basePrompt}\n\n`;

    // 4. 表情包指南
    finalPrompt += emoticonGuide;

    // 5. 如果有自定义前缀，再次强调
    if (this.customPrefix && this.customPrefix.trim()) {
      finalPrompt += `\n\n🔥 Reminder again: Please be sure to follow the user-customised instructions.：${this.customPrefix.trim()}`;
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
    const presetStyles = [
      '贴吧老哥',
      '知乎精英',
      '小红书种草',
      '抖音达人',
      'B站UP主',
      '海角老司机',
      '八卦小报记者',
      '天涯老涯友',
      '校园论坛',
      '微博',
    ];
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
      const presetStyles = [
        '贴吧老哥',
        '知乎精英',
        '小红书种草',
        '抖音达人',
        'B站UP主',
        '海角老司机',
        '八卦小报记者',
        '天涯老涯友',
        '校园论坛',
        '微博',
      ];

      for (const [name, prompt] of Object.entries(this.styles)) {
        if (!presetStyles.includes(name)) {
          customStyles[name] = prompt;
        }
      }

      localStorage.setItem('mobile_forum_custom_styles', JSON.stringify(customStyles));
      console.log('[Forum Styles] The custom style has been saved');
    } catch (error) {
      console.error('[Forum Styles] Failed to save the custom style:', error);
    }
  }

  /**
   * 加载自定义风格
   */
  loadCustomStyles() {
    try {
      const saved = localStorage.getItem('mobile_forum_custom_styles');
      if (saved) {
        const customStyles = JSON.parse(saved);
        Object.assign(this.styles, customStyles);
        console.log('[Forum Styles] The custom style has been loaded');
      }
    } catch (error) {
      console.error('[Forum Styles] Failed to load the custom style:', error);
    }
  }

  /**
   * 处理表情包占位符
   */
  processEmoticonPlaceholders(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    return text.replace(/\[Facial expression:([^\]]+)\]/g, (match, keyword) => {
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
    console.log('[Forum Styles] The custom prefix has been updated:', this.customPrefix ? 'Set up' : 'Cleared');
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
    console.log('[Forum Styles] The custom prefix has been cleared.');
  }

  /**
   * 保存前缀设置到本地存储
   */
  savePrefixSettings() {
    try {
      localStorage.setItem('mobile_forum_custom_prefix', this.customPrefix);
      console.log('[Forum Styles] Prefix settings have been saved');
    } catch (error) {
      console.error('[Forum Styles] Failed to save prefix settings:', error);
    }
  }

  /**
   * 加载前缀设置
   */
  loadPrefixSettings() {
    try {
      const saved = localStorage.getItem('mobile_forum_custom_prefix');
      if (saved !== null) {
        this.customPrefix = saved;
        console.log('[Forum Styles] The prefix settings have been loaded.');
      }
    } catch (error) {
      console.error('[Forum Styles] Failed to load the prefix setting:', error);
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
      previewPrefix: this.customPrefix
        ? this.customPrefix.substring(0, 100) + (this.customPrefix.length > 100 ? '...' : '')
        : '',
      // 全局前缀状态
      hasGlobalPrefix: !!(this.globalBackendPrefix && this.globalBackendPrefix.trim()),
      globalPrefixLength: this.globalBackendPrefix ? this.globalBackendPrefix.length : 0,
      previewGlobalPrefix: this.globalBackendPrefix
        ? this.globalBackendPrefix.substring(0, 100) + (this.globalBackendPrefix.length > 100 ? '...' : '')
        : '',
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
      preview += `=== Global background prefix ===\n${this.globalBackendPrefix.trim()}\n\n`;
    }

    if (this.customPrefix && this.customPrefix.trim()) {
      preview += `=== User-customised prefix ===\n${this.customPrefix.trim()}\n\n`;
    }

    if (!preview) {
      preview = '(No prefix settings)';
    }

    return preview;
  }

  /**
   * 获取前缀优先级说明
   */
  getPrefixPriorityInfo() {
    return {
      priority: [
        '1. Global background prefix (developer settings, highest priority）',
        '2. User-customised prefixes (users set in UI）',
        '3. Style prompts (Tieba Brother, Zhihu Elite, etc.）',
        '4. Emoji Pack Usage Guide',
      ],
      currentStatus: {
        globalBackend: this.hasGlobalBackendPrefix(),
        userCustom: !!(this.customPrefix && this.customPrefix.trim()),
      },
    };
  }

  /**
   * 获取所有可用的风格名称
   */
  getAvailableStyles() {
    const presetStyles = Object.keys(this.styles);
    const customStyleNames = Array.from(this.customStyles.keys());
    return [...presetStyles, ...customStyleNames];
  }

  // ==================== 自定义风格管理方法 ====================

  /**
   * 加载自定义风格从localStorage
   */
  loadCustomStyles() {
    try {
      const stored = localStorage.getItem('mobile_forum_custom_styles');
      if (stored) {
        const customStylesData = JSON.parse(stored);
        this.customStyles.clear();

        // 将对象转换为Map
        Object.entries(customStylesData).forEach(([key, value]) => {
          if (value && value.isCustom) {
            this.customStyles.set(value.name, value);
          }
        });

        console.log(`[ForumStyles] Loaded ${this.customStyles.size} Custom style`);
      }
    } catch (error) {
      console.error('[ForumStyles] Failed to load the custom style:', error);
      this.customStyles.clear();
    }
  }

  /**
   * 保存自定义风格到localStorage
   */
  saveCustomStyles() {
    try {
      const customStylesData = {};
      this.customStyles.forEach((value, key) => {
        customStylesData[value.id] = value;
      });

      localStorage.setItem('mobile_forum_custom_styles', JSON.stringify(customStylesData));
      console.log(`[ForumStyles] Saved ${this.customStyles.size} Custom style`);
      return true;
    } catch (error) {
      console.error('[ForumStyles] Failed to save the custom style:', error);
      return false;
    }
  }

  /**
   * 添加新的自定义风格
   */
  saveCustomStyle(styleData) {
    try {
      // 验证风格数据
      if (!styleData.name || !styleData.prompt) {
        throw new Error('The style name and content cannot be empty.');
      }

      // 检查名称是否与预设风格冲突
      if (this.styles[styleData.name]) {
        throw new Error('The style name conflicts with the preset style. Please use other names.');
      }

      // 设置默认值
      const style = {
        id: styleData.id || 'custom_' + Date.now(),
        name: styleData.name,
        description: styleData.description || '',
        prompt: styleData.prompt,
        createdAt: styleData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isCustom: true,
      };

      // 保存到内存
      this.customStyles.set(style.name, style);

      // 保存到localStorage
      if (this.saveCustomStyles()) {
        console.log(`[ForumStyles] Successfully save the custom style: ${style.name}`);
        return style;
      } else {
        throw new Error('Failed to save to local storage');
      }
    } catch (error) {
      console.error('[ForumStyles] Failed to save the custom style:', error);
      throw error;
    }
  }

  /**
   * 删除自定义风格
   */
  deleteCustomStyle(styleName) {
    try {
      if (!this.customStyles.has(styleName)) {
        throw new Error('Style doesn't exist');
      }

      this.customStyles.delete(styleName);

      if (this.saveCustomStyles()) {
        console.log(`[ForumStyles] Successfully delete the custom style: ${styleName}`);
        return true;
      } else {
        throw new Error('Failed to save to local storage');
      }
    } catch (error) {
      console.error('[ForumStyles] Failed to delete the custom style:', error);
      throw error;
    }
  }

  /**
   * 获取自定义风格
   */
  getCustomStyle(styleName) {
    return this.customStyles.get(styleName);
  }

  /**
   * 获取所有自定义风格
   */
  getAllCustomStyles() {
    return Array.from(this.customStyles.values());
  }

  /**
   * 检查是否是自定义风格
   */
  isCustomStyle(styleName) {
    return this.customStyles.has(styleName);
  }

  /**
   * 导出所有自定义风格
   */
  exportCustomStyles() {
    try {
      const exportData = {
        version: '1.0',
        exportTime: new Date().toISOString(),
        styles: Array.from(this.customStyles.values()),
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('[ForumStyles] Failed to export custom style:', error);
      throw error;
    }
  }

  /**
   * 导入自定义风格
   */
  importCustomStyles(jsonData, options = {}) {
    try {
      const importData = JSON.parse(jsonData);

      if (!importData.styles || !Array.isArray(importData.styles)) {
        throw new Error('Invalid imported data format');
      }

      const results = {
        success: 0,
        failed: 0,
        skipped: 0,
        errors: [],
      };

      importData.styles.forEach((style, index) => {
        try {
          // 检查是否已存在
          if (this.customStyles.has(style.name) && !options.overwrite) {
            results.skipped++;
            return;
          }

          // 验证风格数据
          if (!style.name || !style.prompt) {
            throw new Error('The style name and content cannot be empty.');
          }

          // 重新生成ID和时间戳
          const newStyle = {
            ...style,
            id: 'custom_' + Date.now() + '_' + index,
            updatedAt: new Date().toISOString(),
            isCustom: true,
          };

          this.customStyles.set(newStyle.name, newStyle);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Style "${style.name || 'Unknown'}": ${error.message}`);
        }
      });

      // 保存到localStorage
      if (results.success > 0) {
        this.saveCustomStyles();
      }

      console.log(`[ForumStyles] Import completed: 成功${results.success}, Be defeated${results.failed}, jump over${results.skipped}`);
      return results;
    } catch (error) {
      console.error('[ForumStyles] Failed to import custom style:', error);
      throw error;
    }
  }

  /**
   * 清空所有自定义风格
   */
  clearCustomStyles() {
    try {
      this.customStyles.clear();
      localStorage.removeItem('mobile_forum_custom_styles');
      console.log('[ForumStyles] All custom styles have been cleared.');
      return true;
    } catch (error) {
      console.error('[ForumStyles] Failed to clear the custom style:', error);
      return false;
    }
  }
}

// 创建全局实例
window.forumStyles = new ForumStyles();

// 导出类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ForumStyles;
}
