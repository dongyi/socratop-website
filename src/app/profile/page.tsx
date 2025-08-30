'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { UserProfile } from '@/components/profile/UserProfile';
import { StravaConnection } from '@/components/profile/StravaConnection';
import { EquipmentManager } from '@/components/profile/EquipmentManager';

export default function ProfilePage() {
  const { isAuthenticated, loading } = useAuth();
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
            个人中心
          </h1>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-900 mb-8">
              <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:text-black">
                账户信息
              </TabsTrigger>
              <TabsTrigger value="strava" className="data-[state=active]:bg-white data-[state=active]:text-black">
                Strava连接
              </TabsTrigger>
              <TabsTrigger value="equipment" className="data-[state=active]:bg-white data-[state=active]:text-black">
                运动装备
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