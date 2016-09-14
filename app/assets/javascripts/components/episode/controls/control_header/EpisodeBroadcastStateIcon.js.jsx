var EpisodeBroadcastStateIcon = React.createClass({

  componentWillMount: function(){ },
  componentDidMount: function() {},
  componentDidUpdate: function(){ },

  render:function(){

    var stateClasses = "menu-item",
        text = this.props.episodeData.episode_state;

    if( text == "LIVE" ){
      stateClasses = "menu-item focused ";
    }

    return(
      <div className={stateClasses}>
        <div className="icon">
          <span className='broadcast-status-icon'></span>
        </div>
        <div className="title">{text}</div>
      </div>
    )
  }
});


