import { z } from 'zod'

export const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  list: z.enum(['newsletter', 'chatbot']),
})

export type EmailSubscription = z.infer<typeof emailSchema>

