/**
 * Client utility for handling batch PDF generation
 */
export async function generateCertificates(workIds: string[]): Promise<Blob> {
  // For large batches, we'll process in chunks
  const BATCH_SIZE = 5
  const totalBatches = Math.ceil(workIds.length / BATCH_SIZE)

  if (workIds.length <= BATCH_SIZE) {
    // Small batch - process directly
    const response = await fetch("/api/generate-certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workIds }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to generate certificates")
    }

    return await response.blob()
  } else {
    // Large batch - implement client-side batching
    const processedPdfs: Blob[] = []

    for (let i = 0; i < totalBatches; i++) {
      const batchIds = workIds.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)
      const batchProgress = Math.round(((i + 1) / totalBatches) * 100)

      // You could update UI with progress here
      console.log(`Processing batch ${i + 1}/${totalBatches} (${batchProgress}%)`)

      const response = await fetch("/api/generate-certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workIds: batchIds }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `Failed to generate batch ${i + 1}`)
      }

      processedPdfs.push(await response.blob())
    }

    // In a real implementation, you would merge PDFs here
    // For simplicity, we'll just return the last batch
    return processedPdfs[processedPdfs.length - 1]
  }
}
