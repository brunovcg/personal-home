import React from 'react';
import './InputNumber.css';

interface InputNumberProps {
  value: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  step?: string;
}

export function InputNumber({
  value,
  onChange,
  className,
  step,
}: InputNumberProps) {
  return (
    <input
      type="number"
      className={`input-number-component ${className || ''}`}
      value={value}

      onChange={onChange}
      step={step}
    />
  );
}
