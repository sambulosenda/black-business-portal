'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { S3Image } from '@/components/ui/s3-image'
import { ShoppingCart, Sparkles } from 'lucide-react'
import { useCart } from '@/contexts/cart-context'

interface ProductsSectionProps {
  products: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    salePrice: number | null;
    images: string[];
    featured: boolean;
    currentStock: number;
    category?: {
      id: string;
      name: string;
    } | null;
  }>
  productCategories: Array<{
    id: string;
    name: string;
    productCount: number;
  }>
  businessId: string
  businessName: string
  businessSlug: string
}

export default function ProductsSection({ 
  products, 
  productCategories, 
  businessId, 
  businessName, 
  businessSlug 
}: ProductsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { addProduct } = useCart()
  
  const featuredProducts = products.filter(p => p.featured)
  const displayProducts = selectedCategory 
    ? products.filter(p => p.category?.id === selectedCategory)
    : products
    
  const handleAddToCart = (product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  }) => {
    addProduct({
      id: product.id,
      businessId,
      businessName,
      businessSlug,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      image: product.images?.[0],
    })
  }
  
  return (
    <section id="products">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-gray-600 mt-1">Premium hair care essentials</p>
        </div>
      </div>
      
      {productCategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              !selectedCategory 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Products
          </button>
          {productCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
      
      {featuredProducts.length > 0 && !selectedCategory && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Featured Products</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {featuredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
                featured
              />
            ))}
          </div>
        </>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayProducts
          .filter(p => !p.featured || selectedCategory)
          .map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={handleAddToCart}
            />
          ))}
      </div>
      
      {displayProducts.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No products in this category</p>
        </div>
      )}
    </section>
  )
}

function ProductCard({ product, onAddToCart, featured = false }: {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    salePrice: number | null;
    compareAtPrice?: number;
    images: string[];
    currentStock: number;
  };
  onAddToCart: (product: any) => void;
  featured?: boolean;
}) {
  const discountPercentage = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0
    
  return (
    <div className={`bg-white border ${featured ? 'border-purple-200' : 'border-gray-200'} rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 group`}>
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.images.length > 0 ? (
          <S3Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="w-16 h-16 text-gray-300" />
          </div>
        )}
        {discountPercentage > 0 && (
          <Badge className="absolute top-2 right-2 bg-red-500 text-white border-0">
            {discountPercentage}% OFF
          </Badge>
        )}
        {featured && (
          <Badge className="absolute top-2 left-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 shadow-md">
            Featured
          </Badge>
        )}
      </div>
      
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
          {product.name}
        </h4>
        {product.brand && (
          <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
        )}
        {product.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ${Number(product.price).toFixed(2)}
            </span>
            {product.compareAtPrice && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                ${Number(product.compareAtPrice).toFixed(2)}
              </span>
            )}
          </div>
        </div>
        
        <Button
          size="sm"
          className="w-full mt-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white group-hover:shadow-md transition-all"
          onClick={() => onAddToCart(product)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </div>
  )
}