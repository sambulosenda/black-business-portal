'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Star, ThumbsUp, MoreHorizontal } from 'lucide-react'
import type { ReviewWithRelations } from '@/types'

interface ReviewsSectionProps {
  reviews: ReviewWithRelations[]
  averageRating: number
  totalReviews: number
  businessSlug: string
}

export default function ReviewsSection({ reviews, averageRating, totalReviews, businessSlug }: ReviewsSectionProps) {
  const ratingBreakdown = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(r => r.rating === rating).length
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
    return { rating, count, percentage }
  })
  
  return (
    <section id="reviews" className="bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 rounded-2xl p-8 border border-indigo-100/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          <p className="text-gray-600 mt-1">Real experiences from real customers</p>
        </div>
        {totalReviews > reviews.length && (
          <Link href={`/business/${businessSlug}/reviews`}>
            <Button variant="outline" size="sm">
              View All ({totalReviews})
            </Button>
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
          <div className="flex justify-center mt-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-6 w-6 ${
                  i < Math.round(averageRating)
                    ? 'text-purple-500 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-gray-600 mt-2">{totalReviews} total reviews</p>
        </div>
        
        <div className="lg:col-span-2 space-y-2">
          {ratingBreakdown.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm font-medium w-3">{rating}</span>
              <Star className="h-4 w-4 text-purple-500 fill-current" />
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-6">
        {reviews.slice(0, 3).map((review) => (
          <div key={review.id} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                      {review.user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{review.user?.name || 'Anonymous'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-purple-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            
            {review.comment && (
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            )}
            
            <div className="mt-4 flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                <ThumbsUp className="h-4 w-4" />
                Helpful
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}