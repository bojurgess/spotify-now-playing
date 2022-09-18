function refreshTokens() {
  spotifyApi.refreshAccessToken().then (
    function(data) {
      console.log('Successfully Refreshed Access Token!');
      spotifyApi.setAccessToken(data.body['access_token']);
    }
  ),
    function(err) {
      console.log('Uh Oh! Unexpected Error Occured. ' + err);
    }
};