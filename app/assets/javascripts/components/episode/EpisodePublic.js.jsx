var EpisodePublic = React.createClass({

  mixins: [EpisodeMixin],

  etInitialState: function() {
    return {
      guest_state: ""
    };
  },

  componentWillMount: function() {
    this.subclassName = "Public";
  },
  
  componentDidMount: function() {
    var self = this;
    /// click events, etc
    self.init();
    this.session.on("signal", this.receiveGlobalSignal);

    $("#get-in-line-btn").on("click", function(e){

      if(self.state){
        if( self.state.guest_state == undefined || self.state.guest_state == "WATCHING"){
          self.connectLocalStream();      
        }

        if(self.state.guest_state == "IN_LINE"){
          self.disconnectLocalStream(); 
          self.sendGlobalSignal("GUEST_LEFT_LINE", self.stream_id);
          self.setState({guest_state: "WATCHING"});  
        } 

        if(self.state.guest_state == "BROADCASTING"){
          self.disconnectLocalStream(); 
          self.sendGlobalSignal("GUEST_LEFT_BROADCAST", self.stream_id);
          self.setState({guest_state: "WATCHING"});  
        }
      }

    });

    // initial state..
    this.setState({guest_state: "WATCHING"});  
  },

  componentDidUpdate: function(){
    // component updated.
  },

  receiveGlobalSignal: function(e){ 
    var self = this;

    if(e.type == "signal:UPDATE_BROADCAST"){
      var publishedStreamIds = e.data.split(",");
      this.updateBroadcastPlayer( publishedStreamIds );
    }
  },


  // update the player

  updateBroadcastPlayer: function( publishedStreamIds ){
    var isSelfStream = false;
    for(var i=0; i < publishedStreamIds.length; i++){
      for(var j=0; j < this.connected_streams.length; j++){
        // add published screens to the player..
        if(this.connected_streams[j].id == publishedStreamIds[i]){
          this.published_streams.push( this.connected_streams[j] );     
        }
        if( this.publisher ){
          if( this.publisher.stream ){
            if( this.connected_streams[j].id == this.publisher.stream.id ){
              isSelfStream = true;
            } 
          } 
        }
      }
    }
    if(isSelfStream){
      this.setState({guest_state:"BROADCASTING"});
    }else{
      this.forceUpdate(); 
    }
  },

  render:function(){

    // local vars
    var inlineButton = <button id="get-in-line-btn">Get In Line</button>;

    if(this.state){
      if(this.state.guest_state == "IN_LINE"){
        inlineButton = <button id="get-in-line-btn">Leave Line</button>;
      } 
      if(this.state.guest_state == "BROADCASTING"){
        inlineButton = <button id="get-in-line-btn">Leave Broadcast</button>;
      } 
    }


    return(
      <div className="container">
        <header>
          {inlineButton}
        </header>
        <EpisodePlayer streams={this.published_streams} context={this} />
        <div id="your-stream"></div>
      </div>
    )
  }
});


