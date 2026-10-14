import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { chatService } from '../services/chatService';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async () => {
    const token = localStorage.getItem('finsight_token');
    if (!token) return [];
    try {
      const list = await chatService.getConversations();
      setConversations(list);
      return list;
    } catch (err) {
      console.error('Failed to load conversations:', err);
      return [];
    }
  }, []);

  const selectConversation = useCallback(async (conversationId) => {
    setLoading(true);
    setError(null);
    try {
      localStorage.setItem('finsight_active_conv', conversationId);
      const data = await chatService.getConversation(conversationId);
      setCurrentConversation(data);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
      setError('Could not load conversation messages.');
    } finally {
      setLoading(false);
    }
  }, []);

  const startNewChat = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const newConv = await chatService.createConversation('New Conversation');
      localStorage.setItem('finsight_active_conv', newConv.id);
      setConversations((prev) => [newConv, ...prev]);
      setCurrentConversation(newConv);
      setMessages([]);
      return newConv;
    } catch (err) {
      console.error('Failed to create new conversation:', err);
      setError('Could not initialize a new chat.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteConversation = useCallback(async (id) => {
    try {
      await chatService.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (localStorage.getItem('finsight_active_conv') === id) {
        localStorage.removeItem('finsight_active_conv');
      }
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      setError('Failed to delete conversation.');
    }
  }, [currentConversation]);

  // Restore active conversation automatically on page reload only when authenticated
  useEffect(() => {
    const token = localStorage.getItem('finsight_token');
    if (!token) return;

    fetchConversations().then((list) => {
      if (list && list.length > 0) {
        const savedId = localStorage.getItem('finsight_active_conv');
        if (savedId && list.some((c) => c.id === savedId)) {
          selectConversation(savedId);
        } else {
          selectConversation(list[0].id);
        }
      }
    });
  }, [fetchConversations, selectConversation]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || sending) return;

    let convId = currentConversation?.id;

    // If no active conversation, create one first
    if (!convId) {
      try {
        const newConv = await chatService.createConversation('New Conversation');
        setConversations((prev) => [newConv, ...prev]);
        setCurrentConversation(newConv);
        convId = newConv.id;
      } catch (err) {
        setError('Failed to start a new chat session.');
        return;
      }
    }

    setSending(true);
    setError(null);

    // Optimistic user message display
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      conversation_id: convId,
      role: 'user',
      content: text.trim(),
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await chatService.sendMessage(convId, text.trim());
      
      // Update with server verified messages
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
        return [...filtered, response.user_message, response.assistant_message];
      });

      // Refresh conversations list to show updated title and count
      fetchConversations();
    } catch (err) {
      console.error('Send message error:', err);
      const errMsg = err.response?.data?.detail || 'Failed to get response from FinSight AI.';
      setError(errMsg);

      // Append temporary error notice
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          conversation_id: convId,
          role: 'assistant',
          content: `⚠️ Error: ${errMsg}`,
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setSending(false);
    }
  }, [currentConversation, sending, fetchConversations]);

  const regenerateResponse = useCallback(async () => {
    if (messages.length < 2 || sending) return;
    
    // Find last user message
    const userMsgs = messages.filter((m) => m.role === 'user');
    if (userMsgs.length === 0) return;
    
    const lastUserPrompt = userMsgs[userMsgs.length - 1].content;
    await sendMessage(lastUserPrompt);
  }, [messages, sending, sendMessage]);

  const value = {
    conversations,
    currentConversation,
    messages,
    loading,
    sending,
    error,
    fetchConversations,
    selectConversation,
    startNewChat,
    deleteConversation,
    clearChat,
    sendMessage,
    regenerateResponse
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
