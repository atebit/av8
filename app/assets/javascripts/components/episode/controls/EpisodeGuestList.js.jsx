var EpisodeGuestList = React.createClass({

  componentWillMount: function(){
  },
  
  componentDidMount: function() {
  },

  componentDidUpdate: function(){
    // component updated.
  },

  render:function(){

    return(

      <section className="episode-control-content episode-guest-list state_active">

        <div className="guest-list-item state_broadcasting">
          <div className="guest-info">
            <div className="avatar"></div>
            <div className="identity">
              <div className="name">Eyal Levi</div>
              <div className="email">mrjumping@gmail.com</div>
            </div>
          </div>
        </div>

        <div className="guest-list-item state_in-line">
          <div className="guest-info">
            <div className="avatar"></div>
            <div className="identity">
              <div className="name">Eyal Levi</div>
              <div className="email">mrjumping@gmail.com</div>
            </div>
          </div>
        </div>

        <div className="guest-list-item state_show-controls">
          <div className="guest-info">
            <div className="avatar"></div>
            <div className="identity">
              <div className="name">Eyal Levi</div>
              <div className="email">mrjumping@gmail.com</div>
            </div>
          </div>
          <div className="guest-controls">
            <div className="menu-item">
              <div className="icon"></div>
              <div className="title">Preview</div>
            </div>
            <div className="menu-item">
              <div className="icon"></div>
              <div className="title">Add</div>
            </div>
            <div className="menu-item">
              <div className="icon"></div>
              <div className="title">Remove</div>
            </div>
            <div className="menu-item">
              <div className="icon"></div>
              <div className="title">PM</div>
            </div>
          </div>
        </div>

      </section>
    )
  }
});


