'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  X, 
  Save, 
  Plus,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const submitEquipmentSchema = z.object({
  name: z.string().min(1, 'Equipment name is required').max(100, 'Equipment name cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional().or(z.literal('')),
  brand_name: z.string().min(1, 'Brand name is required').max(50, 'Brand name cannot exceed 50 characters'),
  category_name: z.string().min(1, 'Please select a category'),
  msrp_price: z.string().optional().or(z.literal('')),
  model_year: z.string().optional().or(z.literal('')),
  weight: z.string().optional().or(z.literal('')),
  color: z.string().max(30, 'Color cannot exceed 30 characters').optional().or(z.literal('')),
  product_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  submission_reason: z.string().min(10, 'Please provide a detailed reason (at least 10 characters)').max(500, 'Submission reason cannot exceed 500 characters'),
});

type SubmitEquipmentFormData = z.infer<typeof submitEquipmentSchema>;

interface SubmitEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  requireLogin?: boolean;
}

const categories = [
  { id: 'shoes', name: 'Running Shoes' },
  { id: 'watch', name: 'Sports Watch' },
  { id: 'bike', name: 'Bicycle' },
  { id: 'clothing', name: 'Sports Clothing' },
  { id: 'accessories', name: 'Accessories' },
];

export const SubmitEquipmentModal: React.FC<SubmitEquipmentModalProps> = ({
  isOpen,
  onClose,
  requireLogin = true
}) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubmitEquipmentFormData>({
    resolver: zodResolver(submitEquipmentSchema),
  });

  const handleClose = () => {
    if (submitSuccess) {
      setSubmitSuccess(false);
    }
    reset();
    setImageUrls([]);
    onClose();
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const updateImageUrl = (index: number, url: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = url;
    setImageUrls(newUrls);
  };

  const removeImageUrl = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
  };

  const onSubmit = async (data: SubmitEquipmentFormData) => {
    if (!user) {
      alert('Please login first');
      return;
    }

    setSaving(true);
    try {
      const validImageUrls = imageUrls.filter(url => url.trim() !== '');
      
      const submissionData = {
        user_id: user.id,
        name: data.name,
        description: data.description || null,
        brand_name: data.brand_name,
        category_name: data.category_name,
        msrp_price: data.msrp_price ? parseFloat(data.msrp_price) : null,
        model_year: data.model_year ? parseInt(data.model_year) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        color: data.color || null,
        product_url: data.product_url || null,
        image_urls: validImageUrls.length > 0 ? validImageUrls : null,
        submission_reason: data.submission_reason,
        status: 'pending',
      };

      const { error } = await getSupabase()
        .from('user_submitted_equipment')
        .insert(submissionData);

      if (error) throw error;

      setSubmitSuccess(true);
      reset();
      setImageUrls([]);
    } catch (error) {
      console.error('Submit equipment failed:', error);
      alert('Submission failed, please try again');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Submit New Equipment
              </h2>
              <p className="text-gray-400 mt-1">
                Help us improve our equipment database
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Login Required Message */}
          {requireLogin && !user ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-900 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Login Required
              </h3>
              <p className="text-gray-400 mb-6">
                Please login to submit new equipment for review.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : submitSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Submission Successful!
              </h3>
              <p className="text-gray-400 mb-6">
                Thank you for your contribution! We will review your equipment submission soon.
              </p>
              <button
                onClick={handleClose}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Equipment Name *
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="e.g., Nike Air Zoom Pegasus 40"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    {...register('brand_name')}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="e.g., Nike"
                  />
                  {errors.brand_name && (
                    <p className="text-red-400 text-sm mt-1">{errors.brand_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    {...register('category_name')}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_name && (
                    <p className="text-red-400 text-sm mt-1">{errors.category_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    MSRP Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('msrp_price')}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="149.99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Model Year
                  </label>
                  <input
                    type="number"
                    {...register('model_year')}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="2024"
                    min="2000"
                    max={new Date().getFullYear() + 1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Weight (grams)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('weight')}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="280.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    {...register('color')}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="Black/White"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Product URL
                  </label>
                  <input
                    type="url"
                    {...register('product_url')}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="https://..."
                  />
                  {errors.product_url && (
                    <p className="text-red-400 text-sm mt-1">{errors.product_url.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  placeholder="Detailed description of the equipment features, purpose, etc..."
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Image URLs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Product Image URLs
                  </label>
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Image
                  </button>
                </div>
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => updateImageUrl(index, e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      placeholder="https://example.com/image.jpg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImageUrl(index)}
                      className="px-3 py-2 text-gray-400 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Submission Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Submission Reason *
                </label>
                <textarea
                  {...register('submission_reason')}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  placeholder="Please explain why you're submitting this equipment, e.g., couldn't find this product when adding equipment, it's a new release..."
                />
                {errors.submission_reason && (
                  <p className="text-red-400 text-sm mt-1">{errors.submission_reason.message}</p>
                )}
              </div>

              {/* Notice */}
              <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-300">
                    <p className="font-medium mb-1">Submission Guidelines:</p>
                    <ul className="space-y-1 text-blue-200">
                      <li>• Please ensure all information provided is accurate</li>
                      <li>• We will review your submission within 1-3 business days</li>
                      <li>• Once approved, the equipment will be added to the database for all users</li>
                      <li>• If you have any questions, please contact the administrator</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Submitting...' : 'Submit Request'}
                </button>
                
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitEquipmentModal;