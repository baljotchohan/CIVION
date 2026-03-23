'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import axios from 'axios';

interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  totalConversations: number;
  totalTasks: number;
  successRate: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const token = session.access_token;
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch agents
      const agentsRes = await axios.get(
        'http://localhost:3000/api/v1/teams/1/agents',
        { headers }
      );

      // Fetch conversations
      const conversationsRes = await axios.get(
        'http://localhost:3000/api/v1/teams/1/conversations',
        { headers }
      );

      const agentsData = agentsRes.data.agents || [];
      const conversationsData = conversationsRes.data.conversations || [];

      setAgents(agentsData);
      setConversations(conversationsData);

      setStats({
        totalAgents: agentsData.length,
        activeAgents: agentsData.filter((a: any) => a.status === 'active').length,
        totalConversations: conversationsData.length,
        totalTasks: agentsData.reduce((sum: number, a: any) => sum + a.total_tasks_completed, 0),
        successRate: agentsData.length > 0 
          ? agentsData.reduce((sum: number, a: any) => sum + a.success_rate, 0) / agentsData.length 
          : 0
      });
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Welcome back! Here's your team overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Agents"
          value={stats?.totalAgents || 0}
          icon="🤖"
        />
        <StatCard
          label="Active"
          value={stats?.activeAgents || 0}
          icon="✅"
          color="green"
        />
        <StatCard
          label="Conversations"
          value={stats?.totalConversations || 0}
          icon="💬"
          color="blue"
        />
        <StatCard
          label="Tasks"
          value={stats?.totalTasks || 0}
          icon="✓"
          color="purple"
        />
        <StatCard
          label="Success Rate"
          value={`${((stats?.successRate || 0) * 100).toFixed(0)}%`}
          icon="📈"
          color="orange"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agents Section */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Active Agents</h2>
            <a href="/dashboard/agents" className="text-blue-400 hover:text-blue-300">
              View all →
            </a>
          </div>

          <div className="space-y-3">
            {agents.slice(0, 5).map(agent => (
              <a
                key={agent.id}
                href={`/dashboard/agents/${agent.id}`}
                className="block bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-semibold">{agent.name}</p>
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
                <div className="mt-2 text-sm text-slate-400">
                  {agent.total_tasks_completed} tasks • {(agent.success_rate * 100).toFixed(0)}% success
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 h-fit">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <ActionButton href="/dashboard/agents/new" label="Create Agent" primary />
            <ActionButton href="/dashboard/conversations" label="View Conversations" />
            <ActionButton href="/dashboard/agents" label="Manage Agents" />
          </div>
        </div>
      </div>

      {/* Recent Conversations */}
      {conversations.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Conversations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conversations.slice(0, 6).map(conv => (
              <a
                key={conv.id}
                href={`/dashboard/conversations/${conv.id}`}
                className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition"
              >
                <p className="text-white font-semibold truncate">{conv.topic || 'Untitled'}</p>
                <p className="text-slate-400 text-sm">
                  {new Date(conv.created_at).toLocaleDateString()}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, icon, color = 'slate' }: any) {
  const colorMap: Record<string, string> = {
    slate: 'bg-slate-700',
    green: 'bg-green-900',
    blue: 'bg-blue-900',
    purple: 'bg-purple-900',
    orange: 'bg-orange-900',
  };

  return (
    <div className={`${colorMap[color]} rounded-lg p-6 border border-slate-700`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-sm font-semibold">{label}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

// Action Button Component
function ActionButton({ href, label, primary = false }: any) {
  return (
    <a
      href={href}
      className={`block w-full py-2 px-4 rounded font-semibold text-center transition ${
        primary
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-slate-700 text-white hover:bg-slate-600'
      }`}
    >
      {label}
    </a>
  );
}
