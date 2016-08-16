var EpisodePublic = React.createClass({

  mixins: [EpisodeMixin],

  componentWillMount: function() {
    this.subclassName = "Public";
    this.episode_state = this.props.episode_state;
  },
  
  componentDidMount: function() {

    if( this.episode_state == "ENDED" ){

      console.log("This Episode has ended.");

    }else{

      var self = this;
      /// click events, etc
      self.init();
      this.session.on("signal", this.receiveSignal);

      $("#get-in-line-btn").on("click", function(e){
        if(self.guest_state){
          if( self.guest_state == undefined || self.guest_state == "WATCHING"){
            self.connectLocalStream();      
          }
          if(self.guest_state == "IN_LINE"){
            self.disconnectLocalStream(); 
            self.sendGlobalSignal("GUEST_LEFT_LINE", self.identity);
            self.setState({ guest_state: "WATCHING" });  
          }
          if(self.guest_state == "BROADCASTING"){
            self.disconnectLocalStream(); 
            self.sendGlobalSignal("GUEST_LEFT_BROADCAST", self.identity);
            self.setState({guest_state: "WATCHING"});  
          }
        }
      });

      // initial state..
      this.guest_state = "WATCHING";
      this.forceUpdate();

    }
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
        // console.log("Moderator removed you from line");

        var user = this.getUserByIdentity( this.identity );
        user.guest_state = "WATCHING";

        this.disconnectLocalStream(); 
        this.guest_state = "WATCHING";
        this.forceUpdate();
        
        break;

      case "signal:REMOVED_FROM_BROADCAST":
        // console.log("Moderator removed you from broadcast");
        
        var user = this.getUserByIdentity( this.identity );
        user.guest_state = "WATCHING";

        this.disconnectLocalStream(); 
        this.guest_state = "WATCHING";
        this.forceUpdate();

        break;

      case "signal:UPDATE_BROADCAST":
        // console.log("global update broadcast");
        var publishedStreamIdentities = e.data.split(",");
        this.updateBroadcastPlayer( publishedStreamIdentities );
        break;

      case "signal:MODERATOR_CONNECTED":
      case "signal:MODERATOR_DISCONNECTED":
        // console.log("Moderator has joined, fetch state from the server.");
        // var publishedStreamIdentities = e.data.split(",");
        // this.updateBroadcastPlayer( publishedStreamIdentities );
        // TODO: hack to reload based on moderator dropping out..
        // self.getEpisodeState();

        location.reload();
        break;

      case "signal:ESPISODE_STATUS_UPDATE":
        this.episode_state = data;
        // console.log("episode status update", data);
        if( data == "ENDED" ){
          this.removeAllStreams();
          this.guest_state = "ENDED"
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
      // loop through users
    for(var j=0; j < this.users.length; j++){
      var user = this.users[j];

      // auto set the users status to nope
      user.guest_state = "REMOVED";
      user.player_status = "REMOVED";

      for(var i=0; i < published_identities.length; i++){
        var loop_identity = published_identities[i];
        // if user is one of the identities
        if( user.identity == loop_identity ){
          // set the props
          user.guest_state = "BROADCASTING";
          user.player_status = "CAN_MOUNT";
          if( this.identity == user.identity ){
            isSelfStream = true;
          }
        }

      }
    }

    // if no users were passed, remove any that are on the broadcast..
    // console.log(published_identities)
    if(published_identities.length == 0 || published_identities[0] == ""){
      this.removeAllStreams();
    }


    if(isSelfStream){
      this.guest_state = "BROADCASTING"
      this.forceUpdate();
    }else{
      this.guest_state = "WATCHING"
      this.forceUpdate();
    }
  },

  render:function(){

    var inlineButton = "";
    var yourStreamClasses = "";

    console.log("render", this.guest_state);

    
    if( this.episode_state != "ENDED" ){

      inlineButton = <button id="get-in-line-btn">Get In Line</button>;

      if(this.guest_state == "IN_LINE"){
        inlineButton = <button id="get-in-line-btn">Leave Line</button>;
      } 
      if(this.guest_state == "BROADCASTING"){
        inlineButton = <button id="get-in-line-btn">Leave Broadcast</button>;
        yourStreamClasses = " hidden ";
      } 
      if(this.guest_state == "ENDED"){
        inlineButton = "";
        yourStreamClasses = " hidden ";
      }
    }

    // this.logSessionInfo();

    return(
      <div className="container max-video-width episode-container">
        <div className="episode-menu menu-left">
          <div className="menu-left-controls">
            <div>{this.episode_state}</div>
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


