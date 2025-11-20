/**
 * Shared location: shared-modules/models/validators/quote.validator.ts
 * Used by: quotes-platform (Angular), quotes-native (React Native)
 */

import { Quote, QuoteType, Language } from '../quote.model';

export interface QuoteValidationError {
  field: keyof Quote;
  message: string;
}

export function validateQuote(quote: Quote): QuoteValidationError[] {
  const errors: QuoteValidationError[] = [];

  // Content validation
  if (!quote.content || quote.content.trim().length === 0) {
    errors.push({ field: 'content', message: 'Content is required' });
  }
  if (quote.content.length > 5000) {
    errors.push({ field: 'content', message: 'Content exceeds 5000 characters' });
  }

  // Author validation
  if (!quote.author || quote.author.trim().length === 0) {
    errors.push({ field: 'author', message: 'Author is required' });
  }

  // Type validation
  if (!Object.values(QuoteType).includes(quote.type)) {
    errors.push({ field: 'type', message: 'Invalid quote type' });
  }

  // Category validation
  if (!quote.category || quote.category.trim().length === 0) {
    errors.push({ field: 'category', message: 'Category is required' });
  }

  // Tags validation
  if (!Array.isArray(quote.tags)) {
    errors.push({ field: 'tags', message: 'Tags must be an array' });
  }

  // Language validation
  if (!Object.values(Language).includes(quote.language)) {
    errors.push({ field: 'language', message: 'Invalid language' });
  }

  return errors;
}
