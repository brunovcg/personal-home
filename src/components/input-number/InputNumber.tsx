import React, { useLayoutEffect, useRef, useState } from 'react';
import './InputNumber.css';

interface InputNumberProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const MAX_DECIMALS = 2;

const NUMERIC_TEXT = /^\d*,?\d*$/;

const countDots = (text: string) => text.split('.').length - 1;

const stripMask = (text: string) => text.replace(/\./g, '');

const parseNumber = (text: string) =>
  Number(stripMask(text).replace(',', '.')) || 0;

const formatNumber = (value: number) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: MAX_DECIMALS });

// '1234,5' -> '1.234,5', keeping partial input such as '' and '1,'
const applyMask = (text: string) => {
  const [integer, decimals] = text.split(',');
  const grouped = integer
    .replace(/^0+(?=\d)/, '')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return decimals === undefined
    ? grouped
    : `${grouped},${decimals.slice(0, MAX_DECIMALS)}`;
};

// Position right after the first `count` characters that are not mask dots
const findCaret = (masked: string, count: number) => {
  let caret = 0;
  let remaining = count;
  while (caret < masked.length && remaining > 0) {
    if (masked[caret] !== '.') remaining -= 1;
    caret += 1;
  }
  return caret;
};

export function InputNumber({ value, onChange, className }: InputNumberProps) {
  // Raw text while editing, so '' and '1,' survive until blur
  const [draft, setDraft] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const caretRef = useRef<number | null>(null);

  // The mask adds and removes characters, which would throw the caret to the end
  useLayoutEffect(() => {
    if (caretRef.current === null) return;
    inputRef.current?.setSelectionRange(caretRef.current, caretRef.current);
    caretRef.current = null;
  });

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setDraft(formatNumber(value));
    event.target.select();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const caret = event.target.selectionStart ?? event.target.value.length;
    let text = event.target.value;

    // A newly typed '.' is the decimal separator, the others come from the mask
    if (text[caret - 1] === '.' && countDots(text) > countDots(draft ?? '')) {
      text = `${text.slice(0, caret - 1)},${text.slice(caret)}`;
    }

    const unmasked = stripMask(text);
    if (!NUMERIC_TEXT.test(unmasked)) return;

    const masked = applyMask(unmasked);
    caretRef.current = findCaret(
      masked,
      stripMask(text.slice(0, caret)).length,
    );
    setDraft(masked);
    onChange(parseNumber(masked));
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      className={`input-number-component ${className || ''}`}
      value={draft ?? formatNumber(value)}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={() => setDraft(null)}
    />
  );
}
