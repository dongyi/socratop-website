'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppleCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = () => {
      // Apple Sign-In 通常使用 popup 模式，不需要特殊的回调页面处理
      // 但如果配置为 redirect 模式，可以在这里处理
      
      // 从 URL 参数获取授权码
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (code && state === 'signin') {
        // 处理授权码，通常需要发送到后端验证
        console.log('Apple Sign-In callback received:', { code, state });
        
        // 重定向到主页
        router.push('/');
      } else {
        console.error('Invalid callback parameters');
        router.push('/');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p>Processing Apple Sign-In...</p>
      </div>
    </div>
  );
}