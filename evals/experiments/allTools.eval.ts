import 'dotenv/config'

import { runLLM } from '../../src/llm'
import { factzToolDefinition } from '../../src/tools/factz'
import { generateImageToolDefinition } from '../../src/tools/generateImage'
import { redditToolDefinition } from '../../src/tools/reddit'
import { movieSearchDefinition } from '../../src/tools/movieSearch'
import { runEval } from '../evalTools'
import { ToolCallMatch } from '../scorers'

const createToolCallMessage = (toolName: string) => ({
  role: 'assistant',
  tool_calls: [
    {
      type: 'function',
      function: {
        name: toolName,
      },
    },
  ],
})

const allTools = [
  factzToolDefinition,
  generateImageToolDefinition,
  redditToolDefinition,
  movieSearchDefinition,
]

runEval('allTools', {
  task: (input) =>
    runLLM({
      messages: [{ role: 'user', content: input }],
      tools: allTools,
    }),
  data: [
    {
      input: 'I want to test my movie knowledge',
      expected: createToolCallMessage(factzToolDefinition.name),
    },
    {
      input: 'take a photo of mars',
      expected: createToolCallMessage(generateImageToolDefinition.name),
    },
    {
      input: 'what is the most upvoted post on reddit',
      expected: createToolCallMessage(redditToolDefinition.name),
    },
    {
      input: 'find me a good sci-fi movie from the 2010s',
      expected: createToolCallMessage(movieSearchDefinition.name),
    },
  ],
  scorers: [ToolCallMatch],
})
