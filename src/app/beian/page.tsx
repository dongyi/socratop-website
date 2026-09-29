export default function BeianPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Socratop
          </h1>

          <div className="text-lg text-gray-600 leading-relaxed space-y-6">
            <p>
              专业运动数据平台，致力于为运动爱好者提供全方位的数据分析和管理服务。
            </p>

            <p>
              我们专注于运动数据的收集、分析与可视化，帮助用户更好地了解自己的运动表现。
            </p>

            <p>
              通过科学的数据分析，让每一次运动都更有意义。
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 py-6">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-gray-500">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-700 transition-colors"
          >
            沪ICP备2025142025号
          </a>
        </div>
      </footer>
    </div>
  );
}
