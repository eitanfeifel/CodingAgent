import { Pinecone } from '@pinecone-database/pinecone';

// Initialize the Pinecone client
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY, // API key from environment variables
});

/**
 * Initialize the Pinecone index.
 * @returns The initialized Pinecone index.
 */
export async function initializePinecone() {
  const index = pc.index(process.env.PINECONE_INDEX_NAME); // Target the index specified in the environment
  return index;
}

/**
 * Upsert a code block embedding into Pinecone.
 * @param index - The Pinecone index instance.
 * @param namespace - The namespace to store the embedding.
 * @param id - Unique identifier for the embedding (e.g., "file-chunk-ID").
 * @param embedding - The vector embedding for the code block.
 * @param metadata - Metadata about the code block (e.g., filename, chunk content, line numbers).
 */
export async function upsertEmbedding(
  index: any, // Pinecone index instance; replace `any` with proper type if available
  namespace: string,
  id: string,
  embedding: number[],
  metadata: {
    chunk: string;
    filename: string;
    startLine?: number;
    endLine?: number;
  }
) {
  await index.namespace(namespace).upsert([
    {
      id,
      values: embedding,
      metadata,
    },
  ]);
}

/**
 * Query the Pinecone index for the most relevant embeddings.
 * @param index - The Pinecone index instance.
 * @param namespace - The namespace to query.
 * @param vector - The vector to search for similar embeddings.
 * @param topK - Number of most similar embeddings to return (default: 5).
 * @param filter - Optional filter for metadata-based queries.
 * @returns A list of matches from Pinecone.
 */

export async function queryEmbedding(
    index: any, // Pinecone index instance; replace `any` with proper type if available
    namespace: string,
    vector: number[],
    topK: number = 5,
    filter?: Record<string, any> // Make the filter optional
  ): Promise<PineconeMatch[]> {
    const queryOptions: any = {
      topK,
      vector,
      includeValues: true,
      includeMetadata: true,
    };
  
    // Add the namespace to the query
    const namespaceObj = index.namespace(namespace);
  
    // Include filter only if it has at least one key-value pair
    if (filter && Object.keys(filter).length > 0) {
      queryOptions.filter = filter;
    }
  
    const response = await namespaceObj.query(queryOptions);
    return response.matches || [];
  }
  

/**
 * Interface for Pinecone match results, tailored for code block embeddings.
 */
export interface PineconeMatch {
  id: string; // Unique identifier for the embedding (e.g., "file-chunk-ID").
  score: number; // Similarity score from the query.
  metadata: {
    chunk: string; // The actual code block or chunk.
    filename: string; // Name of the file the chunk belongs to.
    startLine?: number; // Start line number of the chunk in the file.
    endLine?: number; // End line number of the chunk in the file.
    [key: string]: any; // Allow additional dynamic metadata fields.
  };
}
