exports.nowPlaying = {};

function getNowPlaying() {
  spotifyApi.getMyCurrentPlaybackState().then(
    function(data) {
      if (data.body && data.body.is_playing) {
        console.log('I am currently listening to: ' + data.body.item.name, 'by ' + data.body.item.artists[0].name);
        nowPlaying.songName = data.body.item.name;
        nowPlaying.artistName = data.body.item.artists[0].name;
      }
      else {
        console.log('I am not currently listening to anything.');
        nowPlaying.songName = 'I am not currently listening to anything.';
      }
    },
    function(err) {
      console.log('Error:' + err);
    }
  )
};