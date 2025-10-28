import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { motion } from 'framer-motion';
import { Check, Star, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface Package {
  id: string;
  name: string;
  duration: string;
  price: number;
  features: string[];
  is_popular: boolean;
  created_at: string;
}

export default function PublicPackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('packages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'packages'
        },
        (payload) => {
          console.log('Package change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            setPackages(prev => [...prev, payload.new as Package]);
            toast.success('New package available!');
          } else if (payload.eventType === 'UPDATE') {
            setPackages(prev => 
              prev.map(pkg => 
                pkg.id === payload.new.id ? payload.new as Package : pkg
              )
            );
            toast.success('Package updated!');
          } else if (payload.eventType === 'DELETE') {
            setPackages(prev => 
              prev.filter(pkg => pkg.id !== payload.old.id)
            );
            toast.success('Package removed!');
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;

      setPackages(data || []);
    } catch (error: any) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getDurationLabel = (duration: string) => {
    const labels: { [key: string]: string } = {
      'monthly': 'per month',
      'quarterly': 'per quarter',
      'yearly': 'per year',
      'weekly': 'per week'
    };
    return labels[duration.toLowerCase()] || `per ${duration}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading packages...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Iron Paradise</h1>
              <p className="text-gray-300">Choose Your Membership</p>
            </div>
            <button
              onClick={() => window.location.href = '/auth'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Membership Packages
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300"
          >
            Find the perfect plan for your fitness journey
          </motion.p>
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No packages available at the moment.</div>
            <div className="text-gray-500 text-sm mt-2">Check back soon for new membership options!</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden ${
                  pkg.is_popular ? 'ring-4 ring-blue-500 scale-105' : ''
                }`}
              >
                {/* Popular Badge */}
                {pkg.is_popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 font-semibold">
                    <Star className="inline w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                )}

                <div className={`p-8 ${pkg.is_popular ? 'pt-16' : ''}`}>
                  {/* Package Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                    <div className="flex items-center justify-center">
                      <span className="text-4xl font-bold text-gray-900">
                        {formatPrice(pkg.price)}
                      </span>
                      <span className="text-gray-600 ml-2">
                        {getDurationLabel(pkg.duration)}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {pkg.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => {
                      toast.success('Redirecting to sign up...');
                      setTimeout(() => window.location.href = '/auth', 1000);
                    }}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      pkg.is_popular
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    <Zap className="inline w-4 h-4 mr-2" />
                    Get Started
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Real-time indicator */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Live updates enabled
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black/30 border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-400">
            Questions about our packages? Contact us at{' '}
            <a href="mailto:info@ironparadise.com" className="text-blue-400 hover:text-blue-300">
              info@ironparadise.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
