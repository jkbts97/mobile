// 调试论坛排序功能
console.log('🔍 [调试] 开始调试论坛排序功能...');

// 调试当前论坛内容
window.debugCurrentForum = function() {
  console.log('📋 [调试] 检查当前论坛内容...');
  
  if (!window.forumUI) {
    console.log('❌ [调试] forumUI不存在');
    return;
  }
  
  try {
    const forumData = window.forumUI.getCurrentForumData();
    console.log('📊 [调试] 当前论坛数据:', forumData);
    
    if (forumData.threads && forumData.threads.length > 0) {
      console.log('📊 [调试] 帖子详情:');
      forumData.threads.forEach((thread, index) => {
        console.log(`  ${index + 1}. ID: ${thread.id}, 标题: ${thread.title}`);
        console.log(`     作者: ${thread.author}, 时间: ${thread.timestamp}`);
        console.log(`     回复数: ${thread.replies ? thread.replies.length : 0}`);
        
        if (thread.replies && thread.replies.length > 0) {
          console.log('     回复详情:');
          thread.replies.forEach((reply, replyIndex) => {
            console.log(`       ${replyIndex + 1}. 作者: ${reply.author}, 时间: ${reply.timestamp}`);
            console.log(`          内容: ${reply.content.substring(0, 50)}...`);
          });
        }
        console.log('');
      });
    } else {
      console.log('📊 [调试] 没有找到帖子数据');
    }
  } catch (error) {
    console.error('❌ [调试] 获取论坛数据失败:', error);
  }
};

// 调试排序逻辑
window.debugSortingLogic = function() {
  console.log('📋 [调试] 检查排序逻辑...');
  
  if (!window.forumUI) {
    console.log('❌ [调试] forumUI不存在');
    return;
  }
  
  try {
    const forumData = window.forumUI.getCurrentForumData();
    
    if (forumData.threads && forumData.threads.length > 0) {
      console.log('📊 [调试] 排序前的帖子顺序:');
      forumData.threads.forEach((thread, index) => {
        console.log(`  ${index + 1}. ${thread.id} - ${thread.title}`);
      });
      
      // 手动执行排序逻辑
      const sortedThreads = forumData.threads.slice().sort((a, b) => {
        // 计算每个帖子的最新活动时间
        const getLatestActivityTime = thread => {
          let latestTime = new Date(thread.timestamp || Date.now());
          
          if (thread.replies && thread.replies.length > 0) {
            thread.replies.forEach(reply => {
              const replyTime = new Date(reply.timestamp || Date.now());
              if (replyTime > latestTime) {
                latestTime = replyTime;
              }
              
              // 检查楼中楼回复
              if (reply.subReplies && reply.subReplies.length > 0) {
                reply.subReplies.forEach(subReply => {
                  const subReplyTime = new Date(subReply.timestamp || Date.now());
                  if (subReplyTime > latestTime) {
                    latestTime = subReplyTime;
                  }
                });
              }
            });
          }
          
          return latestTime;
        };
        
        const aLatest = getLatestActivityTime(a);
        const bLatest = getLatestActivityTime(b);
        
        console.log(`📊 [调试] ${a.id} 最新活动时间: ${aLatest}`);
        console.log(`📊 [调试] ${b.id} 最新活动时间: ${bLatest}`);
        
        return bLatest - aLatest; // 降序排列，最新的在前
      });
      
      console.log('📊 [调试] 排序后的帖子顺序:');
      sortedThreads.forEach((thread, index) => {
        console.log(`  ${index + 1}. ${thread.id} - ${thread.title}`);
      });
      
      // 检查是否有变化
      const orderChanged = !forumData.threads.every((thread, index) => 
        thread.id === sortedThreads[index].id
      );
      
      if (orderChanged) {
        console.log('✅ [调试] 排序逻辑工作正常，顺序发生了变化');
      } else {
        console.log('⚠️ [调试] 排序后顺序没有变化，可能时间戳相同或逻辑有问题');
      }
    }
  } catch (error) {
    console.error('❌ [调试] 排序逻辑调试失败:', error);
  }
};

// 调试论坛管理器的内容构建
window.debugForumManager = function() {
  console.log('📋 [调试] 检查论坛管理器内容构建...');
  
  if (!window.forumManager) {
    console.log('❌ [调试] forumManager不存在');
    return;
  }
  
  try {
    // 获取当前论坛内容
    if (typeof window.forumManager.getCurrentForumContent === 'function') {
      const currentContent = window.forumManager.getCurrentForumContent();
      console.log('📊 [调试] 当前论坛原始内容:');
      console.log(currentContent);
      
      if (currentContent) {
        // 解析内容
        const parsed = window.forumManager.parseForumContent(currentContent);
        console.log('📊 [调试] 解析后的内容:', parsed);
        
        // 重新构建内容
        const threadsMap = new Map();
        const repliesMap = new Map();
        
        parsed.threads.forEach(thread => {
          threadsMap.set(thread.id, thread);
          repliesMap.set(thread.id, parsed.replies[thread.id] || []);
        });
        
        const rebuilt = window.forumManager.buildForumContent(threadsMap, repliesMap);
        console.log('📊 [调试] 重新构建的内容:');
        console.log(rebuilt);
      }
    } else {
      console.log('❌ [调试] getCurrentForumContent方法不存在');
    }
  } catch (error) {
    console.error('❌ [调试] 论坛管理器调试失败:', error);
  }
};

// 模拟回复测试
window.simulateReply = function() {
  console.log('📋 [调试] 模拟回复测试...');
  
  if (!window.forumManager) {
    console.log('❌ [调试] forumManager不存在');
    return;
  }
  
  try {
    // 获取当前论坛内容
    const currentContent = window.forumManager.getCurrentForumContent();
    if (!currentContent) {
      console.log('❌ [调试] 没有当前论坛内容');
      return;
    }
    
    // 模拟新回复内容
    const newReplyContent = `[回复|我|thread_001|这是一个测试回复 ${new Date().toLocaleString()}]`;
    
    console.log('📊 [调试] 模拟新回复:', newReplyContent);
    
    // 模拟合并过程
    const existingForumContent = `<!-- FORUM_CONTENT_START -->
【论坛热议】

${currentContent}

---
[由论坛管理器自动生成]
<!-- FORUM_CONTENT_END -->`;
    
    window.forumManager.mergeForumContent(existingForumContent, newReplyContent)
      .then(merged => {
        console.log('📊 [调试] 合并后的内容:', merged);
      })
      .catch(error => {
        console.error('❌ [调试] 合并失败:', error);
      });
  } catch (error) {
    console.error('❌ [调试] 模拟回复测试失败:', error);
  }
};

// 立即定义到全局
console.log('🚀 [调试] 调试函数已定义，可以使用以下命令：');
console.log('  - debugCurrentForum() // 调试当前论坛内容');
console.log('  - debugSortingLogic() // 调试排序逻辑');
console.log('  - debugForumManager() // 调试论坛管理器');
console.log('  - simulateReply() // 模拟回复测试');
console.log('');

// 自动运行基础调试
setTimeout(() => {
  console.log('🔄 [调试] 自动运行基础调试...');
  window.debugCurrentForum();
  console.log('');
  window.debugSortingLogic();
}, 1000);
