import React from 'react';
import { MacbookScroll } from './ui/pc_scroll';
import { AnimatedTestimonials } from './ui/testimonials_card';
import { ArrowRight, CheckCircle, Shield, Users, TrendingUp, Eye, FileText, Bell } from 'lucide-react';

const AuditryxLanding = () => {
  const features = [
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: "Real-time Compliance Monitoring",
      description: "Monitor supplier compliance status in real-time with automated alerts and notifications for immediate action."
    },
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Supplier Relationship Management",
      description: "Centralize supplier information, track performance metrics, and maintain comprehensive vendor profiles."
    },
    {
      icon: <Eye className="h-6 w-6 text-blue-600" />,
      title: "Supply Chain Visibility",
      description: "Gain complete transparency across your supply chain with detailed tracking and reporting capabilities."
    },
    {
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      title: "Automated Documentation",
      description: "Generate compliance reports, audit trails, and documentation automatically for seamless record-keeping."
    },
    {
      icon: <Bell className="h-6 w-6 text-blue-600" />,
      title: "Risk Assessment & Alerts",
      description: "Proactive risk identification with intelligent alerting system to prevent compliance violations."
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
      title: "Performance Analytics",
      description: "Advanced analytics and insights to optimize supplier performance and compliance outcomes."
    }
  ];

  const stats = [
    { number: "85%", label: "Reduction in Compliance Risks" },
    { number: "70%", label: "Faster Audit Preparation" },
    { number: "99.9%", label: "System Uptime" },
    { number: "500+", label: "Enterprise Clients" }
  ];

  const benefits = [
    "Streamlined vendor onboarding and management",
    "Automated compliance tracking and reporting",
    "Real-time risk assessment and mitigation",
    "Comprehensive audit trail maintenance",
    "Enhanced supplier performance visibility",
    "Reduced manual oversight requirements"
  ];

  const handleAccessNow = () => {
    window.location.href = '/login';
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-white overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <img src="/audit%20favicon.png" alt="Auditryx Favicon" className="h-6 w-6 object-contain" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Auditryx</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">Testimonials</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
            </nav>
            <button 
              onClick={handleAccessNow}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <span>Access Portal</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with MacbookScroll */}
      <section className="relative min-h-screen w-full overflow-hidden">
        <div className="w-full">
          <MacbookScroll 
            title={
              <span>
                Transform Your Supply Chain <br />
                <span className="text-blue-600">Compliance Management</span>
              </span>
            }
            showGradient={true}
          />
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-gray-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Comprehensive Supplier Compliance at Your Fingertips
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Auditryx empowers procurement teams with intelligent compliance tracking, 
            automated supplier management, and real-time visibility across your entire supply chain ecosystem.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          <button 
            onClick={handleAccessNow}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center space-x-3 mx-auto"
          >
            <span>Start Managing Suppliers</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Powerful Features for Modern Procurement
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to maintain supplier compliance, manage risks, and optimize your procurement operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors duration-200 hover:shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  {feature.icon}
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Leading Organizations Choose Auditryx
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Transform your procurement operations with enterprise-grade compliance management 
                that scales with your business requirements.
              </p>
              
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleAccessNow}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
              >
                <span>Request Demo Access</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Enterprise-Ready Platform</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="font-medium text-gray-900">Supplier Onboarding</span>
                  <span className="text-blue-600 font-bold">Automated</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-900">Compliance Monitoring</span>
                  <span className="text-green-600 font-bold">Real-time</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <span className="font-medium text-gray-900">Risk Assessment</span>
                  <span className="text-purple-600 font-bold">AI-Powered</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <span className="font-medium text-gray-900">Audit Preparation</span>
                  <span className="text-orange-600 font-bold">Instant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Trusted by Procurement Leaders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how industry leaders are transforming their supplier compliance management with Auditryx.
            </p>
          </div>
          
          <AnimatedTestimonials autoplay={true} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Supplier Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of organizations already using Auditryx to streamline their procurement operations 
            and ensure supplier compliance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleAccessNow}
              className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>Access Procurement Portal</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200">
              Schedule Consultation
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 w-full">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid md:grid-cols-4 gap-8">
      {/* First column - Remove max-width constraint */}
      <div className="col-span-2">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <img src="/audit%20favicon.png" alt="Auditryx Favicon" className="h-6 w-6 object-contain" />
          </div>
          <span className="text-2xl font-bold">Auditryx</span>
        </div>
        {/* Remove max-w-md class here */}
        <p className="text-gray-400 mb-6">
          Enterprise-grade supplier compliance management platform designed for modern procurement teams.
        </p>
        <div className="text-sm text-gray-500">
          © 2025 Auditryx. All rights reserved.
        </div>
      </div>
      
      {/* Other columns - Ensure consistent alignment */}
      <div className="text-left">
        <h4 className="font-semibold mb-4">Solutions</h4>
        <ul className="space-y-2 text-gray-400">
          <li><a href="#" className="hover:text-white transition-colors block">Supplier Management</a></li>
          <li><a href="#" className="hover:text-white transition-colors block">Compliance Tracking</a></li>
          <li><a href="#" className="hover:text-white transition-colors block">Risk Assessment</a></li>
          <li><a href="#" className="hover:text-white transition-colors block">Audit Management</a></li>
        </ul>
      </div>
      
      <div className="text-left">
        <h4 className="font-semibold mb-4">Support</h4>
        <ul className="space-y-2 text-gray-400">
          <li><a href="#" className="hover:text-white transition-colors block">Documentation</a></li>
          <li><a href="#" className="hover:text-white transition-colors block">Training</a></li>
          <li><a href="#" className="hover:text-white transition-colors block">Support Center</a></li>
          <li><a href="#" className="hover:text-white transition-colors block">Contact Us</a></li>
        </ul>
      </div>
    </div>
  </div>
</footer>
    </div>
  );
};

export default AuditryxLanding;     