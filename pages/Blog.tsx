import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MessageSquare, ThumbsUp, ThumbsDown, Share2, Send, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Question {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  likes: number;
  dislikes: number;
}

interface Reply {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes: number;
  dislikes: number;
}

interface Reaction {
  question_id: string;
  type: 'like' | 'dislike';
}

export default function Blog() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '' });
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [newReply, setNewReply] = useState<Record<string, string>>({});
  const [showReplyForm, setShowReplyForm] = useState<Record<string, boolean>>({});
  const [userReactions, setUserReactions] = useState<Record<string, 'like' | 'dislike'>>({});

  useEffect(() => {
    fetchQuestions();
    fetchUserReactions();
    
    const subscription = supabase
      .channel('realtime-blog')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, 
        () => fetchQuestions()
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'question_replies' },
        () => {
          questions.forEach(q => fetchReplies(q.id));
        }
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'question_reactions' },
        () => {
          fetchQuestions();
          fetchUserReactions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching questions:', error);
      return;
    }
    
    setQuestions(data || []);
    data?.forEach(question => fetchReplies(question.id));
  };

  const fetchReplies = async (questionId: string) => {
    const { data, error } = await supabase
      .from('question_replies')
      .select('*')
      .eq('question_id', questionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching replies:', error);
      return;
    }

    setReplies(prev => ({
      ...prev,
      [questionId]: data || []
    }));
  };

  const fetchUserReactions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('question_reactions')
      .select('question_id, type')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching user reactions:', error);
      return;
    }

    const reactions: Record<string, 'like' | 'dislike'> = {};
    data?.forEach((reaction: Reaction) => {
      reactions[reaction.question_id] = reaction.type;
    });

    setUserReactions(reactions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please login to ask a question');
      return;
    }

    const { error } = await supabase
      .from('questions')
      .insert([{
        ...newQuestion,
        user_id: user.id
      }]);

    if (error) {
      console.error('Error submitting question:', error);
      return;
    }

    setNewQuestion({ title: '', content: '' });
  };

  const handleReaction = async (questionId: string, type: 'like' | 'dislike') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please login to react');
      return;
    }

    const currentReaction = userReactions[questionId];

    try {
      if (currentReaction === type) {
        // Remove reaction
        await supabase
          .from('question_reactions')
          .delete()
          .eq('question_id', questionId)
          .eq('user_id', user.id);
      } else {
        // Upsert reaction
        await supabase
          .from('question_reactions')
          .upsert({
            question_id: questionId,
            user_id: user.id,
            type
          }, {
            onConflict: 'question_id,user_id'
          });
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  const handleReply = async (questionId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please login to reply');
      return;
    }

    const content = newReply[questionId];
    if (!content?.trim()) return;

    const { error } = await supabase
      .from('question_replies')
      .insert([{
        question_id: questionId,
        user_id: user.id,
        content
      }]);

    if (error) {
      console.error('Error submitting reply:', error);
      return;
    }

    setNewReply(prev => ({ ...prev, [questionId]: '' }));
    setShowReplyForm(prev => ({ ...prev, [questionId]: false }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Security Insights & FAQ</h1>
        
        {/* Ask Question Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Ask a Question</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Title
              </label>
              <input
                type="text"
                value={newQuestion.title}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="What's your security question?"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Details
              </label>
              <textarea
                value={newQuestion.content}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md h-32"
                placeholder="Provide more details about your question..."
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Question
            </button>
          </form>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((question) => (
            <div key={question.id} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-2">{question.title}</h3>
              <p className="text-gray-600 mb-4">{question.content}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{format(new Date(question.created_at), 'MMM d, yyyy')}</span>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleReaction(question.id, 'like')}
                    className={`flex items-center space-x-1 ${
                      userReactions[question.id] === 'like' ? 'text-blue-600' : ''
                    }`}
                  >
                    <ThumbsUp className="h-5 w-5" />
                    <span>{question.likes || 0}</span>
                  </button>
                  <button
                    onClick={() => handleReaction(question.id, 'dislike')}
                    className={`flex items-center space-x-1 ${
                      userReactions[question.id] === 'dislike' ? 'text-red-600' : ''
                    }`}
                  >
                    <ThumbsDown className="h-5 w-5" />
                    <span>{question.dislikes || 0}</span>
                  </button>
                  <button
                    onClick={() => setShowReplyForm(prev => ({
                      ...prev,
                      [question.id]: !prev[question.id]
                    }))}
                    className="flex items-center space-x-1"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Reply</span>
                  </button>
                  <button className="flex items-center space-x-1">
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Replies Section */}
              <div className="mt-4 space-y-4">
                {replies[question.id]?.map((reply) => (
                  <div key={reply.id} className="bg-gray-50 rounded-lg p-4 ml-8">
                    <p className="text-gray-700">{reply.content}</p>
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                      <span>{format(new Date(reply.created_at), 'MMM d, yyyy')}</span>
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center space-x-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{reply.likes || 0}</span>
                        </button>
                        <button className="flex items-center space-x-1">
                          <ThumbsDown className="h-4 w-4" />
                          <span>{reply.dislikes || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {showReplyForm[question.id] && (
                  <div className="mt-4 ml-8">
                    <div className="flex items-start space-x-2">
                      <textarea
                        value={newReply[question.id] || ''}
                        onChange={(e) => setNewReply(prev => ({
                          ...prev,
                          [question.id]: e.target.value
                        }))}
                        className="flex-grow p-2 border rounded-md"
                        placeholder="Write your reply..."
                        rows={3}
                      />
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleReply(question.id)}
                          className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
                        >
                          <Send className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setShowReplyForm(prev => ({ ...prev, [question.id]: false }));
                            setNewReply(prev => ({ ...prev, [question.id]: '' }));
                          }}
                          className="bg-gray-200 text-gray-600 p-2 rounded-md hover:bg-gray-300"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}