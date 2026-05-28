"use client";

import { UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const acceptedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png"
];

type Props = {
  fileName: string;
  onFileSelect: (fileName: string, fileUrl: string) => void;
  onClear: () => void;
};

export function FileUpload({ fileName, onFileSelect, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState("");

  function validateAndSet(file: File) {
    setError("");

    if (!acceptedTypes.includes(file.type)) {
      setError("Only PDF, JPEG, and PNG files are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 10MB.");
      return;
    }

    const localUrl = `local-file://${file.name}`;
    onFileSelect(file.name, localUrl);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();

    const file = event.dataTransfer.files?.[0];

    if (file) {
      validateAndSet(file);
    }
  }

  function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      validateAndSet(file);
    }
  }

  return (
    <div>
      <div
        onDragOver={event => event.preventDefault()}
        onDrop={handleDrop}
        className="rounded-[28px] border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center transition hover:border-[#f8b84e] hover:bg-white"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleInput}
        />

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
          <UploadCloud size={28} />
        </div>

        <p className="text-base font-black text-slate-950">
          Choose a file or drag & drop it here
        </p>

        <p className="mt-2 text-sm text-slate-500">
          JPEG, PNG, PDF up to 10MB
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-5 rounded-2xl bg-black px-5 py-3 text-sm font-bold text-white"
        >
          Browse Files
        </button>
      </div>

      {fileName && (
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm shadow-sm">
          <span className="font-semibold text-slate-700">{fileName}</span>
          <button
            type="button"
            onClick={onClear}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm font-semibold text-red-500">{error}</p>
      )}
    </div>
  );
}
