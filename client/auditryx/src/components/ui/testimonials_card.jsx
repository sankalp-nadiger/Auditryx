"use client";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export const AnimatedTestimonials = ({
  testimonials,
  autoplay = false
}) => {
  
  const defaultTestimonials = [
    {
      name: "Sarah Chen",
      designation: "Chief Compliance Officer, TechCorp Industries",
      quote: "Auditryx has revolutionized how we manage supplier compliance. The real-time tracking and automated alerts have reduced our compliance risks by 85% while streamlining our entire audit process.",
      src: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      name: "Michael Rodriguez",
      designation: "VP of Operations, Global Manufacturing Ltd",
      quote: "The supplier tracking capabilities in Auditryx are exceptional. We now have complete visibility into our supply chain compliance status, making vendor management effortless and transparent.",
      src: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      name: "Emily Thompson",
      designation: "Risk Management Director, Enterprise Solutions",
      quote: "Since implementing Auditryx, our audit preparation time has decreased by 70%. The comprehensive reporting and documentation features have made compliance management a strategic advantage.",
      src: "https://randomuser.me/api/portraits/women/65.jpg"
    },
    {
      name: "David Park",
      designation: "Procurement Manager, Innovation Corp",
      quote: "Auditryx's intuitive interface and powerful analytics have transformed our supplier relationship management. We can now proactively address compliance issues before they become problems.",
      src: "https://randomuser.me/api/portraits/men/41.jpg"
    }
  ];

  const testimonialsToUse = Array.isArray(testimonials) && testimonials.length > 0 ? testimonials : defaultTestimonials;
  const [active, setActive] = useState(0);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonialsToUse.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonialsToUse.length) % testimonialsToUse.length);
  };

  const isActive = (index) => {
    return index === active;
  };

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, testimonialsToUse.length]);

  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10;
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-20 font-sans antialiased md:max-w-4xl md:px-8 lg:px-12 bg-white">
      <div className="relative grid grid-cols-1 gap-20 md:grid-cols-2">
        <div>
          <div className="relative h-80 w-full">
            <AnimatePresence>
              {testimonialsToUse.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: randomRotateY(),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : randomRotateY(),
                    zIndex: isActive(index)
                      ? 40
                      : testimonialsToUse.length + 2 - index,
                    y: isActive(index) ? [0, -80, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: randomRotateY(),
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 origin-bottom">
                  <img
                    src={testimonial.src}
                    alt={testimonial.name}
                    width={500}
                    height={500}
                    draggable={false}
                    className="h-full w-full rounded-3xl object-cover object-center shadow-lg" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex flex-col justify-between py-4">
          <motion.div
            key={active}
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: -20,
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}>
            <h3 className="text-2xl font-bold text-gray-900">
              {testimonialsToUse[active].name}
            </h3>
            <p className="text-sm text-blue-600 font-medium">
              {testimonialsToUse[active].designation}
            </p>
            <motion.p className="mt-8 text-lg text-gray-600 leading-relaxed">
              {testimonialsToUse[active].quote.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{
                    filter: "blur(10px)",
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    filter: "blur(0px)",
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                    delay: 0.02 * index,
                  }}
                  className="inline-block">
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
          </motion.div>
          <div className="flex gap-4 pt-12 md:pt-0">
            <button
              onClick={handlePrev}
              className="group/button flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-blue-50 transition-colors duration-200 border border-gray-200">
              <IconArrowLeft
                className="h-5 w-5 text-gray-600 transition-transform duration-300 group-hover/button:rotate-12 group-hover/button:text-blue-600" />
            </button>
            <button
              onClick={handleNext}
              className="group/button flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-blue-50 transition-colors duration-200 border border-gray-200">
              <IconArrowRight
                className="h-5 w-5 text-gray-600 transition-transform duration-300 group-hover/button:-rotate-12 group-hover/button:text-blue-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};