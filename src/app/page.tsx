'use client';

import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";

export default function Home() {
  const { t, language } = useLanguage();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Cadence180',
    description: 'The perfect running companion that syncs your steps with your rhythm. Built-in metronome, GPS tracking, and seamless music integration.',
    url: 'https://socratop.com',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'iOS',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    downloadUrl: 'https://apps.apple.com/app/cadence180/id6746228613',
    screenshot: [
      'https://socratop.com/images/1.png',
      'https://socratop.com/images/2.png',
      'https://socratop.com/images/3.png'
    ],
    featureList: [
      'Smart Metronome with adjustable BPM (160-200)',
      'Precise GPS tracking with intelligent filtering',
      'Apple Music and podcast integration',
      'Background audio support',
      'Real-time pace and distance tracking'
    ],
    author: {
      '@type': 'Organization',
      name: 'Cadence Team',
      email: 'juvenpp@gmail.com'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <div className="min-h-screen bg-black text-white pt-16">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-light mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Socratop
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('platform_subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a 
              href="/workout-analyzer" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              {t('start_data_analysis')}
            </a>
            <a 
              href="#platforms" 
              className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              {t('learn_more_features')}
            </a>
            <a 
              href="#contact" 
              className="border border-white px-8 py-3 rounded-full font-medium hover:bg-white hover:text-black transition-colors"
            >
              {t('contact_us')}
            </a>
          </div>

          {/* Platform Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Cadence App Card */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition-colors">
              <div className="w-16 h-16 bg-gray-800 border-2 border-blue-500/30 rounded-xl mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('cadence_app')}</h3>
              <p className="text-gray-400 mb-4 text-sm">
                {t('cadence_app_desc')}
              </p>
              <div className="flex gap-3">
                <a 
                  href="https://apps.apple.com/app/cadence180/id6746228613"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-black border border-gray-600 rounded-lg px-4 py-2 flex items-center justify-center gap-2 hover:border-gray-400 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>{t('app_store')}</span>
                </a>
                <a 
                  href="#cadence-features"
                  className="px-4 py-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                >
                  {t('learn_details')}
                </a>
              </div>
            </div>

            {/* Data Platform Card */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition-colors">
              <div className="w-16 h-16 bg-gray-800 border-2 border-purple-500/30 rounded-xl mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('data_analysis_platform')}</h3>
              <p className="text-gray-400 mb-4 text-sm">
                {t('data_platform_desc')}
              </p>
              <div className="flex gap-3">
                <a 
                  href="/workout-analyzer"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg px-4 py-2 text-center text-white hover:from-blue-700 hover:to-purple-700 transition-all text-sm"
                >
                  {t('try_now_btn')}
                </a>
                <a 
                  href="#platform-features"
                  className="px-4 py-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                >
                  {t('feature_intro')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platforms Section */}
      <section id="platforms" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light text-center mb-16">
            {t('multi_platform_title')}
          </h2>

          {/* Cadence App Features */}
          <div id="cadence-features" className="mb-20">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gray-800 border-2 border-blue-500/40 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-3xl font-semibold mb-4">{t('cadence_running_app')}</h3>
              <p className="text-gray-300 max-w-2xl mx-auto mb-6">
                {t('cadence_running_desc')}
              </p>
              <a 
                href="https://apps.apple.com/app/cadence180/id6746228613"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors"
              >
                <span className="text-xl">📱</span>
{t('download_cadence')}
              </a>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 border-2 border-blue-500/30 rounded-xl mx-auto mb-6 flex items-center justify-center hover:border-blue-500/60 transition-colors">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-4">{t('smart_metronome_new')}</h4>
                <p className="text-gray-400 leading-relaxed">
                  {t('smart_metronome_desc_new')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 border-2 border-blue-500/30 rounded-xl mx-auto mb-6 flex items-center justify-center hover:border-blue-500/60 transition-colors">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-4">{t('gps_tracking_new')}</h4>
                <p className="text-gray-400 leading-relaxed">
                  {t('gps_tracking_desc_new')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 border-2 border-blue-500/30 rounded-xl mx-auto mb-6 flex items-center justify-center hover:border-blue-500/60 transition-colors">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6.343 6.343a9 9 0 000 12.728m2.829-9.9a5 5 0 000 7.072M12 12h.01" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-4">{t('music_integration_new')}</h4>
                <p className="text-gray-400 leading-relaxed">
                  {t('music_integration_desc_new')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 border-2 border-blue-500/30 rounded-xl mx-auto mb-6 flex items-center justify-center hover:border-blue-500/60 transition-colors">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-4">{t('background_support')}</h4>
                <p className="text-gray-400 leading-relaxed">
                  {t('background_support_desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Data Platform Features */}
          <div id="platform-features">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gray-800 border-2 border-purple-500/40 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-3xl font-semibold mb-4">{t('data_platform_title')}</h3>
              <p className="text-gray-300 max-w-2xl mx-auto mb-6">
                {t('data_platform_subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/workout-analyzer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                >
{t('try_experience')}
                </a>
                <a 
                  href="/profile"
                  className="inline-flex items-center gap-2 border border-gray-600 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
                >
{t('personal_center')}
                </a>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 border-2 border-purple-500/30 rounded-xl mx-auto mb-6 flex items-center justify-center hover:border-purple-500/60 transition-colors">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-4">{t('strava_integration')}</h4>
                <p className="text-gray-400 leading-relaxed">
                  {t('strava_integration_desc')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 border-2 border-purple-500/30 rounded-xl mx-auto mb-6 flex items-center justify-center hover:border-purple-500/60 transition-colors">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-4">{t('data_visualization')}</h4>
                <p className="text-gray-400 leading-relaxed">
                  {t('data_visualization_desc')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 border-2 border-purple-500/30 rounded-xl mx-auto mb-6 flex items-center justify-center hover:border-purple-500/60 transition-colors">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-4">{t('equipment_management')}</h4>
                <p className="text-gray-400 leading-relaxed">
                  {t('equipment_management_desc')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 border-2 border-purple-500/30 rounded-xl mx-auto mb-6 flex items-center justify-center hover:border-purple-500/60 transition-colors">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-4">{t('personal_profile')}</h4>
                <p className="text-gray-400 leading-relaxed">
                  {t('personal_profile_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Screenshots */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light text-center mb-16">
            {t('see_in_action')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-black rounded-3xl p-4 mb-4 inline-block">
                <Image
                  src="/images/1.png"
                  alt="Cadence Metronome Screen"
                  width={250}
                  height={541}
                  className="rounded-2xl"
                />
              </div>
              <h3 className="text-lg font-medium mb-2">{t('metronome_control')}</h3>
              <p className="text-gray-400 text-sm">{t('metronome_control_desc')}</p>
            </div>
            <div className="text-center">
              <div className="bg-black rounded-3xl p-4 mb-4 inline-block">
                <Image
                  src="/images/2.png"
                  alt="Cadence Running Screen with Music"
                  width={250}
                  height={541}
                  className="rounded-2xl"
                />
              </div>
              <h3 className="text-lg font-medium mb-2">{t('music_integration_screen')}</h3>
              <p className="text-gray-400 text-sm">{t('music_integration_screen_desc')}</p>
            </div>
            <div className="text-center">
              <div className="bg-black rounded-3xl p-4 mb-4 inline-block">
                <Image
                  src="/images/3.png"
                  alt="Cadence Run Completed Screen"
                  width={250}
                  height={541}
                  className="rounded-2xl"
                />
              </div>
              <h3 className="text-lg font-medium mb-2">{t('track_progress')}</h3>
              <p className="text-gray-400 text-sm">{t('track_progress_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-8">
            {t('contact_title')}
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            {t('contact_description')}
          </p>
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">✉️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('email_us')}</h3>
              <p className="text-gray-400 mb-6">
                {t('email_description')}
              </p>
            </div>
            <a 
              href="mailto:juvenpp@gmail.com?subject=Cadence App Inquiry"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-block"
            >
              juvenpp@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>{t('footer_copyright')}</p>
          {language === 'zh' && (
            <p className="mt-2 text-sm">
              <a 
                href="https://beian.miit.gov.cn/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gray-300 transition-colors"
              >
                {t('icp_filing')}
              </a>
            </p>
          )}
        </div>
      </footer>
    </div>
    </>
  );
}
