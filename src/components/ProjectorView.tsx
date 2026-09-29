/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameConfig, GameState } from '../types/game';
import { PyramidBoard } from './PyramidBoard';
import { TimerClock } from './TimerClock';
import { Maximize2, Minimize2 } from 'lucide-react';

interface ProjectorViewProps {
  config: GameConfig;
  state: GameState;
  onBackToHost?: () => void;
  onExitFullscreen?: () => void;
}

export const ProjectorView: React.FC<ProjectorViewProps> = ({
  config,
  state,
  onBackToHost,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const doc = containerRef.current?.ownerDocument || document;
    const handleFsChange = () => {
      setIsFullscreen(Boolean(doc.fullscreenElement));
    };
    doc.addEventListener('fullscreenchange', handleFsChange);
    return () => doc.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    const doc = containerRef.current?.ownerDocument || document;
    if (!doc.fullscreenElement) {
      const el = doc.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen().catch(() => {});
      }
    }
  };

  const currentQIndex = state.currentQuestionIndex ?? 0;
  const currentQ = config.questions[currentQIndex] || config.questions[0];
  const revealedForCurrent = state.revealedMap[currentQIndex] || Array(10).fill(false);

  // Calculate revealed score summary for subtle presentation display
  let revealedScore = 0;
  let revealedCount = 0;
  revealedForCurrent.forEach((rev, idx) => {
    if (rev && currentQ.answers[idx]) {
      revealedScore += currentQ.answers[idx].points;
      revealedCount++;
    }
  });

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#F8F9FA] text-[#1E293B] flex flex-col justify-between p-4 md:p-8 select-none relative overflow-x-hidden"
    >
      {/* Optional Top Return Banner if in same window */}
      {onBackToHost && (
        <div className="max-w-5xl mx-auto w-full mb-3 flex items-center justify-between bg-slate-900 text-white px-3 py-1.5 rounded-md text-xs">
          <span>Projector Display Mode (Audience View)</span>
          <button
            type="button"
            onClick={onBackToHost}
            className="px-2.5 py-0.5 font-semibold bg-white/20 hover:bg-white/30 rounded cursor-pointer transition-colors"
          >
            ← Return to Host Control
          </button>
        </div>
      )}

      {/* Top Presentation Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            {config.gameName || 'OPS FORTUNE'}
          </h1>
          <p className="text-xs md:text-sm font-medium text-slate-500 tracking-wide mt-0.5">
            {config.subtitle || 'Connect. Decode. Score.'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-500">
              Question {currentQIndex + 1} of 30
            </span>
            <div className="text-xs text-slate-400 mt-0.5">
              {revealedCount} of 10 Revealed · <span className="font-mono font-bold text-slate-700">{revealedScore} pts</span>
            </div>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Center Stage: Question Title, Timer, and Pyramid */}
      <main className="max-w-5xl mx-auto w-full my-auto flex flex-col items-center py-4">
        {/* Question Title & Prompt */}
        <div className="text-center mb-4 max-w-3xl">
          <div className="inline-block mb-1.5">
            <span className="text-xs font-extrabold tracking-widest text-slate-600 uppercase border-b-2 border-slate-900 pb-0.5">
              Round {currentQIndex + 1}
            </span>
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-2">
            {currentQ.title}
          </h2>
          {currentQ.prompt && (
            <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
              {currentQ.prompt}
            </p>
          )}
        </div>

        {/* Big Centered Presentation Timer */}
        <div className="my-2 md:my-3">
          <TimerClock
            remainingSeconds={state.timerRemaining}
            status={state.timerStatus}
            size="large"
          />
        </div>

        {/* 10-Level Audience Pyramid Board */}
        <div className="w-full mt-2">
          <PyramidBoard
            answers={currentQ.answers}
            revealed={revealedForCurrent}
            mode="projector"
            size="large"
          />
        </div>
      </main>

      {/* Subtle Presentation Footer */}
      <footer className="max-w-5xl mx-auto w-full pt-3 text-center border-t border-slate-200/60 text-xs text-slate-400">
        <span>Operations Management Quiz Challenge</span>
        <span className="mx-2">·</span>
        <span>Fixed 100 to 10 Points Scale</span>
      </footer>
    </div>
  );
};
