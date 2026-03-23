-- UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agent Memory Table
CREATE TABLE IF NOT EXISTS agent_memory (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  agent_name VARCHAR(100) NOT NULL,
  memory_type VARCHAR(50) NOT NULL, -- 'learning', 'pattern', 'insight', 'failure', 'success'
  content TEXT NOT NULL,
  importance FLOAT DEFAULT 0.5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

-- Agent Templates (for sale)
CREATE TABLE IF NOT EXISTS agent_templates (
  id SERIAL PRIMARY KEY,
  creator_id INTEGER NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100), -- 'goal', 'research', 'analysis', 'execution', 'monitoring', 'custom'
  description TEXT,
  base_capability VARCHAR(500),
  special_abilities JSONB, -- Custom abilities
  price_credits DECIMAL(10, 2),
  rating FLOAT DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchased Agents
CREATE TABLE IF NOT EXISTS purchased_agents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  template_id INTEGER NOT NULL REFERENCES agent_templates(id),
  custom_name VARCHAR(255),
  activation_status VARCHAR(50) DEFAULT 'inactive', -- 'active', 'inactive', 'training'
  training_data JSONB,
  performance_score FLOAT DEFAULT 0,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activated_at TIMESTAMP
);

-- Agent Marketplace Reviews
CREATE TABLE IF NOT EXISTS agent_reviews (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES agent_templates(id),
  reviewer_id INTEGER NOT NULL REFERENCES users(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Credits (currency for marketplace)
CREATE TABLE IF NOT EXISTS user_credits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
  total_credits DECIMAL(12, 2) DEFAULT 1000, -- Starting credits
  available_credits DECIMAL(12, 2) DEFAULT 1000,
  earned_credits DECIMAL(12, 2) DEFAULT 0,
  spent_credits DECIMAL(12, 2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Credit Transactions
CREATE TABLE IF NOT EXISTS credit_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  transaction_type VARCHAR(50), -- 'purchase', 'earn', 'refund', 'reward'
  amount DECIMAL(10, 2),
  description VARCHAR(255),
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data for test user (if exists) and default agents
INSERT INTO agent_templates (creator_id, name, type, description, base_capability, price_credits, is_verified) 
SELECT id, 'Deep Stock Researcher', 'research', 'Specializes in pulling diverse financial APIs to evaluate market health', 'Financial Analysis 24/7', 250.00, true
FROM users LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO agent_templates (creator_id, name, type, description, base_capability, price_credits, is_verified) 
SELECT id, 'Social Trends Monitor', 'monitoring', 'Constantly sweeps social feeds mapping out viral keywords and trends', 'Social Media Scraping', 150.00, true
FROM users LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO agent_templates (creator_id, name, type, description, base_capability, price_credits, is_verified) 
SELECT id, 'Ruthless Executioner', 'execution', 'Will break a massive goal into extreme micro-granular tasks with timeline constraints', 'Timeline enforcement', 400.00, true
FROM users LIMIT 1
ON CONFLICT DO NOTHING;
