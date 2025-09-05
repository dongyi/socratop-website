'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
// import { useLanguage } from '@/contexts/LanguageContext';
import { getSupabase } from '@/lib/supabase';
import EquipmentReviewModal from '@/components/equipment/EquipmentReviewModal';
import { 
  ArrowLeft,
  Star,
  StarHalf,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  User,
  Calendar,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Loader
} from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  description?: string;
  msrp_price?: number;
  brand_id: string;
  category_id: string;
  brands?: { id: string; name: string };
  categories?: { id: string; name: string };
  average_rating?: number;
  review_count?: number;
  rating_distribution?: Record<string, number>;
}

interface Review {
  id: string;
  user_id: string;
  rating: number;
  review_title?: string;
  review_content?: string;
  pros?: string;
  cons?: string;
  usage_duration?: number;
  created_at: string;
  updated_at: string;
  users_profiles?: {
    full_name?: string;
    display_name?: string;
  };
}

const EquipmentDetailContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  // const { t } = useLanguage();
  const equipmentId = searchParams.get('id');

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // 加载装备详情
  const loadEquipment = useCallback(async () => {
    if (!equipmentId) return;

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      const headers = {
        'apikey': supabaseAnonKey!,
        'Content-Type': 'application/json',
      };

      // 获取装备基本信息
      const equipmentResponse = await fetch(
        `${supabaseUrl}/rest/v1/skus?select=id,name,description,msrp_price,brand_id,category_id,brands:brand_id(id,name),categories:category_id(id,name)&id=eq.${equipmentId}`,
        { headers }
      );

      if (equipmentResponse.ok) {
        const equipmentData = await equipmentResponse.json();
        if (equipmentData && equipmentData.length > 0) {
          const equipmentItem = equipmentData[0];

          // 获取评分统计 - 从 equipment_reviews 表计算
          const ratingResponse = await fetch(
            `${supabaseUrl}/rest/v1/equipment_reviews?select=rating&sku_id=eq.${equipmentId}`,
            { headers }
          );

          if (ratingResponse.ok) {
            const ratingData = await ratingResponse.json();
            if (ratingData && ratingData.length > 0) {
              // 计算平均评分
              const ratings = ratingData.map((item: any) => item.rating);
              const averageRating = ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length;
              
              // 计算评分分布
              const distribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
              ratings.forEach((rating: number) => {
                distribution[rating.toString()] = (distribution[rating.toString()] || 0) + 1;
              });
              
              equipmentItem.average_rating = averageRating;
              equipmentItem.review_count = ratings.length;
              equipmentItem.rating_distribution = distribution;
            } else {
              equipmentItem.average_rating = 0;
              equipmentItem.review_count = 0;
              equipmentItem.rating_distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
            }
          }

          setEquipment(equipmentItem);
        }
      }
    } catch (error) {
      console.error('加载装备详情失败:', error);
    }
  }, [equipmentId]);

  // 加载评论
  const loadReviews = useCallback(async () => {
    if (!equipmentId) return;

    try {
      const supabase = getSupabase();
      
      const { data, error } = await supabase
        .from('equipment_reviews')
        .select(`
          *,
          users_profiles!inner(full_name, display_name)
        `)
        .eq('sku_id', equipmentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reviewsData = data || [];
      setReviews(reviewsData);

      // 查找当前用户的评论
      if (user) {
        const currentUserReview = reviewsData.find(review => review.user_id === user.id);
        setUserReview(currentUserReview || null);
      }

    } catch (error) {
      console.error('加载评论失败:', error);
    }
  }, [equipmentId, user]);

  useEffect(() => {
    if (equipmentId) {
      loadEquipment();
      loadReviews();
    }
  }, [equipmentId, loadEquipment, loadReviews]);

  useEffect(() => {
    if (equipment && reviews.length > 0) {
      setLoading(false);
    } else if (equipment) {
      setLoading(false);
    }
  }, [equipment, reviews]);

  // 添加到个人装备库
  const addToMyEquipment = async () => {
    if (!user || !equipment) {
      alert('请先登录');
      return;
    }

    try {
      const { error } = await getSupabase()
        .from('sports_equipment')
        .insert({
          user_id: user.id,
          sku_id: equipment.id,
          brand_id: equipment.brand_id,
          category_id: equipment.category_id,
        });

      if (error) throw error;
      
      alert('已添加到我的装备库');
    } catch (error) {
      console.error('添加装备失败:', error);
      alert('添加失败，请重试');
    }
  };

  // 删除评论
  const deleteReview = async (reviewId: string) => {
    if (!confirm('确定要删除这条评论吗？')) {
      return;
    }

    try {
      const { error } = await getSupabase()
        .from('equipment_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user?.id);

      if (error) throw error;

      await loadReviews();
      await loadEquipment();
      alert('评论已删除');
    } catch (error) {
      console.error('删除评论失败:', error);
      alert('删除失败，请重试');
    }
  };

  // 渲染评分星星
  const renderStars = (rating: number, size = 16) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className={`w-${size/4} h-${size/4} fill-yellow-400 text-yellow-400`} />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className={`w-${size/4} h-${size/4} fill-yellow-400 text-yellow-400`} />
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className={`w-${size/4} h-${size/4} text-gray-400`} />
      );
    }
    
    return stars;
  };

  // 渲染评分分布
  const renderRatingDistribution = () => {
    if (!equipment?.rating_distribution || !equipment.review_count) {
      return null;
    }

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = equipment.rating_distribution![star.toString()] || 0;
          const percentage = equipment.review_count ? (count / equipment.review_count) * 100 : 0;
          
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="text-sm text-gray-300 w-4">{star}</span>
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // 排序评论
  const sortedReviews = reviews
    .filter(review => review.user_id !== user?.id) // 排除当前用户的评论
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  if (!equipmentId) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">装备ID未提供</h1>
          <button
            onClick={() => router.push('/equipment-browser')}
            className="text-blue-400 hover:text-blue-300"
          >
            返回装备浏览器
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader className="w-8 h-8 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">装备未找到</h1>
          <button
            onClick={() => router.back()}
            className="text-blue-400 hover:text-blue-300"
          >
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        {/* 装备基本信息 */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{equipment.name}</h1>
                  <p className="text-gray-400 text-lg">{equipment.brands?.name}</p>
                  <p className="text-gray-500">{equipment.categories?.name}</p>
                </div>
                {equipment.msrp_price && (
                  <span className="text-2xl font-bold text-green-400">
                    ${equipment.msrp_price}
                  </span>
                )}
              </div>

              {equipment.description && (
                <p className="text-gray-300 mb-6">{equipment.description}</p>
              )}

              <div className="flex gap-4">
                <button
                  onClick={addToMyEquipment}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  添加到我的装备
                </button>
                
                {user && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-600 hover:bg-gray-800 rounded-md font-medium transition-colors"
                  >
                    {userReview ? (
                      <>
                        <Edit className="w-4 h-4" />
                        编辑我的评价
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        写评价
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* 评分统计 */}
            <div className="lg:w-80 bg-gray-800 rounded-lg p-6">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-yellow-400 mb-2">
                  {equipment.average_rating?.toFixed(1) || '0.0'}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(equipment.average_rating || 0, 20)}
                </div>
                <p className="text-gray-400">
                  基于 {equipment.review_count || 0} 条评价
                </p>
              </div>

              {renderRatingDistribution()}
            </div>
          </div>
        </div>

        {/* 用户自己的评价 */}
        {userReview && (
          <div className="bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-400">我的评价</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteReview(userReview.id)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              {renderStars(userReview.rating, 16)}
              <span className="text-yellow-400 font-semibold">{userReview.rating} 星</span>
              {userReview.usage_duration && (
                <span className="text-gray-400 text-sm">
                  · 使用了 {userReview.usage_duration} 个月
                </span>
              )}
            </div>

            {userReview.review_title && (
              <h4 className="font-semibold mb-2">{userReview.review_title}</h4>
            )}

            {userReview.review_content && (
              <p className="text-gray-300 mb-4">{userReview.review_content}</p>
            )}

            {(userReview.pros || userReview.cons) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userReview.pros && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ThumbsUp className="w-4 h-4 text-green-400" />
                      <span className="font-medium text-green-400">优点</span>
                    </div>
                    <p className="text-gray-300 text-sm">{userReview.pros}</p>
                  </div>
                )}

                {userReview.cons && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ThumbsDown className="w-4 h-4 text-red-400" />
                      <span className="font-medium text-red-400">缺点</span>
                    </div>
                    <p className="text-gray-300 text-sm">{userReview.cons}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 所有评价 */}
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              所有评价 ({sortedReviews.length})
            </h2>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">最新评价</option>
              <option value="oldest">最早评价</option>
              <option value="highest">评分最高</option>
              <option value="lowest">评分最低</option>
            </select>
          </div>

          {sortedReviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">暂无评价</h3>
              <p className="text-gray-400">
                成为第一个评价这款装备的用户
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-700 pb-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {review.users_profiles?.display_name || 
                           review.users_profiles?.full_name || 
                           '匿名用户'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(review.created_at).toLocaleDateString('zh-CN')}
                          {review.usage_duration && (
                            <>
                              <span>·</span>
                              <Clock className="w-3 h-3" />
                              使用了 {review.usage_duration} 个月
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    {renderStars(review.rating, 16)}
                    <span className="text-yellow-400 font-semibold">{review.rating} 星</span>
                  </div>

                  {review.review_title && (
                    <h4 className="font-semibold mb-2">{review.review_title}</h4>
                  )}

                  {review.review_content && (
                    <p className="text-gray-300 mb-4">{review.review_content}</p>
                  )}

                  {(review.pros || review.cons) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {review.pros && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <ThumbsUp className="w-4 h-4 text-green-400" />
                            <span className="font-medium text-green-400">优点</span>
                          </div>
                          <p className="text-gray-300 text-sm">{review.pros}</p>
                        </div>
                      )}

                      {review.cons && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <ThumbsDown className="w-4 h-4 text-red-400" />
                            <span className="font-medium text-red-400">缺点</span>
                          </div>
                          <p className="text-gray-300 text-sm">{review.cons}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 评价模态框 */}
      <EquipmentReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        equipment={equipment}
        existingReview={userReview}
        onReviewSubmitted={() => {
          loadReviews();
          loadEquipment();
        }}
      />
    </div>
  );
};

const EquipmentDetailPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader className="w-8 h-8 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    }>
      <EquipmentDetailContent />
    </Suspense>
  );
};

export default EquipmentDetailPage;