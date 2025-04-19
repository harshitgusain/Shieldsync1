import React, { useState, useEffect } from 'react';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const navigate = useNavigate();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const isSupabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
            create a new account
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!isSupabaseConfigured ? (
            <div className="rounded-md bg-yellow-50 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Supabase Not Configured
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Please click the "Connect to Supabase" button in the top right corner to set up your Supabase project.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I accept all terms and conditions
                  </span>
                </label>
              </div>

              {acceptedTerms ? (
                <SupabaseAuth
                  supabaseClient={supabase}
                  appearance={{ 
                    theme: ThemeSupa,
                    variables: {
                      default: {
                        colors: {
                          brand: '#2563eb',
                          brandAccent: '#1d4ed8'
                        }
                      }
                    }
                  }}
                  providers={[]}
                  theme="default"
                  redirectTo={`${window.location.origin}/`}
                />
              ) : (
                <div className="rounded-md bg-yellow-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Please accept the terms and conditions to continue
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Terms & Conditions</h3>
                <div className="mt-4 text-sm text-gray-600 space-y-4">
                  <p>By using SHIELDSYNC, you agree to the following terms:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>All data collected is used solely for security purposes</li>
                    <li>We implement industry-standard security measures</li>
                    <li>Your data is stored securely and never shared with third parties</li>
                    <li>You must maintain the confidentiality of your account</li>
                    <li>We reserve the right to modify or terminate services</li>
                  </ul>
                  <p className="font-medium">Privacy Policy Highlights:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Data encryption in transit and at rest</li>
                    <li>Regular security audits and updates</li>
                    <li>Transparent data collection practices</li>
                    <li>User control over data sharing preferences</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}