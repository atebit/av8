var EpisodeBroadcastStateBtn = React.createClass({

  componentWillMount: function(){ },
  
  componentDidMount: function() {
    var self = this;
    $("#broadcast-state-btn").off();
    $("#broadcast-state-btn").on("click", function(e){

      if( self.props.episodeData.episode_state == "FUTURE"){
        CSEventManager.broadcast("SET_EPISODE_STATE", "LIVE");

      }else if( self.props.episodeData.episode_state == "PRESHOW"){
        CSEventManager.broadcast("SET_EPISODE_STATE", "LIVE");

      } else if( self.props.episodeData.episode_state == "LIVE"){
        CSEventManager.broadcast("SET_EPISODE_STATE", "ENDED");

      }else{
        // nothing to see here..
      }


    });
  },

  componentDidUpdate: function(){ },

  render:function(){

    var stateClasses = "",
        text = "";

    if( this.props.episodeData.episode_state == "LIVE" ){
      text = "End Broadcast";
      stateClasses = " icon icon-broadcast-state live ";

    }else if( this.props.episodeData.episode_state == "ENDED" ){
      text = "Ended";
      stateClasses = " icon icon-broadcast-state ";

    }else{
      text = "Start Broadcast";
      // not broadcasting, not ended..
      stateClasses = " icon icon-broadcast-state ";
    }

    return(
      <div id="broadcast-state-btn" className="menu-item focused">
        <div className={ stateClasses }>
          <span className="fa fa-power-off"></span>
        </div>
        <div className="title">{text}</div>
      </div>
    )
  }
});


