'use client';

import React from 'react';
import { cn } from '@/lib/utils';

import {
  stripOuterEnclosing,
  findTopLevelSlash,
  parseMathEquation,
  type ParsedEquation,
  type ParsedEquationPart,
} from '@/lib/mathParser';

export {
  stripOuterEnclosing,
  findTopLevelSlash,
  parseMathEquation,
  type ParsedEquation,
  type ParsedEquationPart,
};

/**
 * Component to render a clean vertical fraction (numerator, fraction bar, denominator)
 */
export function Fraction({
  num,
  den,
  className,
}: {
  num: React.ReactNode;
  den: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex flex-col items-center align-middle mx-1 font-mono text-center select-text', className)}>
      <span className="px-1 text-center text-[0.88em] font-bold leading-tight">
        {num}
      </span>
      <span className="h-[0.07em] min-h-[1.5px] w-full min-w-[18px] bg-current rounded-full my-0.5 opacity-85" />
      <span className="px-1 text-center text-[0.88em] font-bold leading-tight">
        {den}
      </span>
    </span>
  );
}

/**
 * Parses and renders an equation with proper vertical fractions for any 'A / B' parts
 * Examples:
 * - "P(8, 3) = 8! / (8 - 3)! = 8! / 5!"
 * - "C(10, 3) = 10! / [3! × (10 − 3)!] = 10! / (3! × 7!)"
 * - "11! / (4! × 4! × 2! × 1!) = 34,650"
 * - "n! / (n₁! × n₂! × … × nₖ!)  [โดยที่ n = n₁ + n₂ + … + nₖ]"
 */
export function MathEquation({
  text,
  className,
  fractionClassName,
}: {
  text: string;
  className?: string;
  fractionClassName?: string;
}) {
  if (!text) return null;

  const { parts, operators, trailingNote } = parseMathEquation(text);

  return (
    <span
      className={cn(
        'inline-flex flex-wrap items-center gap-1 font-mono leading-none align-middle py-0.5',
        className
      )}
    >
      {parts.map((part, idx) => {
        const isLastPart = idx === parts.length - 1;

        return (
          <React.Fragment key={idx}>
            {part.isFraction ? (
              <Fraction
                num={part.numerator}
                den={part.denominator}
                className={fractionClassName}
              />
            ) : (
              <span>{part.raw}</span>
            )}
            {idx < operators.length && (
              <span className="mx-1 opacity-60 font-bold select-none">
                {operators[idx]}
              </span>
            )}
            {isLastPart && trailingNote && (
              <span className="ml-1.5 text-xs opacity-75 font-sans font-normal select-text">
                {trailingNote}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </span>
  );
}
