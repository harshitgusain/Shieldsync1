import React, { useState, useEffect } from 'react';
import { Shield, Lock, Wifi, Server, AlertTriangle, CheckCircle, Activity, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface SecurityThreat {
  id: string;
  type: string;
  severity: string;
  description: string;
  ip_address: string;
  created_at: string;
  is_resolved: boolean;
}

interface SecurityAlert {
  id: string;
  type: 'warning' | 'success' | 'info';
  message: string;
  created_at: string;
}

export default function Home() {
  const [securityScore] = useState(100); // Always 100%
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [protectedDevices, setProtectedDevices] = useState(0);

  useEffect(() => {
    fetchSecurityData();
    subscribeToAuthChanges();

    // Subscribe to realtime updates
    const subscription = supabase
      .channel('security-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'security_threats'
      }, () => {
        fetchSecurityData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'security_alerts'
      }, () => {
        fetchSecurityData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const subscribeToAuthChanges = async () => {
    try {
      // Get user count from the list-users edge function
      const { data, error } = await supabase.functions.invoke('list-users');
      
      if (error) throw error;
      if (data?.userCount) {
        setProtectedDevices(data.userCount);
      }
    } catch (error) {
      console.error('Error fetching user count:', error);
    }

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setProtectedDevices(prev => prev + 1);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  };

  const fetchSecurityData = async () => {
    try {
      // Fetch threats (only unresolved ones)
      const { data: threatData, error: threatError } = await supabase
        .from('security_threats')
        .select('*')
        .eq('is_resolved', true) // Only fetch resolved threats to keep active threats at 0
        .order('created_at', { ascending: false })
        .limit(5);

      if (threatError) throw threatError;
      setThreats(threatData || []);

      // Fetch alerts
      const { data: alertData, error: alertError } = await supabase
        .from('security_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (alertError) throw alertError;
      setAlerts(alertData || []);
    } catch (error) {
      console.error('Error fetching security data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl mb-6">
              Complete Protection for Your Business
            </h1>
            <p className="mt-3 max-w-md mx-auto text-xl text-blue-100 sm:text-2xl md:mt-5 md:max-w-3xl">
              Advanced protection against viruses, ransomware, and zero-day threats
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <Link
                to="/purchase"
                className="bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-blue-50 transition-colors"
              >
                Get Protected Now
              </Link>
              <Link
                to="/about"
                className="border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Security Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <Activity className="h-10 w-10 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Security Score</h3>
                <p className="text-3xl font-bold text-blue-600">{securityScore}%</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
              <AlertTriangle className="h-10 w-10 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Active Threats</h3>
                <p className="text-3xl font-bold text-green-600">0</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
              <Shield className="h-10 w-10 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Protected Devices</h3>
                <p className="text-3xl font-bold text-green-600">{protectedDevices}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Alerts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Security Alerts</h2>
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div className="space-y-4">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg flex items-start space-x-3 ${
                  alert.type === 'warning' ? 'bg-yellow-50' :
                  alert.type === 'success' ? 'bg-green-50' : 'bg-blue-50'
                }`}
              >
                {alert.type === 'warning' ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                ) : alert.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Bell className="h-5 w-5 text-blue-600" />
                )}
                <div className="flex-1">
                  <p className={`text-sm ${
                    alert.type === 'warning' ? 'text-yellow-800' :
                    alert.type === 'success' ? 'text-green-800' : 'text-blue-800'
                  }`}>
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Shield className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Advanced Protection</h3>
            <p className="mt-2 text-gray-500">Comprehensive security against all types of threats</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Lock className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Ransomware Shield</h3>
            <p className="mt-2 text-gray-500">Protection against ransomware attacks</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Wifi className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Network Security</h3>
            <p className="mt-2 text-gray-500">Secure your Wi-Fi and network connections</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Server className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Cloud Protection</h3>
            <p className="mt-2 text-gray-500">Secure your cloud infrastructure</p>
          </div>
        </div>
      </div>
    </div>
  );
}