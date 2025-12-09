import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { supabase } from '../../lib/supabase';

export default function RoleSelector() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRoleSelect = async (roleId: string) => {
    if (!user) {
      // Redirect to login page with role parameter
      navigate(`/login?role=${roleId}`);
      return;
    }
    // User is logged in, go directly to dashboard
    navigate(`/${roleId}`);
  };

  const roles = [
    {
      id: 'union',
      title: 'Farmer Union',
      description: 'Register harvest batches on behalf of farmers and track produce',
      icon: '🏛️',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-500',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
      features: ['Register batches for farmers', 'Mint tokens', 'Track journey']
    },
    {
      id: 'processor',
      title: 'Processor',
      description: 'Update batch status and manage processing stages',
      icon: '🏭',
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-500',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      features: ['Scan batches', 'Update status', 'Quality control']
    },
    {
      id: 'consumer',
      title: 'Consumer',
      description: 'Verify product origin and support farmers directly',
      icon: '🛒',
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-500',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      features: ['Scan products', 'View journey', 'Tip farmers']
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <h1 className="text-4xl font-display font-bold text-stone-900 mb-4">Choose Your Role</h1>
        <p className="text-lg text-stone-600">
          Select how you want to participate in the Ethio-Origin supply chain ecosystem
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl w-full">
        {roles.map((role, index) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "group relative bg-white rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-xl flex flex-col",
              role.color.split(' ').filter(c => c.startsWith('border')).join(' ') || "border-stone-100"
            )}
          >
            <div className={cn(
              "w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-6 transition-colors",
              role.color.split(' ').filter(c => !c.startsWith('border') && !c.startsWith('hover')).join(' ')
            )}>
              {role.icon}
            </div>

            <h3 className="text-xl font-bold text-stone-900 mb-2">{role.title}</h3>
            <p className="text-stone-500 text-sm mb-6 flex-grow leading-relaxed">
              {role.description}
            </p>

            <ul className="space-y-3 mb-8">
              {role.features.map((feature, idx) => (
                <li key={idx} className="flex items-center text-sm text-stone-600">
                  <svg className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleRoleSelect(role.id)}
              disabled={loadingRole === role.id}
              className={cn(
                "w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 transform group-hover:translate-y-1 disabled:opacity-50 disabled:cursor-wait",
                role.buttonColor
              )}
            >
              {loadingRole === role.id ? 'Checking...' : (user ? `Enter as ${role.title}` : `Login to Enter as ${role.title}`)}
            </button>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-16 text-center"
      >
        <p className="text-stone-500 mb-4">Just want to verify a product?</p>
        <button
          onClick={() => navigate('/consumer')}
          className="text-stone-900 font-semibold hover:text-emerald-600 transition-colors border-b-2 border-stone-200 hover:border-emerald-600 pb-1"
        >
          Skip to Product Scanner
        </button>
      </motion.div>
    </div>
  );
}
