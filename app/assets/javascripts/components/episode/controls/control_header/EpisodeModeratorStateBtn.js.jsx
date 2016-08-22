var EpisodeModeratorStateBtn = React.createClass({

  componentWillMount: function(){ },
  
  componentDidMount: function() {
    var self = this;
    $("#moderator-state-btn").off();
    $("#moderator-state-btn").on("click", function(e){
      if( self.props.episodeData.guest_state != "BROADCASTING"){
        CSEventManager.broadcast("SET_MODERATOR_STATE", "BROADCASTING");
      }else{
        CSEventManager.broadcast("SET_MODERATOR_STATE", "WATCHING");
      }
    });
  },

  componentDidUpdate: function(){ },

  render:function(){

    // console.log(this.props.episodeData)

    var text = "",
        stateClasses = "menu-item";
        
    if( this.props.episodeData.guest_state == "BROADCASTING" ){
      // broadcasting
      text = "Leave Broadcast";
      stateClasses += " focused ";
    }else{
      // not broadcasting, not ended..
      text = "Join Broadcast";
    }

    return(
      <div id="moderator-state-btn" className={stateClasses}>
        <div className="icon icon-guest-state">
          <span className="fa fa-video-camera"></span>
        </div>
        <div className="title">{text}</div>
      </div>
    )
  }
});


