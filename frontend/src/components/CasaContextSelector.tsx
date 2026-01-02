import React from 'react';

interface ContextOption {
  id: string;
  label: string;
  icon: string;
  description: string;
}

interface CasaContextSelectorProps {
  options: ContextOption[];
  selectedOption?: string;
  onSelect: (optionId: string) => void;
  onBack?: () => void;
}

const CasaContextSelector: React.FC<CasaContextSelectorProps> = ({
  options,
  selectedOption,
  onSelect,
  onBack,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Selecione o Tipo de Trabalho
          </h2>
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700 text-2xl font-light"
            >
              ✕
            </button>
          )}
        </div>

        {/* Options Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => onSelect(option.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedOption === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 bg-gray-50'
                }`}
              >
                <div className="text-4xl mb-2">{option.icon}</div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  {option.label}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-4 justify-end">
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Voltar
            </button>
          )}
          <button
            disabled={!selectedOption}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CasaContextSelector;
