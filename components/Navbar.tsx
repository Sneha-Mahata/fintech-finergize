"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
// Remove next-auth import temporarily until installed
// import { useSession, signOut } from "next-auth/react";

const navItems = [
  {
    path: "/",
    label: "Home",
  },
  {
    path: "/banking",
    label: "Banking",
  },
  {
    path: "/savings",
    label: "Savings",
  },
  {
    path: "/loans",
    label: "Loans",
  },
  {
    path: "/security",
    label: "Security",
  },
  {
    path: "/analytics",
    label: "Analytics",
  },
  {
    path: "/education",
    label: "Education",
  },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  // Temporary mock session until next-auth is installed
  const mockSession = {
    data: null,
    status: "unauthenticated"
  };
  const { data: session, status } = mockSession;

  const handleLogout = async () => {
    try {
      // Mock signOut until next-auth is installed
      // await signOut({ redirect: false });
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
        // Fix: Remove the variant property as it doesn't exist in Toast type
      });
      
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "Logout Failed",
        description: "An error occurred during logout",
        // Fix: Use className instead of variant for styling
        className: "bg-red-500",
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              Finergize
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="px-3 py-2 text-gray-300 hover:text-white rounded-md text-sm transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons or Profile Menu - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {status === "authenticated" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="rounded-full w-10 h-10 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20"
                  >
                    <User className="h-5 w-5 text-blue-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-800">
                  <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-gray-800">
                    <Link href="/profile" className="w-full">{session?.user?.name || 'My Profile'}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-gray-300 focus:text-white focus:bg-gray-800 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/banking/login">
                  <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                    Login
                  </Button>
                </Link>
                <Link href="/banking/register">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="outline"
              size="icon"
              className="border-gray-800"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-400" />
              ) : (
                <Menu className="h-6 w-6 text-gray-400" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="px-3 py-2 text-gray-300 hover:text-white rounded-md text-sm transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 flex flex-col space-y-2">
                {status === "authenticated" ? (
                  <>
                    <Link href="banking/profile">
                      <Button 
                        variant="outline" 
                        className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                      >
                        {session?.user?.name || 'My Profile'}
                      </Button>
                    </Link>
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button 
                        variant="outline" 
                        className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
                      >
                        Register
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}