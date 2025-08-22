import Image from "next/image";

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Cadence',
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
      <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-light mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Cadence
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            The perfect running companion that syncs your steps with your rhythm. 
            Built-in metronome, GPS tracking, and seamless music integration.
          </p>
          
          {/* App Store Download Button */}
          <div className="mb-8">
            <a 
              href="https://apps.apple.com/app/cadence180/id6746228613"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transform hover:scale-105 transition-transform duration-300"
            >
              <div className="bg-black border border-gray-600 rounded-2xl px-6 py-4 flex items-center gap-4 hover:border-gray-400 transition-colors">
                <div className="text-4xl">📱</div>
                <div className="text-left">
                  <div className="text-sm text-gray-400">Download on the</div>
                  <div className="text-xl font-semibold">App Store</div>
                </div>
              </div>
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#features" 
              className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              Learn More
            </a>
            <a 
              href="#contact" 
              className="border border-white px-8 py-3 rounded-full font-medium hover:bg-white hover:text-black transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light text-center mb-8">
            Run with Perfect Rhythm
          </h2>
          <div className="text-center mb-16">
            <p className="text-gray-300 mb-6">Available now on the App Store</p>
            <a 
              href="https://apps.apple.com/app/cadence180/id6746228613"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors"
            >
              <span className="text-xl">📱</span>
              Download Cadence
            </a>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-2xl">🎵</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Smart Metronome</h3>
              <p className="text-gray-400 leading-relaxed">
                Adjustable BPM from 160-200 to match your perfect running cadence. 
                Background audio support keeps the beat going.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">GPS Tracking</h3>
              <p className="text-gray-400 leading-relaxed">
                Precise location tracking with intelligent filtering. 
                View your route, distance, and pace in real-time.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-2xl">🎧</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Music Integration</h3>
              <p className="text-gray-400 leading-relaxed">
                Seamlessly play your Apple Music playlists and podcasts 
                while maintaining perfect running rhythm.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* App Screenshots */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light text-center mb-16">
            See Cadence in Action
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
              <h3 className="text-lg font-medium mb-2">Metronome Control</h3>
              <p className="text-gray-400 text-sm">Set your perfect BPM and start your run</p>
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
              <h3 className="text-lg font-medium mb-2">Music Integration</h3>
              <p className="text-gray-400 text-sm">Control your music while maintaining rhythm</p>
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
              <h3 className="text-lg font-medium mb-2">Track Progress</h3>
              <p className="text-gray-400 text-sm">View detailed stats after each run</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-8">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Have questions about Cadence? Want to provide feedback or report an issue? 
            We&apos;d love to hear from you.
          </p>
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">✉️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="text-gray-400 mb-6">
                Send us your thoughts, suggestions, or bug reports
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
          <p>&copy; 2024 Cadence. Built with passion for runners.</p>
        </div>
      </footer>
    </div>
    </>
  );
}
