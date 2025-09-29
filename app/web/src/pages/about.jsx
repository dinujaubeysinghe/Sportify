import React from 'react';
import { Users, Star, Truck, Shield } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">About Sportify</h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto">
            Your ultimate destination for premium sports equipment, gear, and accessories. We help athletes and enthusiasts achieve their best performance!
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <img 
            src="https://plus.unsplash.com/premium_photo-1661890079209-72b76e49768f?q=80&w=2005&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Sports Equipment" 
            className="rounded-lg shadow-lg"
          />
          <div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Sportify was founded with a mission to provide athletes and sports enthusiasts the best quality equipment at competitive prices. 
              We started as a small local store and grew into a trusted online destination for all things sports.
            </p>
            <p className="text-gray-600">
              With a passion for sports and dedication to excellence, we ensure every product we offer meets the highest standards of quality and performance.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <Star className="mx-auto mb-4 w-10 h-10 text-yellow-500" />
            <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
            <p className="text-gray-600">
              To empower athletes and sports enthusiasts with premium equipment, expert advice, and a seamless shopping experience.
            </p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <Users className="mx-auto mb-4 w-10 h-10 text-blue-500" />
            <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
            <p className="text-gray-600">
              To become the most trusted sports store worldwide, known for quality, innovation, and customer satisfaction.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow text-center hover:shadow-xl transition">
              <Shield className="w-10 h-10 mx-auto mb-4 text-green-500" />
              <h4 className="font-semibold mb-2">Integrity</h4>
              <p className="text-gray-600 text-sm">We operate with honesty and transparency in everything we do.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center hover:shadow-xl transition">
              <Truck className="w-10 h-10 mx-auto mb-4 text-blue-500" />
              <h4 className="font-semibold mb-2">Reliability</h4>
              <p className="text-gray-600 text-sm">Fast shipping, dependable products, and consistent customer service.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center hover:shadow-xl transition">
              <Star className="w-10 h-10 mx-auto mb-4 text-yellow-400" />
              <h4 className="font-semibold mb-2">Excellence</h4>
              <p className="text-gray-600 text-sm">Striving for the best quality in every product and experience.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center hover:shadow-xl transition">
              <Users className="w-10 h-10 mx-auto mb-4 text-purple-500" />
              <h4 className="font-semibold mb-2">Customer First</h4>
              <p className="text-gray-600 text-sm">We prioritize our customers’ satisfaction above all else.</p>
            </div>
          </div>
        </div>
      </section>



      {/* Call-to-Action */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <h3 className="text-2xl font-bold mb-4">Ready to Upgrade Your Game?</h3>
        <p className="mb-6">Explore our premium range of sports equipment and start performing your best today!</p>
        <a 
          href="/products" 
          className="bg-white text-blue-600 font-semibold px-6 py-3 rounded shadow hover:bg-gray-100 transition"
        >
          Shop Now
        </a>
      </section>

    </div>
  );
};

export default About;
