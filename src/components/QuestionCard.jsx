// src/components/QuestionCard.jsx
import React from 'react';

const QuestionCard = ({ question, onSelect, selectedAnswer }) => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        {question.text}
      </h3>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`w-full text-left p-4 rounded-lg border transition-all ${
              selectedAnswer === index 
                ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' 
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;