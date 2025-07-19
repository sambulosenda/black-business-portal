'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Package, Plus, Search, Edit, 
  Trash, DollarSign, Tag, AlertTriangle,
  Package2, Loader2, ImageIcon
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface ProductCategory {
  id: string
  name: string
  description: string | null
  displayOrder: number
  isActive: boolean
}

interface Product {
  id: string
  businessId: string
  categoryId: string | null
  name: string
  description: string | null
  sku: string | null
  barcode: string | null
  price: number
  compareAtPrice: number | null
  cost: number | null
  trackInventory: boolean
  quantity: number
  lowStockAlert: number | null
  images: string[]
  displayOrder: number
  isActive: boolean
  isFeatured: boolean
  brand: string | null
  tags: string[]
  category?: ProductCategory | null
}

interface ProductMetrics {
  totalProducts: number
  totalValue: number
  lowStockCount: number
  outOfStockCount: number
  topSellingProducts: Product[]
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [metrics, setMetrics] = useState<ProductMetrics>({
    totalProducts: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    topSellingProducts: [],
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [savingProduct, setSavingProduct] = useState(false)

  // Form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    sku: '',
    barcode: '',
    price: '',
    compareAtPrice: '',
    cost: '',
    categoryId: '',
    brand: '',
    trackInventory: true,
    quantity: '0',
    lowStockAlert: '5',
    isActive: true,
    isFeatured: false,
    tags: [] as string[],
  })

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    displayOrder: '0',
    isActive: true,
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchMetrics()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/business/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products.map((p: Product) => ({
          ...p,
          price: Number(p.price),
          compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
          cost: p.cost ? Number(p.cost) : null,
        })))
      } else {
        toast.error('Failed to fetch products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/business/products/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/business/products/metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics({
          ...data,
          totalValue: Number(data.totalValue),
          topSellingProducts: data.topSellingProducts.map((p: Product) => ({
            ...p,
            price: Number(p.price),
          })),
        })
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) {
      toast.error('Please fill in required fields')
      return
    }

    setSavingProduct(true)
    try {
      const url = editingProduct 
        ? `/api/business/products/${editingProduct.id}`
        : '/api/business/products'
      
      const method = editingProduct ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price),
          compareAtPrice: productForm.compareAtPrice ? parseFloat(productForm.compareAtPrice) : null,
          cost: productForm.cost ? parseFloat(productForm.cost) : null,
          quantity: parseInt(productForm.quantity),
          lowStockAlert: productForm.lowStockAlert ? parseInt(productForm.lowStockAlert) : null,
          displayOrder: 0,
        }),
      })

      if (response.ok) {
        toast.success(editingProduct ? 'Product updated' : 'Product created')
        setShowProductDialog(false)
        resetProductForm()
        fetchProducts()
        fetchMetrics()
      } else {
        toast.error('Failed to save product')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Something went wrong')
    } finally {
      setSavingProduct(false)
    }
  }

  const handleSaveCategory = async () => {
    if (!categoryForm.name) {
      toast.error('Please enter a category name')
      return
    }

    try {
      const response = await fetch('/api/business/products/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...categoryForm,
          displayOrder: parseInt(categoryForm.displayOrder),
        }),
      })

      if (response.ok) {
        toast.success('Category created')
        setShowCategoryDialog(false)
        resetCategoryForm()
        fetchCategories()
      } else {
        toast.error('Failed to create category')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('Something went wrong')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      const response = await fetch(`/api/business/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Product deleted')
        fetchProducts()
        fetchMetrics()
      } else {
        toast.error('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Something went wrong')
    }
  }

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      sku: '',
      barcode: '',
      price: '',
      compareAtPrice: '',
      cost: '',
      categoryId: '',
      brand: '',
      trackInventory: true,
      quantity: '0',
      lowStockAlert: '5',
      isActive: true,
      isFeatured: false,
      tags: [],
    })
    setEditingProduct(null)
  }

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      displayOrder: '0',
      isActive: true,
    })
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      price: product.price.toString(),
      compareAtPrice: product.compareAtPrice?.toString() || '',
      cost: product.cost?.toString() || '',
      categoryId: product.categoryId || '',
      brand: product.brand || '',
      trackInventory: product.trackInventory,
      quantity: product.quantity.toString(),
      lowStockAlert: product.lowStockAlert?.toString() || '',
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      tags: product.tags,
    })
    setShowProductDialog(true)
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.barcode?.includes(searchQuery)
    
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory

    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">
          Manage your product inventory and track sales
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active in inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Inventory value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Products need restocking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Currently unavailable
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions and Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowCategoryDialog(true)}>
            <Tag className="h-4 w-4 mr-2" />
            Categories
          </Button>
          <Button onClick={() => setShowProductDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Products List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4">Product</th>
                  <th className="text-left p-4">SKU</th>
                  <th className="text-left p-4">Category</th>
                  <th className="text-right p-4">Price</th>
                  <th className="text-center p-4">Inventory</th>
                  <th className="text-center p-4">Status</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          {product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.brand && (
                            <p className="text-sm text-muted-foreground">{product.brand}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{product.sku || '-'}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{product.category?.name || '-'}</p>
                    </td>
                    <td className="p-4 text-right">
                      <div>
                        <p className="font-medium">${product.price.toFixed(2)}</p>
                        {product.compareAtPrice && (
                          <p className="text-sm text-muted-foreground line-through">
                            ${product.compareAtPrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {product.trackInventory ? (
                        <div>
                          <p className={`font-medium ${
                            product.quantity === 0 ? 'text-red-600' :
                            product.lowStockAlert && product.quantity <= product.lowStockAlert ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {product.quantity}
                          </p>
                          {product.lowStockAlert && product.quantity <= product.lowStockAlert && product.quantity > 0 && (
                            <p className="text-xs text-yellow-600">Low stock</p>
                          )}
                          {product.quantity === 0 && (
                            <p className="text-xs text-red-600">Out of stock</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Badge variant={product.isActive ? 'default' : 'outline'}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {product.isFeatured && (
                          <Badge variant="outline">Featured</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No products found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct 
                ? 'Update the product details below'
                : 'Fill in the details to create a new product'
              }
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing & Inventory</TabsTrigger>
              <TabsTrigger value="display">Display Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g., Moisturizing Hair Cream"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Product description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="e.g., HAIR-CRM-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={productForm.barcode}
                    onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                    placeholder="e.g., 1234567890123"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={productForm.categoryId}
                    onValueChange={(value) => setProductForm({ ...productForm, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    placeholder="e.g., Your Brand"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compareAtPrice">Compare at Price</Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    step="0.01"
                    value={productForm.compareAtPrice}
                    onChange={(e) => setProductForm({ ...productForm, compareAtPrice: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={productForm.cost}
                    onChange={(e) => setProductForm({ ...productForm, cost: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-gray-900">Track Inventory</Label>
                    <p className="text-sm text-gray-600">
                      Monitor stock levels for this product
                    </p>
                  </div>
                  <Switch
                    checked={productForm.trackInventory}
                    onCheckedChange={(checked) => 
                      setProductForm({ ...productForm, trackInventory: checked })
                    }
                  />
                </div>

                {productForm.trackInventory && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Current Stock</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={productForm.quantity}
                          onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lowStockAlert">Low Stock Alert</Label>
                        <Input
                          id="lowStockAlert"
                          type="number"
                          value={productForm.lowStockAlert}
                          onChange={(e) => setProductForm({ ...productForm, lowStockAlert: e.target.value })}
                          placeholder="5"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="display" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Product is available for purchase
                  </p>
                </div>
                <Switch
                  checked={productForm.isActive}
                  onCheckedChange={(checked) => 
                    setProductForm({ ...productForm, isActive: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Featured</Label>
                  <p className="text-sm text-muted-foreground">
                    Highlight this product on your store
                  </p>
                </div>
                <Switch
                  checked={productForm.isFeatured}
                  onCheckedChange={(checked) => 
                    setProductForm({ ...productForm, isFeatured: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Product Images</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop images or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Image upload coming soon
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowProductDialog(false)
              resetProductForm()
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveProduct} disabled={savingProduct}>
              {savingProduct ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                editingProduct ? 'Update Product' : 'Create Product'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>
              Create and organize product categories
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name *</Label>
              <Input
                id="categoryName"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="e.g., Hair Care"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryDescription">Description</Label>
              <Textarea
                id="categoryDescription"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Category description..."
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-900">Active</Label>
                <p className="text-sm text-gray-600">
                  Category is visible
                </p>
              </div>
              <Switch
                checked={categoryForm.isActive}
                onCheckedChange={(checked) => 
                  setCategoryForm({ ...categoryForm, isActive: checked })
                }
              />
            </div>

            {categories.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Existing Categories</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {categories.map(category => (
                      <div key={category.id} className="flex items-center justify-between p-2 rounded-lg border">
                        <span className="text-sm">{category.name}</span>
                        <Badge variant={category.isActive ? 'default' : 'outline'}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCategoryDialog(false)
              resetCategoryForm()
            }}>
              Close
            </Button>
            <Button onClick={handleSaveCategory}>
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}