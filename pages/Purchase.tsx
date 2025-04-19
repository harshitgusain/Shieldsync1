import React from 'react';
import { Shield, Lock, Server, Cloud, CheckCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

const products = [
  {
    id: "basic-av",
    name: "SHIELDSYNC Basic Antivirus",
    price: 14,
    features: [
      "Real-time malware protection",
      "Web protection",
      "Email scanning",
      "Automatic updates"
    ],
    icon: Shield
  },
  {
    id: "pro-av",
    name: "SHIELDSYNC Pro Security Suite",
    price: 9,
    features: [
      "All Basic features",
      "Firewall protection",
      "Ransomware protection",
      "Password manager",
      "VPN service"
    ],
    icon: Lock
  },
  {
    id: "enterprise-av",
    name: "SHIELDSYNC Enterprise Defense",
    price: 10,
    features: [
      "All Pro features",
      "Advanced threat detection",
      "Network monitoring",
      "24/7 technical support",
      "Remote device management"
    ],
    icon: Server
  },
  {
    id: "cloud-av",
    name: "SHIELDSYNC Cloud Secure",
    price: 8,
    features: [
      "Cloud infrastructure protection",
      "API security",
      "Container security",
      "Compliance monitoring",
      "Cloud access security broker"
    ],
    icon: Cloud
  }
];

export default function Purchase() {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Security Solutions</h1>
          <p className="mt-4 text-xl text-gray-600">
            Choose the perfect security package for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <product.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{product.name}</h3>
                <p className="text-3xl font-bold text-gray-900 mb-6">
                  ₹{product.price.toLocaleString('en-IN')}
                  <span className="text-base font-normal text-gray-600">/year</span>
                </p>
                <ul className="space-y-3 mb-6">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => addItem({
                    id: product.id,
                    name: product.name,
                    price: product.price
                  })}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}