import React, { useState } from 'react';
import { submitFeedback, FeedbackData } from '../services/feedbackService';
import { FeedbackEntry } from '../types';

interface FeedbackWidgetProps {
  className?: string;
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage('이메일 주소를 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      setMessage('내용을 입력해주세요.');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const feedbackData: FeedbackData = {
        email: email.trim(),
        content: content.trim(),
        page: window.location.pathname
      };

      const result = await submitFeedback(feedbackData);
      
      if (result.success) {
        setMessage('피드백을 보내주셔서 감사합니다! 💝');
        setEmail('');
        setContent('');
        setTimeout(() => {
          setIsOpen(false);
          setMessage('');
        }, 2000);
      } else {
        setMessage(result.message || '피드백 전송에 실패했습니다.');
      }
    } catch (error) {
      setMessage('오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Feedback submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      {/* 피드백 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed top-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 shadow-lg transition-all duration-300 hover:scale-105 z-50 flex items-center gap-2 ${className}`}
        title="피드백 보내기"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <span className="text-sm font-medium">의견보내기</span>
      </button>

      {/* 피드백 모달 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">피드백 보내기</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>


            {/* 피드백 내용 입력 */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label htmlFor="feedback-email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 주소
                </label>
                <input
                  id="feedback-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="feedback-content" className="block text-sm font-medium text-gray-700 mb-2">
                  자세한 내용을 알려주세요
                </label>
                <textarea
                  id="feedback-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="사용하시면서 느낀 점, 개선하고 싶은 부분, 새로운 기능 아이디어 등을 자유롭게 작성해주세요..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={500}
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {content.length}/500
                </div>
              </div>

              {/* 메시지 */}
              {message && (
                <div className={`mb-4 p-3 rounded-lg ${
                  message.includes('감사합니다') 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {message}
                </div>
              )}

              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !email.trim() || !content.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? '전송 중...' : '피드백 보내기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;
