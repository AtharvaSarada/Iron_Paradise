import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Search, User, FileText, LogOut, Eye, Star, Zap, Crown, Shield, Dumbbell, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { SilkBackground } from '@/components/ui/silk-background';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

interface SearchRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  join_date: string;
  status: string;
  package_name: string | null;
}

interface Package {
  id: string;
  name: string;
  duration: string;
  price: number;
  features: string[];
  is_popular: boolean;
}

export default function UserDashboard() {
  const { user, signOut } = useAuthStore();
  const [userDetails, setUserDetails] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchRecord[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'plans' | 'search'>('details');

  useEffect(() => {
    if (user) {
      fetchUserDetails();
      fetchPackages();
    }
  }, [user]);

  const fetchUserDetails = async () => {
    if (!user) return;

    // Use user data from auth store instead of database fetch
    setUserDetails({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      created_at: new Date().toISOString() // Fallback date
    });
  };

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
      toast.error('Failed to load membership plans');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('members')
        .select(`
          id,
          name,
          email,
          phone,
          join_date,
          status,
          packages(name)
        `)
        .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;

      const formattedResults = data.map((member: any) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        join_date: member.join_date,
        status: member.status,
        package_name: member.packages?.name || 'No Package'
      }));

      setSearchResults(formattedResults);
      
      if (formattedResults.length === 0) {
        toast('No records found');
      } else {
        toast.success(`Found ${formattedResults.length} record(s)`);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error('Failed to log out');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const getPackageIcon = (index: number) => {
    const icons = [Shield, Zap, Crown];
    const Icon = icons[index % icons.length];
    return Icon;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Silk Background */}
      <SilkBackground className="min-h-screen">
        {/* Header */}
        <div className="relative z-20 bg-black/60 border-b border-purple-500/30">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">Iron Paradise</h1>
                <p className="text-purple-200">Welcome, {user?.full_name || user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-purple-600/40 p-4 rounded-full">
                <Dumbbell className="w-12 h-12 text-white" />
              </div>
            </div>
            <h2 className="text-5xl font-bold text-white mb-6">
              Transform Your Body,<br />
              <span className="text-purple-300">
                Transform Your Life
              </span>
            </h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-8">
              Join Iron Paradise and discover the perfect membership plan that fits your fitness journey. 
              From beginners to professionals, we have something for everyone.
            </p>
            <div className="flex items-center justify-center gap-8 text-purple-200">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>500+ Members</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span>4.9 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Certified Trainers</span>
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-12">
            <div className="flex space-x-1 bg-black/50 p-1 rounded-lg border border-purple-500/30">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-200 hover:text-white hover:bg-purple-600/30'
                }`}
              >
                <Eye className="w-4 h-4" />
                Your Details
              </button>
              <button
                onClick={() => setActiveTab('plans')}
                className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'plans'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-200 hover:text-white hover:bg-purple-600/30'
                }`}
              >
                <Star className="w-4 h-4" />
                Membership Plans
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'search'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-200 hover:text-white hover:bg-purple-600/30'
                }`}
              >
                <Search className="w-4 h-4" />
                Search Records
              </button>
            </div>
          </div>

          {/* Content Sections */}
          <div className="max-w-6xl mx-auto">
            {/* Your Details Tab */}
            {activeTab === 'details' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-black/60 rounded-2xl p-8 border border-purple-500/30"
              >
                <div className="flex items-center gap-3 mb-8">
                  <User className="w-8 h-8 text-white" />
                  <h3 className="text-2xl font-bold text-white">Your Profile</h3>
                </div>

                {userDetails ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">
                          Full Name
                        </label>
                        <div className="bg-gray-800/60 px-4 py-3 rounded-lg border border-purple-500/30 text-white">
                          {userDetails.full_name || 'Not provided'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">
                          Email Address
                        </label>
                        <div className="bg-gray-800/60 px-4 py-3 rounded-lg border border-purple-500/30 text-white">
                          {userDetails.email}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">
                          Account Type
                        </label>
                        <div className="bg-gray-800/60 px-4 py-3 rounded-lg border border-purple-500/30">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-600 text-white">
                            {userDetails.role.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">
                          Member Since
                        </label>
                        <div className="bg-gray-800/60 px-4 py-3 rounded-lg border border-purple-500/30 text-white">
                          {formatDate(userDetails.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-white/60">Loading your details...</div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Membership Plans Tab */}
            {activeTab === 'plans' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-white mb-4">Choose Your Plan</h3>
                  <p className="text-white/80 text-lg">Select the perfect membership that fits your fitness goals</p>
                </div>

                {packages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-white/60">Loading membership plans...</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {packages.map((pkg, index) => {
                      const Icon = getPackageIcon(index);
                      return (
                        <motion.div
                          key={pkg.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`relative bg-gray-900/80 rounded-2xl p-8 border transition-colors hover:bg-gray-800/80 ${
                            pkg.is_popular 
                              ? 'border-purple-400 ring-2 ring-purple-400/50' 
                              : 'border-purple-500/30 hover:border-purple-400/50'
                          }`}
                        >
                          {pkg.is_popular && (
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                Most Popular
                              </span>
                            </div>
                          )}

                          <div className="text-center mb-6">
                            <div className="bg-purple-600/40 p-3 rounded-full w-fit mx-auto mb-4">
                              <Icon className="w-8 h-8 text-purple-200" />
                            </div>
                            <h4 className="text-2xl font-bold text-white mb-2">{pkg.name}</h4>
                            <div className="flex items-center justify-center">
                              <span className="text-4xl font-bold text-white">
                                {formatPrice(pkg.price)}
                              </span>
                              <span className="text-white/60 ml-2">
                                {getDurationLabel(pkg.duration)}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-3 mb-8">
                            {pkg.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center">
                                <div className="bg-green-500/20 rounded-full p-1 mr-3">
                                  <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <span className="text-white/90">{feature}</span>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => toast.success('Contact admin to upgrade your plan!')}
                            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                              pkg.is_popular
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
                                : 'bg-gray-800/50 backdrop-blur-sm text-white hover:bg-gray-700/50 border border-purple-500/30'
                            }`}
                          >
                            <Zap className="inline w-4 h-4 mr-2" />
                            Choose Plan
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Search Records Tab */}
            {activeTab === 'search' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Search Form */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="flex items-center gap-3 mb-6">
                    <Search className="w-8 h-8 text-white" />
                    <h3 className="text-2xl font-bold text-white">Search Records</h3>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, email, or phone number..."
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/60"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      disabled={loading}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      {loading ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20">
                    <div className="px-8 py-6 border-b border-white/20">
                      <h4 className="text-xl font-bold text-white">
                        Search Results ({searchResults.length})
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-white/5">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium text-white/80 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-white/80 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-white/80 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-white/80 uppercase tracking-wider">Join Date</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-white/80 uppercase tracking-wider">Package</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-white/80 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {searchResults.map((record) => (
                            <tr key={record.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-purple-400" />
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-white">{record.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">{record.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">{record.phone || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">{formatDate(record.join_date)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">{record.package_name}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  record.status === 'active'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {record.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {searchResults.length === 0 && searchQuery && !loading && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/20">
                    <FileText className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">No Results Found</h4>
                    <p className="text-white/60">
                      No records match your search criteria. Try different keywords.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </SilkBackground>
    </div>
  );
}