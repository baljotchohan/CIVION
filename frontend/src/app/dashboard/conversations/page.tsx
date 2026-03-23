'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import axios from 'axios';
import Link from 'next/link';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await axios.get('http://localhost:3000/api/v1/teams/1/conversations', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      setConversations(res.data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (id: number) => {
    if (!confirm('Are you sure?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await axios.delete(`http://localhost:3000/api/v1/conversations/${id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      fetchConversations();
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-4xl font-bold text-white">Conversations</h1>
        <p className="text-slate-400 mt-2">View all agent conversations</p>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-lg">
          <p className="text-slate-400">No conversations yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map(conv => (
            <Link
              key={conv.id}
              href={`/dashboard/conversations/${conv.id}`}
              className="block bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-blue-500 transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-semibold">{conv.topic || 'Untitled'}</p>
                  <p className="text-slate-400 text-sm">
                    {new Date(conv.created_at).toLocaleDateString()} • {conv.message_count} messages
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    deleteConversation(conv.id);
                  }}
                  className="text-red-400 hover:text-red-300 px-3 py-1 rounded hover:bg-red-900/20"
                >
                  Delete
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
