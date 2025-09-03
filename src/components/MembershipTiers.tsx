import { motion } from 'framer-motion';
import { useState } from 'react';

const plans = [
  {
    name: 'Monthly',
    price: '₹999',
    period: 'month',
    description: 'Flexible Start - Perfect for trying out our platform',
    features: {
      core: [
        'Access to 2-3 new modules monthly',
        '1 live interactive expert session/month',
        'Teacher community forum access',
        'Monthly teaching toolkit downloads',
        'Basic progress tracking',
        'Email support (48h response)'
      ],
      target: 'New teachers, freelance tutors',
      value: 'Try before committing annually',
      testimonial: {
        text: "As a new teacher, the monthly plan helped me explore different teaching methods without a big commitment. The live sessions are game-changers!",
        author: "Priya M., Primary Teacher",
        rating: 4
      }
    },
    featured: false,
    buttonText: 'Pay Now - ₹999/month',
    buttonVariant: 'secondary',
    amount: 99900, // Amount in paise for Razorpay
  },
  {
    name: 'Annual',
    price: '₹9,999',
    period: 'year',
    description: 'Best Value - Save ₹2,988 vs monthly',
    features: {
      core: [
        'Full access to ALL self-paced modules',
        '12+ live masterclasses (monthly)',
        '1 capstone project submission',
        'Annual Certificate of Completion',
        'Resource library access',
        'Priority email support (24h)'
      ],
      bonus: [
        'Free/discounted workshop invitations',
        'Teaching resources pack',
        'Exclusive webinars',
        'Mentor Q&A sessions'
      ],
      target: 'Dedicated teachers, school faculty',
      value: 'Save 16% vs monthly',
      testimonial: {
        text: "The annual plan was the best investment in my teaching career. The capstone project helped me implement new strategies that improved my students' performance by 40%.",
        author: "Rajesh K., High School Teacher",
        rating: 5
      }
    },
    featured: true,
    buttonText: 'Pay Now - ₹9,999/year',
    buttonVariant: 'primary',
    popular: true,
    amount: 999900, // Amount in paise for Razorpay
    savings: 'Save ₹2,988'
  },
  {
    name: 'Premium',
    price: '₹19,999',
    period: 'year',
    description: 'Ultimate Professional Development',
    features: {
      core: [
        'Everything in Annual, plus:',
        '1:1 coaching sessions (4/year)',
        'Personalized learning path',
        'Priority access to new courses',
        'Exclusive premium resources',
        '24/7 priority support'
      ],
      bonus: [
        'All bonus features from Annual',
        '2 free guest passes for colleagues',
        'Early access to beta features',
        'Personalized teaching portfolio review',
        'Featured profile in our educator network'
      ],
      target: 'Senior educators, department heads',
      value: 'Premium support + exclusive resources',
      testimonial: {
        text: "The 1:1 coaching sessions in the premium plan helped me transition into a leadership role. The personalized attention was worth every penny.",
        author: "Dr. Anjali P., College Professor",
        rating: 5
      }
    },
    featured: false,
    buttonText: 'Pay Now - ₹19,999/year',
    buttonVariant: 'primary',
    amount: 1999900, // Amount in paise for Razorpay,
    popular: false
  }
];

const addOns = [
  {
    name: 'Pay-per-Course',
    price: '₹1,499–₹2,999',
    description: 'Individual course access',
    features: [
      '30-day access',
      'Certificate of completion',
      'Basic support'
    ]
  },
  {
    name: 'Teaching Resources',
    price: 'From ₹499/month',
    description: 'Premium lesson plans & worksheets',
    features: [
      '1000+ resources',
      'Customizable templates',
      'New weekly content'
    ]
  },
  {
    name: 'Micro-Credentials',
    price: '₹3,000–₹5,000',
    description: 'Specialized certifications',
    features: [
      'Industry-recognized',
      'Portfolio-ready',
      'Verifiable credentials'
    ]
  },
  {
    name: 'Scholarship',
    price: 'Up to 50% off',
    description: 'Financial assistance',
    features: [
      'Need-based',
      'EMI options',
      'Special educator discounts'
    ]
  }
];

const ReferralProgram = () => (
  <div className="mt-16 p-8 bg-gradient-to-r from-purple-900/30 to-pink-900/20 rounded-2xl border border-purple-500/30">
    <div className="max-w-4xl mx-auto text-center">
      <h3 className="text-2xl font-bold text-white mb-4">Referral Program</h3>
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {[
          {
            icon: '💰',
            title: 'Earn Credits',
            description: '₹500 discount per referral'
          },
          {
            icon: '🏆',
            title: 'Top Referrers',
            description: 'Free premium access for leaders'
          },
          {
            icon: '🎁',
            title: 'Stackable Rewards',
            description: 'Up to 50% off next renewal'
          }
        ].map((item, i) => (
          <div key={i} className="bg-gray-800/50 p-6 rounded-xl">
            <div className="text-3xl mb-3">{item.icon}</div>
            <h4 className="font-semibold text-white mb-1">{item.title}</h4>
            <p className="text-sm text-gray-300">{item.description}</p>
          </div>
        ))}
      </div>
      <button className="mt-8 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors">
        Join Referral Program
      </button>
    </div>
  </div>
);

const AddOnsShowcase = () => (
  <div className="mt-16">
    <h3 className="text-2xl font-bold text-center mb-8">Add-On Services</h3>
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {addOns.map((addOn, i) => (
        <div key={i} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-purple-500/30 transition-colors">
          <h4 className="font-bold text-lg text-white mb-1">{addOn.name}</h4>
          <p className="text-purple-400 font-medium mb-4">{addOn.price}</p>
          <p className="text-sm text-gray-300 mb-4">{addOn.description}</p>
          <ul className="space-y-2 text-sm text-gray-300">
            {addOn.features.map((feature, j) => (
              <li key={j} className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
          <button className="mt-4 w-full py-2 text-sm bg-gray-700/50 hover:bg-gray-700/80 rounded-lg transition-colors">
            Learn More
          </button>
        </div>
      ))}
    </div>
  </div>
);

export default function MembershipTiers({ onSelectPlan }: { onSelectPlan: (plan: string) => void }) {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Flexible options to fit your professional development needs and budget.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative rounded-2xl p-8 backdrop-blur-sm ${
                plan.featured
                  ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50 scale-105 z-10 shadow-2xl shadow-purple-500/20'
                  : 'bg-gray-800/30 border border-gray-700/50 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10'
              } transition-all duration-300`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="h-full flex flex-col">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                      {plan.price}
                    </span>
                    <span className="text-gray-400">/{plan.period}</span>
                    {plan.savings && (
                      <span className="ml-2 px-2 py-1 text-xs bg-green-900/50 text-green-400 rounded-full">
                        {plan.savings}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <h4 className="font-semibold text-white mb-2">Core Features:</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      {plan.features.core.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {plan.features.bonus && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-white mb-2">Bonus Perks:</h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        {plan.features.bonus.map((bonus, i) => (
                          <li key={i} className="flex items-start">
                            <svg className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            {bonus}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="bg-gray-800/30 p-4 rounded-lg mb-6">
                    <p className="text-sm mb-2">
                      <span className="font-medium text-white">Ideal for:</span> {plan.features.target}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-white">Value:</span> {plan.features.value}
                    </p>
                  </div>
                  {plan.features.testimonial && (
                    <div className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-purple-500 mb-6">
                      <p className="text-sm italic text-gray-300 mb-2">"{plan.features.testimonial.text}"</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">{plan.features.testimonial.author}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < plan.features.testimonial.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-auto">
                  <motion.button
                    onClick={() => onSelectPlan(plan.name)}
                    className={`w-full py-3 px-6 rounded-lg font-medium ${
                      plan.featured
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                        : 'bg-gray-700/50 text-white hover:bg-gray-700/70 border border-gray-600/50'
                    } transition-all duration-300`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {plan.buttonText}
                  </motion.button>
                  {plan.popular && (
                    <p className="mt-3 text-xs text-center text-gray-400">
                      Most popular choice among educators
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {/* Referral Program */}
        <ReferralProgram />
        
        {/* Add-Ons Showcase */}
        <AddOnsShowcase />
        
        {/* EMI Option */}
        <div className="mt-12 text-center text-sm text-gray-400">
          <p>EMI options available on all plans. Contact us for institutional pricing.</p>
          <button className="mt-2 text-purple-400 hover:text-purple-300 transition-colors">
            Learn more about payment options →
          </button>
        </div>
      </div>
    </section>
  );
}
