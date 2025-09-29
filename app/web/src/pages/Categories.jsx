import { Helmet } from 'react-helmet-async';

const Categories = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Categories - Sportify</title>
        <meta name="description" content="Browse product categories on Sportify" />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Categories</h1>
        <p className="text-gray-600">This page will list product categories. Use the Products page filters for now.</p>
      </div>
    </div>
  );
};

export default Categories;



