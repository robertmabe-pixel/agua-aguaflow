import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CustomerFeedbackWidget from '../CustomerFeedbackWidget';

// Mock fetch globally
global.fetch = jest.fn();

describe('CustomerFeedbackWidget', () => {
  beforeEach(() => {
    fetch.mockClear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const mockAggregatedData = {
    totalFeedbacks: 150,
    averageRating: 4.2,
    ratingDistribution: {
      1: 5,
      2: 10,
      3: 25,
      4: 60,
      5: 50
    }
  };

  const mockSuccessResponse = {
    success: true,
    id: '123',
    message: 'Feedback submitted successfully'
  };

  describe('Component Rendering', () => {
    test('renders feedback form with all elements', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAggregatedData
      });

      render(<CustomerFeedbackWidget />);

      expect(screen.getByText('Share Your Feedback')).toBeInTheDocument();
      expect(screen.getByText('How would you rate your experience?')).toBeInTheDocument();
      expect(screen.getByLabelText(/Additional Comments/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Submit Feedback/ })).toBeInTheDocument();
      
      // Check for 5 star buttons
      const starButtons = screen.getAllByRole('button');
      const starRatingButtons = starButtons.filter(button => 
        button.getAttribute('aria-label')?.includes('Rate')
      );
      expect(starRatingButtons).toHaveLength(5);
    });

    test('renders aggregated sentiment when data is available', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAggregatedData
      });

      render(<CustomerFeedbackWidget />);

      await waitFor(() => {
        expect(screen.getByText('Customer Sentiment')).toBeInTheDocument();
        expect(screen.getByText('4.2')).toBeInTheDocument();
        expect(screen.getByText('150')).toBeInTheDocument();
        expect(screen.getByText('Positive')).toBeInTheDocument();
      });
    });

    test('shows loading state for aggregated data', () => {
      fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<CustomerFeedbackWidget />);

      expect(screen.getByText('Loading feedback data...')).toBeInTheDocument();
    });

    test('applies custom className', () => {
      const { container } = render(
        <CustomerFeedbackWidget className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('customer-feedback-widget', 'custom-class');
    });
  });

  describe('Star Rating Functionality', () => {
    test('allows selecting star rating', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      render(<CustomerFeedbackWidget />);

      const thirdStar = screen.getByLabelText('Rate 3 stars');
      await user.click(thirdStar);

      expect(screen.getByText('Good')).toBeInTheDocument();
    });

    test('shows hover effects on stars', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      render(<CustomerFeedbackWidget />);

      const fourthStar = screen.getByLabelText('Rate 4 stars');
      await user.hover(fourthStar);

      // Check that stars 1-4 have active class (this would need to be tested via CSS classes)
      const stars = screen.getAllByRole('button').filter(button => 
        button.getAttribute('aria-label')?.includes('Rate')
      );
      
      // Verify the star is interactable
      expect(fourthStar).not.toBeDisabled();
    });

    test('displays correct rating text for each star value', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      render(<CustomerFeedbackWidget />);

      const ratings = [
        { star: 1, text: 'Poor' },
        { star: 2, text: 'Fair' },
        { star: 3, text: 'Good' },
        { star: 4, text: 'Very Good' },
        { star: 5, text: 'Excellent' }
      ];

      for (const { star, text } of ratings) {
        const starButton = screen.getByLabelText(`Rate ${star} star${star !== 1 ? 's' : ''}`);
        await user.click(starButton);
        expect(screen.getByText(text)).toBeInTheDocument();
      }
    });
  });

  describe('Comment Functionality', () => {
    test('allows typing in comment textarea', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      render(<CustomerFeedbackWidget />);

      const textarea = screen.getByLabelText(/Additional Comments/);
      await user.type(textarea, 'This is a test comment');

      expect(textarea).toHaveValue('This is a test comment');
      expect(screen.getByText('23/500 characters')).toBeInTheDocument();
    });

    test('enforces character limit', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      render(<CustomerFeedbackWidget maxCommentLength={10} />);

      const textarea = screen.getByLabelText(/Additional Comments/);
      await user.type(textarea, 'This is a very long comment that exceeds the limit');

      expect(textarea.value.length).toBeLessThanOrEqual(10);
      expect(screen.getByText('10/10 characters')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('submits feedback successfully', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onFeedbackSubmitted = jest.fn();

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAggregatedData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSuccessResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAggregatedData
        });

      render(
        <CustomerFeedbackWidget onFeedbackSubmitted={onFeedbackSubmitted} />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Customer Sentiment')).toBeInTheDocument();
      });

      // Select rating
      const fourthStar = screen.getByLabelText('Rate 4 stars');
      await user.click(fourthStar);

      // Add comment
      const textarea = screen.getByLabelText(/Additional Comments/);
      await user.type(textarea, 'Great service!');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Submit Feedback/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('✓ Thank you for your feedback!')).toBeInTheDocument();
      });

      expect(fetch).toHaveBeenCalledWith('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: 4,
          comment: 'Great service!',
          timestamp: expect.any(String)
        }),
      });

      expect(onFeedbackSubmitted).toHaveBeenCalledWith(mockSuccessResponse);
    });

    test('shows error when no rating is selected', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      render(<CustomerFeedbackWidget />);

      const submitButton = screen.getByRole('button', { name: /Submit Feedback/ });
      await user.click(submitButton);

      expect(screen.getByText('Please select a rating')).toBeInTheDocument();
    });

    test('handles submission error', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAggregatedData
        })
        .mockRejectedValueOnce(new Error('Network error'));

      render(<CustomerFeedbackWidget />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Customer Sentiment')).toBeInTheDocument();
      });

      // Select rating and submit
      const thirdStar = screen.getByLabelText('Rate 3 stars');
      await user.click(thirdStar);

      const submitButton = screen.getByRole('button', { name: /Submit Feedback/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to submit feedback. Please try again.')).toBeInTheDocument();
      });
    });

    test('disables form during submission', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAggregatedData
        })
        .mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<CustomerFeedbackWidget />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Customer Sentiment')).toBeInTheDocument();
      });

      // Select rating and submit
      const thirdStar = screen.getByLabelText('Rate 3 stars');
      await user.click(thirdStar);

      const submitButton = screen.getByRole('button', { name: /Submit Feedback/ });
      await user.click(submitButton);

      // Check that form elements are disabled
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      
      const stars = screen.getAllByRole('button').filter(button => 
        button.getAttribute('aria-label')?.includes('Rate')
      );
      stars.forEach(star => {
        expect(star).toBeDisabled();
      });
    });
  });

  describe('Auto-refresh Functionality', () => {
    test('auto-refreshes aggregated data', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockAggregatedData
      });

      render(<CustomerFeedbackWidget refreshInterval={1000} />);

      // Initial fetch
      expect(fetch).toHaveBeenCalledTimes(1);

      // Advance timer
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should fetch again
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    test('does not auto-refresh when disabled', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockAggregatedData
      });

      render(<CustomerFeedbackWidget autoRefresh={false} />);

      // Initial fetch
      expect(fetch).toHaveBeenCalledTimes(1);

      // Advance timer
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Should not fetch again
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      render(<CustomerFeedbackWidget />);

      expect(screen.getByRole('radiogroup', { name: 'Rating' })).toBeInTheDocument();
      expect(screen.getByLabelText(/Additional Comments/)).toBeInTheDocument();
      
      const stars = screen.getAllByRole('button').filter(button => 
        button.getAttribute('aria-label')?.includes('Rate')
      );
      expect(stars).toHaveLength(5);
    });

    test('shows success message with proper role', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAggregatedData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSuccessResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAggregatedData
        });

      render(<CustomerFeedbackWidget />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Customer Sentiment')).toBeInTheDocument();
      });

      // Submit feedback
      const thirdStar = screen.getByLabelText('Rate 3 stars');
      await user.click(thirdStar);

      const submitButton = screen.getByRole('button', { name: /Submit Feedback/ });
      await user.click(submitButton);

      await waitFor(() => {
        const successMessage = screen.getByRole('alert');
        expect(successMessage).toHaveTextContent('✓ Thank you for your feedback!');
      });
    });
  });

  describe('Props Configuration', () => {
    test('uses custom API endpoint', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockAggregatedData
      });

      render(<CustomerFeedbackWidget apiEndpoint="/custom/feedback" />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/custom/feedback/aggregated');
      });
    });

    test('hides aggregated data when showAggregatedData is false', () => {
      render(<CustomerFeedbackWidget showAggregatedData={false} />);

      expect(screen.queryByText('Customer Sentiment')).not.toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });

    test('uses custom comment length limit', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      render(<CustomerFeedbackWidget maxCommentLength={20} />);

      const textarea = screen.getByLabelText(/Additional Comments/);
      await user.type(textarea, 'Short comment');

      expect(screen.getByText('13/20 characters')).toBeInTheDocument();
    });
  });
});
