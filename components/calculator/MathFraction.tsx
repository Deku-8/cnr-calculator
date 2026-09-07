'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Remove matching outer parentheses, brackets, or braces if they enclose the entire string
 */
function stripOuterEnclosing(str: string): string {
  let trimmed = str.trim();
  let changed = true;

  while (changed) {
    changed = false;
    if (
      (trimmed.startsWith('(') && trimmed.endsWith(')')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}'))
    ) {
      let depth = 0;
      let closesAtEnd = true;
      for (let i = 0; i < trimmed.length - 1; i++) {
        const ch = trimmed[i];
        if (ch === '(' || ch === '[' || ch === '{') depth++;
        else if (ch === ')' || ch === ']' || ch === '}') depth--;
        if (depth === 0) {
          closesAtEnd = false;
          break;
        }
      }
      if (closesAtEnd) {
        trimmed = trimmed.slice(1, -1).trim();
        changed = true;
      }
    }
  }
  return trimmed;
}

/**
 * Find index of top-level '/' not enclosed in parentheses/brackets/braces
 */
function findTopLevelSlash(str: string): number {
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    else if (ch === '/' && depth === 0) {
      return i;
    }
  }
  return -1;
}

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
      <span className="h-[1.5px] w-full min-w-[18px] bg-current rounded-full my-0.5 opacity-80" />
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

  // Split equation by equality signs (=, \implies, ≈)
  const parts = text.split(/(?:\s*=\s*|\s*\\implies\s*|\s*≈\s*)/);

  // Extract operators between parts
  const operators: string[] = [];
  let remaining = text;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const idx = remaining.indexOf(part);
    const afterPart = remaining.slice(idx + part.length);
    if (afterPart.startsWith(' \\implies ') || afterPart.startsWith('\\implies')) {
      operators.push('⟹');
      remaining = afterPart.replace(/^\s*\\implies\s*/, '');
    } else if (afterPart.includes('≈')) {
      operators.push('≈');
      remaining = afterPart.replace(/^\s*≈\s*/, '');
    } else {
      operators.push('=');
      remaining = afterPart.replace(/^\s*=\s*/, '');
    }
  }

  return (
    <span className={cn('inline-flex flex-wrap items-center gap-1 font-mono leading-none align-middle py-0.5', className)}>
      {parts.map((part, idx) => {
        let trimmed = part.trim();
        // Check if there is trailing text/note like "[โดยที่ n = ...]"
        let note = '';
        const noteMatch = trimmed.match(/\s*(\[.+\])\s*$/);
        if (noteMatch && noteMatch.index !== undefined) {
          note = noteMatch[1];
          trimmed = trimmed.slice(0, noteMatch.index).trim();
        }

        // Strip outer enclosing if present
        const stripped = stripOuterEnclosing(trimmed);
        const slashIdx = findTopLevelSlash(stripped);

        let content: React.ReactNode;
        if (slashIdx !== -1) {
          const rawNum = stripped.slice(0, slashIdx);
          const rawDen = stripped.slice(slashIdx + 1);

          const cleanNum = stripOuterEnclosing(rawNum);
          const cleanDen = stripOuterEnclosing(rawDen);

          content = (
            <span className="inline-flex items-center align-middle">
              <Fraction num={cleanNum} den={cleanDen} className={fractionClassName} />
              {note && <span className="ml-1 text-xs opacity-75 font-sans font-normal">{note}</span>}
            </span>
          );
        } else {
          content = (
            <span className="inline-flex items-center align-middle">
              <span>{trimmed}</span>
              {note && <span className="ml-1 text-xs opacity-75 font-sans font-normal">{note}</span>}
            </span>
          );
        }

        return (
          <React.Fragment key={idx}>
            {content}
            {idx < operators.length && (
              <span className="mx-1 opacity-60 font-bold select-none">{operators[idx]}</span>
            )}
          </React.Fragment>
        );
      })}
    </span>
  );
}
