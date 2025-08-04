import React, { useState } from 'react';
import Seo from '../components/Seo';
import api from '../services/api';
import { motion } from 'framer-motion';

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [feedbackMessage, setFeedbackMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const response = await api.post('/contact', formData);
            setStatus('success');
            setFeedbackMessage(response.data.message);
            setFormData({ name: '', email: '', message: '' });
        } catch (error: any) {
            setStatus('error');
            setFeedbackMessage(error.response?.data?.error || 'An unexpected error occurred.');
        }
    };

    return (
        <>
            <Seo title="Contact Us - Learn Villa" description="Get in touch with the Learn Villa team." />
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-xl mx-auto">
                    <h1 className="text-4xl font-extrabold text-center mb-4">Contact Us</h1>
                    <p className="text-center text-lg text-gray-600 dark:text-gray-400 mb-8">We'd love to hear from you! Send us a message below.</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                            <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                            <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                            <textarea name="message" id="message" rows={4} required value={formData.message} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                        </div>
                        <div>
                            <motion.button whileTap={{ scale: 0.95 }} type="submit" disabled={status === 'loading'} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400">
                                {status === 'loading' ? 'Sending...' : 'Send Message'}
                            </motion.button>
                        </div>
                    </form>
                    {status === 'success' && <p className="mt-4 text-center text-green-600">{feedbackMessage}</p>}
                    {status === 'error' && <p className="mt-4 text-center text-red-600">{feedbackMessage}</p>}
                </div>
            </div>
        </>
    );
};

export default ContactPage;