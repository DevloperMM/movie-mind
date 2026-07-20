import 'dotenv/config'

import { runLLM } from '../../src/llm'
import { factzToolDefinition } from '../../src/tools/factz'
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

runEval('factz', {
  task: (input) =>
    runLLM({
      messages: [{ role: 'user', content: input }],
      tools: [factzToolDefinition],
    }),
  data: [
    {
      input: 'I want to test my knowledge about movies',
      expected: createToolCallMessage(factzToolDefinition.name),
    },
    {
      input: 'Give me a movie trivia quiz',
      expected: createToolCallMessage(factzToolDefinition.name),
    },
  ],
  scorers: [ToolCallMatch],
})
