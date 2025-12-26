import React from 'react';
import './Select.css';

interface SelectProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  className?: string; // Allow external override/extension
}

export function Select({ value, onChange, options, className }: SelectProps) {
  return (
    <select
      className={`select-component ${className || ''}`}
      value={value}
      onChange={onChange}
    >
      {options.map((option) => (

        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
