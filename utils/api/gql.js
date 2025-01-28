import fetch from 'node-fetch';
import config from '../../config.js';

// Helper function to send a GraphQL request
export const gqlRequest = async (query, variables = {}) => {
  const url = 'https://gql.twitch.tv/gql'; // Twitch's GraphQL endpoint

  const headers = {
    'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko', // Use the provided Client-ID
    'Content-Type': 'application/json',         // Set content type to JSON
  };

  const body = JSON.stringify({
    query,
    variables,
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
    }

    return data.data;  // Return the response data
  } catch (error) {
    console.error(`Error sending GraphQL request: ${error.message}`);
    return null;
  }
};

// Fetch user badges for a specific channel
export const fetchUserBadgesInChannel = async (channelLogin, userLogin) => {
  const query = `
    query ($channelLogin: String!, $userLogin: String!) {
      channelViewer(channelLogin: $channelLogin, userLogin: $userLogin) {
        earnedBadges {
          title
        }
      }
    }
  `;

  const variables = {
    channelLogin,
    userLogin,
  };

  const result = await gqlRequest(query, variables);
  return result?.channelViewer?.earnedBadges || [];
};
