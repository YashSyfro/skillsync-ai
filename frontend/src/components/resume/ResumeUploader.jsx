import { useRef, useState } from "react";

/**
 * Handles file selection via click OR drag-and-drop.
 *
 * Props:
 *   onFileSelect(file: File) — called when a valid PDF is chosen
 *   selectedFile: File | null — currently selected file (for display)
 *   disabled: bool — disables interaction while uploading
 */
export default function ResumeUploader({ onFileSelect, selectedFile, disabled }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File must be under 5MB.");
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragOver(false)}
      className={`
        border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
        ${isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${selectedFile ? "bg-green-50 border-green-400" : "bg-gray-50"}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
        disabled={disabled}
      />

      {selectedFile ? (
        <div className="space-y-1">
          <div className="text-green-600 text-2xl">✓</div>
          <p className="font-medium text-gray-800">{selectedFile.name}</p>
          <p className="text-sm text-gray-500">
            {(selectedFile.size / 1024).toFixed(0)} KB · Click to change
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-gray-400 text-3xl">📄</div>
          <p className="font-medium text-gray-700">Drop your resume here</p>
          <p className="text-sm text-gray-400">or click to browse · PDF only · max 5MB</p>
        </div>
      )}
    </div>
  );
}
