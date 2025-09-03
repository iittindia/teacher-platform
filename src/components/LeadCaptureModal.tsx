import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import React from 'react';

// Add type definitions for gtag
interface Window {
  gtag?: (...args: any[]) => void;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

type FormData = {
  name: string;
  email: string;
  phone: string;
  role: string;
  experience: string;
  goals: string;
  interests: string[];
  learningStyle: string;
  budget: string;
  international: string;
  preferredContact: string;
  hearAboutUs: string;
};

type StepProps = {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  errors: Record<string, string>;
  inputRef?: React.RefObject<HTMLInputElement | null>;
};

const roleOptions = [
  { value: 'teacher', label: 'Teacher' },
  { value: 'principal', label: 'Principal' },
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'other', label: 'Other' },
];

const experienceOptions = [
  { value: '0-2', label: '0-2 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5-10', label: '5-10 years' },
  { value: '10+', label: '10+ years' },
];

const Step1 = ({ formData, updateFormData, errors, inputRef }: StepProps) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-2xl font-bold text-white">Personal Information</h3>
      <p className="text-gray-400">Tell us a bit about yourself</p>
    </div>
    
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          ref={inputRef}
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          className={`w-full px-4 py-3 rounded-lg bg-gray-800/50 border ${
            errors.name ? 'border-red-500' : 'border-gray-700'
          } text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          placeholder="John Doe"
          autoComplete="name"
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-red-400">
            {errors.name}
          </p>
        )}
        {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={(e) => updateFormData({ email: e.target.value })}
          className={`w-full px-4 py-3 rounded-lg bg-gray-800/50 border ${
            errors.email ? 'border-red-500' : 'border-gray-700'
          } text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          placeholder="you@example.com"
          autoComplete="email"
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-400">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={(e) => updateFormData({ phone: e.target.value })}
          className={`w-full px-4 py-3 rounded-lg bg-gray-800/50 border ${
            errors.phone ? 'border-red-500' : 'border-gray-700'
          } text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          placeholder="+91 98765 43210"
          autoComplete="tel"
          aria-required="true"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
        />
        {errors.phone && (
          <p id="phone-error" className="mt-1 text-sm text-red-400">
            {errors.phone}
          </p>
        )}
      </div>
    </div>
  </div>
);

const Step2 = ({ formData, updateFormData, errors }: StepProps) => {
  const teachingGoals = [
    { id: 'career', label: 'Career advancement' },
    { id: 'skills', label: 'Improve teaching skills' },
    { id: 'certification', label: 'Get certified' },
    { id: 'salary', label: 'Increase salary' },
    { id: 'abroad', label: 'Teach abroad' },
    { id: 'leadership', label: 'Leadership roles' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white">Your Teaching Goals</h3>
        <p className="text-gray-400">What are you looking to achieve? (Select all that apply)</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {teachingGoals.map((goal) => (
            <label key={goal.id} className="flex items-center space-x-2 p-3 bg-gray-800/50 hover:bg-gray-800/70 rounded-lg border border-gray-700/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formData.interests?.includes(goal.id) || false}
                onChange={(e) => {
                  const newInterests = e.target.checked
                    ? [...(formData.interests || []), goal.id]
                    : (formData.interests || []).filter((i) => i !== goal.id);
                  updateFormData({ interests: newInterests });
                }}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded"
              />
              <span className="text-sm text-gray-300">{goal.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-4">
          <label htmlFor="goals" className="block text-sm font-medium text-gray-300 mb-2">
            Any specific goals or challenges? (Optional)
          </label>
          <textarea
            id="goals"
            value={formData.goals || ''}
            onChange={(e) => updateFormData({ goals: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
            placeholder="E.g., I want to become a school principal within 3 years..."
          />
        </div>
      </div>
    </div>
  );
};

const Step3 = ({ formData, updateFormData, errors }: StepProps) => {
  const learningStyles = [
    { id: 'visual', label: 'Visual (videos, diagrams)' },
    { id: 'auditory', label: 'Auditory (lectures, discussions)' },
    { id: 'reading', label: 'Reading/Writing (books, articles)' },
    { id: 'kinesthetic', label: 'Hands-on (practice, workshops)' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white">Learning Preferences</h3>
        <p className="text-gray-400">Help us personalize your experience</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Preferred Learning Style <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {learningStyles.map((style) => (
              <label key={style.id} className="flex items-center space-x-3 p-3 bg-gray-800/50 hover:bg-gray-800/70 rounded-lg border border-gray-700/50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="learningStyle"
                  value={style.id}
                  checked={formData.learningStyle === style.id}
                  onChange={() => updateFormData({ learningStyle: style.id })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600"
                />
                <span className="text-sm text-gray-300">{style.label}</span>
              </label>
            ))}
          </div>
          {errors.learningStyle && (
            <p className="mt-2 text-sm text-red-400">{errors.learningStyle}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Budget for Professional Development <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { value: '0-5k', label: 'Under ₹5,000' },
              { value: '5k-15k', label: '₹5,000 - ₹15,000' },
              { value: '15k-30k', label: '₹15,000 - ₹30,000' },
              { value: '30k+', label: '₹30,000+' },
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-2 p-3 bg-gray-800/50 hover:bg-gray-800/70 rounded-lg border border-gray-700/50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="budget"
                  value={option.value}
                  checked={formData.budget === option.value}
                  onChange={() => updateFormData({ budget: option.value })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600"
                />
                <span className="text-sm text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.budget && (
            <p className="mt-2 text-sm text-red-400">{errors.budget}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Step4 = ({ formData, updateFormData, errors }: StepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white">Almost There!</h3>
        <p className="text-gray-400">Just a few more details to personalize your experience</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Are you interested in international teaching opportunities? <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            {[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
              { value: 'maybe', label: 'Maybe in future' },
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="international"
                  value={option.value}
                  checked={formData.international === option.value}
                  onChange={() => updateFormData({ international: option.value })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600"
                />
                <span className="text-sm text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.international && (
            <p className="mt-2 text-sm text-red-400">{errors.international}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Preferred Contact Method <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.preferredContact}
            onChange={(e) => updateFormData({ preferredContact: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="call">Phone Call</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            How did you hear about us?
          </label>
          <select
            value={formData.hearAboutUs || ''}
            onChange={(e) => updateFormData({ hearAboutUs: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select an option</option>
            <option value="search">Search Engine (Google, etc.)</option>
            <option value="social">Social Media</option>
            <option value="friend">Friend/Colleague</option>
            <option value="email">Email Newsletter</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Animation variants with proper TypeScript types
import type { Variants } from 'framer-motion';

const modalVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.98 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: 'spring' as const,
      damping: 25,
      stiffness: 300,
      when: 'beforeChildren' as const,
      staggerChildren: 0.05
    }
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { 
      duration: 0.2,
      ease: 'easeInOut'
    }
  }
};

const itemVariants: Variants = {
  hidden: { 
    y: 10, 
    opacity: 0 
  },
  visible: (i: number = 0) => ({
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
      delay: i * 0.1
    }
  })
};

// Helper function to get form data from localStorage
const getStoredFormData = (): Partial<FormData> => {
  if (typeof window === 'undefined') return {};
  const saved = localStorage.getItem('leadFormData');
  return saved ? JSON.parse(saved) : {};
};

export default function LeadCaptureModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(() => ({
    name: '',
    email: '',
    phone: '',
    role: '',
    experience: '',
    goals: '',
    interests: [],
    learningStyle: '',
    budget: '',
    international: '',
    preferredContact: 'email',
    hearAboutUs: '',
    ...getStoredFormData()
  }));
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus first input when modal opens
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isOpen, step]);

  // Save form data to localStorage on change
  useEffect(() => {
    if (isOpen) {
      localStorage.setItem('leadFormData', JSON.stringify(formData));
    }
  }, [formData, isOpen]);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        ...data
      };
      
      // Handle array fields properly
      if (data.interests) {
        newData.interests = Array.isArray(data.interests) 
          ? data.interests 
          : [data.interests].filter(Boolean);
      }
      
      return newData;
    });
    
    // Clear error for the field being updated
    const field = Object.keys(data)[0];
    if (field && errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Clear any submit errors when user starts typing
    if (submitError) {
      setSubmitError(null);
    }
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^[0-9]{10}$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid 10-digit number';
      }
    } else if (currentStep === 2) {
      if (!formData.role) newErrors.role = 'Please select your current role';
      if (!formData.experience) newErrors.experience = 'Please select your experience level';
    } else if (currentStep === 3) {
      if (!formData.learningStyle) newErrors.learningStyle = 'Please select your preferred learning style';
      if (!formData.budget) newErrors.budget = 'Please select your budget range';
    } else if (currentStep === 4) {
      if (!formData.international) newErrors.international = 'Please specify your interest in international opportunities';
      if (!formData.preferredContact) newErrors.preferredContact = 'Please select your preferred contact method';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = async () => {
    if (validateStep(step)) {
      // If this is the last step, submit the form
      if (step === 4) {
        await handleSubmit();
        return;
      }
      
      // Otherwise, go to next step
      setStep(step + 1);
      
      // Save form data to localStorage
      localStorage.setItem('leadFormData', JSON.stringify(formData));
      
      // Scroll to top of modal for better UX
      modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // If validation fails, scroll to the first error
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const errorElement = document.querySelector(`[name="${firstError}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Focus the first error field
          (errorElement as HTMLElement).focus();
        }
      }
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    // Scroll to top of modal when going back
    modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      experience: '',
      goals: '',
      interests: [],
      learningStyle: '',
      budget: '',
      international: '',
      preferredContact: 'email',
      hearAboutUs: ''
    });
    localStorage.removeItem('leadFormData');
    setStep(1);
  };

  // Handle modal close with animation
  const handleClose = useCallback(() => {
    setStep(1);
    onClose();
  }, [onClose]);

  // Handle form submission
  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Scroll to top of modal
      if (modalRef.current) {
        modalRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
          source: 'website_lead_form',
          // Add utm parameters if available
          utm_source: new URLSearchParams(window.location.search).get('utm_source'),
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit form');
      }
      
      // Clear form data from localStorage on successful submission
      localStorage.removeItem('leadFormData');
      
      // Track successful submission in analytics if available
      if (window.gtag) {
        window.gtag('event', 'generate_lead', {
          'event_category': 'Lead Generation',
          'value': 1
        });
      }
      
      // Move to success step (step 5)
      setStep(5);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      // Show error message to user in a more elegant way
      setSubmitError(error instanceof Error ? error.message : 'There was an error submitting your form. Please try again.');
      
      // Scroll to top to show error message
      if (modalRef.current) {
        modalRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    // Add error boundary and submit error display
    if (submitError) {
      return (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
          <span className="font-medium">Error:</span> {submitError}
        </div>
      );
    }

    switch (step) {
      case 1:
        return <Step1 formData={formData} updateFormData={updateFormData} errors={errors} inputRef={firstInputRef} />;
      case 2:
        return <Step2 formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 3:
        return <Step3 formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 4:
        return <Step4 formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 5:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <motion.div 
              initial={{ scale: 0.5 }}
              animate={{ 
                scale: 1,
                transition: { 
                  type: 'spring',
                  stiffness: 260,
                  damping: 20 
                }
              }}
              className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <motion.h3 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
              className="text-2xl font-bold text-white mb-3"
            >
              Thank You, {formData.name.split(' ')[0]}! 🎉
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
              className="text-gray-400 mb-6 max-w-md mx-auto"
            >
              We've received your information and our team will contact you within 24 hours to discuss the best plan for your needs.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
              className="space-y-3"
            >
              <p className="text-sm text-gray-500">
                Next steps:
              </p>
              <ul className="text-sm text-gray-400 space-y-1 mb-6">
                <li className="flex items-center justify-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>Form submitted successfully</span>
                </li>
                <li className="flex items-center justify-center space-x-2">
                  <span className="text-blue-400 animate-pulse">•</span>
                  <span>Team member will contact you soon</span>
                </li>
                <li className="flex items-center justify-center space-x-2">
                  <span className="text-blue-400 animate-pulse">•</span>
                  <span>Check your email for confirmation</span>
                </li>
              </ul>
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-purple-500/20"
              >
                Close & Continue Browsing
              </button>
            </motion.div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  // Calculate progress percentage for the progress bar
  const progress = (step / 4) * 100;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isOpen ? 'block' : 'hidden'}`}>
      {/* Overlay with fade animation */}
      <motion.div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Modal */}
      <motion.div 
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ 
          opacity: isOpen ? 1 : 0, 
          scale: isOpen ? 1 : 0.95,
          y: isOpen ? 0 : 20,
          transition: {
            type: 'spring',
            damping: 25,
            stiffness: 400,
            mass: 0.8
          }
        }}
        exit={{ 
          opacity: 0, 
          scale: 0.95, 
          y: 20,
          transition: { duration: 0.15 }
        }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-800/50 scrollbar-thin scrollbar-thumb-gray-700/50 scrollbar-track-transparent backdrop-blur-sm"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          aria-label="Close modal"
          aria-expanded={isOpen}
          aria-controls="lead-capture-modal"
        >
          <XMarkIcon className="w-6 h-6 text-gray-400" />
        </button>

        {/* Animated progress bar */}
        <div className="h-1.5 bg-gray-800/50 overflow-hidden relative">
          <motion.div 
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-fuchsia-500/20"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Form content with staggered animations */}
        <div 
        id="lead-capture-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="p-6"
      >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: { 
                  opacity: 1, 
                  x: 0,
                  transition: { 
                    when: 'beforeChildren',
                    staggerChildren: 0.05,
                    duration: 0.3 
                  } 
                },
                exit: { 
                  opacity: 0, 
                  x: -20,
                  transition: { duration: 0.2 }
                }
              }}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <LayoutGroup>
                {renderStep()}

                {/* Navigation buttons with spring animations */}
                <motion.div 
                  layout
                  layoutId="navigation-buttons"
                  className="mt-8 flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4"
                >
                  {step > 1 ? (
                    <motion.button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-2.5 border border-gray-700 text-gray-300 font-medium rounded-lg hover:bg-gray-800/50 transition-colors flex items-center justify-center"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02, borderColor: 'rgba(168, 85, 247, 0.5)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ArrowRightIcon className="w-4 h-4 mr-2 transform rotate-180" />
                      Back
                    </motion.button>
                  ) : (
                    <div></div>
                  )}

                  {step < 4 ? (
                    <motion.button
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center"
                      disabled={isSubmitting}
                      layoutId="continue-button"
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: '0 0 15px rgba(192, 132, 252, 0.3)'
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continue
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </motion.button>
                  ) : (
                    <motion.button
                      type="button"
                      onClick={handleSubmit}
                      className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 flex items-center justify-center min-w-[120px]"
                      disabled={isSubmitting}
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Submit
                        </>
                      )}
                    </motion.button>
                  )}
                </motion.div>
              </LayoutGroup>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
