import { Storage } from "@google-cloud/storage";

const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME as string;
const GCS_PROJECT_ID = process.env.GCS_PROJECT_ID as string;
const GCS_KEY_FILENAME = process.env.GCS_KEY_FILENAME; // path to service account JSON

if (!GCS_BUCKET_NAME || !GCS_PROJECT_ID) {
  throw new Error(
    "Please define GCS_BUCKET_NAME and GCS_PROJECT_ID in .env.local"
  );
}

// Initialise the GCS client.
// When deploying to GCP (Cloud Run / App Engine) the SDK picks up credentials
// automatically via Application Default Credentials. On a local machine, point
// GCS_KEY_FILENAME to your service‑account JSON file.
const storage = new Storage({
  projectId: GCS_PROJECT_ID,
  ...(GCS_KEY_FILENAME ? { keyFilename: GCS_KEY_FILENAME } : {}),
});

const bucket = storage.bucket(GCS_BUCKET_NAME);

/**
 * Upload a file buffer to GCS and return the public URL.
 * The bucket must have "Uniform bucket-level access" turned on and
 * must have a public IAM binding (roles/storage.objectViewer for allUsers)
 * OR you can generate a signed URL instead.
 */
export async function uploadToGCS(
  buffer: Buffer,
  destination: string,
  mimeType: string
): Promise<string> {
  const file = bucket.file(destination);

  await file.save(buffer, {
    metadata: { contentType: mimeType },
    resumable: false,
  });

  // Make the file publicly readable
  await file.makePublic();

  return `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${destination}`;
}

/**
 * Delete a file from GCS by its storage path (destination).
 */
export async function deleteFromGCS(destination: string): Promise<void> {
  const file = bucket.file(destination);
  const [exists] = await file.exists();
  if (exists) await file.delete();
}

export { bucket, storage };
