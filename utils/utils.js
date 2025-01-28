export const timeSince = (timestamp) => {
  const duration = Date.now() - timestamp;

  let seconds = Math.floor(duration / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  seconds %= 60;
  minutes %= 60;
  hours %= 24;

  const pluralize = (count, noun) => count + ' ' + noun + (count !== 1 ? 's' : '');

  const formattedDays = days > 0 ? pluralize(days, 'day') + ', ' : '';
  const formattedHours = hours > 0 ? pluralize(hours, 'hour') + ', ' : '';
  const formattedMinutes = minutes > 0 ? pluralize(minutes, 'minute') + ', ' : '';
  const formattedSeconds = seconds > 0 ? pluralize(seconds, 'second') : '';

  return formattedDays + formattedHours + formattedMinutes + formattedSeconds;
};

export const antiPing = (text = '') => {
  const [start = '', ...rest] = text;
  const end = rest.pop() || '';

  return `${start}\u{E0000}${rest.join('')}${rest.length ? '\u{E0000}' : ''}${end}`;
};

export const sleep = async (ms = 200) => await new Promise(resolve => setTimeout(resolve, ms));