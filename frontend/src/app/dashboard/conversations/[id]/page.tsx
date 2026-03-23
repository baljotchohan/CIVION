'use client';

import { useParams } from 'next/navigation';

export default function ConversationDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-4">Conversation Detail: {id}</h1>
      <p className="text-slate-400">Viewing conversation details.</p>
    </div>
  );
}
