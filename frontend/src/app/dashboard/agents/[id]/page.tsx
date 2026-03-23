'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import axios from 'axios';

export default function AgentDetailPage() {
  const params = useParams();
  const agentId = params.id as string;
  
  const [agent, setAgent] = useState<any>(null);
  const [memory, setMemory] = useState<any[]>([]);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    fetchAgent();
  }, [agentId]);

  const fetchAgent = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const headers = { Authorization: `Bearer ${session.access_token}` };
      
      const agentRes = await axios.get(`http://localhost:3000/api/v1/agents/${agentId}`, { headers });
      const memoryRes = await axios.get(`http://localhost:3000/api/v1/agents/${agentId}/memory`, { headers });

      setAgent(agentRes.data.agent);
      setMemory(agentRes.data.memory || []);
    } catch (error) {
      console.error('Failed to fetch agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const askAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setAsking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await axios.post(
        `http://localhost:3000/api/v1/agents/${agentId}/ask`,
        { question },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );

      setResponse(res.data.response);
      setQuestion('');
      await fetchAgent();
    } catch (error) {
      console.error('Failed to ask agent:', error);
    } finally {
      setAsking(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;
  if (!agent) return <div className="p-8 text-center text-slate-400">Agent not found</div>;

  return (
    <div className="space-y-8 p-8">
      {/* Agent Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white mb-4">{agent.name}</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Type" value={agent.agent_type} />
          <Stat label="Status" value={agent.status} color={agent.status === 'active' ? 'green' : 'gray'} />
          <Stat label="Tasks" value={agent.total_tasks_completed} />
          <Stat label="Success" value={`${(agent.success_rate * 100).toFixed(1)}%`} />
        </div>
      </div>

      {/* Ask Agent Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Ask Agent</h2>
        <form onSubmit={askAgent} className="space-y-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your agent a question..."
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-4 focus:border-blue-500 focus:outline-none resize-none"
            rows={3}
          />
          <button
            type="submit"
            disabled={asking || !question.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-blue-700 transition"
          >
            {asking ? 'Thinking...' : 'Ask'}
          </button>
        </form>
      </div>

      {/* Response */}
      {response && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Response</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-slate-400 font-semibold mb-2">Analysis</h3>
              <p className="text-white">{response.analysis}</p>
            </div>

            {response.recommendations && response.recommendations.length > 0 && (
              <div>
                <h3 className="text-slate-400 font-semibold mb-2">Recommendations</h3>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {response.recommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="text-slate-400 font-semibold mb-2">Confidence</h3>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${response.thinking.confidence * 100}%` }}
                />
              </div>
              <p className="text-sm text-slate-400 mt-2">
                {(response.thinking.confidence * 100).toFixed(0)}% confident
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Memory */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Agent Memory ({memory.length})</h2>
        <div className="space-y-3">
          {memory.slice(0, 10).map((m: any, i: number) => (
            <div key={i} className="bg-slate-700 rounded-lg p-4">
              <p className="text-white text-sm mb-2">{m.content}</p>
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="px-2 py-1 bg-slate-600 rounded">{m.memory_type}</span>
                <span>Importance: {(m.importance * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
        {memory.length === 0 && (
          <p className="text-slate-400 text-center py-8">No memories yet. Chat with the agent to build memories.</p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color = 'slate' }: any) {
  const colorMap: Record<string, string> = {
    slate: 'text-slate-300',
    green: 'text-green-400',
    gray: 'text-gray-400',
  };

  return (
    <div>
      <p className="text-slate-400 text-sm font-semibold">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colorMap[color]}`}>{value}</p>
    </div>
  );
}
