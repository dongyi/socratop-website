'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSupabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Settings, Save } from 'lucide-react';

const createProfileSchema = (t: (key: string) => string) => z.object({
  display_name: z.string().min(1, t('profile_display_name_required')).max(50, t('profile_display_name_max_length')),
});

type ProfileFormData = {
  display_name: string;
};


export const UserProfile = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const profileSchema = createProfileSchema(t);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const loadProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await getSupabase()
        .from('users_profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Load user profile failed:', error);
        return;
      }

      if (data) {
        setValue('display_name', data.display_name || '');
      } else {
        // If no profile record, create one
        const { error: insertError } = await getSupabase()
          .from('users_profiles')
          .insert({
            id: user.id,
            display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          });

        if (insertError) {
          console.error('Create user profile failed:', insertError);
        } else {
          loadProfile(); // Reload
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user, setValue]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user, loadProfile]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await getSupabase()
        .from('users_profiles')
        .upsert({
          id: user.id,
          display_name: data.display_name,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      // Profile updated successfully
      alert(t('profile_save_success'));
    } catch (error) {
      console.error('Save user profile failed:', error);
      alert(t('profile_save_error'));
    } finally {
      setSaving(false);
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
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">{t('profile_account_info')}</h2>
          <p className="text-gray-400">{t('profile_account_desc')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('profile_email')}
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">{t('profile_email_readonly')}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('profile_display_name')} *
          </label>
          <input
            type="text"
            {...register('display_name')}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('profile_display_name_placeholder')}
          />
          {errors.display_name && (
            <p className="text-red-400 text-sm mt-1">{errors.display_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('profile_registration_time')}
          </label>
          <input
            type="text"
            value={user?.created_at ? new Date(user.created_at).toLocaleString('zh-CN') : ''}
            disabled
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-400 cursor-not-allowed"
          />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={!isDirty || saving}
            className={`
              flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-colors
              ${isDirty && !saving
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? t('profile_saving') : t('profile_save_changes')}
          </button>
          
          <div className="flex items-center text-sm text-gray-500">
            <Settings className="w-4 h-4 mr-1" />
            {isDirty ? t('profile_unsaved_changes') : t('profile_synced')}
          </div>
        </div>
      </form>
    </div>
  );
};