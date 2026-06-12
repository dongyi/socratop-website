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

      <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center overflow-hidden pt-16">

          {/* Ambient glow blobs */}
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-orange-600/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-lime-500/6 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/4 rounded-full blur-[140px] pointer-events-none" />

          {/* Subtle grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
            <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[calc(100vh-4rem)] py-20">

              {/* ── Left: Text ── */}
              <div className="flex flex-col justify-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 rounded-full px-4 py-1.5 mb-8 w-fit">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span className="text-orange-400 text-xs font-semibold tracking-[0.15em] uppercase">
                    Professional Sports Platform
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-[5.5rem] md:text-[7rem] font-black leading-[0.9] tracking-tighter mb-6 select-none">
                  <span className="text-white">SOCRA</span>
                  <span
                    className="text-transparent"
                    style={{
                      WebkitTextStroke: '2px rgba(249,115,22,0.7)',
                    }}
                  >
                    TOP
                  </span>
                </h1>

                {/* Sub-headline */}
                <p className="text-2xl md:text-3xl font-light text-gray-300 mb-4 leading-snug">
                  Run Smarter.{' '}
                  <span className="text-orange-400 font-semibold">Perform Better.</span>
                </p>
                <p className="text-gray-500 text-base md:text-lg mb-10 max-w-md leading-relaxed">
                  {t('platform_subtitle')}
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap gap-4">
                  <a
                    href="https://apps.apple.com/app/cadence180/id6746228613"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 bg-orange-500 hover:bg-orange-400 active:scale-95 text-black font-bold px-7 py-3.5 rounded-full transition-all duration-200 shadow-lg shadow-orange-500/25"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.19 1.29-2.17 3.85.03 3.05 2.67 4.06 2.7 4.07-.03.07-.42 1.44-1.38 2.66M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <span>{t('download_cadence')}</span>
                  </a>
                  <a
                    href="#cadence-features"
                    className="flex items-center gap-3 border border-white/15 hover:border-white/30 text-white px-7 py-3.5 rounded-full transition-all duration-200 backdrop-blur-sm hover:bg-white/5"
                  >
                    {t('learn_more_features')}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </a>
                </div>

                {/* Stats strip */}
                <div className="flex items-center gap-8 mt-12 pt-8 border-t border-white/8">
                  <div>
                    <div className="text-2xl font-black text-white tabular-nums">160–200</div>
                    <div className="text-gray-500 text-xs uppercase tracking-widest mt-0.5">BPM Range</div>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div>
                    <div className="text-2xl font-black text-white">GPS</div>
                    <div className="text-gray-500 text-xs uppercase tracking-widest mt-0.5">Real-time</div>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div>
                    <div className="text-2xl font-black text-orange-400">FIT</div>
                    <div className="text-gray-500 text-xs uppercase tracking-widest mt-0.5">Analysis</div>
                  </div>
                </div>
              </div>

              {/* ── Right: Floating Phone Mockups ── */}
              <div className="relative h-[580px] hidden lg:flex items-center justify-center">

                {/* Glow underneath phones */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[360px] h-[180px] bg-orange-500/15 rounded-full blur-3xl" />

                {/* Phone Left */}
                <div
                  className="absolute z-10 transition-transform duration-700 hover:-translate-y-2"
                  style={{ left: '2%', top: '50%', transform: 'translateY(-46%) rotate(-12deg)' }}
                >
                  <div className="w-[155px] h-[335px] rounded-[32px] border border-white/15 bg-black shadow-2xl overflow-hidden ring-1 ring-white/5 opacity-80 hover:opacity-95 transition-opacity">
                    <Image
                      src="/images/1.png"
                      alt="Cadence Metronome"
                      width={155}
                      height={335}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Phone Center — largest, front */}
                <div
                  className="absolute z-20 transition-transform duration-700 hover:-translate-y-3"
                  style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                >
                  {/* Orange glow ring */}
                  <div className="absolute inset-[-8px] rounded-[44px] bg-orange-500/20 blur-xl" />
                  <div className="relative w-[185px] h-[400px] rounded-[38px] border-2 border-orange-500/30 bg-black shadow-[0_30px_80px_rgba(249,115,22,0.2)] overflow-hidden ring-1 ring-orange-500/10">
                    <Image
                      src="/images/2.png"
                      alt="Cadence Running"
                      width={185}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Phone Right */}
                <div
                  className="absolute z-10 transition-transform duration-700 hover:-translate-y-2"
                  style={{ right: '2%', top: '50%', transform: 'translateY(-54%) rotate(12deg)' }}
                >
                  <div className="w-[155px] h-[335px] rounded-[32px] border border-white/15 bg-black shadow-2xl overflow-hidden ring-1 ring-white/5 opacity-80 hover:opacity-95 transition-opacity">
                    <Image
                      src="/images/3.png"
                      alt="Cadence Progress"
                      width={155}
                      height={335}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* App Store badge chip */}
                <div
                  className="absolute z-30 bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/8 backdrop-blur border border-white/12 rounded-full px-4 py-2"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.19 1.29-2.17 3.85.03 3.05 2.67 4.06 2.7 4.07-.03.07-.42 1.44-1.38 2.66M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span className="text-white text-xs font-medium">Available on App Store</span>
                </div>
              </div>

              {/* Mobile: single phone */}
              <div className="flex justify-center lg:hidden">
                <div className="w-[180px] h-[390px] rounded-[36px] border-2 border-orange-500/30 bg-black shadow-[0_20px_60px_rgba(249,115,22,0.2)] overflow-hidden">
                  <Image src="/images/2.png" alt="Cadence App" width={180} height={390} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <div className="h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent mx-8" />

        {/* ── FEATURES: Cadence App ── */}
        <section id="cadence-features" className="py-24 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">

            {/* Section label */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-white/8" />
              <span className="text-orange-400 text-xs font-bold tracking-[0.2em] uppercase">Cadence App</span>
              <div className="h-px flex-1 bg-white/8" />
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
              <div>
                <h2 className="text-5xl md:text-6xl font-black leading-tight tracking-tight mb-6">
                  {t('cadence_running_app')}
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-lg">
                  {t('cadence_running_desc')}
                </p>
                <a
                  href="https://apps.apple.com/app/cadence180/id6746228613"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-400 active:scale-95 text-black font-bold px-7 py-3.5 rounded-full transition-all duration-200 shadow-lg shadow-orange-500/20"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.19 1.29-2.17 3.85.03 3.05 2.67 4.06 2.7 4.07-.03.07-.42 1.44-1.38 2.66M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  {t('download_cadence')}
                </a>
              </div>

              {/* Feature cards grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    ),
                    num: '01',
                    title: t('smart_metronome_new'),
                    desc: t('smart_metronome_desc_new'),
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ),
                    num: '02',
                    title: t('gps_tracking_new'),
                    desc: t('gps_tracking_desc_new'),
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6.343 6.343a9 9 0 000 12.728m2.829-9.9a5 5 0 000 7.072M12 12h.01" />
                      </svg>
                    ),
                    num: '03',
                    title: t('music_integration_new'),
                    desc: t('music_integration_desc_new'),
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    ),
                    num: '04',
                    title: t('background_support'),
                    desc: t('background_support_desc'),
                  },
                ].map((f) => (
                  <div
                    key={f.num}
                    className="group relative bg-white/3 hover:bg-white/6 border border-white/8 hover:border-orange-500/25 rounded-2xl p-5 transition-all duration-300"
                  >
                    <div className="text-orange-500 mb-4">{f.icon}</div>
                    <div className="text-[10px] text-orange-400/60 font-bold tracking-widest mb-1">{f.num}</div>
                    <h4 className="text-sm font-bold text-white mb-2">{f.title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mx-8" />

        {/* ── APP SCREENSHOTS ── */}
        <section className="py-24 px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#0c0c0c]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

          <div className="relative max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-lime-500/10 border border-lime-500/20 rounded-full px-4 py-1.5 mb-6">
                <span className="text-lime-400 text-xs font-bold tracking-[0.15em] uppercase">See it in action</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tight">
                {t('see_in_action')}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                { src: '/images/1.png', title: t('metronome_control'), desc: t('metronome_control_desc') },
                { src: '/images/2.png', title: t('music_integration_screen'), desc: t('music_integration_screen_desc') },
                { src: '/images/3.png', title: t('track_progress'), desc: t('track_progress_desc') },
              ].map((item, i) => (
                <div key={i} className="group text-center">
                  <div className="relative mx-auto mb-6 w-fit">
                    {i === 1 && (
                      <div className="absolute inset-[-10px] rounded-[44px] bg-orange-500/15 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    )}
                    <div className={`relative w-[180px] h-[390px] rounded-[36px] border overflow-hidden shadow-2xl mx-auto ${
                      i === 1
                        ? 'border-orange-500/30 shadow-orange-500/15'
                        : 'border-white/10'
                    }`}>
                      <Image
                        src={item.src}
                        alt={item.title}
                        width={180}
                        height={390}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <h3 className="text-base font-bold mb-2 text-white">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <div className="h-px bg-gradient-to-r from-transparent via-lime-500/25 to-transparent mx-8" />

        {/* ── DATA PLATFORM ── */}
        <section id="platform-features" className="py-24 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">

            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-white/8" />
              <span className="text-lime-400 text-xs font-bold tracking-[0.2em] uppercase">Data Platform</span>
              <div className="h-px flex-1 bg-white/8" />
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-start mb-16">
              <div>
                <h2 className="text-5xl md:text-6xl font-black leading-tight tracking-tight mb-6">
                  {t('data_platform_title')}
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-lg">
                  {t('data_platform_subtitle')}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
                  {t('data_platform_subtitle')}
                </p>
              </div>

              {/* Platform feature list */}
              <div className="space-y-3">
                {[
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    ),
                    title: t('strava_integration'),
                    desc: t('strava_integration_desc'),
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    ),
                    title: t('data_visualization'),
                    desc: t('data_visualization_desc'),
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    ),
                    title: t('equipment_management'),
                    desc: t('equipment_management_desc'),
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ),
                    title: t('personal_profile'),
                    desc: t('personal_profile_desc'),
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="group flex items-start gap-4 bg-white/3 hover:bg-white/5 border border-white/8 hover:border-lime-500/20 rounded-2xl px-5 py-4 transition-all duration-300"
                  >
                    <div className="text-lime-400 mt-0.5 shrink-0">{item.icon}</div>
                    <div>
                      <div className="text-white font-semibold text-sm mb-1">{item.title}</div>
                      <div className="text-gray-500 text-xs leading-relaxed">{item.desc}</div>
                    </div>
                    <svg className="w-4 h-4 text-white/20 group-hover:text-lime-400/50 ml-auto mt-0.5 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section id="contact" className="py-24 px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#0a0a0a]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-orange-600/6 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
              <span className="text-gray-400 text-xs font-bold tracking-[0.15em] uppercase">Contact</span>
            </div>

            <h2 className="text-6xl md:text-7xl font-black tracking-tight mb-6 leading-none">
              {t('contact_title')}
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-lg mx-auto">
              {t('contact_description')}
            </p>

            <a
              href="mailto:juvenpp@gmail.com?subject=Cadence App Inquiry"
              className="group inline-flex items-center gap-4 bg-white/5 hover:bg-white/8 border border-white/12 hover:border-orange-500/30 rounded-2xl px-8 py-5 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-orange-500/15 rounded-full flex items-center justify-center group-hover:bg-orange-500/25 transition-colors">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-white font-bold">{t('email_us')}</div>
                <div className="text-orange-400 text-sm">juvenpp@gmail.com</div>
              </div>
              <svg className="w-5 h-5 text-gray-600 group-hover:text-orange-400 ml-4 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="py-8 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-white font-black tracking-tight">SOCRATOP</span>
              <span className="text-white/20 text-xs">×</span>
              <span className="text-orange-400 text-xs font-medium">CADENCE</span>
            </div>
            <p className="text-gray-600 text-sm">{t('footer_copyright')}</p>
            {language === 'zh' && (
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-400 text-xs transition-colors"
              >
                {t('icp_filing')}
              </a>
            )}
          </div>
        </footer>

      </div>
    </>
  );
}
