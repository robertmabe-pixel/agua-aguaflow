import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import './CustomerFeedbackWidget.css';

/**
 * CustomerFeedbackWidget - A comprehensive feedback collection component
 * 
 * Features:
 * - 1-5 star rating system
 * - Comments section with character limit
 * - Real-time feedback submission
 * - Aggregated sentiment display
 * - Responsive design with accessibility support
 * - Error handling and loading states
 */
const CustomerFeedbackWidget = ({
  apiEndpoint = '/api/feedback',
  maxCommentLength = 500,
  className = '',
  onFeedbackSubmitted = null,
  showAggregatedData = true,
  refreshInterval = 300000, // 5 minutes
  autoRefresh = true
}) => {
  // State management
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [aggregatedData, setAggregatedData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch aggregated feedback data
  const fetchAggregatedData = async () => {
    if (!showAggregatedData) return;
    
    setIsLoadingData(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiEndpoint}/aggregated`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAggregatedData(data);
    } catch (err) {
      console.error('Error fetching aggregated feedback data:', err);
      setError('Failed to load feedback statistics');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Submit feedback
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Reset form
      setRating(0);
      setComment('');
      setSubmitSuccess(true);
      
      // Call callback if provided
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(result);
      }

      // Refresh aggregated data
      fetchAggregatedData();

      // Hide success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);

    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle star click
  const handleStarClick = (starValue) => {
    setRating(starValue);
    setError(null);
  };

  // Handle comment change
  const handleCommentChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxCommentLength) {
      setComment(value);
    }
  };

  // Calculate sentiment from aggregated data
  const sentimentData = useMemo(() => {
    if (!aggregatedData) return null;

    const { totalFeedbacks, averageRating, ratingDistribution } = aggregatedData;
    
    let sentiment = 'neutral';
    if (averageRating >= 4) sentiment = 'positive';
    else if (averageRating <= 2) sentiment = 'negative';

    return {
      sentiment,
      averageRating: averageRating.toFixed(1),
      totalFeedbacks,
      ratingDistribution
    };
  }, [aggregatedData]);

  // Auto-refresh effect
  useEffect(() => {
    fetchAggregatedData();

    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchAggregatedData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [apiEndpoint, showAggregatedData, autoRefresh, refreshInterval]);

  // Render star rating
  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoverRating || rating);
      
      return (
        <button
          key={starValue}
          type="button"
          className={`star ${isActive ? 'active' : ''}`}
          onClick={() => handleStarClick(starValue)}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
          aria-label={`Rate ${starValue} star${starValue !== 1 ? 's' : ''}`}
          disabled={isSubmitting}
        >
          ★
        </button>
      );
    });
  };

  // Render aggregated sentiment
  const renderAggregatedSentiment = () => {
    if (!showAggregatedData || isLoadingData) {
      return (
        <div className="aggregated-sentiment loading">
          <div className="loading-spinner"></div>
          <span>Loading feedback data...</span>
        </div>
      );
    }

    if (!sentimentData) return null;

    const { sentiment, averageRating, totalFeedbacks } = sentimentData;

    return (
      <div className={`aggregated-sentiment ${sentiment}`}>
        <div className="sentiment-header">
          <h4>Customer Sentiment</h4>
          <div className="sentiment-badge">
            <span className={`sentiment-indicator ${sentiment}`}></span>
            {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
          </div>
        </div>
        <div className="sentiment-stats">
          <div className="stat">
            <span className="stat-value">{averageRating}</span>
            <span className="stat-label">Average Rating</span>
          </div>
          <div className="stat">
            <span className="stat-value">{totalFeedbacks}</span>
            <span className="stat-label">Total Reviews</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`customer-feedback-widget ${className}`}>
      {/* Aggregated Sentiment Display */}
      {showAggregatedData && renderAggregatedSentiment()}

      {/* Feedback Form */}
      <div className="feedback-form-container">
        <h3>Share Your Feedback</h3>
        
        {submitSuccess && (
          <div className="success-message" role="alert">
            ✓ Thank you for your feedback!
          </div>
        )}

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="feedback-form">
          {/* Star Rating */}
          <div className="rating-section">
            <label className="rating-label">
              How would you rate your experience?
            </label>
            <div className="star-rating" role="radiogroup" aria-label="Rating">
              {renderStars()}
            </div>
            {rating > 0 && (
              <span className="rating-text">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </span>
            )}
          </div>

          {/* Comments Section */}
          <div className="comment-section">
            <label htmlFor="feedback-comment" className="comment-label">
              Additional Comments (Optional)
            </label>
            <textarea
              id="feedback-comment"
              value={comment}
              onChange={handleCommentChange}
              placeholder="Tell us more about your experience..."
              className="comment-textarea"
              rows="4"
              disabled={isSubmitting}
              aria-describedby="comment-counter"
            />
            <div id="comment-counter" className="comment-counter">
              {comment.length}/{maxCommentLength} characters
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? (
              <>
                <span className="loading-spinner small"></span>
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

CustomerFeedbackWidget.propTypes = {
  /** API endpoint for feedback submission and aggregated data */
  apiEndpoint: PropTypes.string,
  /** Maximum length for comment text */
  maxCommentLength: PropTypes.number,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Callback function called after successful feedback submission */
  onFeedbackSubmitted: PropTypes.func,
  /** Whether to show aggregated sentiment data */
  showAggregatedData: PropTypes.bool,
  /** Auto-refresh interval in milliseconds */
  refreshInterval: PropTypes.number,
  /** Whether to enable auto-refresh */
  autoRefresh: PropTypes.bool
};

export default CustomerFeedbackWidget;
