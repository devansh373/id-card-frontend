'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCcw, 
  Download, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight,
  Printer,
  ShieldCheck,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { IDCardPreview } from '../services/id-card-service';

interface CardPreviewProps {
  card: IDCardPreview;
  onDownload?: () => void;
  className?: string;
}

export function CardPreview({ card, onDownload, className }: CardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const decX = (y - centerY) / (rect.height / 2);
    const decY = (centerX - x) / (rect.width / 2);
    
    setRotateX(decX * 10);
    setRotateY(decY * 10);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      {/* 3D Card Container */}
      <div 
        className="perspective-[1200px] relative w-[320px] h-[500px] cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full relative preserve-3d"
          initial={false}
          animate={{ 
            rotateX: rotateX,
            rotateY: (isFlipped ? 180 : 0) + rotateY
          }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            rotateY: { duration: 0.6 }
          }}
        >
          {/* Front Side */}
          <div 
            className="absolute inset-0 w-full h-full backface-hidden rounded-[24px] shadow-2xl border-4 border-white/20 overflow-hidden bg-slate-100"
          >
            {card.frontUrl ? (
              <img 
                src={card.frontUrl} 
                alt="ID Card Front" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-50 to-slate-200 text-slate-400 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                   <Building className="w-8 h-8 opacity-50" />
                </div>
                <div>
                   <p className="font-semibold text-slate-500">Front Preview Unavailable</p>
                   <p className="text-xs">ID card has not been generated yet.</p>
                </div>
              </div>
            )}
            
            {/* Holographic overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 pointer-events-none" />
          </div>

          {/* Back Side */}
          <div 
            className="absolute inset-0 w-full h-full backface-hidden rounded-[24px] shadow-2xl border-4 border-white/20 overflow-hidden bg-slate-100 rotate-y-180"
          >
            {card.backUrl ? (
              <img 
                src={card.backUrl} 
                alt="ID Card Back" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 p-8 text-center">
                <Printer className="w-12 h-12 opacity-30" />
                <p className="text-sm font-medium">Back Side Preview Rendering...</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-bl from-white/0 via-white/5 to-white/10 pointer-events-none" />
          </div>
        </motion.div>

        {/* Status Badge */}
        <div className="absolute -top-3 -right-3 z-10">
          {card.status === 'READY' ? (
            <div className="bg-emerald-500 text-white p-2 rounded-full shadow-lg border-4 border-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
          ) : (
            <div className="bg-amber-500 text-white p-2 rounded-full shadow-lg border-4 border-white">
              <RefreshCcw className="w-5 h-5 animate-spin-slow" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          onClick={() => setIsFlipped(!isFlipped)}
          className="rounded-full px-6 bg-white/50 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Flip View
        </Button>
        <Button 
          variant="default" 
          onClick={onDownload}
          disabled={!card.frontUrl}
          className="rounded-full px-6 bg-[#1e293b] hover:bg-[#334155] shadow-lg shadow-slate-200"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>

      {/* Info labels */}
      <div className="text-center space-y-1">
        <h3 className="font-bold text-slate-800 text-lg">{card.name}</h3>
        <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
          Showing {isFlipped ? 'Back' : 'Front'} Template
        </p>
      </div>
    </div>
  );
}
