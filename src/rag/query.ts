import 'dotenv/config'

import { Index as UpstashIndex } from '@upstash/vector'

const index = new UpstashIndex({})

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

type MovieMetadata = {
  title: string
  year: string
  genre: string
  director: string
  actors: string
  rating: string
  votes: string
  revenue: string
  metascore: string
}

export const queryMovies = async ({
  query,
  filters,
  topK = 5,
}: {
  query: string
  // Partial lets callers pass only the metadata fields they want to filter by.
  // By keeping the MovieMetadata type strict, the core definition of a movie remains consistent across the codebase.
  // When we need to allow flexibility (like passing only certain filters), we use Partial<MovieMetadata> just for that purpose.
  // This avoids accidentally making all movie objects loosely typed everywhere, which helps maintain type safety.
  filters?: Partial<MovieMetadata>
  topK?: number
}) => {
  // Build filter string if filters provided
  /**
   * let filterStr = ''
   * if (filters && Object.keys(filters).length > 0) {
   *   const filterParts = Object.entries(filters)
   *     .filter(([_, value]) => value !== undefined && value !== '')
   *     .map(
   *       ([key, value]) =>
   *         typeof value === 'number'
   *           ? `${key}=${value}`
   *           : `${key}='${String(value).replace(/'/g, "\\'")}'`,
   *     )
   *
   *   if (filterParts.length > 0) {
   *     filterStr = filterParts.join(' AND ')
   *   }
   * }
   */

  const results = await index.query({
    data: query,
    topK,
    // filter: filterStr,
    includeData: true,
    includeMetadata: true,
  })

  return results
}
