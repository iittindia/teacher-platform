import { motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'High School Teacher',
    content: 'The AI counselor helped me redesign my lesson plans and my students are more engaged than ever. My classroom management has improved significantly!',
    rating: 5,
    avatar: '/avatars/teacher1.jpg'
  },
  {
    id: 2,
    name: 'Rahul Verma',
    role: 'School Principal',
    content: 'Our teachers have transformed their teaching methods after joining this platform. The professional development resources are top-notch and tailored to our needs.',
    rating: 5,
    avatar: '/avatars/principal1.jpg'
  },
  {
    id: 3,
    name: 'Ananya Patel',
    role: 'Middle School Teacher',
    content: 'I was skeptical about AI in education, but the personalized coaching helped me connect better with my students and improve their learning outcomes.',
    rating: 5,
    avatar: '/avatars/teacher2.jpg'
  },
  {
    id: 4,
    name: 'Vikram Singh',
    role: 'Educational Coordinator',
    content: 'The platform has been instrumental in our teacher training program. The progress tracking and analytics help us measure impact effectively.',
    rating: 4,
    avatar: '/avatars/coordinator1.jpg'
  },
  {
    id: 5,
    name: 'Meera Kapoor',
    role: 'Elementary Teacher',
    content: 'The resources and community support have been invaluable. I\'ve grown more in the past 6 months than in my previous 5 years of teaching!',
    rating: 5,
    avatar: '/avatars/teacher3.jpg'
  }
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === Math.ceil(testimonials.length / 2) - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.ceil(testimonials.length / 2) - 1 : prev - 1));
  };

  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying]);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const visibleTestimonials = testimonials.slice(currentIndex * 2, currentIndex * 2 + 2);

  return (
    <section className="py-20 px-4 bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            What Educators Say
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join thousands of teachers who have transformed their teaching practice.
          </p>
        </motion.div>

          <div className="relative max-w-5xl mx-auto">
            <div className="overflow-hidden">
              <motion.div 
                className="flex transition-transform duration-500 ease-in-out"
                initial={false}
                animate={{
                  x: `-${currentIndex * 100}%`,
                }}
              >
                {Array.from({ length: Math.ceil(testimonials.length / 2) }).map((_, groupIndex) => (
                  <div key={groupIndex} className="w-full flex-shrink-0 px-4">
                    <div className="grid md:grid-cols-2 gap-8">
                      {testimonials.slice(groupIndex * 2, groupIndex * 2 + 2).map((testimonial) => (
                        <motion.div
                          key={testimonial.id}
                          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/30 transition-colors h-full"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5 }}
                          whileHover={{ y: -5 }}
                        >
                          <div className="flex items-center mb-6">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xl mr-4">
                              {testimonial.avatar ? (
                                <img 
                                  src={testimonial.avatar} 
                                  alt={testimonial.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                testimonial.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-white">{testimonial.name}</h4>
                              <p className="text-sm text-purple-400">{testimonial.role}</p>
                            </div>
                            <div className="ml-auto flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-300 italic">"{testimonial.content}"</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => {
                prevSlide();
                setIsAutoPlaying(false);
                setTimeout(() => setIsAutoPlaying(true), 10000);
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/80 text-gray-300 hover:text-white transition-colors border border-gray-700/50"
              aria-label="Previous testimonial"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => {
                nextSlide();
                setIsAutoPlaying(false);
                setTimeout(() => setIsAutoPlaying(true), 10000);
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/80 text-gray-300 hover:text-white transition-colors border border-gray-700/50"
              aria-label="Next testimonial"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-12 space-x-2">
            {Array.from({ length: Math.ceil(testimonials.length / 2) }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-700'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
            {[
              { number: '5,000+', label: 'Teachers' },
              { number: '98%', label: 'Satisfaction' },
              { number: '50+', label: 'Courses' },
              { number: '24/7', label: 'Support' }
            ].map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }
