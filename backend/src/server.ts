import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Mock routes since we don't have the real files yet
const router = express.Router();

router.get('/teams/:id/agents', (req, res) => {
  res.json({
    agents: [
      { id: 1, name: 'Goal Agent', agent_type: 'strategic', status: 'active', total_tasks_completed: 12, success_rate: 0.95 },
      { id: 2, name: 'Research Agent', agent_type: 'research', status: 'active', total_tasks_completed: 45, success_rate: 0.88 },
    ]
  });
});

router.get('/teams/:id/conversations', (req, res) => {
  res.json({
    conversations: [
      { id: 1, topic: 'Market Strategy', created_at: new Date().toISOString(), message_count: 5 },
      { id: 2, topic: 'Technical Research', created_at: new Date().toISOString(), message_count: 3 },
    ]
  });
});

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0' });
});

// API Routes
app.use('/api/v1', router);

// Start server
app.listen(PORT, () => {
  console.log(`🕷️ CIVION Backend running on http://localhost:${PORT}`);
});
