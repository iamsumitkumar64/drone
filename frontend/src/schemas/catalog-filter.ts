import { z } from "zod";

export const catalogFilterSchema = z.object({
  search: z.string(),
  retailer: z.string(),
  category: z.string(),
  status: z.string(),
  maxPrice: z.string(),
});

export type CatalogFilterSchemaType = z.infer<typeof catalogFilterSchema>;
