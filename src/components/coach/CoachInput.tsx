'use client';

import { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';

interface CoachInputProps {
  onSend: (message: string) => void;
  onUpload?: (file: File) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CoachInput({
  onSend,
  onUpload,
  placeholder = "Stel een vraag aan Iris...",
  disabled = false
}: CoachInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;

    onSend(input.trim());
    setInput('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white border-t border-gray-100">
      <div className="flex gap-3 items-center">
        {/* Upload Button (optional) */}
        {onUpload && (
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
              disabled={disabled}
            />
            <div className="w-11 h-11 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
              <Paperclip className="w-5 h-5 text-gray-600" />
            </div>
          </label>
        )}

        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-6 py-3 bg-gray-50 rounded-full
                     border-2 border-gray-200 focus:border-coral-400 focus:bg-white
                     focus:outline-none text-sm text-gray-900
                     placeholder:text-gray-400 transition-all
                     disabled:bg-gray-100 disabled:cursor-not-allowed"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="w-11 h-11 bg-coral-500 hover:bg-coral-600
                     disabled:bg-gray-300 disabled:cursor-not-allowed
                     rounded-full flex items-center justify-center
                     transition-all shadow-md hover:shadow-lg"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </form>
  );
}
