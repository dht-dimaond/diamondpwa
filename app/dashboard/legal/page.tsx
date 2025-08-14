'use client'
import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const LegalNotice = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode
        ? 'bg-gray-900 text-white'
        : 'bg-gray-50 text-gray-900'
    }`}>
      <header className="sticky top-0 z-10 border-b shadow-sm py-4 px-6 md:px-12 flex justify-between items-center bg-opacity-95 backdrop-blur-sm" 
        style={{ backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(249, 250, 251, 0.95)' }}>
        <h1 className="text-2xl font-bold">DiamondCorp International</h1>
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full ${
            isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-200 text-gray-800'
          }`}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Legal Notice</h1>
        
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Company Information</h2>
          <p className="mb-4">DiamondCorp International, Inc.</p>
          <p className="mb-4">123 Corporate Plaza, Suite 500<br />New York, NY 10001<br />United States</p>
          <p className="mb-4">Registered in the State of Delaware<br />Registration Number: DE 12345678</p>
          <p className="mb-4">Phone: +1 (212) 555-0123<br />Email: legaldiamondcorp@emailbind.com</p>
        </section>
        
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Legal Disclaimer</h2>
          <p className="mb-4">
            The information contained on this website is provided for general informational purposes only. All information on this website is provided in good faith, however, we make no representations or warranties of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on this website.
          </p>
          <p className="mb-4">
            Under no circumstances shall DiamondCorp International, Inc. have any liability to you for any loss or damage of any kind incurred as a result of the use of this website or reliance on any information provided on this website. Your use of this website and your reliance on any information on this website is solely at your own risk.
          </p>
        </section>
        
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Intellectual Property Rights</h2>
          <p className="mb-4">
            Unless otherwise stated, DiamondCorp International, Inc. and/or its licensors own the intellectual property rights for all material on this website. All intellectual property rights are reserved.
          </p>
          <p className="mb-4">
            You may view and/or print pages from this website for your own personal use subject to restrictions set in these terms and conditions.
          </p>
          <p className="mb-4">You must not:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Republish material from this website</li>
            <li>Sell, rent, or sub-license material from this website</li>
            <li>Reproduce, duplicate, or copy material from this website</li>
            <li>Redistribute content from this website</li>
          </ul>
        </section>
        
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Trademarks</h2>
          <p className="mb-4">
            DiamondCorp™, the DiamondCorp logo, and all related names, logos, product and service names, designs, and slogans are trademarks of DiamondCorp International, Inc. or its affiliates. You must not use such marks without the prior written permission of DiamondCorp International, Inc. All other names, logos, product and service names, designs, and slogans on this website are the trademarks of their respective owners.
          </p>
        </section>
        
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">External Links Disclaimer</h2>
          <p className="mb-4">
            This website may contain links to external websites that are not provided or maintained by or in any way affiliated with DiamondCorp International, Inc. Please note that DiamondCorp International, Inc. does not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
          </p>
        </section>
        
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
          <p className="mb-4">
            These terms and conditions are governed by and construed in accordance with the laws of the State of New York and you irrevocably submit to the exclusive jurisdiction of the courts in that State.
          </p>
        </section>
        
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Changes to This Legal Notice</h2>
          <p className="mb-4">
            DiamondCorp International, Inc. reserves the right to make changes to this Legal Notice at any time. We encourage visitors to frequently check this page for any changes. Your continued use of this website after any changes to this Legal Notice will constitute your acceptance of such changes.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p className="mb-4">
            If you have any questions about this Legal Notice, please contact us at:<br />
            legaldiamondcorp@emailbind.com<br />
            DiamondCorp International, Inc.<br />
            Attn: Legal Department<br />
            123 Corporate Plaza, Suite 500<br />
            New York, NY 10001
          </p>
        </section>
        
        <div className="mt-12 pt-6 border-t">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} DiamondCorp International, Inc. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
};

export default LegalNotice;