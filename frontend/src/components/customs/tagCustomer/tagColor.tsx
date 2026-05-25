import React from "react";

type TagColorPickerProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

const presetColors = [
  { color: "Red", value: "#CC0033" },
  { color: "Orange", value: "#FF6633" },
  { color: "Yellow", value: "#FFCC33" },
  { color: "Green", value: "#33CC66" },
  { color: "Light Blue", value: "#33CCFF" },
  { color: "Blue", value: "#0033FF" },
  { color: "Purple", value: "#6633FF" },
  { color: "Pink", value: "#FF99FF" },
  { color: "Gray", value: "#778899" },
];

const ColorPicker: React.FC<TagColorPickerProps> = ({ value, onChange, label = "Tag Color" }) => {
  return (
    <div className="flex items-center gap-4">
      <span className="text-md me-2">{label}</span>
      <div className="flex gap-2">
        {presetColors.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`w-6 h-6 border-2 transition-all duration-200 ${
              value === option.value ? "ring-2 ring-offset-1 ring-main" : "border-gray-300"
            }`}
            style={{ backgroundColor: option.value }}
            aria-label={option.color}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
