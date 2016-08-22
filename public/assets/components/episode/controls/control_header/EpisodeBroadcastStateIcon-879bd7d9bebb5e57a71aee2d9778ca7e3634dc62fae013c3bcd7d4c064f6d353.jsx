var EpisodeBroadcastStateIcon = React.createClass({

  componentWillMount: function(){ },
  componentDidMount: function() {},
  componentDidUpdate: function(){ },

  render:function(){

    var stateClasses = "broadcast-status-icon",
        text = this.props.episodeData.episode_state;

    if( text == "LIVE" ){
      stateClasses = " broadcast-status-icon live ";
    }

    return(
      <div className="menu-item">
        <div className="icon">
          <span className={stateClasses}></span>
        </div>
        <div className="title">{text}</div>
      </div>
    )
  }
});


