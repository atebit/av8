var EpisodeGuestStateBtn = React.createClass({

  componentWillMount: function(){ },
  
  componentDidMount: function() {

    var self = this;
    $("#guest-state-btn").off();
    $("#guest-state-btn").on("click", function(e){

      var guest_state = self.props.episodeData.guest_state;

      if( guest_state == "WATCHING" || guest_state == undefined){
        CSEventManager.broadcast("SET_GUEST_STATE", "JOIN_LINE");

      }else if( guest_state = "IN_LINE" ){
        CSEventManager.broadcast("SET_GUEST_STATE", "LEFT_LINE");

      }else if( guest_state = "BROADCASTING" ){
        CSEventManager.broadcast("SET_GUEST_STATE", "LEFT_BROADCAST");

      }
    });
  },

  componentDidUpdate: function(){ },

  render:function(){

    console.log("Guest State Btn: ",this.props.episodeData)

    var text = "",
        stateClasses = "menu-item";
        
    if( this.props.episodeData.guest_state == "BROADCASTING" ){
      // broadcasting
      text = "Leave Broadcast";
      stateClasses += " focused ";
        
    }else if( this.props.episodeData.guest_state == "IN_LINE" ){
      // broadcasting
      text = "In Line";
      stateClasses += " in-line  ";

    }else{
      // not broadcasting, not ended..
      text = "Join Broadcast";
    }

    return(
      <div id="guest-state-btn" className={stateClasses}>
        <div className="icon icon-guest-state">
          <span className="fa fa-video-camera"></span>
        </div>
        <div className="title">{text}</div>
      </div>
    )
  }
});


