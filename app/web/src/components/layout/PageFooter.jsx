import React from 'react';

const PageFooter = ({ 
  children,
  className = ""
}) => {
  return (
    <footer className={`bg-white border-t border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <img 
              src="/SportifyLogo.png" 
              alt="Sportify" 
              className="h-8 w-auto"
            />
            <span className="text-gray-600 text-sm">
              © 2025 Sportify. All rights reserved.
            </span>
          </div>
          
          <div className="flex items-center space-x-6">
            {children}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
            <div className="flex space-x-6 mb-2 sm:mb-0">
              <a href="/privacy" className="hover:text-gray-700 transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-gray-700 transition-colors">
                Terms of Service
              </a>
              <a href="/support" className="hover:text-gray-700 transition-colors">
                Support
              </a>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>Version 1.0.0</span>
              <span className="text-gray-300">•</span>
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;
