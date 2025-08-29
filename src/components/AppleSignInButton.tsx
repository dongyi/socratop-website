'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AppleIDConfig {
  clientId: string;
  scope: string;
  redirectURI: string;
  state: string;
  usePopup: boolean;
}

interface AppleAuthResponse {
  authorization: {
    id_token: string;
    code: string;
  };
  user?: {
    email: string;
    name: {
      firstName: string;
      lastName: string;
    };
  };
}

declare global {
  interface Window {
    AppleID: {
      auth: {
        init: (config: AppleIDConfig) => void;
        signIn: (config?: Partial<AppleIDConfig>) => Promise<AppleAuthResponse>;
      };
    };
  }
}

interface AppleSignInButtonProps {
  className?: string;
}

export default function AppleSignInButton({ className = "" }: AppleSignInButtonProps) {
  useEffect(() => {
    // Load Apple Sign-In SDK
    const script = document.createElement('script');
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.AppleID.auth.init({
        clientId: 'com.socratop.cadence.web',
        scope: 'name email',
        redirectURI: 'https://socratop.com/auth/apple/callback',
        state: 'signin',
        usePopup: true
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleAppleSignIn = async () => {
    try {
      const data = await window.AppleID.auth.signIn();
      console.log('Apple Sign-In Success:', data);
      
      // 处理登录成功
      if (data.authorization) {
        console.log('Apple ID Token:', data.authorization.id_token);
        
        // 使用 Supabase signInWithIdToken
        const { data: authData, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: data.authorization.id_token,
        });

        if (error) {
          console.error('Supabase auth error:', error.message);
          console.error('Full error:', error);
          return;
        }

        console.log('Supabase auth success:', authData);
        
        // 认证状态会通过 AuthContext 自动更新，无需刷新页面
      }
    } catch (error) {
      console.error('Apple Sign-In Error:', error);
    }
  };

  return (
    <button
      onClick={handleAppleSignIn}
      className={`flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg border border-gray-600 hover:border-gray-400 transition-colors ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.47-1.09-.42-2.09-.42-3.23 0-1.44.56-2.2.47-3.08-.47C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
      </svg>
      <span>Sign in with Apple</span>
    </button>
  );
}