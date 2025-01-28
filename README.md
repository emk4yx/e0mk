## Twitch Bot
Basic Twitch Bot using Conduits and Websockets. Required a mariadb or any db of your choosing (you have to change the queries tho)

To get the user access token for the bot account:
Create a new twitch application (https://dev.twitch.tv/console/apps/create) set the OAuth redirect URL to `http://localhost:8888` and select `private` as client-type.

Make sure to save the client id and client secret in your .env file. 

Next, add the client_id to this url and paste it in your browser:
**when getting the auth token make sure you're logged in with the twitch account from your bot**

`https://id.twitch.tv/oauth2/authorize?client_id=<CLIENT_ID>
&redirect_uri=http://localhost:8888
&response_type=code
&scope=analytics:read:extensions+analytics:read:games+bits:read+channel:manage:ads+channel:read:ads+channel:manage:broadcast+channel:read:charity+channel:edit:commercial+channel:read:editors+channel:manage:extensions+channel:read:goals+channel:read:guest_star+channel:manage:guest_star+channel:read:hype_train+channel:manage:moderators+channel:read:polls+channel:manage:polls+channel:read:predictions+channel:manage:predictions+channel:manage:raids+channel:read:redemptions+channel:manage:redemptions+channel:manage:schedule+channel:read:stream_key+channel:read:subscriptions+channel:manage:videos+channel:read:vips+channel:manage:vips+clips:edit+moderation:read+moderator:manage:announcements+moderator:manage:automod+moderator:read:automod_settings+moderator:manage:automod_settings+moderator:manage:banned_users+moderator:read:blocked_terms+moderator:manage:blocked_terms+moderator:manage:chat_messages+moderator:read:chat_settings+moderator:manage:chat_settings+moderator:read:chatters+moderator:read:followers+moderator:read:guest_star+moderator:manage:guest_star+moderator:read:shield_mode+moderator:manage:shield_mode+moderator:read:shoutouts+moderator:manage:shoutouts+moderator:read:unban_requests+moderator:manage:unban_requests+user:edit+user:edit:follows+user:read:blocked_users+user:manage:blocked_users+user:read:broadcast+user:manage:chat_color+user:read:email+user:read:emotes+user:read:follows+user:read:moderated_channels+user:read:subscriptions+user:manage:whispers+channel:bot+channel:moderate+chat:edit+chat:read+user:bot+user:read:chat+user:write:chat+whispers:read+whispers:edit`

You then should be redirected. In the url, search for a parameter "code=<YOUR CODE>"
Copy this code.

Next step is to send a POST-Request to twitch, use your preferred method to do so. I'll be using reqbin.com
make sure to replace client_id and client_secret from your app, and code from the url before.

set the url to `https://id.twitch.tv/oauth2/token`
set the content type to `application/x-www-form-urlencoded`
set the data to `client_id=<CLIENT_ID>&client_secret=<CLIENT_SECRET>&code=<CODE_FROM_BEFORE>&grant_type=authorization_code&redirect_uri=http://localhost:8888`

the entire request should look something like:
```
curl -X POST 'https://id.twitch.tv/oauth2/token'
-H 'Content-Type: application/x-www-form-urlencoded'
-d 'client_id=<CLIENT_ID>&client_secret=<CLIENT_SECRET>&code=<CODE_FROM_BEFORE>&grant_type=authorization_code&redirect_uri=http://localhost:8888'
```

you'll receive the access_token and refresh_token.
head to your database and insert these into the `tokens` table. make sure to set the name to `bot-token`. enter access_token and refresh_token to the values you got from the post request, leave `expires_at` at 0.

that's it, you're done.