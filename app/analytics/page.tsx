"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, LineChart, BarChart, Target, ArrowUpRight, Bell } from 'lucide-react';
import Link from "next/link";

function AnalyticsPage() {
  // Tool data
  const analyticsTools = [
    {
      icon: <LineChart className="w-12 h-12 text-blue-500/80" />,
      title: "Savings Tracker",
      description: "Monitor your savings growth and patterns over time",
      features: ["Visual progress charts", "Goal tracking", "Monthly comparisons"],
      gradient: "from-blue-500/20 via-transparent to-transparent",
      href: "/banking/savings-tracker"
    },
    {
      icon: <LineChart className="w-12 h-12 text-red-500/80" />,
      title: "Expense Tracker",
      description: "Monitor your spending habits and identify areas for improvement",
      features: ["Categorized spending", "Budgeting tools", "Visual representations"],
      gradient: "from-red-500/20 via-transparent to-transparent",
      href: "/banking/expense-tracker"
    },
    {
      icon: <BarChart className="w-12 h-12 text-emerald-500/80" />,
      title: "Income Insights",
      description: "Track all your income sources and growth",
      features: ["Income breakdown", "Growth metrics", "Future projections"],
      gradient: "from-emerald-500/20 via-transparent to-transparent",
      href: "/banking/income-insights"
    }
  ];

  // Feature data
  const features = [
    {
      icon: <Target className="h-6 w-6 text-blue-400" />,
      title: "Goal Setting",
      description: "Set and track your financial goals with detailed milestones",
      gradient: "from-blue-500/20 via-transparent to-transparent"
    },
    {
      icon: <ArrowUpRight className="h-6 w-6 text-purple-400" />,
      title: "Growth Predictions",
      description: "AI-powered predictions for your financial growth",
      gradient: "from-purple-500/20 via-transparent to-transparent"
    },
    {
      icon: <Bell className="h-6 w-6 text-emerald-400" />,
      title: "Smart Alerts",
      description: "Get notified about important financial events and milestones",
      gradient: "from-emerald-500/20 via-transparent to-transparent"
    }
  ];

  // Render tool cards
  const renderToolCards = () => {
    return analyticsTools.map((tool, index) => (
      <Card key={index} className="group bg-gray-900/50 border-gray-800 hover:border-gray-700">
        <CardHeader>
          <div className={`p-4 rounded-lg bg-gradient-to-r ${tool.gradient} group-hover:scale-110 transition-transform duration-300`}>
            {tool.icon}
          </div>
          <CardTitle className="text-white text-2xl">{tool.title}</CardTitle>
          <CardDescription className="text-gray-400">{tool.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 mb-4">
            {tool.features.map((feature, i) => (
              <li key={i} className="text-gray-400 flex items-center">
                <ArrowRight className="h-4 w-4 mr-2 text-blue-400" />
                {feature}
              </li>
            ))}
          </ul>
          <Link href={tool.href}>
            <Button className="w-full bg-blue-500 hover:bg-blue-600">
              Access Tool
            </Button>
          </Link>
        </CardContent>
      </Card>
    ));
  };

  // Render feature items
  const renderFeatures = () => {
    return features.map((feature, index) => (
      <div key={index} className="flex items-start space-x-4 group">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.gradient} group-hover:scale-110 transition-transform duration-300`}>
          {feature.icon}
        </div>
        <div>
          <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
          <p className="text-gray-400 text-sm">{feature.description}</p>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900 to-black"></div>

      {/* Hero Section */}
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text leading-[1.3] py-2">
              Growth Analytics
            </h1>
            <p className="text-gray-400 text-lg md:text-xl mb-8">
              Track, analyze, and optimize your financial journey with powerful analytics tools
            </p>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90">
              View Your Analytics <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Tools */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {renderToolCards()}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <Card className="bg-gray-900/50 border-gray-800 p-8">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Powerful Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {renderFeatures()}
            </div>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="relative p-8 md:p-12 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-gray-800 rounded-2xl"></div>
            <div className="relative text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Ready to Track Your Growth?
              </h2>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                Start monitoring your financial progress and make data-driven decisions.
              </p>
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;