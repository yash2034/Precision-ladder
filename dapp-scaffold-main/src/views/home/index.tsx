

// Next, React
import React, { FC, useEffect, useRef, useState } from 'react';

// ❌ DO NOT EDIT ANYTHING ABOVE THIS LINE

export const HomeView: FC = () => {
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white flex items-center justify-center py-4 sm:py-6">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto">
        <GameSandbox />
      </div>
    </div>
  );
};


const GameSandbox: FC = () => {
  // ========================
  // GAME STATES
  // ========================
  type GameState = 'idle' | 'running' | 'evaluating' | 'failed' | 'cashed_out' | 'jackpot_win' | 'cashout_decision';
  
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
  const [isEarlyCashout, setIsEarlyCashout] = useState<boolean>(false);

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
  // CASHOUT CALCULATION
  // ========================
  const getCashoutInfo = (multiplier: number): { minWins: number; cashoutMultiplier: number } => {
    if (multiplier === 1.5) return { minWins: 3, cashoutMultiplier: 1 };
    if (multiplier === 2) return { minWins: 5, cashoutMultiplier: 1 };
    if (multiplier === 5) return { minWins: 8, cashoutMultiplier: 2.5 };
    if (multiplier === 10) return { minWins: 10, cashoutMultiplier: 5 };
    return { minWins: 3, cashoutMultiplier: 1 };
  };

  const canCashout = (): boolean => {
    const { minWins } = getCashoutInfo(selectedMultiplier);
    return wins >= minWins && wins < requiredWins;
  };

  const reachedCashoutThreshold = (newWins: number): boolean => {
    const { minWins } = getCashoutInfo(selectedMultiplier);
    return newWins === minWins;
  };

  const getCashoutReward = (): number => {
    const { cashoutMultiplier } = getCashoutInfo(selectedMultiplier);
    return stake * cashoutMultiplier;
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
    if (time > 0.10 && time <= 0.20) {
      return { result: 'Good Job', isSuccess: true, isJackpot: false };
    }
    // Nice: 0.21-0.30
    if (time > 0.20 && time <= 0.30) {
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
    setPrecisionResult('');
    setTimer(3.0);
    setIsTimerRunning(false);
    setGameState('running');
    // Use requestAnimationFrame to ensure DOM update before starting timer
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsTimerRunning(true);
      });
    });
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
        setIsEarlyCashout(false);
        setTimeout(() => {
          setGameState('cashed_out');
        }, 1500);
      } else if (reachedCashoutThreshold(newWins)) {
        // Reached cashout threshold - pause and ask user
        setTimeout(() => {
          setGameState('cashout_decision');
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

  const handleCashout = () => {
    const cashoutReward = getCashoutReward();
    setBalance(prev => prev + cashoutReward);
    setIsTimerRunning(false);
    setIsEarlyCashout(true);
    setGameState('cashed_out');
  };

  const handleRiskIt = () => {
    // Continue playing for full multiplier
    setGameState('running');
    startRound();
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
    setIsEarlyCashout(false);
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
    <div className="w-full">
      
      {/* INFO MODAL */ }
      {showInfo && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-3 overflow-y-auto">
          <div className="bg-slate-800 rounded-lg sm:rounded-xl w-full max-w-md max-h-[90vh] sm:max-h-full overflow-y-auto border-2 border-slate-600 shadow-2xl">
            {/* Header */}
            <div className="bg-purple-600 p-2 sm:p-3 rounded-t-lg sm:rounded-t-xl flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-sm sm:text-base font-bold text-white">📖 How to Play</h2>
              <button
                onClick={() => setShowInfo(false)}
                className="text-white text-lg sm:text-xl font-bold hover:text-red-300 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-2 sm:p-3 space-y-2 sm:space-y-3 text-[11px] sm:text-xs">
              {/* Game Objective */}
              <div className="bg-purple-900 p-1.5 sm:p-2 rounded-lg border border-purple-600">
                <h3 className="text-yellow-400 font-bold text-[11px] sm:text-xs mb-0.5 sm:mb-1">🎯 OBJECTIVE</h3>
                <p className="text-white text-[11px] sm:text-xs leading-snug">
                  Select a multiplier, enter your stake, and win the required number of games to get your reward! Hit JACKPOT (exact 0.10) for instant win!
                </p>
              </div>

              {/* How to Play */}
              <div className="bg-slate-700 p-1.5 sm:p-2 rounded-lg border border-slate-600">
                <h3 className="text-cyan-400 font-bold text-[11px] sm:text-xs mb-0.5 sm:mb-1">🕹️ HOW TO PLAY</h3>
                <ol className="text-white text-[11px] sm:text-xs space-y-0.5 sm:space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Select your desired multiplier (1.5×, 2×, 5×, or 10×)</li>
                  <li>Enter your stake amount</li>
                  <li>Tap START (timer counts 3.00 → 0.00)</li>
                  <li>Tap STOP in a winning zone to get +1 win</li>
                  <li>When you reach cashout threshold, choose CASHOUT or RISK IT</li>
                  <li>Win all required games to get your full reward!</li>
                  <li>Hit JACKPOT (exact 0.10) for instant win!</li>
                </ol>
              </div>

              {/* Multipliers & Required Wins */}
              <div className="bg-orange-900 p-1.5 sm:p-2 rounded-lg border border-orange-600">
                <h3 className="text-orange-300 font-bold text-[11px] sm:text-xs mb-0.5 sm:mb-1">📈 MULTIPLIERS & WINS</h3>
                <div className="space-y-0.5 sm:space-y-1 text-[11px] sm:text-xs">
                  <div className="bg-slate-900 p-1 sm:p-1.5 rounded">
                    <div className="flex justify-between mb-0.5 flex-wrap gap-1">
                      <span className="text-white font-bold">1.5×</span>
                      <span className="text-yellow-400 font-bold text-[10px] sm:text-xs">5 wins required</span>
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-green-300">Cashout: 3 wins → 1×</div>
                  </div>
                  <div className="bg-slate-900 p-1 sm:p-1.5 rounded">
                    <div className="flex justify-between mb-0.5 flex-wrap gap-1">
                      <span className="text-white font-bold">2×</span>
                      <span className="text-yellow-400 font-bold text-[10px] sm:text-xs">10 wins required</span>
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-green-300">Cashout: 5 wins → 1×</div>
                  </div>
                  <div className="bg-slate-900 p-1 sm:p-1.5 rounded">
                    <div className="flex justify-between mb-0.5 flex-wrap gap-1">
                      <span className="text-white font-bold">5×</span>
                      <span className="text-yellow-400 font-bold text-[10px] sm:text-xs">15 wins required</span>
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-green-300">Cashout: 8 wins → 2.5×</div>
                  </div>
                  <div className="bg-yellow-700 p-1 sm:p-1.5 rounded border border-yellow-500">
                    <div className="flex justify-between mb-0.5 flex-wrap gap-1">
                      <span className="text-white font-bold">10×</span>
                      <span className="text-yellow-200 font-bold text-[10px] sm:text-xs">20 wins required</span>
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-yellow-200">Cashout: 10 wins → 5×</div>
                  </div>
                </div>
              </div>

              {/* Cashout Info */}
              <div className="bg-green-900 p-1.5 sm:p-2 rounded-lg border border-green-600">
                <h3 className="text-green-300 font-bold text-[11px] sm:text-xs mb-0.5 sm:mb-1">💰 CASHOUT / RISK IT</h3>
                <p className="text-white text-[11px] sm:text-xs leading-snug mb-0.5 sm:mb-1">
                  When you reach the minimum wins for cashout, the game will pause and ask you to choose:
                </p>
                <ul className="text-white text-[11px] sm:text-xs space-y-0.5 list-disc list-inside leading-relaxed">
                  <li><span className="font-bold text-green-300">CASHOUT:</span> Take the cashout multiplier reward now (safer)</li>
                  <li><span className="font-bold text-yellow-300">RISK IT:</span> Continue playing for the full multiplier reward (riskier but higher reward)</li>
                </ul>
              </div>

              {/* Precision Zones */}
              <div className="bg-slate-800 p-1.5 sm:p-2 rounded-lg border border-slate-600">
                <h3 className="text-pink-400 font-bold text-[11px] sm:text-xs mb-0.5 sm:mb-1">⏱️ TIMER ZONES</h3>
                <div className="space-y-0.5 sm:space-y-1 text-[11px] sm:text-xs">
                  <div className="bg-yellow-900 p-1 sm:p-1.5 rounded flex justify-between items-center border border-yellow-600 gap-1">
                    <span className="text-yellow-300 font-bold text-[10px] sm:text-xs">🎯 Exact 0.10</span>
                    <span className="text-yellow-300 font-bold text-[9px] sm:text-[10px]">JACKPOT</span>
                  </div>
                  <div className="bg-green-900 p-1 sm:p-1.5 rounded flex justify-between items-center gap-1">
                    <span className="text-green-300 font-bold text-[10px] sm:text-xs">🟢 0.01-0.09</span>
                    <span className="text-gray-300 text-[9px] sm:text-[10px]">Great Job (+1)</span>
                  </div>
                  <div className="bg-blue-900 p-1 sm:p-1.5 rounded flex justify-between items-center gap-1">
                    <span className="text-blue-300 font-bold text-[10px] sm:text-xs">🔵 0.11-0.20</span>
                    <span className="text-gray-300 text-[9px] sm:text-[10px]">Good Job (+1)</span>
                  </div>
                  <div className="bg-purple-900 p-1 sm:p-1.5 rounded flex justify-between items-center gap-1">
                    <span className="text-purple-300 font-bold text-[10px] sm:text-xs">🟣 0.21-0.30</span>
                    <span className="text-gray-300 text-[9px] sm:text-[10px]">Nice (+1)</span>
                  </div>
                  <div className="bg-slate-700 p-1 sm:p-1.5 rounded flex justify-between items-center gap-1">
                    <span className="text-slate-300 font-bold text-[10px] sm:text-xs">⚪ Beyond 0.30</span>
                    <span className="text-gray-300 text-[9px] sm:text-[10px]">Miss</span>
                  </div>
                  <div className="bg-red-900 p-1 sm:p-1.5 rounded flex justify-between items-center border border-red-600 gap-1">
                    <span className="text-red-300 font-bold text-[10px] sm:text-xs">💀 0.00</span>
                    <span className="text-red-300 font-bold text-[9px] sm:text-[10px]">GAME OVER</span>
                  </div>
                </div>
              </div>

              {/* JACKPOT Info */}
              <div className="bg-yellow-900 p-1.5 sm:p-2 rounded-lg border border-yellow-600">
                <h3 className="text-yellow-300 font-bold text-[11px] sm:text-xs mb-0.5 sm:mb-1">🎯 JACKPOT RULE</h3>
                <p className="text-white text-[11px] sm:text-xs leading-snug">
                  If you stop the timer at <span className="font-bold text-yellow-300">exact 0.10</span>, you instantly win your selected multiplier reward! No need to play all games!
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowInfo(false)}
                className="w-full py-1.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold rounded-lg transition-colors"
              >
                Got It! 🎮
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Main Container */}
      <div className={shake ? 'animate-pulse' : ''}>
        
        {/* HEADER */}
        <div className="border-b-2 border-slate-600/30 px-2.5 sm:px-3 md:px-4 py-2.5 sm:py-3 md:py-4 text-center">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold text-white drop-shadow-lg">⚡ PRECISION LADDER</h1>
            <button
              onClick={() => setShowInfo(true)}
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-slate-600 hover:bg-slate-500 rounded-full flex items-center justify-center text-[10px] sm:text-xs md:text-sm transition-all hover:scale-110 shadow-md flex-shrink-0"
            >
              ℹ️
            </button>
          </div>
          <p className="text-[10px] sm:text-xs md:text-sm lg:text-base text-slate-200 mt-1 sm:mt-1.5 font-medium">Stop perfectly • 0.00 = Game Over</p>
        </div>

        {/* CONTENT */}
        <div className="p-2.5 sm:p-3 md:p-4">
          <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
          
          {/* IDLE STATE */}
          {gameState === 'idle' && (
            <>
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-2.5 sm:p-3 md:p-4 rounded-lg border-2 border-slate-600/50 shadow-lg">
                <label className="block text-white text-xs sm:text-sm md:text-base font-bold mb-2 sm:mb-3 text-center">
                  🎯 Multiplier
                </label>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-3">
                  {[1.5, 2, 5, 10].map((mult) => (
                    <button
                      key={mult}
                      onClick={() => {
                        setSelectedMultiplier(mult);
                        setRequiredWins(getRequiredWins(mult));
                      }}
                      className={`py-2 sm:py-2.5 md:py-3 text-white text-xs sm:text-sm md:text-base font-bold rounded-lg transition-all transform hover:scale-105 ${
                        selectedMultiplier === mult
                          ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 border-2 border-yellow-400 shadow-md shadow-yellow-500/50'
                          : 'bg-slate-700 hover:bg-slate-600 border-2 border-slate-600 shadow'
                      }`}
                    >
                      {mult}× ({getRequiredWins(mult)})
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-2.5 sm:p-3 md:p-4 rounded-lg border-2 border-slate-600/50 shadow-lg">
                <label className="block text-white text-xs sm:text-sm md:text-base font-bold mb-2 sm:mb-3 text-center">
                  💰 Enter Stake
                </label>
                <div className="flex justify-center">
                  <input
                    type="number"
                    value={stakeInput}
                    onChange={(e) => setStakeInput(e.target.value)}
                    className="w-28 sm:w-36 md:w-40 px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-lg sm:text-xl md:text-2xl font-bold text-center bg-slate-900 text-yellow-400 border-2 border-slate-600 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 shadow-md"
                    placeholder="10"
                    min="1"
                    max={balance}
                  />
                </div>
                <div className="flex justify-center gap-1.5 sm:gap-2 md:gap-3 mt-2 sm:mt-3">
                  {[5, 10, 25, 50].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setStakeInput(amount.toString())}
                      disabled={amount > balance}
                      className={`px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 text-white text-[10px] sm:text-xs md:text-sm font-bold rounded-lg transition-all transform hover:scale-105 ${
                        amount > balance 
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                          : stakeInput === amount.toString()
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-blue-400 shadow-md shadow-blue-500/50'
                          : 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-2 border-blue-500 shadow'
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs sm:text-sm md:text-base text-slate-200 mt-2 sm:mt-3 font-semibold">
                  Win: <span className="text-yellow-400">{parseInt(stakeInput) * selectedMultiplier || 0}</span> 🪙 | Bal: <span className="text-green-400">{balance}</span> 🪙
                </p>
              </div>

              <button
                onClick={startGame}
                disabled={parseInt(stakeInput) > balance || parseInt(stakeInput) < 1}
                className={`w-full py-2.5 sm:py-3 md:py-3.5 text-white text-sm sm:text-base md:text-lg font-extrabold rounded-lg transition-all transform hover:scale-105 ${
                  parseInt(stakeInput) > balance || parseInt(stakeInput) < 1
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 shadow-lg shadow-green-500/50 border-2 border-green-400'
                }`}
              >
                🚀 START GAME
              </button>
            </>
          )}

          {/* RUNNING / EVALUATING STATE */}
          {(gameState === 'running' || gameState === 'evaluating') && (
            <>
              {/* Stats Row */}
              <div className="flex items-stretch justify-center gap-1.5 sm:gap-2 md:gap-3">
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg border-2 border-purple-500 text-center flex-1 min-w-0 shadow-md flex flex-col justify-center">
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-purple-100 font-semibold mb-0.5 sm:mb-1">Stake</p>
                  <p className="text-xs sm:text-sm md:text-base font-bold text-white leading-tight">{stake} 🪙</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg border-2 border-orange-400 text-center flex-1 min-w-0 shadow-md flex flex-col justify-center">
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-orange-100 font-semibold mb-0.5 sm:mb-1">Multi</p>
                  <p className="text-xs sm:text-sm md:text-base font-bold text-white leading-tight">{selectedMultiplier}×</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg border-2 border-green-400 text-center flex-1 min-w-0 shadow-md flex flex-col justify-center">
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-green-100 font-semibold mb-0.5 sm:mb-1">Win</p>
                  <p className="text-xs sm:text-sm md:text-base font-bold text-white leading-tight">{Math.floor(currentReward)} 🪙</p>
                </div>
              </div>

              {/* Wins & Speed */}
              <div className="flex items-stretch justify-center gap-1.5 sm:gap-2 md:gap-3">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg border-2 border-slate-600 text-center flex-1 min-w-0 shadow-md flex flex-col justify-center">
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-slate-300 font-semibold mb-0.5 sm:mb-1">Wins</p>
                  <p className="text-xs sm:text-sm md:text-base font-bold text-blue-400 leading-tight">{wins}/{requiredWins}</p>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg border-2 border-slate-600 text-center flex-1 min-w-0 shadow-md flex flex-col justify-center">
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-slate-300 font-semibold mb-0.5 sm:mb-1">Speed</p>
                  <p className="text-xs sm:text-sm md:text-base font-bold text-yellow-400 leading-tight">{currentSpeed.toFixed(1)}×</p>
                </div>
                {canCashout() && (
                  <div className="bg-gradient-to-br from-green-700 to-green-800 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg border-2 border-green-500 text-center flex-1 min-w-0 shadow-md flex flex-col justify-center">
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-green-200 font-semibold mb-0.5 sm:mb-1">Cashout</p>
                    <p className="text-xs sm:text-sm md:text-base font-bold text-green-300 leading-tight">{getCashoutInfo(selectedMultiplier).cashoutMultiplier}×</p>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="bg-slate-800 p-2 sm:p-2.5 md:p-3 rounded-lg border-2 border-slate-600 shadow-md">
                <div className="w-full bg-slate-700 rounded-full h-2 sm:h-2.5 md:h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 shadow-md"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Circular Timer */}
              <div className="flex justify-center items-center py-2 sm:py-3 md:py-4">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex items-center justify-center">
                  {/* Outer Circle - Mobile */}
                  <svg className="transform -rotate-90 w-24 h-24 sm:hidden absolute inset-0" viewBox="0 0 96 96" preserveAspectRatio="xMidYMid meet">
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-slate-700"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      className={`${
                        (timer >= 0.095 && timer <= 0.105) ? 'text-yellow-400' :
                        timer >= 0.01 && timer < 0.10 ? 'text-green-400' :
                        timer >= 0.11 && timer <= 0.20 ? 'text-blue-400' :
                        timer >= 0.21 && timer <= 0.30 ? 'text-purple-400' :
                        timer > 0.30 ? 'text-slate-400' :
                        timer > 0 ? 'text-orange-400' : 'text-red-400'
                      }`}
                      style={{
                        strokeDasharray: `${2 * Math.PI * 42}`,
                        strokeDashoffset: `${2 * Math.PI * 42 * (1 - (timer / 3.0))}`,
                        transition: isTimerRunning && timer < 3.0 ? 'stroke-dashoffset 0.1s linear, stroke 0.2s ease' : 'stroke-dashoffset 0s, stroke 0.2s ease'
                      }}
                    />
                  </svg>
                  {/* Outer Circle - Desktop */}
                  <svg className="transform -rotate-90 w-28 h-28 md:w-32 md:h-32 hidden sm:block absolute inset-0" viewBox="0 0 112 112" preserveAspectRatio="xMidYMid meet">
                    <circle
                      cx="56"
                      cy="56"
                      r="50"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="5"
                      className="text-slate-700"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="56"
                      cy="56"
                      r="50"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                      className={`${
                        (timer >= 0.095 && timer <= 0.105) ? 'text-yellow-400' :
                        timer >= 0.01 && timer < 0.10 ? 'text-green-400' :
                        timer >= 0.11 && timer <= 0.20 ? 'text-blue-400' :
                        timer >= 0.21 && timer <= 0.30 ? 'text-purple-400' :
                        timer > 0.30 ? 'text-slate-400' :
                        timer > 0 ? 'text-orange-400' : 'text-red-400'
                      }`}
                      style={{
                        strokeDasharray: `${2 * Math.PI * 50}`,
                        strokeDashoffset: `${2 * Math.PI * 50 * (1 - (timer / 3.0))}`,
                        transition: isTimerRunning && timer < 3.0 ? 'stroke-dashoffset 0.1s linear, stroke 0.2s ease' : 'stroke-dashoffset 0s, stroke 0.2s ease'
                      }}
                    />
                  </svg>
                  {/* Timer Text - Centered */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <p className={`text-base sm:text-xl md:text-2xl font-extrabold drop-shadow-md ${
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

              {/* Result Display */}
              {precisionResult && gameState === 'evaluating' && (
                <div className="text-center py-2 sm:py-3">
                  <p className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold drop-shadow-md ${
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
                  className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-base sm:text-lg font-extrabold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-red-500/50 border-2 border-red-400"
                >
                  ✋ STOP TIMER
                </button>
              )}
            </>
          )}

          {/* CASHOUT DECISION STATE */}
          {gameState === 'cashout_decision' && (
            <>
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 sm:p-5 rounded-lg text-center border-2 border-blue-400 shadow-lg">
                <p className="text-xl sm:text-2xl font-extrabold text-white mb-3">💰 CASHOUT OR RISK IT?</p>
                <div className="bg-slate-900 rounded-lg p-3 sm:p-4 space-y-3">
                  <p className="text-sm sm:text-base text-blue-100 font-semibold">You&apos;ve reached {wins} wins!</p>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 py-3 border-t border-slate-700">
                    <div className="text-left w-full sm:w-auto">
                      <p className="text-xs sm:text-sm text-slate-300 mb-1">Cashout Now:</p>
                      <p className="text-lg sm:text-xl font-bold text-green-400">{getCashoutInfo(selectedMultiplier).cashoutMultiplier}× = {Math.floor(getCashoutReward())} 🪙</p>
                    </div>
                    <div className="text-right w-full sm:w-auto">
                      <p className="text-xs sm:text-sm text-slate-300 mb-1">Risk It For:</p>
                      <p className="text-lg sm:text-xl font-bold text-yellow-400">{selectedMultiplier}× = {Math.floor(currentReward)} 🪙</p>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-blue-200 font-semibold">Wins: {wins}/{requiredWins}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCashout}
                  className="py-3 sm:py-3.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white text-sm sm:text-base font-extrabold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-green-500/50 border-2 border-green-400"
                >
                  💰 CASHOUT
                </button>
                <button
                  onClick={handleRiskIt}
                  className="py-3 sm:py-3.5 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white text-sm sm:text-base font-extrabold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/50 border-2 border-yellow-400"
                >
                  ⚡ RISK IT
                </button>
              </div>
            </>
          )}

          {/* JACKPOT WIN STATE */}
          {gameState === 'jackpot_win' && (
            <>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 sm:p-5 rounded-lg text-center border-2 border-yellow-400 shadow-lg">
                <p className="text-2xl sm:text-3xl font-extrabold text-white mb-3 drop-shadow-md">🎯 JACKPOT! 🎯</p>
                <div className="bg-slate-900 rounded-lg p-4 sm:p-5 space-y-3">
                  <p className="text-base sm:text-lg text-yellow-100 font-semibold">You hit exact 0.10!</p>
                  <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-yellow-300 drop-shadow-md">{Math.floor(currentReward)} 🪙</p>
                  <p className="text-sm sm:text-base text-yellow-100 font-semibold">Instant Win!</p>
                </div>
              </div>

              <button
                onClick={restart}
                className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-base sm:text-lg font-extrabold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50 border-2 border-blue-400"
              >
                🔄 PLAY AGAIN
              </button>
            </>
          )}

          {/* FAILED STATE */}
          {gameState === 'failed' && (
            <>
              <div className="bg-gradient-to-br from-red-700 to-red-800 p-4 sm:p-5 rounded-lg text-center border-2 border-red-600 shadow-lg">
                <p className="text-2xl sm:text-3xl font-extrabold text-white mb-3 drop-shadow-md">💀 GAME OVER</p>
                <div className="bg-slate-900 rounded-lg p-4 sm:p-5 space-y-2">
                  <p className="text-base sm:text-lg text-white font-bold">Timer Hit 0.00!</p>
                  <p className="text-sm sm:text-base text-red-200">Wins: {wins}/{requiredWins}</p>
                  <p className="text-lg sm:text-xl text-red-300 font-bold">Lost: {stake} 🪙</p>
                </div>
              </div>

              <button
                onClick={restart}
                className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-base sm:text-lg font-extrabold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50 border-2 border-blue-400"
              >
                🔄 TRY AGAIN
              </button>
            </>
          )}

          {/* CASHED OUT STATE */}
          {gameState === 'cashed_out' && (
            <>
              <div className="bg-gradient-to-br from-green-600 to-green-700 p-4 sm:p-5 rounded-lg text-center border-2 border-green-400 shadow-lg">
                <p className="text-2xl sm:text-3xl font-extrabold text-white mb-3 drop-shadow-md">🎉 WINNER! 🎉</p>
                <div className="bg-slate-900 rounded-lg p-4 sm:p-5 space-y-3">
                  <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-yellow-300 drop-shadow-md">{Math.floor(isEarlyCashout ? getCashoutReward() : currentReward)} 🪙</p>
                  <p className="text-sm sm:text-base text-green-100">Profit: <span className="font-bold text-yellow-300">+{Math.floor((isEarlyCashout ? getCashoutReward() : currentReward) - stake)}</span></p>
                  <p className="text-xs sm:text-sm text-green-200">Wins: {wins}/{requiredWins}</p>
                  <p className="text-xs sm:text-sm text-green-200">Multi: {isEarlyCashout ? getCashoutInfo(selectedMultiplier).cashoutMultiplier : selectedMultiplier}×</p>
                  {isEarlyCashout && (
                    <p className="text-sm sm:text-base text-green-300 font-semibold">💰 Cashed Out Early!</p>
                  )}
                  <p className="text-sm sm:text-base text-green-200 mt-1.5 font-semibold">New Balance: {balance} 🪙</p>
                </div>
              </div>
              <button
                onClick={restart}
                className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-base sm:text-lg font-extrabold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50 border-2 border-blue-400"
              >
                🔄 PLAY AGAIN
              </button>
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};