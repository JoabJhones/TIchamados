// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview An AI agent to suggest a category and priority for a support ticket based on the ticket description.
 *
 * - suggestCategoryAndPriority - A function that handles the suggestion of category and priority for a support ticket.
 * - SuggestCategoryAndPriorityInput - The input type for the suggestCategoryAndPriority function.
 * - SuggestCategoryAndPriorityOutput - The return type for the suggestCategoryAndPriority function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCategoryAndPriorityInputSchema = z.object({
  description: z.string().describe('The description of the support ticket.'),
});
export type SuggestCategoryAndPriorityInput = z.infer<typeof SuggestCategoryAndPriorityInputSchema>;

const SuggestCategoryAndPriorityOutputSchema = z.object({
  category: z.string().describe('The suggested category for the support ticket.'),
  priority: z.string().describe('The suggested priority for the support ticket.'),
});
export type SuggestCategoryAndPriorityOutput = z.infer<typeof SuggestCategoryAndPriorityOutputSchema>;

export async function suggestCategoryAndPriority(input: SuggestCategoryAndPriorityInput): Promise<SuggestCategoryAndPriorityOutput> {
  return suggestCategoryAndPriorityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCategoryAndPriorityPrompt',
  input: {schema: SuggestCategoryAndPriorityInputSchema},
  output: {schema: SuggestCategoryAndPriorityOutputSchema},
  prompt: `You are an AI assistant helping to categorize support tickets.
  Based on the following description, suggest a category and priority for the ticket.
  Description: {{{description}}}
  Respond with a JSON object containing the category and priority.
  `,
});

const suggestCategoryAndPriorityFlow = ai.defineFlow(
  {
    name: 'suggestCategoryAndPriorityFlow',
    inputSchema: SuggestCategoryAndPriorityInputSchema,
    outputSchema: SuggestCategoryAndPriorityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
