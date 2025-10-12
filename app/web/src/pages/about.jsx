import React from 'react';
import { 
  Users, 
  Star, 
  Truck, 
  Shield, 
  Award, 
  Target,
  Heart,
  Globe,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Play,
  Instagram,
  Twitter,
  Facebook,
  Linkedin
} from 'lucide-react';

const About = () => {
  const stats = [
    { number: "50K+", label: "Happy Customers", icon: <Users className="w-6 h-6" /> },
    { number: "5K+", label: "Products", icon: <Award className="w-6 h-6" /> },
    { number: "100+", label: "Brands", icon: <Star className="w-6 h-6" /> },
    { number: "24/7", label: "Support", icon: <Shield className="w-6 h-6" /> }
  ];

  const values = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Excellence",
      description: "We strive for perfection in every product and service we offer",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Passion",
      description: "Driven by our love for sports and helping athletes succeed",
      color: "from-red-500 to-red-600"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Innovation",
      description: "Always evolving with the latest sports technology and trends",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Growth",
      description: "Committed to helping our customers and business grow together",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "/api/placeholder/200/200",
      bio: "Former professional athlete with 10+ years in sports retail"
    },
    {
      name: "Mike Chen",
      role: "Head of Product",
      image: "/api/placeholder/200/200",
      bio: "Sports equipment specialist with engineering background"
    },
    {
      name: "Emily Rodriguez",
      role: "Customer Success",
      image: "/api/placeholder/200/200",
      bio: "Dedicated to ensuring every customer has the best experience"
    },
    {
      name: "Alex Thompson",
      role: "Marketing Director",
      image: "/api/placeholder/200/200",
      bio: "Creative mind behind our brand storytelling and community"
    }
  ];

  const milestones = [
    { year: "2018", event: "Founded with a single storefront" },
    { year: "2019", event: "Launched e-commerce platform" },
    { year: "2020", event: "Reached 10,000 customers" },
    { year: "2021", event: "Expanded to international shipping" },
    { year: "2022", event: "Partnered with 50+ premium brands" },
    { year: "2023", event: "Opened 3 new retail locations" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Athletes in action"
          className="w-full h-full object-cover absolute"
        />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Award className="w-4 h-4" />
              Trusted by 50,000+ Athletes
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Fueling <span className="text-blue-400">Greatness</span> Through Sport
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              We're more than just a sports store - we're your partner in performance. 
              From weekend warriors to professional athletes, we provide the gear that helps you excel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2">
                Our Story
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors flex items-center gap-2">
                <Play className="w-5 h-5" />
                Watch Video
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                  alt="Our store"
                  className="rounded-2xl shadow-lg"
                />
                <img 
                  src="https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                  alt="Team"
                  className="rounded-2xl shadow-lg mt-8"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-6 rounded-2xl shadow-xl">
                <div className="text-2xl font-bold">5+ Years</div>
                <div className="text-sm">of Excellence</div>
              </div>
            </div>
            
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Journey</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Founded in 2018 by former professional athletes, Sportify began as a passion project 
                to solve the challenges we faced in finding quality sports equipment. What started as 
                a small local store has grown into a trusted destination for athletes worldwide.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Today, we partner with over 100 premium brands and serve more than 50,000 customers, 
                but our mission remains the same: to provide exceptional gear that helps you perform 
                at your absolute best.
              </p>
              
              <div className="space-y-3">
                {[
                  "Premium quality guaranteed",
                  "Expert customer support",
                  "Fast worldwide shipping",
                  "30-day return policy"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do and every decision we make
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="group text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className={`bg-gradient-to-r ${value.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white group-hover:scale-110 transition-transform`}>
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Journey</h2>
            <p className="text-xl text-gray-300">Milestones that shaped our growth</p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-blue-500 h-full"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div 
                  key={index}
                  className={`flex items-center w-full ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className="w-1/2 pr-8 pl-8">
                    <div className={`bg-white text-gray-900 p-6 rounded-2xl shadow-lg ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                      <p className="text-gray-700">{milestone.event}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full border-4 border-gray-900 z-10"></div>
                  <div className="w-1/2 pl-8 pr-8">
                    {/* Empty space for alignment */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate sports enthusiasts dedicated to helping you achieve your goals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div 
                key={index}
                className="group text-center bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="relative mb-6">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 rounded-full bg-blue-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <div className="text-blue-600 font-semibold mb-3">{member.role}</div>
                <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                
                <div className="flex justify-center gap-3 mt-4">
                  {[Twitter, Linkedin, Instagram].map((Icon, socialIndex) => (
                    <button 
                      key={socialIndex}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Elevate Your Game?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of athletes who trust Sportify for their equipment needs. 
            Experience the difference quality makes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
              Shop Collection
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;