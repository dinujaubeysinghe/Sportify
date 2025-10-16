import React from 'react';

const PageLayout = ({ 
  title, 
  description, 
  children, 
  showBackButton = false, 
  onBackClick,
  showFooter = true
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          {showBackButton && (
            <button
              onClick={onBackClick}
              className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-gray-600 mt-2">{description}</p>
          )}
        </div>

        {/* Main Content */}
        <main>
          {children}
        </main>
      </div>

      {/* Footer */}
      {showFooter && (
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-gray-500 text-sm">
              © 2025 Sportify. All rights reserved.
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default PageLayout;