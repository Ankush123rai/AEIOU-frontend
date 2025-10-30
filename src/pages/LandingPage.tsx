import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Users,
  Award,
  Shield,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Globe,
  Clock,
  Target,
} from "lucide-react";

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Comprehensive Assessment",
      description:
        "Complete language evaluation across listening, speaking, reading, and writing skills",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi-Role Platform",
      description:
        "Seamless collaboration between students, teachers, and administrators",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Instant Results",
      description:
        "Real-time progress tracking and detailed performance analytics",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with Google OAuth authentication",
    },
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Language Department Head",
      avatar:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
      content:
        "This platform has revolutionized how we assess our students. The comprehensive reporting and ease of use make it indispensable.",
    },
    {
      name: "Michael Chen",
      role: "ESL Teacher",
      avatar:
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
      content:
        "The speaking module's video recording feature provides invaluable insights into student pronunciation and fluency.",
    },
    {
      name: "Emma Rodriguez",
      role: "Student",
      avatar:
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
      content:
        "The interface is intuitive and the progress tracking keeps me motivated. It's like having a personal language coach.",
    },
  ];

  const stats = [
    { number: "50K+", label: "Students Assessed" },
    { number: "1,200+", label: "Educational Institutions" },
    { number: "98%", label: "Accuracy Rate" },
    { number: "24/7", label: "Platform Availability" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="sm:text-3xl text-xl items-center flex gap-1 font-poppins font-bold select-none">
                  <span className="text-orange-500">AE</span>
                  <span className="text-blue-600">I</span>
                  <img
                    className="sm:w-7 sm:h-7 w-4 h-4"
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Ashoka_Chakra.svg/1200px-Ashoka_Chakra.svg.png"
                    alt="india"
                  />
                  <span className="text-green-500">U</span>
                </div>
                <span className="sm:text-xs text-[8px] font-medium">
                  Assessment Of English In Our Union
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/login")}
                className="text-gray-600 sm:text-base text-[10px] hover:text-primary-900 font-inter font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-primary-900 text-white sm:px-6 sm:py-2 px-3 py-2 sm:text-base text-[9px] rounded-xl font-inter font-medium hover:bg-primary-800 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-poppins font-bold text-white leading-tight">
                  Master Your
                  <span className="block text-secondary-400">
                    Language Skills
                  </span>
                </h1>
                <p className="text-xl text-primary-100 font-inter leading-relaxed">
                  Comprehensive language assessment platform designed for
                  educational excellence. Evaluate listening, speaking, reading,
                  and writing skills with precision and ease.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center justify-center space-x-2 bg-secondary-500 text-white px-8 py-4 rounded-xl font-inter font-medium hover:bg-secondary-600 transition-all duration-200 transform hover:scale-105"
                >
                  <span>Start Assessment</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="flex items-center justify-center space-x-2 border-2 border-white text-white px-8 py-4 rounded-xl font-inter font-medium hover:bg-white hover:text-primary-900 transition-all duration-200">
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              </div>

              <div className="flex items-center space-x-8 pt-4 text-green-600">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-poppins font-bold text-white">
                      {stat.number}
                    </div>
                    <div className="text-sm text-primary-200 font-inter">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="relative animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="bg-white rounded-3xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-poppins font-bold text-gray-900">
                      Assessment Progress
                    </h3>
                    <span className="text-sm text-secondary-600 font-inter">
                      85% Complete
                    </span>
                  </div>

                  <div className="space-y-4">
                    {[
                      { name: "Listening", progress: 100, icon: "🎧" },
                      { name: "Speaking", progress: 85, icon: "🎤" },
                      { name: "Reading", progress: 90, icon: "📖" },
                      { name: "Writing", progress: 65, icon: "✍️" },
                    ].map((module, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{module.icon}</span>
                            <span className="font-inter font-medium text-gray-700">
                              {module.name}
                            </span>
                          </div>
                          <span className="text-sm font-inter font-medium text-gray-900">
                            {module.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-secondary-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${module.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-poppins font-bold text-gray-900">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 font-inter max-w-3xl mx-auto">
              Built for educators, designed for students. Our comprehensive
              assessment platform delivers accurate results with an intuitive
              user experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6 text-primary-700">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-poppins font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 font-inter leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment Modules */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-poppins font-bold text-gray-900">
              Comprehensive Assessment Modules
            </h2>
            <p className="text-xl text-gray-600 font-inter max-w-3xl mx-auto">
              Four core language skills evaluated through interactive, engaging
              assessments
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {[
                {
                  icon: <Globe className="w-6 h-6" />,
                  title: "Listening Comprehension",
                  description:
                    "Audio-based questions testing comprehension, inference, and detail recognition",
                  features: [
                    "Multiple audio formats",
                    "Timed responses",
                    "Replay functionality",
                  ],
                },
                {
                  icon: <Target className="w-6 h-6" />,
                  title: "Speaking Assessment",
                  description:
                    "Video recording tasks evaluating pronunciation, fluency, and communication",
                  features: [
                    "Video recording",
                    "Structured tasks",
                    "Automatic saving",
                  ],
                },
                {
                  icon: <BookOpen className="w-6 h-6" />,
                  title: "Reading Analysis",
                  description:
                    "Passage-based questions measuring comprehension and analytical skills",
                  features: [
                    "Varied text types",
                    "Multiple choice",
                    "Progress tracking",
                  ],
                },
                {
                  icon: <Clock className="w-6 h-6" />,
                  title: "Writing Evaluation",
                  description:
                    "Essay tasks with flexible submission options including photo upload",
                  features: [
                    "Multiple formats",
                    "Photo upload",
                    "Drive integration",
                  ],
                },
              ].map((module, index) => (
                <div
                  key={index}
                  className="flex space-x-4 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 flex-shrink-0">
                    {module.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-poppins font-bold text-gray-900">
                      {module.title}
                    </h3>
                    <p className="text-gray-600 font-inter">
                      {module.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {module.features.map((feature, featureIndex) => (
                        <span
                          key={featureIndex}
                          className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-inter"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-poppins font-bold text-gray-900">
                      Live Assessment
                    </h4>
                    <div className="flex items-center space-x-2 text-secondary-600">
                      <div className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-inter">In Progress</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-inter text-gray-700">
                        Current Module
                      </span>
                      <span className="font-inter font-medium text-gray-900">
                        Speaking
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-inter text-gray-700">
                        Time Remaining
                      </span>
                      <span className="font-inter font-medium text-gray-900">
                        12:34
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-secondary-500 h-2 rounded-full w-3/4 transition-all duration-300"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-poppins font-bold text-gray-900">
              Trusted by Educators Worldwide
            </h2>
            <p className="text-xl text-gray-600 font-inter">
              See what teachers and students say about our platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 font-inter leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-inter font-medium text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 font-inter">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-poppins font-bold text-white">
              Ready to Transform Language Assessment?
            </h2>
            <p className="text-xl text-primary-100 font-inter">
              Join thousands of educators who trust our platform for accurate,
              comprehensive language evaluation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/login")}
                className="bg-secondary-500 text-white px-8 py-4 rounded-xl font-inter font-medium hover:bg-secondary-600 transition-all duration-200 transform hover:scale-105"
              >
                Start Free Assessment
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-inter font-medium hover:bg-white hover:text-primary-900 transition-all duration-200">
                Schedule Demo
              </button>
            </div>

            <div className="flex items-center justify-center space-x-8 pt-8 text-white">
              <div className="flex items-center space-x-2 text-primary-200">
                <CheckCircle className="w-5 h-5" />
                <span className="font-inter">No setup required</span>
              </div>
              <div className="flex items-center space-x-2 text-primary-200">
                <CheckCircle className="w-5 h-5" />
                <span className="font-inter">Instant results</span>
              </div>
              <div className="flex items-center space-x-2 text-primary-200">
                <CheckCircle className="w-5 h-5" />
                <span className="font-inter">24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-poppins font-bold">
                  <div className="sm:text-3xl text-xl items-center flex gap-1 font-poppins font-bold select-none">
                    <span className="text-orange-500">AE</span>
                    <span className="text-blue-600">I</span>
                    <img
                      className="sm:w-7 sm:h-7 w-4 h-4"
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Ashoka_Chakra.svg/1200px-Ashoka_Chakra.svg.png"
                      alt="india"
                    />
                    <span className="text-green-500">U</span>
                  </div>
                </span>
              </div>
              <p className="text-gray-400 font-inter">
                Comprehensive language assessment platform for educational
                excellence.
              </p>
            </div>

            <div>
              <h4 className="font-poppins font-bold mb-4">Platform</h4>
              <div className="space-y-2 text-gray-400 font-inter">
                <div>Assessment Modules</div>
                <div>Progress Tracking</div>
                <div>Admin Dashboard</div>
                <div>Teacher Tools</div>
              </div>
            </div>

            <div>
              <h4 className="font-poppins font-bold mb-4">Support</h4>
              <div className="space-y-2 text-gray-400 font-inter">
                <div>Help Center</div>
                <div>Documentation</div>
                <div>Contact Us</div>
                <div>System Status</div>
              </div>
            </div>

            <div>
              <h4 className="font-poppins font-bold mb-4">Company</h4>
              <div className="space-y-2 text-gray-400 font-inter">
                <div>About Us</div>
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
                <div>Security</div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 font-inter">
            <p>
              &copy; 2025 Assessment Of English In Our Union. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
