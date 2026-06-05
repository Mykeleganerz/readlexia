import { useAccessibility } from '../contexts/AccessibilityContext';

/**
 * Proper English syllabification algorithm following standard phonetic rules:
 * 1. VC/CV - split between two consonants (unless they form a blend)
 * 2. V/CV - single consonant goes with next vowel (open syllable)
 * 3. VCC/V - two consonants split between them unless they form a blend
 * 4. Consonant blends (th, sh, ch, str, bl, cr, etc.) stay together
 * 5. Silent E syllables - final e is part of the last syllable
 * 6. Some consonants (S, V, X, F, T, K, etc.) can close previous syllables
 */
function splitIntoSyllables(word: string): string[] {
  word = word.toLowerCase();

  // Words too short to split
  if (word.length <= 2) {
    return [word];
  }

  const vowels = new Set('aeiouy');

  // Consonant blends that should not be split (excludes 'sk', 'sc' which split in medial position)
  const blends = new Set([
    'bl',
    'br',
    'ch',
    'cl',
    'cr',
    'dr',
    'dw',
    'fl',
    'fr',
    'gh',
    'gl',
    'gr',
    'kn',
    'ph',
    'pl',
    'pr',
    'qu',
    'sh',
    'sl',
    'sm',
    'sn',
    'sp',
    'st',
    'sw',
    'th',
    'tr',
    'tw',
    'wh',
    'wr',
    'sch',
    'scr',
    'shr',
    'spl',
    'spr',
    'str',
    'thr',
  ]);

  // Consonants that typically close syllables
  const codaConsonants = new Set([
    's',
    'z',
    'f',
    'v',
    'x',
    'p',
    't',
    'k',
    'b',
    'd',
    'g',
    'm',
    'n',
  ]);

  // Find split points by analyzing consonant patterns between vowels
  const splitPoints: number[] = [];

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const isVowel = vowels.has(char);

    // Only analyze positions after vowels
    if (!isVowel || i === word.length - 1) {
      continue;
    }

    // Count consecutive consonants after this vowel
    let consonantCount = 0;
    let consonantStart = i + 1;

    while (
      consonantStart + consonantCount < word.length &&
      !vowels.has(word[consonantStart + consonantCount])
    ) {
      consonantCount++;
    }

    // If no consonants or word ends, no split
    if (
      consonantCount === 0 ||
      consonantStart + consonantCount === word.length
    ) {
      continue;
    }

    // Check for silent E at the end
    const isLastVowelSilentE =
      consonantStart + consonantCount === word.length - 1 &&
      word[word.length - 1] === 'e';

    if (isLastVowelSilentE) {
      continue; // Don't split before silent E
    }

    // Apply syllabification rules
    if (consonantCount === 1) {
      // Single consonant between vowels - determine if it closes or opens
      const singleConsonant = word[consonantStart];
      const nextVowel = word[consonantStart + 1];
      const currentVowel = word[i];
      const sameVowelLetter = currentVowel === nextVowel;

      // 'x' always closes the previous syllable
      if (singleConsonant === 'x') {
        splitPoints.push(consonantStart + 1);
      }
      // 'd' and 'b' open if followed by same vowel letter (radar, baby)
      else if (
        (singleConsonant === 'd' || singleConsonant === 'b') &&
        sameVowelLetter
      ) {
        splitPoints.push(i + 1);
      }
      // Other coda consonants close
      else if (codaConsonants.has(singleConsonant)) {
        splitPoints.push(consonantStart + 1);
      }
      // Default: consonant opens next syllable
      else {
        splitPoints.push(i + 1);
      }
    } else if (consonantCount >= 2) {
      // Multiple consonants between vowels
      const twoCharBlend = word.substring(consonantStart, consonantStart + 2);
      const threeCharBlend = word.substring(consonantStart, consonantStart + 3);
      const firstConsonant = word[consonantStart];

      // If first consonant is a coda AND the consonant pair is not a recognized blend,
      // split after the first consonant
      if (
        codaConsonants.has(firstConsonant) &&
        !blends.has(twoCharBlend) &&
        !blends.has(threeCharBlend)
      ) {
        splitPoints.push(consonantStart + 1);
      }
      // Check for three-letter blends
      else if (blends.has(threeCharBlend)) {
        splitPoints.push(consonantStart);
      }
      // Check for two-letter blends
      else if (blends.has(twoCharBlend)) {
        splitPoints.push(consonantStart);
      }
      // Default: split between consonants
      else {
        splitPoints.push(consonantStart + 1);
      }
    }
  }

  const syllables: string[] = [];
  let start = 0;

  for (const splitPoint of splitPoints) {
    if (splitPoint > start) {
      syllables.push(word.substring(start, splitPoint));
      start = splitPoint;
    }
  }

  // Add remaining characters
  if (start < word.length) {
    syllables.push(word.substring(start));
  }

  // Filter out empty syllables and ensure minimum valid result
  const validSyllables = syllables.filter((syl) => syl.length > 0);
  return validSyllables.length > 0 ? validSyllables : [word];
}

interface SyllableSplitterProps {
  text: string;
}

export function SyllableSplitter({ text }: SyllableSplitterProps) {
  const { settings } = useAccessibility();

  if (!settings.syllableSplitterEnabled) {
    return <>{text}</>;
  }

  // Split by any whitespace (spaces, tabs, newlines, etc.) while preserving the whitespace
  const parts = text.split(/(\s+)/);

  return (
    <>
      {parts.map((part, partIndex) => {
        // Preserve whitespace as-is
        if (/^\s+$/.test(part)) {
          return <span key={partIndex}>{part}</span>;
        }

        // Skip empty parts
        if (part.length === 0) {
          return null;
        }

        // Only split complex words (more than 7 characters)
        if (part.length <= 7) {
          return <span key={partIndex}>{part}</span>;
        }

        const syllables = splitIntoSyllables(part);

        return (
          <span key={partIndex} className="inline-block">
            {syllables.map((syllable, syllableIndex) => (
              <span
                key={syllableIndex}
                className="inline-block"
                style={{
                  color:
                    syllableIndex % 2 === 0
                      ? 'inherit'
                      : 'rgba(59, 130, 246, 0.8)',
                }}
              >
                {syllable}
                {syllableIndex < syllables.length - 1 && (
                  <span className="text-blue-400" style={{ fontSize: '0.8em' }}>
                    ·
                  </span>
                )}
              </span>
            ))}
          </span>
        );
      })}
    </>
  );
}
