var EpisodePlayerStream = React.createClass({
  
  componentDidMount: function() {
    // console.log("episode player stream mount")
  },

  render: function(){
    return(
      <div id={this.props.container_id} className="guest-stream">
        <div id={this.props.video_id}></div>
      </div> 
    )
  }
});

var EpisodePlayer = React.createClass({

  streamObjects:[],

  componentWillMount: function() {
    this.playerId = "episode-player-"+Guid.get();
  },
  
  componentDidMount: function() {
    var self = this;
    $(window).resize(function(){ self.layoutStreamObjects(); });
    this.addStreamObjects();
  },

  componentDidUpdate: function() {
    this.addStreamObjects();    
  },

  addStreamObjects: function(){

    var self = this;
    for(var i=0; i < this.props.streams.length; i++){
      var video_id = "guest-stream-video-"+this.props.streams[i].id;
      CSEventManager.broadcast("CONNECT_REMOTE_STREAM", { streamId: this.props.streams[i].id, elementId: video_id });
    }

    CSEventManager.broadcast("UPDATE_GUESTS");
  },

  layoutStreamObjects: function(){
    var self = this;
    var player = $("#"+self.playerId);
    // player width/height
    var playerParent = $("#"+self.playerId).parent();
    player.css({
      width: playerParent.width(),
      height: playerParent.width() * 9/16
    });
  },

  render:function(){
    this.streamObjects = [].concat();
    for(var i=0; i < this.props.streams.length; i++){
      var container_id = "guest-stream-container-"+this.props.streams[i].id;
      var video_id = "guest-stream-video-"+this.props.streams[i].id;
      this.streamObjects.push(<EpisodePlayerStream key={i} container_id={container_id} video_id={video_id} />);
    }

    return(
      <div id={this.playerId} className="episode-player">
        {this.streamObjects}
      </div>
    )
  }
});


