import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error('Missing env.VITE_SUPABASE_URL');
if (!supabaseAnonKey) throw new Error('Missing env.VITE_SUPABASE_ANON_KEY');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to upload product images
export async function uploadProductImage(
  file: File,
  productId: string
): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}/${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Helper function to delete product images
export async function deleteProductImages(productId: string): Promise<void> {
  try {
    const { data: files, error: listError } = await supabase.storage
      .from('product-images')
      .list(productId);

    if (listError) throw listError;

    if (files && files.length > 0) {
      const filesToRemove = files.map(file => `${productId}/${file.name}`);
      
      const { error: deleteError } = await supabase.storage
        .from('product-images')
        .remove(filesToRemove);

      if (deleteError) throw deleteError;
    }
  } catch (error) {
    console.error('Error deleting images:', error);
    throw error;
  }
}