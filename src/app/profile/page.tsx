'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { UserProfile } from '@/components/profile/UserProfile';
import { StravaConnection } from '@/components/profile/StravaConnection';
import { EquipmentManager } from '@/components/profile/EquipmentManager';

export default function ProfilePage() {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-white pt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-light mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {t('profile_page_title')}
          </h1>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-900 mb-8">
              <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:text-black">
                {t('profile_tab_account')}
              </TabsTrigger>
              <TabsTrigger value="strava" className="data-[state=active]:bg-white data-[state=active]:text-black">
                {t('profile_tab_strava')}
              </TabsTrigger>
              <TabsTrigger value="equipment" className="data-[state=active]:bg-white data-[state=active]:text-black">
                {t('profile_tab_equipment')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <UserProfile />
            </TabsContent>
            
            <TabsContent value="strava">
              <StravaConnection />
            </TabsContent>
            
            <TabsContent value="equipment">
              <EquipmentManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}