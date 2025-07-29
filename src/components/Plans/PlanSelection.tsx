import React, { useState } from 'react';
import { Check, Star, Crown, Zap, Shield, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plan } from '../../types';
import { supabase } from '../../lib/supabase';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PlanSelection: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'yearly' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const plans: Plan[] = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: 999, // ₹9.99 in paise
      duration: 'per month',
      downloads: 'Unlimited',
      features: [
        '3 free downloads to try',
        'Then unlimited downloads',
        'Access to all templates',
        'Priority support',
        'New templates first',
        'Mobile app access'
      ]
    },
    {
      id: 'quarterly',
      name: 'Quarterly',
      price: 2499, // ₹24.99 in paise
      originalPrice: 2997,
      duration: 'per 3 months',
      downloads: 'Unlimited',
      popular: true,
      savings: 'Save 17%',
      features: [
        '3 free downloads to try',
        '9 downloads per quarter (resets quarterly)',
        'Everything in Monthly',
        'Advanced templates',
        'Custom template requests',
        'Team collaboration',
        'Export to multiple formats'
      ]
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: 7999, // ₹79.99 in paise
      originalPrice: 11988,
      duration: 'per year',
      downloads: 'Unlimited',
      savings: 'Save 33%',
      features: [
        '3 free downloads to try',
        'Then unlimited downloads',
        'Everything in Quarterly',
        'Exclusive premium templates',
        'Personal template designer',
        'White-label options',
        'API access'
      ]
    }
  ];

  const handlePlanSelect = (planId: 'monthly' | 'quarterly' | 'yearly') => {
    setSelectedPlan(planId);
  };

  const initializeRazorpayPayment = (planType: 'monthly' | 'quarterly' | 'yearly') => {
    const selectedPlanData = plans.find(p => p.id === planType);
    if (!selectedPlanData) return;

    const options = {
      key: 'rzp_test_1234567890', // Replace with your actual Razorpay key
      amount: selectedPlanData.price,
      currency: 'INR',
      name: 'DraftKeeper',
      description: `${selectedPlanData.name} Premium Subscription`,
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
          setIsProcessing(false);
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

    // Update user with selected plan
    const updatedUser = {
      ...user,
      selectedPlan: planType,
      isPremium: true,
      planExpiryDate: expiryDate.toISOString(),
      downloadsThisMonth: 0 // Reset downloads for new plan
    };

    updateUser(updatedUser);
    setIsProcessing(false);
    
    // Show success message and navigate
    alert(`Payment successful! Welcome to ${planType} premium plan. Payment ID: ${response.razorpay_payment_id}`);
    navigate('/dashboard');
  };

  const handleStartTrial = async () => {
    if (!selectedPlan || !user) return;

    setIsProcessing(true);

    // Set user to trial mode with selected plan but not premium yet
    const updatedUser = {
      ...user,
      selectedPlan: selectedPlan,
      isPremium: false, // Not premium until payment
      downloadsThisMonth: 0 // Start with 0 downloads for trial
    };

    updateUser(updatedUser);
    setIsProcessing(false);
    navigate('/dashboard');
  };

  const handlePayNow = async () => {
    if (!selectedPlan || !user) return;

    setIsProcessing(true);

    if (window.Razorpay) {
      initializeRazorpayPayment(selectedPlan);
    } else {
      alert('Payment gateway not loaded. Please refresh the page and try again.');
      setIsProcessing(false);
    }
  };

  const formatPrice = (priceInPaise: number) => {
    return `₹${(priceInPaise / 100).toFixed(0)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
              <Crown className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start with 3 free downloads on any plan, then upgrade for unlimited access
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-green-800">
              <Check className="h-5 w-5" />
              <span className="font-semibold">All plans include 3 FREE downloads to try before you pay!</span>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl cursor-pointer ${
                selectedPlan === plan.id
                  ? 'border-blue-500 ring-4 ring-blue-100 transform scale-105'
                  : 'border-gray-200 hover:border-blue-300'
              } ${plan.popular ? 'ring-2 ring-purple-200' : ''}`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              {/* Savings Badge */}
              {plan.savings && (
                <div className="absolute top-6 right-6">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {plan.savings}
                  </div>
                </div>
              )}

              {/* Free Trial Badge */}
              <div className="absolute top-6 left-6">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                  3 Free Downloads
                </div>
              </div>

              <div className="p-8 pt-12">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-center justify-center space-x-2">
                    {plan.originalPrice && (
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(plan.originalPrice)}
                      </span>
                    )}
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(plan.price)}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{plan.duration}</p>
                </div>

                {/* Downloads */}
                <div className="text-center mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                    <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-lg font-semibold text-blue-900">{plan.downloads}</p>
                    <p className="text-sm text-blue-700">after 3 free downloads</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500 mt-0.5" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                <button
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    selectedPlan === plan.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Start Trial Button */}
          <button
            onClick={handleStartTrial}
            disabled={!selectedPlan || isProcessing}
            className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
              selectedPlan && !isProcessing
                ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Starting Trial...</span>
              </div>
            ) : selectedPlan ? (
              `Start Free Trial - ${plans.find(p => p.id === selectedPlan)?.name} Plan`
            ) : (
              'Select a Plan to Start Free Trial'
            )}
          </button>

          {/* Pay Now Button */}
          <button
            onClick={handlePayNow}
            disabled={!selectedPlan || isProcessing}
            className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 border-2 ${
              selectedPlan && !isProcessing
                ? 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'border-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                <span>Processing Payment...</span>
              </div>
            ) : selectedPlan ? (
              `Pay Now ${formatPrice(plans.find(p => p.id === selectedPlan)?.price || 0)} - Skip Trial`
            ) : (
              'Select a Plan to Pay Now'
            )}
          </button>

          {selectedPlan && (
            <div className="text-center max-w-md">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Free Trial:</strong> Get 3 downloads to try {plans.find(p => p.id === selectedPlan)?.name} plan features
              </p>
              <p className="text-xs text-gray-500">
                After 3 downloads, you'll be prompted to upgrade for unlimited access
              </p>
            </div>
          )}
        </div>

        {/* Security Badge */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <Shield className="h-5 w-5" />
            <CreditCard className="h-5 w-5" />
            <span className="text-sm">Secure payment powered by Razorpay • Cancel anytime • 30-day money-back guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSelection;