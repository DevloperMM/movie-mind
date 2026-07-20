import { z } from 'zod'
import type { ToolFn } from '../../types'
import fetch from 'node-fetch'

export const factzToolDefinition = {
  name: 'factz',
  parameters: z.object({}),
  description:
    'Use this when the user wants or asks you for some facts',
}

type Args = z.infer<typeof factzToolDefinition.parameters>

function decodeHtml(html: string): string {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&eacute;/g, 'e')
    .replace(/&rsquo;/g, "'")
}

export const factz: ToolFn<Args, string> = async () => {
  try {
    const response = await fetch(
      'https://opentdb.com/api.php?amount=1&category=11'
    )
    
    const data: any = await response.json()

    const trivia = data.results[0]
    const question = decodeHtml(trivia.question)
    const answer = decodeHtml(trivia.correct_answer)

    return `Do you know ${question}. The answer is ${answer}`

  } catch (error) {
    return 'Failed to fetch! Please try again later.'
  }
}
