import React, { useState } from 'react';
import { Download, Search, Filter, Star, Calendar, Tag, CreditCard, Crown, AlertTriangle, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSupabaseDrafts } from '../../hooks/useSupabaseDrafts';
import { Draft } from '../../types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const UserDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { getPublishedDrafts, recordDownload } = useSupabaseDrafts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const drafts = getPublishedDrafts();
  const categories = ['all', ...Array.from(new Set(drafts.map(draft => draft.category)))];
  
  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         draft.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         draft.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || draft.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const FREE_DOWNLOAD_LIMIT = 3;
  const canDownload = (user?.downloadsThisMonth || 0) < FREE_DOWNLOAD_LIMIT || user?.isPremium;
  const remainingDownloads = Math.max(0, FREE_DOWNLOAD_LIMIT - (user?.downloadsThisMonth || 0));

  const getPlanDisplayName = (planId: string | null | undefined) => {
    switch (planId) {
      case 'monthly': return 'Monthly Premium';
      case 'quarterly': return 'Quarterly Premium';
      case 'yearly': return 'Yearly Premium';
      case null: return 'Free Trial';
      default: return 'Free Trial';
    }
  };

  const getPlanExpiryText = () => {
    if (!user?.planExpiryDate || !user?.isPremium) return '';
    const expiryDate = new Date(user.planExpiryDate);
    const now = new Date();
    const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0) return 'Expired';
    if (daysLeft <= 7) return `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;
    return `Expires ${expiryDate.toLocaleDateString()}`;
  };

  const handleDownload = (draft: Draft) => {
    if (!user) return;

    if (canDownload) {
      // Record download in database
      recordDownload(user.id, draft.id);
      
      // Simulate download
      const updatedUser = {
        ...user,
        downloadsThisMonth: (user.downloadsThisMonth || 0) + 1
      };
      updateUser(updatedUser);
      
      // Create a fake download
      const element = document.createElement('a');
      element.href = `data:text/plain;charset=utf-8,This is a demo download for: ${draft.title}`;
      element.download = draft.fileName;
      element.click();

      // Show upgrade modal if this was the last free download
      if (updatedUser.downloadsThisMonth >= FREE_DOWNLOAD_LIMIT && !user.isPremium) {
        setTimeout(() => setShowPaymentModal(true), 1000);
      }
    } else {
      setShowPaymentModal(true);
    }
  };

  const initializeRazorpayPayment = (planType: 'monthly' | 'quarterly' | 'yearly') => {
    const planPrices = {
      monthly: 999, // ₹9.99 in paise
      quarterly: 2499, // ₹24.99 in paise
      yearly: 7999 // ₹79.99 in paise
    };

    const planNames = {
      monthly: 'Monthly Premium',
      quarterly: 'Quarterly Premium', 
      yearly: 'Yearly Premium'
    };

    const options = {
      key: 'rzp_test_1234567890', // Replace with your Razorpay key
      amount: planPrices[planType],
      currency: 'INR',
      name: 'DraftKeeper',
      description: `${planNames[planType]} Subscription`,
      image: '/vite.svg',
      handler: function (response: any) {
        handlePaymentSuccess(response, planType);
      },
      prefill: {
        name: user?.name,
        email: user?.email,
      },
      notes: {
        plan_type: planType,
        user_id: user?.id
      },
      theme: {
        color: '#3B82F6'
      },
      modal: {
        ondismiss: function() {
          setIsProcessingPayment(false);
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePaymentSuccess = (response: any, planType: 'monthly' | 'quarterly' | 'yearly') => {
    if (!user) return;

    // Calculate expiry date based on plan
    const now = new Date();
    let expiryDate = new Date(now);
    
    switch (planType) {
      case 'monthly':
        expiryDate.setMonth(now.getMonth() + 1);
        break;
      case 'quarterly':
        expiryDate.setMonth(now.getMonth() + 3);
        break;
      case 'yearly':
        expiryDate.setFullYear(now.getFullYear() + 1);
        break;
    }

    // Update user with premium status
    const updatedUser = {
      ...user,
      isPremium: true,
      selectedPlan: planType,
      planExpiryDate: expiryDate.toISOString(),
      downloadsThisMonth: 0 // Reset downloads for new premium user
    };

    updateUser(updatedUser);
    setShowPaymentModal(false);
    setIsProcessingPayment(false);

    // Show success message
    alert(`Payment successful! Welcome to ${planType} premium plan. Payment ID: ${response.razorpay_payment_id}`);
  };

  const handleUpgradeToPremium = (planType: 'monthly' | 'quarterly' | 'yearly') => {
    setIsProcessingPayment(true);
    
    if (window.Razorpay) {
      initializeRazorpayPayment(planType);
    } else {
      alert('Payment gateway not loaded. Please refresh the page and try again.');
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-blue-100 text-lg">
              {user?.isPremium 
                ? `You're on the ${getPlanDisplayName(user.selectedPlan)} plan` 
                : `You're on ${getPlanDisplayName(user.selectedPlan)} - ${remainingDownloads} downloads remaining`
              }
            </p>
            {user?.isPremium && (
              <p className="text-blue-200 text-sm mt-1">{getPlanExpiryText()}</p>
            )}
          </div>
          <div className="hidden md:block">
            {user?.isPremium ? (
              <Crown className="h-16 w-16 text-yellow-300" />
            ) : (
              <Star className="h-16 w-16 text-blue-200" />
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Download className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Downloads This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {user?.downloadsThisMonth || 0}
                {!user?.isPremium && (
                  <span className="text-sm text-gray-500 font-normal">/{FREE_DOWNLOAD_LIMIT} free</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Account Status</p>
              <p className="text-2xl font-bold text-gray-900">
                {getPlanDisplayName(user?.selectedPlan)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Tag className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Templates</p>
              <p className="text-2xl font-bold text-gray-900">{drafts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Download Limit Warning */}
      {!user?.isPremium && (user?.downloadsThisMonth || 0) >= FREE_DOWNLOAD_LIMIT - 1 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                {remainingDownloads > 0 ? `Only ${remainingDownloads} free download${remainingDownloads !== 1 ? 's' : ''} remaining!` : 'Free trial downloads exhausted'}
              </h3>
              <p className="text-orange-700 mb-4">
                {remainingDownloads > 0 
                  ? `Upgrade to Premium now to get unlimited downloads for your ${getPlanDisplayName(user?.selectedPlan)} plan!`
                  : `Upgrade to Premium to continue with unlimited downloads for your ${getPlanDisplayName(user?.selectedPlan)} plan!`
                }
              </p>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Upgrade to Premium Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrafts.map((draft) => (
          <div key={draft.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{draft.title}</h3>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {draft.category}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{draft.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {draft.tags.map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(draft.uploadDate).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Download className="h-4 w-4 mr-1" />
                  {draft.downloadCount} downloads
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{draft.fileSize}</span>
                <button
                  onClick={() => handleDownload(draft)}
                  disabled={!canDownload}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    canDownload
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Download className="h-4 w-4" />
                  <span>{canDownload ? 'Download' : 'Upgrade Required'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDrafts.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No templates found matching your criteria</p>
        </div>
      )}

      {/* Premium Upgrade Modal with Razorpay */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-8">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl inline-block mb-4">
                <Crown className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Upgrade Your {getPlanDisplayName(user?.selectedPlan)} Plan</h3>
              <p className="text-gray-600">
                You've used your 3 free downloads. Upgrade to premium for unlimited access!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Monthly Plan */}
              <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                <h4 className="font-semibold text-lg mb-2">Monthly</h4>
                <p className="text-3xl font-bold text-blue-600 mb-2">₹999</p>
                <p className="text-gray-600 text-sm mb-4">per month</p>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Unlimited downloads</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Priority support</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />New templates first</li>
                </ul>
                <button
                  onClick={() => handleUpgradeToPremium('monthly')}
                  disabled={isProcessingPayment}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isProcessingPayment ? 'Processing...' : 'Choose Monthly'}
                </button>
              </div>

              {/* Quarterly Plan */}
              <div className="border-2 border-purple-300 rounded-lg p-6 relative bg-purple-50">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">Most Popular</span>
                </div>
                <h4 className="font-semibold text-lg mb-2">Quarterly</h4>
                <div className="flex items-center space-x-2 mb-2">
                  <p className="text-3xl font-bold text-purple-600">₹2,499</p>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Save 17%</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">per 3 months</p>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Everything in Monthly</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Advanced templates</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Team collaboration</li>
                </ul>
                <button
                  onClick={() => handleUpgradeToPremium('quarterly')}
                  disabled={isProcessingPayment}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isProcessingPayment ? 'Processing...' : 'Choose Quarterly'}
                </button>
              </div>

              {/* Yearly Plan */}
              <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                <h4 className="font-semibold text-lg mb-2">Yearly</h4>
                <div className="flex items-center space-x-2 mb-2">
                  <p className="text-3xl font-bold text-green-600">₹7,999</p>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Save 33%</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">per year</p>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Everything in Quarterly</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Exclusive templates</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />API access</li>
                </ul>
                <button
                  onClick={() => handleUpgradeToPremium('yearly')}
                  disabled={isProcessingPayment}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isProcessingPayment ? 'Processing...' : 'Choose Yearly'}
                </button>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Maybe Later
              </button>
            </div>

            <div className="text-center mt-6">
              <div className="inline-flex items-center space-x-2 text-gray-500 text-sm">
                <CreditCard className="h-4 w-4" />
                <span>Secure payment powered by Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
