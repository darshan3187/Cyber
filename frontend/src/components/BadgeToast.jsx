import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Zap } from 'lucide-react';

const BadgeToast = ({ title, message, type = 'badge' }) => {
  useEffect(() => {
    if (type === 'badge') {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#6C63FF', '#FFD700', '#2ED573']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#6C63FF', '#FFD700', '#2ED573']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [type]);

  const isBadge = type === 'badge';

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-slideUpFade">
      <div className={`surface-card p-4 pr-10 flexItems-center gap-4 shadow-2xl shadow-indigo-500/20 border-l-4 ${isBadge ? 'border-l-yellow-400' : 'border-l-[var(--color-primary)]'}`}>
        <div className={`p-3 rounded-full ${isBadge ? 'bg-yellow-400/20 text-yellow-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
          {isBadge ? <Award size={28} /> : <Zap size={28} />}
        </div>
        <div>
          <h4 className="font-bold text-lg">{title}</h4>
          {message && <p className="text-sm text-secondary-color mt-1">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default BadgeToast;
