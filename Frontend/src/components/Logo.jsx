import React from 'react';

const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img 
        src="/logo.png" 
        alt="Repuestos MP" 
        className={sizeClasses[size]}
      />
      {showText && (
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          Repuestos MP
        </span>
      )}
    </div>
  );
};

export default Logo;
