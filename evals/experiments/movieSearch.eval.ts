import 'dotenv/config'

import { runLLM } from '../../src/llm'
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

runEval('search-movie', {
  task: (input) =>
    runLLM({
      messages: [{ role: 'user', content: input }],
      tools: [movieSearchDefinition],
    }),
  data: [
    {
      input: "find comedy movies from nolan's direction",
      expected: createToolCallMessage(movieSearchDefinition.name),
    },
    {
      input: 'I like comedy. Can you suggest something ?',
      expected: createToolCallMessage(movieSearchDefinition.name),
    },
  ],
  scorers: [ToolCallMatch],
})
