"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, Check, Lock } from 'lucide-react';
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-collision";

// Animation variants
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const inputVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  }
};

const formGroupVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface FormData {
  name: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
  aadhaarNumber: string;
  preferredLanguage: string;
}

const InputField = ({ label, id, ...props }: { label: string; id: string; [key: string]: any }) => (
  <motion.div 
    variants={inputVariants}
    className="space-y-2"
  >
    <Label htmlFor={id} className="text-gray-300">{label}</Label>
    <div className="relative group">
      <Input
        id={id}
        className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 h-11 transition-all duration-300"
        {...props}
      />
      <div className="absolute inset-x-0 h-px bottom-0 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
    </div>
  </motion.div>
);

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    village: "",
    district: "",
    state: "",
    pincode: "",
    aadhaarNumber: "",
    preferredLanguage: "hindi"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const registerResponse = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerData.message || "Registration failed");
      }

      const signInResult = await signIn('credentials', {
        phone: formData.phone,
        aadhaarNumber: formData.aadhaarNumber,
        redirect: false,
      });

      if (signInResult?.ok) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created and you're now logged in!"
        });
        router.push("/banking/dashboard");
      } else {
        toast({
          title: "Registration Successful",
          description: "Please log in with your credentials"
        });
        router.push("/login");
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (value: string) => {
    setFormData(prev => ({ ...prev, preferredLanguage: value }));
  };

  const validateInput = (field: keyof FormData, value: string) => {
    switch (field) {
      case 'phone':
        return value.match(/^[0-9]{10}$/) ? true : 'Phone number must be 10 digits';
      case 'aadhaarNumber':
        return value.match(/^[0-9]{12}$/) ? true : 'Aadhaar number must be 12 digits';
      case 'pincode':
        return value.match(/^[0-9]{6}$/) ? true : 'PIN code must be 6 digits';
      default:
        return true;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const validationResult = validateInput(id as keyof FormData, value);

    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    if (validationResult !== true) {
      toast({
        title: "Invalid Input",
        description: validationResult,
        variant: "destructive"
      });
    }
  };

  return (
    <BackgroundBeamsWithCollision className="min-h-screen bg-black dark:from-purple-950 dark:to-gray-900">
      <main className="pt-24 pb-12">
        <div className="container max-w-2xl mx-auto px-4">
         

          <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10"
          >
            <Card className="bg-gray-900/60 border-gray-800/50 backdrop-blur-md overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
              
              <CardHeader className="relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  Create Your Account
                  <motion.span
                    animate={{ rotate: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ✨
                  </motion.span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Join our community of rural digital banking
                </CardDescription>
              </CardHeader>

              <CardContent className="relative">
                <form onSubmit={handleSubmit}>
                  <motion.div 
                    variants={formGroupVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                  >
                    <InputField
                      label="Full Name"
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />

                    <InputField
                      label="Phone Number"
                      id="phone"
                      placeholder="10-digit phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      pattern="[0-9]{10}"
                      required
                      minLength={10}
                      maxLength={10}
                    />

                    <InputField
                      label="City"
                      id="village"
                      placeholder="Your  city name"
                      value={formData.village}
                      onChange={handleInputChange}
                      required
                    />

                    <InputField
                      label="District"
                      id="district"
                      placeholder="Your district"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                    />

                    <InputField
                      label="State"
                      id="state"
                      placeholder="Your state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />

                    <InputField
                      label="PIN Code"
                      id="pincode"
                      placeholder="6-digit PIN code"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      pattern="[0-9]{6}"
                      required
                      minLength={6}
                      maxLength={6}
                    />

                    <div className="relative group">
                      <InputField
                        label="Aadhaar Number"
                        id="aadhaar"
                        type="password"
                        placeholder="12-digit Aadhaar number"
                        value={formData.aadhaarNumber}
                        onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                        pattern="[0-9]{12}"
                        required
                        minLength={12}
                        maxLength={12}
                      />
                      <Lock className="absolute right-3 top-[38px] h-4 w-4 text-gray-500" />
                    </div>

                    <motion.div variants={inputVariants} className="space-y-2">
                      <Label htmlFor="language" className="text-gray-300">Preferred Language</Label>
                      <Select value={formData.preferredLanguage} onValueChange={handleLanguageChange}>
                        <SelectTrigger 
                          id="language"
                          className="bg-gray-900/50 border-gray-700 text-white h-11 focus:ring-purple-500/20"
                        >
                          <Languages className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-800">
                          <SelectItem value="hindi">Hindi</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="tamil">Tamil</SelectItem>
                          <SelectItem value="telugu">Telugu</SelectItem>
                          <SelectItem value="kannada">Kannada</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-6"
                  >
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="mr-2"
                          >
                            <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </motion.div>
                          Creating Account...
                        </div>
                      ) : (
                        <span className="flex items-center justify-center">
                          Create Account
                          <Check className="ml-2 h-5 w-5" />
                        </span>
                      )}
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-gray-400">
                      Already have an account?{" "}
                        <motion.button
                          type="button"
                          onClick={() => router.push("/login")}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Login here
                        </motion.button>
                      </p>
                    </div>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional visual elements for loading state */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed bottom-8 right-8 z-50"
              >
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity
                      }}
                    >
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                    </motion.div>
                    <p className="text-sm text-purple-400">
                      Processing your registration...
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </BackgroundBeamsWithCollision>
  );
}