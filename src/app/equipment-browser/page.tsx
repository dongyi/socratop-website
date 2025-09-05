'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/lib/supabase';
import Header from '@/components/Header';
import { 
  Search, 
  Filter,
  Star,
  StarHalf,
  Plus,
  Grid,
  List,
  ChevronDown,
  MessageSquare,
  // Users,
  Package,
  Loader,
  Eye,
  Check
} from 'lucide-react';
import Link from 'next/link';

interface Brand {
  id: string;
  name: string;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Equipment {
  id: string;
  name: string;
  description?: string;
  msrp_price?: number;
  brand_id: string;
  category_id: string;
  rating?: number; // SKU 原始评分
  image_urls?: string[]; // 装备图片列表
  brands?: Brand;
  categories?: Category;
  // 评分信息
  average_rating?: number;
  review_count?: number;
  rating_distribution?: Record<string, number>;
}

type SortOption = 'name' | 'price-low' | 'price-high' | 'rating-high' | 'rating-low' | 'reviews-most';
type ViewMode = 'grid' | 'list';

const EquipmentBrowser = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // 筛选和搜索状态
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState(''); // 用于输入框的即时更新
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('rating-high');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // 无限滚动状态
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  // 跟踪添加装备的状态
  const [addingEquipment, setAddingEquipment] = useState<Set<string>>(new Set());
  const [addedEquipment, setAddedEquipment] = useState<Set<string>>(new Set());
  
  // 每页加载数量
  const PAGE_SIZE = 20;

  // 加载基础数据
  const loadBrandsAndCategories = useCallback(async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      const headers = {
        'apikey': supabaseAnonKey!,
        'Content-Type': 'application/json',
      };

      const [brandsResponse, categoriesResponse] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/brands?select=*&order=name`, { headers }),
        fetch(`${supabaseUrl}/rest/v1/categories?select=*&order=name`, { headers })
      ]);

      if (brandsResponse.ok) {
        const brandsData = await brandsResponse.json();
        setBrands(brandsData || []);
      }

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData || []);
      }
    } catch (error) {
      console.error('加载基础数据失败:', error);
    }
  }, []);


  // 构建排序查询
  const getSortQuery = useCallback(() => {
    switch (sortBy) {
      case 'name':
        return 'name.asc';
      case 'price-low':
        return 'msrp_price.asc.nullslast';
      case 'price-high':
        return 'msrp_price.desc.nullsfirst';
      default:
        return 'name.asc'; // 默认按名称排序，评分排序在客户端处理
    }
  }, [sortBy]);

  // 加载装备数据（支持分页）
  const loadEquipment = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    if (pageNum === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      const headers = {
        'apikey': supabaseAnonKey!,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact', // 获取总数
      };

      // 构建查询URL
      let query = `${supabaseUrl}/rest/v1/skus?select=id,name,description,msrp_price,brand_id,category_id,rating,image_urls,brands:brand_id(id,name),categories:category_id(id,name)`;
      
      // 添加筛选条件
      const filters: string[] = [];
      if (selectedBrandId) {
        filters.push(`brand_id=eq.${selectedBrandId}`);
      }
      if (selectedCategoryId) {
        filters.push(`category_id=eq.${selectedCategoryId}`);
      }
      if (searchQuery.trim()) {
        // 搜索名称和品牌
        filters.push(`or=(name.ilike.*${searchQuery.trim()}*,brands.name.ilike.*${searchQuery.trim()}*)`);
      }
      
      if (filters.length > 0) {
        query += `&${filters.join('&')}`;
      }

      // 添加排序
      query += `&order=${getSortQuery()}`;
      
      // 添加分页
      const offset = pageNum * PAGE_SIZE;
      query += `&limit=${PAGE_SIZE}&offset=${offset}`;

      const response = await fetch(query, { headers });
      
      if (response.ok) {
        const equipmentData = await response.json();
        
        // 获取总数
        const contentRange = response.headers.get('content-range');
        const total = contentRange ? parseInt(contentRange.split('/')[1]) : equipmentData.length;
        setTotalCount(total);
        
        // 检查是否还有更多数据
        const newHasMore = offset + equipmentData.length < total;
        setHasMore(newHasMore);
        
        // 将百分制 rating 转换为 5 星制
        const equipmentWithRatings = equipmentData.map((item: Equipment) => ({
          ...item,
          average_rating: item.rating ? (item.rating / 100) * 5 : 0,
          review_count: 0, // SKU 表没有评论数量，暂时设为 0
          rating_distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
        }));
        
        if (append) {
          setEquipment(prev => [...prev, ...equipmentWithRatings]);
        } else {
          setEquipment(equipmentWithRatings);
        }
      }
    } catch (error) {
      console.error('加载装备数据失败:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedBrandId, selectedCategoryId, searchQuery, getSortQuery]);

  // 加载更多数据
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadEquipment(nextPage, true);
    }
  }, [loadEquipment, page, loadingMore, hasMore]);

  // 重置并重新加载
  const resetAndReload = useCallback(() => {
    setPage(0);
    setHasMore(true);
    setEquipment([]);
    loadEquipment(0, false);
  }, [loadEquipment]);

  // 用独立的effect来处理resetAndReload的触发
  const triggerReload = useCallback(() => {
    resetAndReload();
  }, [resetAndReload]);

  useEffect(() => {
    loadBrandsAndCategories();
  }, [loadBrandsAndCategories]);

  // 搜索防抖
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // 只有影响服务端查询的参数才需要重新加载数据
  // 评分排序在客户端处理，不需要重新加载
  useEffect(() => {
    triggerReload();
  }, [selectedBrandId, selectedCategoryId, searchQuery, triggerReload]);

  // sortBy 单独处理，避免评分排序时重复加载
  useEffect(() => {
    // 只有非评分排序才需要重新从服务端加载
    if (!['rating-high', 'rating-low', 'reviews-most'].includes(sortBy)) {
      triggerReload();
    }
  }, [sortBy, triggerReload]);

  // 无限滚动监听
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 1000 >= 
        document.documentElement.offsetHeight
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  // 客户端排序（仅用于评分相关排序，因为无法在数据库层面跨表排序）
  const sortedEquipment = [...equipment].sort((a, b) => {
    switch (sortBy) {
      case 'rating-high':
        return (b.average_rating || 0) - (a.average_rating || 0);
      case 'rating-low':
        return (a.average_rating || 0) - (b.average_rating || 0);
      case 'reviews-most':
        return (b.review_count || 0) - (a.review_count || 0);
      default:
        return 0; // 其他排序已在服务端处理
    }
  });

  // 添加到个人装备库
  const addToMyEquipment = async (sku: Equipment) => {
    if (!user) {
      alert('请先登录');
      return;
    }

    if (addedEquipment.has(sku.id)) {
      alert('该装备已在您的装备库中');
      return;
    }

    setAddingEquipment(prev => new Set(prev.add(sku.id)));

    try {
      // 先检查是否已经添加过该装备
      const { data: existingEquipment, error: checkError } = await getSupabase()
        .from('sports_equipment')
        .select('id')
        .eq('user_id', user.id)
        .eq('sku_id', sku.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 表示没有找到记录，这是正常的
        throw checkError;
      }

      if (existingEquipment) {
        setAddedEquipment(prev => new Set(prev.add(sku.id)));
        alert('该装备已在您的装备库中');
        return;
      }

      // 如果没有重复，则添加新装备
      const { error } = await getSupabase()
        .from('sports_equipment')
        .insert({
          user_id: user.id,
          sku_id: sku.id,
          brand_id: sku.brand_id,
          category_id: sku.category_id,
        });

      if (error) throw error;
      
      setAddedEquipment(prev => new Set(prev.add(sku.id)));
      alert('已添加到我的装备库');
    } catch (error) {
      console.error('添加装备失败:', error);
      alert('添加失败，请重试');
    } finally {
      setAddingEquipment(prev => {
        const newSet = new Set(prev);
        newSet.delete(sku.id);
        return newSet;
      });
    }
  };

  // 渲染评分星星
  const renderStars = (rating: number, size: 'small' | 'medium' | 'large' = 'medium') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    const sizeClass = {
      small: 'w-3 h-3',
      medium: 'w-4 h-4', 
      large: 'w-5 h-5'
    }[size];
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className={`${sizeClass} fill-yellow-400 text-yellow-400`} />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className={`${sizeClass} fill-yellow-400 text-yellow-400`} />
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className={`${sizeClass} text-gray-600`} />
      );
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader className="w-8 h-8 animate-spin" />
          <span>Loading equipment...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-white pt-16">
        <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">装备库</h1>
          <p className="text-gray-400">浏览全部装备，查看评价和评分</p>
        </div>

        {/* 搜索和筛选栏 */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          {/* 搜索框 */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索装备名称或品牌..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 筛选和排序控制 */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-md hover:bg-gray-700"
            >
              <Filter className="w-4 h-4" />
              筛选
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="rating-high">评分从高到低</option>
              <option value="rating-low">评分从低到高</option>
              <option value="reviews-most">评论数最多</option>
              <option value="name">按名称排序</option>
              <option value="price-low">价格从低到高</option>
              <option value="price-high">价格从高到低</option>
            </select>

            <div className="flex ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-md ${viewMode === 'grid' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-md ${viewMode === 'list' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 筛选选项 */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-700">
              <div>
                <label className="block text-sm font-medium mb-2">品牌</label>
                <select
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">所有品牌</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">分类</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">所有分类</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 结果统计 */}
        <div className="mb-6">
          <p className="text-gray-400">
            找到 {totalCount} 件装备 {equipment.length > 0 && equipment.length < totalCount && `(已显示 ${equipment.length} 件)`}
          </p>
        </div>

        {/* 装备列表 */}
        <div className={viewMode === 'grid' ? 
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 
          'space-y-4'
        }>
          {sortedEquipment.map((item) => (
            <div
              key={item.id}
              className={`bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:bg-gray-800 hover:border-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 ${
                viewMode === 'list' ? 'flex items-stretch' : 'h-80'
              }`}
            >
              {viewMode === 'grid' ? (
                // 网格模式：图片在左上角，内容填充其余空间
                <div className="p-4 h-full relative">
                  {/* 左上角图片区域 - 保持原始比例 */}
                  <div className="w-24 h-24 bg-gray-800 relative overflow-hidden rounded-lg float-left mr-3 mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image_urls?.[0] || '/images/equipment-placeholder.png'}
                      alt={item.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/equipment-placeholder.png';
                      }}
                    />
                  </div>

                  {/* 价格标签 - 右上角 */}
                  {item.msrp_price && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 text-xs font-semibold rounded-md">
                      ${item.msrp_price}
                    </div>
                  )}

                  {/* 内容区域 */}
                  <div className="flex flex-col justify-between h-full">
                    {/* 顶部：产品信息 */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 leading-tight" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <p className="text-blue-400 text-sm font-medium">{item.brands?.name}</p>
                        <span className="text-gray-600">•</span>
                        <p className="text-gray-400 text-xs">{item.categories?.name}</p>
                      </div>
                      
                      {/* 描述 */}
                      {item.description && (
                        <p className="text-gray-400 text-xs mb-3 leading-relaxed" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* 中间：突出的评分区域 */}
                    <div className="bg-gray-800/50 rounded-lg p-3 mb-3 border border-gray-700/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex items-center">
                              {renderStars(item.average_rating || 0, 'medium')}
                            </div>
                            <span className="text-lg font-bold text-yellow-400">
                              {item.average_rating?.toFixed(1) || '0.0'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <MessageSquare className="w-3 h-3" />
                            <span>{item.review_count || 0} 评价</span>
                          </div>
                        </div>
                        {/* 评分可视化 */}
                        <div className="text-right">
                          <div className="text-2xl font-bold text-yellow-400">
                            {((item.average_rating || 0) * 20).toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-500">满意度</div>
                        </div>
                      </div>
                    </div>

                    {/* 底部：操作按钮 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToMyEquipment(item)}
                        disabled={addingEquipment.has(item.id) || addedEquipment.has(item.id)}
                        className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                          addedEquipment.has(item.id)
                            ? 'bg-green-600 text-white'
                            : addingEquipment.has(item.id)
                              ? 'bg-gray-600 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {addingEquipment.has(item.id) ? (
                          <Loader className="w-3 h-3 animate-spin" />
                        ) : addedEquipment.has(item.id) ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Plus className="w-3 h-3" />
                        )}
                        {addedEquipment.has(item.id) ? '已添加' : addingEquipment.has(item.id) ? '添加中...' : '添加装备'}
                      </button>
                      <Link
                        href={`/equipment-detail?id=${item.id}`}
                        className="flex items-center justify-center gap-1 px-3 py-2 border border-gray-600 rounded-md text-xs hover:bg-gray-800 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        详情
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                // 列表模式：保持原有布局但优化样式
                <>
                  {/* 左侧图片 */}
                  <div className="w-24 h-24 m-4 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image_urls?.[0] || '/images/equipment-placeholder.png'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/equipment-placeholder.png';
                      }}
                    />
                  </div>

                  {/* 中间内容 */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-blue-400 text-sm font-medium">{item.brands?.name}</p>
                          <span className="text-gray-600">•</span>
                          <p className="text-gray-400 text-xs">{item.categories?.name}</p>
                        </div>
                      </div>
                      {item.msrp_price && (
                        <span className="text-green-400 font-semibold text-lg">
                          ${item.msrp_price}
                        </span>
                      )}
                    </div>

                    {/* 评分信息 */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1">
                        {renderStars(item.average_rating || 0, 'medium')}
                      </div>
                      <span className="text-sm font-medium text-yellow-400">
                        {item.average_rating?.toFixed(1) || '0.0'}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <MessageSquare className="w-3 h-3" />
                        {item.review_count || 0} 评价
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToMyEquipment(item)}
                        disabled={addingEquipment.has(item.id) || addedEquipment.has(item.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          addedEquipment.has(item.id)
                            ? 'bg-green-600 text-white'
                            : addingEquipment.has(item.id)
                              ? 'bg-gray-600 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {addingEquipment.has(item.id) ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : addedEquipment.has(item.id) ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        {addedEquipment.has(item.id) ? '已添加' : addingEquipment.has(item.id) ? '添加中...' : '添加到我的装备'}
                      </button>
                      <Link
                        href={`/equipment-detail?id=${item.id}`}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-600 rounded-md text-sm hover:bg-gray-800 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        查看详情
                      </Link>
                    </div>
                  </div>

                  {/* 右侧评分统计 */}
                  <div className="p-4 flex items-center justify-center">
                    <div className="text-center bg-gray-800/30 rounded-lg p-4 min-w-[100px]">
                      <div className="text-3xl font-bold text-yellow-400 mb-1">
                        {item.average_rating?.toFixed(1) || '0.0'}
                      </div>
                      <div className="flex justify-center mb-1">
                        {renderStars(item.average_rating || 0, 'small')}
                      </div>
                      <div className="text-xs text-gray-400">
                        {item.review_count || 0} 评价
                      </div>
                      <div className="text-xs text-yellow-400 mt-1">
                        {((item.average_rating || 0) * 20).toFixed(0)}% 满意
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* 加载更多按钮或加载状态 */}
        {loadingMore && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-3">
              <Loader className="w-6 h-6 animate-spin" />
              <span className="text-gray-400">加载更多装备...</span>
            </div>
          </div>
        )}

        {/* 已加载全部提示 */}
        {!hasMore && equipment.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">已显示全部装备</p>
          </div>
        )}

        {/* 无结果提示 */}
        {!loading && sortedEquipment.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">未找到装备</h3>
            <p className="text-gray-400">
              尝试调整搜索条件或筛选选项
            </p>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default EquipmentBrowser;