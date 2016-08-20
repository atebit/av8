var EpisodeBackstageControls = React.createClass({

  componentWillMount: function(){ },
  componentDidMount: function() { },
  componentDidUpdate: function(){ },

  render:function(){

    return(
      <section className="episode-controls">

        <header>
          <div className="online-status state_live"></div>
          <div className="control-menu">
            <EpisodeBroadcastStateBtn episodeData={ this.props.episodeData } />
            <EpisodeModeratorStateBtn episodeData={ this.props.episodeData } />
            <ChatStreamStateBtn episodeData={ this.props.episodeData } />
            <GuestListStateBtn episodeData={ this.props.episodeData } />
          </div>
        </header>

        <EpisodeGuestList episodeData={ this.props.episodeData } />

      </section>
    )
  }
});


