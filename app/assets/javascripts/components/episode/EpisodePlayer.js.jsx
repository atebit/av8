var EpisodePlayerStream = React.createClass({
  
  componentDidMount: function() {
    console.log("episode player stream mount")
  },

  render: function(){
    var css = this.props.css;
    // console.log("props", css)
    return(
      <div id={this.props.container_id} className="guest-stream" style={css.container}>
        <div id={this.props.video_id} style={css.video}></div>
        <div className="stream-identity">{this.props.identity}</div>
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
    $(window).resize();
    this.addStreamObjects();
  },

  componentDidUpdate: function() {
    this.addStreamObjects();    
  },

  addStreamObjects: function(){
    var self = this;
    for(var i=0; i < this.props.streams.length; i++){
      var video_id = "guest-stream-video-"+this.props.streams[i].id;
      var width = $("#"+video_id).width(), height = $("#"+video_id).height();

      CSEventManager.broadcast("CONNECT_REMOTE_STREAM", { 
        streamId: this.props.streams[i].id, 
        elementId: video_id, 
        width: width, 
        height: height
      });
    }

  },

  layoutStreamObjects: function(){
    var self = this;
    var player = $("#"+self.playerId);
    var playerParent = $("#"+self.playerId).parent();
    player.css({
      width: playerParent.width(),
      height: playerParent.width() * 9/16
    });
  },

  render:function(){
    var self = this;
    this.streamObjects = [].concat();

    var player = $("#"+self.playerId);
    var propStreams = $.unique(this.props.streams);
    // console.log(propStreams)

    // console.log("streams length", this.props.streams)
    var streamLength = propStreams.length;

    for(var i=0; i < streamLength; i++){
      var stream = propStreams[i];
      var identity = Params.query(stream.connection.data).email;
      var containerW = player.width() / streamLength;
      var container_id = "guest-stream-container-"+stream.id;
      var video_id = "guest-stream-video-"+stream.id;

      var origVideoH = $("#"+video_id).height();
      var videoH = player.height();
      var videoW = origVideoH * 9/16;
      // var videoLeft = (containerW/2)-(videoW/2);
      // var videoH = 0;
      // var videoW = 0;
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

      this.streamObjects.push(<EpisodePlayerStream key={i} css={css} container_id={container_id} video_id={video_id} stream_id={stream.id} identity={identity} />);
    }

    // console.log(this.streamObjects)

    // console.log(this.streamObjects)

    return(
      <div id={this.playerId} className="episode-player">
        {this.streamObjects}
      </div>
    )
  }
});


