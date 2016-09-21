var EpisodePlayer = React.createClass({

  componentWillMount: function() {
    this.playerId = "episode-player-"+Guid.get();
  },
  
  componentDidMount: function() {
    var self = this;
    $(window).resize(function(){  self.layoutStreamObjects();  });
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

    var users = self.getBroadcastingUsers();
    if( users ){
      for(var i=0; i < users.length; i++){
        var user = users[i];
        // console.log(user)
        var video_id = "guest-stream-video-"+user.stream.id;
        var width = $("#"+video_id).width(), height = $("#"+video_id).height();

        CSEventManager.broadcast("CONNECT_REMOTE_STREAM", { 
          identity: user.identity, 
          width: width, 
          height: height
        });
      }
    }

  },

  layoutStreamObjects: function(){
    var self = this;
    var player = $("#"+self.playerId);
    var playerParent = player.parent();
    player.css({
      width: playerParent.width(),
      height: playerParent.width() * 9/16
    });
    
    this.forceUpdate();
  },

  render:function(){

    var self = this;
    var users = this.getBroadcastingUsers();
    var streamObjects = [];

    if(users){

      var player = $("#"+self.playerId);
      var totalUsers = users.length;

      for(var i=0; i < totalUsers; i++){
        
        var user = users[i];
        if(user){
          // console.log("EpisodePlayer::user found")
          var containerW = player.width() / totalUsers;
          var container_id = "guest-stream-container-"+user.stream.id;
          var video_id = "guest-stream-video-"+user.stream.id;

          var css = {
            container: {
              position:"absolute",
              width: containerW,
              height: player.height(),
              left: i*containerW,
              overflow: "hidden"
            }
          }
          streamObjects.push(
            <EpisodePlayerStream 
              key={i} 
              css={css} 
              container_id={container_id} 
              video_id={video_id} 
              stream={user.stream} 
              stream_id={user.stream.id} 
              user={user} />
          ); 
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


