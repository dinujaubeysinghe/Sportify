import { Helmet } from 'react-helmet-async';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>About - Sportify</title>
        <meta name="description" content="About Sportify" />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">About</h1>
        <p className="text-gray-600">Sportify is an e-commerce platform for sports equipment and gear.</p>
      </div>
    </div>
  );
};

export default About;



