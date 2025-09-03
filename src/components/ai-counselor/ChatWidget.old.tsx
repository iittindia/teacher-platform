'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, X, Loader2, MessageSquare } from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'quiz_question' | 'course_recommendation';
  data?: any;
};

// Quiz question type
type QuizQuestion = {
  id: string;
  question: string;
  type: 'text' | 'multiple_choice' | 'rating';
  options?: string[];
};

// Initial system message to start the conversation
const INITIAL_MESSAGES: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: '👋 Hello! I\'m your AI Education Counselor. I\'m here to help you find the perfect professional development opportunities. Could you tell me what brings you here today?',
    timestamp: new Date(),
    type: 'text'
  },
  {
    id: 'quiz-start',
    role: 'assistant',
    content: 'To help me understand your needs better, I\'d like to ask you a few quick questions. This will help me recommend the best courses for you. Ready to begin?',
    timestamp: new Date(),
    type: 'quiz_question',
    data: { questionId: 'experience' }
  }
];

// Quiz questions configuration
const QUIZ_QUESTIONS: Record<string, QuizQuestion> = {
  experience: {
    id: 'experience',
    question: 'How many years of teaching experience do you have?',
    type: 'multiple_choice',
    options: ['Less than 1 year', '1-3 years', '4-7 years', '8+ years']
  },
  interest: {
    id: 'interest',
    question: 'What subjects or areas are you most interested in for professional development?',
    type: 'text'
  },
  challenge: {
    id: 'challenge',
    question: 'What is your biggest challenge in the classroom right now?',
    type: 'text'
  },
  goals: {
    id: 'goals',
    question: 'What are your professional development goals for this year?',
    type: 'text'
  },
  time_commitment: {
    id: 'time_commitment',
    question: 'How much time per week can you dedicate to professional development?',
    type: 'multiple_choice',
    options: ['1-2 hours', '3-5 hours', '5-10 hours', 'More than 10 hours']
  }
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quizResponses, setQuizResponses] = useState<Record<string, any>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>('experience');
  
  // Quiz questions in order
  const quizFlow = Object.keys(QUIZ_QUESTIONS);
  ];

  const handleQuizResponse = async (response: string) => {
    if (!currentQuestion) return;
    
    // Save the response
    const updatedResponses = {
      ...quizResponses,
      [currentQuestion]: response
    };
    setQuizResponses(updatedResponses);
    
    // Add user's response to chat
    const userMessage: Message = {
      id: `quiz-${currentQuestion}`,
      role: 'user',
      content: response,
      timestamp: new Date(),
      type: 'quiz_question',
      data: { questionId: currentQuestion }
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Move to next question or finish quiz
    const currentIndex = quizFlow.indexOf(currentQuestion);
    if (currentIndex < quizFlow.length - 1) {
      const nextQuestion = quizFlow[currentIndex + 1];
      setCurrentQuestion(nextQuestion);
      
      // Add next question to chat
      const nextQuestionData = {
        id: `question-${nextQuestion}`,
        role: 'assistant',
        content: getQuestionText(nextQuestion),
        timestamp: new Date(),
        type: 'quiz_question',
        data: { questionId: nextQuestion }
      };
      
      setMessages(prev => [...prev, nextQuestionData]);
    } else {
      // Quiz complete, analyze responses
      setCurrentQuestion(null);
      await analyzeQuizResponses(updatedResponses);
    }
  };
  
  const getQuestionText = (questionId: string) => {
    const questions: Record<string, string> = {
      experience: 'How many years of teaching experience do you have?',
      interest: 'What area are you most interested in improving?',
      challenge: 'What is your biggest challenge in teaching right now?',
      goals: 'What are your professional development goals for this year?',
      time_commitment: 'How many hours per week can you dedicate to professional development?'
    };
    return questions[questionId] || 'Thank you for your response!';
  };
  
  const analyzeQuizResponses = async (responses: Record<string, any>) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(({ role, content }) => ({ role, content })),
          quizResponses: responses
        }),
      });
      
      if (!response.ok) throw new Error('Failed to analyze responses');
      
      const { content } = await response.json();
      
      // Add AI's analysis and recommendations
      const aiMessage: Message = {
        id: `analysis-${Date.now()}`,
        role: 'assistant',
        content,
        timestamp: new Date(),
        type: 'course_recommendation'
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error analyzing quiz:', error);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error while analyzing your responses. Please try again later or contact support for assistance.',
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendMessage = async () => {
    const content = input.trim();
    if (!content || isLoading) return;
    
    // If we're in quiz mode, handle as quiz response
    if (currentQuestion) {
      await handleQuizResponse(content);
      setInput('');
      return;
    }
    
    // Regular chat message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({
            role,
            content,
          })),
          quizResponses
        }),
      });
      
      if (!response.ok) throw new Error('Failed to get response from AI');
      
      const { content: aiContent } = await response.json();
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}

useEffect(() => {
  // Auto-scroll to bottom when messages change
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);

const toggleChat = () => setIsOpen(!isOpen);

const renderMessage = (message: Message) => {
  if (message.type === 'quiz_question') {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <p className="font-medium text-yellow-800">{message.content}</p>
      </div>
    );
  }
  
  if (message.type === 'course_recommendation') {
    return (
      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
        <h4 className="font-bold text-green-800 mb-2">📚 Course Recommendations</h4>
        <div className="space-y-2">
          {message.content.split('\n').map((line, i) => (
            <p key={i} className="text-green-700">{line}</p>
          ))}
        </div>
        <button 
          className="mt-3 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          onClick={() => {
            window.location.href = '/#courses';
          }}
        >
          View Recommended Courses
        </button>
      </div>
    );
  }
  
  // Default message rendering
  return (
    <div
      className={`max-w-[80%] rounded-lg p-3 ${
        message.role === 'user'
          ? 'bg-blue-100 text-blue-900 rounded-br-none ml-auto'
          : 'bg-gray-100 text-gray-900 rounded-bl-none mr-auto'
      }`}
    >
      <p className="whitespace-pre-wrap">{message.content}</p>
      <p className="text-xs text-gray-500 mt-1">
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
};

return (
  <div className="fixed bottom-6 right-6 z-50">
    <button
      onClick={toggleChat}
      className="bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
      aria-label="Open chat"
    >
      {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
    </button>

    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-20 right-0 w-96 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col"
          style={{ height: '600px' }}
        >
          <div className="bg-blue-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Education Counselor</h3>
                <p className="text-xs opacity-80">AI-powered guidance for teachers</p>
              </div>
              <button 
                onClick={toggleChat} 
                className="text-white hover:text-blue-100 p-1 -mr-2"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {renderMessage(message)}
              </div>
            ))}
            <div ref={messagesEndRef} />
            
            {isLoading && !currentQuestion && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t p-4 bg-gray-50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  currentQuestion 
                    ? 'Type your answer...' 
                    : 'Type your message...'
                }
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 text-white rounded-lg px-4 py-2 disabled:bg-blue-400 hover:bg-blue-700 transition-colors flex items-center justify-center"
                style={{ minWidth: '42px' }}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </form>
            
            {currentQuestion && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                {quizFlow.indexOf(currentQuestion) + 1} of {quizFlow.length} questions
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {!isOpen && (
      <button
        onClick={toggleChat}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform border-2 border-white/10 hover:border-white/20"
        aria-label="Open chat"
      >
        <Bot className="w-8 h-8" />
      </button>
    )}
  </div>
);
          </button>
        )}
      </AnimatePresence>
    </div>
  );
}
