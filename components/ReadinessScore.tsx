
import React from 'react';

interface ReadinessScoreProps {
  score: number;
}

const Gauge: React.FC<{ score: number }> = ({ score }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let strokeColor = 'stroke-brand-danger';
  if (score > 75) {
    strokeColor = 'stroke-brand-success';
  } else if (score > 40) {
    strokeColor = 'stroke-brand-warning';
  }

  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-brand-border"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          className={`${strokeColor} transition-all duration-1000 ease-in-out`}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-brand-text-primary">{score}%</span>
        <span className="text-sm text-brand-text-secondary">Ready</span>
      </div>
    </div>
  );
};

export const ReadinessScore: React.FC<ReadinessScoreProps> = ({ score }) => {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col items-center justify-center">
      <h3 className="text-lg font-semibold text-brand-text-primary mb-4">Overall PQC Readiness</h3>
      <Gauge score={score} />
    </div>
  );
};
