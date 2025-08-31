'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  Activity
} from 'lucide-react';

const equipmentSchema = z.object({
  name: z.string().min(1, '请输入装备名称').max(100, '名称不能超过100个字符'),
  sku_id: z.string().min(1, '请选择装备型号'),
  purchase_date: z.string().optional().or(z.literal('')),
  notes: z.string().max(500, '备注不能超过500个字符').optional().or(z.literal('')),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

interface Equipment {
  id: string;
  name: string;
  category?: string;
  brand?: string;
  model?: string;
  sku_id?: string;
  brand_id?: string;
  category_id?: string;
  purchase_date?: string;
  total_distance: number;
  total_hours: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
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
  model_number: string;
  description?: string;
  msrp_price?: number;
  brand_id: string;
  category_id: string;
  brands?: Brand | Brand[];
  categories?: Category | Category[];
}

const categoryLabels = {
  shoes: '🏃‍♂️ 跑鞋',
  watch: '⌚ 运动手表',
  bike: '🚴‍♂️ 自行车',
  clothing: '👕 运动服装',
  accessories: '🎒 配件',
};

export const EquipmentManager = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [skus, setSKUs] = useState<SKU[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [filteredSKUs, setFilteredSKUs] = useState<SKU[]>([]);

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
      // 加载用户装备
      const { data, error } = await getSupabase()
        .from('sports_equipment')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setEquipment(data || []);
    } catch (error) {
      console.error('加载装备列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadBrandsAndCategories = useCallback(async () => {
    try {
      // 加载品牌
      const { data: brandsData, error: brandsError } = await getSupabase()
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (brandsError) {
        console.error('品牌查询错误:', brandsError);
      } else {
        setBrands(brandsData || []);
      }

      // 加载类别
      const { data: categoriesData, error: categoriesError } = await getSupabase()
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (categoriesError) {
        console.error('类别查询错误:', categoriesError);
      } else {
        setCategories(categoriesData || []);
      }

      // 加载所有SKU
      const { data: skusData, error: skusError } = await getSupabase()
        .from('skus')
        .select(`
          id,
          name,
          model_number,
          description,
          msrp_price,
          brand_id,
          category_id,
          brands:brand_id(id, name),
          categories:category_id(id, name)
        `)
        .eq('is_discontinued', false);

      if (skusError) {
        console.error('SKU查询错误:', skusError);
      } else {
        setSKUs(skusData || []);
      }
    } catch (error) {
      console.error('加载品牌和类别失败:', error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadEquipment();
      loadBrandsAndCategories();
    }
  }, [user, loadEquipment, loadBrandsAndCategories]);

  // 根据品牌和类别过滤SKU
  useEffect(() => {
    let filtered = skus;
    
    if (selectedBrandId) {
      filtered = filtered.filter(sku => sku.brand_id === selectedBrandId);
    }
    
    if (selectedCategoryId) {
      filtered = filtered.filter(sku => sku.category_id === selectedCategoryId);
    }
    
    setFilteredSKUs(filtered);
  }, [skus, selectedBrandId, selectedCategoryId]);

  const onSubmit = async (data: EquipmentFormData) => {
    if (!user) return;

    setSaving(true);
    try {
      // 查找选中的SKU信息
      const selectedSKU = skus.find(sku => sku.id === data.sku_id);
      if (!selectedSKU) {
        alert('请选择有效的装备型号');
        return;
      }

      const equipmentData = {
        name: data.name,
        sku_id: data.sku_id,
        brand_id: selectedSKU.brand_id,
        category_id: selectedSKU.category_id,
        brand: Array.isArray(selectedSKU.brands) ? selectedSKU.brands[0]?.name : selectedSKU.brands?.name || null,
        category: Array.isArray(selectedSKU.categories) ? selectedSKU.categories[0]?.name : selectedSKU.categories?.name || null,
        model: selectedSKU.name,
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
      console.error('保存装备失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Equipment) => {
    setEditingId(item.id);
    setShowForm(true);
    setValue('name', item.name);
    setValue('sku_id', item.sku_id || '');
    setValue('purchase_date', item.purchase_date || '');
    setValue('notes', item.notes || '');
    
    // 设置品牌和类别选择以便过滤SKU
    if (item.brand_id) {
      setSelectedBrandId(item.brand_id);
    }
    if (item.category_id) {
      setSelectedCategoryId(item.category_id);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowForm(false);
    setSelectedBrandId('');
    setSelectedCategoryId('');
    reset();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!user) return;

    if (!confirm(`确定要删除装备"${name}"吗？此操作无法撤销。`)) {
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
      alert('删除失败，请重试');
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
      alert('更新失败，请重试');
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
            <h2 className="text-2xl font-semibold">运动装备</h2>
            <p className="text-gray-400">管理您的运动装备和使用记录</p>
          </div>
        </div>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加装备
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingId ? '编辑装备' : '添加新装备'}
            </h3>
            <button
              onClick={handleCancelEdit}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  装备名称 *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例如：我的跑鞋"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  品牌
                </label>
                <select
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">选择品牌</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  类别
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">选择类别</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  装备型号 *
                </label>
                <select
                  {...register('sku_id')}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={filteredSKUs.length === 0}
                >
                  <option value="">
                    {filteredSKUs.length === 0 
                      ? (selectedBrandId || selectedCategoryId ? '没有符合条件的型号' : '请先选择品牌或类别') 
                      : '选择装备型号'
                    }
                  </option>
                  {filteredSKUs.map((sku) => {
                    const brandName = Array.isArray(sku.brands) ? sku.brands[0]?.name : sku.brands?.name;
                    const categoryName = Array.isArray(sku.categories) ? sku.categories[0]?.name : sku.categories?.name;
                    return (
                      <option key={sku.id} value={sku.id}>
                        {brandName} {sku.name} - {categoryName}
                        {sku.msrp_price && ` (¥${sku.msrp_price})`}
                      </option>
                    );
                  })}
                </select>
                {errors.sku_id && (
                  <p className="text-red-400 text-sm mt-1">{errors.sku_id.message}</p>
                )}
                {filteredSKUs.length === 0 && (selectedBrandId || selectedCategoryId) && (
                  <p className="text-yellow-400 text-sm mt-1">
                    没有找到符合条件的装备型号，请尝试其他品牌或类别组合
                  </p>
                )}
              </div>

              <div>
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
                    {categoryLabels[item.category as keyof typeof categoryLabels]?.split(' ')[0]}
                  </span>
                  <div>
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    {(item.brand || item.model) && (
                      <p className="text-xs text-gray-400">
                        {[item.brand, item.model].filter(Boolean).join(' ')}
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
                    onClick={() => handleDelete(item.id, item.name)}
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
                  {categoryLabels[item.category as keyof typeof categoryLabels]?.split(' ').slice(1).join(' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};