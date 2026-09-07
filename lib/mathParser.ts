/**
 * Remove matching outer parentheses, brackets, or braces if they enclose the entire string
 */
export function stripOuterEnclosing(str: string): string {
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
export function findTopLevelSlash(str: string): number {
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
 * Parsed math equation structure
 */
export type ParsedEquationPart = {
  raw: string;
  isFraction: boolean;
  numerator?: string;
  denominator?: string;
};

export type ParsedEquation = {
  parts: ParsedEquationPart[];
  operators: string[];
  trailingNote?: string;
};

/**
 * Parses an equation string with fractions, operators, and optional trailing explanatory notes.
 * Extracts trailing explanatory notes (e.g. "[โดยที่ n = ...]") first to avoid splitting on '=' inside the note.
 */
export function parseMathEquation(text: string): ParsedEquation {
  if (!text) {
    return { parts: [], operators: [] };
  }

  let mainText = text.trim();
  let trailingNote: string | undefined;

  // 1. Extract trailing explanatory notes, e.g.:
  // "[โดยที่ n = n₁ + n₂ + … + nₖ]" or "(โดยที่ ...)" or "(เมื่อ ...)" or "(n = ...)"
  // Must be extracted BEFORE splitting by '=', '\implies', or '≈'
  const noteMatch = mainText.match(
    /\s*([(\[](?:โดยที่|เมื่อ|สำหรับ|หมายเหตุ|where|note:?|[a-z]\s*=)\s*[^)\]]+[)\]])\s*$/i
  );
  if (noteMatch && noteMatch.index !== undefined) {
    trailingNote = noteMatch[1];
    mainText = mainText.slice(0, noteMatch.index).trim();
  }

  // 2. Split equation by equality / relation signs (=, \implies, ≈)
  const rawParts = mainText.split(/(?:\s*=\s*|\s*\\implies\s*|\s*≈\s*)/);

  // 3. Extract operators between parts in exact sequence
  const operators: string[] = [];
  let remaining = mainText;
  for (let i = 0; i < rawParts.length - 1; i++) {
    const part = rawParts[i];
    const idx = remaining.indexOf(part);
    const afterPart = remaining.slice(idx + part.length);
    const trimmedAfter = afterPart.trimStart();

    if (trimmedAfter.startsWith('\\implies')) {
      operators.push('⟹');
      remaining = trimmedAfter.replace(/^\\implies\s*/, '');
    } else if (trimmedAfter.startsWith('≈')) {
      operators.push('≈');
      remaining = trimmedAfter.replace(/^≈\s*/, '');
    } else {
      operators.push('=');
      remaining = trimmedAfter.replace(/^=\s*/, '');
    }
  }

  // 4. Parse each part to identify vertical fractions
  const parts: ParsedEquationPart[] = rawParts.map((rawPart) => {
    const trimmed = rawPart.trim();
    const stripped = stripOuterEnclosing(trimmed);
    const slashIdx = findTopLevelSlash(stripped);

    if (slashIdx !== -1) {
      const rawNum = stripped.slice(0, slashIdx);
      const rawDen = stripped.slice(slashIdx + 1);
      const cleanNum = stripOuterEnclosing(rawNum);
      const cleanDen = stripOuterEnclosing(rawDen);

      return {
        raw: trimmed,
        isFraction: true,
        numerator: cleanNum,
        denominator: cleanDen,
      };
    }

    return {
      raw: trimmed,
      isFraction: false,
    };
  });

  return {
    parts,
    operators,
    trailingNote,
  };
}
