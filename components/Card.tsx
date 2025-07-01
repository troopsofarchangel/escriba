
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-amber-400 border-b border-amber-400/30 pb-2 mb-4">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
};

export default Card;
