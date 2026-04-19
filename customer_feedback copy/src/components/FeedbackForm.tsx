import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SuccessMessage } from './SuccessMessage';

type Rating = 'sad' | 'neutral' | 'happy' | null;

export function FeedbackForm() {
  const [rating, setRating] = useState<Rating>(null);
  const [gender, setGender] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [review, setReview] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [rateLimited, setRateLimited] = useState(false);

  useEffect(() => {
    // Check for rate limiting
    const lastSubmission = localStorage.getItem('lastFeedbackSubmission');
    if (lastSubmission) {
      const timeSince = Date.now() - parseInt(lastSubmission, 10);
      const twoHours = 2 * 60 * 60 * 1000;
      if (timeSince < twoHours) {
        setRateLimited(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!rating) {
      setError('Please select an emoji rating before submitting.');
      return;
    }

    if (rateLimited) {
      setError('You have already submitted feedback recently. Please try again later.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: submitError } = await supabase
        .from('customer_feedback')
        .insert([
          {
            rating,
            gender: gender || null,
            age_group: ageGroup || null,
            review: review || null,
            // Assuming the QR code might pass category/section via URL params later
          }
        ]);

      if (submitError) throw submitError;

      // Success
      localStorage.setItem('lastFeedbackSubmission', Date.now().toString());
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return <SuccessMessage />;
  }

  if (rateLimited) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md mx-auto text-center border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Wait</h2>
        <p className="text-gray-600">
          You have already submitted feedback recently. Please wait a couple of hours before submitting again.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-md mx-auto border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">How was your experience?</h2>
        <p className="text-gray-500 mt-2">We value your anonymous feedback.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Your Rating *</label>
          <div className="flex justify-center space-x-6">
            <button
              type="button"
              onClick={() => setRating('sad')}
              className={`text-5xl transition-transform hover:scale-110 ${rating === 'sad' ? 'grayscale-0 scale-110' : 'grayscale opacity-50'}`}
            >
              😢
            </button>
            <button
              type="button"
              onClick={() => setRating('neutral')}
              className={`text-5xl transition-transform hover:scale-110 ${rating === 'neutral' ? 'grayscale-0 scale-110' : 'grayscale opacity-50'}`}
            >
              😐
            </button>
            <button
              type="button"
              onClick={() => setRating('happy')}
              className={`text-5xl transition-transform hover:scale-110 ${rating === 'happy' ? 'grayscale-0 scale-110' : 'grayscale opacity-50'}`}
            >
              😊
            </button>
          </div>
          {error && error.includes('emoji rating') && (
            <p className="text-red-500 text-sm mt-3 text-center font-medium">{error}</p>
          )}
        </div>

        {/* Optional Fields Container */}
        <div className="pt-4 border-t border-gray-100 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender (Optional)</label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2.5 bg-gray-50 border"
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 mb-1">Age (Optional)</label>
              <select
                id="ageGroup"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2.5 bg-gray-50 border"
              >
                <option value="">Select...</option>
                <option value="Under 18">Under 18</option>
                <option value="18-24">18-24</option>
                <option value="25-34">25-34</option>
                <option value="35-44">35-44</option>
                <option value="45-54">45-54</option>
                <option value="55+">55+</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">Review (Optional)</label>
            <textarea
              id="review"
              rows={3}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-3 bg-gray-50 border placeholder-gray-400"
              placeholder="Tell us more about your experience..."
            />
          </div>
        </div>

        {error && !error.includes('emoji rating') && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}
