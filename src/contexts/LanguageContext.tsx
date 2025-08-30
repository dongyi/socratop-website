'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Header Navigation
    nav_home: "Home",
    nav_data_analysis: "Data Analysis",
    nav_personal_center: "Personal Center",
    nav_sign_out: "Sign Out",
    
    // Homepage Hero
    title: "Socratop - Professional Sports Data Platform",
    description: "Professional sports data platform connecting athletes, analyzing performance data, and enhancing training effectiveness.",
    hero_title: "Socratop",
    hero_description: "Professional Sports Data Platform - Connect, Analyze, and Improve Your Performance",
    platform_subtitle: "Professional Sports Data Platform - Connect, Analyze, and Improve Your Performance",
    start_data_analysis: "Start Data Analysis",
    learn_more_features: "Learn More Features",
    contact_us: "Contact Us",
    
    // Features Section
    feature_intro: "Feature Introduction",
    multi_platform_title: "Multi-Platform Sports Ecosystem",
    
    // Cadence App
    cadence_app: "Cadence App",
    cadence_app_desc: "Smart metronome + GPS running tracking, a professional app tailored for runners",
    cadence_running_app: "Cadence Running App",
    cadence_running_desc: "Perfect combination of smart metronome and GPS tracking, providing professional training tools for runners",
    download_cadence: "Download Cadence",
    app_store: "App Store",
    learn_details: "Learn Details",
    
    // Smart Metronome
    smart_metronome: "Smart Metronome",
    smart_metronome_desc: "Adjustable BPM from 160-200 to match your perfect running cadence. Background audio support keeps the beat going.",
    smart_metronome_new: "Smart Metronome",
    smart_metronome_desc_new: "Adjustable 160-200 BPM to help maintain stable running rhythm",
    
    // GPS Tracking
    gps_tracking: "GPS Tracking",
    gps_tracking_desc: "Real-time GPS tracking with detailed route mapping and performance metrics.",
    gps_tracking_new: "GPS Tracking",
    gps_tracking_desc_new: "Real-time location tracking and route recording",
    
    // Music Integration
    music_integration: "Music Integration",
    music_integration_desc: "Seamless integration with Apple Music and Spotify. Control your music without leaving the app.",
    music_integration_new: "Music Integration",
    music_integration_desc_new: "Seamless integration with music apps",
    
    // Data Analysis Platform
    data_analysis_platform: "Data Analysis Platform",
    data_platform_desc: "Connect Strava, analyze sports data, manage equipment, create personal sports profile",
    data_platform_title: "Sports Data Analysis Platform",
    data_platform_subtitle: "Professional FIT file analysis with comprehensive data visualization",
    try_now_btn: "Try Now",
    
    // Data Visualization
    data_visualization: "Data Visualization",
    data_visualization_desc: "Advanced data visualization with multiple chart types and detailed analytics",
    sports_data_visualization: "Sports Data Visualization",
    sports_data_viz_desc: "Professional workout data analysis platform, supporting FIT file upload and multi-dimensional visualization",
    try_data_analysis: "Try Data Analysis",
    
    // Equipment Management
    equipment_management: "Equipment Management",
    equipment_management_desc: "Track your sports equipment usage and maintenance schedules",
    
    // Personal Profile
    personal_profile: "Personal Profile",
    personal_profile_desc: "Create your personal sports profile and track your progress",
    
    // Strava Integration
    strava_integration: "Strava Integration",
    strava_integration_desc: "Connect your Strava account for seamless data synchronization",
    
    // Workout Analyzer
    workout_analyzer_title: "Workout Data Analyzer",
    workout_analyzer_subtitle: "Professional FIT file analysis tool with multi-dimensional data visualization",
    workout_data_analysis: "Workout Data Analysis",
    workout_data_analysis_desc: "Professional FIT file analysis tool with multi-dimensional data visualization for heart rate, pace, power and more to help you deeply analyze your training performance.",
    upload_fit_files: "Upload FIT Files",
    select_or_drag_files: "Select or drag FIT files here",
    supports_multiple_files: "Supports multiple file upload",
    try_now: "Try Now →",
    please_select_fit: "Please select FIT files to upload",
    
    // Data Parser
    parser_loading: "Loading parser...",
    parser_ready: "Parser ready",
    parser_type: "Parser Type",
    parsing_files: "Parsing files...",
    parsing_success: "Parsing successful",
    parsing_failed: "Parsing failed",
    parse_results_summary: "Parse Results Summary",
    module_export_error: "Module export error",
    loading_failed: "Loading failed",
    
    // Chart Data
    heart_rate: "Heart Rate",
    pace: "Pace",
    power: "Power",
    time: "Time",
    value: "Value",
    data_point: "Data Point",
    data_points: "Data Points",
    sessions: "Sessions",
    activity_sessions: "Activity Sessions",
    records: "Records",
    no_chart_data: "No chart data available",
    view_raw_data: "View Raw Data",
    chart_analysis: "Chart Analysis",
    filter_outliers: "Filter Outliers",
    filter_outliers_desc: "Remove data points that are significantly different from the norm",
    
    // Contact
    contact_title: "Get in Touch",
    contact_description: "Have questions or feedback? We'd love to hear from you.",
    email_us: "Email Us",
    email_description: "Send us an email and we'll get back to you soon.",
    get_in_touch: "Get in Touch",
    
    // Footer
    footer_copyright: "© 2024 Socratop. All rights reserved.",
    
    // Common
    learn_more: "Learn More",
    available_now: "Available now on the App Store",
    download_on: "Download on the",
    see_in_action: "See in Action",
    try_experience: "Try Experience",
    back_to_home: "Back to Home",
    personal_center: "Personal Center",
    
    // Debug
    debug_status: "Debug Status",
    
    // Additional features
    background_support: "Background Support",
    background_support_desc: "Continues running in the background with audio cues",
    metronome_control: "Metronome Control",
    metronome_control_desc: "Fine-tune your running rhythm with precise BPM control",
    track_progress: "Track Progress",
    track_progress_desc: "Monitor your running improvement over time",
    music_integration_screen: "Music Integration",
    music_integration_screen_desc: "Control music playback without leaving the app"
  },
  zh: {
    // Header Navigation
    nav_home: "首页",
    nav_data_analysis: "数据分析",
    nav_personal_center: "个人中心",
    nav_sign_out: "退出登录",
    
    // Homepage Hero
    title: "Socratop - 专业运动数据平台",
    description: "专业的运动数据平台，连接运动员，分析运动表现，提升训练效果。",
    hero_title: "Socratop",
    hero_description: "专业的运动数据平台 - 连接、分析、提升您的运动表现",
    platform_subtitle: "专业的运动数据平台 - 连接、分析、提升您的运动表现",
    start_data_analysis: "🏃 开始数据分析",
    learn_more_features: "了解更多功能",
    contact_us: "联系我们",
    
    // Features Section
    feature_intro: "功能介绍",
    multi_platform_title: "多元化运动平台",
    
    // Cadence App
    cadence_app: "Cadence App",
    cadence_app_desc: "智能节拍器 + GPS跑步追踪，为跑者量身打造的专业应用",
    cadence_running_app: "Cadence 跑步应用",
    cadence_running_desc: "智能节拍器与GPS追踪完美结合，为跑者提供专业的训练工具",
    download_cadence: "下载 Cadence",
    app_store: "App Store",
    learn_details: "了解详情",
    
    // Smart Metronome
    smart_metronome: "智能节拍器",
    smart_metronome_desc: "160-200 BPM可调节，匹配您的完美跑步节奏。后台音频支持，节拍永不中断。",
    smart_metronome_new: "智能节拍器",
    smart_metronome_desc_new: "160-200 BPM可调节，帮助保持稳定的跑步节奏",
    
    // GPS Tracking
    gps_tracking: "GPS追踪",
    gps_tracking_desc: "实时GPS追踪，详细路线地图和运动数据分析。",
    gps_tracking_new: "GPS追踪",
    gps_tracking_desc_new: "实时位置追踪和路线记录",
    
    // Music Integration
    music_integration: "音乐集成",
    music_integration_desc: "与Apple Music和Spotify无缝集成。无需离开应用即可控制音乐播放。",
    music_integration_new: "音乐集成",
    music_integration_desc_new: "与音乐应用无缝集成",
    
    // Data Analysis Platform
    data_analysis_platform: "数据分析平台",
    data_platform_desc: "连接Strava，分析运动数据，管理装备，打造个人运动档案",
    data_platform_title: "运动数据分析平台",
    data_platform_subtitle: "专业的FIT文件分析，全面的数据可视化",
    try_now_btn: "立即体验",
    
    // Data Visualization
    data_visualization: "数据可视化",
    data_visualization_desc: "高级数据可视化，多种图表类型和详细分析",
    sports_data_visualization: "运动数据可视化",
    sports_data_viz_desc: "专业的运动数据分析平台，支持FIT文件上传和多维度可视化",
    try_data_analysis: "尝试数据分析",
    
    // Equipment Management
    equipment_management: "装备管理",
    equipment_management_desc: "追踪您的运动装备使用情况和维护计划",
    
    // Personal Profile
    personal_profile: "个人档案",
    personal_profile_desc: "创建个人运动档案，追踪进步轨迹",
    
    // Strava Integration
    strava_integration: "Strava集成",
    strava_integration_desc: "连接您的Strava账户，实现数据无缝同步",
    
    // Workout Analyzer
    workout_analyzer_title: "运动数据分析器",
    workout_analyzer_subtitle: "专业的FIT文件分析工具，多维度数据可视化",
    workout_data_analysis: "运动数据分析",
    workout_data_analysis_desc: "专业的FIT文件分析工具，提供心率、配速、功率等多维度数据可视化，帮助您深度分析训练表现。",
    upload_fit_files: "上传FIT文件",
    select_or_drag_files: "选择或拖拽FIT文件到此处",
    supports_multiple_files: "支持多文件上传",
    try_now: "立即体验 →",
    please_select_fit: "请选择FIT文件上传",
    
    // Data Parser
    parser_loading: "加载解析器中...",
    parser_ready: "解析器就绪",
    parser_type: "解析器类型",
    parsing_files: "解析文件中...",
    parsing_success: "解析成功",
    parsing_failed: "解析失败",
    parse_results_summary: "解析结果摘要",
    module_export_error: "模块导出错误",
    loading_failed: "加载失败",
    
    // Chart Data
    heart_rate: "心率",
    pace: "配速",
    power: "功率",
    time: "时间",
    value: "数值",
    data_point: "数据点",
    data_points: "数据点",
    sessions: "训练",
    activity_sessions: "活动训练",
    records: "记录",
    no_chart_data: "无图表数据",
    view_raw_data: "查看原始数据",
    chart_analysis: "图表分析",
    filter_outliers: "过滤异常值",
    filter_outliers_desc: "移除与正常值显著不同的数据点",
    
    // Contact
    contact_title: "联系我们",
    contact_description: "有问题或建议？我们很乐意听到您的声音。",
    email_us: "邮件联系",
    email_description: "发送邮件给我们，我们会尽快回复您。",
    get_in_touch: "联系我们",
    
    // Footer
    footer_copyright: "© 2024 Socratop. 保留所有权利。",
    
    // Common
    learn_more: "了解更多",
    available_now: "现已在App Store上线",
    download_on: "下载于",
    see_in_action: "查看演示",
    try_experience: "体验试用",
    back_to_home: "返回首页",
    personal_center: "个人中心",
    
    // Debug
    debug_status: "调试状态",
    
    // Additional features
    background_support: "后台支持",
    background_support_desc: "在后台继续运行，提供音频提示",
    metronome_control: "节拍器控制",
    metronome_control_desc: "精确的BPM控制，调整您的跑步节奏",
    track_progress: "追踪进度",
    track_progress_desc: "监控您的跑步进步过程",
    music_integration_screen: "音乐集成",
    music_integration_screen_desc: "无需离开应用即可控制音乐播放"
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Always default to English instead of browser detection
    setLanguage('en');
  }, []);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}