'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { initUserId, userKey } from '@/lib/user-storage';
import './trainer.css';

/* ── Trainer Personality Config ── */
const TRAINERS: Record<string, any> = {
  strict: {
    name: 'Drill Sergeant',
    avatar: '🎖️',
    tagline: "No excuses. Let's work.",
  },
  balanced: {
    name: 'Balanced Coach',
    avatar: '🎯',
    tagline: "Firm but fair — let's grow together.",
  },
  chill: {
    name: 'Chill Buddy',
    avatar: '😎',
    tagline: 'No pressure. Just vibes.',
  },
  hype: {
    name: 'Hype Beast',
    avatar: '🔥',
    tagline: "LET'S GOOO! Every rep counts!",
  },
};

const SUGGESTIONS = [
  '💪 Quick workout for today',
  '🍽️ What should I eat?',
  '😴 I missed yesterday\'s workout',
  '📊 Check my progress',
  '🥗 Healthy snack ideas',
  '🏃 How to improve endurance',
];

export default function TrainerPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const trainerType = profile?.vibe || 'balanced';
  const trainer = TRAINERS[trainerType] || TRAINERS.balanced;

  /* ── Load profile + chat history ── */
  useEffect(() => {
    const init = async () => {
      await initUserId();
      const guest = document.cookie.includes('gymbruh-guest=true');
      setIsGuest(guest);

      if (guest) {
        const stored = localStorage.getItem(userKey('guest-profile'));
        if (stored) setProfile(JSON.parse(stored));

        // Load guest chat history
        const chatStored = localStorage.getItem(userKey('trainer-chat'));
        if (chatStored) setMessages(JSON.parse(chatStored));
      } else {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
            if (profileData) {
              setProfile(profileData);
            } else {
              const stored = localStorage.getItem(userKey('guest-profile'));
              if (stored) setProfile(JSON.parse(stored));
            }
          }

          // Fetch chat history from API
          const res = await fetch('/api/trainer-chat');
          if (res.ok) {
            const history = await res.json();
            setMessages(history);
          }
        } catch (e) {
          console.error('Failed to load trainer data:', e);
        }
      }
    };
    init();
  }, []);

  /* ── Auto-scroll ── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /* ── Send message ── */
  const sendMessage = useCallback(async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || loading) return;

    setInputText('');

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/trainer-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          trainerType,
          profile,
          chatHistory: messages.slice(-20),
        }),
      });

      if (!res.ok) throw new Error('Failed to get response');
      const data = await res.json();

      const trainerMsg = {
        id: `trainer-${Date.now()}`,
        role: 'trainer',
        content: data.response,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => {
        const updated = [...prev, trainerMsg];
        // Save to localStorage for guest mode
        if (isGuest) {
          localStorage.setItem(userKey('trainer-chat'), JSON.stringify(updated));
        }
        return updated;
      });
    } catch (error) {
      console.error('Trainer chat error:', error);
      const errorMsg = {
        id: `error-${Date.now()}`,
        role: 'trainer',
        content: 'Oops, I had a brain freeze 🧊 Try asking again!',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [inputText, loading, trainerType, profile, messages, isGuest]);

  /* ── Keyboard handler ── */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ── Clear chat ── */
  const clearChat = async () => {
    setMessages([]);
    if (isGuest) {
      localStorage.removeItem(userKey('trainer-chat'));
    } else {
      // For authenticated users, we could delete from DB too
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('trainer_messages').delete().eq('user_id', user.id);
        }
      } catch (e) {
        console.error('Failed to clear chat:', e);
      }
    }
  };

  /* ── Format message time ── */
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="trainer-page">
      <div className="trainer-header">
        <div className="trainer-identity">
          <div className="trainer-avatar">{trainer.avatar}</div>
          <div className="trainer-info">
            <h1>{trainer.name}</h1>
            <p>{trainer.tagline}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="trainer-status">
            <span className="status-dot" />
            Online
          </div>
          {messages.length > 0 && (
            <button className="clear-chat-btn" onClick={clearChat}>
              Clear Chat
            </button>
          )}
        </div>
      </div>

      {messages.length === 0 && !loading ? (
        <div className="trainer-empty">
          <div className="empty-trainer-icon">{trainer.avatar}</div>
          <h2>Meet your AI Trainer</h2>
          <p>
            I'm {trainer.name}, your personal fitness coach. Ask me anything about
            workouts, nutrition, or your fitness journey!
          </p>
        </div>
      ) : (
        <div className="chat-area">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-row message-row-${msg.role === 'user' ? 'user' : 'trainer'}`}
            >
              {msg.role === 'trainer' && <div className="msg-avatar">{trainer.avatar}</div>}

              <div>
                <div className={`msg-bubble msg-bubble-${msg.role === 'user' ? 'user' : 'trainer'}`}>
                  {msg.content}
                </div>
                <span
                  className="msg-time"
                  style={{ textAlign: msg.role === 'user' ? 'right' : 'left' }}
                >
                  {formatTime(msg.created_at)}
                </span>
              </div>

              {msg.role === 'user' && <div className="msg-avatar">👤</div>}
            </div>
          ))}

          {loading && (
            <div className="typing-indicator">
              <div className="msg-avatar">{trainer.avatar}</div>
              <div className="typing-dots">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      )}

      {messages.length < 3 && (
        <div className="suggestions-row">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="suggestion-chip" onClick={() => sendMessage(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="input-area">
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder={`Ask ${trainer.name} anything...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={loading}
        />
        <button
          className="send-btn"
          onClick={() => sendMessage()}
          disabled={loading || !inputText.trim()}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
