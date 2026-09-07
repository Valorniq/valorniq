import React, { useState, useEffect } from 'react';
import { RotateCw, Check, AlertTriangle } from 'lucide-react';

interface AuthCaptchaProps {
  onVerify: (isValid: boolean) => void;
  isDark: boolean;
  id?: string;
}

export default function AuthCaptcha({ onVerify, isDark, id = "captcha-verification" }: AuthCaptchaProps) {
  const [captchaCode, setCaptchaCode] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setUserInput('');
    setIsVerified(null);
    onVerify(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);
    const isValid = val === captchaCode;
    setIsVerified(val.length >= captchaCode.length ? isValid : null);
    onVerify(isValid);
  };

  const lines = [
    { x1: '5%', y1: '20%', x2: '95%', y2: '80%', color: 'stroke-rose-400/30' },
    { x1: '10%', y1: '75%', x2: '90%', y2: '25%', color: 'stroke-indigo-400/30' },
    { x1: '20%', y1: '10%', x2: '80%', y2: '90%', color: 'stroke-emerald-400/35' },
    { x1: '5%', y1: '50%', x2: '95%', y2: '45%', color: 'stroke-blue-400/40' },
  ];

  return (
    <div id={id} className={`p-4 rounded-xl border ${isDark ? 'bg-[#0F0F0F] border-[#222]' : 'bg-gray-50 border-gray-150'} space-y-3`}>
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase font-bold tracking-wider text-[#666]">
          Security Verification CAPTCHA
        </label>
        <button
          type="button"
          onClick={generateCaptcha}
          className="p-1 rounded hover:bg-[#1A1A1A] text-[#666] hover:text-white transition cursor-pointer"
          title="Refresh Captcha"
        >
          <RotateCw className="h-3 w-3" />
        </button>
      </div>

      <div className="relative h-14 rounded-lg bg-[#141414] border border-[#222] overflow-hidden select-none flex items-center justify-center">
        <div className="absolute inset-0 opacity-15 grid grid-cols-6 grid-rows-3 pointer-events-none">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-[#333]"></div>
          ))}
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {lines.map((line, idx) => (
            <line
              key={idx}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              className={`${line.color} stroke-[1.5]`}
            />
          ))}
        </svg>

        <div className="flex items-center space-x-2 font-mono text-lg tracking-widest select-none relative z-10">
          {captchaCode.split('').map((char, index) => {
            const rotations = ['-rotate-12', '-rotate-6', 'rotate-0', 'rotate-6', 'rotate-12', '-rotate-3', 'rotate-3'];
            const rot = rotations[index % rotations.length];
            const colors = [
              'text-indigo-600 dark:text-indigo-400',
              'text-emerald-600 dark:text-emerald-400',
              'text-rose-600 dark:text-rose-400',
              'text-amber-600 dark:text-amber-400',
              'text-blue-600 dark:text-blue-400',
              'text-purple-600 dark:text-purple-400'
            ];
            const color = colors[index % colors.length];

            return (
              <span
                key={index}
                className={`inline-block transform ${rot} ${color} font-bold text-base md:text-lg`}
                style={{
                  textShadow: isDark ? '1px 1px 1px rgba(0,0,0,0.6)' : '1px 1px 1px rgba(255,255,255,0.8)',
                  userSelect: 'none'
                }}
              >
                {char}
              </span>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Type the CAPTCHA characters"
          value={userInput}
          onChange={handleInputChange}
          className={`w-full p-2.5 rounded-lg text-center font-mono tracking-widest text-sm font-bold border focus:outline-none focus:border-indigo-500 transition-colors ${
            isDark ? 'bg-[#141414] border-[#222] text-white placeholder-[#555]' : 'bg-white border-gray-200 text-gray-800'
          }`}
          required
        />
        <div className="absolute right-3.5 top-3 flex items-center">
          {isVerified === true && (
            <Check className="h-4 w-4 text-emerald-500" />
          )}
          {isVerified === false && userInput.length >= captchaCode.length && (
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          )}
        </div>
      </div>
      <p className="text-[9px] text-gray-400 text-center leading-tight">
        Case sensitive. Characters prevent automated bot entries.
      </p>
    </div>
  );
}
