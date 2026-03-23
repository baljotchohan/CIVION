import { AgentMarketplace } from '@/components/AgentMarketplace';

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-bg-base pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">CIVION V2</h1>
          <p className="text-sm text-text-muted mt-1">Autonomous Agent Network</p>
        </div>
        <a href="/dashboard" className="btn-secondary">
          ← Back to Dashboard
        </a>
      </div>
      
      <AgentMarketplace />
    </div>
  );
}
