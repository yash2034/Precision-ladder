// Next, React
import React, { FC, useEffect, useRef, useState } from 'react';
import pkg from '../../../package.json';

// ❌ DO NOT EDIT ANYTHING ABOVE THIS LINE

export const HomeView: FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* HEADER – fake Scrolly feed tabs */}
      <header className="flex items-center justify-center border-b border-white/10 py-3">
        <div className="flex items-center gap-2 rounded-full bg-white/5 px-2 py-1 text-[11px]">
          <button className="rounded-full bg-slate-900 px-3 py-1 font-semibold text-white">
            Feed
          </button>
          <button className="rounded-full px-3 py-1 text-slate-400">
            Casino
          </button>
          <button className="rounded-full px-3 py-1 text-slate-400">
            Kids
          </button>
        </div>
      </header>

      {/* MAIN – central game area (phone frame) */}
      <main className="flex flex-1 items-center justify-center px-4 py-3">
        <div className="relative aspect-[9/16] w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-[0_0_40px_rgba(56,189,248,0.35)]">
          {/* Fake “feed card” top bar inside the phone */}
          <div className="flex items-center justify-between px-3 py-2 text-[10px] text-slate-400">
            <span className="rounded-full bg-white/5 px-2 py-1 text-[9px] uppercase tracking-wide">
              Scrolly Game
            </span>
            <span className="text-[9px] opacity-70">#NoCodeJam</span>
          </div>

          {/* The game lives INSIDE this phone frame */}
          <div className="flex h-[calc(100%-26px)] flex-col items-center justify-start px-3 pb-3 pt-1">
            <GameSandbox />
          </div>
        </div>
      </main>

      {/* FOOTER – tiny version text */}
      <footer className="flex h-5 items-center justify-center border-t border-white/10 px-2 text-[9px] text-slate-500">
        <span>Scrolly · v{pkg.version}</span>
      </footer>
    </div>
  );
};




// ============================================
// OLD GAME - COMMENTED OUT
// ============================================

const GameSandbox: FC = () => {
  // ========================
  // GAME STATES
  // ========================
  type GameState = 'idle' | 'running' | 'evaluating' | 'failed' | 'cashed_out' | 'jackpot_win';
  
  const [gameState, setGameState] = useState<GameState>('idle');
  const [stakeInput, setStakeInput] = useState<string>('10');
  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(1.5);
  const [stake, setStake] = useState<number>(0);
  const [timer, setTimer] = useState<number>(3.0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [wins, setWins] = useState<number>(0);
  const [requiredWins, setRequiredWins] = useState<number>(5);
  const [precisionResult, setPrecisionResult] = useState<string>('');
  const [shake, setShake] = useState<boolean>(false);
  const [currentSpeed, setCurrentSpeed] = useState<number>(1.0);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(Math.floor(Math.random() * 101) + 100);

  // ========================
  // MULTIPLIER TO WINS MAPPING
  // ========================
  const getRequiredWins = (multiplier: number): number => {
    if (multiplier === 1.5) return 5;
    if (multiplier === 2) return 10;
    if (multiplier === 5) return 15;
    if (multiplier === 10) return 20;
    return 5;
  };

  // ========================
  // SPEED SCALING (increases with wins)
  // ========================
  const getSpeed = (currentWins: number, required: number): number => {
    const progress = currentWins / required;
    if (progress >= 0.8) return 2.0;
    if (progress >= 0.6) return 1.75;
    if (progress >= 0.4) return 1.5;
    if (progress >= 0.2) return 1.25;
    return 1.0;
  };

  // ========================
  // GAME ACTIONS
  // ========================
  const handleFail = (time: number) => {
    setShake(true);
    setGameState('failed');
    setTimeout(() => setShake(false), 500);
  };

  // ========================
  // TIMER LOGIC
  // ========================
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        const newTime = Math.max(0, prev - (0.01 * currentSpeed));
        if (newTime === 0) {
          setIsTimerRunning(false);
          setShake(true);
          setGameState('failed');
          setTimeout(() => setShake(false), 500);
        }
        return newTime;
      });
    }, 10);

    return () => clearInterval(interval);
  }, [isTimerRunning, currentSpeed]);

  // ========================
  // PRECISION EVALUATION
  // ========================
  const evaluatePrecision = (time: number): { result: string; isSuccess: boolean; isJackpot: boolean } => {
    if (time === 0) {
      return { result: 'FAIL', isSuccess: false, isJackpot: false };
    }
    // JACKPOT: Exact 0.10 - instant win!
    if (time === 0.10 || (time >= 0.095 && time <= 0.105)) {
      return { result: 'JACKPOT', isSuccess: true, isJackpot: true };
    }
    // Great Job: 0.01-0.09
    if (time >= 0.01 && time < 0.10) {
      return { result: 'Great Job', isSuccess: true, isJackpot: false };
    }
    // Good Job: 0.11-0.20
    if (time >= 0.11 && time <= 0.20) {
      return { result: 'Good Job', isSuccess: true, isJackpot: false };
    }
    // Nice: 0.21-0.30
    if (time >= 0.21 && time <= 0.30) {
      return { result: 'Nice', isSuccess: true, isJackpot: false };
    }
    // MISS: Beyond 0.30
    return { result: 'MISS', isSuccess: false, isJackpot: false };
  };

  // ========================
  // GAME ACTIONS
  // ========================
  const startGame = () => {
    const stakeValue = parseInt(stakeInput) || 10;
    if (stakeValue < 1 || stakeValue > balance) return;
    
    const required = getRequiredWins(selectedMultiplier);
    setRequiredWins(required);
    setStake(stakeValue);
    setBalance(prev => prev - stakeValue);
    setWins(0);
    setCurrentSpeed(1.0);
    startRound();
  };

  const startRound = () => {
    setTimer(3.0);
    setIsTimerRunning(true);
    setGameState('running');
    setPrecisionResult('');
  };

  const stopTimer = () => {
    if (!isTimerRunning || gameState !== 'running') return;
    
    setIsTimerRunning(false);
    const time = timer;

    const { result, isSuccess, isJackpot } = evaluatePrecision(time);
    setPrecisionResult(result);
    setGameState('evaluating');

    if (time === 0) {
      handleFail(0);
      return;
    }

    if (isJackpot) {
      // JACKPOT = Instant win! Game ends immediately
      const reward = stake * selectedMultiplier;
      setBalance(prev => prev + reward);
      setTimeout(() => {
        setGameState('jackpot_win');
      }, 1500);
      return;
    }

    if (isSuccess) {
      // Count as a win
      const newWins = wins + 1;
      setWins(newWins);
      
      // Update speed based on progress
      const newSpeed = getSpeed(newWins, requiredWins);
      setCurrentSpeed(newSpeed);

      // Check if all wins achieved
      if (newWins >= requiredWins) {
        const reward = stake * selectedMultiplier;
        setBalance(prev => prev + reward);
        setTimeout(() => {
          setGameState('cashed_out');
        }, 1500);
      } else {
        // Continue to next round
        setTimeout(() => {
          startRound();
        }, 1200);
      }
    } else {
      // Miss - continue to next round
      setTimeout(() => {
        startRound();
      }, 1200);
    }
  };

  const restart = () => {
    setGameState('idle');
    setWins(0);
    setTimer(3.0);
    setIsTimerRunning(false);
    setPrecisionResult('');
    setCurrentSpeed(1.0);
    setStake(0);
    setRequiredWins(5);
    // If balance is too low, reset it (for demo purposes)
    if (balance < 10) {
      setBalance(Math.floor(Math.random() * 101) + 100);
    }
  };

  // ========================
  // RENDER
  // ========================
  const progressPercent = (wins / requiredWins) * 100;
  const currentReward = stake * selectedMultiplier;

  return (
    <div className="w-full h-full flex flex-col relative">
      
      {/* INFO MODAL */ }
      {showInfo && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-3 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl w-full max-h-full overflow-y-auto border-2 border-slate-600 shadow-2xl">
            {/* Header */}
            <div className="bg-purple-600 p-3 rounded-t-xl flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-base font-bold text-white">📖 How to Play</h2>
              <button
                onClick={() => setShowInfo(false)}
                className="text-white text-xl font-bold hover:text-red-300"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-3 space-y-3 text-xs">
              {/* Game Objective */}
              <div className="bg-purple-900 p-2 rounded-lg border border-purple-600">
                <h3 className="text-yellow-400 font-bold text-xs mb-1">🎯 OBJECTIVE</h3>
                <p className="text-white text-xs leading-snug">
                  Select a multiplier, enter your stake, and win the required number of games to get your reward! Hit JACKPOT (exact 0.10) for instant win!
                </p>
              </div>

              {/* How to Play */}
              <div className="bg-slate-700 p-2 rounded-lg border border-slate-600">
                <h3 className="text-cyan-400 font-bold text-xs mb-1">🕹️ HOW TO PLAY</h3>
                <ol className="text-white text-xs space-y-1 list-decimal list-inside">
                  <li>Select your desired multiplier (1.5×, 2×, 5×, or 10×)</li>
                  <li>Enter your stake amount</li>
                  <li>Tap START (timer counts 3.00 → 0.00)</li>
                  <li>Tap STOP in a winning zone to get +1 win</li>
                  <li>Win all required games to get your reward!</li>
                  <li>Hit JACKPOT (exact 0.10) for instant win!</li>
                </ol>
              </div>

              {/* Multipliers & Required Wins */}
              <div className="bg-orange-900 p-2 rounded-lg border border-orange-600">
                <h3 className="text-orange-300 font-bold text-xs mb-1">📈 MULTIPLIERS & WINS</h3>
                <div className="space-y-1 text-xs">
                  <div className="bg-slate-900 p-1.5 rounded flex justify-between">
                    <span className="text-white font-bold">1.5×</span>
                    <span className="text-yellow-400 font-bold">5 wins required</span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded flex justify-between">
                    <span className="text-white font-bold">2×</span>
                    <span className="text-yellow-400 font-bold">10 wins required</span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded flex justify-between">
                    <span className="text-white font-bold">5×</span>
                    <span className="text-yellow-400 font-bold">15 wins required</span>
                  </div>
                  <div className="bg-yellow-700 p-1.5 rounded flex justify-between border border-yellow-500">
                    <span className="text-white font-bold">10×</span>
                    <span className="text-yellow-200 font-bold">20 wins required</span>
                  </div>
                </div>
              </div>

              {/* Precision Zones */}
              <div className="bg-slate-800 p-2 rounded-lg border border-slate-600">
                <h3 className="text-pink-400 font-bold text-xs mb-1">⏱️ TIMER ZONES</h3>
                <div className="space-y-1 text-xs">
                  <div className="bg-yellow-900 p-1.5 rounded flex justify-between border border-yellow-600">
                    <span className="text-yellow-300 font-bold">🎯 Exact 0.10</span>
                    <span className="text-yellow-300 font-bold">JACKPOT (Instant Win!)</span>
                  </div>
                  <div className="bg-green-900 p-1.5 rounded flex justify-between">
                    <span className="text-green-300 font-bold">🟢 0.01-0.09</span>
                    <span className="text-gray-300">Great Job (+1 win)</span>
                  </div>
                  <div className="bg-blue-900 p-1.5 rounded flex justify-between">
                    <span className="text-blue-300 font-bold">🔵 0.11-0.20</span>
                    <span className="text-gray-300">Good Job (+1 win)</span>
                  </div>
                  <div className="bg-purple-900 p-1.5 rounded flex justify-between">
                    <span className="text-purple-300 font-bold">🟣 0.21-0.30</span>
                    <span className="text-gray-300">Nice (+1 win)</span>
                  </div>
                  <div className="bg-slate-700 p-1.5 rounded flex justify-between">
                    <span className="text-slate-300 font-bold">⚪ Beyond 0.30</span>
                    <span className="text-gray-300">Miss (no win)</span>
                  </div>
                  <div className="bg-red-900 p-1.5 rounded flex justify-between border border-red-600">
                    <span className="text-red-300 font-bold">💀 0.00</span>
                    <span className="text-red-300 font-bold">GAME OVER</span>
                  </div>
                </div>
              </div>

              {/* JACKPOT Info */}
              <div className="bg-yellow-900 p-2 rounded-lg border border-yellow-600">
                <h3 className="text-yellow-300 font-bold text-xs mb-1">🎯 JACKPOT RULE</h3>
                <p className="text-white text-xs leading-snug">
                  If you stop the timer at <span className="font-bold text-yellow-300">exact 0.10</span>, you instantly win your selected multiplier reward! No need to play all games!
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowInfo(false)}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg"
              >
                Got It! 🎮
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Main Container */}
      <div className={`flex-1 flex flex-col ${shake ? 'animate-pulse' : ''}`}>
        
        {/* HEADER */}
        <div className="bg-slate-800 border-b border-slate-700 px-2 py-1 text-center flex-shrink-0 relative">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-xs font-bold text-white">⚡ PRECISION LADDER</h1>
            <button
              onClick={() => setShowInfo(true)}
              className="w-5 h-5 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-[10px]"
            >
              ℹ️
            </button>
          </div>
          <p className="text-[10px] text-slate-300 mt-0.5">Stop perfectly • 0.00 = Game Over</p>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          
          {/* IDLE STATE */}
          {gameState === 'idle' && (
            <>
              <div className="bg-slate-800 p-2 rounded-lg border border-slate-600">
                <label className="block text-white text-[10px] font-bold mb-1 text-center">
                  🎯 Multiplier
                </label>
                <div className="grid grid-cols-2 gap-1 mb-1">
                  {[1.5, 2, 5, 10].map((mult) => (
                    <button
                      key={mult}
                      onClick={() => {
                        setSelectedMultiplier(mult);
                        setRequiredWins(getRequiredWins(mult));
                      }}
                      className={`py-1 text-white text-[10px] font-bold rounded ${
                        selectedMultiplier === mult
                          ? 'bg-yellow-600 border border-yellow-400'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      {mult}× ({getRequiredWins(mult)})
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800 p-3 rounded-lg border border-slate-600">
                <label className="block text-white text-xs font-bold mb-2 text-center">
                  💰 Enter Stake
                </label>
                <div className="flex justify-center">
                  <input
                    type="number"
                    value={stakeInput}
                    onChange={(e) => setStakeInput(e.target.value)}
                    className="w-32 px-2 py-1.5 text-xl font-bold text-center bg-slate-900 text-yellow-400 border border-slate-600 rounded focus:outline-none focus:border-yellow-500"
                    placeholder="10"
                    min="1"
                    max={balance}
                  />
                </div>
                <div className="flex justify-center gap-1 mt-2">
                  {[5, 10, 25, 50].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setStakeInput(amount.toString())}
                      disabled={amount > balance}
                      className={`px-2 py-1 text-white text-xs font-bold rounded ${
                        amount > balance 
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs text-slate-300 mt-2">
                  Win: {parseInt(stakeInput) * selectedMultiplier || 0} 🪙 | Balance: {balance}
                </p>
              </div>

              <button
                onClick={startGame}
                disabled={parseInt(stakeInput) > balance || parseInt(stakeInput) < 1}
                className={`w-full py-2.5 text-white text-base font-bold rounded-lg ${
                  parseInt(stakeInput) > balance || parseInt(stakeInput) < 1
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                🚀 START
              </button>
            </>
          )}

          {/* RUNNING / EVALUATING STATE */}
          {(gameState === 'running' || gameState === 'evaluating') && (
            <>
              {/* Stats Row */}
              <div className="flex items-center justify-center gap-2">
                <div className="bg-purple-700 px-2 py-1 rounded border border-purple-600 text-center">
                  <p className="text-[10px] text-purple-100">Stake</p>
                  <p className="text-sm font-bold text-white">{stake}</p>
                </div>
                <div className="bg-orange-600 px-2 py-1 rounded border border-orange-500 text-center">
                  <p className="text-[10px] text-orange-100">Multi</p>
                  <p className="text-sm font-bold text-white">{selectedMultiplier}×</p>
                </div>
                <div className="bg-green-600 px-2 py-1 rounded border border-green-500 text-center">
                  <p className="text-[10px] text-green-100">Win</p>
                  <p className="text-sm font-bold text-white">{Math.floor(currentReward)}</p>
                </div>
              </div>

              {/* Wins & Streak */}
              <div className="flex items-center justify-center gap-2">
                <div className="bg-slate-800 px-2 py-1 rounded border border-slate-600 text-center">
                  <p className="text-[10px] text-slate-300">Wins</p>
                  <p className="text-sm font-bold text-blue-400">{wins}/{requiredWins}</p>
                </div>
                <div className="bg-slate-800 px-2 py-1 rounded border border-slate-600 text-center">
                  <p className="text-[10px] text-slate-300">Speed</p>
                  <p className="text-sm font-bold text-yellow-400">{currentSpeed.toFixed(1)}×</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-slate-800 p-1.5 rounded border border-slate-600">
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Circular Timer */}
              <div className="flex justify-center">
                <div className="relative w-32 h-32">
                  {/* Outer Circle */}
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-slate-700"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      className={`${
                        (timer >= 0.095 && timer <= 0.105) ? 'text-yellow-400' :
                        timer >= 0.01 && timer < 0.10 ? 'text-green-400' :
                        timer >= 0.11 && timer <= 0.20 ? 'text-blue-400' :
                        timer >= 0.21 && timer <= 0.30 ? 'text-purple-400' :
                        timer > 0.30 ? 'text-slate-400' :
                        timer > 0 ? 'text-orange-400' : 'text-red-400'
                      } transition-all`}
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - (timer / 3.0))}`}
                    />
                  </svg>
                  {/* Timer Text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className={`text-3xl font-bold ${
                        (timer >= 0.095 && timer <= 0.105) ? 'text-yellow-400' :
                        timer >= 0.01 && timer < 0.10 ? 'text-green-400' :
                        timer >= 0.11 && timer <= 0.20 ? 'text-blue-400' :
                        timer >= 0.21 && timer <= 0.30 ? 'text-purple-400' :
                        timer > 0.30 ? 'text-slate-400' :
                        timer > 0 ? 'text-orange-400' : 'text-red-400'
                      }`}>
                        {timer.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Result Display */}
              {precisionResult && gameState === 'evaluating' && (
                <div className="text-center">
                  <p className={`text-lg font-bold ${
                    precisionResult === 'JACKPOT' ? 'text-yellow-300' :
                    precisionResult === 'Great Job' ? 'text-green-400' :
                    precisionResult === 'Good Job' ? 'text-blue-400' :
                    precisionResult === 'Nice' ? 'text-purple-400' : 'text-red-400'
                  }`}>
                    {precisionResult === 'JACKPOT' && '🎯 '}
                    {precisionResult}
                    {precisionResult !== 'JACKPOT' && precisionResult !== 'MISS' && ' (+1)'}
                    {precisionResult === 'JACKPOT' && ' (WIN!)'}
                  </p>
                </div>
              )}

              {/* Stop Button */}
              {gameState === 'running' && (
                <button
                  onClick={stopTimer}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-lg font-bold rounded-lg"
                >
                  ✋ STOP
                </button>
              )}
            </>
          )}

          {/* JACKPOT WIN STATE */}
          {gameState === 'jackpot_win' && (
            <>
              <div className="bg-yellow-600 p-4 rounded-lg text-center border border-yellow-500">
                <p className="text-3xl font-bold text-white mb-2">🎯 JACKPOT! 🎯</p>
                <div className="bg-slate-900 rounded p-3 space-y-1">
                  <p className="text-base text-yellow-100">You hit exact 0.10!</p>
                  <p className="text-4xl font-bold text-yellow-300">{Math.floor(currentReward)} 🪙</p>
                  <p className="text-sm text-yellow-100">Instant Win!</p>
                </div>
              </div>

              <button
                onClick={restart}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold rounded-lg"
              >
                🔄 PLAY AGAIN
              </button>
            </>
          )}

          {/* FAILED STATE */}
          {gameState === 'failed' && (
            <>
              <div className="bg-red-700 p-4 rounded-lg text-center border border-red-600">
                <p className="text-2xl font-bold text-white mb-2">💀 GAME OVER</p>
                <div className="bg-slate-900 rounded p-2 space-y-1">
                  <p className="text-base text-white font-bold">Timer Hit 0.00!</p>
                  <p className="text-xs text-red-200">Wins: {wins}/{requiredWins}</p>
                  <p className="text-base text-red-300 font-bold">Lost: {stake} 🪙</p>
                </div>
              </div>

              <button
                onClick={restart}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold rounded-lg"
              >
                🔄 TRY AGAIN
              </button>
            </>
          )}

          {/* CASHED OUT STATE */}
          {gameState === 'cashed_out' && (
            <>
              <div className="bg-green-600 p-4 rounded-lg text-center border border-green-500">
                <p className="text-2xl font-bold text-white mb-2">🎉 WINNER! 🎉</p>
                <div className="bg-slate-900 rounded p-3 space-y-1">
                  <p className="text-4xl font-bold text-yellow-300">{Math.floor(currentReward)}</p>
                  <p className="text-sm text-green-100">Profit: <span className="font-bold text-yellow-300">+{Math.floor(currentReward - stake)}</span></p>
                  <p className="text-xs text-green-200">Wins: {wins}/{requiredWins}</p>
                  <p className="text-xs text-green-200">Multi: {selectedMultiplier}×</p>
                  <p className="text-xs text-green-200 mt-2">New Balance: {balance} 🪙</p>
                </div>
              </div>
              <button
                onClick={restart}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold rounded-lg"
              >
                🔄 PLAY AGAIN
              </button>
            </>
          )}
    </div>
  </div>
</div>
  );
};

