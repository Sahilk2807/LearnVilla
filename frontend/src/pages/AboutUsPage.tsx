import React from 'react';
import Seo from '../components/Seo';

const AboutUsPage: React.FC = () => {
  return (
    <>
      <Seo
        title="About Learn Villa"
        description="Learn about our mission to provide high-quality, ad-free digital education."
      />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">About Learn Villa</h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Our mission is to create a focused, premium learning environment free from distractions.
          </p>
        </div>
        <div className="mt-12 max-w-3xl mx-auto space-y-6 text-lg text-gray-700 dark:text-gray-300">
            <p>Learn Villa was founded on a simple principle: learning should be accessible, engaging, and respectful of the user's time and focus. In a digital world cluttered with ads and interruptions, we decided to build a sanctuary for learners.</p>
            <p>We are a small, passionate team of educators and developers dedicated to curating and creating the highest quality digital courses. Our platform is built on modern technology (React and Python) to ensure a fast, reliable, and secure experience on any device.</p>
            <p>We believe that education is a right, not a vehicle for advertising revenue. That's why Learn Villa will always be 100% ad-free. We focus on providing value through exceptional content, allowing you to focus on what truly matters: gaining new skills and knowledge.</p>
            <p>Thank you for being part of our community.</p>
        </div>
      </div>
    </>
  );
};

export default AboutUsPage;
