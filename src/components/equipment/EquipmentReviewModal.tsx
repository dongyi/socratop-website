'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  X, 
  Star,
  Save,
  Loader
} from 'lucide-react';

const reviewSchema = z.object({
  rating: z.number().min(1, '请选择评分').max(5, '评分不能超过5星'),
  review_title: z.string().max(100, '标题不能超过100字符').optional().or(z.literal('')),
  review_content: z.string().max(2000, '评论内容不能超过2000字符').optional().or(z.literal('')),
  pros: z.string().max(500, '优点描述不能超过500字符').optional().or(z.literal('')),
  cons: z.string().max(500, '缺点描述不能超过500字符').optional().or(z.literal('')),
  usage_duration: z.number().min(0, '使用时长不能为负数').optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface Equipment {
  id: string;
  name: string;
  brands?: { name: string };
}

interface EquipmentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  onReviewSubmitted: () => void;
  existingReview?: {
    id: string;
    rating: number;
    review_title?: string;
    review_content?: string;
    pros?: string;
    cons?: string;
    usage_duration?: number;
  } | null;
}

const EquipmentReviewModal: React.FC<EquipmentReviewModalProps> = ({
  isOpen,
  onClose,
  equipment,
  onReviewSubmitted,
  existingReview
}) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      review_title: existingReview?.review_title || '',
      review_content: existingReview?.review_content || '',
      pros: existingReview?.pros || '',
      cons: existingReview?.cons || '',
      usage_duration: existingReview?.usage_duration || undefined,
    }
  });

  const currentRating = watch('rating');

  const handleClose = () => {
    reset();
    setHoveredRating(0);
    onClose();
  };

  const handleStarClick = (rating: number) => {
    setValue('rating', rating);
  };

  const onSubmit = async (data: ReviewFormData) => {
    if (!user || !equipment) {
      alert('请先登录');
      return;
    }

    setSaving(true);
    try {
      const reviewData = {
        user_id: user.id,
        sku_id: equipment.id,
        rating: data.rating,
        review_title: data.review_title || null,
        review_content: data.review_content || null,
        pros: data.pros || null,
        cons: data.cons || null,
        usage_duration: data.usage_duration || null,
      };

      if (existingReview) {
        // 更新现有评论
        const { error } = await getSupabase()
          .from('equipment_reviews')
          .update({
            ...reviewData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingReview.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // 创建新评论
        const { error } = await getSupabase()
          .from('equipment_reviews')
          .insert(reviewData);

        if (error) throw error;
      }

      onReviewSubmitted();
      handleClose();
      alert(existingReview ? '评论已更新' : '评论已提交');
    } catch (error: unknown) {
      console.error('提交评论失败:', error);
      if (error instanceof Error && error.message?.includes('duplicate key')) {
        alert('您已经评价过这件装备了');
      } else {
        alert('提交失败，请重试');
      }
    } finally {
      setSaving(false);
    }
  };

  const renderStars = (interactive = false) => {
    const displayRating = interactive ? (hoveredRating || currentRating) : currentRating;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && handleStarClick(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            className={`${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } transition-transform`}
          >
            <Star
              className={`w-8 h-8 ${
                star <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-400'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen || !equipment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* 标题 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {existingReview ? '编辑评价' : '评价装备'}
              </h2>
              <p className="text-gray-400 mt-1">
                {equipment.brands?.name} {equipment.name}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 评分 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                总体评分 *
              </label>
              <div className="flex items-center gap-4">
                {renderStars(true)}
                <span className="text-lg font-semibold text-yellow-400">
                  {currentRating > 0 ? `${currentRating} 星` : '请选择评分'}
                </span>
              </div>
              {errors.rating && (
                <p className="text-red-400 text-sm mt-1">{errors.rating.message}</p>
              )}
            </div>

            {/* 评论标题 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                评论标题
              </label>
              <input
                type="text"
                {...register('review_title')}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                placeholder="简短总结您的使用体验..."
                maxLength={100}
              />
              {errors.review_title && (
                <p className="text-red-400 text-sm mt-1">{errors.review_title.message}</p>
              )}
            </div>

            {/* 详细评论 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                详细评论
              </label>
              <textarea
                {...register('review_content')}
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                placeholder="分享您的使用体验、感受等..."
                maxLength={2000}
              />
              {errors.review_content && (
                <p className="text-red-400 text-sm mt-1">{errors.review_content.message}</p>
              )}
            </div>

            {/* 优点和缺点 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  优点
                </label>
                <textarea
                  {...register('pros')}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  placeholder="这款装备的优点是什么？"
                  maxLength={500}
                />
                {errors.pros && (
                  <p className="text-red-400 text-sm mt-1">{errors.pros.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  缺点
                </label>
                <textarea
                  {...register('cons')}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  placeholder="有什么需要改进的地方？"
                  maxLength={500}
                />
                {errors.cons && (
                  <p className="text-red-400 text-sm mt-1">{errors.cons.message}</p>
                )}
              </div>
            </div>

            {/* 使用时长 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                使用时长（月）
              </label>
              <input
                type="number"
                {...register('usage_duration', { valueAsNumber: true })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                placeholder="您使用了多长时间？"
                min="0"
                step="1"
              />
              {errors.usage_duration && (
                <p className="text-red-400 text-sm mt-1">{errors.usage_duration.message}</p>
              )}
            </div>

            {/* 提交按钮 */}
            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                {saving ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? '提交中...' : existingReview ? '更新评价' : '提交评价'}
              </button>
              
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EquipmentReviewModal;