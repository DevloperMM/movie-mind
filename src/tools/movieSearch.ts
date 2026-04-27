import type { ToolFn } from '../../types'
import { z } from 'zod'
import { queryMovies } from '../rag/query'

export const movieSearchDefinition = {
  name: 'search-movie',
  parameters: z.object({
    // By default every field is required, optional needs to be mentioned separately
    query: z.string().describe('The search query for finding movies'),
  }),
  description:
    'use this tool to find movies or answer questions about movies and their metadata like score, rating, costs, director, actors and more',
}

type Args = z.infer<typeof movieSearchDefinition.parameters>

export const movieSearch: ToolFn<Args, string> = async ({ toolArgs }) => {
  let results
  try {
    results = await queryMovies({ query: toolArgs.query })
  } catch (error) {
    console.error(error)
    return 'Error: Failed to search for movies'
  }

  const formattedResults = results.map((result) => {
    const { metadata, data } = result
    return { ...metadata, description: data }
  })

  return JSON.stringify(formattedResults, null, 2)
}
