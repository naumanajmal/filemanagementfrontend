import React from "react";

export const Alert = ({ variant = "default", className = "", children }) => {
  const variantClasses =
    variant === "destructive"
      ? "bg-red-50 border-red-500 text-red-700"
      : "bg-gray-50 border-gray-300 text-gray-700";

  return (
    <div
      className={`border-l-4 p-4 rounded-md ${variantClasses} ${className}`}
    >
      {children}
    </div>
  );
};

export const AlertDescription = ({ children }) => {
  return <p className="text-sm">{children}</p>;
};
