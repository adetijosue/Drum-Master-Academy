export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface QuickReply {
  label: string;
  icon?: string;
  prompt: string;
}

export interface GeminiHistoryEntry {
  role: 'user' | 'model';
  parts: { text: string }[];
}
