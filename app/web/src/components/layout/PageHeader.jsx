import React from 'react';
import { Helmet } from 'react-helmet-async';

const PageHeader = ({ 
  title, 
  description, 
  children, 
  showBackButton = false, 
  onBackClick,
  className = ""
}) => {
  return (
    <>
      <Helmet>
        <title>{title} - Sportify Admin</title>
        <meta name="description" content={description || `Manage ${title.toLowerCase()} in Sportify admin panel.`} />
      </Helmet>

      {/* Header */}
      <div className={`mb-8 ${className}`}>
        <div className="flex items-center gap-4">
          {showBackButton && (
            <button
              onClick={onBackClick}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {description && (
              <p className="text-gray-600 mt-2">{description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {children}
    </>
  );
};

export default PageHeader;
