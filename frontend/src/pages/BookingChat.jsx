import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

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
    api.get(`/bookings/${bookingId}/messages`)
      .then((res) => setMessages(res.data))
      .catch(() => setError('Unable to load this conversation'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 4000); // poll every 4s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await api.post(`/bookings/${bookingId}/messages`, { content: newMessage });
      setNewMessage('');
      loadMessages();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading conversation...</p>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 bg-red-50 p-4 rounded mb-4">{error}</p>
          <Link to="/my-bookings" className="text-blue-600 font-semibold">Back to My Bookings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow p-4 flex items-center gap-3">
        <Link to="/my-bookings" className="text-blue-600 text-sm">&larr; Back</Link>
        <h1 className="font-semibold text-gray-800">Booking #{bookingId} Conversation</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 mt-8">No messages yet — say hello!</p>
        )}
        <div className="space-y-3">
          {messages.map((m) => {
            const isMine = m.senderId === user?.userId;
            return (
              <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs rounded-lg px-4 py-2 ${
                  isMine ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 shadow'
                }`}>
                  {!isMine && <p className="text-xs font-semibold mb-1 opacity-70">{m.senderName}</p>}
                  <p className="text-sm">{m.content}</p>
                  <p className={`text-xs mt-1 ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                    {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="bg-white p-4 border-t flex gap-2 max-w-2xl mx-auto w-full">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={sending}
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default BookingChat;