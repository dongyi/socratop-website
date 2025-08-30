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
    title: "Cadence - The Perfect Running Companion | Smart Metronome & GPS Tracker",
    description: "Run with perfect rhythm. Cadence combines a smart metronome, GPS tracking, and music integration for the ultimate running experience. Download now on App Store.",
    hero_title: "Cadence180",
    hero_description: "The perfect running companion that syncs your steps with your rhythm. Built-in metronome, GPS tracking, and seamless music integration.",
    download_on: "Download on the",
    app_store: "App Store",
    learn_more: "Learn More",
    get_in_touch: "Get in Touch",
    features_title: "Run with Perfect Rhythm",
    available_now: "Available now on the App Store",
    download_cadence: "Download Cadence",
    smart_metronome: "Smart Metronome",
    smart_metronome_desc: "Adjustable BPM from 160-200 to match your perfect running cadence. Background audio support keeps the beat going.",
    gps_tracking: "GPS Tracking",
    gps_tracking_desc: "Precise location tracking with intelligent filtering. View your route, distance, and pace in real-time.",
    music_integration: "Music Integration",
    music_integration_desc: "Seamlessly play your Apple Music playlists and podcasts while maintaining perfect running rhythm.",
    see_in_action: "See Cadence in Action",
    metronome_control: "Metronome Control",
    metronome_control_desc: "Set your perfect BPM and start your run",
    music_integration_screen: "Music Integration",
    music_integration_screen_desc: "Control your music while maintaining rhythm",
    track_progress: "Track Progress",
    track_progress_desc: "View detailed stats after each run",
    contact_title: "Get in Touch",
    contact_description: "Have questions about Cadence? Want to provide feedback or report an issue? We'd love to hear from you.",
    email_us: "Email Us",
    email_description: "Send us your thoughts, suggestions, or bug reports",
    footer_copyright: "© 2024 Cadence. Built with passion for runners.",
    // Workout Analyzer
    workout_analyzer_title: "Workout Data Analyzer",
    workout_analyzer_subtitle: "Parse and visualize your FIT workout data files",
    back_to_home: "Back to Home",
    upload_fit_files: "Upload FIT Files",
    select_or_drag_files: "Select or drag FIT files",
    supports_multiple_files: "Supports multiple files upload, .fit format only",
    parser_loading: "Loading parser...",
    parsing_files: "Parsing files...",
    parsing_failed: "Parser loading failed",
    please_select_fit: "Please select .fit format files",
    parsing_success: "✅ FIT Parser loaded successfully! You can upload files now",
    module_export_error: "❌ Module export is not a constructor",
    loading_failed: "❌ Loading failed",
    debug_status: "Status",
    parser_ready: "Parser Ready",
    parser_type: "Parser Type",
    parse_results_summary: "Parse Results Summary",
    sessions: "Sessions",
    records: "Records",
    activity_sessions: "Activity Sessions",
    view_raw_data: "View Raw Data (JSON)",
    chart_analysis: "Chart Analysis",
    data_points: "Data Points",
    no_chart_data: "No visualizable workout data in this file",
    filter_outliers: "Filter Outliers (2σ Rule)",
    filter_outliers_desc: "When enabled, filters out data points that deviate more than 2 standard deviations from the mean",
    heart_rate: "Heart Rate (bpm)",
    pace: "Pace (min/km)",
    power: "Power (W)",
    time: "Time",
    value: "Value",
    data_point: "Data Point",
    // Homepage additional translations
    workout_data_analysis: "Workout Data Analysis",
    workout_data_analysis_desc: "Professional FIT file analysis tool with multi-dimensional data visualization for heart rate, pace, power and more to help you deeply analyze your training performance.",
    try_now: "Try Now →",
    // New homepage content
    platform_subtitle: "Professional Sports Data Platform - Connect, Analyze, and Improve Your Performance",
    start_data_analysis: "Start Data Analysis",
    learn_more_features: "Learn More Features",
    contact_us: "Contact Us",
    cadence_app: "Cadence App",
    cadence_app_desc: "Smart metronome + GPS running tracking, a professional app tailored for runners",
    app_store: "App Store",
    learn_details: "Learn Details",
    data_analysis_platform: "Data Analysis Platform",
    data_platform_desc: "Connect Strava, analyze sports data, manage equipment, create personal sports profile",
    try_now_btn: "Try Now",
    feature_intro: "Feature Introduction",
    multi_platform_title: "Multi-Platform Sports Ecosystem",
    cadence_running_app: "Cadence Running App",
    cadence_running_desc: "Perfect combination of smart metronome and GPS tracking, providing professional training tools for runners",
    download_cadence: "Download Cadence",
    smart_metronome_new: "Smart Metronome",
    smart_metronome_desc_new: "Adjustable 160-200 BPM to help maintain stable running rhythm",
    gps_tracking_new: "GPS Tracking",
    gps_tracking_desc_new: "Precisely record running routes, distance, pace and movement tracks",
    music_integration_new: "Music Integration",
    music_integration_desc_new: "Seamlessly connect Apple Music and podcasts, enjoy music while running",
    background_support: "Background Support",
    background_support_desc: "Supports background audio playback, works normally even when screen is locked",
    data_platform_title: "Data Analysis Platform",
    data_platform_subtitle: "Connect multiple data sources to create a personal sports data center and scientifically analyze sports performance",
    try_experience: "Try Experience",
    personal_center: "Personal Center",
    strava_integration: "Strava Integration",
    strava_integration_desc: "Connect your Strava account to automatically sync your sports activity data",
    data_visualization: "Data Visualization",
    data_visualization_desc: "Rich chart displays with multi-dimensional analysis of your sports performance",
    equipment_management: "Equipment Management",
    equipment_management_desc: "Record and track sports equipment usage, plan replacements reasonably",
    personal_profile: "Personal Profile",
    personal_profile_desc: "Complete sports history records, build your exclusive sports data profile",
    // Navigation
    nav_home: "Home",
    nav_data_analysis: "Data Analysis",
    nav_personal_center: "Personal Center",
    nav_sign_out: "Sign Out"
  },
  zh: {
    title: "Cadence - 完美的跑步伴侣 | 智能节拍器和GPS追踪器",
    description: "以完美的节奏奔跑。Cadence结合了智能节拍器、GPS追踪和音乐集成，为您提供终极跑步体验。立即在App Store下载。",
    hero_title: "Cadence",
    hero_description: "完美的跑步伴侣，让您的步伐与节奏同步。内置节拍器、GPS追踪和无缝音乐集成。",
    download_on: "下载于",
    app_store: "App Store",
    learn_more: "了解更多",
    get_in_touch: "联系我们",
    features_title: "以完美节奏奔跑",
    available_now: "现已在App Store上架",
    download_cadence: "下载 Cadence",
    smart_metronome: "智能节拍器",
    smart_metronome_desc: "可调节BPM从160-200，匹配您完美的跑步步频。后台音频支持保持节拍。",
    gps_tracking: "GPS追踪",
    gps_tracking_desc: "精确的位置追踪和智能过滤。实时查看您的路线、距离和配速。",
    music_integration: "音乐集成",
    music_integration_desc: "在保持完美跑步节奏的同时，无缝播放您的Apple Music播放列表和播客。",
    see_in_action: "查看 Cadence 实际运行",
    metronome_control: "节拍器控制",
    metronome_control_desc: "设置您的完美BPM并开始跑步",
    music_integration_screen: "音乐集成",
    music_integration_screen_desc: "在保持节奏的同时控制您的音乐",
    track_progress: "追踪进度",
    track_progress_desc: "查看每次跑步后的详细统计",
    contact_title: "联系我们",
    contact_description: "对Cadence有疑问？想要提供反馈或报告问题？我们很乐意听取您的意见。",
    email_us: "发邮件给我们",
    email_description: "向我们发送您的想法、建议或错误报告",
    footer_copyright: "© 2024 Cadence. 为跑步者倾情打造。",
    icp_filing: "苏ICP备2024123456号-1",
    // Workout Analyzer
    workout_analyzer_title: "运动数据分析器",
    workout_analyzer_subtitle: "解析和可视化你的FIT运动数据文件",
    back_to_home: "返回主页",
    upload_fit_files: "上传FIT文件",
    select_or_drag_files: "选择或拖拽FIT文件",
    supports_multiple_files: "支持多个文件同时上传，仅支持.fit格式",
    parser_loading: "正在加载解析器...",
    parsing_files: "解析中...",
    parsing_failed: "解析器加载失败",
    please_select_fit: "请选择 .fit 格式的文件",
    parsing_success: "✅ FIT Parser 加载成功！可以上传文件了",
    module_export_error: "❌ 模块导出不是构造函数",
    loading_failed: "❌ 加载失败",
    debug_status: "状态",
    parser_ready: "Parser Ready",
    parser_type: "Parser Type",
    parse_results_summary: "解析结果概要",
    sessions: "Sessions",
    records: "Records",
    activity_sessions: "Activity Sessions",
    view_raw_data: "查看原始数据 (JSON)",
    chart_analysis: "图表分析",
    data_points: "个数据点",
    no_chart_data: "该文件暂无可视化的运动数据",
    filter_outliers: "过滤异常值 (2σ 规则)",
    filter_outliers_desc: "启用后将过滤掉偏离平均值超过2个标准差的数据点",
    heart_rate: "心率 (bpm)",
    pace: "配速 (min/km)",
    power: "功率 (W)",
    time: "时间",
    value: "数值",
    data_point: "数据点",
    // Homepage additional translations
    workout_data_analysis: "运动数据分析",
    workout_data_analysis_desc: "专业的FIT文件分析工具，支持心率、配速、功率等多维度数据可视化，帮你深度分析训练表现。",
    try_now: "立即体验 →",
    // New homepage content
    platform_subtitle: "专业的运动数据平台 - 连接、分析、提升您的运动表现",
    start_data_analysis: "🏃 开始数据分析",
    learn_more_features: "了解更多功能",
    contact_us: "联系我们",
    cadence_app: "Cadence App",
    cadence_app_desc: "智能节拍器 + GPS跑步追踪，为跑者量身打造的专业应用",
    app_store: "App Store",
    learn_details: "了解详情",
    data_analysis_platform: "数据分析平台",
    data_platform_desc: "连接Strava，分析运动数据，管理装备，打造个人运动档案",
    try_now_btn: "立即体验",
    feature_intro: "功能介绍",
    multi_platform_title: "多元化运动平台",
    cadence_running_app: "Cadence 跑步应用",
    cadence_running_desc: "智能节拍器与GPS追踪完美结合，为跑者提供专业的训练工具",
    download_cadence: "下载 Cadence",
    smart_metronome_new: "智能节拍器",
    smart_metronome_desc_new: "160-200 BPM可调节拍，帮助保持稳定的跑步节奏",
    gps_tracking_new: "GPS追踪",
    gps_tracking_desc_new: "精准记录跑步路径、距离、配速和运动轨迹",
    music_integration_new: "音乐集成",
    music_integration_desc_new: "无缝连接Apple Music和播客，享受音乐伴跑",
    background_support: "后台运行",
    background_support_desc: "支持后台音频播放，锁屏状态下也能正常使用",
    data_platform_title: "数据分析平台",
    data_platform_subtitle: "连接多个数据源，打造个人运动数据中心，科学分析运动表现",
    try_experience: "立即体验",
    personal_center: "个人中心",
    strava_integration: "Strava集成",
    strava_integration_desc: "连接Strava账号，自动同步您的运动活动数据",
    data_visualization: "数据可视化",
    data_visualization_desc: "丰富的图表展示，多维度分析您的运动表现",
    equipment_management: "装备管理",
    equipment_management_desc: "记录和追踪运动装备使用情况，合理规划更换",
    personal_profile: "个人档案",
    personal_profile_desc: "完整的运动历史记录，构建专属的运动数据档案",
    // Navigation
    nav_home: "首页",
    nav_data_analysis: "数据分析",
    nav_personal_center: "个人中心",
    nav_sign_out: "退出"
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
      setLanguage(savedLanguage);
    } else {
      // Default to English - no browser language detection
      setLanguage('en');
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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