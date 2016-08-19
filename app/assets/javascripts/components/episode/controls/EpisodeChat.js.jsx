var EpisodeChat = React.createClass({

  componentWillMount: function(){
  },
  
  componentDidMount: function() {
  },

  componentDidUpdate: function(){
    // component updated.
  },

  render:function(){

    return(

      <section className="episode-control-content episode-chat">

        <div className="guest-list-item state_broadcasting">
          <div className="guest-info">
            <div className="avatar"></div>
            <div className="identity">
              <div className="name">Eyal Levi</div>
              <div className="content">You'll never believe what happnend to me today!</div>
            </div>
          </div>
        </div>

      </section>
    )
  }
});


