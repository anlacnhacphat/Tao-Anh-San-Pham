
import React from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  image: string | null;
  onUpload: (base64: string) => void;
  onClear: () => void;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, image, onUpload, onClear, className = "" }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative group">
        {image ? (
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <img src={image} alt="Preview" className="h-full w-full object-contain" />
            <button
              onClick={onClear}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 shadow-md"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white transition-colors hover:border-blue-400 hover:bg-blue-50">
            <div className="flex flex-col items-center justify-center pb-6 pt-5">
              <Upload className="mb-3 h-8 w-8 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click để tải lên</span>
              </p>
              <p className="text-xs text-gray-400">PNG, JPG hoặc JPEG</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleChange} />
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
