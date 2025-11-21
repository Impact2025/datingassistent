'use client';

import { useState, useEffect } from 'react';
import { sql } from '@vercel/postgres';

export default function TestReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const result = await sql`
        SELECT * FROM reviews ORDER BY created_at DESC
      `;
      setReviews(result.rows);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setMessage('Error loading reviews: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const addTestReview = async () => {
    try {
      await sql`
        INSERT INTO reviews (name, role, content, avatar, rating)
        VALUES (
          'Test Gebruiker',
          'Gebruiker sinds 1 maand',
          'Dit is een test review om te controleren of het systeem werkt.',
          'https://placehold.co/100x100/1c1c2e/e0e0e0?text=T',
          5
        )
      `;
      setMessage('Test review added successfully!');
      loadReviews(); // Refresh the list
    } catch (error) {
      console.error('Error adding test review:', error);
      setMessage('Error adding test review: ' + (error as Error).message);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Test Reviews</h1>
      
      {message && (
        <div className="mb-4 p-4 bg-blue-100 text-blue-800 rounded">
          {message}
        </div>
      )}
      
      <div className="mb-6">
        <button 
          onClick={addTestReview}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Test Review
        </button>
      </div>
      
      {loading ? (
        <p>Loading reviews...</p>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="border p-4 rounded">
              <h3 className="font-bold">{review.name}</h3>
              <p className="text-gray-600">{review.role}</p>
              <p className="mt-2">{review.content}</p>
              <div className="mt-2 text-yellow-500">
                {'★'.repeat(review.rating || 0)}
                {'☆'.repeat(5 - (review.rating || 0))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}