import React from 'react';
import { Shield, Lock, Users, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-6">About SHIELDSYNC</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Pioneering the future of cybersecurity with innovative solutions that protect businesses worldwide
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              At SHIELDSYNC, we believe that robust cybersecurity should be accessible to businesses of all sizes. 
              Our mission is to democratize enterprise-grade security solutions, making them user-friendly and 
              affordable while maintaining the highest standards of protection.
            </p>
            <div className="space-y-4">
              {[
                { icon: Shield, text: "Aiming to protect over 10,000 businesses worldwide" },
                { icon: Lock, text: "99.9% threat detection rate" },
                { icon: Users, text: "24/7 expert security team" },
                { icon: Award, text: "Industry-leading security standards" }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <item.icon className="h-6 w-6 text-blue-600" />
                  <span className="text-gray-700">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <img
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b"
              alt="Security Operations Center"
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Harshit Singh Gusain",
                role: "Team Leader and Developer",
                image: "https://i.imgur.com/VsP0UyG.jpg"
              },
              {
                name: "Harsh Alok",
                role: "Backend Developer",
                image: "https://i.imgur.com/zxVwnwn.jpg"
              },
              {
                name: "Mukul",
                role: "UI/UX designer",
                image: "https://i.imgur.com/2gJoKxV.jpg"
              }
            ].map((member) => (
              <div key={member.name} className="bg-gray-50 rounded-lg p-6 text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "0", label: "Protected Clients" },
              { number: "99.9%", label: "Uptime" },
              { number: "24/7", label: "Support" },
              { number: "3", label: "Security Experts" }
            ].map((stat) => (
              <div key={stat.label} className="text-white">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}