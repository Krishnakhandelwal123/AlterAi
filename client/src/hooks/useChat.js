import { useState, useCallback, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const VISITOR_KEY = 'alter_visitor_id';

const getClearedConversationKey = (slug, visitorId) => `alter_cleared_conversation:${slug}:${visitorId}`;

const buildWelcomeMessage = (profile) => {
  if (!profile?.welcome_message) return [];
  return [{
    id: 'welcome',
    role: 'assistant',
    content: profile.welcome_message,
    timestamp: new Date().toISOString(),
    isWelcome: true
  }];
};

function getOrCreateVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function useChat(slug, options = {}) {
  const { onAssistantDone } = options;
  const { session } = useContext(AuthContext) || {};
  const token = session?.access_token;

  const [personality, setPersonality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [input, setInput] = useState('');
  const [rateLimitInfo, setRateLimitInfo] = useState(null);
  const [remainingMessages, setRemainingMessages] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);

  const visitorId = useRef(getOrCreateVisitorId());
  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load personality profile
  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(`${BASE}/api/chat/${slug}/profile`, { headers })
      .then((r) => r.json())
      .then((data) => {
        if (data.code === 'NOT_FOUND' || !data.personality) {
          setNotFound(true);
        } else {
          setNotFound(false);
          setPersonality(data.personality);
          setMessages(buildWelcomeMessage(data.personality));
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug, token]);

  // Load conversation history for returning visitors
  useEffect(() => {
    if (!slug || !personality) return;
    fetch(`${BASE}/api/chat/${slug}/history?visitorId=${encodeURIComponent(visitorId.current)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.conversation?.messages?.length > 0) {
          const clearedConversationId = localStorage.getItem(getClearedConversationKey(slug, visitorId.current));
          if (clearedConversationId === data.conversation.id) {
            setMessages(buildWelcomeMessage(personality));
            setConversationId(null);
            setHasStarted(false);
            return;
          }

          const historyMessages = data.conversation.messages.map((m, i) => ({
            id: `hist-${i}`,
            role: m.role,
            content: m.content,
            timestamp: data.conversation.started_at,
            isHistory: true
          }));
          setMessages(historyMessages);
          setConversationId(data.conversation.id);
          setHasStarted(true);
        }
      })
      .catch(() => {});
  }, [slug, personality]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async (text) => {
    const msgText = (text || input).trim();
    if (!msgText || isStreaming || !personality) return;

    setHasStarted(true);
    setInput('');
    setRateLimitInfo(null);

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: msgText,
      timestamp: new Date().toISOString()
    };
    const aiMsgId = `ai-${Date.now() + 1}`;
    const aiMsg = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setIsStreaming(true);

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${BASE}/api/chat/${slug}/message`, {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          message: msgText,
          visitorId: visitorId.current,
          conversationId
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 429) {
          setRateLimitInfo(err);
          setMessages((prev) => prev.filter((m) => m.id !== aiMsgId));
          return;
        }
        throw new Error(err.error || 'Request failed');
      }

      // Parse SSE stream
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'token') {
              fullResponse += data.content || '';
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId ? { ...m, content: m.content + data.content } : m
                )
              );
              scrollToBottom();
            } else if (data.type === 'done') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId ? { ...m, isStreaming: false } : m
                )
              );
              if (data.conversationId) {
                setConversationId(data.conversationId);
                localStorage.removeItem(getClearedConversationKey(slug, visitorId.current));
              }
              if (data.remaining !== undefined) setRemainingMessages(data.remaining);
              if (fullResponse.trim()) {
                onAssistantDone?.(fullResponse.trim());
              }
            } else if (data.type === 'error') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? { ...m, content: data.message || 'Something went wrong.', isStreaming: false, isError: true }
                    : m
                )
              );
            }
          } catch (_) {}
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, content: 'Connection error. Please try again.', isStreaming: false, isError: true }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [input, isStreaming, personality, slug, conversationId, scrollToBottom, token, onAssistantDone]);

  const clearChat = useCallback(() => {
    if (isStreaming) {
      abortRef.current?.abort();
    }
    if (conversationId) {
      localStorage.setItem(getClearedConversationKey(slug, visitorId.current), conversationId);
    }
    setConversationId(null);
    setMessages(buildWelcomeMessage(personality));
    setInput('');
    setHasStarted(false);
    setRateLimitInfo(null);
    setIsStreaming(false);
    abortRef.current = null;
  }, [conversationId, isStreaming, personality, slug]);

  return {
    personality,
    loading,
    notFound,
    messages,
    input,
    setInput,
    isStreaming,
    hasStarted,
    rateLimitInfo,
    remainingMessages,
    visitorId: visitorId.current,
    messagesEndRef,
    sendMessage,
    clearChat
  };
}
