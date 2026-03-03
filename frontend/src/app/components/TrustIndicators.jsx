export default function TrustIndicators() {
  const users = [
    {
      id: "universities",
      title: "Universities",
      description: "Trusted by 500+ educational institutions worldwide",
      image: "https://images.unsplash.com/photo-1658235081482-17a67286ce20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwZ3JhZHVhdGlvbiUyMGRpcGxvbWF8ZW58MXx8fHwxNzY5MTgyNDQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      stats: "500+",
    },
    {
      id: "corporations",
      title: "Corporations",
      description: "Securing hiring for Fortune 1000 companies",
      image: "https://images.unsplash.com/photo-1762341118954-d0ce391674d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBvZmZpY2UlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzY5MTY0MjM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      stats: "1000+",
    },
  ];

  return (
    <section className="py-24">
      <div className="max-w-[1440px] mx-auto px-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Trusted By Leading Institutions
          </h2>
          <p className="text-xl text-gray-700 font-medium">
            Join thousands of organizations that rely on TrueCred for secure credential verification
          </p>
        </div>

        <div className="grid grid-cols-2 gap-12">
          {users.map((user) => (
            <div
              key={user.id}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all"
            >
              <div className="aspect-[16/10] relative">
                <img
                  src={user.image}
                  alt={user.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="text-5xl font-bold text-[#22c55e] mb-2">
                    {user.stats}
                  </div>
                  <h3 className="text-3xl font-bold mb-2">{user.title}</h3>
                  <p className="text-lg text-gray-200">{user.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-gradient-to-r from-[#043682] to-[#0a4a9e] rounded-2xl p-16">
          <h3 className="text-4xl font-bold text-white mb-4">
            Ready to Secure Your Credentials?
          </h3>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Start verifying diplomas and certificates with industry-leading technology today.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-[#22c55e] text-white px-8 py-4 rounded-lg font-semibold transition-all hover:bg-[#16a34a] hover:shadow-lg">
              Get Started Now
            </button>
            <button className="bg-white text-[#043682] px-8 py-4 rounded-lg font-semibold transition-all hover:bg-gray-100 hover:shadow-lg">
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}