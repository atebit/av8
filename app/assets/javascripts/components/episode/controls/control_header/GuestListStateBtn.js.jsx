var GuestListStateBtn = React.createClass({

  componentWillMount: function(){ },
  
  componentDidMount: function() {
    var self = this;
    $("#guestlist-state-btn").off();
    $("#guestlist-state-btn").on("click", function(e){
      if( self.props.episodeData.controls_view_state != "GUESTLIST"){
        CSEventManager.broadcast("SET_CONTROLS_VIEW_STATE", "GUESTLIST");
      }else{
        CSEventManager.broadcast("SET_CONTROLS_VIEW_STATE", "HIDDEN");
      }
    });
  },

  componentDidUpdate: function(){ },

  render:function(){

    var stateClasses = "menu-item",
        pendingCountComponent = "";

    if( this.props.episodeData.controls_view_state == "GUESTLIST" ){
      // on guestlist state
      stateClasses += " focused ";
    }else{
      // not on guestlist state
      pendingCountComponent = <div className="pending-count">88</div>;
    }

    return(
      <div id="guestlist-state-btn" className={ stateClasses }>
        <div className="icon">
          <span className="fa fa-users"></span>
        </div>
        <div className="title">Guest List</div>
        { pendingCountComponent }
      </div>
    )
  }
});




    