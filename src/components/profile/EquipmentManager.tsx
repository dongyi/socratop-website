'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSupabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Calendar,
  Clock,
  MapPin,
  Activity,
  AlertCircle
} from 'lucide-react';
import SubmitEquipmentModal from './SubmitEquipmentModal';

const createEquipmentSchema = (t: (key: string) => string) => z.object({
  sku_id: z.string().min(1, t('equipment_model_required')),
  purchase_date: z.string().optional().or(z.literal('')),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().or(z.literal('')),
});

type EquipmentFormData = {
  sku_id: string;
  purchase_date?: string;
  notes?: string;
};

interface Equipment {
  id: string;
  sku_id?: string;
  brand_id?: string;
  category_id?: string;
  purchase_date?: string;
  total_distance: number;
  total_hours: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  // 关联数据
  brands?: Brand;
  categories?: Category;
  skus?: SKU;
}

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

interface SKU {
  id: string;
  name: string;
  description?: string;
  msrp_price?: number;
  brand_id: string;
  category_id: string;
  brands?: Brand | Brand[];
  categories?: Category | Category[];
}

const getCategoryLabels = (t: (key: string) => string) => ({
  shoes: `🏃‍♂️ ${t('Running Shoes')}`,
  watch: `⌚ ${t('Sports Watch')}`,
  bike: `🚴‍♂️ ${t('Bicycle')}`,
  clothing: `👕 ${t('Sports Clothing')}`,
  accessories: `🎒 ${t('Accessories')}`,
});

export const EquipmentManager = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [skus, setSKUs] = useState<SKU[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedBrandId, setSelectedBrandId] = useState<string>(''); 
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [filteredSKUs, setFilteredSKUs] = useState<SKU[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const equipmentSchema = createEquipmentSchema(t);
  const categoryLabels = getCategoryLabels(t);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
  });

  const loadEquipment = useCallback(async () => {
    if (!user) return;

    try {
      // 加载用户装备（包含关联数据）
      const { data, error } = await getSupabase()
        .from('sports_equipment')
        .select(`
          *,
          brands!brand_id(id, name),
          categories!category_id(id, name),
          skus!sku_id(id, name, description)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('加载的装备数据:', data);
      setEquipment(data || []);
    } catch (error) {
      console.error('加载装备列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadBrandsAndCategories = useCallback(async () => {
    try {
      console.log('开始加载装备数据...');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      // 直接使用 REST API 调用，绕过 RLS
      const headers = {
        'apikey': supabaseAnonKey!,
        'Content-Type': 'application/json',
      };

      // 并行获取所有数据
      const [brandsResponse, categoriesResponse, skusResponse] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/brands?select=*&order=name`, { headers }),
        fetch(`${supabaseUrl}/rest/v1/categories?select=*&order=name`, { headers }),
        fetch(`${supabaseUrl}/rest/v1/skus?select=id,name,description,msrp_price,brand_id,category_id,brands:brand_id(id,name),categories:category_id(id,name)`, { headers })
      ]);

      // 处理品牌数据
      if (brandsResponse.ok) {
        const brandsData = await brandsResponse.json();
        console.log('品牌数据:', brandsData);
        setBrands(brandsData || []);
      } else {
        console.error('品牌查询失败:', await brandsResponse.text());
      }

      // 处理分类数据  
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        console.log('分类数据:', categoriesData);
        setCategories(categoriesData || []);
      } else {
        console.error('分类查询失败:', await categoriesResponse.text());
      }

      // 处理SKU数据
      if (skusResponse.ok) {
        const skusData = await skusResponse.json();
        console.log('SKU数据:', skusData);
        setSKUs(skusData || []);
      } else {
        console.error('SKU查询失败:', await skusResponse.text());
      }
      
    } catch (error) {
      console.error('加载装备数据失败:', error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadEquipment();
      loadBrandsAndCategories();
    }
  }, [user, loadEquipment, loadBrandsAndCategories]);

  // 根据分类过滤品牌
  useEffect(() => {
    if (!selectedCategoryId) {
      setFilteredBrands([]);
      setSelectedBrandId('');
      return;
    }

    // 找出该分类下有SKU的所有品牌
    const categoryBrandIds = skus
      .filter(sku => sku.category_id === selectedCategoryId)
      .map(sku => sku.brand_id);
    
    const uniqueBrandIds = Array.from(new Set(categoryBrandIds));
    const filteredBrandsData = brands.filter(brand => uniqueBrandIds.includes(brand.id));
    
    setFilteredBrands(filteredBrandsData);
    
    // 如果当前选择的品牌不在过滤后的列表中，清空品牌选择
    if (selectedBrandId && !uniqueBrandIds.includes(selectedBrandId)) {
      setSelectedBrandId('');
    }
  }, [selectedCategoryId, skus, brands, selectedBrandId]);

  // 根据分类和品牌过滤SKU
  useEffect(() => {
    let filtered = skus;
    
    if (selectedCategoryId) {
      filtered = filtered.filter(sku => sku.category_id === selectedCategoryId);
    }
    
    if (selectedBrandId) {
      filtered = filtered.filter(sku => sku.brand_id === selectedBrandId);
    }
    
    setFilteredSKUs(filtered);
  }, [skus, selectedCategoryId, selectedBrandId]);

  const onSubmit = async (data: EquipmentFormData) => {
    if (!user) return;

    setSaving(true);
    try {
      // Find selected SKU information
      const selectedSKU = skus.find(sku => sku.id === data.sku_id);
      if (!selectedSKU) {
        alert(t('equipment_select_model_error'));
        return;
      }

      const equipmentData = {
        sku_id: data.sku_id,
        brand_id: selectedSKU.brand_id,
        category_id: selectedSKU.category_id,
        purchase_date: data.purchase_date || null,
        notes: data.notes || null,
      };

      if (editingId) {
        // 更新现有装备
        const { error } = await getSupabase()
          .from('sports_equipment')
          .update({
            ...equipmentData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // 创建新装备
        const { error } = await getSupabase()
          .from('sports_equipment')
          .insert({
            user_id: user.id,
            ...equipmentData,
          });

        if (error) throw error;
      }

      await loadEquipment();
      handleCancelEdit();
    } catch (error) {
      console.error('Save equipment failed:', error);
      alert(t('equipment_save_error'));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Equipment) => {
    console.log('编辑装备:', item);
    setEditingId(item.id);
    setShowForm(true);
    setValue('sku_id', item.sku_id || '');
    setValue('purchase_date', item.purchase_date || '');
    setValue('notes', item.notes || '');
    
    // 设置分类和品牌选择以便过滤SKU
    if (item.category_id) {
      console.log('设置分类ID:', item.category_id);
      setSelectedCategoryId(item.category_id);
    }
    if (item.brand_id) {
      console.log('设置品牌ID:', item.brand_id);
      setSelectedBrandId(item.brand_id);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowForm(false);
    setSelectedCategoryId('');
    setSelectedBrandId('');
    reset();
  };

  const handleDelete = async (id: string, displayName: string) => {
    if (!user) return;

    if (!confirm(t('equipment_delete_confirm').replace('{name}', displayName))) {
      return;
    }

    try {
      const { error } = await getSupabase()
        .from('sports_equipment')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadEquipment();
    } catch (error) {
      console.error('删除装备失败:', error);
      alert(t('equipment_delete_error'));
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    if (!user) return;

    try {
      const { error } = await getSupabase()
        .from('sports_equipment')
        .update({ 
          is_active: !isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadEquipment();
    } catch (error) {
      console.error('更新装备状态失败:', error);
      alert(t('equipment_update_error'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{t('equipment_title')}</h2>
            <p className="text-gray-400">{t('equipment_desc')}</p>
          </div>
        </div>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('equipment_add')}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingId ? t('equipment_edit') : t('equipment_add_new')}
            </h3>
            <button
              onClick={handleCancelEdit}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('equipment_category')} *
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    setSelectedBrandId(''); // 清空品牌选择
                    setValue('sku_id', ''); // 清空SKU选择
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">请先选择分类</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  品牌 *
                </label>
                <select
                  value={selectedBrandId}
                  onChange={(e) => {
                    setSelectedBrandId(e.target.value);
                    setValue('sku_id', ''); // 清空SKU选择
                  }}
                  disabled={!selectedCategoryId}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="">
                    {!selectedCategoryId 
                      ? '请先选择分类' 
                      : filteredBrands.length === 0 
                        ? '该分类下暂无品牌' 
                        : '选择品牌'
                    }
                  </option>
                  {filteredBrands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  装备型号 *
                </label>
                <select
                  {...register('sku_id')}
                  disabled={!selectedCategoryId || !selectedBrandId}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="">
                    {!selectedCategoryId 
                      ? '请先选择分类' 
                      : !selectedBrandId
                        ? '请先选择品牌'
                        : filteredSKUs.length === 0 
                          ? '该品牌下暂无型号' 
                          : '选择装备型号'
                    }
                  </option>
                  {filteredSKUs
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((sku) => (
                    <option key={sku.id} value={sku.id}>
                      {sku.name}
                      {sku.msrp_price && ` - ¥${sku.msrp_price}`}
                    </option>
                  ))}
                </select>
                {errors.sku_id && (
                  <p className="text-red-400 text-sm mt-1">{errors.sku_id.message}</p>
                )}
              </div>

              {/* Submit Missing Equipment */}
              <div className="md:col-span-3">
                <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-300 mb-2">
                        Can&apos;t find the equipment you&apos;re looking for?
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (!user) {
                            alert('Please login first to submit equipment');
                            return;
                          }
                          setShowSubmitModal(true);
                        }}
                        className="text-sm text-blue-400 hover:text-blue-300 underline font-medium"
                      >
                        Submit missing equipment for review
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  购买日期
                </label>
                <input
                  type="date"
                  {...register('purchase_date')}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                备注
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="记录购买渠道、价格或其他信息..."
              />
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
                {saving ? '保存中...' : '保存装备'}
              </button>
              
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {equipment.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
            <Activity className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">还没有装备记录</h3>
          <p className="text-gray-400 mb-6">
            添加您的运动装备，跟踪使用情况和里程数
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加第一个装备
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.map((item) => (
            <div
              key={item.id}
              className={`bg-gray-800 rounded-lg p-4 border-2 transition-colors ${
                item.is_active ? 'border-transparent' : 'border-gray-600 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {item.categories?.name && categoryLabels[item.categories.name as keyof typeof categoryLabels]?.split(' ')[0] || '📦'}
                  </span>
                  <div>
                    <h3 className="font-semibold text-sm">
                      {(() => {
                        const brandName = item.brands?.name;
                        const skuName = item.skus?.name;
                        const displayName = [brandName, skuName].filter(Boolean).join(' ');
                        console.log('装备显示信息:', { item, brandName, skuName, displayName });
                        return displayName || '未知装备';
                      })()}
                    </h3>
                    {item.categories && (
                      <p className="text-xs text-gray-400">
                        {item.categories.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, [item.brands?.name, item.skus?.name].filter(Boolean).join(' ') || '未知装备')}
                    className="p-1 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-gray-400">
                    <MapPin className="w-3 h-3" />
                    总里程
                  </span>
                  <span className="font-medium">
                    {item.total_distance > 0 ? `${item.total_distance.toFixed(1)} km` : '0 km'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-3 h-3" />
                    使用时间
                  </span>
                  <span className="font-medium">
                    {item.total_hours > 0 ? `${item.total_hours.toFixed(1)} 小时` : '0 小时'}
                  </span>
                </div>

                {item.purchase_date && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-gray-400">
                      <Calendar className="w-3 h-3" />
                      购买日期
                    </span>
                    <span className="font-medium">
                      {new Date(item.purchase_date).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                )}
              </div>

              {item.notes && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-400 line-clamp-2">{item.notes}</p>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => toggleActive(item.id, item.is_active)}
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    item.is_active 
                      ? 'bg-green-900 text-green-400' 
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {item.is_active ? '使用中' : '已停用'}
                </button>
                <span className="text-xs text-gray-500">
                  {item.categories?.name && categoryLabels[item.categories.name as keyof typeof categoryLabels]?.split(' ').slice(1).join(' ') || item.categories?.name || '未知分类'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Equipment Modal */}
      <SubmitEquipmentModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
};