'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Download, ShoppingCart, Zap, Check } from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  type: string;
  description: string;
  base_capability: string;
  price_credits: number;
  rating: number;
  downloads: number;
  is_verified: boolean;
}

export function AgentMarketplace() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [userCredits, setUserCredits] = useState(0);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
    fetchUserCredits();
  }, [selectedType]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('civion_token');
      const res = await fetch(
        `/api/marketplace/agents?${selectedType !== 'all' ? `type=${selectedType}` : ''}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (!res.ok) throw new Error('Failed to fetch agents');
      
      const data = await res.json();
      setAgents(data.agents);
    } catch (err: any) {
      setError(err.message || 'Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCredits = async () => {
    try {
      const token = localStorage.getItem('civion_token');
      const res = await fetch('/api/user/credits', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserCredits(data.availableCredits);
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    }
  };

  const purchaseAgent = async (agentId: number, agentName: string) => {
    try {
      setPurchasing(agentId);
      const token = localStorage.getItem('civion_token');
      const res = await fetch('/api/marketplace/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          templateId: agentId,
          customName: agentName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Purchase failed');
      }

      alert(`Successfully purchased ${agentName}!`);
      fetchUserCredits();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setPurchasing(null);
    }
  };

  const agentTypes = ['all', 'goal', 'research', 'analysis', 'execution', 'monitoring', 'custom'];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-accent-purple to-accent-blue p-8 rounded-2xl shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
          <ShoppingCart size={200} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">🤖 Agent Marketplace</h1>
          <p className="text-purple-100 mb-6">Discover and deploy advanced intelligence to your CIVION network.</p>
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-lg inline-flex border border-white/10 shadow-sm">
            <Zap className="text-accent-amber" size={20} />
            <span className="text-white font-semibold">{userCredits.toLocaleString()} Credits Available</span>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-8">
        {agentTypes.map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
              selectedType === type
                ? 'bg-text-primary text-bg-base border-text-primary shadow-sm'
                : 'bg-bg-card border-border text-text-secondary hover:border-border-strong hover:text-text-primary'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading / Error States */}
      {error && (
        <div className="bg-danger-soft text-danger p-4 rounded-lg border border-danger/20 text-center">
          {error}
        </div>
      )}

      {/* Agent Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card p-6 h-64 skeleton opacity-50"></div>
          ))}
        </div>
      ) : agents.length === 0 && !error ? (
        <div className="empty-state card">
          <ShoppingCart size={48} className="text-border-strong mb-4" />
          <h3 className="section-title">No agents found</h3>
          <p className="text-text-muted mt-2">Check back later or try a different filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, idx) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card p-5 hover:border-accent/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
            >
              {/* Agent Header */}
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-text-primary group-hover:text-accent transition-colors">{agent.name}</h3>
                  {agent.is_verified && (
                    <span className="badge badge-blue gap-1">
                      <Check size={10} />
                      Verified
                    </span>
                  )}
                </div>
                <span className="badge badge-grey uppercase tracking-wider text-[10px]">{agent.type}</span>
              </div>

              {/* Description */}
              <p className="text-text-secondary text-sm mb-4 flex-grow line-clamp-3 leading-relaxed">
                {agent.description}
              </p>

              {/* Capability */}
              <div className="bg-bg-subtle rounded-lg p-3 mb-5 border border-border">
                <p className="text-text-muted text-[11px] font-bold uppercase tracking-wider mb-1">Base Capability</p>
                <p className="text-text-primary text-sm font-medium">{agent.base_capability}</p>
              </div>

              {/* Stats */}
              <div className="flex justify-between items-center mb-5 text-sm px-1">
                <div className="flex items-center gap-1.5 text-warning font-semibold">
                  <Star size={16} className="fill-warning" />
                  <span>{agent.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-muted">
                  <Download size={16} />
                  <span>{agent.downloads.toLocaleString()} downloads</span>
                </div>
              </div>

              {/* Price & Button */}
              <div className="flex justify-between items-center pt-4 border-t border-border mt-auto">
                <div className="flex items-center gap-2">
                  <Zap className="text-accent-amber" size={20} />
                  <span className="text-text-primary font-bold text-xl">{Number(agent.price_credits).toLocaleString()}</span>
                </div>
                
                <button
                  onClick={() => purchaseAgent(agent.id, agent.name)}
                  disabled={userCredits < agent.price_credits || purchasing === agent.id}
                  className={`btn-base px-5 py-2.5 rounded-lg font-semibold transition-all ${
                    purchasing === agent.id 
                      ? 'bg-bg-muted text-text-muted cursor-wait'
                      : userCredits >= agent.price_credits
                        ? 'bg-text-primary text-bg-base hover:bg-black/80 hover:scale-105 active:scale-95'
                        : 'bg-bg-muted text-text-muted cursor-not-allowed hidden md:flex'
                  }`}
                >
                  {purchasing === agent.id ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" fill="none" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </span>
                  ) : userCredits >= agent.price_credits ? (
                    <span className="flex items-center gap-2 text-sm">
                      <ShoppingCart size={16} />
                      Deploy Agent
                    </span>
                  ) : (
                    <span className="text-sm">Not Enough Credits</span>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
