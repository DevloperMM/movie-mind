import { generateImageToolDefinition } from './generateImage'
import { redditToolDefinition } from './reddit'
import { factzToolDefinition } from './factz'
import { movieSearchDefinition } from './movieSearch'

export const tools = [
  generateImageToolDefinition,
  redditToolDefinition,
  factzToolDefinition,
  movieSearchDefinition,
]
