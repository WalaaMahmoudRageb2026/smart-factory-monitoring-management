import React from 'react';
import factoryIcon from '../../assets/images/factory_brand_icon_1788442721992.jpg';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withGlow?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  withGlow = true
}) => {
  const sizeMap = {
    sm: { box: 'w-8 h-8 rounded-xl', img: 'w-8 h-8 rounded-xl', glow: 'blur-xs' },
    md: { box: 'w-10 h-10 rounded-2xl', img: 'w-10 h-10 rounded-2xl', glow: 'blur-sm' },
    lg: { box: 'w-14 h-14 rounded-[1.25rem]', img: 'w-14 h-14 rounded-[1.25rem]', glow: 'blur-md' },
    xl: { box: 'w-20 h-20 rounded-[1.75rem]', img: 'w-20 h-20 rounded-[1.75rem]', glow: 'blur-lg' }
  };

  const current = sizeMap[size];

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${current.box} ${className}`}>
      {withGlow && (
        <div
          className={`absolute -inset-0.5 bg-gradient-to-tr from-teal-500/30 via-indigo-500/30 to-emerald-400/30 rounded-2xl ${current.glow} opacity-60 dark:opacity-40 pointer-events-none transition-opacity`}
        />
      )}
      <div className={`relative overflow-hidden border border-slate-200/80 dark:border-slate-700/60 shadow-xs bg-slate-900 ${current.box}`}>
        <img
          src={factoryIcon}
          alt="Smart Factory OS Icon"
          className={`w-full h-full object-cover select-none transition-transform duration-300 hover:scale-105`}
          referrerPolicy="no-referrer"
          loading="eager"
        />
      </div>
    </div>
  );
};
