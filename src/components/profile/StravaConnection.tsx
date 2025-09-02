'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSupabase } from '@/lib/supabase';
import { ExternalLink, Unlink, Activity, MapPin, Clock, Award } from 'lucide-react';
import Image from 'next/image';

interface StravaConnection {
  strava_user_id: number;
  athlete_data: {
    firstname: string;
    lastname: string;
    profile_medium: string;
    city: string;
    state: string;
    country: string;
    follower_count: number;
    friend_count: number;
    athlete_type: number;
  };
  created_at: string;
}

export const StravaConnection = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState<StravaConnection | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  const loadConnection = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await getSupabase()
        .from('strava_connections')
        .select('strava_user_id, athlete_data, created_at')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Load Strava connection failed:', error);
        return;
      }

      setConnection(data);
    } catch (error) {
      console.error('Error loading Strava connection:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadConnection();
    }
  }, [user, loadConnection]);

  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_STRAVA_REDIRECT_URI;
    
    if (!clientId || !redirectUri) {
      alert('Strava configuration error, please contact administrator');
      return;
    }

    const scope = 'read,activity:read_all';
    const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=force&scope=${scope}`;
    
    window.location.href = stravaAuthUrl;
  };

  const handleDisconnect = async () => {
    if (!user || !connection) return;

    if (!confirm(t('strava_disconnect_confirm'))) {
      return;
    }

    setDisconnecting(true);
    try {
      const { error } = await getSupabase()
        .from('strava_connections')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Also delete related activity data
      await getSupabase()
        .from('activities')
        .delete()
        .eq('user_id', user.id)
        .not('strava_activity_id', 'is', null);

      setConnection(null);
      alert('Strava connection disconnected successfully');
    } catch (error) {
      console.error('Disconnect Strava connection failed:', error);
      alert('Disconnect failed, please try again');
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">{t('strava_connection')}</h2>
          <p className="text-gray-400">{t('strava_connection_desc')}</p>
        </div>
      </div>

      {!connection ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
            <Activity className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('strava_not_connected')}</h3>
          <p className="text-gray-400 mb-6">
            {t('strava_connect_desc')}
          </p>
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>{t('strava_sync_routes')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>{t('strava_record_time')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-orange-500" />
                <span>{t('strava_analyze_performance')}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleConnect}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            {t('strava_connect_button')}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-gray-800 rounded-lg">
            <Image
              src={connection.athlete_data.profile_medium || '/default-avatar.png'}
              alt="Strava Avatar"
              width={64}
              height={64}
              className="w-16 h-16 rounded-full"
            />
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">
                {connection.athlete_data.firstname} {connection.athlete_data.lastname}
              </h3>
              <div className="text-gray-400 space-y-1">
                {(connection.athlete_data.city || connection.athlete_data.state || connection.athlete_data.country) && (
                  <p className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {[connection.athlete_data.city, connection.athlete_data.state, connection.athlete_data.country]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
                <p className="text-sm">
                  {t('strava_connection_time')}: {new Date(connection.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="flex gap-4 text-sm">
                <div>
                  <div className="font-medium">{connection.athlete_data.follower_count}</div>
                  <div className="text-gray-400">{t('strava_followers')}</div>
                </div>
                <div>
                  <div className="font-medium">{connection.athlete_data.friend_count}</div>
                  <div className="text-gray-400">{t('strava_following')}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <Activity className="w-5 h-5" />
              <span className="font-medium">{t('strava_connected')}</span>
            </div>
            <p className="text-sm text-gray-300">
              {t('strava_connected_desc')}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white rounded-md font-medium transition-colors"
            >
              {disconnecting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Unlink className="w-4 h-4" />
              )}
              {disconnecting ? t('strava_disconnecting') : t('strava_disconnect')}
            </button>
            
            <a
              href="https://www.strava.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 text-sm flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              {t('strava_visit')}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};