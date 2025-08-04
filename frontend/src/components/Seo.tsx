import React from 'react';
import { Helmet } from 'react-helmet';

interface SeoProps {
  title: string;
  description: string;
  keywords?: string;
}

const Seo: React.FC<SeoProps> = ({ title, description, keywords }) => {
  const defaultKeywords = 'digital courses, online learning, react, python, flask, learn villa';
  const siteName = 'Learn Villa';
  const fullTitle = `${title} | ${siteName}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      {/* Add more meta tags as needed, like og:image */}
    </Helmet>
  );
};

export default Seo;