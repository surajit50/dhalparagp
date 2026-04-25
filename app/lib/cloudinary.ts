import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file: string, folder: string = 'warish_documents') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'auto',
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload document');
  }
};

export const deleteFromCloudinary = async (publicIds: string[]) => {
  try {
    const results = await Promise.allSettled(
      publicIds.map(public_id => cloudinary.uploader.destroy(public_id))
    );

    const errors = results.filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    );

    if (errors.length > 0) {
      throw new AggregateError(
        errors,
        `Failed to delete ${errors.length}/${publicIds.length} files`
      );
    }

    return results;
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw new Error('Partial or complete failure deleting files');
  }
};