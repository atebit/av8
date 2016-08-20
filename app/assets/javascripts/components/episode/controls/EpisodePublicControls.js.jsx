var EpisodePublicControls = React.createClass({

  componentWillMount: function(){ },
  componentDidMount: function() { },
  componentDidUpdate: function(){ },

  render:function(){

    return(
      <section className="episode-controls">

        <header>
          <div className="online-status state_live"></div>
          <div className="control-menu">
            <EpisodeBroadcastStateIcon episodeData={ this.props.episodeData } />
            <EpisodeGuestStateBtn episodeData={ this.props.episodeData } />
            <ChatStreamStateBtn episodeData={ this.props.episodeData } />
          </div>
        </header>

      </section>
    )
  }
});


