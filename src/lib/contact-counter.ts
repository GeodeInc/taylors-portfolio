const today = () => new Date().toISOString().slice(0, 10);

let store = { date: today(), count: 0 };

export const DAILY_LIMIT = 100;

export function getCount(): number {
  if (store.date !== today()) store = { date: today(), count: 0 };
  return store.count;
}

export function increment(): number {
  if (store.date !== today()) store = { date: today(), count: 0 };
  store.count += 1;
  return store.count;
}
