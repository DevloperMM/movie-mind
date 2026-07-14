import type { ToolFn } from '../../types'
import { z } from 'zod'
import { queryMovies } from '../rag/query'

export const movieSearchDefinition = {
  name: 'search-movie',
  description: `Use this tool to search movies using native hybrid search. Extract general semantic themes, director names, and genres into the query field, and explicit numeric bounds into filters.`,
  parameters: z.object({
    query: z
      .string()
      .describe(
        'The core semantic ideas, plot details, genres, or director/actor names to query (e.g., "Nolan sci-fi").',
      ),

    filter: z
      .object({
        yearMin: z
          .number()
          .nullable()
          .describe(
            'Filter by minimum release year. Pass null if not specified.',
          ),
        yearMax: z
          .number()
          .nullable()
          .describe(
            'Filter by maximum release year. Pass null if not specified.',
          ),
        ratingMin: z
          .number()
          .nullable()
          .describe('Filter by minimum rating. Pass null if not specified.'),
      })
      .nullable()
      .describe(
        'Explicit numeric search bounds. Pass null if no constraints are explicitly demanded.',
      ),

    sort: z
      .object({
        field: z
          .enum(['rating', 'year', 'revenue', 'metascore'])
          .describe('Field metadata variable to rank by.'),
        order: z.enum(['asc', 'desc']).describe('Sorting order layout.'),
      })
      .nullable()
      .describe(
        'Deterministic sort properties. Pass null if not explicitly demanded by user.',
      ),
  }),
}

type Args = z.infer<typeof movieSearchDefinition.parameters>

export const movieSearch: ToolFn<Args, string> = async ({ toolArgs }) => {
  let results
  try {
    const cleanArgs: any = {
      query: toolArgs.query,
      filter: {},
      sort: toolArgs.sort || undefined,
    }

    if (toolArgs.filter) {
      if (toolArgs.filter.yearMin !== null)
        cleanArgs.filter.year = {
          ...cleanArgs.filter.year,
          gte: toolArgs.filter.yearMin,
        }
      if (toolArgs.filter.yearMax !== null)
        cleanArgs.filter.year = {
          ...cleanArgs.filter.year,
          lte: toolArgs.filter.yearMax,
        }
      if (toolArgs.filter.ratingMin !== null)
        cleanArgs.filter.rating = { gte: toolArgs.filter.ratingMin }
    }

    if (Object.keys(cleanArgs.filter).length === 0) {
      cleanArgs.filter = undefined
    }

    console.log(JSON.stringify(cleanArgs, null, 2))

    results = await queryMovies({ args: cleanArgs })
  } catch (error) {
    console.error('Hybrid movie retrieval failure:', error)
    return 'Error: Failed to fetch matching entries from the movie database index.'
  }

  const formattedResults = results.map((result) => {
    const { metadata, data, score } = result
    return {
      ...metadata,
      description: data,
      rrfScore: score,
    }
  })

  return JSON.stringify(formattedResults, null, 2)
}
