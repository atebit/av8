var EpisodeGuestList = React.createClass({

  guestList: undefined,

  componentWillMount: function(){ },
  componentDidMount: function() { },
  componentDidUpdate: function(){ },

  render:function(){

    this.guestList = [];
    var users = this.props.episodeData.users;

    if(users.length > 0){
      for(var i=0; i < users.length; i++){
        var user = users[i];
        if( user ){
          if( user.guest_state == "IN_LINE" || user.guest_state == "BROADCASTING"){
            if( user.role != "admin" ){
              this.guestList.push(<EpisodeGuestListItem user={ user } episodeData={this.props.episodeData} key={i} />);
            }
          }
        }
      }
    }

    var stateClasses = "episode-control-content episode-guest-list";
    if(this.props.episodeData.controls_view_state == "GUESTLIST"){
      stateClasses += " state_active ";
    }else{
      stateClasses += " state_inactive ";
    }

    console.log("Render Episode Guest List")

    return(
      <section className={stateClasses}>
        {this.guestList}
      </section>
    )
  }
});


