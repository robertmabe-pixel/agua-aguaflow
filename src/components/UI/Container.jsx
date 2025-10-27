import React from 'react';
import PropTypes from 'prop-types';

const Container = ({ 
  children, 
  className = '', 
  maxWidth = 'xl',
  padding = true,
  ...props 
}) => {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md', 
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full'
  };

  const baseClasses = [
    'w-full',
    'mx-auto',
    maxWidthClasses[maxWidth],
    padding ? 'px-4 sm:px-6 lg:px-8' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={baseClasses}
      style={{
        backgroundColor: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        ...props.style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

Container.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  maxWidth: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl', 'full']),
  padding: PropTypes.bool
};

export default Container;
