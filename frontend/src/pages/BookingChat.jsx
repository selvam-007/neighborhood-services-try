import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Send,
  MessageSquare,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCheck,
} from 'lucide-react';

const SUGGESTED_MESSAGES = [
  'Hi! What time works best for you?',
  'Could you confirm your exact address?',
  'I am on my way!',
  'Please let me know what materials might be needed.',
  'Thanks! Looking forward to it.',
];

function BookingChat() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const loadMessages = () => {
    api
      .get(`/bookings/${bookingId}/messages`)
      .then((res) => {
        setMessages(res.data || []);
        setError('');
      })
      .catch(() => setError('Unable to load this conversation. Please check your connection.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3500); // poll every 3.5s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const textToSend = newMessage.trim();
    setSending(true);
    try {
      await api.post(`/bookings/${bookingId}/messages`, { content: textToSend });
      setNewMessage('');
      loadMessages();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleQuickSend = (text) => {
    setNewMessage(text);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Connecting to secure chat...</p>
        </div>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md w-full">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Conversation Unavailable</h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">{error}</p>
          <Link
            to="/my-bookings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-100 max-h-[calc(100vh-4rem)]">
      {/* Chat Navigation Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sticky top-16 z-20 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/my-bookings"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Back to bookings"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  Booking #{bookingId}
                </h1>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Chat
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct community communication channel
              </p>
            </div>
          </div>

          <Link
            to="/my-bookings"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hidden sm:inline"
          >
            Manage Booking &rarr;
          </Link>
        </div>
      </div>

      {/* Messages Canvas */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full space-y-4">
        {/* Notice */}
        <div className="text-center my-2">
          <span className="inline-flex items-center gap-1.5 bg-slate-200/80 text-slate-600 text-[11px] font-medium px-3 py-1 rounded-full">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            Messages are shared directly between requester and provider.
          </span>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white/70 backdrop-blur-xs rounded-3xl border border-slate-200/60 max-w-md mx-auto my-8">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">No messages yet</h3>
            <p className="text-xs text-slate-500 mb-4">
              Break the ice! Send a greeting or confirm appointment details.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMine = m.senderId === user?.userId;
            const timeString = m.sentAt
              ? new Date(m.sentAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            return (
              <div
                key={m.id}
                className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                {!isMine && (
                  <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {m.senderName ? m.senderName.charAt(0).toUpperCase() : 'P'}
                  </div>
                )}

                <div
                  className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-xs ${
                    isMine
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  {!isMine && (
                    <p className="text-[10px] font-bold text-indigo-600 mb-0.5">
                      {m.senderName}
                    </p>
                  )}
                  <p className="leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>
                  <div
                    className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                      isMine ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    <span>{timeString}</span>
                    {isMine && <CheckCheck className="w-3 h-3 text-indigo-200" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested Quick Replies */}
      <div className="bg-white/80 border-t border-slate-200 px-4 sm:px-6 py-2 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1">
            Quick notes:
          </span>
          {SUGGESTED_MESSAGES.map((msg, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickSend(msg)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-full text-[11px] whitespace-nowrap transition border border-slate-200/60"
            >
              {msg}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box Footer */}
      <div className="bg-white border-t border-slate-200 p-4 max-w-4xl mx-auto w-full">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message to specialist..."
            className="flex-1 bg-slate-100 focus:bg-white text-xs sm:text-sm rounded-xl px-4 py-3 border border-transparent focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition text-slate-800 placeholder-slate-400"
          />

          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm shadow-indigo-600/20 transition disabled:opacity-40 flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookingChat;