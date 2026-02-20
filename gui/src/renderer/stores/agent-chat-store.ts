// Agent chat state store

import { create } from 'zustand';
import type { AgentMessage, PermissionRequest } from '../../shared/types';

interface AgentChatState {
  // Sessions
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;

  // Messages per session
  messages: Record<string, AgentMessage[]>;
  addMessage: (sessionId: string, message: AgentMessage) => void;
  clearMessages: (sessionId: string) => void;

  // Streaming state
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;

  // Permission requests
  pendingPermission: PermissionRequest | null;
  setPendingPermission: (request: PermissionRequest | null) => void;

  // Input
  inputValue: string;
  setInputValue: (value: string) => void;
}

export const useAgentChatStore = create<AgentChatState>((set) => ({
  activeSessionId: null,
  setActiveSessionId: (id) => set({ activeSessionId: id }),

  messages: {},
  addMessage: (sessionId, message) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [sessionId]: [...(s.messages[sessionId] || []), message],
      },
    })),
  clearMessages: (sessionId) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [sessionId]: [],
      },
    })),

  isStreaming: false,
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),

  pendingPermission: null,
  setPendingPermission: (request) => set({ pendingPermission: request }),

  inputValue: '',
  setInputValue: (value) => set({ inputValue: value }),
}));
