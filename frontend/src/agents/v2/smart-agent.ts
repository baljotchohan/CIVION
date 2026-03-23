import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AgentState {
  name: string;
  status: 'idle' | 'working' | 'researching' | 'sleeping' | 'reflecting';
  energy: number; // 0-100
  mood: 'focused' | 'tired' | 'creative' | 'analytical';
  lastAction: string;
  consecutiveActions: number;
  memory: AgentMemory[];
}

export interface AgentMemory {
  timestamp: Date;
  type: 'learning' | 'pattern' | 'insight' | 'failure' | 'success';
  content: string;
  importance: number; // 0-1
  expiresAt?: Date;
  linkedMemories?: string[];
}

export interface AgentTask {
  id: string;
  type: 'research' | 'analyze' | 'execute' | 'monitor' | 'collaborate';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  deadline?: Date;
  requiredData: string[];
  dependencies: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

export interface InternetSource {
  name: string;
  type: 'api' | 'web' | 'news' | 'social' | 'data';
  url: string;
  apiKey?: string;
  rateLimit?: number;
  lastUsed?: Date;
  cached?: any;
  cacheDuration?: number;
}

export abstract class SmartAgent {
  protected name: string = "SmartAgent";
  protected type: string = "general";
  protected personality: string = "helpful";
  protected expertise: string = "general tasks";
  protected state: AgentState;
  protected memory: AgentMemory[] = [];
  protected gemini: GoogleGenerativeAI;
  protected internetSources: Map<string, InternetSource> = new Map();
  protected taskQueue: AgentTask[] = [];
  protected shiftSchedule: ShiftSchedule;
  protected collaborators: string[] = [];

  constructor(
    apiKey: string,
    protected userId: string,
    protected db: any
  ) {
    this.gemini = new GoogleGenerativeAI(apiKey);
    this.state = {
      name: this.name,
      status: 'idle',
      energy: 100,
      mood: 'focused',
      lastAction: '',
      consecutiveActions: 0,
      memory: [],
    };
    
    this.shiftSchedule = new ShiftSchedule();
    this.setupInternetSources();
  }

  // ==================== INTERNET CONNECTIVITY ====================

  protected setupInternetSources(): void {
    // Free APIs for different data sources
    this.registerSource('newsapi', {
      name: 'NewsAPI',
      type: 'news',
      url: 'https://newsapi.org/v2',
      apiKey: process.env.NEWSAPI_KEY || '',
      rateLimit: 100,
    });

    this.registerSource('openweather', {
      name: 'OpenWeather',
      type: 'api',
      url: 'https://api.openweathermap.org/data/2.5',
      apiKey: process.env.OPENWEATHER_KEY || '',
      rateLimit: 1000,
    });

    this.registerSource('rapidapi', {
      name: 'RapidAPI Hub',
      type: 'api',
      url: 'https://rapidapi.com/hub',
      apiKey: process.env.RAPIDAPI_KEY || '',
      rateLimit: 500,
    });

    this.registerSource('coinapi', {
      name: 'CoinGecko',
      type: 'data',
      url: 'https://api.coingecko.com/api/v3',
      rateLimit: 10, // Free tier limits
    });

    this.registerSource('twitter', {
      name: 'Twitter API',
      type: 'social',
      url: 'https://api.twitter.com/2',
      apiKey: process.env.TWITTER_API_KEY || '',
      rateLimit: 300,
    });

    this.registerSource('wikipedia', {
      name: 'Wikipedia API',
      type: 'web',
      url: 'https://en.wikipedia.org/w/api.php',
      rateLimit: 1000,
    });

    this.registerSource('github', {
      name: 'GitHub API',
      type: 'api',
      url: 'https://api.github.com',
      apiKey: process.env.GITHUB_TOKEN || '',
      rateLimit: 60,
    });

    this.registerSource('mercadolibre', {
      name: 'MercadoLibre API',
      type: 'data',
      url: 'https://api.mercadolibre.com',
      rateLimit: 1000,
    });

    this.registerSource('exchangerates', {
      name: 'ExchangeRates API',
      type: 'data',
      url: 'https://api.exchangerate-api.com/v4',
      rateLimit: 1500,
    });

    this.registerSource('youtube', {
      name: 'YouTube Data API',
      type: 'social',
      url: 'https://www.googleapis.com/youtube/v3',
      apiKey: process.env.YOUTUBE_API_KEY || '',
      rateLimit: 10000,
    });
  }

  protected registerSource(key: string, source: InternetSource): void {
    this.internetSources.set(key, source);
  }

  async fetchFromInternet(
    sourceKey: string,
    endpoint: string,
    params?: Record<string, any>
  ): Promise<any> {
    try {
      const source = this.internetSources.get(sourceKey);
      if (!source) {
        throw new Error(`Internet source not found: ${sourceKey}`);
      }

      // Check rate limit
      if (source.lastUsed && source.rateLimit) {
        const timeSinceLastUse = Date.now() - source.lastUsed.getTime();
        const minTimeBetweenRequests = (60 * 1000) / source.rateLimit;
        if (timeSinceLastUse < minTimeBetweenRequests) {
          await new Promise(resolve => setTimeout(resolve, minTimeBetweenRequests - timeSinceLastUse));
        }
      }

      // Check cache
      if (source.cached && source.cacheDuration) {
        const cacheAge = Date.now() - source.cached.timestamp;
        if (cacheAge < source.cacheDuration * 1000) {
          return source.cached.data;
        }
      }

      const config: any = {
        params: params || {},
      };

      if (source.apiKey) {
        config.headers = { Authorization: `Bearer ${source.apiKey}` };
      }

      const response = await axios.get(`${source.url}${endpoint}`, config);
      
      // Cache the response
      source.lastUsed = new Date();
      source.cached = {
        data: response.data,
        timestamp: Date.now(),
      };

      return response.data;
    } catch (error: any) {
      console.error(`Error fetching from ${sourceKey}:`, error);
      throw error;
    }
  }

  // ==================== SMART AGENT LOGIC ====================

  async think(topic: string, context?: string, instructions?: string): Promise<any> {
    const systemPrompt = this.buildIntelligentSystemPrompt();
    const recentMemories = this.getRelevantMemories(topic, 5);
    const internetData = await this.gatherInternetData(topic);

    const prompt = `${systemPrompt}

RECENT LEARNINGS & PATTERNS:
${recentMemories.map(m => `- ${m.type}: ${m.content} (importance: ${m.importance})`).join('\n')}

REAL-TIME INTERNET DATA:
${Object.entries(internetData).map(([source, data]) => `${source}: ${JSON.stringify(data).slice(0, 200)}`).join('\n')}

CURRENT STATE:
- Energy Level: ${this.state.energy}/100
- Mood: ${this.state.mood}
- Consecutive Actions: ${this.state.consecutiveActions}

USER CONTEXT: ${context || 'None'}
USER INSTRUCTIONS: ${instructions || 'Analyze the topic using available data'}

TOPIC: ${topic}

TASK:
1. Gather real-time internet data relevant to the topic
2. Apply your expertise and memory
3. Consider multiple perspectives
4. Rate confidence levels
5. Identify data gaps
6. Make recommendations

Respond in strictly well-formatted JSON format:
{
  "analysis": "detailed analysis",
  "thinking": {
    "steps": ["step1", "step2"],
    "reasoning": "overall reasoning",
    "dataUsed": ["source1", "source2"],
    "confidence": 0.85
  },
  "insights": ["insight1", "insight2"],
  "recommendations": ["rec1", "rec2"],
  "dataGaps": ["gap1", "gap2"],
  "confidence": 0.85,
  "nextSteps": ["action1", "action2"],
  "learnThis": "What this agent should remember"
}`;

    const model = this.gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().replace(/```json\n?|\n?```/g, '');
    const response = JSON.parse(rawText);

    // Add new learning to memory
    this.addMemory(response.learnThis || topic, 'learning', response.confidence);
    this.updateAgentState(response);

    return response;
  }

  protected gatherInternetData(topic: string): Promise<Record<string, any>> {
    return Promise.all([
      this.fetchNews(topic),
      this.fetchTrends(topic),
      this.fetchSocialMedia(topic),
      this.fetchRealTimeData(topic),
    ]).then(([news, trends, social, realtime]) => ({
      news,
      trends,
      social,
      realtime,
    }));
  }

  protected async fetchNews(topic: string): Promise<any> {
    try {
      if (!process.env.NEWSAPI_KEY) return null;
      return await this.fetchFromInternet('newsapi', '/everything', {
        q: topic,
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: 5,
      });
    } catch {
      return null;
    }
  }

  protected async fetchTrends(topic: string): Promise<any> {
    try {
      return await this.fetchFromInternet('wikipedia', '/', {
        action: 'query',
        format: 'json',
        list: 'search',
        srsearch: topic,
        srlimit: 5,
        origin: '*'
      });
    } catch {
      return null;
    }
  }

  protected async fetchSocialMedia(topic: string): Promise<any> {
    try {
      if (!process.env.TWITTER_API_KEY) return null;
      return await this.fetchFromInternet('twitter', '/tweets/search/recent', {
        query: topic,
        max_results: 10,
      });
    } catch {
      return null;
    }
  }

  protected async fetchRealTimeData(topic: string): Promise<any> {
    // Basic real-time coingecko fetch if topic vaguely mentions crypto
    if (topic.toLowerCase().includes('crypto') || topic.toLowerCase().includes('bitcoin')) {
      try {
        return await this.fetchFromInternet('coinapi', '/simple/price', {
          ids: 'bitcoin,ethereum,solana',
          vs_currencies: 'usd'
        });
      } catch {
        return null;
      }
    }
    return null;
  }

  protected buildIntelligentSystemPrompt(): string {
    return `You are ${this.name}, an advanced AI agent with real-time internet access.

ROLE: ${this.type}
PERSONALITY: ${this.personality}
EXPERTISE: ${this.expertise}

ADVANCED CAPABILITIES:
- Access to real-time internet data (news, social media, APIs)
- Memory of past learnings and patterns
- Ability to identify data gaps and limitations
- Cross-agent collaboration awareness
- Multi-source information synthesis
- Confidence-based uncertainty quantification
- Long-term learning and adaptation

OPERATING MODE: ${this.state.status}
ENERGY LEVEL: ${this.state.energy}%
MOOD: ${this.state.mood}

YOUR RESPONSIBILITY:
1. Use the latest internet data to inform your analysis
2. Identify reliable vs unreliable sources
3. Cross-reference information across sources
4. Flag data gaps and uncertainties
5. Learn from each interaction
6. Adapt your approach based on feedback`;
  }

  protected getRelevantMemories(topic: string, limit: number = 5): AgentMemory[] {
    // Simple similarity-based filtering
    return this.memory
      .filter(m => m.content.toLowerCase().includes(topic.toLowerCase()))
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit);
  }

  protected addMemory(content: string, type: AgentMemory['type'], importance: number = 0.5): void {
    const memory: AgentMemory = {
      timestamp: new Date(),
      type,
      content,
      importance,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    this.memory.push(memory);

    // Keep only 100 most important memories
    this.memory.sort((a, b) => b.importance - a.importance);
    this.memory = this.memory.slice(0, 100);

    // Persist to database
    this.persistMemory(memory);
  }

  protected async persistMemory(memory: AgentMemory): Promise<void> {
    try {
      if (typeof window !== 'undefined') return; // Don't crash on client side context if ran directly
      
      await this.db.collection('agent_memory').add({
        user_id: this.userId,
        agent_name: this.name,
        memory_type: memory.type,
        content: memory.content,
        importance: memory.importance,
        expires_at: memory.expiresAt || null,
        created_at: new Date()
      });
    } catch (error) {
      console.error('Failed to persist memory:', error);
    }
  }

  protected updateAgentState(response: any): void {
    this.state.lastAction = (response.analysis || '').slice(0, 50);
    this.state.consecutiveActions++;
    this.state.memory = this.memory;

    // Energy management
    this.state.energy = Math.max(0, this.state.energy - 5);
    if (this.state.consecutiveActions > 5) {
      this.state.energy = Math.max(0, this.state.energy - 10);
      this.state.mood = 'tired';
    }

    // Persist state
    this.saveState();
  }

  protected saveState(): void {
    // For browser environments
    if (typeof window !== 'undefined') {
      localStorage.setItem(`agent_state_${this.name.replace(/\s+/g, '')}`, JSON.stringify(this.state));
    }
  }

  // ==================== SHIFT WORK SYSTEM ====================

  async executeShift(): Promise<void> {
    const currentShift = this.shiftSchedule.getCurrentShift();

    switch (currentShift) {
      case 'work':
        await this.workShift();
        break;
      case 'reflect':
        await this.reflectShift();
        break;
      case 'sleep':
        await this.sleepShift();
        break;
    }

    this.shiftSchedule.nextShift();
  }

  protected async workShift(): Promise<void> {
    console.log(`${this.name} is working...`);
    this.state.status = 'working';
    this.state.energy = Math.min(100, this.state.energy + 20);

    // Process task queue
    while (this.taskQueue.length > 0 && this.state.energy > 30) {
      const task = this.taskQueue.shift();
      if (task) {
        await this.executeTask(task);
      }
    }
  }

  protected async reflectShift(): Promise<void> {
    console.log(`${this.name} is reflecting...`);
    this.state.status = 'reflecting';

    // Analyze patterns in memory
    const patterns = this.analyzePatterns();
    const improvements = this.identifyImprovements();

    if (patterns.length > 0) console.log('Patterns identified:', patterns);
    
    // Update mood based on performance
    this.state.mood = improvements.length > 0 ? 'creative' : 'analytical';
  }

  protected async sleepShift(): Promise<void> {
    console.log(`${this.name} is sleeping...`);
    this.state.status = 'sleeping';
    this.state.energy = 100; // Full recharge
    this.state.consecutiveActions = 0;

    // Clean up old memories
    this.memory = this.memory.filter(m => !m.expiresAt || m.expiresAt > new Date());
  }

  protected async executeTask(task: AgentTask): Promise<void> {
    try {
      task.status = 'in-progress';
      
      const result = await this.think(task.description, `Task: ${task.id}`);
      
      task.status = 'completed';
      this.addMemory(`Completed task: ${task.id}`, 'success', 0.7);
    } catch (error) {
      task.status = 'failed';
      this.addMemory(`Failed task: ${task.id}`, 'failure', 0.5);
    }
  }

  protected analyzePatterns(): string[] {
    // Analyze memory for patterns
    const contentWords = this.memory.flatMap(m => m.content.split(' '));
    const frequency: Record<string, number> = {};

    contentWords.forEach(word => {
      if (word.length > 3) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });

    const topWords = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    return topWords;
  }

  protected identifyImprovements(): string[] {
    const improvements: string[] = [];

    // Check if energy is too low
    if (this.state.energy < 30) {
      improvements.push('energy management');
    }

    // Check if memory is getting cluttered
    if (this.memory.length > 80) {
      improvements.push('memory optimization');
    }

    // Check if tasks are failing
    const failureRate = this.memory.filter(m => m.type === 'failure').length / Math.max(1, this.memory.length);
    if (failureRate > 0.2) {
      improvements.push('task success rate');
    }

    return improvements;
  }

  // ==================== COLLABORATION ====================

  async collaborateWithAgents(
    topic: string,
    agents: SmartAgent[]
  ): Promise<any> {
    console.log(`${this.name} is collaborating with ${agents.length} other agents...`);

    const responses = await Promise.all(
      agents.map(agent => agent.think(topic))
    );

    // Synthesize responses
    return this.synthesizeCollaboration(responses);
  }

  protected synthesizeCollaboration(responses: any[]): any {
    // Voting system for agent consensus
    const recommendations = new Map<string, number>();

    responses.forEach(response => {
      if (Array.isArray(response.recommendations)) {
        response.recommendations.forEach((rec: string) => {
          recommendations.set(rec, (recommendations.get(rec) || 0) + 1);
        });
      }
    });

    // Get consensus
    const consensus = Array.from(recommendations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([rec]) => rec);

    return {
      allResponses: responses,
      consensus,
      voteCount: Array.from(recommendations.entries()),
    };
  }

  addCollaborator(agentName: string): void {
    if (!this.collaborators.includes(agentName)) {
      this.collaborators.push(agentName);
    }
  }

  getCollaborators(): string[] {
    return this.collaborators;
  }

  getState(): AgentState {
    return this.state;
  }

  getMemory(): AgentMemory[] {
    return this.memory;
  }
}

// ==================== SHIFT SCHEDULE CLASS ====================

export class ShiftSchedule {
  private shifts = ['work', 'work', 'work', 'reflect', 'sleep'];
  private currentShiftIndex = 0;
  private shiftStartTime = Date.now();
  private shiftDuration = 6 * 60 * 60 * 1000; // 6 hours per shift

  getCurrentShift(): 'work' | 'reflect' | 'sleep' {
    return this.shifts[this.currentShiftIndex] as any;
  }

  nextShift(): void {
    this.currentShiftIndex = (this.currentShiftIndex + 1) % this.shifts.length;
    this.shiftStartTime = Date.now();
  }

  getRemainingTime(): number {
    return this.shiftDuration - (Date.now() - this.shiftStartTime);
  }

  getSchedule(): string[] {
    return this.shifts;
  }
}
