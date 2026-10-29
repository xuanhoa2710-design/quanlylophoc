import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative flex-shrink-0 ${sizeMap[size]}`}>
        {/* SVG badge matching 12A7 THPT Vĩnh Lộc B emblem */}
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
          {/* Outer ring */}
          <circle cx="100" cy="100" r="95" fill="#ffffff" stroke="#1e3a8a" strokeWidth="5" />
          <circle cx="100" cy="100" r="88" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Slogan Top Arc */}
          <path id="curveTop" d="M 30,100 A 70,70 0 0,1 170,100" fill="none" />
          <text fontSize="8" fontWeight="800" fill="#1e3a8a" letterSpacing="2">
            <textPath href="#curveTop" startOffset="50%" textAnchor="middle">
              DREAM BIG AND DARE TO FAIL
            </textPath>
          </text>

          {/* Golden Star at peak */}
          <polygon
            points="100,28 103,37 112,37 105,42 108,51 100,46 92,51 95,42 88,37 97,37"
            fill="#f59e0b"
          />

          {/* Mountain peaks */}
          <polygon points="100,48 118,65 82,65" fill="#1e3a8a" opacity="0.85" />
          <polygon points="112,56 128,68 96,68" fill="#3b82f6" opacity="0.75" />

          {/* Main 12A7 Branding */}
          <text x="74" y="96" fontSize="28" fontWeight="900" fill="#1e3a8a" textAnchor="middle" fontFamily="sans-serif">
            12
          </text>
          <text x="122" y="96" fontSize="30" fontWeight="900" fill="#f59e0b" textAnchor="middle" fontFamily="sans-serif">
            A7
          </text>

          {/* Students silhouette joining hands */}
          <g fill="#1e3a8a" transform="translate(48, 100) scale(0.52)">
            <circle cx="20" cy="10" r="7" />
            <circle cx="50" cy="8" r="8" />
            <circle cx="100" cy="5" r="9" />
            <circle cx="150" cy="8" r="8" />
            <circle cx="180" cy="10" r="7" />
            <path d="M 5,35 Q 20,20 35,28 Q 50,18 70,25 Q 100,15 130,25 Q 150,18 165,28 Q 180,20 195,35 L 185,45 Q 150,32 100,32 Q 50,32 15,45 Z" />
          </g>

          {/* Open Book */}
          <path
            d="M 60,128 Q 100,120 100,132 Q 100,120 140,128 Q 100,124 100,136 Q 100,124 60,128 Z"
            fill="#f59e0b"
          />

          {/* Sub banner text */}
          <text x="100" y="142" fontSize="5.5" fontWeight="700" fill="#1e3a8a" textAnchor="middle">
            ĐOÀN KẾT • CÙNG TIẾN BỘ • YÊU THƯƠNG
          </text>

          {/* Dark Ribbon: QUYẾT TÂM ĐẬU TN & ĐH 100% */}
          <rect x="30" y="146" width="140" height="13" rx="3" fill="#1e3a8a" />
          <text x="100" y="155" fontSize="6.5" fontWeight="800" fill="#ffffff" textAnchor="middle">
            QUYẾT TÂM ĐẬU TN & ĐH <tspan fill="#f59e0b">100%</tspan>
          </text>

          {/* School Name and Year */}
          <text x="100" y="172" fontSize="9" fontWeight="900" fill="#1e3a8a" textAnchor="middle" letterSpacing="0.5">
            THPT VĨNH LỘC B
          </text>
          <text x="100" y="184" fontSize="7" fontWeight="700" fill="#f59e0b" textAnchor="middle">
            🎓 2026 - 2027
          </text>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-extrabold tracking-tight text-blue-900">A7</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
              Lớp Học Hạnh Phúc
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">THPT Vĩnh Lộc B • Năm học 2026 - 2027</span>
          <span className="text-[10px] text-blue-700 italic font-semibold">"Dream Big And Dare To Fail"</span>
        </div>
      )}
    </div>
  );
};
