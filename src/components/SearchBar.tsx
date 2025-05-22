import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().min(1, 'Please enter a search term'),
  category: z.string().optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

export default function SearchBar() {
  const { register, handleSubmit } = useForm<SearchFormData>();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: SearchFormData) => {
    setIsLoading(true);
    try {
      // Implement search functionality
      console.log('Searching for:', data);
      window.location.href = `/search?q=${encodeURIComponent(data.query)}${data.category ? `&category=${data.category}` : ''}`;
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto">
      <div className="relative">
        <input
          type="text"
          {...register('query')}
          placeholder="Cari produk..."
          className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
        />
        <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Mencari...' : 'Cari'}
        </button>
      </div>
    </form>
  );
}