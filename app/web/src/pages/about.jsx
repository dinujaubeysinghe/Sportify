import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Star, Award, Shield, Target, Heart, Globe, TrendingUp, 
  CheckCircle, ArrowRight, Play, Instagram, Twitter, Linkedin
} from 'lucide-react';

// Animation Variants for Framer Motion
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5
    }
  }
};

const cardContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Data (kept separate for clarity)
const stats = [
  { number: "50K+", label: "Happy Customers", icon: <Users className="w-8 h-8" /> },
  { number: "5K+", label: "Products", icon: <Award className="w-8 h-8" /> },
  { number: "100+", label: "Brands", icon: <Star className="w-8 h-8" /> },
  { number: "24/7", label: "Support", icon: <Shield className="w-8 h-8" /> }
];

const values = [
  { icon: <Target className="w-8 h-8" />, title: "Excellence", description: "We strive for perfection in every product and service we offer", color: "from-blue-500 to-blue-600" },
  { icon: <Heart className="w-8 h-8" />, title: "Passion", description: "Driven by our love for sports and helping athletes succeed", color: "from-red-500 to-red-600" },
  { icon: <Globe className="w-8 h-8" />, title: "Innovation", description: "Always evolving with the latest sports technology and trends", color: "from-green-500 to-green-600" },
  { icon: <TrendingUp className="w-8 h-8" />, title: "Growth", description: "Committed to helping our customers and business grow together", color: "from-purple-500 to-purple-600" }
];

const team = [
  { name: "Sarah Johnson", role: "CEO & Founder", image: "https://i.pravatar.cc/200?u=sarah", bio: "Former professional athlete with 10+ years in sports retail" },
  { name: "Mike Chen", role: "Head of Product", image: "https://i.pravatar.cc/200?u=mike", bio: "Sports equipment specialist with an engineering background" },
  { name: "Emily Rodriguez", role: "Customer Success", image: "https://i.pravatar.cc/200?u=emily", bio: "Dedicated to ensuring every customer has the best experience" },
  { name: "Alex Thompson", role: "Marketing Director", image: "https://i.pravatar.cc/200?u=alex", bio: "Creative mind behind our brand storytelling and community" }
];

const milestones = [
  { year: "2018", event: "Founded with a single storefront" },
  { year: "2019", event: "Launched e-commerce platform" },
  { year: "2020", event: "Reached 10,000 customers" },
  { year: "2021", event: "Expanded to international shipping" },
  { year: "2022", event: "Partnered with 50+ premium brands" },
  { year: "2023", event: "Opened 3 new retail locations" }
];

const testimonials = [
    {
        quote: "The quality of the gear is unmatched. It’s clear they care about performance as much as I do. My go-to store for all my training needs.",
        name: "Jessica Williams",
        role: "Professional Runner",
        rating: 5,
    },
    {
        quote: "Incredible customer service. They helped me find the perfect equipment and the shipping was lightning fast. Highly recommended!",
        name: "David Lee",
        role: "Cycling Enthusiast",
        rating: 5,
    },
    {
        quote: "As a coach, I need reliable equipment for my team. This store has never let us down. Great selection and durable products.",
        name: "Coach Brian Miller",
        role: "High School Football Coach",
        rating: 5,
    },
];


// Sub-components for each section
const HeroSection = () => (
  <section className="relative bg-gradient-to-br from-gray-900 to-blue-900 text-white overflow-hidden">
    <div className="absolute inset-0 bg-black/40 z-10"></div>
    <img 
      src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
      alt="Athletes in action"
      className="w-full h-full object-cover absolute"
    />
    <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
      <motion.div 
        className="max-w-3xl"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
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

      </motion.div>
    </div>
  </section>
);

const StatsSection = ({ stats }) => (
  <motion.section 
    className="py-16 bg-white"
    variants={sectionVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.2 }}
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-8"
        variants={cardContainerVariants}
      >
        {stats.map((stat, index) => (
          <motion.div key={index} className="text-center group" variants={cardVariants}>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 group-hover:scale-110 transition-transform">
              {stat.icon}
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
            <div className="text-gray-600 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </motion.section>
);

const StorySection = () => (
    <motion.section 
        className="py-20 bg-gray-50"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
    >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
            <motion.div 
                className="grid grid-cols-2 gap-4"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
            >
            <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                alt="Our store front"
                className="rounded-2xl shadow-lg"
            />
            <img 
                src="https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                alt="Our passionate team"
                className="rounded-2xl shadow-lg mt-8"
            />
          </motion.div>
          <motion.div 
            className="absolute -bottom-8 -right-8 bg-blue-600 text-white p-6 rounded-2xl shadow-xl"
            initial={{ opacity: 0, rotate: -10 }}
            whileInView={{ opacity: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-3xl font-bold">5+ Years</div>
            <div className="text-sm">of Excellence</div>
          </motion.div>
        </div>
        
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Journey</h2>
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            Founded in 2018 by former professional athletes, our company began as a passion project to solve the challenges we faced in finding quality sports equipment. What started as a small local store has grown into a trusted destination for athletes worldwide.
          </p>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Today, we partner with over 100 premium brands and serve more than 50,000 customers, but our mission remains the same: to provide exceptional gear that helps you perform at your absolute best.
          </p>
          <div className="space-y-3">
            {["Premium quality guaranteed", "Expert customer support", "Fast worldwide shipping", "30-day return policy"].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </motion.section>
);

const ValuesSection = ({ values }) => (
    <motion.section 
        className="py-20 bg-white"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
    >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          The principles that guide everything we do and every decision we make.
        </p>
      </div>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        variants={cardContainerVariants}
      >
        {values.map((value, index) => (
          <motion.div 
            key={index}
            className="group text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white hover:shadow-xl transition-all duration-300 border border-gray-100"
            variants={cardVariants}
          >
            <div className={`bg-gradient-to-r ${value.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white group-hover:scale-110 transition-transform`}>
              {value.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
            <p className="text-gray-600 leading-relaxed">{value.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </motion.section>
);

const TimelineSection = ({ milestones }) => (
    <motion.section 
        className="py-20 bg-gray-900 text-white"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
    >
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">Our Growth Story</h2>
        <p className="text-xl text-gray-300">Milestones that have shaped our journey</p>
      </div>
      <div className="relative">
        <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full bg-blue-500 rounded-full" aria-hidden="true"></div>
        <div className="relative flex flex-col gap-12">
          {milestones.map((item, index) => (
            <div key={index} className="flex items-center w-full">
              <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700"
                >
                  <p className="text-2xl font-bold text-blue-400 mb-2">{item.year}</p>
                  <p className="text-gray-300">{item.event}</p>
                </motion.div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-500 rounded-full border-4 border-gray-900 z-10 flex items-center justify-center">
                 <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div className="w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </motion.section>
);


const TeamSection = ({ team }) => (
    <motion.section 
        className="py-20 bg-gray-50"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
    >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Passionate sports enthusiasts dedicated to helping you achieve your goals.
        </p>
      </div>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        variants={cardContainerVariants}
      >
        {team.map((member, index) => (
          <motion.div 
            key={index}
            className="group text-center bg-white rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden relative"
            variants={cardVariants}
          >
            <div className="relative mb-6">
              <img 
                src={member.image}
                alt={`Photo of ${member.name}`}
                className="w-32 h-32 rounded-full mx-auto object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
            <div className="text-blue-600 font-semibold mb-3">{member.role}</div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">{member.bio}</p>
            <div className="flex justify-center gap-4 mt-4">
              {[Twitter, Linkedin, Instagram].map((Icon, socialIndex) => (
                <a 
                  key={socialIndex}
                  href="#"
                  aria-label={`${member.name}'s social media`}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </motion.section>
);

const TestimonialsSection = ({ testimonials }) => (
    <motion.section 
        className="py-20 bg-white"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
    >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Athletes Say</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Real stories from our amazing community of customers.
                </p>
            </div>
            <motion.div 
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                variants={cardContainerVariants}
            >
                {testimonials.map((testimonial, index) => (
                    <motion.div 
                        key={index}
                        className="bg-gray-50 p-8 rounded-2xl border border-gray-100 flex flex-col"
                        variants={cardVariants}
                    >
                        <div className="flex mb-4">
                            {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                            ))}
                        </div>
                        <p className="text-gray-700 italic mb-6 flex-grow">"{testimonial.quote}"</p>
                        <div>
                            <p className="font-bold text-gray-900">{testimonial.name}</p>
                            <p className="text-sm text-gray-500">{testimonial.role}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    </motion.section>
);


const CtaSection = () => (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl font-bold mb-6">Ready to Elevate Your Game?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of athletes who trust us for their equipment needs. 
            Experience the difference quality makes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
              Shop Collection <ArrowRight className="w-5 h-5" /> 
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105">
              Contact Us
            </button>
          </div>
        </motion.div>
      </div>
    </section>
);


const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <StatsSection stats={stats} />
      <StorySection />
      <ValuesSection values={values} />
      <TimelineSection milestones={milestones} />
      <TeamSection team={team} />
      <TestimonialsSection testimonials={testimonials} />
      <CtaSection />
    </div>
  );
};

export default About;