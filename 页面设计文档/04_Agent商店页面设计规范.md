# Agent商店页面设计规范文档

## 1. 页面概述

### 1.1 页面职责
Agent商店页面是AI Agent市场的核心变现场景，负责：
- 展示经过AI专家改造升级的优质创意作品
- 提供多维度筛选和搜索功能
- 处理创意作品的购买交易流程
- 展示Agent专家的作品集和专业能力

### 1.2 目标用户
- **创意购买者**：寻找高质量创意解决方案的企业和个人
- **作品收藏者**：关注特定Agent专家的忠实用户
- **投资者**：寻找有商业价值创意的投资人
- **学习者**：希望学习优秀创意案例的用户

### 1.3 关键指标
- 商品浏览转化率 > 12%
- 平均客单价 > 150积分
- 用户停留时间 > 8分钟
- 复购率 > 25%

## 2. 前端设计规范

### 2.1 页面结构

```tsx
// pages/store/index.tsx
import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { StoreHeader } from '@/components/store/StoreHeader';
import { ProductFilters } from '@/components/store/ProductFilters';
import { ProductGrid } from '@/components/store/ProductGrid';
import { FeaturedProducts } from '@/components/store/FeaturedProducts';
import { AgentShowcase } from '@/components/store/AgentShowcase';
import { QuickPurchaseModal } from '@/components/store/QuickPurchaseModal';
import { CartSidebar } from '@/components/store/CartSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';

interface StorePageProps {
  products: Product[];
  categories: Category[];
  agents: Agent[];
  featuredProducts: Product[];
  userWallet: UserWallet;
}

export default function StorePage({
  products,
  categories,
  agents,
  featuredProducts,
  userWallet
}: StorePageProps) {
  const { user } = useAuth();
  const { cart, addToCart, removeFromCart } = useCart();
  const router = useRouter();
  
  const [filters, setFilters] = useState<ProductFilters>({
    category: '',
    agents: [],
    priceRange: [0, 1000],
    rating: 0,
    sortBy: 'latest'
  });
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(false);

  // 处理筛选器变化
  const handleFiltersChange = useCallback((newFilters: ProductFilters) => {
    setFilters(newFilters);
    
    // 更新URL参数
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 0) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.set(key, value.toString());
        }
      }
    });
    
    router.push(`/store?${params.toString()}`, undefined, { shallow: true });
  }, [router]);

  // 处理快速购买
  const handleQuickPurchase = useCallback(async (product: Product) => {
    if (!user) {
      router.push('/auth/login?redirect=/store');
      return;
    }

    if (userWallet.balance < product.price) {
      showInsufficientFundsModal();
      return;
    }

    setSelectedProduct(product);
  }, [user, userWallet, router]);

  return (
    <div className="store-page min-h-screen bg-gray-50">
      {/* 商店头部 */}
      <StoreHeader 
        userWallet={userWallet}
        cartItemCount={cart.items.length}
        onCartClick={() => setShowCart(true)}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* 精选商品区域 */}
        <FeaturedProducts 
          products={featuredProducts}
          onProductClick={handleQuickPurchase}
          className="mb-12"
        />
        
        {/* Agent专家展示 */}
        <AgentShowcase 
          agents={agents}
          onAgentClick={(agentId) => setFilters({...filters, agents: [agentId]})}
          className="mb-12"
        />
        
        <div className="grid lg:grid-cols-4 gap-8">
          {/* 左侧筛选器 */}
          <div className="lg:col-span-1">
            <ProductFilters
              categories={categories}
              agents={agents}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              resultCount={filteredProducts.length}
            />
          </div>
          
          {/* 右侧商品网格 */}
          <div className="lg:col-span-3">
            <ProductGrid
              products={filteredProducts}
              loading={isLoading}
              onProductClick={handleQuickPurchase}
              onAddToCart={addToCart}
              onRemoveFromCart={removeFromCart}
              cartItems={cart.items}
            />
          </div>
        </div>
      </div>
      
      {/* 购物车侧边栏 */}
      <CartSidebar 
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        userWallet={userWallet}
        onUpdateCart={updateCart}
        onCheckout={handleCheckout}
      />
      
      {/* 快速购买模态框 */}
      {selectedProduct && (
        <QuickPurchaseModal
          product={selectedProduct}
          userWallet={userWallet}
          onClose={() => setSelectedProduct(null)}
          onPurchase={handlePurchaseComplete}
        />
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  const session = await getSession(context);
  
  try {
    const [products, categories, agents, featuredProducts, userWallet] = await Promise.all([
      fetchProducts(query),
      fetchCategories(),
      fetchAgents(),
      fetchFeaturedProducts(),
      session ? fetchUserWallet(session.user.id) : null
    ]);

    return {
      props: {
        products,
        categories,
        agents,
        featuredProducts,
        userWallet: userWallet || { balance: 0, transactions: [] }
      }
    };
  } catch (error) {
    console.error('Failed to load store page:', error);
    return { notFound: true };
  }
};
```

### 2.2 核心组件设计

#### 2.2.1 商品卡片组件

```tsx
// components/store/ProductCard.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProductImage } from './ProductImage';
import { AgentBadge } from './AgentBadge';
import { PriceDisplay } from './PriceDisplay';
import { RatingDisplay } from './RatingDisplay';
import { ActionButtons } from './ActionButtons';

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  isInCart: boolean;
  onQuickView: () => void;
  onAddToCart: () => void;
  onPurchase: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode,
  isInCart,
  onQuickView,
  onAddToCart,
  onPurchase
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        product-card bg-white rounded-lg shadow-sm border transition-all duration-300
        ${viewMode === 'grid' ? 'flex flex-col' : 'flex flex-row'}
        ${isHovered ? 'shadow-lg transform -translate-y-1' : ''}
        hover:border-blue-300 cursor-pointer
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onQuickView}
    >
      {/* 商品图片 */}
      <div className={`relative ${viewMode === 'grid' ? 'aspect-video' : 'w-48 h-32'}`}>
        <ProductImage
          src={product.coverImage}
          alt={product.title}
          className="w-full h-full object-cover rounded-t-lg"
          priority={product.isFeatured}
        />
        
        {/* 商品标签 */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFeatured && (
            <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded">
              精选
            </span>
          )}
          {product.isNew && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">
              新品
            </span>
          )}
          {product.discount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">
              {product.discount}% OFF
            </span>
          )}
        </div>
        
        {/* 快速操作按钮 */}
        <div className={`
          absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center
          transition-opacity duration-300
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}>
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView();
              }}
              className="px-3 py-1 bg-white text-gray-800 rounded text-sm hover:bg-gray-100"
            >
              快速预览
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              disabled={isInCart}
            >
              {isInCart ? '已添加' : '加入购物车'}
            </button>
          </div>
        </div>
      </div>
      
      {/* 商品信息 */}
      <div className="p-4 flex-1">
        {/* Agent标识 */}
        <AgentBadge 
          agent={product.agent}
          className="mb-2"
        />
        
        {/* 商品标题 */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.title}
        </h3>
        
        {/* 商品描述 */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {product.description}
        </p>
        
        {/* 评分和统计 */}
        <div className="flex items-center justify-between mb-3">
          <RatingDisplay 
            rating={product.rating}
            reviewCount={product.reviewCount}
            size="sm"
          />
          <div className="text-xs text-gray-500">
            {product.purchaseCount} 人购买
          </div>
        </div>
        
        {/* 价格和操作 */}
        <div className="flex items-center justify-between">
          <PriceDisplay
            price={product.price}
            originalPrice={product.originalPrice}
            discount={product.discount}
          />
          
          <ActionButtons
            product={product}
            isInCart={isInCart}
            onAddToCart={onAddToCart}
            onPurchase={onPurchase}
            size="sm"
          />
        </div>
        
        {/* 商品标签 */}
        <div className="flex flex-wrap gap-1 mt-3">
          {product.tags.slice(0, 3).map(tag => (
            <span 
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
            >
              {tag}
            </span>
          ))}
          {product.tags.length > 3 && (
            <span className="text-xs text-gray-400">
              +{product.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
```

#### 2.2.2 高级筛选器组件

```tsx
// components/store/ProductFilters.tsx
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PriceRangeSlider } from '@/components/ui/PriceRangeSlider';
import { CheckboxGroup } from '@/components/ui/CheckboxGroup';
import { RatingFilter } from '@/components/ui/RatingFilter';

interface ProductFiltersProps {
  categories: Category[];
  agents: Agent[];
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  resultCount: number;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  agents,
  filters,
  onFiltersChange,
  resultCount
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['category', 'agents', 'price', 'rating'])
  );

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  const updateFilter = useCallback((key: keyof ProductFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  }, [filters, onFiltersChange]);

  const clearAllFilters = useCallback(() => {
    onFiltersChange({
      category: '',
      agents: [],
      priceRange: [0, 1000],
      rating: 0,
      sortBy: 'latest'
    });
  }, [onFiltersChange]);

  const hasActiveFilters = filters.category || filters.agents.length > 0 || 
                          filters.rating > 0 || filters.priceRange[0] > 0 || 
                          filters.priceRange[1] < 1000;

  return (
    <div className="product-filters bg-white rounded-lg shadow-sm border p-6">
      {/* 筛选器头部 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">筛选器</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            清除所有
          </button>
        )}
      </div>

      {/* 结果计数 */}
      <div className="mb-6 p-3 bg-blue-50 rounded-lg">
        <span className="text-sm text-blue-800">
          找到 <strong>{resultCount}</strong> 个商品
        </span>
      </div>

      {/* 类别筛选 */}
      <FilterSection
        title="创意类别"
        isExpanded={expandedSections.has('category')}
        onToggle={() => toggleSection('category')}
      >
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="category"
              value=""
              checked={filters.category === ''}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">全部类别</span>
          </label>
          {categories.map(category => (
            <label key={category.id} className="flex items-center">
              <input
                type="radio"
                name="category"
                value={category.id}
                checked={filters.category === category.id}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">{category.name}</span>
              <span className="ml-auto text-xs text-gray-500">
                ({category.productCount})
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Agent筛选 */}
      <FilterSection
        title="AI专家"
        isExpanded={expandedSections.has('agents')}
        onToggle={() => toggleSection('agents')}
      >
        <div className="space-y-2">
          {agents.map(agent => (
            <label key={agent.id} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.agents.includes(agent.id)}
                onChange={(e) => {
                  const newAgents = e.target.checked
                    ? [...filters.agents, agent.id]
                    : filters.agents.filter(id => id !== agent.id);
                  updateFilter('agents', newAgents);
                }}
                className="mr-2"
              />
              <div className="flex items-center flex-1">
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-6 h-6 rounded-full mr-2"
                />
                <span className="text-sm">{agent.name}</span>
                <span className="ml-auto text-xs text-gray-500">
                  ({agent.productCount})
                </span>
              </div>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* 价格范围 */}
      <FilterSection
        title="价格范围"
        isExpanded={expandedSections.has('price')}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-4">
          <PriceRangeSlider
            min={0}
            max={1000}
            value={filters.priceRange}
            onChange={(range) => updateFilter('priceRange', range)}
            formatLabel={(value) => `${value}积分`}
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{filters.priceRange[0]}积分</span>
            <span>{filters.priceRange[1]}积分</span>
          </div>
        </div>
      </FilterSection>

      {/* 评分筛选 */}
      <FilterSection
        title="用户评分"
        isExpanded={expandedSections.has('rating')}
        onToggle={() => toggleSection('rating')}
      >
        <RatingFilter
          value={filters.rating}
          onChange={(rating) => updateFilter('rating', rating)}
        />
      </FilterSection>

      {/* 排序方式 */}
      <FilterSection
        title="排序方式"
        isExpanded={expandedSections.has('sort')}
        onToggle={() => toggleSection('sort')}
      >
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          className="w-full p-2 border rounded-lg text-sm"
        >
          <option value="latest">最新发布</option>
          <option value="popular">最受欢迎</option>
          <option value="price-low">价格由低到高</option>
          <option value="price-high">价格由高到低</option>
          <option value="rating">评分最高</option>
          <option value="sales">销量最高</option>
        </select>
      </FilterSection>
    </div>
  );
};

// 可折叠筛选区间组件
const FilterSection: React.FC<{
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, isExpanded, onToggle, children }) => (
  <div className="filter-section mb-6 border-b border-gray-200 pb-6 last:border-b-0">
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full mb-3 text-left"
    >
      <h4 className="font-medium text-gray-900">{title}</h4>
      <motion.div
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDownIcon className="w-4 h-4 text-gray-500" />
      </motion.div>
    </button>
    
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
```

### 2.3 数据类型定义

```typescript
// types/store.ts
export interface Product {
  id: string;
  title: string;
  description: string;
  content: string;
  coverImage: string;
  images: string[];
  category: string;
  tags: string[];
  agent: {
    id: string;
    name: string;
    avatar: string;
  };
  originalIdea: {
    id: string;
    title: string;
    author: {
      id: string;
      username: string;
    };
  };
  price: number;
  originalPrice?: number;
  discount: number;
  rating: number;
  reviewCount: number;
  purchaseCount: number;
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
  isNew: boolean;
  status: 'active' | 'sold_out' | 'archived';
  previewContent?: string;
  downloadableFiles?: {
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  license: {
    type: 'commercial' | 'personal' | 'extended';
    description: string;
  };
}

export interface ProductFilters {
  category: string;
  agents: string[];
  priceRange: [number, number];
  rating: number;
  sortBy: 'latest' | 'popular' | 'price-low' | 'price-high' | 'rating' | 'sales';
  search?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  icon: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
}

export interface UserWallet {
  balance: number;
  pendingBalance: number;
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'sale' | 'refund' | 'deposit';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  relatedProductId?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'alipay' | 'wechat' | 'card' | 'points';
  name: string;
  isDefault: boolean;
  metadata?: Record<string, any>;
}
```

## 3. 后端API规范

### 3.1 API端点定义

#### 3.1.1 获取商品列表

```typescript
// GET /api/store/products?category=&agents=&priceMin=&priceMax=&rating=&sort=&page=&limit=
export interface ProductListRequest {
  category?: string;
  agents?: string[];
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  sortBy?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductListResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters: {
      appliedFilters: ProductFilters;
      availableFilters: {
        categories: Category[];
        agents: Agent[];
        priceRange: [number, number];
        maxRating: number;
      };
    };
  };
}

// 实现示例
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getSession(request);
    
    const filters = {
      category: searchParams.get('category') || '',
      agents: searchParams.getAll('agents'),
      priceMin: parseInt(searchParams.get('priceMin') || '0'),
      priceMax: parseInt(searchParams.get('priceMax') || '1000'),
      rating: parseFloat(searchParams.get('rating') || '0'),
      sortBy: searchParams.get('sort') || 'latest',
      search: searchParams.get('search') || '',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20')
    };

    // 构建查询条件
    const whereConditions = [];
    const orderConditions = [];

    // 类别筛选
    if (filters.category) {
      whereConditions.push({ categoryId: filters.category });
    }

    // Agent筛选
    if (filters.agents.length > 0) {
      whereConditions.push({ agentId: { in: filters.agents } });
    }

    // 价格范围
    whereConditions.push({
      price: {
        gte: filters.priceMin,
        lte: filters.priceMax
      }
    });

    // 评分筛选
    if (filters.rating > 0) {
      whereConditions.push({ rating: { gte: filters.rating } });
    }

    // 搜索
    if (filters.search) {
      whereConditions.push({
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { tags: { has: filters.search } }
        ]
      });
    }

    // 排序
    switch (filters.sortBy) {
      case 'popular':
        orderConditions.push({ purchaseCount: 'desc' });
        break;
      case 'price-low':
        orderConditions.push({ price: 'asc' });
        break;
      case 'price-high':
        orderConditions.push({ price: 'desc' });
        break;
      case 'rating':
        orderConditions.push({ rating: 'desc' });
        break;
      case 'sales':
        orderConditions.push({ purchaseCount: 'desc' });
        break;
      default:
        orderConditions.push({ createdAt: 'desc' });
    }

    // 执行查询
    const [products, total, categories, agents] = await Promise.all([
      prisma.product.findMany({
        where: { AND: whereConditions, status: 'active' },
        include: {
          agent: true,
          category: true,
          originalIdea: {
            include: { author: true }
          },
          _count: {
            select: { reviews: true, purchases: true }
          }
        },
        orderBy: orderConditions,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      prisma.product.count({
        where: { AND: whereConditions, status: 'active' }
      }),
      prisma.category.findMany({
        include: { _count: { select: { products: true } } }
      }),
      prisma.agent.findMany({
        include: { _count: { select: { products: true } } }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products: products.map(formatProduct),
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit),
          hasNext: filters.page * filters.limit < total,
          hasPrev: filters.page > 1
        },
        filters: {
          appliedFilters: filters,
          availableFilters: {
            categories,
            agents,
            priceRange: await getPriceRange(),
            maxRating: 5
          }
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
```

#### 3.1.2 购物车管理

```typescript
// POST /api/store/cart/add
export interface AddToCartRequest {
  productId: string;
  quantity?: number;
}

export interface AddToCartResponse {
  success: boolean;
  data?: {
    cartItem: CartItem;
    cart: Cart;
  };
  error?: string;
}

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productId, quantity = 1 }: AddToCartRequest = await request.json();

    // 验证商品
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { agent: true }
    });

    if (!product || product.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Product not available' },
        { status: 404 }
      );
    }

    // 检查用户是否已购买此商品
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        productId: productId,
        status: 'completed'
      }
    });

    if (existingPurchase) {
      return NextResponse.json(
        { success: false, error: 'Product already purchased' },
        { status: 400 }
      );
    }

    // 检查购物车中是否已有此商品
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId: session.user.id,
        productId: productId
      }
    });

    let cartItem;
    if (existingCartItem) {
      // 更新数量
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
        include: { product: { include: { agent: true } } }
      });
    } else {
      // 创建新的购物车项
      cartItem = await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId: productId,
          quantity: quantity
        },
        include: { product: { include: { agent: true } } }
      });
    }

    // 获取更新后的购物车
    const cart = await getUpdatedCart(session.user.id);

    return NextResponse.json({
      success: true,
      data: { cartItem, cart }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

// GET /api/store/cart
export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const cart = await getUpdatedCart(session.user.id);

    return NextResponse.json({
      success: true,
      data: cart
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}
```

#### 3.1.3 购买处理

```typescript
// POST /api/store/purchase
export interface PurchaseRequest {
  items: {
    productId: string;
    quantity: number;
  }[];
  paymentMethod: string;
  useWalletBalance: boolean;
}

export interface PurchaseResponse {
  success: boolean;
  data?: {
    orderId: string;
    totalAmount: number;
    paymentStatus: string;
    downloadLinks?: string[];
  };
  error?: string;
}

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { items, paymentMethod, useWalletBalance }: PurchaseRequest = await request.json();

    // 开始数据库事务
    const result = await prisma.$transaction(async (tx) => {
      // 验证所有商品
      const products = await Promise.all(
        items.map(async (item) => {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            include: { agent: true }
          });
          
          if (!product || product.status !== 'active') {
            throw new Error(`Product ${item.productId} not available`);
          }
          
          return { ...product, purchaseQuantity: item.quantity };
        })
      );

      // 计算总金额
      const totalAmount = products.reduce(
        (sum, product) => sum + (product.price * product.purchaseQuantity),
        0
      );

      // 检查用户余额
      const userWallet = await tx.userWallet.findUnique({
        where: { userId: session.user.id }
      });

      if (useWalletBalance && (!userWallet || userWallet.balance < totalAmount)) {
        throw new Error('Insufficient wallet balance');
      }

      // 创建订单
      const order = await tx.order.create({
        data: {
          userId: session.user.id,
          totalAmount,
          paymentMethod,
          status: 'pending',
          items: {
            create: products.map(product => ({
              productId: product.id,
              quantity: product.purchaseQuantity,
              price: product.price,
              agentId: product.agentId
            }))
          }
        },
        include: { items: true }
      });

      // 处理钱包支付
      if (useWalletBalance) {
        await tx.userWallet.update({
          where: { userId: session.user.id },
          data: { balance: { decrement: totalAmount } }
        });

        // 创建交易记录
        await tx.transaction.create({
          data: {
            userId: session.user.id,
            type: 'purchase',
            amount: -totalAmount,
            description: `Purchase order ${order.id}`,
            status: 'completed',
            orderId: order.id
          }
        });

        // 分配收益给Agent
        await Promise.all(
          products.map(async (product) => {
            const agentEarning = product.price * product.purchaseQuantity * 0.7; // 70%分成
            
            await tx.agentEarning.create({
              data: {
                agentId: product.agentId,
                amount: agentEarning,
                source: 'product_sale',
                productId: product.id,
                orderId: order.id
              }
            });
          })
        );

        // 更新商品销量
        await Promise.all(
          products.map(product =>
            tx.product.update({
              where: { id: product.id },
              data: { purchaseCount: { increment: product.purchaseQuantity } }
            })
          )
        );

        // 完成订单
        await tx.order.update({
          where: { id: order.id },
          data: { 
            status: 'completed',
            completedAt: new Date()
          }
        });

        // 清空购物车
        await tx.cartItem.deleteMany({
          where: {
            userId: session.user.id,
            productId: { in: items.map(item => item.productId) }
          }
        });
      }

      return order;
    });

    // 生成下载链接
    const downloadLinks = await generateDownloadLinks(result.id, session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        orderId: result.id,
        totalAmount: result.totalAmount,
        paymentStatus: result.status,
        downloadLinks
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
```

### 3.2 商品管理服务

```typescript
// lib/store/ProductManager.ts
export class ProductManager {
  private prisma: PrismaClient;
  private searchEngine: SearchEngine;
  private imageProcessor: ImageProcessor;

  constructor() {
    this.prisma = new PrismaClient();
    this.searchEngine = new SearchEngine();
    this.imageProcessor = new ImageProcessor();
  }

  // 创建商品
  async createProduct(agentId: string, ideaId: string, productData: CreateProductData) {
    try {
      // 处理商品图片
      const processedImages = await this.imageProcessor.processProductImages(
        productData.images
      );

      // 生成商品内容
      const enhancedContent = await this.generateEnhancedContent(
        agentId,
        ideaId,
        productData.content
      );

      // 创建商品记录
      const product = await this.prisma.product.create({
        data: {
          title: productData.title,
          description: productData.description,
          content: enhancedContent,
          coverImage: processedImages.cover,
          images: processedImages.gallery,
          categoryId: productData.categoryId,
          tags: productData.tags,
          agentId,
          originalIdeaId: ideaId,
          price: productData.price,
          license: productData.license,
          status: 'active'
        },
        include: {
          agent: true,
          category: true,
          originalIdea: { include: { author: true } }
        }
      });

      // 添加到搜索引擎
      await this.searchEngine.indexProduct(product);

      // 通知相关用户
      await this.notifyProductCreated(product);

      return product;
    } catch (error) {
      console.error('Failed to create product:', error);
      throw new Error('Product creation failed');
    }
  }

  // 智能推荐
  async getRecommendedProducts(userId: string, limit: number = 10) {
    try {
      // 获取用户画像
      const userProfile = await this.getUserProfile(userId);
      
      // 获取用户历史行为
      const userBehavior = await this.getUserBehavior(userId);
      
      // 基于协同过滤的推荐
      const collaborativeRecommendations = await this.getCollaborativeRecommendations(
        userId,
        userBehavior
      );
      
      // 基于内容的推荐
      const contentBasedRecommendations = await this.getContentBasedRecommendations(
        userProfile,
        userBehavior
      );
      
      // 热门商品推荐
      const trendingRecommendations = await this.getTrendingProducts();
      
      // 混合推荐算法
      const recommendations = this.hybridRecommendation([
        { source: 'collaborative', items: collaborativeRecommendations, weight: 0.4 },
        { source: 'content', items: contentBasedRecommendations, weight: 0.4 },
        { source: 'trending', items: trendingRecommendations, weight: 0.2 }
      ]);
      
      return recommendations.slice(0, limit);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      // 降级到随机推荐
      return this.getRandomProducts(limit);
    }
  }

  // 商品搜索
  async searchProducts(query: string, filters: ProductFilters, userId?: string) {
    try {
      // 使用Elasticsearch进行全文搜索
      const searchResults = await this.searchEngine.search({
        query,
        filters,
        highlight: true,
        facets: ['category', 'agent', 'price', 'rating']
      });

      // 记录搜索行为
      if (userId) {
        await this.recordSearchBehavior(userId, query, filters, searchResults.total);
      }

      return {
        products: searchResults.hits,
        total: searchResults.total,
        facets: searchResults.facets,
        suggestions: await this.getSearchSuggestions(query)
      };
    } catch (error) {
      console.error('Search failed:', error);
      // 降级到数据库搜索
      return this.fallbackDatabaseSearch(query, filters);
    }
  }

  // 商品分析
  async analyzeProductPerformance(productId: string) {
    const [sales, views, reviews, competitors] = await Promise.all([
      this.getSalesAnalytics(productId),
      this.getViewAnalytics(productId),
      this.getReviewAnalytics(productId),
      this.getCompetitorAnalysis(productId)
    ]);

    return {
      sales: {
        total: sales.totalSales,
        trend: sales.salesTrend,
        revenue: sales.totalRevenue
      },
      engagement: {
        views: views.totalViews,
        conversionRate: sales.totalSales / views.totalViews,
        averageSessionTime: views.averageSessionTime
      },
      feedback: {
        averageRating: reviews.averageRating,
        sentiment: reviews.sentimentAnalysis,
        commonIssues: reviews.commonIssues
      },
      market: {
        position: competitors.marketPosition,
        priceCompetitiveness: competitors.priceAnalysis,
        uniqueSellingPoints: competitors.differentiators
      }
    };
  }
}
```

## 4. 移动端适配

### 4.1 移动端商店界面

```tsx
// components/store/MobileStoreInterface.tsx
export const MobileStoreInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="mobile-store h-full flex flex-col">
      {/* 移动端头部 */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <h1 className="text-lg font-semibold">创意商店</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowFilters(true)}
            className="p-2 bg-gray-100 rounded-lg"
          >
            <FilterIcon className="w-5 h-5" />
          </button>
          <CartButton />
        </div>
      </div>

      {/* 标签导航 */}
      <div className="flex bg-white border-b">
        <TabButton
          active={activeTab === 'products'}
          onClick={() => setActiveTab('products')}
        >
          商品
        </TabButton>
        <TabButton
          active={activeTab === 'categories'}
          onClick={() => setActiveTab('categories')}
        >
          分类
        </TabButton>
        <TabButton
          active={activeTab === 'agents'}
          onClick={() => setActiveTab('agents')}
        >
          专家
        </TabButton>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'products' && <MobileProductGrid />}
        {activeTab === 'categories' && <MobileCategoryGrid />}
        {activeTab === 'agents' && <MobileAgentGrid />}
      </div>

      {/* 筛选器抽屉 */}
      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </div>
  );
};
```

## 5. 性能优化

### 5.1 商品图片优化

```typescript
// utils/imageOptimization.ts
export class ImageOptimizer {
  private cdn: CDNService;
  private cache: ImageCache;

  constructor() {
    this.cdn = new CDNService();
    this.cache = new ImageCache();
  }

  // 生成响应式图片URL
  generateResponsiveImageUrls(originalUrl: string) {
    const sizes = [400, 800, 1200, 1600];
    const formats = ['webp', 'jpg'];
    
    return {
      srcSet: sizes.flatMap(size =>
        formats.map(format => ({
          url: `${originalUrl}?w=${size}&f=${format}&q=80`,
          size,
          format,
          descriptor: `${size}w`
        }))
      ),
      placeholder: `${originalUrl}?w=50&q=10&blur=10`,
      sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
    };
  }

  // 智能图片加载
  async loadImageIntelligently(url: string, priority: boolean = false) {
    // 检查缓存
    const cachedImage = await this.cache.get(url);
    if (cachedImage) return cachedImage;

    // 检测网络状况
    const connection = (navigator as any).connection;
    const isSlowNetwork = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';

    // 根据网络状况选择质量
    const quality = isSlowNetwork ? 60 : 80;
    const optimizedUrl = `${url}?q=${quality}`;

    // 预加载关键图片
    if (priority) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = optimizedUrl;
      document.head.appendChild(link);
    }

    return optimizedUrl;
  }
}
```

### 5.2 搜索优化

```typescript
// lib/search/SearchOptimizer.ts
export class SearchOptimizer {
  private elasticsearch: ElasticsearchClient;
  private searchCache: SearchCache;
  private analytics: SearchAnalytics;

  constructor() {
    this.elasticsearch = new ElasticsearchClient();
    this.searchCache = new SearchCache();
    this.analytics = new SearchAnalytics();
  }

  // 智能搜索建议
  async getSearchSuggestions(query: string, limit: number = 5) {
    const cacheKey = `suggestions:${query}`;
    let suggestions = await this.searchCache.get(cacheKey);

    if (!suggestions) {
      suggestions = await this.elasticsearch.suggest({
        index: 'products',
        body: {
          suggestions: {
            text: query,
            completion: {
              field: 'suggest',
              size: limit,
              contexts: {
                category: ['active']
              }
            }
          }
        }
      });

      await this.searchCache.set(cacheKey, suggestions, '1h');
    }

    return suggestions;
  }

  // 搜索结果优化
  async optimizeSearchResults(results: SearchResult[], userId?: string) {
    // 个性化排序
    if (userId) {
      const userPreferences = await this.getUserPreferences(userId);
      results = this.personalizeResults(results, userPreferences);
    }

    // 多样性优化
    results = this.diversifyResults(results);

    // 质量过滤
    results = this.filterByQuality(results);

    return results;
  }

  // 搜索性能监控
  async monitorSearchPerformance(query: string, results: SearchResult[], responseTime: number) {
    await this.analytics.record({
      query,
      resultCount: results.length,
      responseTime,
      timestamp: new Date(),
      hasResults: results.length > 0
    });

    // 如果响应时间过长，触发优化
    if (responseTime > 1000) {
      await this.triggerSearchOptimization(query);
    }
  }
}
```

## 6. 总结

这个Agent商店页面设计文档提供了完整的前后端实现规范，包括：

### 核心功能特性
1. **完善的商品展示系统** - 支持多种视图模式和丰富的商品信息
2. **智能筛选和搜索** - 多维度筛选器和全文搜索功能
3. **购物车和支付** - 完整的购买流程和支付系统
4. **个性化推荐** - 基于用户行为的智能推荐算法
5. **移动端优化** - 完整的移动端界面适配

### 技术亮点
- **响应式设计**：桌面端和移动端的完美适配
- **智能推荐系统**：协同过滤 + 内容推荐的混合算法
- **全文搜索**：基于Elasticsearch的高性能搜索
- **图片优化**：CDN + 响应式图片 + 智能加载
- **缓存策略**：多层缓存提升性能

### 用户体验优化
- **流畅的筛选体验**：实时筛选结果更新
- **智能搜索建议**：自动补全和搜索建议
- **快速购买流程**：一键购买和购物车管理
- **个性化推荐**：基于用户喜好的商品推荐

这个设计确保了Agent商店能够提供优秀的商品浏览和购买体验，支持平台的商业变现目标。

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"activeForm": "\u8bbe\u8ba1\u9996\u9875\u8be6\u7ec6\u89c4\u8303\u6587\u6863", "content": "\u8bbe\u8ba1\u9996\u9875\u8be6\u7ec6\u89c4\u8303\u6587\u6863", "status": "completed"}, {"activeForm": "\u8bbe\u8ba1\u521b\u610f\u63d0\u4ea4\u9875\u9762\u6587\u6863", "content": "\u8bbe\u8ba1\u521b\u610f\u63d0\u4ea4\u9875\u9762\u6587\u6863", "status": "completed"}, {"activeForm": "\u8bbe\u8ba1\u5b9e\u65f6\u8ba8\u8bba\u9875\u9762\u6587\u6863", "content": "\u8bbe\u8ba1\u5b9e\u65f6\u8ba8\u8bba\u9875\u9762\u6587\u6863", "status": "completed"}, {"activeForm": "\u8bbe\u8ba1Agent\u5546\u5e97\u9875\u9762\u6587\u6863", "content": "\u8bbe\u8ba1Agent\u5546\u5e97\u9875\u9762\u6587\u6863", "status": "completed"}, {"activeForm": "\u8bbe\u8ba1\u7528\u6237\u4e2a\u4eba\u4e2d\u5fc3\u6587\u6863", "content": "\u8bbe\u8ba1\u7528\u6237\u4e2a\u4eba\u4e2d\u5fc3\u6587\u6863", "status": "in_progress"}, {"activeForm": "\u6574\u7406API\u63a5\u53e3\u89c4\u8303\u6587\u6863", "content": "\u6574\u7406API\u63a5\u53e3\u89c4\u8303\u6587\u6863", "status": "pending"}]