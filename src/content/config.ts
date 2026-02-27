import { defineCollection, z } from 'astro:content';

const projectSchema = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    titleVi: z.string().optional(),
    year: z.number().optional(),
    description: z.string().optional(),
    descriptionVi: z.string().optional(),
    coverImage: z.string().optional(),
    order: z.number().optional().default(0),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = {
  production: projectSchema,
  editor: projectSchema,
  director: projectSchema,
  'assistant-director': projectSchema,
};
