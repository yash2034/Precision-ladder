# 🎮 PRECISION LADDER - Complete Game Documentation

## 📋 Table of Contents
1. [Game Overview](#game-overview)
2. [Core Mechanics](#core-mechanics)
3. [Timer System](#timer-system)
4. [Speed Scaling System](#speed-scaling-system)
5. [Cashout / Risk It System](#cashout--risk-it-system)
6. [Game States & Flow](#game-states--flow)
7. [Winning Conditions](#winning-conditions)
8. [Game Logic Details](#game-logic-details)
9. [Complete Gameplay Examples](#complete-gameplay-examples)
10. [Strategy Tips](#strategy-tips)
11. [Technical Implementation](#technical-implementation)

---

## 🎯 Game Overview

**PRECISION LADDER** is a skill-based precision timing game where players must stop a countdown timer in specific zones to win rounds. The objective is to accumulate enough wins to complete your selected multiplier challenge, or cash out early for a guaranteed (but lower) reward.

### Key Features:
- ⏱️ **Precision Timing**: Stop the timer in winning zones (0.01-0.30 seconds)
- 🎯 **JACKPOT Mode**: Hit exactly 0.10 for instant win
- 💰 **Cashout System**: Take guaranteed rewards early or risk it for more
- ⚡ **Progressive Difficulty**: Timer speed increases as you progress
- 🎲 **Multiple Multipliers**: Choose from 1.5×, 2×, 5×, or 10× challenges

---

## 🎮 Core Mechanics

### 1. Game Setup

Before starting a game:
- **Select Multiplier**: Choose from 1.5×, 2×, 5×, or 10×
- **Enter Stake**: Input your bet amount (minimum 1, maximum your balance)
- **Click START**: Game begins and stake is deducted from balance

**Important**: Your stake is deducted from your balance immediately when the game starts.

### 2. Multiplier System

Each multiplier has different requirements and cashout options:

| Multiplier | Required Wins | Cashout Threshold | Cashout Multiplier | Cashout Reward Example* |
|------------|---------------|-------------------|-------------------|-------------------------|
| **1.5×** | 5 wins | 3 wins | 1× | Stake × 1 |
| **2×** | 10 wins | 5 wins | 1× | Stake × 1 |
| **5×** | 15 wins | 8 wins | 2.5× | Stake × 2.5 |
| **10×** | 20 wins | 10 wins | 5× | Stake × 5 |

*Example: If you stake 10 coins with 10× multiplier, cashout at 10 wins gives you 50 coins (10 × 5).

---

## ⏱️ Timer System

### Timer Countdown

- **Starts at**: 3.00 seconds
- **Counts down to**: 0.00 seconds
- **Update frequency**: Every 10ms (0.01 seconds)
- **Speed**: Increases as you progress (see Speed Scaling section)

### Timer Zones & Results

When you press STOP, the timer value determines your result:

| Timer Range | Zone Name | Result | Win Awarded | Color Code |
|-------------|-----------|--------|-------------|------------|
| **0.095 - 0.105** | 🎯 JACKPOT | Instant Win | Full reward immediately | Yellow |
| **0.01 - 0.09** | Great Job | Success | +1 win | Green |
| **0.11 - 0.20** | Good Job | Success | +1 win | Blue |
| **0.21 - 0.30** | Nice | Success | +1 win | Purple |
| **> 0.30** | Miss | No win | Continue playing | Gray |
| **0.00** | Game Over | Failure | Lose stake | Red |

### 🎯 JACKPOT (0.10)

**The Ultimate Win!**

- If you stop the timer at **exactly 0.10** (or within 0.095-0.105 range), you win **instantly**
- **No need to complete all rounds** - game ends immediately
- You receive: **Stake × Selected Multiplier**
- This is the fastest way to win!

**Example**: 
- Multiplier: 10×
- Stake: 20 coins
- Hit JACKPOT → Win 200 coins instantly!

---

## ⚡ Speed Scaling System

The timer speed **increases** as you progress through the game, making it progressively harder:

| Progress | Speed Multiplier | Description |
|----------|------------------|-------------|
| 0-20% | 1.0× | Normal speed |
| 20-40% | 1.25× | Slightly faster |
| 40-60% | 1.5× | Moderate speed |
| 60-80% | 1.75× | Fast |
| 80-100% | 2.0× | Very fast |

**Example with 10× multiplier (20 wins required)**:
- Wins 0-4: 1.0× speed (normal)
- Wins 5-7: 1.25× speed (slightly faster)
- Wins 8-11: 1.5× speed (moderate)
- Wins 12-15: 1.75× speed (fast)
- Wins 16-19: 2.0× speed (very fast - hardest!)

**Why this matters**: The game gets progressively more challenging, requiring better timing skills as you approach the finish line.

---

## 💰 Cashout / Risk It System

### How It Works

When you reach the **cashout threshold**, the game **pauses automatically** and asks you to choose:

1. **💰 CASHOUT**: Take the cashout multiplier reward now (safer, lower reward)
2. **⚡ RISK IT**: Continue playing for the full multiplier reward (riskier, higher reward)

### Cashout Thresholds

- **1.5×**: After **3 wins** → Cashout at **1×** or continue for **1.5×**
- **2×**: After **5 wins** → Cashout at **1×** or continue for **2×**
- **5×**: After **8 wins** → Cashout at **2.5×** or continue for **5×**
- **10×**: After **10 wins** → Cashout at **5×** or continue for **10×**

### Example Scenario

**Setup**:
- Multiplier: **10×**
- Stake: **20 coins**
- Required: **20 wins**
- Full reward: **200 coins**

**After 10 wins, you can**:
- **CASHOUT**: 20 × 5 = **100 coins** (profit: +80 coins)
- **RISK IT**: Continue for 20 × 10 = **200 coins** (profit: +180 coins)

**Decision**: Take guaranteed 100 coins now, or risk losing everything for a chance at 200 coins?

---

## 🔄 Game States & Flow

### State Machine

The game has **7 distinct states**:

1. **IDLE**: Initial state - select multiplier and stake
2. **RUNNING**: Timer is counting down - press STOP
3. **EVALUATING**: Result is being shown (1.5 seconds)
4. **CASHOUT_DECISION**: Paused at cashout threshold - choose CASHOUT or RISK IT
5. **JACKPOT_WIN**: Hit 0.10 - instant win!
6. **CASHED_OUT**: Completed all wins or cashed out early
7. **FAILED**: Timer hit 0.00 - game over, lose stake

### Game Flow Diagram

```
START GAME
    ↓
[IDLE] → Select Multiplier & Stake → Click START
    ↓
[RUNNING] → Timer counts 3.00 → 0.00
    ↓
Press STOP → [EVALUATING]
    ↓
    ├─→ JACKPOT (0.10) → [JACKPOT_WIN] → Instant Reward → END
    ├─→ Success (0.01-0.30) → +1 Win
    │       ↓
    │   Check Wins:
    │       ├─→ All Wins Complete → [CASHED_OUT] → Full Reward → END
    │       ├─→ Reached Cashout Threshold → [CASHOUT_DECISION]
    │       │       ├─→ CASHOUT → [CASHED_OUT] → Cashout Reward → END
    │       │       └─→ RISK IT → [RUNNING] → Continue Playing
    │       └─→ Continue → [RUNNING] → Next Round
    └─→ Miss (>0.30) → [RUNNING] → Next Round (No Win)
    
    OR
    
    Timer → 0.00 → [FAILED] → Lose Stake → END
```

### Round Flow

1. **Round Starts**: Timer resets to 3.00
2. **Timer Counts Down**: From 3.00 to 0.00 (speed depends on progress)
3. **Player Stops Timer**: Press STOP button
4. **Evaluation**: Game checks timer value
5. **Result Display**: Shows result (Great Job, Good Job, Nice, Miss, or JACKPOT)
6. **Next Action**: 
   - If win: Add +1 win, check if complete or cashout threshold
   - If miss: Continue to next round
   - If JACKPOT: Instant win, game ends
   - If 0.00: Game over, lose stake

---

## 🏆 Winning Conditions

There are **3 ways to win**:

### Method 1: Complete All Required Wins ✅

- Win the required number of rounds for your multiplier
- **Reward**: Stake × Selected Multiplier
- **Example**: 10× multiplier, 20 stake, 20 wins = **200 coins**

### Method 2: Hit JACKPOT 🎯

- Stop timer at exactly 0.10 (or 0.095-0.105 range)
- **Reward**: Stake × Selected Multiplier (instant)
- **Example**: 10× multiplier, 20 stake = **200 coins immediately**
- **No need to complete all rounds!**

### Method 3: Early Cashout 💰

- Reach cashout threshold and choose CASHOUT
- **Reward**: Stake × Cashout Multiplier
- **Example**: 10× multiplier, 20 stake, cashout at 10 wins = **100 coins**

---

## 🧮 Game Logic Details

### Timer Calculation

```javascript
// Timer decreases by 0.01 × currentSpeed every 10ms
newTime = previousTime - (0.01 × currentSpeed)

// Example at 2.0× speed:
// Every 10ms: timer decreases by 0.02 seconds
// So it takes 150ms (15 intervals) to go from 3.00 to 0.00
```

### Precision Evaluation Logic

The game checks the timer value when STOP is pressed:

```javascript
if (timer === 0.10 or 0.095-0.105) → JACKPOT
if (timer >= 0.01 && < 0.10) → Great Job (+1 win)
if (timer >= 0.11 && <= 0.20) → Good Job (+1 win)
if (timer >= 0.21 && <= 0.30) → Nice (+1 win)
if (timer > 0.30) → Miss (no win, continue)
if (timer === 0.00) → Game Over (lose stake)
```

### Speed Calculation

```javascript
progress = currentWins / requiredWins

if (progress >= 0.8) → speed = 2.0×
if (progress >= 0.6) → speed = 1.75×
if (progress >= 0.4) → speed = 1.5×
if (progress >= 0.2) → speed = 1.25×
else → speed = 1.0×
```

### Cashout Check

```javascript
// Check if player reached cashout threshold
if (newWins === cashoutThreshold) {
    pause game → show CASHOUT_DECISION screen
}

// Cashout reward calculation
cashoutReward = stake × cashoutMultiplier
```

---

## 📖 Complete Gameplay Examples

### Example 1: 5× Multiplier, 50 Coin Stake

**Step 1: Setup**
- Multiplier: **5×**
- Stake: **50 coins**
- Required: **15 wins**
- Cashout: Available at **8 wins** (2.5× = 125 coins)
- Balance: 200 → 150 (after stake)

**Step 2: Round 1**
- Timer: 3.00 → 0.00
- Stop at: **0.15** (Good Job)
- Result: **+1 win** (1/15)
- Speed: **1.0×**
- Continue to next round

**Step 3: Rounds 2-7**
- Continue winning rounds
- Wins: **7/15**
- Speed: **1.25×** (progress 46.7%)

**Step 4: Round 8 (Cashout Threshold)**
- Stop at: **0.22** (Nice)
- Result: **+1 win** (8/15)
- Game pauses → **CASHOUT DECISION**
- Options:
  - **CASHOUT**: 50 × 2.5 = **125 coins**
  - **RISK IT**: Continue for 50 × 5 = **250 coins**

**Step 5A: If CASHOUT**
- Reward: **125 coins**
- New balance: 150 + 125 = **275 coins**
- Profit: **+75 coins**
- Game ends

**Step 5B: If RISK IT**
- Continue playing
- Speed: **1.5×** (progress 53.3%)
- Rounds 9-14: Continue winning
- Round 15: Final win
- Reward: 50 × 5 = **250 coins**
- New balance: 150 + 250 = **400 coins**
- Profit: **+200 coins**
- Game ends

---

### Example 2: JACKPOT Win

**Setup**:
- Multiplier: **10×**
- Stake: **30 coins**
- Required: **20 wins**

**Round 1**:
- Timer: 3.00 → 0.00
- Stop at: **0.10** (JACKPOT!)
- Result: **Instant Win!**
- Reward: 30 × 10 = **300 coins**
- Game ends immediately
- No need to play 20 rounds!

---

### Example 3: Game Over (Failure)

**Setup**:
- Multiplier: **2×**
- Stake: **25 coins**
- Required: **10 wins**
- Current: **7 wins** (7/10)

**Round 8**:
- Timer: 3.00 → 0.00
- Player doesn't press STOP in time
- Timer hits: **0.00**
- Result: **Game Over**
- Stake lost: **25 coins**
- Balance: Reduced by 25 coins
- Game ends

---

## 💡 Strategy Tips

### 1. **JACKPOT Strategy** 🎯
- The JACKPOT (0.10) gives instant win but is very difficult
- Best attempted in early rounds when timer is slower
- High risk, high reward approach

### 2. **Early Rounds** 🟢
- Easier timing - timer is slower
- Build up wins while it's easier
- Good time to practice precision

### 3. **Later Rounds** ⚡
- Timer is much faster (up to 2.0× speed)
- Requires excellent timing skills
- Higher risk of missing or hitting 0.00

### 4. **Cashout Decision** 💰
- Consider your current progress
- If you're struggling, cashout might be safer
- If you're confident, risk it for higher reward
- Remember: You can lose everything if timer hits 0.00

### 5. **Timer Zones** 🎯
- **0.01-0.30**: All are winning zones
- **0.01-0.09**: Great Job (green) - easiest zone
- **0.11-0.20**: Good Job (blue) - medium zone
- **0.21-0.30**: Nice (purple) - harder zone
- **> 0.30**: Miss - no win but game continues

### 6. **Misses Don't End Game** ⚪
- If you miss (>0.30), you don't lose
- Game continues to next round
- You just don't get a win
- Only 0.00 ends the game

---

## 🔧 Technical Implementation

### State Management
- **Framework**: React with TypeScript
- **State**: React Hooks (useState, useEffect)
- **Game States**: 7 distinct states managed via state machine
- **Real-time Updates**: Timer updates every 10ms using setInterval

### Visual Feedback
- **Circular Progress Timer**: SVG-based with color coding
- **Progress Bar**: Shows win progress (wins/required)
- **Speed Indicator**: Displays current speed multiplier
- **Result Messages**: Animated feedback for each result
- **Color Coding**: Different colors for different timer zones

### Balance System
- **Initial Balance**: Random 100-200 coins
- **Stake Deduction**: Happens at game start
- **Reward Addition**: Added on win (JACKPOT, completion, or cashout)
- **Auto-reset**: If balance < 10 coins, resets to 100-200

### Timer Implementation
- **Update Frequency**: 10ms intervals
- **Speed Scaling**: Dynamic speed multiplier based on progress
- **Visual Reset**: Uses requestAnimationFrame for smooth resets
- **Color Transitions**: Smooth color changes based on timer value

### Cashout System
- **Automatic Pause**: Game pauses at cashout threshold
- **Decision Screen**: Shows both options with rewards
- **One-time Choice**: Decision only appears once at threshold
- **Reward Calculation**: Different formulas for cashout vs full completion

---

## 📊 Game Statistics

### Win Probabilities (Theoretical)
- **JACKPOT Zone (0.095-0.105)**: ~0.33% chance (very difficult)
- **Great Job (0.01-0.09)**: ~2.67% chance
- **Good Job (0.11-0.20)**: ~3.33% chance
- **Nice (0.21-0.30)**: ~3.33% chance
- **Total Winning Zone**: ~9.67% chance per round
- **Miss Zone (>0.30)**: ~90.33% chance

### Risk/Reward Analysis

| Multiplier | Required Wins | Cashout Wins | Cashout % | Full Reward % |
|------------|---------------|--------------|-----------|---------------|
| 1.5× | 5 | 3 | 60% | 100% |
| 2× | 10 | 5 | 50% | 100% |
| 5× | 15 | 8 | 53.3% | 100% |
| 10× | 20 | 10 | 50% | 100% |

---

## 🎓 Learning Curve

### Beginner Level
- Start with **1.5×** multiplier (easiest)
- Focus on hitting **0.01-0.30** zones
- Learn timing patterns
- Practice stopping before 0.30

### Intermediate Level
- Try **2×** or **5×** multipliers
- Master different speed levels
- Understand cashout decisions
- Improve precision timing

### Advanced Level
- Master **10×** multiplier
- Attempt JACKPOT shots
- Handle 2.0× speed timing
- Make strategic cashout decisions

---

## 🐛 Known Behaviors

### Timer Behavior
- Timer updates every 10ms
- Speed affects countdown rate
- Visual circle resets smoothly between rounds
- Color changes based on timer value

### Game Flow
- Cashout decision appears only once at threshold
- JACKPOT ends game immediately
- Misses don't end game (only 0.00 does)
- Game continues even after misses

### Balance System
- Balance auto-resets if below 10 coins
- Stake is deducted at game start
- Rewards added on win completion
- No negative balances allowed

---

## 📝 Summary

**PRECISION LADDER** is a skill-based timing game that combines:
- ⏱️ **Precision**: Stop timer in winning zones
- 🎯 **Strategy**: Choose multipliers and cashout decisions
- ⚡ **Progression**: Increasing difficulty as you advance
- 💰 **Risk Management**: Balance safety vs reward

The game rewards players who can:
1. **Time accurately** in the 0.01-0.30 second window
2. **Make strategic decisions** about cashout vs risk
3. **Handle increasing difficulty** as timer speeds up
4. **Aim for JACKPOT** for instant wins

**Key Takeaway**: Success requires both skill (timing) and strategy (cashout decisions). The game gets progressively harder, making early wins crucial and cashout decisions critical.

---

## 📞 Support & Questions

For questions about game mechanics, refer to the in-game **Info button (ℹ️)** which contains all rules and zone information.

---

**Version**: 1.0  
**Last Updated**: 2024  
**Game Type**: Skill-based Precision Timing Game

