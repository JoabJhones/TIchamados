// use server'

/**
 * @fileOverview This file defines a Genkit flow for suggesting an appropriate technician to assign to a support ticket.
 *
 * The flow takes into account the ticket's category, the technician's workload, and their skills to make the suggestion.
 *
 * @exports {
 *   suggestAppropriateTechnician: (input: SuggestTechnicianInput) => Promise<SuggestTechnicianOutput>;
 *   SuggestTechnicianInput: type
 *   SuggestTechnicianOutput: type
 * }
 */
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTechnicianInputSchema = z.object({
  ticketCategory: z.string().describe('The category of the support ticket (e.g., network, software, hardware).'),
  ticketDescription: z.string().describe('The description of the support ticket'),
  technicianList: z.array(
    z.object({
      technicianId: z.string().describe('The unique identifier of the technician.'),
      workload: z.number().describe('The current workload of the technician (e.g., number of open tickets).'),
      skills: z.array(z.string()).describe('The skills of the technician (e.g., network, software, hardware).'),
    })
  ).describe('A list of available technicians with their workload and skills.'),
});
export type SuggestTechnicianInput = z.infer<typeof SuggestTechnicianInputSchema>;

const SuggestTechnicianOutputSchema = z.object({
  suggestedTechnicianId: z.string().describe('The ID of the suggested technician to assign to the ticket.'),
  reason: z.string().describe('The reasoning behind the suggestion.'),
});
export type SuggestTechnicianOutput = z.infer<typeof SuggestTechnicianOutputSchema>;

export async function suggestAppropriateTechnician(input: SuggestTechnicianInput): Promise<SuggestTechnicianOutput> {
  return suggestTechnicianFlow(input);
}

const suggestTechnicianPrompt = ai.definePrompt({
  name: 'suggestTechnicianPrompt',
  input: {schema: SuggestTechnicianInputSchema},
  output: {schema: SuggestTechnicianOutputSchema},
  prompt: `You are an AI assistant helping to assign support tickets to the most appropriate technician.

  Given the following support ticket category and a list of technicians with their workloads and skills, determine the best technician to assign the ticket to.
  Consider the ticket category, technician workload, and technician skills to make your decision.

  Ticket Category: {{{ticketCategory}}}
  Ticket Description: {{{ticketDescription}}}
  Technicians:{{#each technicianList}} 
    - Technician ID: {{technicianId}}, Workload: {{workload}}, Skills: {{skills}}
  {{/each}}

  Based on this information, suggest the most appropriate technician and provide a reason for your suggestion.
  Format the output as a JSON object with 'suggestedTechnicianId' and 'reason' fields.
  `,
});

const suggestTechnicianFlow = ai.defineFlow(
  {
    name: 'suggestTechnicianFlow',
    inputSchema: SuggestTechnicianInputSchema,
    outputSchema: SuggestTechnicianOutputSchema,
  },
  async input => {
    const {output} = await suggestTechnicianPrompt(input);
    return output!;
  }
);
