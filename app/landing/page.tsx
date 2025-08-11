"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Play,
  Shield,
  Zap,
  Globe,
  Users,
  Award,
  ChevronDown,
} from "lucide-react";
import ScooterModel3D from "@/components/landing/scooter-model-3d";
import { LoginModal } from "@/components/landing/login-modal";
import { motion, useScroll, useTransform } from "framer-motion";

export default function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Experience unparalleled speed with our advanced electric motor technology",
    },
    {
      icon: Shield,
      title: "Ultra Safe",
      description:
        "Advanced safety systems and real-time monitoring for complete peace of mind",
    },
    {
      icon: Globe,
      title: "Global Network",
      description:
        "Access thousands of charging stations worldwide with our integrated network",
    },
    {
      icon: Users,
      title: "Smart Community",
      description:
        "Join millions of riders in the most advanced mobility ecosystem",
    },
  ];

  const stats = [
    { value: "50K+", label: "Active Riders" },
    { value: "99.9%", label: "Uptime" },
    { value: "200+", label: "Cities" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                SL-Mobility
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#technology"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Technology
              </a>
              <a
                href="#about"
                className="text-gray-300 hover:text-white transition-colors"
              >
                About
              </a>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white hover:text-black bg-transparent"
                onClick={() => setIsLoginOpen(true)}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-cyan-900/20" />
          <motion.div
            style={{ y: y1 }}
            className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"
          />
          <motion.div
            style={{ y: y2 }}
            className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          />
        </div>

        {/* <div className="relative z-10 h-screen grid lg:grid-cols-2"> */}
        {/* Left Section */}
        <div className="flex items-center justify-center px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 max-w-xl"
          >
            <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30">
              <Award className="w-4 h-4 mr-2" />
              Industry Leading Technology
            </Badge>

            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  The Future of
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Urban Mobility
                </span>
              </h1>

              <p className="text-xl text-gray-300 leading-relaxed">
                Experience the next generation of electric mobility with our
                revolutionary scooter technology. Designed for the modern world,
                built for tomorrow.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-6 text-lg"
                onClick={() => setIsLoginOpen(true)}
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white hover:text-black px-8 py-6 text-lg bg-transparent"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Section */}
        {/* <div className="flex items-center justify-center px-3 lg:px-6">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-lg h-[550px] lg:h-[550px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-3xl blur-3xl" />
              <Card className="relative h-full bg-gradient-to-br from-gray-900/50 to-black/50 border-white/10 backdrop-blur-sm">
                <CardContent className="p-0 h-full">
                  <ScooterModel3D />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div> */}

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="flex flex-col items-center space-y-2 text-gray-400">
            <span className="text-sm">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Engineered for
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Excellence
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Every component is meticulously crafted to deliver an unparalleled
              riding experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="h-full bg-gradient-to-br from-gray-900/50 to-black/50 border-white/10 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/10 via-black to-blue-900/10" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-8">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Advanced Analytics
                </span>
                <br />
                <span className="text-white">Dashboard</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Monitor your fleet in real-time with our comprehensive analytics
                platform. Track performance, optimize routes, and maximize
                efficiency with AI-powered insights.
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                onClick={() => setIsLoginOpen(true)}
              >
                Access Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-3xl" />
              <Card className="relative bg-gradient-to-br from-gray-900/80 to-black/80 border-white/10 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Fleet Status</span>
                      <Badge className="bg-green-500/20 text-green-400">
                        Online
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white">Active Vehicles</span>
                        <span className="text-cyan-400 font-bold">1,247</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white">Battery Health</span>
                        <span className="text-green-400 font-bold">98.5%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white">Total Distance</span>
                        <span className="text-blue-400 font-bold">2.4M km</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 via-black to-blue-900/20" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl lg:text-6xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ready to Transform
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Your Journey?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join thousands of riders who have already embraced the future of
              urban mobility
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-12 py-6 text-lg"
              onClick={() => setIsLoginOpen(true)}
            >
              Start Your Journey
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                SL-Mobility
              </span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 SL-Mobility. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
