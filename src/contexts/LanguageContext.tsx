"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "zh";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

const translations = {
  en: {
    // Header Navigation
    nav_home: "Home",
    nav_data_analysis: "Data Analysis",
    nav_personal_center: "Personal Center",
    nav_sign_out: "Sign Out",
    nav_sign_in_or_register: "Sign in or Register",

    // Homepage Hero
    title: "Socratop - Professional Sports Data Platform",
    description:
      "Professional sports data platform connecting athletes, analyzing performance data, and enhancing training effectiveness.",
    hero_title: "Socratop",
    hero_description:
      "Professional Sports Data Platform - Connect, Analyze, and Improve Your Performance",
    platform_subtitle:
      "Professional Sports Data Platform - Connect, Analyze, and Improve Your Performance",
    start_data_analysis: "Start Data Analysis",
    learn_more_features: "Learn More Features",
    contact_us: "Contact Us",

    // Features Section
    feature_intro: "Feature Introduction",
    multi_platform_title: "Multi-Platform Sports Ecosystem",

    // Cadence App
    cadence_app: "Cadence App",
    cadence_app_desc:
      "Smart metronome + GPS running tracking, a professional app tailored for runners",
    cadence_running_app: "Cadence Running App",
    cadence_running_desc:
      "Perfect combination of smart metronome and GPS tracking, providing professional training tools for runners",
    download_cadence: "Download Cadence",
    app_store: "App Store",
    learn_details: "Learn Details",

    // Smart Metronome
    smart_metronome: "Smart Metronome",
    smart_metronome_desc:
      "Adjustable BPM from 160-200 to match your perfect running cadence. Background audio support keeps the beat going.",
    smart_metronome_new: "Smart Metronome",
    smart_metronome_desc_new:
      "Adjustable 160-200 BPM to help maintain stable running rhythm",

    // GPS Tracking
    gps_tracking: "GPS Tracking",
    gps_tracking_desc:
      "Real-time GPS tracking with detailed route mapping and performance metrics.",
    gps_tracking_new: "GPS Tracking",
    gps_tracking_desc_new: "Real-time location tracking and route recording",

    // Music Integration
    music_integration: "Music Integration",
    music_integration_desc:
      "Seamless integration with Apple Music and Spotify. Control your music without leaving the app.",
    music_integration_new: "Music Integration",
    music_integration_desc_new: "Seamless integration with music apps",

    // Data Analysis Platform
    data_analysis_platform: "Data Analysis Platform",
    data_platform_desc:
      "Connect Strava, analyze sports data, manage equipment, create personal sports profile",
    data_platform_title: "Sports Data Analysis Platform",
    data_platform_subtitle:
      "Professional FIT file analysis with comprehensive data visualization",
    try_now_btn: "Try Now",

    // Data Visualization
    data_visualization: "Data Visualization",
    data_visualization_desc:
      "Advanced data visualization with multiple chart types and detailed analytics",
    sports_data_visualization: "Sports Data Visualization",
    sports_data_viz_desc:
      "Professional workout data analysis platform, supporting FIT file upload and multi-dimensional visualization",
    try_data_analysis: "Try Data Analysis",

    // Equipment Management
    equipment_management: "Equipment Management",
    equipment_management_desc:
      "Track your sports equipment usage and maintenance schedules",

    // Personal Profile
    personal_profile: "Personal Profile",
    personal_profile_desc:
      "Create your personal sports profile and track your progress",

    // Strava Integration
    strava_integration: "Strava Integration",
    strava_integration_desc:
      "Connect your Strava account for seamless data synchronization",

    // Workout Analyzer
    workout_analyzer_title: "Workout Data Analyzer",
    workout_analyzer_subtitle:
      "Professional FIT file analysis tool with multi-dimensional data visualization",
    workout_data_analysis: "Workout Data Analysis",
    workout_data_analysis_desc:
      "Professional FIT file analysis tool with multi-dimensional data visualization for heart rate, pace, power and more to help you deeply analyze your training performance.",
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
    filter_outliers_desc:
      "Remove data points that are significantly different from the norm",

    // Contact
    contact_title: "Get in Touch",
    contact_description:
      "Have questions or feedback? We'd love to hear from you.",
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

    // Profile Page
    profile_page_title: "Personal Center",
    profile_tab_account: "Account Info",
    profile_tab_strava: "Strava Connection",
    profile_tab_equipment: "Sports Equipment",

    // Debug
    debug_status: "Debug Status",

    // Additional features
    background_support: "Background Support",
    background_support_desc:
      "Continues running in the background with audio cues",
    metronome_control: "Metronome Control",
    metronome_control_desc:
      "Fine-tune your running rhythm with precise BPM control",
    track_progress: "Track Progress",
    track_progress_desc: "Monitor your running improvement over time",
    music_integration_screen: "Music Integration",
    music_integration_screen_desc:
      "Control music playback without leaving the app",

    // Personal Center - Profile
    profile_account_info: "Account Information",
    profile_account_desc: "Manage your personal profile and account settings",
    profile_email: "Email Address",
    profile_email_readonly: "Email address cannot be modified",
    profile_display_name: "Display Name",
    profile_display_name_placeholder: "Enter your display name",
    profile_display_name_required: "Please enter display name",
    profile_display_name_max_length: "Name cannot exceed 50 characters",
    profile_registration_time: "Registration Time",
    profile_save_changes: "Save Changes",
    profile_saving: "Saving...",
    profile_unsaved_changes: "Unsaved changes",
    profile_synced: "Synced",
    profile_save_success: "Profile saved successfully!",
    profile_save_error: "Save failed, please try again",

    // Personal Center - Strava
    strava_connection: "Strava Connection",
    strava_connection_desc: "Connect your Strava account to sync sports data",
    strava_not_connected: "Not Connected to Strava",
    strava_connect_desc:
      "Connect your Strava account and we'll sync your sports data and provide detailed analysis reports",
    strava_sync_routes: "Sync route data",
    strava_record_time: "Record exercise time",
    strava_analyze_performance: "Analyze sports performance",
    strava_connect_button: "Connect Strava Account",
    strava_connection_time: "Connection time",
    strava_followers: "Followers",
    strava_following: "Following",
    strava_connected: "Connected successfully",
    strava_connected_desc:
      "Your Strava account has been successfully connected. We will regularly sync your sports data and provide detailed analysis reports.",
    strava_disconnect: "Disconnect",
    strava_disconnecting: "Disconnecting...",
    strava_visit: "Visit Strava",
    strava_disconnect_confirm:
      "Are you sure you want to disconnect from Strava? This will delete all synced sports data.",

    // Personal Center - Equipment
    equipment_title: "Sports Equipment",
    equipment_desc: "Manage your sports equipment and usage records",
    equipment_add: "Add Equipment",
    equipment_edit: "Edit Equipment",
    equipment_add_new: "Add New Equipment",
    equipment_category: "Category",
    equipment_category_required: "Please select a category first",
    equipment_brand: "Brand",
    equipment_brand_required: "Please select a brand first",
    equipment_model: "Equipment Model",
    equipment_model_required: "Please select equipment model first",
    equipment_no_brands: "No brands available for this category",
    equipment_no_models: "No models available for this brand",
    equipment_select_category: "Select Category",
    equipment_select_brand: "Select Brand",
    equipment_select_model: "Select Equipment Model",
    equipment_purchase_date: "Purchase Date",
    equipment_notes: "Notes",
    equipment_notes_placeholder:
      "Record purchase channel, price or other information...",
    equipment_save: "Save Equipment",
    equipment_saving: "Saving...",
    equipment_cancel: "Cancel",
    equipment_no_records: "No equipment records yet",
    equipment_no_records_desc:
      "Add your sports equipment to track usage and mileage",
    equipment_add_first: "Add First Equipment",
    equipment_total_distance: "Total Distance",
    equipment_usage_time: "Usage Time",
    equipment_active: "In Use",
    equipment_inactive: "Deactivated",
    equipment_unknown: "Unknown Equipment",
    equipment_unknown_category: "Unknown Category",
    equipment_delete_confirm:
      'Are you sure you want to delete equipment "{name}"? This action cannot be undone.',
    equipment_cant_find: "Can't find the equipment you're looking for?",
    equipment_submit_missing: "Submit missing equipment for review",
    equipment_select_model_error: "Please select a valid equipment model",
    equipment_save_error: "Save failed, please try again",
    equipment_delete_error: "Delete failed, please try again",
    equipment_update_error: "Update failed, please try again",

    // Submit Equipment Modal
    submit_equipment_title: "Submit New Equipment",
    submit_equipment_desc: "Help us improve our equipment database",
    submit_equipment_login_required: "Login Required",
    submit_equipment_login_desc:
      "Please login to submit new equipment for review.",
    submit_equipment_success: "Submission Successful!",
    submit_equipment_success_desc:
      "Thank you for your contribution! We will review your equipment submission soon.",
    submit_equipment_name: "Equipment Name",
    submit_equipment_name_placeholder: "e.g., Nike Air Zoom Pegasus 40",
    submit_equipment_brand: "Brand Name",
    submit_equipment_brand_placeholder: "e.g., Nike",
    submit_equipment_category_label: "Category",
    submit_equipment_price: "MSRP Price ($)",
    submit_equipment_year: "Model Year",
    submit_equipment_weight: "Weight (grams)",
    submit_equipment_color: "Color",
    submit_equipment_color_placeholder: "Black/White",
    submit_equipment_url: "Product URL",
    submit_equipment_description: "Description",
    submit_equipment_description_placeholder:
      "Detailed description of the equipment features, purpose, etc...",
    submit_equipment_images: "Product Image URLs",
    submit_equipment_add_image: "Add Image",
    submit_equipment_reason: "Submission Reason",
    submit_equipment_reason_placeholder:
      "Please explain why you're submitting this equipment, e.g., couldn't find this product when adding equipment, it's a new release...",
    submit_equipment_guidelines: "Submission Guidelines:",
    submit_equipment_guideline_1:
      "Please ensure all information provided is accurate",
    submit_equipment_guideline_2:
      "We will review your submission within 1-3 business days",
    submit_equipment_guideline_3:
      "Once approved, the equipment will be added to the database for all users",
    submit_equipment_guideline_4:
      "If you have any questions, please contact the administrator",
    submit_equipment_submit: "Submit Request",
    submit_equipment_submitting: "Submitting...",
    submit_equipment_close: "Close",
    submit_equipment_login_first: "Please login first to submit equipment",

    // Alert Messages
    please_login: "Please login first",
    user_equipment_info_incomplete:
      "User or equipment information incomplete, please refresh and try again",
    review_updated: "Review updated",
    review_submitted: "Review submitted",
    select_rating: "Please select a rating",
    rating_max_5: "Rating cannot exceed 5 stars",
    review_content_required: "Please enter review content",
    review_content_max_length: "Review content cannot exceed 2000 characters",
    user_not_logged_in:
      "User not logged in or session expired, please login again",
    max_images_upload: "Maximum {count} images can be uploaded",
    invalid_image_file: '"{fileName}" is not a valid image file',
    file_too_large:
      '"{fileName}" is too large, please select an image smaller than 5MB',
    image_upload_failed: "Image upload failed, please try again",
    equipment_already_exists:
      "This equipment is already in your equipment library",
    added_to_equipment: "Added to my equipment library",
    add_failed: "Add failed, please try again",
    review_deleted: "Review deleted",
    delete_failed: "Delete failed, please try again",
    login_to_review: "Please login before reviewing",

    // Review Modal
    edit_review: "Edit Review",
    rate_equipment: "Rate Equipment",
    overall_rating: "Overall Rating",
    detailed_review: "Detailed Review",
    upload_images: "Upload Images",
    submitting: "Submitting...",
    update_review: "Update Review",
    submit_review: "Submit Review",
    cancel: "Cancel",
    share_experience: "Share your experience, feelings, etc...",
    select_rating_prompt: "{rating} stars",
    please_select_rating: "Please select a rating",

    // Image Upload
    uploading: "Uploading...",
    click_or_drag_upload: "Click or drag images here to upload",
    upload_format_info:
      "Supports JPG, PNG, WebP formats, max 5MB per file, up to {maxImages} images",
    uploaded_count: "Uploaded {current}/{total} images",
    uploaded_image_alt: "Uploaded image {index}",
  },
  zh: {
    // Header Navigation
    nav_home: "首页",
    nav_data_analysis: "数据分析",
    nav_personal_center: "个人中心",
    nav_sign_out: "退出登录",
    nav_sign_in_or_register: "登录或注册",

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
    cadence_running_desc:
      "智能节拍器与GPS追踪完美结合，为跑者提供专业的训练工具",
    download_cadence: "下载 Cadence",
    app_store: "App Store",
    learn_details: "了解详情",

    // Smart Metronome
    smart_metronome: "智能节拍器",
    smart_metronome_desc:
      "160-200 BPM可调节，匹配您的完美跑步节奏。后台音频支持，节拍永不中断。",
    smart_metronome_new: "智能节拍器",
    smart_metronome_desc_new: "160-200 BPM可调节，帮助保持稳定的跑步节奏",

    // GPS Tracking
    gps_tracking: "GPS追踪",
    gps_tracking_desc: "实时GPS追踪，详细路线地图和运动数据分析。",
    gps_tracking_new: "GPS追踪",
    gps_tracking_desc_new: "实时位置追踪和路线记录",

    // Music Integration
    music_integration: "音乐集成",
    music_integration_desc:
      "与Apple Music和Spotify无缝集成。无需离开应用即可控制音乐播放。",
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
    sports_data_viz_desc:
      "专业的运动数据分析平台，支持FIT文件上传和多维度可视化",
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
    workout_data_analysis_desc:
      "专业的FIT文件分析工具，提供心率、配速、功率等多维度数据可视化，帮助您深度分析训练表现。",
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

    // Profile Page
    profile_page_title: "个人中心",
    profile_tab_account: "账户信息",
    profile_tab_strava: "Strava连接",
    profile_tab_equipment: "运动装备",

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
    music_integration_screen_desc: "无需离开应用即可控制音乐播放",

    // Personal Center - Profile
    profile_account_info: "账户信息",
    profile_account_desc: "管理您的个人资料和账户设置",
    profile_email: "邮箱地址",
    profile_email_readonly: "邮箱地址无法修改",
    profile_display_name: "显示名称",
    profile_display_name_placeholder: "输入您的显示名称",
    profile_display_name_required: "请输入显示名称",
    profile_display_name_max_length: "名称不能超过50个字符",
    profile_registration_time: "注册时间",
    profile_save_changes: "保存更改",
    profile_saving: "保存中...",
    profile_unsaved_changes: "有未保存的更改",
    profile_synced: "已同步",
    profile_save_success: "资料保存成功！",
    profile_save_error: "保存失败，请重试",

    // Personal Center - Strava
    strava_connection: "Strava连接",
    strava_connection_desc: "连接您的Strava账号以同步运动数据",
    strava_not_connected: "未连接Strava",
    strava_connect_desc:
      "连接您的Strava账号，我们将为您同步运动数据并提供详细的分析报告",
    strava_sync_routes: "同步路线数据",
    strava_record_time: "记录运动时间",
    strava_analyze_performance: "分析运动成绩",
    strava_connect_button: "连接Strava账号",
    strava_connection_time: "连接时间",
    strava_followers: "关注者",
    strava_following: "关注中",
    strava_connected: "连接成功",
    strava_connected_desc:
      "您的Strava账号已成功连接。我们将定期同步您的运动数据，为您提供详细的分析报告。",
    strava_disconnect: "断开连接",
    strava_disconnecting: "断开连接中...",
    strava_visit: "访问Strava",
    strava_disconnect_confirm:
      "确定要断开与Strava的连接吗？这将删除所有同步的运动数据。",

    // Personal Center - Equipment
    equipment_title: "运动装备",
    equipment_desc: "管理您的运动装备和使用记录",
    equipment_add: "添加装备",
    equipment_edit: "编辑装备",
    equipment_add_new: "添加新装备",
    equipment_category: "分类",
    equipment_category_required: "请先选择分类",
    equipment_brand: "品牌",
    equipment_brand_required: "请先选择品牌",
    equipment_model: "装备型号",
    equipment_model_required: "请先选择装备型号",
    equipment_no_brands: "该分类下暂无品牌",
    equipment_no_models: "该品牌下暂无型号",
    equipment_select_category: "请先选择分类",
    equipment_select_brand: "选择品牌",
    equipment_select_model: "选择装备型号",
    equipment_purchase_date: "购买日期",
    equipment_notes: "备注",
    equipment_notes_placeholder: "记录购买渠道、价格或其他信息...",
    equipment_save: "保存装备",
    equipment_saving: "保存中...",
    equipment_cancel: "取消",
    equipment_no_records: "还没有装备记录",
    equipment_no_records_desc: "添加您的运动装备，跟踪使用情况和里程数",
    equipment_add_first: "添加第一个装备",
    equipment_total_distance: "总里程",
    equipment_usage_time: "使用时间",
    equipment_active: "使用中",
    equipment_inactive: "已停用",
    equipment_unknown: "未知装备",
    equipment_unknown_category: "未知分类",
    equipment_delete_confirm: '确定要删除装备"{name}"吗？此操作无法撤销。',
    equipment_cant_find: "找不到您要找的装备？",
    equipment_submit_missing: "提交未收录装备供审核",
    equipment_select_model_error: "请选择有效的装备型号",
    equipment_save_error: "保存失败，请重试",
    equipment_delete_error: "删除失败，请重试",
    equipment_update_error: "更新失败，请重试",

    // Submit Equipment Modal
    submit_equipment_title: "提交未收录装备",
    submit_equipment_desc: "帮助我们完善装备数据库",
    submit_equipment_login_required: "需要登录",
    submit_equipment_login_desc: "请先登录以提交新装备供审核。",
    submit_equipment_success: "提交成功！",
    submit_equipment_success_desc:
      "感谢您的贡献！我们会尽快审核您提交的装备信息。",
    submit_equipment_name: "装备名称",
    submit_equipment_name_placeholder: "例如：Nike Air Zoom Pegasus 40",
    submit_equipment_brand: "品牌名称",
    submit_equipment_brand_placeholder: "例如：Nike",
    submit_equipment_category_label: "装备分类",
    submit_equipment_price: "官方售价 (¥)",
    submit_equipment_year: "年份",
    submit_equipment_weight: "重量 (克)",
    submit_equipment_color: "颜色",
    submit_equipment_color_placeholder: "黑色/白色",
    submit_equipment_url: "产品链接",
    submit_equipment_description: "装备描述",
    submit_equipment_description_placeholder: "详细描述装备的特点、用途等...",
    submit_equipment_images: "产品图片链接",
    submit_equipment_add_image: "添加图片",
    submit_equipment_reason: "提交原因",
    submit_equipment_reason_placeholder:
      "请说明为什么要提交这个装备，例如：在添加装备时没有找到这款产品，它是最新发布的...",
    submit_equipment_guidelines: "提交须知：",
    submit_equipment_guideline_1: "请确保提供的信息准确无误",
    submit_equipment_guideline_2: "我们会在1-3个工作日内审核您的提交",
    submit_equipment_guideline_3:
      "审核通过后，装备将添加到数据库供所有用户使用",
    submit_equipment_guideline_4: "如有疑问，请联系管理员",
    submit_equipment_submit: "提交申请",
    submit_equipment_submitting: "提交中...",
    submit_equipment_close: "关闭",
    submit_equipment_login_first: "请先登录以提交装备",

    // Alert Messages
    please_login: "请先登录",
    user_equipment_info_incomplete: "用户或装备信息不完整，请刷新页面重试",
    review_updated: "评论已更新",
    review_submitted: "评论已提交",
    select_rating: "请选择评分",
    rating_max_5: "评分不能超过5星",
    review_content_required: "请填写评论内容",
    review_content_max_length: "评论内容不能超过2000字符",
    user_not_logged_in: "用户未登录或会话已过期，请重新登录",
    max_images_upload: "最多只能上传{count}张图片",
    invalid_image_file: '"{fileName}" 不是有效的图片文件',
    file_too_large: '"{fileName}" 文件过大，请选择小于5MB的图片',
    image_upload_failed: "图片上传失败，请重试",
    equipment_already_exists: "该装备已在您的装备库中",
    added_to_equipment: "已添加到我的装备库",
    add_failed: "添加失败，请重试",
    review_deleted: "评论已删除",
    delete_failed: "删除失败，请重试",
    login_to_review: "请先登录后再评论",

    // Review Modal
    edit_review: "编辑评价",
    rate_equipment: "评价装备",
    overall_rating: "总体评分",
    required_field: "*",
    detailed_review: "详细评论",
    upload_images: "上传图片",
    submitting: "提交中...",
    update_review: "更新评价",
    submit_review: "提交评价",
    cancel: "取消",
    share_experience: "分享您的使用体验、感受等...",
    select_rating_prompt: "{rating} 星",
    please_select_rating: "请选择评分",

    // Image Upload
    uploading: "上传中...",
    click_or_drag_upload: "点击或拖拽图片到此处上传",
    upload_format_info:
      "支持 JPG、PNG、WebP 格式，单个文件最大 5MB，最多 {maxImages} 张",
    uploaded_count: "已上传 {current}/{total} 张图片",
    uploaded_image_alt: "上传的图片 {index}",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    // Always default to English instead of browser detection
    setLanguage("en");
  }, []);

  const t = (key: string): string => {
    return (
      translations[language][
        key as keyof (typeof translations)[typeof language]
      ] || key
    );
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
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
