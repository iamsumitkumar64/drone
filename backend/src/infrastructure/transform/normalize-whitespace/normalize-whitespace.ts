import { Transform, TransformOptions } from 'class-transformer';

export interface NormalizeWhitespaceOptions {
  toLowerCase?: boolean;
}

export function NormalizeWhitespace(
  options?: NormalizeWhitespaceOptions,
  transformOptions?: TransformOptions,
) {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }
    const normalized = value.trim().replace(/\s+/g, ' ');
    return options?.toLowerCase ? normalized.toLowerCase() : normalized;
  }, transformOptions);
}