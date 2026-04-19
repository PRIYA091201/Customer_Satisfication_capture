import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export function SuccessMessage() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md mx-auto transform transition-all duration-500 scale-100 opacity-100">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank you!</h2>
      <p className="text-gray-600">
        Your feedback has been submitted successfully. We appreciate your input!
      </p>
    </div>
  );
}
