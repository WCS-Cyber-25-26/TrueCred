import { Shield, Blocks, Zap } from "lucide-react";

export default function Benefits() {
  const features = [
    {
      icon: Shield,
      title: "AI Forgery Detection",
      description:
        "Advanced machine learning algorithms analyze documents for authenticity, detecting even the most sophisticated forgeries with 99.9% accuracy.",
    },
    {
      icon: Blocks,
      title: "Blockchain Security",
      description:
        "Immutable cryptographic records on distributed ledger technology ensure credentials can never be tampered with or falsified.",
    },
    {
      icon: Zap,
      title: "Easy Integration",
      description:
        "Seamlessly integrate with your existing HR or admissions systems through our RESTful API. Setup takes minutes, not months.",
    },
  ];

  return (
    <section id="features" className="py-24">
      <div className="max-w-[1440px] mx-auto px-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Why Choose TrueCred?
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
            Protect your institution from credential fraud with cutting-edge technology 
            and uncompromising security standards.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-md transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="bg-[#043682] w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
