var EpisodePublic = React.createClass({

  mixins: [EpisodeMixin],
  session_state: "PRESHOW",

  etInitialState: function() {
    return {
      guest_state: ""
    };
  },

  componentWillMount: function() {
    this.subclassName = "Public";
    this.session_state = "PRESHOW";
  },
  
  componentDidMount: function() {
    var self = this;
    /// click events, etc
    self.init();
    this.session.on("signal", this.receiveSignal);

    $("#get-in-line-btn").on("click", function(e){
      if(self.state){
        if( self.state.guest_state == undefined || self.state.guest_state == "WATCHING"){
          self.connectLocalStream();      
        }
        if(self.state.guest_state == "IN_LINE"){
          self.disconnectLocalStream(); 
          self.sendGlobalSignal("GUEST_LEFT_LINE", self.identity);
          self.setState({ guest_state: "WATCHING" });  
        }
        if(self.state.guest_state == "BROADCASTING"){
          self.disconnectLocalStream(); 
          self.sendGlobalSignal("GUEST_LEFT_BROADCAST", self.identity);
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

  receiveSignal: function(e){ 
    var self = this;
    var data = e.data;

    switch( e.type ){

      case "signal:UPDATE_SESSION_STATUS":
        console.log("signal recieved to update SESSION STATUS", data);
        this.updatedUserSessionStatus( self.identity, data )
        break;

      case "signal:REMOVED_FROM_LINE":
        console.log("Moderator removed you from line", data);

        var user = this.getUserByIdentity( this.identity );
        user.session_status = "removed";
        this.disconnectLocalStream(); 
        this.setState({guest_state: "WATCHING"});  
        alert("The moderator removed you from the line.")

        break;

      case "signal:REMOVED_FROM_BROADCAST":
        console.log("Moderator removed you from broadcast", data);
        var user = this.getUserByIdentity( this.identity );
        user.session_status = "removed";
        this.disconnectLocalStream(); 
        this.setState({guest_state: "WATCHING"});  
        alert("The moderator removed you from the broadcast.")

        break;

      case "signal:UPDATE_BROADCAST":
        console.log("global update broadcast");
        var publishedStreamIdentities = e.data.split(",");
        this.updateBroadcastPlayer( publishedStreamIdentities );
        break;

      case "signal:BROADCAT_ENDED":
        console.log("broadcast ended");
        break;

      case "signal:ESPISODE_STATUS_UPDATE":
        this.session_state = data;
        console.log("episode status update", data);
        if( data == "ENDED" ){

          // this.removeAllStreams();
          this.forceUpdate();
        }
        break;
    }
  },

  // update the player

  updateBroadcastPlayer: function( published_identities ){

    // TODO: check to see if the player needs to update or not... 
    // If not, don't update because it causes a blink to the users that don't need it.

    var isSelfStream = false;

    // loop through passed identities
    for(var i=0; i < published_identities.length; i++){
      var loop_identity = published_identities[i];
      // loop through users
      for(var j=0; j < this.users.length; j++){
        var user = this.users[j];
        // if user is one of the identities
        if( user.identity == loop_identity ){
          // set the props
          user.player_status = "can_mount";
          user.session_status = "broadcasting";
          if( this.identity == user.identity ){
            isSelfStream = true;
          }
        }
      }
    }

    // if no users were passed, remove any that are on the broadcast..
    console.log(published_identities)
    if(published_identities.length == 0 || published_identities[0] == ""){
      this.removeAllStreams();
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
    var yourStreamClasses = "";

    console.log("render", this.state)



    if(this.state){
      if(this.state.guest_state == "IN_LINE"){
        inlineButton = <button id="get-in-line-btn">Leave Line</button>;
      } 
      if(this.state.guest_state == "BROADCASTING"){
        inlineButton = <button id="get-in-line-btn">Leave Broadcast</button>;
        yourStreamClasses = " hidden ";
      } 

      if(this.state == "ended"){
        inlineButton = "";
        yourStreamClasses = " hidden ";
      }
    }

    // this.logSessionInfo();

    return(
      <div className="container max-video-width episode-container">
        <div className="episode-menu menu-left">
          <div className="menu-left-controls">
            <div>{this.session_state}</div>
          </div>
          <div className="episode-menu-inner">
            {inlineButton}
          </div>
        </div>
        <EpisodePlayer users={ this.users } context={this} />
        <div id="your-stream" className={yourStreamClasses}></div>
      </div>
    )
  }
});


