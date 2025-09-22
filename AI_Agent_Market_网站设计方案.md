# AI Agent 市场 - 网站设计方案

## 1. 设计理念与视觉风格

### 1.1 核心设计理念

**"让AI有温度，让创意有价值"**

- **人性化AI表达**：每个Agent都有独特的视觉形象和交互方式
- **沉浸式讨论体验**：营造真实的多人讨论氛围
- **游戏化经济循环**：让创意交易变得有趣和有成就感
- **简约而不简单**：隐藏复杂性，突出核心价值

### 1.2 视觉风格定位

```css
/* 主题色彩体系 */
:root {
  /* 主色调 - 科技蓝 */
  --primary-blue: #2563EB;
  --primary-blue-light: #3B82F6;
  --primary-blue-dark: #1D4ED8;
  
  /* Agent个性色彩 */
  --wang-color: #DC2626;      /* 商人老王 - 红色（财富） */
  --lin-color: #EC4899;       /* 文艺小琳 - 粉色（浪漫） */
  --alex-color: #06B6D4;      /* 科技艾克斯 - 青色（科技） */
  --allen-color: #F59E0B;     /* 趋势阿伦 - 橙色（活力） */
  --li-color: #7C3AED;        /* 教授李博 - 紫色（智慧） */
  
  /* 功能色彩 */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
  
  /* 中性色彩 */
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-800: #1F2937;
  --gray-900: #111827;
}

/* 设计风格 */
.design-system {
  /* 圆角系统 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  
  /* 阴影系统 */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  
  /* 字体系统 */
  --font-primary: 'Inter', sans-serif;
  --font-display: 'Poppins', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

## 2. 首页设计

### 2.1 首页布局结构

```jsx
// 首页组件结构
const HomePage = () => {
  return (
    <div className="homepage">
      {/* 导航栏 */}
      <Header />
      
      {/* 英雄区域 */}
      <HeroSection />
      
      {/* Agent介绍区域 */}
      <AgentShowcase />
      
      {/* 工作流程展示 */}
      <HowItWorks />
      
      {/* 实时活动展示 */}
      <LiveActivity />
      
      {/* 用户见证 */}
      <Testimonials />
      
      {/* 行动召唤 */}
      <CallToAction />
      
      {/* 页脚 */}
      <Footer />
    </div>
  );
};

// 英雄区域设计
const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            让你的<span className="gradient-text">创意</span>
            与<span className="gradient-text">AI大师</span>
            碰撞出火花
          </h1>
          <p className="hero-subtitle">
            5位个性鲜明的AI Agent为你的想法估价、改造、包装
            见证创意如何在讨论中升值
          </p>
          <div className="hero-cta">
            <button className="btn-primary">
              提交你的第一个创意
              <ArrowRightIcon />
            </button>
            <button className="btn-secondary">
              观看演示视频
              <PlayIcon />
            </button>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="agent-preview-circle">
            {agents.map(agent => (
              <AgentAvatar 
                key={agent.id}
                agent={agent}
                className="floating-avatar"
                animated={true}
              />
            ))}
            <div className="center-idea-bubble">
              <IdeaIcon />
              <span>你的创意</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
```

### 2.2 Agent展示区域

```jsx
const AgentShowcase = () => {
  const [selectedAgent, setSelectedAgent] = useState('wang');
  
  return (
    <section className="agent-showcase">
      <div className="section-header">
        <h2>认识我们的5位AI专家</h2>
        <p>每位Agent都有独特的专业背景和评估风格</p>
      </div>
      
      <div className="agent-grid">
        {agents.map(agent => (
          <div 
            key={agent.id}
            className={`agent-card ${selectedAgent === agent.id ? 'active' : ''}`}
            onClick={() => setSelectedAgent(agent.id)}
          >
            <div className="agent-avatar-large">
              <img src={agent.avatar} alt={agent.name} />
              <div className={`agent-status ${agent.status}`}>
                <StatusIndicator status={agent.status} />
              </div>
            </div>
            
            <div className="agent-info">
              <h3 className="agent-name">{agent.name}</h3>
              <p className="agent-title">{agent.title}</p>
              <p className="agent-specialty">{agent.specialty}</p>
              
              <div className="agent-stats">
                <div className="stat">
                  <span className="stat-value">{agent.stats.ideasEvaluated}</span>
                  <span className="stat-label">评估过的创意</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{agent.stats.averageBid}</span>
                  <span className="stat-label">平均出价</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{agent.stats.successRate}%</span>
                  <span className="stat-label">成功率</span>
                </div>
              </div>
            </div>
            
            <div className="agent-preview-quote">
              <QuoteIcon />
              <p>"{agent.signatureQuote}"</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Agent详细信息展示 */}
      <AgentDetailModal 
        agent={agents.find(a => a.id === selectedAgent)}
        isOpen={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />
    </section>
  );
};
```

## 3. 主要功能页面设计

### 3.1 创意提交页面

```jsx
const IdeaSubmissionPage = () => {
  const [ideaContent, setIdeaContent] = useState('');
  const [submissionMode, setSubmissionMode] = useState('text'); // 'text', 'voice', 'image'
  
  return (
    <div className="idea-submission-page">
      <div className="submission-header">
        <h1>分享你的创意</h1>
        <p>让5位AI专家为你的想法估价和改造</p>
        
        <div className="current-points">
          <CoinIcon />
          <span>当前积分: {user.points}</span>
        </div>
      </div>
      
      <div className="submission-form">
        <div className="input-mode-selector">
          <button 
            className={`mode-btn ${submissionMode === 'text' ? 'active' : ''}`}
            onClick={() => setSubmissionMode('text')}
          >
            <TextIcon />
            文字描述
          </button>
          <button 
            className={`mode-btn ${submissionMode === 'voice' ? 'active' : ''}`}
            onClick={() => setSubmissionMode('voice')}
          >
            <MicIcon />
            语音输入
          </button>
          <button 
            className={`mode-btn ${submissionMode === 'image' ? 'active' : ''}`}
            onClick={() => setSubmissionMode('image')}
          >
            <ImageIcon />
            图片上传
          </button>
        </div>
        
        <div className="input-area">
          {submissionMode === 'text' && (
            <div className="text-input-area">
              <textarea
                value={ideaContent}
                onChange={(e) => setIdeaContent(e.target.value)}
                placeholder="描述你的创意想法..."
                className="idea-textarea"
              />
              <div className="input-helpers">
                <div className="word-count">
                  {ideaContent.length} / 500 字
                </div>
                <div className="smart-suggestions">
                  <SmartSuggestions content={ideaContent} />
                </div>
              </div>
            </div>
          )}
          
          {submissionMode === 'voice' && (
            <VoiceInputComponent 
              onTranscript={setIdeaContent}
              className="voice-input-area"
            />
          )}
          
          {submissionMode === 'image' && (
            <ImageUploadComponent 
              onImageAnalysis={setIdeaContent}
              className="image-input-area"
            />
          )}
        </div>
        
        <div className="submission-preview">
          <h3>预览效果</h3>
          <div className="preview-card">
            <div className="idea-preview">
              <h4>创意标题</h4>
              <p>{ideaContent || '暂无内容'}</p>
            </div>
            <div className="estimated-interest">
              <h4>预估兴趣度</h4>
              <AgentInterestPreview content={ideaContent} />
            </div>
          </div>
        </div>
        
        <div className="submission-actions">
          <button className="btn-secondary">保存草稿</button>
          <button 
            className="btn-primary"
            disabled={!ideaContent.trim()}
          >
            提交创意并开始讨论
            <ArrowRightIcon />
          </button>
        </div>
      </div>
      
      {/* 实时帮助侧边栏 */}
      <SubmissionHelpSidebar />
    </div>
  );
};
```

### 3.2 实时讨论页面

```jsx
const DiscussionPage = ({ ideaId }) => {
  const [discussionState, setDiscussionState] = useState('loading');
  const [userSpeakingSlots, setUserSpeakingSlots] = useState(initializeSlots());
  const [messages, setMessages] = useState([]);
  
  return (
    <div className="discussion-page">
      {/* 讨论头部信息 */}
      <DiscussionHeader idea={idea} discussionState={discussionState} />
      
      <div className="discussion-layout">
        {/* 左侧：Agent状态面板 */}
        <div className="agents-panel">
          <div className="panel-header">
            <h3>AI专家团</h3>
            <div className="discussion-timer">
              <TimerIcon />
              <span>{remainingTime}</span>
            </div>
          </div>
          
          <div className="agents-list">
            {agents.map(agent => (
              <AgentStatusCard 
                key={agent.id}
                agent={agent}
                currentState={discussionState.agentStates[agent.id]}
                className={`agent-card ${agent.isCurrentSpeaker ? 'speaking' : ''}`}
              />
            ))}
          </div>
          
          {/* 当前出价排行 */}
          <BiddingLeaderboard 
            bids={discussionState.currentBids}
            className="bidding-panel"
          />
        </div>
        
        {/* 中间：讨论主体 */}
        <div className="discussion-main">
          {/* 讨论阶段指示器 */}
          <DiscussionPhaseIndicator currentPhase={discussionState.phase} />
          
          {/* 消息流 */}
          <div className="message-stream">
            <MessageList 
              messages={messages}
              agents={agents}
              currentUser={user}
            />
            
            {/* 实时输入指示器 */}
            <TypingIndicators activeAgents={getTypingAgents()} />
          </div>
          
          {/* 用户发言区域 */}
          <UserSpeakingArea 
            availableSlots={userSpeakingSlots}
            discussionPhase={discussionState.phase}
            onSpeak={handleUserSpeak}
            className="user-input-area"
          />
        </div>
        
        {/* 右侧：实时分析面板 */}
        <div className="analysis-panel">
          {/* 用户影响力显示 */}
          <UserImpactDisplay 
            currentImpact={userImpact}
            historicalData={userHistory}
          />
          
          {/* 讨论情绪分析 */}
          <DiscussionSentimentAnalysis 
            messages={messages}
            agents={agents}
          />
          
          {/* 预测面板 */}
          <PredictionPanel 
            discussionState={discussionState}
            userActions={userPossibleActions}
          />
        </div>
      </div>
      
      {/* 浮动提示 */}
      <FloatingHints 
        discussionPhase={discussionState.phase}
        availableActions={getAvailableActions()}
      />
    </div>
  );
};
```

### 3.3 Agent商店页面

```jsx
const AgentStorePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  
  return (
    <div className="agent-store-page">
      <div className="store-header">
        <h1>AI专家作品商店</h1>
        <p>发现被AI大师们改造升级的创意作品</p>
        
        <div className="store-stats">
          <div className="stat">
            <span className="stat-number">1,234</span>
            <span className="stat-label">改造作品</span>
          </div>
          <div className="stat">
            <span className="stat-number">5,678</span>
            <span className="stat-label">满意用户</span>
          </div>
          <div className="stat">
            <span className="stat-number">89%</span>
            <span className="stat-label">好评率</span>
          </div>
        </div>
      </div>
      
      <div className="store-layout">
        {/* 筛选侧边栏 */}
        <div className="filters-sidebar">
          <div className="filter-section">
            <h3>按专家筛选</h3>
            <AgentFilter 
              agents={agents}
              selectedAgents={selectedAgents}
              onChange={setSelectedAgents}
            />
          </div>
          
          <div className="filter-section">
            <h3>价格范围</h3>
            <PriceRangeSlider 
              range={priceRange}
              onChange={setPriceRange}
              min={0}
              max={1000}
            />
          </div>
          
          <div className="filter-section">
            <h3>创意类别</h3>
            <CategoryFilter 
              categories={categories}
              selected={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>
          
          <div className="filter-section">
            <h3>质量评级</h3>
            <QualityFilter 
              minRating={minRating}
              onChange={setMinRating}
            />
          </div>
        </div>
        
        {/* 主要内容区域 */}
        <div className="store-main">
          {/* 排序和视图选择 */}
          <div className="store-controls">
            <div className="sort-options">
              <label>排序方式：</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="latest">最新发布</option>
                <option value="popular">最受欢迎</option>
                <option value="price-low">价格由低到高</option>
                <option value="price-high">价格由高到低</option>
                <option value="rating">评分最高</option>
              </select>
            </div>
            
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <GridIcon />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <ListIcon />
              </button>
            </div>
          </div>
          
          {/* 商品网格 */}
          <div className={`products-grid ${viewMode}`}>
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                viewMode={viewMode}
                onAddToCart={handleAddToCart}
                onQuickView={handleQuickView}
              />
            ))}
          </div>
          
          {/* 分页 */}
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};
```

## 4. 移动端设计适配

### 4.1 移动端导航设计

```jsx
const MobileNavigation = () => {
  const [activeTab, setActiveTab] = useState('home');
  
  return (
    <>
      {/* 顶部导航栏 */}
      <div className="mobile-header">
        <div className="header-left">
          <button className="menu-btn">
            <MenuIcon />
          </button>
          <div className="logo">
            <img src="/logo-mobile.svg" alt="AI Agent Market" />
          </div>
        </div>
        
        <div className="header-right">
          <div className="points-display">
            <CoinIcon />
            <span>{user.points}</span>
          </div>
          <button className="profile-btn">
            <Avatar src={user.avatar} size="sm" />
          </button>
        </div>
      </div>
      
      {/* 底部标签栏 */}
      <div className="mobile-tab-bar">
        <TabButton 
          icon={<HomeIcon />}
          label="首页"
          active={activeTab === 'home'}
          onClick={() => setActiveTab('home')}
        />
        <TabButton 
          icon={<IdeaIcon />}
          label="提交创意"
          active={activeTab === 'submit'}
          onClick={() => setActiveTab('submit')}
        />
        <TabButton 
          icon={<DiscussionIcon />}
          label="讨论"
          active={activeTab === 'discussion'}
          badge={getActiveDiscussionsCount()}
          onClick={() => setActiveTab('discussion')}
        />
        <TabButton 
          icon={<StoreIcon />}
          label="商店"
          active={activeTab === 'store'}
          onClick={() => setActiveTab('store')}
        />
        <TabButton 
          icon={<ProfileIcon />}
          label="我的"
          active={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
        />
      </div>
    </>
  );
};
```

### 4.2 移动端讨论界面

```jsx
const MobileDiscussionInterface = ({ ideaId }) => {
  const [viewMode, setViewMode] = useState('discussion'); // 'discussion', 'agents', 'analysis'
  
  return (
    <div className="mobile-discussion">
      {/* 讨论信息头部 */}
      <div className="discussion-header-mobile">
        <div className="idea-summary">
          <h3>{idea.title}</h3>
          <p>{truncate(idea.content, 80)}</p>
        </div>
        
        <div className="discussion-progress">
          <ProgressRing 
            progress={discussionProgress}
            timeRemaining={timeRemaining}
          />
        </div>
      </div>
      
      {/* 视图切换器 */}
      <div className="view-switcher">
        <button 
          className={`switch-btn ${viewMode === 'discussion' ? 'active' : ''}`}
          onClick={() => setViewMode('discussion')}
        >
          <ChatIcon />
          讨论
        </button>
        <button 
          className={`switch-btn ${viewMode === 'agents' ? 'active' : ''}`}
          onClick={() => setViewMode('agents')}
        >
          <AgentsIcon />
          专家({agents.length})
        </button>
        <button 
          className={`switch-btn ${viewMode === 'analysis' ? 'active' : ''}`}
          onClick={() => setViewMode('analysis')}
        >
          <AnalysisIcon />
          分析
        </button>
      </div>
      
      {/* 主要内容区域 */}
      <div className="mobile-discussion-content">
        {viewMode === 'discussion' && (
          <div className="discussion-view">
            {/* 消息流 */}
            <div className="message-stream-mobile">
              <MessageListMobile 
                messages={messages}
                agents={agents}
                currentUser={user}
              />
            </div>
            
            {/* 用户发言区域 */}
            <MobileUserSpeakingArea 
              availableSlots={userSpeakingSlots}
              onSpeak={handleUserSpeak}
            />
          </div>
        )}
        
        {viewMode === 'agents' && (
          <div className="agents-view">
            <MobileAgentsList 
              agents={agents}
              discussionState={discussionState}
              currentBids={currentBids}
            />
          </div>
        )}
        
        {viewMode === 'analysis' && (
          <div className="analysis-view">
            <MobileAnalysisPanel 
              userImpact={userImpact}
              discussionAnalytics={discussionAnalytics}
              predictions={predictions}
            />
          </div>
        )}
      </div>
      
      {/* 快捷操作浮动按钮 */}
      <MobileQuickActions 
        availableActions={getAvailableActions()}
        onAction={handleQuickAction}
      />
    </div>
  );
};
```

## 5. 交互动效设计

### 5.1 Agent个性化动效

```css
/* Agent状态动画 */
.agent-avatar {
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 老王（商人）- 金钱相关动效 */
.agent-avatar.wang.thinking {
  animation: money-counting 2s infinite;
}

.agent-avatar.wang.excited {
  animation: gold-shine 1.5s ease-in-out;
}

@keyframes money-counting {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.05) rotate(2deg); }
  75% { transform: scale(1.05) rotate(-2deg); }
}

@keyframes gold-shine {
  0% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.3); }
  50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.8); }
  100% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.3); }
}

/* 小琳（文艺）- 优雅飘逸动效 */
.agent-avatar.lin.thinking {
  animation: gentle-float 3s ease-in-out infinite;
}

.agent-avatar.lin.inspired {
  animation: sparkle-burst 2s ease-out;
}

@keyframes gentle-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

@keyframes sparkle-burst {
  0% { 
    transform: scale(1);
    filter: brightness(1);
  }
  50% { 
    transform: scale(1.1);
    filter: brightness(1.3);
  }
  100% { 
    transform: scale(1);
    filter: brightness(1);
  }
}

/* 艾克斯（科技）- 数字化动效 */
.agent-avatar.alex.processing {
  animation: data-processing 1.5s linear infinite;
}

.agent-avatar.alex.breakthrough {
  animation: tech-pulse 1s ease-out;
}

@keyframes data-processing {
  0% { 
    border: 2px solid transparent;
    background-image: linear-gradient(45deg, #06B6D4, #3B82F6);
  }
  25% { 
    border: 2px solid #06B6D4;
    background-image: linear-gradient(135deg, #3B82F6, #06B6D4);
  }
  50% { 
    border: 2px solid #3B82F6;
    background-image: linear-gradient(225deg, #06B6D4, #3B82F6);
  }
  75% { 
    border: 2px solid #06B6D4;
    background-image: linear-gradient(315deg, #3B82F6, #06B6D4);
  }
  100% { 
    border: 2px solid transparent;
    background-image: linear-gradient(45deg, #06B6D4, #3B82F6);
  }
}

/* 讨论气泡动效 */
.message-bubble {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
  animation: message-appear 0.4s ease-out forwards;
}

.message-bubble.user {
  animation: user-message-appear 0.4s ease-out forwards;
}

.message-bubble.agent {
  animation: agent-message-appear 0.4s ease-out forwards;
}

@keyframes message-appear {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes user-message-appear {
  0% {
    opacity: 0;
    transform: translateX(30px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes agent-message-appear {
  0% {
    opacity: 0;
    transform: translateX(-30px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}
```

### 5.2 状态转换动画

```css
/* 讨论阶段转换动画 */
.phase-transition {
  position: relative;
  overflow: hidden;
}

.phase-transition::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: phase-sweep 1s ease-in-out;
}

@keyframes phase-sweep {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* 出价竞争动画 */
.bid-competition {
  position: relative;
}

.bid-item {
  transition: all 0.3s ease;
  transform-origin: center;
}

.bid-item.new-high-bid {
  animation: bid-celebration 1s ease-out;
}

.bid-item.outbid {
  animation: bid-defeat 0.5s ease-out;
}

@keyframes bid-celebration {
  0% { 
    transform: scale(1);
    background-color: var(--success);
  }
  25% { 
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
  }
  50% { 
    transform: scale(1.05);
  }
  100% { 
    transform: scale(1);
    background-color: var(--success);
  }
}

@keyframes bid-defeat {
  0% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(0.95);
    opacity: 0.7;
  }
  100% { 
    transform: scale(1);
    opacity: 0.6;
  }
}

/* 用户影响力波纹效果 */
.impact-ripple {
  position: relative;
  overflow: hidden;
}

.impact-ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent);
  transform: translate(-50%, -50%);
  animation: impact-ripple 1.5s ease-out;
}

@keyframes impact-ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    width: 200px;
    height: 200px;
    opacity: 0;
  }
}
```

## 6. 响应式设计系统

### 6.1 断点系统

```css
/* 响应式断点定义 */
:root {
  --breakpoint-xs: 475px;
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* 容器系统 */
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 475px) {
  .container { max-width: 475px; }
}

@media (min-width: 640px) {
  .container { 
    max-width: 640px;
    padding: 0 1.5rem;
  }
}

@media (min-width: 768px) {
  .container { 
    max-width: 768px;
    padding: 0 2rem;
  }
}

@media (min-width: 1024px) {
  .container { 
    max-width: 1024px;
    padding: 0 2.5rem;
  }
}

@media (min-width: 1280px) {
  .container { 
    max-width: 1280px;
    padding: 0 3rem;
  }
}

/* 网格系统 */
.grid {
  display: grid;
  gap: 1rem;
}

/* 移动端 - 单列布局 */
@media (max-width: 767px) {
  .grid-responsive {
    grid-template-columns: 1fr;
  }
  
  .agent-showcase .agent-grid {
    grid-template-columns: 1fr;
  }
  
  .discussion-layout {
    flex-direction: column;
  }
  
  .agents-panel,
  .analysis-panel {
    order: 2;
    width: 100%;
  }
  
  .discussion-main {
    order: 1;
    width: 100%;
  }
}

/* 平板端 - 双列布局 */
@media (min-width: 768px) and (max-width: 1023px) {
  .grid-responsive {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .discussion-layout {
    flex-direction: row;
  }
  
  .agents-panel {
    width: 250px;
  }
  
  .analysis-panel {
    width: 200px;
  }
  
  .discussion-main {
    flex: 1;
  }
}

/* 桌面端 - 三列布局 */
@media (min-width: 1024px) {
  .grid-responsive {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  
  .discussion-layout {
    display: flex;
    gap: 1.5rem;
  }
  
  .agents-panel {
    width: 280px;
    flex-shrink: 0;
  }
  
  .discussion-main {
    flex: 1;
    min-width: 0;
  }
  
  .analysis-panel {
    width: 300px;
    flex-shrink: 0;
  }
}
```

## 7. 无障碍设计

### 7.1 键盘导航

```jsx
const AccessibleNavigation = () => {
  const [focusIndex, setFocusIndex] = useState(0);
  const navigationItems = [
    { id: 'submit-idea', label: '提交创意', action: () => {} },
    { id: 'view-discussions', label: '查看讨论', action: () => {} },
    { id: 'agent-store', label: 'Agent商店', action: () => {} },
    { id: 'my-profile', label: '我的档案', action: () => {} }
  ];
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Tab':
          e.preventDefault();
          setFocusIndex((prev) => (prev + 1) % navigationItems.length);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          navigationItems[focusIndex].action();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusIndex((prev) => (prev + 1) % navigationItems.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusIndex((prev) => (prev - 1 + navigationItems.length) % navigationItems.length);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusIndex]);
  
  return (
    <nav 
      className="accessible-navigation"
      role="navigation"
      aria-label="主要导航"
    >
      {navigationItems.map((item, index) => (
        <button
          key={item.id}
          className={`nav-item ${index === focusIndex ? 'focused' : ''}`}
          onClick={item.action}
          aria-label={item.label}
          tabIndex={index === focusIndex ? 0 : -1}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};
```

### 7.2 屏幕阅读器支持

```jsx
const AccessibleDiscussion = ({ messages, agents }) => {
  const [announcements, setAnnouncements] = useState([]);
  
  // 实时宣布重要事件
  const announceEvent = (message, priority = 'polite') => {
    setAnnouncements(prev => [...prev, { message, priority, id: Date.now() }]);
  };
  
  useEffect(() => {
    // 监听新消息
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      if (lastMessage.type === 'agent_response') {
        const agent = agents.find(a => a.id === lastMessage.agentId);
        announceEvent(`${agent.name}说：${lastMessage.content}`);
      } else if (lastMessage.type === 'user_speech') {
        announceEvent('你的发言已发送');
      } else if (lastMessage.type === 'bid') {
        announceEvent(`${lastMessage.agentName}出价${lastMessage.amount}积分`, 'assertive');
      }
    }
  }, [messages]);
  
  return (
    <div className="accessible-discussion">
      {/* 实时宣布区域 */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcements.filter(a => a.priority === 'polite').map(announcement => (
          <div key={announcement.id}>{announcement.message}</div>
        ))}
      </div>
      
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {announcements.filter(a => a.priority === 'assertive').map(announcement => (
          <div key={announcement.id}>{announcement.message}</div>
        ))}
      </div>
      
      {/* 讨论内容 */}
      <main role="main" aria-label="AI专家讨论">
        <section aria-label="讨论历史">
          {messages.map(message => (
            <div 
              key={message.id}
              role="article"
              aria-label={`${message.speakerType === 'agent' ? agents.find(a => a.id === message.agentId)?.name : '用户'}的发言`}
            >
              <div className="message-content">
                {message.content}
              </div>
              <div className="message-meta" aria-label="发言时间">
                {formatTime(message.timestamp)}
              </div>
            </div>
          ))}
        </section>
        
        <section aria-label="发言控制">
          <AccessibleSpeakingControls 
            onSpeak={announceEvent}
            availableSlots={userSpeakingSlots}
          />
        </section>
      </main>
    </div>
  );
};
```

## 8. 性能优化策略

### 8.1 代码分割和懒加载

```jsx
// 路由级别的代码分割
const HomePage = lazy(() => import('./pages/HomePage'));
const DiscussionPage = lazy(() => import('./pages/DiscussionPage'));
const AgentStorePage = lazy(() => import('./pages/AgentStorePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// 组件级别的懒加载
const HeavyAnalyticsComponent = lazy(() => 
  import('./components/HeavyAnalyticsComponent')
);

const VideoPlayer = lazy(() => 
  import('./components/VideoPlayer')
);

// 智能预加载
const useIntelligentPreload = () => {
  const preloadComponent = useCallback((componentImporter) => {
    // 在空闲时间预加载
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        componentImporter();
      });
    } else {
      // 降级方案
      setTimeout(componentImporter, 100);
    }
  }, []);
  
  return { preloadComponent };
};
```

### 8.2 图片和资源优化

```jsx
// 智能图片组件
const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false,
  className 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef();
  
  // 交叉观察器用于懒加载
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current && !priority) {
      observer.observe(imgRef.current);
    } else {
      setInView(true);
    }
    
    return () => observer.disconnect();
  }, [priority]);
  
  // 生成响应式图片URLs
  const generateSrcSet = (baseSrc) => {
    const sizes = [400, 800, 1200, 1600];
    return sizes.map(size => 
      `${baseSrc}?w=${size}&q=75 ${size}w`
    ).join(', ');
  };
  
  return (
    <div 
      ref={imgRef}
      className={`optimized-image ${className} ${loaded ? 'loaded' : 'loading'}`}
      style={{ width, height }}
    >
      {inView && (
        <>
          {/* 低质量占位图 */}
          <img
            src={`${src}?w=50&q=10&blur=10`}
            alt=""
            className="placeholder-image"
            loading="eager"
          />
          
          {/* 主图片 */}
          <img
            src={`${src}?w=${width}&q=75`}
            srcSet={generateSrcSet(src)}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            alt={alt}
            className="main-image"
            loading={priority ? "eager" : "lazy"}
            onLoad={() => setLoaded(true)}
          />
        </>
      )}
    </div>
  );
};
```

## 9. 总结

这个网站设计方案重点解决了以下问题：

### 核心设计目标
1. **降低认知负担** - 通过直观的视觉设计帮助用户理解AI Agent概念
2. **增强沉浸感** - 通过个性化动效和实时交互营造真实讨论氛围  
3. **提升参与度** - 通过游戏化元素和即时反馈增强用户粘性
4. **确保可访问性** - 通过无障碍设计让所有用户都能使用

### 技术创新点
- **Agent个性化视觉系统** - 每个AI有独特的视觉风格和动效
- **实时讨论界面** - 支持多人同时参与的复杂交互
- **智能响应式设计** - 根据设备和使用场景自适应
- **性能优化策略** - 确保复杂功能下的流畅体验

### 用户体验特色
- **渐进式功能揭示** - 新用户从简单开始，逐步解锁高级功能
- **情感化交互设计** - 通过动效和视觉反馈建立情感连接
- **多设备无缝切换** - 在手机、平板、电脑间保持一致体验
- **智能引导系统** - 在关键节点提供恰当的帮助和建议

这个设计方案确保了AI Agent市场既具有创新的技术特性，又保持了优秀的用户体验和可访问性。

## 2. 页面布局架构

### 2.1 响应式网格系统

```css
/* 12列网格系统 */
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* 响应式断点 */
@media (max-width: 640px) {
  .grid-container {
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    padding: 0 1rem;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(8, 1fr);
    gap: 1.25rem;
    padding: 0 1.5rem;
  }
}

/* 布局组件 */
.layout-full { grid-column: 1 / -1; }
.layout-main { grid-column: 1 / 9; }
.layout-sidebar { grid-column: 9 / -1; }
.layout-hero { grid-column: 2 / 12; }
.layout-content { grid-column: 3 / 11; }

/* 移动端适配 */
@media (max-width: 640px) {
  .layout-main,
  .layout-sidebar,
  .layout-hero,
  .layout-content {
    grid-column: 1 / -1;
  }
}
```

### 2.2 核心页面布局设计

```typescript
// 1. 首页布局结构
interface HomePageLayout {
  header: {
    height: '80px';
    position: 'sticky';
    components: ['Logo', 'Navigation', 'UserActions'];
  };
  
  hero: {
    height: '100vh';
    sections: ['HeroContent', 'AgentPreviewCircle', 'CallToAction'];
    background: 'gradient-mesh';
  };
  
  agentShowcase: {
    height: 'auto';
    layout: 'grid-5-columns'; // 桌面端5列，移动端1列
    components: ['AgentCard[]', 'AgentDetailModal'];
  };
  
  howItWorks: {
    height: 'auto';
    layout: 'timeline-horizontal'; // 桌面端横向，移动端纵向
    components: ['StepCard[]', 'ProcessAnimation'];
  };
  
  liveActivity: {
    height: '600px';
    layout: 'split-screen';
    components: ['ActivityFeed', 'StatsDashboard'];
  };
  
  footer: {
    height: '200px';
    layout: 'multi-column';
    components: ['Links', 'SocialMedia', 'Newsletter'];
  };
}

// 2. 讨论页面布局结构
interface DiscussionPageLayout {
  header: {
    height: '64px';
    components: ['BackButton', 'IdeaTitle', 'DiscussionTimer', 'Actions'];
  };
  
  main: {
    layout: 'three-column'; // 左：Agent状态，中：讨论，右：分析
    columns: {
      left: {
        width: '280px';
        components: ['AgentStatusPanel', 'BiddingLeaderboard'];
      };
      center: {
        flex: '1';
        components: ['DiscussionStream', 'UserInputArea'];
      };
      right: {
        width: '320px';
        components: ['ImpactPanel', 'PredictionPanel', 'AnalyticsPanel'];
      };
    };
  };
  
  mobile: {
    layout: 'tab-switching'; // 移动端通过标签切换视图
    tabs: ['讨论', 'Agent状态', '数据分析'];
  };
}

// 3. Agent商店布局结构
interface StorePageLayout {
  header: {
    height: '120px';
    components: ['StoreTitle', 'SearchBar', 'ViewToggle'];
  };
  
  filters: {
    width: '280px';
    position: 'sticky';
    components: ['AgentFilter', 'PriceFilter', 'CategoryFilter', 'RatingFilter'];
  };
  
  products: {
    flex: '1';
    layout: 'responsive-grid'; // 自适应网格
    components: ['ProductCard[]', 'LoadMore', 'Pagination'];
  };
  
  quickView: {
    type: 'modal';
    components: ['ProductPreview', 'AgentInfo', 'PurchaseActions'];
  };
}
```

### 2.3 组件层级架构

```typescript
// 页面组件层级结构
interface ComponentHierarchy {
  // 布局层 (Layout Layer)
  layouts: {
    AppLayout: '应用根布局';
    MarketingLayout: '营销页面布局';
    DashboardLayout: '用户仪表板布局';
    DiscussionLayout: '讨论页面布局';
  };
  
  // 页面层 (Page Layer)
  pages: {
    HomePage: '首页';
    DiscussionPage: '讨论页面';
    StorePage: '商店页面';
    ProfilePage: '个人资料页';
  };
  
  // 功能层 (Feature Layer)
  features: {
    AgentShowcase: 'Agent展示功能';
    DiscussionEngine: '讨论引擎功能';
    StoreSystem: '商店系统功能';
    UserDashboard: '用户仪表板功能';
  };
  
  // 组件层 (Component Layer)
  components: {
    ui: 'UI基础组件';
    business: '业务组件';
    layout: '布局组件';
    form: '表单组件';
  };
  
  // 原子层 (Atomic Layer)
  atoms: {
    Button: '按钮';
    Input: '输入框';
    Avatar: '头像';
    Badge: '徽章';
  };
}
```

## 3. 视觉设计风格系统

### 3.1 设计主题定位

```typescript
// 设计哲学
interface DesignPhilosophy {
  core: 'Human-Centered AI'; // 以人为中心的AI
  
  principles: {
    approachable: '平易近人 - AI不应该让人感到intimidating';
    playful: '趣味性 - 通过游戏化元素增加参与度';
    trustworthy: '可信赖 - 通过透明的设计建立信任';
    personal: '个性化 - 每个Agent都有独特的视觉特征';
    progressive: '渐进式 - 从简单到复杂的信息层次';
  };
  
  personality: 'Modern, Warm, Intelligent, Conversational';
}

// 品牌色彩系统
interface ColorSystem {
  // 主色调 - 科技蓝
  primary: {
    50: '#eff6ff',   // 最浅
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // 主色
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',  // 最深
  };
  
  // Agent个性色彩
  agents: {
    wang: {
      primary: '#dc2626',   // 商人红
      secondary: '#fbbf24', // 金色
      gradient: 'linear-gradient(135deg, #dc2626, #fbbf24)';
    };
    lin: {
      primary: '#ec4899',   // 文艺粉
      secondary: '#a855f7', // 紫色
      gradient: 'linear-gradient(135deg, #ec4899, #a855f7)';
    };
    alex: {
      primary: '#06b6d4',   // 科技青
      secondary: '#3b82f6', // 蓝色
      gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)';
    };
    allen: {
      primary: '#f59e0b',   // 趋势橙
      secondary: '#ef4444', // 红色
      gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)';
    };
    li: {
      primary: '#7c3aed',   // 学术紫
      secondary: '#1d4ed8', // 深蓝
      gradient: 'linear-gradient(135deg, #7c3aed, #1d4ed8)';
    };
  };
  
  // 功能色彩
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  };
  
  // 中性色彩
  neutral: {
    white: '#ffffff',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    };
    black: '#000000',
  };
}
```

### 3.2 字体系统设计

```css
/* 字体层级系统 */
:root {
  /* 字体族 */
  --font-display: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-agent-wang: 'Noto Sans SC', sans-serif; /* 商务感中文字体 */
  --font-agent-lin: 'ZCOOL XiaoWei', serif; /* 文艺感中文字体 */
  
  /* 字体大小 */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
  --text-6xl: 3.75rem;   /* 60px */
  
  /* 行高 */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
  
  /* 字重 */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
}

/* 语义化字体类 */
.text-hero {
  font-size: var(--text-6xl);
  font-weight: var(--font-extrabold);
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
}

.text-heading-1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
}

.text-heading-2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
}

.text-heading-3 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-normal);
}

.text-body-large {
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
}

.text-body {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}

.text-caption {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
}

/* Agent个性化字体 */
.text-agent-wang {
  font-family: var(--font-agent-wang);
  font-weight: var(--font-semibold);
  color: var(--color-agent-wang);
}

.text-agent-lin {
  font-family: var(--font-agent-lin);
  font-weight: var(--font-normal);
  color: var(--color-agent-lin);
}
```

### 3.3 空间系统设计

```css
/* 间距系统 */
:root {
  /* 基础间距单位 */
  --space-0: 0;
  --space-px: 1px;
  --space-0_5: 0.125rem;  /* 2px */
  --space-1: 0.25rem;     /* 4px */
  --space-1_5: 0.375rem;  /* 6px */
  --space-2: 0.5rem;      /* 8px */
  --space-2_5: 0.625rem;  /* 10px */
  --space-3: 0.75rem;     /* 12px */
  --space-3_5: 0.875rem;  /* 14px */
  --space-4: 1rem;        /* 16px */
  --space-5: 1.25rem;     /* 20px */
  --space-6: 1.5rem;      /* 24px */
  --space-7: 1.75rem;     /* 28px */
  --space-8: 2rem;        /* 32px */
  --space-10: 2.5rem;     /* 40px */
  --space-12: 3rem;       /* 48px */
  --space-16: 4rem;       /* 64px */
  --space-20: 5rem;       /* 80px */
  --space-24: 6rem;       /* 96px */
  --space-32: 8rem;       /* 128px */
  
  /* 语义化间距 */
  --space-section: var(--space-24);     /* 区块间距 */
  --space-component: var(--space-8);    /* 组件间距 */
  --space-element: var(--space-4);      /* 元素间距 */
  --space-inline: var(--space-2);       /* 行内间距 */
}

/* 容器系统 */
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
    padding-left: var(--space-6);
    padding-right: var(--space-6);
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
    padding-left: var(--space-8);
    padding-right: var(--space-8);
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}

@media (min-width: 1536px) {
  .container {
    max-width: 1536px;
  }
}
```

### 3.4 组件设计系统

```typescript
// 基础组件设计规范
interface ComponentDesignSystem {
  // 按钮系统
  buttons: {
    sizes: {
      sm: { height: '32px', padding: '8px 12px', fontSize: '14px' };
      md: { height: '40px', padding: '10px 16px', fontSize: '16px' };
      lg: { height: '48px', padding: '12px 24px', fontSize: '18px' };
      xl: { height: '56px', padding: '16px 32px', fontSize: '20px' };
    };
    
    variants: {
      primary: {
        background: 'primary-gradient';
        color: 'white';
        border: 'none';
        hover: 'brightness(110%)';
      };
      secondary: {
        background: 'transparent';
        color: 'primary-600';
        border: '2px solid primary-600';
        hover: 'background: primary-50';
      };
      ghost: {
        background: 'transparent';
        color: 'gray-700';
        border: 'none';
        hover: 'background: gray-100';
      };
    };
    
    states: {
      default: 'transition: all 200ms ease';
      hover: 'transform: translateY(-1px), shadow-lg';
      active: 'transform: translateY(0), shadow-md';
      disabled: 'opacity: 0.5, cursor: not-allowed';
      loading: 'opacity: 0.8, cursor: wait';
    };
  };
  
  // 卡片系统
  cards: {
    variants: {
      elevated: {
        background: 'white';
        border: 'none';
        shadow: 'shadow-lg';
        borderRadius: '12px';
      };
      outlined: {
        background: 'white';
        border: '1px solid gray-200';
        shadow: 'shadow-sm';
        borderRadius: '8px';
      };
      filled: {
        background: 'gray-50';
        border: 'none';
        shadow: 'none';
        borderRadius: '8px';
      };
    };
    
    padding: {
      sm: 'p-4';
      md: 'p-6';
      lg: 'p-8';
    };
    
    hover: {
      elevated: 'shadow-xl, transform: translateY(-2px)';
      outlined: 'border-color: primary-300, shadow-md';
      filled: 'background: gray-100';
    };
  };
  
  // Agent特色组件
  agentComponents: {
    avatar: {
      sizes: { xs: '24px', sm: '32px', md: '48px', lg: '64px', xl: '96px' };
      border: '3px solid agent-color';
      animation: 'agent-specific-animation';
    };
    
    statusIndicator: {
      online: { color: 'green-500', animation: 'pulse' };
      thinking: { color: 'yellow-500', animation: 'thinking-dots' };
      speaking: { color: 'blue-500', animation: 'speaking-wave' };
      offline: { color: 'gray-400', animation: 'none' };
    };
    
    messageStyle: {
      wang: { 
        background: 'gradient(red-500, yellow-500)';
        fontWeight: 'semibold';
        borderRadius: '8px 8px 8px 2px';
      };
      lin: {
        background: 'gradient(pink-500, purple-500)';
        fontStyle: 'italic';
        borderRadius: '16px';
      };
      // ... 其他Agent样式
    };
  };
}
```

## 4. 组件设计系统详细规范

### 4.1 Agent个性化组件库

```tsx
// Agent头像组件
interface AgentAvatarProps {
  agentId: 'wang' | 'lin' | 'alex' | 'allen' | 'li';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status: 'online' | 'thinking' | 'speaking' | 'offline';
  showStatus?: boolean;
  animated?: boolean;
  onClick?: () => void;
}

const AgentAvatar: React.FC<AgentAvatarProps> = ({
  agentId,
  size,
  status,
  showStatus = true,
  animated = true,
  onClick
}) => {
  const agentConfig = {
    wang: {
      avatar: '/avatars/wang.webp',
      color: '#dc2626',
      gradient: 'from-red-600 to-yellow-500',
      animation: 'money-pulse'
    },
    lin: {
      avatar: '/avatars/lin.webp', 
      color: '#ec4899',
      gradient: 'from-pink-500 to-purple-500',
      animation: 'gentle-float'
    },
    alex: {
      avatar: '/avatars/alex.webp',
      color: '#06b6d4',
      gradient: 'from-cyan-500 to-blue-500',
      animation: 'tech-scan'
    },
    allen: {
      avatar: '/avatars/allen.webp',
      color: '#f59e0b',
      gradient: 'from-orange-500 to-red-500',
      animation: 'trend-pulse'
    },
    li: {
      avatar: '/avatars/li.webp',
      color: '#7c3aed',
      gradient: 'from-purple-600 to-blue-600',
      animation: 'wisdom-glow'
    }
  };
  
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };
  
  const config = agentConfig[agentId];
  
  return (
    <div 
      className={`
        relative ${sizeClasses[size]} cursor-pointer
        ${animated ? `animate-${config.animation}` : ''}
        transition-transform duration-200 hover:scale-105
      `}
      onClick={onClick}
    >
      {/* 头像背景渐变 */}
      <div className={`
        absolute inset-0 rounded-full
        bg-gradient-to-br ${config.gradient}
        opacity-20 blur-sm animate-pulse
      `} />
      
      {/* 头像图片 */}
      <img
        src={config.avatar}
        alt={`Agent ${agentId}`}
        className="relative z-10 w-full h-full rounded-full object-cover border-2"
        style={{ borderColor: config.color }}
      />
      
      {/* 状态指示器 */}
      {showStatus && (
        <div className={`
          absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white
          ${status === 'online' ? 'bg-green-500' : ''}
          ${status === 'thinking' ? 'bg-yellow-500 animate-pulse' : ''}
          ${status === 'speaking' ? 'bg-blue-500 animate-ping' : ''}
          ${status === 'offline' ? 'bg-gray-400' : ''}
        `} />
      )}
    </div>
  );
};

// Agent消息气泡组件
interface AgentMessageBubbleProps {
  agentId: string;
  message: string;
  timestamp: Date;
  type: 'analysis' | 'reaction' | 'bid' | 'question';
  isHighlighted?: boolean;
}

const AgentMessageBubble: React.FC<AgentMessageBubbleProps> = ({
  agentId,
  message,
  timestamp,
  type,
  isHighlighted = false
}) => {
  const agentStyles = {
    wang: 'bg-gradient-to-br from-red-500 to-yellow-500 text-white font-semibold',
    lin: 'bg-gradient-to-br from-pink-500 to-purple-500 text-white italic',
    alex: 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-mono',
    allen: 'bg-gradient-to-br from-orange-500 to-red-500 text-white',
    li: 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
  };
  
  const typeIcons = {
    analysis: '🔍',
    reaction: '💭', 
    bid: '💰',
    question: '❓'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        relative max-w-md p-4 rounded-2xl shadow-lg
        ${agentStyles[agentId]}
        ${isHighlighted ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''}
        transform transition-all duration-200 hover:scale-105
      `}
    >
      {/* 消息类型标识 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{typeIcons[type]}</span>
        <span className="text-sm opacity-80 capitalize">{type}</span>
      </div>
      
      {/* 消息内容 */}
      <p className="text-sm leading-relaxed">{message}</p>
      
      {/* 时间戳 */}
      <div className="mt-2 text-xs opacity-60">
        {formatTime(timestamp)}
      </div>
      
      {/* 装饰性元素 */}
      <div className="absolute -bottom-2 left-6 w-4 h-4 bg-inherit transform rotate-45" />
    </motion.div>
  );
};
```

### 4.2 交互状态组件

```tsx
// 讨论阶段指示器
interface DiscussionPhaseIndicatorProps {
  currentPhase: 'waiting' | 'initial_analysis' | 'heated_debate' | 'final_bidding';
  timeRemaining: number;
  totalTime: number;
}

const DiscussionPhaseIndicator: React.FC<DiscussionPhaseIndicatorProps> = ({
  currentPhase,
  timeRemaining,
  totalTime
}) => {
  const phases = [
    { id: 'waiting', label: '等待开始', duration: 60 },
    { id: 'initial_analysis', label: '初步分析', duration: 180 },
    { id: 'heated_debate', label: '激烈讨论', duration: 240 },
    { id: 'final_bidding', label: '最终竞价', duration: 120 }
  ];
  
  const progress = ((totalTime - timeRemaining) / totalTime) * 100;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      {/* 阶段进度条 */}
      <div className="flex items-center justify-between mb-4">
        {phases.map((phase, index) => {
          const isActive = phase.id === currentPhase;
          const isCompleted = phases.findIndex(p => p.id === currentPhase) > index;
          
          return (
            <div key={phase.id} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full border-2 flex items-center justify-center
                transition-all duration-300
                ${isActive 
                  ? 'border-blue-500 bg-blue-50 text-blue-600' 
                  : isCompleted 
                    ? 'border-green-500 bg-green-50 text-green-600'
                    : 'border-gray-300 bg-gray-50 text-gray-400'
                }
              `}>
                {isCompleted ? '✓' : index + 1}
              </div>
              
              <div className="ml-3">
                <div className={`text-sm font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {phase.label}
                </div>
                <div className="text-xs text-gray-500">
                  {phase.duration}秒
                </div>
              </div>
              
              {index < phases.length - 1 && (
                <div className={`
                  w-16 h-1 mx-4 rounded
                  ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                `} />
              )}
            </div>
          );
        })}
      </div>
      
      {/* 总体进度条 */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* 剩余时间 */}
      <div className="mt-2 text-center">
        <span className="text-2xl font-mono font-bold text-gray-800">
          {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
        </span>
        <span className="text-sm text-gray-500 ml-2">剩余时间</span>
      </div>
    </div>
  );
};

// 用户发言机会指示器
interface SpeakingOpportunityIndicatorProps {
  opportunities: Array<{
    id: number;
    label: string;
    timeWindow: [number, number];
    used: boolean;
    available: boolean;
  }>;
  currentTime: number;
  onUseOpportunity: (id: number) => void;
}

const SpeakingOpportunityIndicator: React.FC<SpeakingOpportunityIndicatorProps> = ({
  opportunities,
  currentTime,
  onUseOpportunity
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">你的发言机会</h3>
      
      <div className="space-y-3">
        {opportunities.map((opportunity) => {
          const isInWindow = currentTime >= opportunity.timeWindow[0] && 
                           currentTime <= opportunity.timeWindow[1];
          const isPast = currentTime > opportunity.timeWindow[1];
          
          return (
            <div 
              key={opportunity.id}
              className={`
                p-3 rounded-lg border transition-all duration-300
                ${opportunity.used 
                  ? 'bg-gray-100 border-gray-300' 
                  : isInWindow 
                    ? 'bg-green-100 border-green-300 shadow-md' 
                    : isPast
                      ? 'bg-red-100 border-red-300'
                      : 'bg-white border-gray-200'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800">
                    {opportunity.label}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatTimeWindow(opportunity.timeWindow)}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {opportunity.used && (
                    <span className="text-green-600 text-sm">✓ 已使用</span>
                  )}
                  
                  {!opportunity.used && isInWindow && (
                    <button
                      onClick={() => onUseOpportunity(opportunity.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      立即发言
                    </button>
                  )}
                  
                  {!opportunity.used && isPast && (
                    <span className="text-red-600 text-sm">已错过</span>
                  )}
                  
                  {!opportunity.used && !isInWindow && !isPast && (
                    <span className="text-gray-500 text-sm">等待中</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

### 4.3 数据可视化组件

```tsx
// 用户影响力雷达图
interface ImpactRadarChartProps {
  data: {
    agreement: number;
    disruption: number;
    information: number;
    persuasion: number;
  };
  maxValue?: number;
}

const ImpactRadarChart: React.FC<ImpactRadarChartProps> = ({ 
  data, 
  maxValue = 100 
}) => {
  const dimensions = [
    { key: 'agreement', label: '获得认同', angle: 0 },
    { key: 'disruption', label: '观点颠覆', angle: 90 },
    { key: 'information', label: '信息价值', angle: 180 },
    { key: 'persuasion', label: '说服力', angle: 270 }
  ];
  
  const center = 100;
  const radius = 80;
  
  // 计算每个维度的点坐标
  const points = dimensions.map(dim => {
    const value = data[dim.key] / maxValue;
    const angle = (dim.angle - 90) * (Math.PI / 180); // 转换为弧度，顶部为0度
    const x = center + Math.cos(angle) * radius * value;
    const y = center + Math.sin(angle) * radius * value;
    return { x, y, ...dim };
  });
  
  // 生成SVG路径
  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ' Z';
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">影响力分析</h3>
      
      <svg viewBox="0 0 200 200" className="w-full h-48">
        {/* 背景网格 */}
        {[0.2, 0.4, 0.6, 0.8, 1].map(scale => (
          <polygon
            key={scale}
            points={dimensions.map(dim => {
              const angle = (dim.angle - 90) * (Math.PI / 180);
              const x = center + Math.cos(angle) * radius * scale;
              const y = center + Math.sin(angle) * radius * scale;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        
        {/* 坐标轴线 */}
        {dimensions.map(dim => {
          const angle = (dim.angle - 90) * (Math.PI / 180);
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          return (
            <line
              key={dim.key}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#d1d5db"
              strokeWidth="1"
            />
          );
        })}
        
        {/* 数据区域 */}
        <path
          d={pathData}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="#3b82f6"
          strokeWidth="2"
        />
        
        {/* 数据点 */}
        {points.map(point => (
          <circle
            key={point.key}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#3b82f6"
            stroke="white"
            strokeWidth="2"
          />
        ))}
        
        {/* 标签 */}
        {dimensions.map(dim => {
          const angle = (dim.angle - 90) * (Math.PI / 180);
          const labelDistance = radius + 20;
          const x = center + Math.cos(angle) * labelDistance;
          const y = center + Math.sin(angle) * labelDistance;
          return (
            <text
              key={dim.key}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-xs fill-gray-600"
            >
              {dim.label}
            </text>
          );
        })}
      </svg>
      
      {/* 数值显示 */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {dimensions.map(dim => (
          <div key={dim.key} className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data[dim.key]}%
            </div>
            <div className="text-sm text-gray-600">{dim.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 5. 用户体验流程优化

### 5.1 首次用户引导流程

```typescript
interface OnboardingFlow {
  // 欢迎步骤
  welcome: {
    title: '欢迎来到AI Agent市场';
    subtitle: '让你的创意与AI大师们碰撞出火花';
    actions: ['开始体验', '观看演示'];
  };
  
  // Agent介绍
  agentIntroduction: {
    title: '认识我们的5位AI专家';
    steps: [
      {
        agentId: 'wang';
        highlight: '商业价值评估专家';
        demo: '展示商业分析过程';
      },
      {
        agentId: 'lin';
        highlight: '情感创意包装专家'; 
        demo: '展示艺术化改造';
      },
      // ... 其他Agent
    ];
  };
  
  // 流程演示
  processDemo: {
    title: '创意如何升值';
    steps: [
      '提交你的创意想法',
      'AI专家们进行分析讨论',
      '你可以参与讨论影响结果',
      '获胜者改造你的创意',
      '在商店中查看升级版本'
    ];
    interactiveDemo: true;
  };
  
  // 首次创意提交
  firstIdeaSubmission: {
    title: '提交你的第一个创意';
    guidance: '新手引导和模板提供';
    reward: '首次提交奖励50积分';
  };
}

// 引导组件实现
const OnboardingTour: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(true);
  
  const steps = [
    {
      target: '.agent-showcase',
      content: '这些是我们的5位AI专家，每位都有独特的专业领域和个性',
      placement: 'bottom'
    },
    {
      target: '.submit-idea-button',
      content: '点击这里提交你的第一个创意想法',
      placement: 'top'
    },
    {
      target: '.discussion-area',
      content: '你可以在讨论过程中发言3次，影响AI专家们的决策',
      placement: 'left'
    },
    {
      target: '.agent-store',
      content: '在这里查看AI专家们改造后的精彩作品',
      placement: 'right'
    }
  ];
  
  if (!isActive) return null;
  
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* 高亮区域 */}
      <div className="absolute pointer-events-auto">
        <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm">
          <h3 className="text-lg font-semibold mb-2">
            {steps[currentStep].content}
          </h3>
          
          <div className="flex justify-between mt-4">
            <button 
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 text-gray-600 disabled:opacity-50"
            >
              上一步
            </button>
            
            <span className="text-sm text-gray-500">
              {currentStep + 1} / {steps.length}
            </span>
            
            <button
              onClick={() => {
                if (currentStep === steps.length - 1) {
                  setIsActive(false);
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              {currentStep === steps.length - 1 ? '完成' : '下一步'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 5.2 错误处理和空状态设计

```tsx
// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<any> },
  { hasError: boolean; error?: Error }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // 发送错误报告到监控服务
    reportError(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} />;
    }
    
    return this.props.children;
  }
}

// 默认错误回退组件
const DefaultErrorFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        哎呀，出了点问题
      </h2>
      
      <p className="text-gray-600 mb-6">
        我们的AI专家们正在努力修复这个问题。请稍后再试。
      </p>
      
      <div className="space-y-3">
        <button 
          onClick={() => window.location.reload()}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          刷新页面
        </button>
        
        <button 
          onClick={() => window.history.back()}
          className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          返回上一页
        </button>
      </div>
      
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-gray-500">
            技术详情
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
            {error.message}
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
);

// 空状态组件
const EmptyState: React.FC<{
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  illustration?: string;
}> = ({ title, description, action, illustration }) => (
  <div className="text-center py-12">
    {illustration && (
      <img 
        src={illustration} 
        alt="" 
        className="w-48 h-48 mx-auto mb-6 opacity-50"
      />
    )}
    
    <h3 className="text-xl font-semibold text-gray-900 mb-2">
      {title}
    </h3>
    
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      {description}
    </p>
    
    {action && (
      <button
        onClick={action.onClick}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        {action.label}
      </button>
    )}
  </div>
);
```

## 6. 总结

这个完整的架构、布局和设计风格方案涵盖了：

### 🏗️ **技术架构选择**
- **Next.js 14 + TypeScript**：现代React框架，类型安全
- **Tailwind CSS + CSS-in-JS**：原子化CSS + 动态样式支持
- **Zustand + TanStack Query**：轻量状态管理 + 优秀的服务器状态处理
- **WebSocket + Socket.io**：实时通信基础设施
- **Framer Motion**：流畅的动画系统

### 📐 **布局架构设计**
- **12列响应式网格系统**：灵活适配各种屏幕尺寸
- **三栏式讨论页面**：左侧Agent状态、中间讨论区、右侧分析面板
- **移动端优先**：标签切换式布局，优化小屏体验
- **组件化层级**：从原子到页面的清晰架构

### 🎨 **视觉设计风格**
- **以人为中心的AI设计理念**：温暖、可信、有趣、渐进式
- **Agent个性化色彩系统**：每个AI都有独特的视觉标识
- **现代字体系统**：Inter为主，Agent专属字体增强个性
- **精细的空间系统**：统一的间距规范和容器系统

### 🧩 **组件设计系统**
- **Agent个性化组件**：头像、消息气泡、状态指示器
- **交互状态组件**：讨论阶段指示器、发言机会管理
- **数据可视化**：影响力雷达图、实时分析面板
- **完善的错误处理**：优雅的降级和空状态设计

### 🚀 **用户体验优化**
- **渐进式引导流程**：从欢迎到首次提交的完整onboarding
- **智能错误处理**：错误边界、回退组件、开发调试信息
- **无障碍设计**：键盘导航、屏幕阅读器支持
- **性能优化**：代码分割、懒加载、图片优化

这个设计方案确保了AI Agent市场具备现代化的技术基础、清晰的信息架构、美观的视觉设计和优秀的用户体验，能够支撑复杂的实时交互功能，同时保持良好的可维护性和扩展性。

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"activeForm": "\u8bbe\u8ba1\u6280\u672f\u67b6\u6784\u65b9\u6848", "content": "\u8bbe\u8ba1\u6280\u672f\u67b6\u6784\u65b9\u6848", "status": "completed"}, {"activeForm": "\u89c4\u5212\u9875\u9762\u5e03\u5c40\u7ed3\u6784", "content": "\u89c4\u5212\u9875\u9762\u5e03\u5c40\u7ed3\u6784", "status": "completed"}, {"activeForm": "\u5b9a\u4e49\u89c6\u89c9\u8bbe\u8ba1\u98ce\u683c", "content": "\u5b9a\u4e49\u89c6\u89c9\u8bbe\u8ba1\u98ce\u683c", "status": "completed"}, {"activeForm": "\u5236\u5b9a\u7ec4\u4ef6\u8bbe\u8ba1\u7cfb\u7edf", "content": "\u5236\u5b9a\u7ec4\u4ef6\u8bbe\u8ba1\u7cfb\u7edf", "status": "in_progress"}, {"activeForm": "\u4f18\u5316\u7528\u6237\u4f53\u9a8c\u6d41\u7a0b", "content": "\u4f18\u5316\u7528\u6237\u4f53\u9a8c\u6d41\u7a0b", "status": "pending"}]