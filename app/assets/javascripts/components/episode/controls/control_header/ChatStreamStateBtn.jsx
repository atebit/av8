var ChatStreamStateBtn = React.createClass({

  componentWillMount: function(){ },
  
  componentDidMount: function() {
    var self = this;
    $("#chat-state-btn").off();
    $("#chat-state-btn").on("click", function(e){
      if( self.props.episodeData.controls_view_state != "CHAT"){
        CSEventManager.broadcast("SET_CONTROLS_VIEW_STATE", "CHAT");
      }else{
        CSEventManager.broadcast("SET_CONTROLS_VIEW_STATE", "HIDDEN");
      }
    });
  },

  componentDidUpdate: function(){ },

  render:function(){

    var stateClasses = "menu-item",
        pendingCountBubbleComponent = "";

    if( this.props.episodeData.controls_view_state == "CHAT" ){
      // on chat state
      stateClasses += " focused " ;
    }else{
      pendingCountBubbleComponent = <div className="pending-count">88</div>;
    }

    return(
      <div id="chat-state-btn" className={stateClasses}>
        <div className="icon">
          <span className="fa fa-comments"></span>
        </div>
        <div className="title">Chat</div>
      </div>
    )
  }
});




    