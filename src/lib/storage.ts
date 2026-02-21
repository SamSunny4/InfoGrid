import { S3Client, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const R2_ACCOUNT_ID   = process.env.R2_ACCOUNT_ID   as string;
const R2_ACCESS_KEY   = process.env.R2_ACCESS_KEY    as string;
const R2_SECRET_KEY   = process.env.R2_SECRET_KEY    as string;
const R2_BUCKET_NAME  = process.env.R2_BUCKET_NAME   as string;
// Optional: custom public domain (e.g. pub-xxx.r2.dev or your own domain)
const R2_PUBLIC_URL   = process.env.R2_PUBLIC_URL    as string;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY || !R2_SECRET_KEY || !R2_BUCKET_NAME) {
  throw new Error(
    "Please define R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET_KEY and R2_BUCKET_NAME in .env.local"
  );
}

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
});

/**
 * Upload a file buffer to Cloudflare R2 and return the public URL.
 * The bucket must have "Public access" enabled in the R2 dashboard,
 * or use a custom domain / Workers URL.
 */
export async function uploadToR2(
  buffer: Buffer,
  destination: string,
  mimeType: string
): Promise<string> {
  const upload = new Upload({
    client: r2Client,
    params: {
      Bucket: R2_BUCKET_NAME,
      Key: destination,
      Body: buffer,
      ContentType: mimeType,
    },
  });

  await upload.done();

  // Use the custom public URL if provided, otherwise fall back to the default R2 dev URL
  const base = R2_PUBLIC_URL
    ? R2_PUBLIC_URL.replace(/\/$/, "")
    : `https://pub-${R2_ACCOUNT_ID}.r2.dev`;

  return `${base}/${destination}`;
}

/**
 * Delete a file from Cloudflare R2 by its object key (destination).
 */
export async function deleteFromR2(destination: string): Promise<void> {
  if (!destination) return;

  // Check if the object exists before attempting deletion
  try {
    await r2Client.send(
      new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: destination })
    );
  } catch {
    return; // Object doesn't exist — nothing to delete
  }

  await r2Client.send(
    new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: destination })
  );
}

export { r2Client };

