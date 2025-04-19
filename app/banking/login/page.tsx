"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { WavyBackground } from "@/components/ui/wavy-background"; // Assuming you'll place the component in this location

interface LoginData {
  phone: string;
  aadhaarNumber: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState<LoginData>({
    phone: "",
    aadhaarNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        phone: loginData.phone,
        aadhaarNumber: loginData.aadhaarNumber,
        redirect: false,
        callbackUrl: '/banking/dashboard'
      });

      console.log("Login result:", result);

      if (result?.ok) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
          variant: "default"
        });
        router.push("/banking/dashboard");
      } else {
        throw new Error(result?.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [id === 'aadhaar' ? 'aadhaarNumber' : id]: value
    }));
  };

  return (
    <WavyBackground 
      colors={["#8B5CF6", "#7C3AED", "#6D28D9", "#5B21B6", "#4C1D95"]} 
      waveWidth={100}
      backgroundFill="#0a0010"
      blur={10}
      speed="slow"
      waveOpacity={0.5}
      className="w-full"
      containerClassName="w-full"
    >
      <div className="w-full max-w-md relative mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Card className="bg-[#13051f]/70 border-purple-900/50 backdrop-blur-md shadow-[0_0_30px_rgba(139,92,246,0.25)]">
            <CardHeader>
              <CardTitle className="text-2xl text-white font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-indigo-200">Welcome Back</CardTitle>
              <CardDescription className="text-purple-300/70">Login to access your rural banking services</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <motion.div 
                    className="space-y-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    <Label htmlFor="phone" className="text-purple-200 font-medium">Phone Number</Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        placeholder="10-digit phone number"
                        value={loginData.phone}
                        onChange={handleInputChange}
                        pattern="[0-9]{10}"
                        required
                        className="bg-[#1c0732]/70 border-purple-800/50 text-white placeholder:text-purple-300/30 pl-10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                        minLength={10}
                        maxLength={10}
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 3H9C7.89543 3 7 3.89543 7 5V19C7 20.1046 7.89543 21 9 21H15C16.1046 21 17 20.1046 17 19V5C17 3.89543 16.1046 3 15 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    <Label htmlFor="aadhaar" className="text-purple-200 font-medium">Aadhaar Number</Label>
                    <div className="relative">
                      <Input
                        id="aadhaar"
                        type="password"
                        placeholder="12-digit Aadhaar number"
                        value={loginData.aadhaarNumber}
                        onChange={handleInputChange}
                        pattern="[0-9]{12}"
                        required
                        className="bg-[#1c0732]/70 border-purple-800/50 text-white placeholder:text-purple-300/30 pl-10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                        minLength={12}
                        maxLength={12}
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M4.93 19.07C6.83018 16.9627 9.37359 15.7906 12.05 15.7906C14.7264 15.7906 17.2698 16.9627 19.17 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl text-white font-medium shadow-lg shadow-purple-900/30 border border-purple-500/20"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Logging in...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>Login</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    )}
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-center text-sm text-purple-300/60 mt-4">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => router.push("/register")}
                      className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                    >
                      Register here
                    </button>
                  </p>
                </motion.div>
                
                {/* Security Badge */}
                <motion.div 
                  className="flex items-center justify-center mt-4 text-xs text-purple-300/40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                    <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Secure, encrypted connection</span>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </WavyBackground>
  );
}