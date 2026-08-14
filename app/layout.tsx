import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IMS - Inventory Management System',
  description: 'Smart inventory for fabrication & construction',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
