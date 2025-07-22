'use server';

import { suggestCategoryAndPriority } from '@/ai/flows/suggest-category-and-priority';
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from './mock-data';

// Helper to find the closest match from a list of allowed values
function findClosestMatch(value: string, allowedValues: readonly string[]): string {
    const lowerCaseValue = value.toLowerCase();
    const found = allowedValues.find(v => v.toLowerCase() === lowerCaseValue);
    if (found) {
        return found;
    }
    // Simple fallback if no direct match, could be improved with fuzzy matching
    const partialMatch = allowedValues.find(v => v.toLowerCase().includes(lowerCaseValue));
    return partialMatch || allowedValues[allowedValues.length -1]; // return "Outros" ou "Baixa"
}

export async function getAiSuggestions(description: string): Promise<{ category: string; priority: string }> {
  if (!description) {
    throw new Error('Description is required');
  }

  try {
    const result = await suggestCategoryAndPriority({ description });

    const category = findClosestMatch(result.category, TICKET_CATEGORIES);
    const priority = findClosestMatch(result.priority, TICKET_PRIORITIES);

    return { category, priority };
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    throw new Error('Failed to get AI suggestions.');
  }
}
