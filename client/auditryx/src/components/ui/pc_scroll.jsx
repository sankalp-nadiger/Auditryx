"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  IconBrightnessDown,
  IconBrightnessUp,
  IconCaretRightFilled,
  IconCaretUpFilled,
  IconChevronUp,
  IconMicrophone,
  IconMoon,
  IconPlayerSkipForward,
  IconPlayerTrackNext,
  IconPlayerTrackPrev,
  IconTable,
  IconVolume,
  IconVolume2,
  IconVolume3,
  IconSearch,
  IconWorld,
  IconCommand,
  IconCaretLeftFilled,
  IconCaretDownFilled,
} from "@tabler/icons-react";

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const MacbookScroll = ({
  src,
  showGradient,
  title,
  badge
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window && window.innerWidth < 768) {
      setIsMobile(true);
    }
  }, []);

  const scaleX = useTransform(scrollYProgress, [0, 0.3], [1.2, isMobile ? 1 : 1.5]);
  const scaleY = useTransform(scrollYProgress, [0, 0.3], [0.6, isMobile ? 1 : 1.5]);
  const translate = useTransform(scrollYProgress, [0, 1], [0, 1500]);
  const rotate = useTransform(scrollYProgress, [0.1, 0.12, 0.3], [-28, -28, 0]);
  const textTransform = useTransform(scrollYProgress, [0, 0.3], [0, 100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const lidOpacity = useTransform(scrollYProgress, [0.2, 0.4], [1, 0]);

  return (
    <div
      ref={ref}
      className="flex min-h-[200vh] w-full shrink-0 flex-col items-center justify-start py-20 [perspective:800px] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">

      
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>

      {/* Enhanced Title Section */}
      <motion.div
        style={{
          translateY: textTransform,
          opacity: textOpacity,
        }}
        className="mb-16 text-center px-4 relative z-10">
        
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6 border border-blue-200">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
          AI-Powered Compliance Platform
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          {title || (
            <span>
              Experience Auditryx <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Next-Gen Compliance
              </span>
            </span>
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
          Sleek, secure, and intelligent platform for automated audits, real-time analytics, 
          and comprehensive compliance monitoring across your entire organization.
        </motion.p>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            "🤖 AI-Driven Analytics",
            "🔒 Enterprise Security",
            "📊 Real-time Monitoring",
            "⚡ Automated Workflows",
            "🎯 Risk Assessment",
            "📈 Performance Insights"
          ].map((feature, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              {feature}
            </span>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            Start Free Trial
          </button>
          <button className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 font-semibold rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            Watch Demo
          </button>
        </motion.div>
      </motion.div>

      {/* Enhanced Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 px-4 relative z-10">
        {[
          { number: "99.9%", label: "Uptime Guarantee", icon: "⚡" },
          { number: "85%", label: "Risk Reduction", icon: "🛡️" },
          { number: "500+", label: "Enterprise Clients", icon: "🏢" },
          { number: "24/7", label: "Support Available", icon: "🕒" }
        ].map((stat, index) => (
          <div key={index} className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {stat.number}
            </div>
            <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Lid */}
       <Lid
        src={src}
        scaleX={scaleX}
        scaleY={scaleY}
        rotate={rotate}
        translate={translate}
        lidOpacity={lidOpacity}
        scrollYProgress={scrollYProgress} // Pass scrollYProgress here
      />
      
      {/* Enhanced Base area */}
      <div className="relative -z-10 h-[22rem] w-[32rem] overflow-hidden rounded-2xl bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200 scale-75 md:scale-100 shadow-2xl">
        {/* above keyboard bar */}
        <div className="relative h-10 w-full">
          <div className="absolute inset-x-0 mx-auto h-4 w-[80%] bg-gradient-to-b from-gray-700 to-gray-900 rounded-b-sm" />
        </div>
        <div className="relative flex">
          <div className="mx-auto h-full w-[10%] overflow-hidden">
            <SpeakerGrid />
          </div>
          <div className="mx-auto h-full w-[80%]">
            <Keypad />
          </div>
          <div className="mx-auto h-full w-[10%] overflow-hidden">
            <SpeakerGrid />
          </div>
        </div>
        <Trackpad />
        <div className="absolute inset-x-0 bottom-0 mx-auto h-2 w-20 rounded-tl-3xl rounded-tr-3xl bg-gradient-to-t from-gray-300 via-gray-600 to-gray-900" />
        {showGradient && (
          <div className="absolute inset-x-0 bottom-0 z-50 h-40 w-full bg-gradient-to-t from-white via-white to-transparent"></div>
        )}
        {badge && <div className="absolute bottom-4 left-4">{badge}</div>}
      </div>

      {/* Enhanced Features Preview */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="mt-20 max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Comprehensive Compliance Suite
          </h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            From automated risk assessment to real-time monitoring, Auditryx provides everything you need for modern compliance management.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Automated Auditing",
              description: "AI-powered audit trails with intelligent risk detection and automated compliance reporting.",
              icon: "🔍",
              color: "from-blue-500 to-cyan-500"
            },
            {
              title: "Real-time Analytics",
              description: "Live dashboards with predictive insights and customizable compliance metrics tracking.",
              icon: "📈",
              color: "from-purple-500 to-pink-500"
            },
            {
              title: "Secure Infrastructure",
              description: "Enterprise-grade security with SOC2 compliance and end-to-end encryption.",
              icon: "🔐",
              color: "from-green-500 to-emerald-500"
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-shadow">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-2xl mb-4`}>
                {feature.icon}
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h4>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export const Lid = ({
  scaleX,
  scaleY,
  rotate,
  translate,
  src,
  lidOpacity,
  scrollYProgress
}) => {
  const enhancedDashboardSrc =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNTAwJyBoZWlnaHQ9JzMwMCcgdmlld0JveD0nMCAwIDUwMCAzMDAnIGZpbGw9J25vbmUnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzUwMCcgaGVpZ2h0PSczMDAnIGZpbGw9JyNmOGY5ZmEnLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9J2dyYWQnIHgxPScwJScgeTE9JzAlJyB4Mj0nMTAwJScgeTI9JzEwMCUnPjxzdG9wIG9mZnNldD0nMCUnIHN0eWxlPSdzdG9wLWNvbG9yOiMzMzM0ZmY7c3RvcC1vcGFjaXR5OjEnIC8+PHN0b3Agb2Zmc2V0PSc1MCUnIHN0eWxlPSdzdG9wLWNvbG9yOiM4MzM0ZmY7c3RvcC1vcGFjaXR5OjEnIC8+PHN0b3Agb2Zmc2V0PScxMDAlJyBzdHlsZT0nc3RvcC1jb2xvcjojNjM2NmYxO3N0b3Atb3BhY2l0eToxJyAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9JzIwJyB5PScyMCcgd2lkdGg9JzQ2MCcgaGVpZ2h0PScyNjAnIGZpbGw9J3VybCgjZ3JhZCknIHJ4PSIxNSIvPjwhLS0gRGFzaGJvYXJkIEVsZW1lbnRzIC0tPjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjQyMCIgaGVpZ2h0PSI0MCIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuMSIgcng9IjgiLz48dGV4dCB4PSI1MCIgeT0iNjIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIj5BdWRpdHJ5eCBDb21wbGlhbmNlIERhc2hib2FyZDwvdGV4dD48IS0tIENoYXJ0IEFyZWEgLS0+PHJlY3QgeD0iNDAiIHk9IjEwMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjEiIHJ4PSI4Ii8+PHN2ZyB4PSI1MCIgeT0iMTEwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjEwMCI+PHBvbHlsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgcG9pbnRzPSIwLDgwIDMwLDYwIDYwLDQwIDkwLDIwIDEyMCwzMCAxNTAsMTAgMTgwLDIwIi8+PC9zdmc+PCEtLSBTdGF0cyBDYXJkcyAtLT48cmVjdCB4PSIyNjAiIHk9IjEwMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjUwIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4xNSIgcng9IjYiLz48cmVjdCB4PSIzMzAiIHk9IjEwMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjUwIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4xNSIgcng9IjYiLz48cmVjdCB4PSI0MDAiIHk9IjEwMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjUwIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4xNSIgcng9IjYiLz48cmVjdCB4PSIyNzAiIHk9IjExMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4yIiByeD0iNCIvPjx0ZXh0IHg9IjI5MCIgeT0iMTMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+OTklPC90ZXh0Pjx0ZXh0IHg9IjM2MCIgeT0iMTMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+NzglPC90ZXh0Pjx0ZXh0IHg9IjQzMCIgeT0iMTMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+NDI8L3RleHQ+PCEtLSBQcm9ncmVzcyBCYXJzIC0tPjxyZWN0IHg9IjQwIiB5PSIyNDAiIHdpZHRoPSI0MjAiIGhlaWdodD0iMjAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjEiIHJ4PSIxMCIvPjxyZWN0IHg9IjQwIiB5PSIyNDAiIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAiIGZpbGw9IiM0ZGZmZGYiIG9wYWNpdHk9IjAuOCIgcng9IjEwIi8+PHRleHQgeD0iMjUwIiB5PSIxODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyOCIgaG9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BdWRpdHJ5eDwvdGV4dD48dGV4dCB4PSIyNTAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgb3BhY2l0eT0iMC45Ij5BSS1Qb3dlcmVkIENvbXBsaWFuY2UgUGxhdGZvcm08L3RleHQ+PC9zdmc+";

  const logoOpacity = useTransform(scrollYProgress, [0.45, 0.6], [0, 1]);
  const screenTranslateY = useTransform(scrollYProgress, [0.3, 0.6], [0, 700]);
  const screenOpacity = useTransform(scrollYProgress, [0.3, 0.59], [1, 1]);
  return (
    <div className="relative [perspective:800px]">
      {/* Animated laptop screen (detaches and moves down on scroll, returns on scroll up) */}
      <motion.div
        style={{
          scaleX: scaleX,
          scaleY: scaleY,
          rotateX: rotate,
          translateY: translate,
          y: screenTranslateY,
          opacity: screenOpacity,
          zIndex: 10,
          transformStyle: "preserve-3d",
          transformOrigin: "top",
        }}
        className="absolute inset-0 h-96 w-[32rem] rounded-2xl bg-gradient-to-b from-gray-700 to-gray-900 p-2 border border-gray-500 scale-75 md:scale-100 shadow-2xl"
      >
        <div className="absolute inset-0 rounded-lg bg-gray-900" />
        <img
          src={src || enhancedDashboardSrc}
          alt="Auditryx AI Compliance Dashboard"
          className="absolute inset-0 h-full w-full rounded-lg object-cover object-left-top" />
      </motion.div>

      {/* Logo that appears on scroll (revealed as screen moves out) */}
      <motion.div
        style={{
          opacity: logoOpacity,
        }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
      >
        <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
          <span className="text-5xl font-bold text-white">A</span>
        </div>
        <div className="text-center mt-4">
          <div className="text-white font-bold text-2xl">Auditryx</div>
          <div className="text-gray-300 text-lg">AI Compliance Platform</div>
        </div>
      </motion.div>

      {/* Closed laptop lid (remains as before) */}
      <motion.div
        style={{
          opacity: useTransform(lidOpacity, [1, 0], [0, 1]),
          transform: "perspective(800px) rotateX(-25deg) translateZ(0px)",
          transformOrigin: "bottom",
          transformStyle: "preserve-3d",
        }}
        className="relative h-[12rem] w-[32rem] rounded-2xl bg-gradient-to-b from-gray-700 to-gray-900 p-2 border border-gray-500 scale-75 md:scale-100 shadow-2xl">
        <div
          style={{
            boxShadow: "0px 4px 0px 2px #374151 inset, 0 0 20px rgba(0,0,0,0.3)",
          }}
          className="absolute inset-0 flex items-center justify-center rounded-lg bg-gradient-to-b from-gray-800 to-gray-900">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">A</span>
            </div>
            <div className="text-center">
              <div className="text-white font-bold text-lg">Auditryx</div>
              <div className="text-gray-300 text-xs">AI Compliance Platform</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const Trackpad = () => {
  return (
    <div
      className="mx-auto my-1 h-32 w-[40%] rounded-xl bg-gradient-to-b from-gray-100 to-gray-200"
      style={{
        boxShadow: "0px 0px 3px 1px #d1d5db inset, 0 2px 4px rgba(0,0,0,0.1)",
      }}></div>
  );
};

export const Keypad = () => {
  return (
    <div className="mx-1 h-full [transform:translateZ(0)] rounded-md bg-gradient-to-b from-gray-800 to-gray-900 p-1 [will-change:transform] shadow-inner">
      {/* First Row */}
      <div className="mb-[2px] flex w-full shrink-0 gap-[2px]">
        <KBtn
          className="w-10 items-end justify-start pb-[2px] pl-[4px]"
          childrenClassName="items-start">
          esc
        </KBtn>
        <KBtn>
          <IconBrightnessDown className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F1</span>
        </KBtn>
        <KBtn>
          <IconBrightnessUp className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F2</span>
        </KBtn>
        <KBtn>
          <IconTable className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F3</span>
        </KBtn>
        <KBtn>
          <IconSearch className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F4</span>
        </KBtn>
        <KBtn>
          <IconMicrophone className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F5</span>
        </KBtn>
        <KBtn>
          <IconMoon className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F6</span>
        </KBtn>
        <KBtn>
          <IconPlayerTrackPrev className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F7</span>
        </KBtn>
        <KBtn>
          <IconPlayerSkipForward className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F8</span>
        </KBtn>
        <KBtn>
          <IconPlayerTrackNext className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F9</span>
        </KBtn>
        <KBtn>
          <IconVolume3 className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F10</span>
        </KBtn>
        <KBtn>
          <IconVolume2 className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F11</span>
        </KBtn>
        <KBtn>
          <IconVolume className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F12</span>
        </KBtn>
        <KBtn>
          <div className="h-4 w-4 rounded-full bg-gradient-to-b from-gray-500 from-20% via-gray-700 via-50% to-gray-500 to-95% p-px">
            <div className="h-full w-full rounded-full bg-gray-800" />
          </div>
        </KBtn>
      </div>
      {/* Second row */}
      <div className="mb-[2px] flex w-full shrink-0 gap-[2px]">
        <KBtn>
          <span className="block">~</span>
          <span className="mt-1 block">`</span>
        </KBtn>
        <KBtn>
          <span className="block">!</span>
          <span className="block">1</span>
        </KBtn>
        <KBtn>
          <span className="block">@</span>
          <span className="block">2</span>
        </KBtn>
        <KBtn>
          <span className="block">#</span>
          <span className="block">3</span>
        </KBtn>
        <KBtn>
          <span className="block">$</span>
          <span className="block">4</span>
        </KBtn>
        <KBtn>
          <span className="block">%</span>
          <span className="block">5</span>
        </KBtn>
        <KBtn>
          <span className="block">^</span>
          <span className="block">6</span>
        </KBtn>
        <KBtn>
          <span className="block">&</span>
          <span className="block">7</span>
        </KBtn>
        <KBtn>
          <span className="block">*</span>
          <span className="block">8</span>
        </KBtn>
        <KBtn>
          <span className="block">(</span>
          <span className="block">9</span>
        </KBtn>
        <KBtn>
          <span className="block">)</span>
          <span className="block">0</span>
        </KBtn>
        <KBtn>
          <span className="block">—</span>
          <span className="block">_</span>
        </KBtn>
        <KBtn>
          <span className="block">+</span>
          <span className="block"> = </span>
        </KBtn>
        <KBtn
          className="w-10 items-end justify-end pr-[4px] pb-[2px]"
          childrenClassName="items-end">
          delete
        </KBtn>
      </div>
      {/* Third row */}
      <div className="mb-[2px] flex w-full shrink-0 gap-[2px]">
        <KBtn
          className="w-10 items-end justify-start pb-[2px] pl-[4px]"
          childrenClassName="items-start">
          tab
        </KBtn>
        <KBtn>
          <span className="block">Q</span>
        </KBtn>
        <KBtn>
          <span className="block">W</span>
        </KBtn>
        <KBtn>
          <span className="block">E</span>
        </KBtn>
        <KBtn>
          <span className="block">R</span>
        </KBtn>
        <KBtn>
          <span className="block">T</span>
        </KBtn>
        <KBtn>
          <span className="block">Y</span>
        </KBtn>
        <KBtn>
          <span className="block">U</span>
        </KBtn>
        <KBtn>
          <span className="block">I</span>
        </KBtn>
        <KBtn>
          <span className="block">O</span>
        </KBtn>
        <KBtn>
          <span className="block">P</span>
        </KBtn>
        <KBtn>
          <span className="block">{`{`}</span>
          <span className="block">{`[`}</span>
        </KBtn>
        <KBtn>
          <span className="block">{`}`}</span>
          <span className="block">{`]`}</span>
        </KBtn>
        <KBtn>
          <span className="block">{`|`}</span>
          <span className="block">{`\\`}</span>
        </KBtn>
      </div>
      {/* Fourth Row */}
      <div className="mb-[2px] flex w-full shrink-0 gap-[2px]">
        <KBtn
          className="w-[2.8rem] items-end justify-start pb-[2px] pl-[4px]"
          childrenClassName="items-start">
          caps lock
        </KBtn>
        <KBtn>
          <span className="block">A</span>
        </KBtn>
        <KBtn>
          <span className="block">S</span>
        </KBtn>
        <KBtn>
          <span className="block">D</span>
        </KBtn>
        <KBtn>
          <span className="block">F</span>
        </KBtn>
        <KBtn>
          <span className="block">G</span>
        </KBtn>
        <KBtn>
          <span className="block">H</span>
        </KBtn>
        <KBtn>
          <span className="block">J</span>
        </KBtn>
        <KBtn>
          <span className="block">K</span>
        </KBtn>
        <KBtn>
          <span className="block">L</span>
        </KBtn>
        <KBtn>
          <span className="block">{`:`}</span>
          <span className="block">{`;`}</span>
        </KBtn>
        <KBtn>
          <span className="block">{`"`}</span>
          <span className="block">{`'`}</span>
        </KBtn>
        <KBtn
          className="w-[2.85rem] items-end justify-end pr-[4px] pb-[2px]"
          childrenClassName="items-end">
          return
        </KBtn>
      </div>
      {/* Fifth Row */}
      <div className="mb-[2px] flex w-full shrink-0 gap-[2px]">
        <KBtn
          className="w-[3.65rem] items-end justify-start pb-[2px] pl-[4px]"
          childrenClassName="items-start">
          shift
        </KBtn>
        <KBtn>
          <span className="block">Z</span>
        </KBtn>
        <KBtn>
          <span className="block">X</span>
        </KBtn>
        <KBtn>
          <span className="block">C</span>
        </KBtn>
        <KBtn>
          <span className="block">V</span>
        </KBtn>
        <KBtn>
          <span className="block">B</span>
        </KBtn>
        <KBtn>
          <span className="block">N</span>
        </KBtn>
        <KBtn>
          <span className="block">M</span>
        </KBtn>
        <KBtn>
          <span className="block">{`<`}</span>
          <span className="block">{`,`}</span>
        </KBtn>
        <KBtn>
          <span className="block">{`>`}</span>
          <span className="block">{`.`}</span>
        </KBtn>
        <KBtn>
          <span className="block">{`?`}</span>
          <span className="block">{`/`}</span>
        </KBtn>
        <KBtn
          className="w-[3.65rem] items-end justify-end pr-[4px] pb-[2px]"
          childrenClassName="items-end">
          shift
        </KBtn>
      </div>
      {/* sixth Row */}
      <div className="mb-[2px] flex w-full shrink-0 gap-[2px]">
        <KBtn className="" childrenClassName="h-full justify-between py-[4px]">
          <div className="flex w-full justify-end pr-1">
            <span className="block">fn</span>
          </div>
          <div className="flex w-full justify-start pl-1">
            <IconWorld className="h-[6px] w-[6px]" />
          </div>
        </KBtn>
        <KBtn className="" childrenClassName="h-full justify-between py-[4px]">
          <div className="flex w-full justify-end pr-1">
            <IconChevronUp className="h-[6px] w-[6px]" />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">control</span>
          </div>
        </KBtn>
        <KBtn className="" childrenClassName="h-full justify-between py-[4px]">
          <div className="flex w-full justify-end pr-1">
            <OptionKey className="h-[6px] w-[6px]" />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">option</span>
          </div>
        </KBtn>
        <KBtn className="w-8" childrenClassName="h-full justify-between py-[4px]">
          <div className="flex w-full justify-end pr-1">
            <IconCommand className="h-[6px] w-[6px]" />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">command</span>
          </div>
        </KBtn>
        <KBtn className="w-[8.2rem]"></KBtn>
        <KBtn className="w-8" childrenClassName="h-full justify-between py-[4px]">
          <div className="flex w-full justify-start pl-1">
            <IconCommand className="h-[6px] w-[6px]" />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">command</span>
          </div>
        </KBtn>
        <KBtn className="" childrenClassName="h-full justify-between py-[4px]">
          <div className="flex w-full justify-start pl-1">
            <OptionKey className="h-[6px] w-[6px]" />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">option</span>
          </div>
        </KBtn>
        <div
          className="mt-[2px] flex h-6 w-[4.9rem] flex-col items-center justify-end rounded-[4px] p-[0.5px]">
          <KBtn className="h-3 w-6">
            <IconCaretUpFilled className="h-[6px] w-[6px]" />
          </KBtn>
          <div className="flex">
            <KBtn className="h-3 w-6">
              <IconCaretLeftFilled className="h-[6px] w-[6px]" />
            </KBtn>
            <KBtn className="h-3 w-6">
              <IconCaretDownFilled className="h-[6px] w-[6px]" />
            </KBtn>
            <KBtn className="h-3 w-6">
              <IconCaretRightFilled className="h-[6px] w-[6px]" />
            </KBtn>
          </div>
        </div>
      </div>
    </div>
  );
};

export const KBtn = ({
  className,
  children,
  childrenClassName,
  backlit = true
}) => {
  return (
    <div
      className={cn(
        "[transform:translateZ(0)] rounded-[4px] p-[0.5px] [will-change:transform]",
        backlit && "bg-white/[0.2] shadow-xl shadow-white"
      )}>
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-[3.5px] bg-[#0A090D]",
          className
        )}
        style={{
          boxShadow:
            "0px -0.5px 2px 0 #0D0D0F inset, -0.5px 0px 2px 0 #0D0D0F inset",
        }}>
        <div
          className={cn(
            "flex w-full flex-col items-center justify-center text-[5px] text-neutral-200",
            childrenClassName,
            backlit && "text-white"
          )}>
          {children}
        </div>
      </div>
    </div>
  );
};

export const SpeakerGrid = () => {
  return (
    <div
      className="mt-2 flex h-40 gap-[2px] px-[0.5px]"
      style={{
        backgroundImage:
          "radial-gradient(circle, #08080A 0.5px, transparent 0.5px)",
        backgroundSize: "3px 3px",
      }}></div>
  );
};

export const OptionKey = ({
  className
}) => {
  return (
    <svg
      fill="none"
      version="1.1"
      id="icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={className}>
      <rect stroke="currentColor" strokeWidth={2} x="18" y="5" width="10" height="2" />
      <polygon
        stroke="currentColor"
        strokeWidth={2}
        points="10.6,5 4,5 4,7 9.4,7 18.4,27 28,27 28,25 19.6,25 " />
      <rect
        id="_Transparent_Rectangle_"
        className="st0"
        width="32"
        height="32"
        stroke="none" />
    </svg>
  );
};

