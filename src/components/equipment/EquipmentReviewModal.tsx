"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSupabase } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as Sentry from "@sentry/nextjs";
import { X, Star, Save, Loader } from "lucide-react";
import ImageUpload from "./ImageUpload";

type ReviewFormData = {
  rating: number;
  review_content: string;
  image_urls?: string[];
};

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
    review_content?: string;
    image_urls?: string[];
  } | null;
}

const EquipmentReviewModal: React.FC<EquipmentReviewModalProps> = ({
  isOpen,
  onClose,
  equipment,
  onReviewSubmitted,
  existingReview,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Create dynamic schema with translations
  const reviewSchema = z.object({
    rating: z.number().min(1, t("select_rating")).max(5, t("rating_max_5")),
    review_content: z
      .string()
      .min(1, t("review_content_required"))
      .max(2000, t("review_content_max_length")),
    image_urls: z.array(z.string()).default([]),
  });

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
      review_content: existingReview?.review_content || "",
      image_urls: existingReview?.image_urls || [],
    },
  });

  const currentRating = watch("rating");
  const currentImages = watch("image_urls");

  const handleClose = () => {
    reset();
    setHoveredRating(0);
    onClose();
  };

  const handleStarClick = (rating: number) => {
    setValue("rating", rating);
  };

  const onSubmit = async (data: ReviewFormData) => {
    if (!user || !equipment) {
      alert(t("please_login"));
      return;
    }

    if (!user.id || !equipment.id) {
      alert(t("user_equipment_info_incomplete"));
      return;
    }

    setSaving(true);

    // 使用当前认证的用户ID确保安全性
    const reviewData = {
      user_id: user.id,
      sku_id: equipment.id,
      rating: data.rating,
      review_content: data.review_content,
      image_urls: data.image_urls,
    };

    console.log("准备提交评论数据:", reviewData);

    try {
      const supabase = getSupabase();

      // 验证用户会话
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !currentUser) {
        throw new Error(t("user_not_logged_in"));
      }

      console.log("当前用户:", currentUser.id, "提交用户:", user.id);

      // 确保使用当前认证的用户ID
      const finalReviewData = {
        ...reviewData,
        user_id: currentUser.id,
      };

      if (existingReview) {
        // 更新现有评论
        console.log("更新评论，ID:", existingReview.id);
        const { error } = await supabase
          .from("equipment_reviews")
          .update({
            rating: finalReviewData.rating,
            review_content: finalReviewData.review_content,
            image_urls: finalReviewData.image_urls,
          })
          .eq("id", existingReview.id)
          .eq("user_id", currentUser.id);

        if (error) {
          console.error("更新评论失败:", error);
          throw error;
        }
      } else {
        // 创建新评论
        console.log("创建新评论");
        const { data: insertedData, error } = await supabase
          .from("equipment_reviews")
          .insert(finalReviewData)
          .select();

        if (error) {
          console.error("创建评论失败:", error);
          console.error("错误详情:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
          throw error;
        }

        console.log("评论创建成功:", insertedData);
      }

      onReviewSubmitted();
      handleClose();
      alert(existingReview ? t("review_updated") : t("review_submitted"));
    } catch (error: unknown) {
      console.error("提交评论失败:", error);

      // 记录错误到 Sentry
      Sentry.captureException(error, {
        tags: {
          section: "equipment_review",
          action: existingReview ? "update" : "create",
        },
        extra: {
          equipment_id: equipment?.id,
          user_id: user?.id,
          review_data: reviewData,
          error_details:
            error instanceof Error
              ? {
                  message: error.message,
                  name: error.name,
                  stack: error.stack,
                }
              : error,
        },
      });

      let errorMessage = "提交失败，请重试";

      if (error instanceof Error) {
        if (error.message?.includes("duplicate key")) {
          errorMessage = "您已经评价过这件装备了";
        } else if (
          error.message?.includes("row-level security") ||
          error.message?.includes("42501")
        ) {
          errorMessage =
            "评论提交失败: 权限验证失败。可能是数据库配置问题，请联系管理员";
        } else if (error.message?.includes("equipment_reviews")) {
          errorMessage = "评论提交失败: 数据表配置错误，请联系管理员";
        } else {
          errorMessage = `提交失败: ${error.message}`;
        }
      }

      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const renderStars = (interactive = false) => {
    const displayRating = interactive
      ? hoveredRating || currentRating
      : currentRating;

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
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
            } transition-transform`}
          >
            <Star
              className={`w-8 h-8 ${
                star <= displayRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-400"
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
                {existingReview ? t("edit_review") : t("rate_equipment")}
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
                {t("overall_rating")} {t("required_field")}
              </label>
              <div className="flex items-center gap-4">
                {renderStars(true)}
                <span className="text-lg font-semibold text-yellow-400">
                  {currentRating > 0
                    ? t("select_rating_prompt").replace(
                        "{rating}",
                        currentRating.toString(),
                      )
                    : t("please_select_rating")}
                </span>
              </div>
              {errors.rating && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.rating.message}
                </p>
              )}
            </div>

            {/* 详细评论 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("detailed_review")} {t("required_field")}
              </label>
              <textarea
                {...register("review_content")}
                rows={6}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                placeholder={t("share_experience")}
                maxLength={2000}
              />
              {errors.review_content && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.review_content.message}
                </p>
              )}
            </div>

            {/* 图片上传 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("upload_images")}
              </label>
              <ImageUpload
                images={currentImages || []}
                onImagesChange={(images) => setValue("image_urls", images)}
                maxImages={5}
                disabled={saving}
              />
              {errors.image_urls && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.image_urls.message}
                </p>
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
                {saving
                  ? t("submitting")
                  : existingReview
                    ? t("update_review")
                    : t("submit_review")}
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EquipmentReviewModal;
