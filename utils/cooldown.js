const cooldowns = new Map();

export const duration = {
  veryShort: 3,
  short: 5,
  medium: 15,
  long: 30,
  veryLong: 60
};

export const set = (key, ttl) => {
  clearTimeout(cooldowns.get(key));
  const timeout = setTimeout(() => cooldowns.delete(key), ttl * 1000);
  cooldowns.set(key, timeout);
};

export const remove = (key) => {
  clearTimeout(cooldowns.get(key));
  cooldowns.delete(key);
};

export const has = (key) => {
  return cooldowns.has(key);
};