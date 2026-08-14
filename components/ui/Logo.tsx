import Link from 'next/link';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`}>
      <div className="relative">
        <svg 
          width="40" 
          height="40" 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0"
        >
          {/* Background shape */}
          <rect x="2" y="2" width="36" height="36" rx="8" fill="url(#logoGradient)" />
          
          {/* I letter */}
          <text 
            x="20" 
            y="27" 
            textAnchor="middle" 
            fontSize="22" 
            fontWeight="bold" 
            fill="white"
            fontFamily="Inter, system-ui, sans-serif"
          >
            I
          </text>
          
          {/* Decorative line */}
          <line x1="10" y1="32" x2="30" y2="32" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          
          {/* Gradients */}
          <defs>
            <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        IMS
      </span>
    </Link>
  );
}
