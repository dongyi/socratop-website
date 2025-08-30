'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function StravaCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleStravaCallback = async () => {
      try {
        // 检查用户是否已登录
        if (!isAuthenticated || !user) {
          setStatus('error');
          setMessage('请先登录账户');
          setTimeout(() => router.push('/'), 3000);
          return;
        }

        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage('Strava授权被取消');
          setTimeout(() => router.push('/profile?tab=strava'), 3000);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('未收到授权码');
          setTimeout(() => router.push('/profile?tab=strava'), 3000);
          return;
        }

        // 调用后端API交换access token
        const response = await fetch('/api/strava/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, userId: user.id }),
        });

        if (!response.ok) {
          throw new Error('获取Strava访问令牌失败');
        }

        const result = await response.json();
        
        if (result.success) {
          setStatus('success');
          setMessage('Strava账号连接成功！');
          setTimeout(() => router.push('/profile?tab=strava'), 2000);
        } else {
          throw new Error(result.error || '连接失败');
        }

      } catch (error) {
        console.error('Strava callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : '连接过程中发生错误');
        setTimeout(() => router.push('/profile?tab=strava'), 3000);
      }
    };

    handleStravaCallback();
  }, [searchParams, router, user, isAuthenticated]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <h1 className="text-2xl font-light mb-2">正在连接Strava...</h1>
            <p className="text-gray-400">请稍候，我们正在处理您的授权</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-light mb-2 text-green-400">连接成功！</h1>
            <p className="text-gray-400 mb-4">{message}</p>
            <p className="text-sm text-gray-500">正在跳转到个人中心...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-light mb-2 text-red-400">连接失败</h1>
            <p className="text-gray-400 mb-4">{message}</p>
            <p className="text-sm text-gray-500">3秒后自动返回...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function StravaCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-light mb-2">Loading...</h1>
          <p className="text-gray-400">Please wait while we process your request</p>
        </div>
      </div>
    }>
      <StravaCallbackContent />
    </Suspense>
  );
}