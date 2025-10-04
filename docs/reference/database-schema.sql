-- 创意交易市场数据库设计方案
-- 支持5000用户并发，优化查询性能

-- 用户表
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  credits INT DEFAULT 0 COMMENT '积分余额',
  level ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',
  status ENUM('active', 'banned', 'pending') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- 创意表
CREATE TABLE ideas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('tech', 'lifestyle', 'education', 'health', 'finance', 'entertainment', 'art', 'business') NOT NULL,
  author_id INT NOT NULL,
  status ENUM('pending', 'bidding', 'analyzing', 'completed', 'rejected') DEFAULT 'pending',
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  ai_score DECIMAL(3,1) DEFAULT 0,
  estimated_value_min INT DEFAULT 0,
  estimated_value_max INT DEFAULT 0,
  tags JSON,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (author_id) REFERENCES users(id),
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_author_id (author_id),
  INDEX idx_submitted_at (submitted_at),
  INDEX idx_ai_score (ai_score),
  FULLTEXT KEY ft_title_desc (title, description)
);

-- AI竞价表
CREATE TABLE ai_bids (
  id INT PRIMARY KEY AUTO_INCREMENT,
  idea_id INT NOT NULL,
  ai_agent VARCHAR(50) NOT NULL COMMENT 'AI代理名称',
  bid_amount INT NOT NULL COMMENT '出价积分',
  confidence DECIMAL(3,1) NOT NULL COMMENT '置信度分数',
  analysis_result JSON COMMENT 'AI分析结果',
  status ENUM('bidding', 'won', 'lost', 'expired') DEFAULT 'bidding',
  bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (idea_id) REFERENCES ideas(id),
  INDEX idx_idea_id (idea_id),
  INDEX idx_status (status),
  INDEX idx_bid_amount (bid_amount),
  INDEX idx_bid_time (bid_time)
);

-- 商业计划表
CREATE TABLE business_plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  idea_id INT NOT NULL,
  user_id INT NOT NULL,
  plan_data JSON NOT NULL COMMENT '完整商业计划数据',
  generation_stages JSON COMMENT 'AI生成阶段信息',
  overall_score DECIMAL(3,1) DEFAULT 0,
  status ENUM('generating', 'completed', 'failed') DEFAULT 'generating',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,

  FOREIGN KEY (idea_id) REFERENCES ideas(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- 交易记录表
CREATE TABLE transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  buyer_id INT NOT NULL,
  seller_id INT NOT NULL,
  idea_id INT NOT NULL,
  amount INT NOT NULL COMMENT '交易金额(积分)',
  platform_fee INT NOT NULL COMMENT '平台手续费',
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (idea_id) REFERENCES ideas(id),
  INDEX idx_buyer_id (buyer_id),
  INDEX idx_seller_id (seller_id),
  INDEX idx_status (status),
  INDEX idx_transaction_time (transaction_time)
);

-- 用户会话表
CREATE TABLE user_sessions (
  id VARCHAR(128) PRIMARY KEY,
  user_id INT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);

-- 系统配置表
CREATE TABLE system_config (
  config_key VARCHAR(50) PRIMARY KEY,
  config_value TEXT NOT NULL,
  description VARCHAR(200),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入默认配置
INSERT INTO system_config (config_key, config_value, description) VALUES
('credits_per_yuan', '100', '积分兑换比例：1元=100积分'),
('platform_fee_rate', '0.1', '平台手续费比例：10%'),
('min_withdraw_amount', '1000', '最低提现积分'),
('max_daily_withdraw', '10000', '每日最大提现积分');

-- 性能优化索引
CREATE INDEX idx_ideas_category_status ON ideas(category, status);
CREATE INDEX idx_ideas_score_views ON ideas(ai_score, views);
CREATE INDEX idx_users_level_credits ON users(level, credits);