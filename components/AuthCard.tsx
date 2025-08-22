
import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const AuthCard: React.FC = () => {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative w-full max-w-md h-[500px] overflow-hidden bg-white rounded-xl shadow-lg">
        {/* Tab Bar */}
        <div className="flex justify-center items-center border-b border-gray-200 bg-gray-50">
          <button
            className={`px-6 py-3 text-lg font-semibold focus:outline-none transition-colors duration-200 ${!showRegister ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-blue-600'}`}
            style={{ borderBottomLeftRadius: '0.75rem', borderTopLeftRadius: '0.75rem' }}
            onClick={() => setShowRegister(false)}
            tabIndex={0}
            type="button"
          >
            Login
          </button>
          <button
            className={`px-6 py-3 text-lg font-semibold focus:outline-none transition-colors duration-200 ${showRegister ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-blue-600'}`}
            style={{ borderBottomRightRadius: '0.75rem', borderTopRightRadius: '0.75rem' }}
            onClick={() => setShowRegister(true)}
            tabIndex={0}
            type="button"
          >
            Register
          </button>
        </div>
        <div className="relative w-full h-[440px]">
          <div
            className={`absolute w-full h-full transition-all duration-800 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] ${showRegister ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'}`}
          >
            <LoginForm />
            <div className="text-center mt-4">
              <button
                className="text-blue-600 hover:underline font-medium"
                onClick={() => setShowRegister(true)}
                type="button"
              >
                Don't have an account? Register here!
              </button>
            </div>
          </div>
          <div
            className={`absolute w-full h-full transition-all duration-700 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] ${showRegister ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
          >
            <RegisterForm />
            <div className="text-center mt-4">
              <button
                className="text-blue-600 hover:underline font-medium"
                onClick={() => setShowRegister(false)}
                type="button"
              >
                Already have an account? Login here!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
