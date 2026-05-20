// store.js — in-memory state hydrated from localStorage

import { loadState, saveState } from './storage.js';
import { SEED } from './mockdata.js';

let state = null;

export function initStore() {
  state = loadState();
  if (!isUsableState(state)) {
    state = JSON.parse(JSON.stringify(SEED));
    saveState(state);
  } else {
    state = mergeWithSeed(state);
    saveState(state);
  }
  return state;
}

export function getState() {
  if (!state) initStore();
  return state;
}

export function commit() {
  saveState(state);
  window.dispatchEvent(new CustomEvent('state-changed', { detail: state }));
}

// Convenience setters
export function addTransaction(tx) {
  tx.id = 't' + Date.now();
  tx.createdAt = new Date().toISOString();
  state.data.transactions.unshift(tx);
  updateWalletBalance(tx, +1);
  commit();
  return tx;
}

export function updateTransaction(id, patch) {
  const i = state.data.transactions.findIndex(t => t.id === id);
  if (i < 0) return null;
  const old = state.data.transactions[i];
  updateWalletBalance(old, -1);
  const next = { ...old, ...patch };
  state.data.transactions[i] = next;
  updateWalletBalance(next, +1);
  commit();
  return next;
}

export function deleteTransaction(id) {
  const i = state.data.transactions.findIndex(t => t.id === id);
  if (i < 0) return;
  updateWalletBalance(state.data.transactions[i], -1);
  state.data.transactions.splice(i, 1);
  commit();
}

function updateWalletBalance(tx, sign) {
  const w = state.data.wallets.find(w => w.id === tx.walletId);
  if (!w) return;
  const delta = tx.type === 'income' ? tx.amount : -tx.amount;
  w.balance += sign * delta;
}

// Goals
export function addGoal(g) {
  g.id = 'g' + Date.now();
  state.data.goals.push(g);
  commit();
  return g;
}
export function updateGoal(id, patch) {
  const i = state.data.goals.findIndex(g => g.id === id);
  if (i < 0) return null;
  state.data.goals[i] = { ...state.data.goals[i], ...patch };
  commit();
  return state.data.goals[i];
}
export function deleteGoal(id) {
  state.data.goals = state.data.goals.filter(g => g.id !== id);
  commit();
}

// Budgets
export function addBudget(b) {
  b.id = 'b' + Date.now();
  state.data.budgets.push(b);
  commit();
  return b;
}
export function updateBudget(id, patch) {
  const i = state.data.budgets.findIndex(b => b.id === id);
  if (i < 0) return null;
  state.data.budgets[i] = { ...state.data.budgets[i], ...patch };
  commit();
  return state.data.budgets[i];
}
export function deleteBudget(id) {
  state.data.budgets = state.data.budgets.filter(b => b.id !== id);
  commit();
}

// Wallets
export function addWallet(w) {
  w.id = 'w' + Date.now();
  if (!w.balance) w.balance = 0;
  state.data.wallets.push(w);
  commit();
  return w;
}
export function updateWallet(id, patch) {
  const i = state.data.wallets.findIndex(w => w.id === id);
  if (i < 0) return null;
  state.data.wallets[i] = { ...state.data.wallets[i], ...patch };
  commit();
  return state.data.wallets[i];
}
export function deleteWallet(id) {
  state.data.wallets = state.data.wallets.filter(w => w.id !== id);
  commit();
}

// Preferences
export function setPreference(key, value) {
  state.preferences[key] = value;
  commit();
}

// Auth
export function setAuth(auth) {
  state.auth = auth;
  commit();
}

export function resetAll() {
  state = JSON.parse(JSON.stringify(SEED));
  commit();
}

// Helpers
export function getCategoryById(id) { return getState().data.categories.find(c => c.id === id); }
export function getWalletById(id)   { return getState().data.wallets.find(w => w.id === id); }
export function getGoalById(id)     { return getState().data.goals.find(g => g.id === id); }

function isUsableState(value) {
  return Boolean(
    value &&
    value.version &&
    value.auth &&
    value.preferences &&
    value.data &&
    Array.isArray(value.data.categories) &&
    Array.isArray(value.data.wallets) &&
    Array.isArray(value.data.transactions) &&
    Array.isArray(value.data.goals) &&
    Array.isArray(value.data.budgets)
  );
}

function mergeWithSeed(value) {
  const seed = JSON.parse(JSON.stringify(SEED));
  return {
    ...seed,
    ...value,
    auth: { ...seed.auth, ...(value.auth || {}) },
    preferences: { ...seed.preferences, ...(value.preferences || {}) },
    data: {
      ...seed.data,
      ...(value.data || {}),
      categories: Array.isArray(value.data?.categories) ? value.data.categories : seed.data.categories,
      wallets: Array.isArray(value.data?.wallets) ? value.data.wallets : seed.data.wallets,
      transactions: Array.isArray(value.data?.transactions) ? value.data.transactions : seed.data.transactions,
      goals: Array.isArray(value.data?.goals) ? value.data.goals : seed.data.goals,
      budgets: Array.isArray(value.data?.budgets) ? value.data.budgets : seed.data.budgets
    }
  };
}
