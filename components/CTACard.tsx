import React from "react";

interface CTACardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export const CTACard: React.FC<CTACardProps> = ({ title, description, icon, onClick }) => (
  <div
    className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-xl shadow hover:shadow-lg cursor-pointer transition-all w-64 m-2"
    onClick={onClick}
  >
    <div className="mb-3 text-4xl text-green-400">{icon}</div>
    <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-600 text-center">{description}</p>
  </div>
);
