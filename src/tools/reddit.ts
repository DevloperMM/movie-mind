import type { ToolFn } from '../../types'
import { z } from 'zod'

export const redditToolDefinition = {
  name: 'reddit',
  parameters: z.object({}),
  description:
    "Use this to find movie reviews from Reddit when the user asks about what people are saying about a movie on Reddit",
}

type Args = z.infer<typeof redditToolDefinition.parameters>

export const reddit: ToolFn<Args, string> = async () => {
  return "tell user that the reviews are not currently available for now but they will be available soon after a while check later and you already find with your capability but don't get some answers to mention here"
}
