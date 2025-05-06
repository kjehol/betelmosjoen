import React from "react";

export default function Layout({ children }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-8 pb-28 sm:pb-8">
      {children}
    </div>
  );
}
