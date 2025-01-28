import { helix } from './helix.js';

export const getConduitId = async () => {
  const existingConduit = await db.queryOne('SELECT id FROM conduits');

  if (existingConduit) {
    return existingConduit.id;
  }

  const conduit = await createConduit();
  await db.query('INSERT INTO conduits (id) VALUES (?)', [conduit.id]);

  return conduit.id;
};

export const createConduit = async () => {
  const body = {
    shard_count: 1
  };

  const result = await helix('eventsub/conduits', 'POST', body);
  return result?.data?.[0] ?? null;
};

export const addShardsToConduit = async (conduitId, shards) => {
  const body = {
    conduit_id: conduitId,
    shards: shards
  };

  const result = await helix('eventsub/conduits/shards', 'PATCH', body);
  return result?.data ?? null;
};

export const createSubscription = async (subscriptionSettings) => {
  const { type, version, condition } = subscriptionSettings;
  const payload = {
    type,
    version,
    condition,
    transport: {
      method: 'conduit',
      conduit_id: bot.conduitClient.conduitId
    }
  };

  const endpoint = 'eventsub/subscriptions';
  const response = await helix(endpoint, 'POST', payload);

  if (!response?.data?.length) {
    bot.log.error('Failed subscription:', payload.type, payload.version, payload.condition);
  }

  return response?.data?.[0];
};

export const getAllSubscriptions = async () => {
  const subscriptions = [];
  let cursor;

  do {
    const url = `eventsub/subscriptions?after=${cursor || ''}`;

    const response = await helix(url);
    cursor = response?.pagination?.cursor || null;

    if (response?.data?.length) {
      subscriptions.push(...response.data);
    }
  } while (cursor);

  return subscriptions;
};

export const deleteAllSubscriptions = async () => {
  let hasNextPage = true;

  while (hasNextPage) {
    const subscriptions = await helix('eventsub/subscriptions');
    await Promise.all(subscriptions?.data.map(subscription => deleteSubscription(subscription.id)));

    hasNextPage = JSON.stringify(subscriptions.pagination) !== '{}';
  }
};

export const deleteSubscription = async (subscriptionId) => {
  const endpoint = `eventsub/subscriptions?id=${subscriptionId}`;
  await Promise.all([
    helix(endpoint, 'DELETE'),
    db.query('DELETE FROM subscriptions WHERE id=?', [subscriptionId])
  ]);
};