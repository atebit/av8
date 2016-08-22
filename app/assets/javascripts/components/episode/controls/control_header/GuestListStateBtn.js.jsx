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


    var guestListCount = 0;
    var users = this.props.episodeData.users;

    if(users.length > 0){
      for(var i=0; i < users.length; i++){
        var user = users[i];
        if( user ){
          if( user.guest_state == "IN_LINE" || user.guest_state == "BROADCASTING"){
            if( user.role != "admin" ){
              guestListCount++;
            }
          }
        }
      }
    }


    var stateClasses = "menu-item",
        pendingCountComponent = "";

    if( this.props.episodeData.controls_view_state == "GUESTLIST" ){
      // on guestlist state
      stateClasses += " focused ";
    }else{
      if( guestListCount > 0 ){
        // not on guestlist state
        pendingCountComponent = <div className="pending-count">{guestListCount}</div>; 
      }
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




    