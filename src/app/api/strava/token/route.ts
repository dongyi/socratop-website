import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const STRAVA_CLIENT_ID = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

export async function POST(request: NextRequest) {
  try {
    const { code, userId } = await request.json();

    if (!code || !userId) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Strava配置错误' },
        { status: 500 }
      );
    }

    // 向Strava交换access token
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Strava token exchange failed:', errorText);
      return NextResponse.json(
        { success: false, error: '获取Strava访问令牌失败' },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.errors) {
      console.error('Strava token errors:', tokenData.errors);
      return NextResponse.json(
        { success: false, error: '授权码无效或已过期' },
        { status: 400 }
      );
    }

    // 保存连接信息到数据库
    const { error: dbError } = await supabase
      .from('strava_connections')
      .upsert({
        user_id: userId,
        strava_user_id: tokenData.athlete.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
        athlete_data: tokenData.athlete,
        updated_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('Database save error:', dbError);
      return NextResponse.json(
        { success: false, error: '保存连接信息失败' },
        { status: 500 }
      );
    }

    // 开始同步最近的活动数据
    try {
      await syncRecentActivities(userId, tokenData.access_token);
    } catch (syncError) {
      console.error('Initial sync failed:', syncError);
      // 不阻断连接流程，只记录错误
    }

    return NextResponse.json({
      success: true,
      athlete: {
        id: tokenData.athlete.id,
        firstname: tokenData.athlete.firstname,
        lastname: tokenData.athlete.lastname,
        profile_medium: tokenData.athlete.profile_medium,
      },
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}

// 同步最近的活动数据
async function syncRecentActivities(userId: string, accessToken: string) {
  try {
    // 获取最近30天的活动
    const thirtyDaysAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
    
    const activitiesResponse = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${thirtyDaysAgo}&per_page=50`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!activitiesResponse.ok) {
      throw new Error('Failed to fetch activities');
    }

    const activities = await activitiesResponse.json();

    // 批量插入活动数据
    if (activities.length > 0) {
      const activitiesData = activities.map((activity: any) => ({
        user_id: userId,
        strava_activity_id: activity.id,
        name: activity.name,
        type: activity.type,
        distance: activity.distance ? activity.distance / 1000 : 0, // 转换为公里
        duration: activity.moving_time,
        elevation_gain: activity.total_elevation_gain,
        start_date: activity.start_date,
        data: activity,
      }));

      const { error } = await supabase
        .from('activities')
        .upsert(activitiesData, {
          onConflict: 'strava_activity_id',
        });

      if (error) {
        console.error('Failed to save activities:', error);
      }
    }
  } catch (error) {
    console.error('Sync activities error:', error);
    throw error;
  }
}