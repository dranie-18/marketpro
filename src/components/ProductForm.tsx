import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import slugify from 'slugify';

const productSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  price: z.number().min(0, 'Harga tidak boleh negatif'),
  condition: z.enum(['new', 'used']),
  category: z.string().min(1, 'Pilih kategori'),
  location: z.string().min(3, 'Lokasi minimal 3 karakter'),
});

type ProductFormData = z.infer<typeof productSchema>;

const categories = [
  'Properti',
  'Kendaraan',
  'Elektronik',
  'Fashion',
  'Hobi & Olahraga',
  'Rumah Tangga',
];

export default function ProductForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProductFormData>();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      alert('Maksimal 5 foto');
      return;
    }
    setImages(files);
  };

  const uploadImages = async (productId: string) => {
    const uploadedUrls: string[] = [];

    for (const [index, image] of images.entries()) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${productId}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('product-images')
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
      setUploadProgress(((index + 1) / images.length) * 100);
    }

    return uploadedUrls;
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    setError('');
    setUploadProgress(0);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Silakan login terlebih dahulu');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      if (profileError) throw profileError;

      const slug = slugify(data.title, { lower: true, strict: true });

      // Insert product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          title: data.title,
          slug,
          description: data.description,
          price: data.price,
          condition: data.condition,
          category: data.category,
          location: data.location,
          seller_id: profile.id,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Upload images if any
      if (images.length > 0) {
        const imageUrls = await uploadImages(product.id);
        
        // Insert image records
        const { error: imageError } = await supabase
          .from('product_images')
          .insert(
            imageUrls.map(url => ({
              product_id: product.id,
              url
            }))
          );

        if (imageError) throw imageError;
      }

      reset();
      setImages([]);
      alert('Iklan berhasil dipasang!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Kategori
        </label>
        <select
          id="category"
          {...register('category')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Pilih Kategori</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Judul Iklan
        </label>
        <input
          type="text"
          id="title"
          {...register('title')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Deskripsi
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={6}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Harga
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">Rp</span>
          </div>
          <input
            type="number"
            id="price"
            {...register('price', { valueAsNumber: true })}
            className="pl-12 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        {errors.price && (
          <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
          Kondisi
        </label>
        <select
          id="condition"
          {...register('condition')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="new">Baru</option>
          <option value="used">Bekas</option>
        </select>
        {errors.condition && (
          <p className="mt-1 text-sm text-red-500">{errors.condition.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Lokasi
        </label>
        <input
          type="text"
          id="location"
          {...register('location')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-500">{errors.location.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Foto Produk (Maksimal 5 foto)
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <div className="flex text-sm text-gray-600">
              <label htmlFor="images" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                <span>Upload foto</span>
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>
              <p className="pl-1">atau drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF sampai 10MB
            </p>
            {images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  {images.length} foto dipilih
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {uploadProgress > 0 && (
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
            <div
              style={{ width: `${uploadProgress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Memproses...' : 'Pasang Iklan'}
      </button>
    </form>
  );
}