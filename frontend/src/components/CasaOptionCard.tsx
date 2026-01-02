import React from 'react';

interface CasaOptionCardProps {
  option: {
    id: string;
    title: string;
    icon: string;
    description: string;
    color: string;
  };
  onSelect: () => void;
}

const CasaOptionCard: React.FC<CasaOptionCardProps> = ({ option, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105 text-left"
    >
      {/* Top Accent Bar */}
      <div className={`h-1 bg-gradient-to-r ${option.color}`}></div>

      {/* Content */}
      <div className="p-6">
        {/* Icon */}
        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
          {option.icon}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {option.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {option.description}
        </p>

        {/* Arrow Indicator */}
        <div className="mt-4 flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-sm font-medium">Começar</span>
          <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </button>
  );
};

export default CasaOptionCard;
