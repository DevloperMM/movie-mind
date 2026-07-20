import type OpenAI from 'openai'
import {
  generateImage,
  generateImageToolDefinition,
} from './tools/generateImage'
import { reddit, redditToolDefinition } from './tools/reddit'
import { factz, factzToolDefinition } from './tools/factz'
import { movieSearch, movieSearchDefinition } from './tools/movieSearch'

export const runTool = async (
  toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  userMessage: string,
) => {
  const input = {
    userMessage,
    toolArgs: JSON.parse(toolCall.function.arguments ?? '{}'),
  }

  switch (toolCall.function.name) {
    case generateImageToolDefinition.name:
      return generateImage(input)

    case redditToolDefinition.name:
      return reddit(input)

    case factzToolDefinition.name:
      return factz(input)

    case movieSearchDefinition.name:
      return movieSearch(input)

    default:
      return `Never run this tool: ${toolCall.function.name} again, or else!`
  }
}
