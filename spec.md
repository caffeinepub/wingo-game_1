# Specification

## Summary
**Goal:** Build a Wingo number prediction game platform with a backend game engine and a neon-styled casino frontend.

**Planned changes:**
- Backend (single Motoko actor): manage rounds with countdown timers, winning numbers (0–9), and color results (red/green/violet); store player bets (number or color); resolve rounds and calculate payouts (number 9x, color 2x, violet 4.5x); expose queries for current round state, round history, and player bet history; expose update functions to place bets and trigger round resolution; reject bets on closed rounds
- Frontend lobby/home screen: live countdown timer for the current round, last 10 round results displayed as color-coded number badges
- Frontend betting panel: number selector (0–9), color selector (Red/Green/Violet), bet amount input, Place Bet button with confirmation or error feedback
- Frontend result notification: modal/toast showing winning number/color and player win/loss/payout after round resolution
- Frontend bet history table: columns for round ID, selection, amount, and result
- Visual theme: deep dark background, neon glow effects on cards and buttons, red/green/violet/gold accent palette, bold modern typography, grid-based layout; logo and background loaded from `frontend/public/assets/generated`

**User-visible outcome:** Players can open the app, see the current round countdown and recent results, place a bet on a number or color, receive a win/loss notification after the round resolves, and review their full bet history — all within a vibrant neon casino-style interface.
