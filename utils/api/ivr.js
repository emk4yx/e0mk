export const ivr = async (endpoint) => {
  try {
    const response = await fetch(`https://api.ivr.fi/v2/twitch/${endpoint}`);

    return await response.json();
  } catch (err) {
    return [];
  }
};

export const getUser = async function(user) {
  const encodedUser = encodeURIComponent(user);

  const data = await getUserById(encodedUser) || await getUserByLogin(encodedUser);
  if (data?.id) return data;

  return false;
};

export const getUserById = async function(userId) {
  if (isNaN(Number(userId))) return false;

  const data = await ivr(`user?id=${userId}`);
  if (!data?.[0]?.id) return false;

  return data[0];
};

export const getUserByLogin = async function(user) {
  const data = await ivr(`user?login=${user}`);
  if (!data?.[0]?.id) return false;

  return data[0];
};

export const getUsername = async function(userId) {
  try {
    const user = await getUser(userId);
    return user?.login || false;
  } catch (e) {
    return false;
  }
};

export const getUserId = async function(username) {
  try {
    const user = await getUser(username);
    return user?.id || false;
  } catch (e) {
    return false;
  }
};