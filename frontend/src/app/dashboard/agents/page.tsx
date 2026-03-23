'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import axios from 'axios';
import Link from 'next/link';

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await axios.get('http://localhost:3000/api/v1/teams/1/agents', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      setAgents(res.data.agents || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAgent = async (agentId: number, status: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const action = status === 'active' ? 'deactivate' : 'activate';
      await axios.post(
        `http://localhost:3000/api/v1/agents/${agentId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );

      fetchAgents();
    } catch (error) {
      console.error('Failed to toggle agent:', error);
    }
  };

  const deleteAgent = async (agentId: number) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await axios.delete(`http://localhost:3000/api/v1/agents/${agentId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      fetchAgents();
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">Your Agents</h1>
          <p className="text-slate-400 mt-2">Manage your AI team members</p>
        </div>
        <Link
          href="/dashboard/agents/new"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          + Create Agent
        </Link>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded">
          {error}
        </div>
      )}

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <div
            key={agent.id}
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition"
          >
            <Link href={`/dashboard/agents/${agent.id}`} className="block mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-white hover:text-blue-400">
                    {agent.name}
                  </h3>
                  <p className="text-slate-400 text-sm">{agent.agent_type}</p>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-semibold ${
                  agent.status === 'active'
                    ? 'bg-green-900 text-green-200'
                    : 'bg-slate-600 text-slate-300'
                }`}>
                  {agent.status}
                </span>
              </div>
            </Link>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-slate-700">
              <div>
                <p className="text-slate-400 text-xs">Tasks</p>
                <p className="text-white font-bold">{agent.total_tasks_completed}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Success</p>
                <p className="text-white font-bold">{(agent.success_rate * 100).toFixed(0)}%</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => toggleAgent(agent.id, agent.status)}
                className={`w-full py-2 rounded font-semibold transition ${
                  agent.status === 'active'
                    ? 'bg-red-900 text-red-200 hover:bg-red-800'
                    : 'bg-green-900 text-green-200 hover:bg-green-800'
                }`}
              >
                {agent.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => deleteAgent(agent.id)}
                className="w-full py-2 rounded font-semibold bg-slate-700 text-slate-300 hover:bg-slate-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">No agents yet. Create one to get started!</p>
          <Link
            href="/dashboard/agents/new"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold inline-block hover:bg-blue-700"
          >
            Create Your First Agent
          </Link>
        </div>
      )}
    </div>
  );
}
