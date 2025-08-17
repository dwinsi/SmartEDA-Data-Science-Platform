import React from 'react';

export default function TestComponent() {
  return (
    <div className="p-4 bg-blue-400 text-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-2">CSS Test Component</h2>
      <p className="text-sm">If you can see this styled component, Tailwind CSS is working correctly!</p>
      <div className="mt-4 p-3 bg-green-400 rounded-lg">
        <p className="font-medium">Custom colors are also working!</p>
      </div>
    </div>
  );
}