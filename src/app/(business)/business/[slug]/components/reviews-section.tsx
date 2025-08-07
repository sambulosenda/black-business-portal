'use client'

import Link from 'next/link'
import { MoreHorizontal, Star, ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ReviewWithRelations } from '@/types'

interface ReviewsSectionProps {
  reviews: ReviewWithRelations[]
  averageRating: number
  totalReviews: number
  businessSlug: string
}

export default function ReviewsSection({
  reviews,
  averageRating,
  totalReviews,
  businessSlug,
}: ReviewsSectionProps) {
  const ratingBreakdown = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((r) => r.rating === rating).length
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
    return { rating, count, percentage }
  })

  return (
    <section
      id="reviews"
      className="rounded-2xl border border-indigo-100/50 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 p-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          <p className="mt-1 text-gray-600">Real experiences from real customers</p>
        </div>
        {totalReviews > reviews.length && (
          <Link href={`/business/${businessSlug}/reviews`}>
            <Button variant="outline" size="sm">
              View All ({totalReviews})
            </Button>
          </Link>
        )}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
          <div className="mt-2 flex justify-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-6 w-6 ${
                  i < Math.round(averageRating) ? 'fill-current text-purple-500' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-gray-600">{totalReviews} total reviews</p>
        </div>

        <div className="space-y-2 lg:col-span-2">
          {ratingBreakdown.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <span className="w-3 text-sm font-medium">{rating}</span>
              <Star className="h-4 w-4 fill-current text-purple-500" />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-12 text-right text-sm text-gray-600">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {reviews.slice(0, 3).map((review) => (
          <div key={review.id} className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text font-semibold text-transparent">
                      {review.user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{review.user?.name || 'Anonymous'}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'fill-current text-purple-500' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
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

            {review.comment && <p className="leading-relaxed text-gray-700">{review.comment}</p>}

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
