import { useState, useEffect } from "react";

interface TextAreaInputProps {
  value: string;
  onChange: (value: string) => void;
  minChars: number;
  maxChars: number;
}

export default function TextAreaInput({ value, onChange, minChars = 1000, maxChars = 10000 }: TextAreaInputProps) {
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setCharCount(value.length);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const getCounterColor = () => {
    if (charCount < minChars) return "text-red-500 dark:text-red-400";
    if (charCount > maxChars) return "text-red-500 dark:text-red-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Paste your text here..."
        className="w-full min-h-[300px] p-4 border rounded-md resize-y 
                  border-neutral-300 dark:border-neutral-700
                  bg-white dark:bg-neutral-900
                  text-neutral-900 dark:text-neutral-100
                  focus:ring-2 focus:ring-neutral-500 focus:outline-none"
        data-testid="source-text-input"
      />

      <div className="flex justify-end">
        <span className={`text-sm font-medium ${getCounterColor()}`}>
          {charCount.toLocaleString()} / {minChars.toLocaleString()}-{maxChars.toLocaleString()} characters
          {charCount < minChars && " (need more)"}
          {charCount > maxChars && " (too many)"}
        </span>
      </div>
    </div>
  );
}
