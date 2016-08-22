var EpisodePublicControls = React.createClass({

  componentWillMount: function(){ },
  componentDidMount: function() { },
  componentDidUpdate: function(){ },

  render:function(){

    var guestState = <EpisodeGuestStateBtn episodeData={ this.props.episodeData } />;

    if( this.props.episodeData.episode_state == "ENDED"){
      guestState = "";
    }

    return(
      <section className="episode-controls">
        <header>
          <div className="online-status state_live"></div>
          <div className="control-menu">
            <EpisodeBroadcastStateIcon episodeData={ this.props.episodeData } />
            {guestState}
            <ChatStreamStateBtn episodeData={ this.props.episodeData } />
          </div>
        </header>

      </section>
    )
  }
});


