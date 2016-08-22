var EpisodeBackstageControls = React.createClass({

  componentWillMount: function(){ },
  componentDidMount: function() { },
  componentDidUpdate: function(){ },

  render:function(){

    var moderatorComponent = <EpisodeModeratorStateBtn episodeData={ this.props.episodeData } />;
    var guestListBtnComponent = <GuestListStateBtn episodeData={ this.props.episodeData } />;
    var guestListComponent = <EpisodeGuestList episodeData={ this.props.episodeData } />;


    if( this.props.episodeData.episode_state == "ENDED"){
      moderatorComponent = "";
      guestListBtnComponent = "";
      guestListComponent = ""; 
    }


    return(
      <section className="episode-controls">
        <header>
          <div className="online-status state_live"></div>
          <div className="control-menu">
            <EpisodeBroadcastStateBtn episodeData={ this.props.episodeData } />
            {moderatorComponent}
            <ChatStreamStateBtn episodeData={ this.props.episodeData } />
            {guestListBtnComponent}
          </div>
        </header>
        {guestListComponent}
      </section>
    )
  }
});


