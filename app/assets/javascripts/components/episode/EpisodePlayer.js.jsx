var EpisodePlayerStream = React.createClass({
  
  componentDidMount: function() {
    // console.log("episode player stream mount")
  },

  render: function(){
    var css = this.props.css;
    // console.log("props", css)
    return(
      <div id={this.props.container_id} className="guest-stream" style={css.container}>
        <TokboxVideo id={this.props.video_id} style={css.video} videoElement={this.props.user.videoElement} />
        <div className="stream-identity">{this.props.identity}</div>
      </div> 
    )
  }
});


var EpisodePlayer = React.createClass({

  componentWillMount: function() {
    this.playerId = "episode-player-"+Guid.get();
  },
  
  componentDidMount: function() {
    var self = this;
    $(window).resize(function(){ self.layoutStreamObjects(); });
    $(window).resize();
    this.addStreamObjects();
  },

  componentDidUpdate: function() {
    this.addStreamObjects();    
  },

  getBroadcastingUsers: function(){
    var broadcasting_users = [];
    for(var i=0; i < this.props.users.length; i++ ){
      var user = this.props.users[i];
      if( user.guest_state == "BROADCASTING" ){
        if( user.connection != undefined && user.stream != undefined ){
          broadcasting_users.push( user ); 
        }else{
          return false;
        }
      }
    }
    return broadcasting_users;
  },

  addStreamObjects: function(){
    var self = this;

    setTimeout(function(){
      var users = self.getBroadcastingUsers();
      if( users ){
        for(var i=0; i < users.length; i++){
          var user = users[i];
          // console.log(user)
          var video_id = "guest-stream-video-"+user.stream.id;
          var width = $("#"+video_id).width(), height = $("#"+video_id).height();

          CSEventManager.broadcast("CONNECT_REMOTE_STREAM", { 
            identity: user.identity, 
            elementId: video_id, 
            width: width, 
            height: height
          });
        }
      }
    }, 200)

  },

  layoutStreamObjects: function(){
    var self = this;
    var player = $("#"+self.playerId);
    var playerParent = player.parent();
    player.css({
      width: playerParent.width(),
      height: playerParent.width() * 9/16
    });
  },

  render:function(){

    var self = this;
    var users = this.getBroadcastingUsers();
    var streamObjects = [];

    console.log("Player::RENDER", users);

    if(users){

      var player = $("#"+self.playerId);
      var totalUsers = users.length;

      for(var i=0; i < totalUsers; i++){
        
        var user = users[i];
        if(user){
          var containerW = player.width() / totalUsers;
          var container_id = "guest-stream-container-"+user.stream.id;
          var video_id = "guest-stream-video-"+user.stream.id;

          var origVideoH = $("#"+video_id).height();
          var videoH = player.height();
          var videoW = origVideoH * 9/16;
          var videoLeft = 0;

          var css = {
            container: {
              position:"absolute",
              width: containerW,
              height: player.height(),
              left: i*containerW,
              overflow: "hidden"
            },

            video: {
              position:"absolute",
              // width: videoW,
              // height: videoH,
              // left: videoLeft
            }
          }
          streamObjects.push(<EpisodePlayerStream key={i} css={css} container_id={container_id} video_id={video_id} stream_id={user.stream.id} user={user} />); 
        }
      }

    }

    return(
      <div id={this.playerId} className="episode-player">
        {streamObjects}
      </div>
    )
  }
});


