var EpisodeGuestList = React.createClass({

  componentWillMount: function(){ },
  componentDidMount: function() { },
  componentDidUpdate: function(){ },

  render:function(){

    var guestList = [];
    var users = this.props.episodeData.users;

    if(users.length > 0){
      for(var i=0; i < users.length; i++){
        var user = users[i];
        if( user ){
          if( user.guest_state == "IN_LINE" || user.guest_state == "BROADCASTING"){
            if( user.role != "admin" ){
              guestList.push(<EpisodeGuestListItem user={ user } episodeData={this.props.episodeData} key={i} />);
            }
          }
        }
      }
    }

    var stateClasses = "episode-control-content episode-guest-list";
    if(this.props.episodeData.controls_view_state == "GUESTLIST"){
      stateClasses += " state_active ";
    }

    return(
      <section className={stateClasses}>
        {guestList}
      </section>
    )
  }
});


