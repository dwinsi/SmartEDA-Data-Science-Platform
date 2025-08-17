import { Button } from "./ui/button";
import { Search, Database } from "lucide-react";

export function Header() {
  const navItems = ["Home", "Upload Data", "EDA Report", "ML Models", "About"];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Enhanced Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-400 to-green-400 rounded-xl shadow-md">
              <div className="relative">
                <Database className="h-4 w-4 text-white absolute -translate-x-0.5 -translate-y-0.5" />
                <Search className="h-5 w-5 text-white relative z-10" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">SmartEDA</span>
              <div className="text-xs text-gray-500 font-medium -mt-1">Data Analytics Platform</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-12">
            {navItems.map((item, index) => (
              <a
                key={item}
                href="#"
                className={`text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  index === 0 
                    ? "text-gray-900 font-semibold relative" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item}
                {index === 0 && (
                  <div className="absolute bottom-[-4px] left-0 w-full h-0.5 rounded-full bg-gradient-to-r from-blue-400 to-green-400"></div>
                )}
              </a>
            ))}
          </nav>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden sm:flex font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-4 py-2 transition-all duration-200"
            >
              Sign In
            </Button>
            <Button 
              size="sm" 
              className="font-medium px-6 py-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg bg-gradient-to-r from-blue-400 to-green-400 text-white border-0 hover:scale-105"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}