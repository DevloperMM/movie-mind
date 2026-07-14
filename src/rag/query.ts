import 'dotenv/config'

import { FusionAlgorithm, Index as UpstashIndex } from '@upstash/vector'

const index = new UpstashIndex({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
})

/**
 * Namespaces provide a way to logically separate data within the same index.
 * This is useful when you want to have multiple isolated datasets (e.g., per user or per project)
 * but keep them under the same vector index for efficiency.
 * By specifying a namespace (such as `index.namespace(userId)`),
 * you can ensure that queries, inserts, and updates only affect the data associated with that specific namespace.
 */

// Example
/**
 * const userId = "<USER_ID>";
 * const userNamespace = index.namespace(userId);
 *
 * // Insert a vector into the user's namespace (using either vector or text data):
 * await userNamespace.upsert([
 *   {
 *     id: "<VECTOR_ID>",
 *     data: "<VECTOR_TEXT_OR_DATA>",
 *     metadata: {}
 *   }
 * ]);
 *
 * // Query vectors within the user's namespace (using either a vector or text data):
 * const results = await userNamespace.query({
 *   vector: [], // your query vector (optional)
 *   data: "",   // your query as text (optional)
 *   topK: 5
 * });
 *
 * console.log(results);
 */

// Partial<Type> is a TypeScript utility type that makes all properties of Type optional.
// For example:
// type MovieMetadata = { title: string; year: number; genre: string }
// type PartialMovie = Partial<MovieMetadata>
// This allows: const movie: PartialMovie = { title: "Inception" } // year and genre are optional

export interface QueryMoviesArgs {
  query: string
  filter?: Record<string, any>
  sort?: { field: string; order: 'asc' | 'desc' }
}

export const queryMovies = async ({ args }: { args: QueryMoviesArgs }) => {
  const { query, filter, sort } = args

  // 1. Build Upstash SQL-like Metadata Filter String safely for numbers
  let filterString = ''
  if (filter && Object.keys(filter).length > 0) {
    const conditions: string[] = []

    for (const [key, value] of Object.entries(filter)) {
      if (value === null || value === undefined) continue

      if (typeof value === 'object') {
        for (const [operator, val] of Object.entries(value)) {
          if (val === null || val === undefined) continue
          const opMap: Record<string, string> = {
            gte: '>=',
            gt: '>',
            lte: '<=',
            lt: '<',
            eq: '=',
          }
          const resolvedOp = opMap[operator] || '='
          conditions.push(`${key} ${resolvedOp} ${val}`)
        }
      } else {
        conditions.push(`${key} = ${value}`)
      }
    }

    filterString = conditions.join(' AND ')
  }

  // 2. Query using Hybrid Search
  // Fusing dense vectors and sparse text vectors lets keywords like "Nolan" and "sci-fi" pull the correct documents instantly.
  const response = await index.query({
    data: query || '*',
    topK: 50,
    includeMetadata: true,
    includeData: true,
    fusionAlgorithm: FusionAlgorithm.RRF,
    filter: filterString || undefined,
  })

  // 3. Post-Retrieval Sorting
  let finalResults = [...response]
  if (sort && sort.field) {
    finalResults.sort((a, b) => {
      const fieldA = (a.metadata as any)?.[sort.field] ?? 0
      const fieldB = (b.metadata as any)?.[sort.field] ?? 0
      return sort.order === 'desc' ? fieldB - fieldA : fieldA - fieldB
    })
  }

  return finalResults.slice(0, 5)
}
