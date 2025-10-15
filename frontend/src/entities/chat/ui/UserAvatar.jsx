import React from "react";

export default function UserAvatar({ email, name, size = "md", isOnline = false }) {

  const getInitial = () => {
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    if (name) {
      return name.charAt(0).toUpperCase();
    }
    return "?";
  };


  const getBackgroundColor = () => {
    if (!email) return "bg-slate-400";

    const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-cyan-500",
    "bg-orange-500",
    "bg-teal-500"];



    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg"
  };

  return (
    <div className="relative">
      <div className={`
        ${sizeClasses[size]} 
        ${getBackgroundColor()} 
        rounded-full 
        flex 
        items-center 
        justify-center 
        text-white 
        font-semibold 
        shadow-sm
        select-none
      `}>
        {getInitial()}
      </div>
      
      {isOnline &&
      <div className={`
          absolute 
          -bottom-0.5 
          -right-0.5 
          w-3 
          h-3 
          bg-green-400 
          border-2 
          border-white 
          rounded-full
          ${size === 'sm' ? 'w-2.5 h-2.5' : ''}
          ${size === 'lg' || size === 'xl' ? 'w-4 h-4' : ''}
        `}></div>
      }
    </div>);

}