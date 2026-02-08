import React, { useState } from "react";

export function Input({ type = "text", name = "", placeholder = "", label = "", value, onChange }) {
    const [isSelected, setIsSelected] = useState(false);

    const handleSelect = () => setIsSelected(true);
    const handleFocus = () => setIsSelected(true);
    const handleBlur = () => setIsSelected(false);

    return (
        <div className="p-3">
            {label && (
                <label htmlFor={name} className="block text-sm/6 text-black font-comfortaa">
                    {label}
                </label>
            )}
            <input
                id={name}
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onSelect={handleSelect}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={`outline-none border-b-2 w-full transition-colors duration-300 ${
                    isSelected ? "border-b-customRed" : "border-b-customeGray"
                }`}
            />
        </div>
    );
}
