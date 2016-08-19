var EpisodeControls = React.createClass({

  componentWillMount: function(){
  },
  
  componentDidMount: function() {
  },

  componentDidUpdate: function(){
    // component updated.
  },

  render:function(){

    return(
      <section className="episode-controls">

        <header>
          <div className="online-status state_live"></div>
          <div className="control-menu">
            <div className="menu-item focused">
              <div className="icon icon-broadcast-state">
                <span className="fa fa-power-off"></span>
              </div>
              <div className="title">Start Broadcast</div>
            </div>
            <div className="menu-item">
              <div className="icon">
                <span className="fa fa-video-camera"></span>
              </div>
              <div className="title">Join Broadcast</div>
            </div>
            <div className="menu-item">
              <div className="icon">
                <span className="fa fa-comments"></span>
              </div>
              <div className="title">Chat</div>
              <div className="pending-count">88</div>
            </div>
            <div className="menu-item">
              <div className="icon">
                <span className="fa fa-users"></span>
              </div>
              <div className="title">Guest List</div>
              <div className="pending-count">88</div>
            </div>
          </div>
        </header>

        <EpisodeGuestList />

      </section>
    )
  }
});


