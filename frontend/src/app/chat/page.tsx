// frontend/src/app/chat/page.tsx
'use client';

import { ChatComponent } from './ChatComponent';
import { Navbar } from '@/components/dashboard/Navbar';

export default function ChatPage() {
  console.log('Rendering ChatPage component');
  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-80px)]">
        <ChatComponent />
      </div>
    </div>
  );
}
