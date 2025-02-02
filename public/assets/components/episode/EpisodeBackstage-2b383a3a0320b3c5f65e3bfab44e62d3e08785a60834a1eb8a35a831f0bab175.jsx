var EpisodeBackstage = React.createClass({

  mixins: [EpisodeMixin],

  session_state: "PRESHOW",


  // TODO: save the current state of the USERS table to the persons cookies.
  // that way, if the admin drops off for a sec, they will be able to refresh.
  // another good way is to maybe periodically send that info to the api just in case
  

  componentWillMount: function() {
    // listeners... init, etc
    this.subclassName = "Backstage";
    this.guest_state = "WATCHING";
    this.session_state = "PRESHOW";
  },
  
  componentDidMount: function() {
    // from the EpisodeFanListItem
    CSEventManager.addListener("SHOW_GUEST_PREVIEW", this, "showGuestPreview");
    CSEventManager.addListener("HIDE_GUEST_PREVIEW", this, "hideGuestPreview");
    CSEventManager.addListener("IGNORE_IN_LINE_GUEST", this, "ignoreInlineGuest");
    CSEventManager.addListener("PUBLISH_GUEST", this, "publishGuest");
    CSEventManager.addListener("UNPUBLISH_GUEST", this, "unpublishGuest");

    CSEventManager.addListener("UPDATE_GUESTS", this, "updateGuests");
    CSEventManager.addListener("INITIATE_CHAT", this, "initiateChat");

    // super class init
    this.init();
    this.session.on("signal", this.receiveSignal);

    this.setInteractions();
  },

  // event listener relays
  ignoreInlineGuest: function(data){ this.removeGuestFromLine( data.identity ); },
  showGuestPreview: function(data){ this.connectToRemoteStream( data.identity, data.elementId ); },
  hideGuestPreview: function(data){ /* this.forceUpdate(); */ },
  publishGuest: function(data){ this.addGuestToBroadcast( data.identity ); },
  unpublishGuest: function(data){ this.removeGuestFromBroadcast( data.identity ); },
  updateGuests: function(data){ /* this.removeGuestFromBroadcast( data.stream.id ); */ },


  componentDidUpdate: function(){
    // component updated.
    this.setInteractions();
  },

  setInteractions: function(){
    var self = this;
    $("#join-btn").off();
    $("#join-btn").on("click", function(e){
      console.log("join")
      self.addGuestToBroadcast( self.identity );
      self.guest_state = "BROADCASTING";
      self.forceUpdate();
    });

    $("#leave-btn").off();
    $("#leave-btn").on("click", function(e){
      console.log("leave")
      self.removeGuestFromBroadcast( self.identity );
      self.guest_state = "WATCHING";
      self.forceUpdate();
    });

    $("#start-btn").off();
    $("#start-btn").on("click", function(e){
      self.session_state = "LIVE";
      self.sendGlobalSignal("ESPISODE_STATUS_UPDATE", self.session_state);
      self.updateBroadcast();
      self.forceUpdate();
    });

    $("#end-btn").off();
    $("#end-btn").on("click", function(e){
      self.session_state = "ENDED";
      self.sendGlobalSignal("ESPISODE_STATUS_UPDATE", self.session_state);
      self.updateBroadcast();
      self.forceUpdate();
    });

    // $("#preview-btn").off();
    // $("#preview-btn").on("click", function(e){
      
    // });
  },

  // tokbox message signal..
  receiveSignal: function(e){
    // console.log("signal received: ", e);
    var self = this;
    var data = e.data;

    switch( e.type ){
      case "signal:GUEST_JOINED_ROOM":
        this.guestJoinedRoom( data );
        break;

      case "signal:GUEST_LEFT_ROOM":
        this.guestLeftRoom( data );
        break;

      case "signal:GUEST_JOINED_LINE":
        this.addGuestToLine( data );
        break;

      case "signal:GUEST_LEFT_LINE":
        this.removeGuestFromLine( data );
        break;

      case "signal:GUEST_LEFT_BROADCAST":
        this.removeGuestFromBroadcast( data );
        break;

    }
  },

  // guest handlers..

  guestJoinedRoom: function( identity ){
    var self = this;
    if( identity != self.identity ){
      // console.log("guest joined room", identity);
      // TODO:  SEND A SPECIFIC MESSAGE TO THE PERSON WHO JOINED.
      if( self.session_state == "LIVE" ){
        self.updateBroadcast(); 
      }else if(self.session_state == "ENDED"){
        // self.endEpisode();
      }
    }
  },

  guestLeftRoom: function( identity ){
    var self = this;
    // console.log("guest left room", identity);
    var user = self.getUserByIdentity( identity );
    if( user ){
      self.removeGuestFromLine( identity );
      self.removeGuestFromBroadcast( identity );
      this.updateBroadcast(); 
    }
  },

  // conference management functions..

  addGuestToLine: function( identity ){
    // console.log("Admin: guest joined line", identity);
    this.updateUserSessionStatus( identity, "in_line" );
    // update this page
    this.forceUpdate();
  },

  removeGuestFromLine: function( identity ){
    // console.log("admin: guest left line", identity);
    var user = this.getUserByIdentity( identity );
    user.player_status = "removed";
    user.session_status = "removed";
    // shoot them a direct message..
    this.sendDirectSignal( identity, "REMOVED_FROM_LINE", {identity: identity});
    // update this page
    this.forceUpdate();
  },

  addGuestToBroadcast: function( identity ){
    // console.log("admin: add guest to broadcast", identity)
    var user = this.getUserByIdentity( identity );
    user.player_status = "can_mount";
    user.session_status = "broadcasting";
    // update the broadcast with new guest..
    this.updateBroadcast();
    // reload this page..
    this.forceUpdate();
  },

  removeGuestFromBroadcast: function( identity ){
    console.log("Admin: remove guest", identity);
    var user = this.getUserByIdentity( identity );
    user.player_status = "removed";
    user.session_status = "removed";
    // shoot them a direct message..
    this.sendDirectSignal( identity, "REMOVED_FROM_BROADCAST", {identity: identity});
    // update the broadcast..
    this.updateBroadcast();
    // update this page..
    this.forceUpdate();
  },

  updateBroadcast: function(){
    console.log("admin: update broadcast");
    //
    if( this.session_state == "LIVE"){
      var broadcasting_users = [];
      // push identities of the current broadcasters..
      for(var i=0; i < this.users.length; i++){
        var user = this.users[i];
        var identity = user.identity;
        if(user.session_status == "broadcasting"){
          broadcasting_users.push( identity ); 
        }
      }
      // convert to string for passing through signal
      var identities = broadcasting_users.toString();
      // send it
      this.sendGlobalSignal("UPDATE_BROADCAST", identities);
      // update this page.
      this.forceUpdate(); 

    }else if(this.session_state == "ENDED"){
      //
      this.sendGlobalSignal("BROADCAST_ENDED");
      this.removeAllStreams();
      //
      this.forceUpdate();
    }
  },


  // view
  render:function(){

    var self = this;
    var guestsInLineList = [];

    if(this.users.length > 0){
      for(var i=0; i < this.users.length; i++){
        var user = this.users[i];
        if( user ){
          if( user.session_status == "in_line" || user.session_status == "broadcasting"){
            if( user.role != "admin" ){
              guestsInLineList.push(<EpisodeFanListItem user={ user } key={i} />);
            }
          }
        }
      }
    }

    var guestsInLineComponent = "";
    if(guestsInLineList.length > 0){
      guestsInLineComponent = 
        <div className="guests-in-line">
          <p>Guests in line</p>
          <div id="fan-list">{guestsInLineList}</div>
        </div>;
    }


    var prevBtn,
        startBtn,
        endBtn;

    // this.logSessionInfo();

    switch(this.session_state){
        case "PRESHOW":
          // prevBtn = <button id="prev-btn">Preview</button>;
          startBtn = <button id="start-btn">Start Show</button>;
          // endBtn = <button id="end-btn">End Show</button>;
        break;

      case "PREVIEW":
          // prevBtn = <button id="prev-btn">Preview</button>;
          startBtn = <button id="start-btn">Start Show</button>;
          // endBtn = <button id="end-btn">End Show</button>;
        break;

      case "LIVE":
          // prevBtn = <button id="prev-btn">Preview</button>;
          // startBtn = <button id="start-btn">Start Show</button>;
          endBtn = <button id="end-btn">End Show</button>;

      case "ENDED":
          // prevBtn = <button id="prev-btn">Preview</button>;
          // startBtn = <button id="start-btn">Start Show</button>;
          // endBtn = <button id="end-btn">End Show</button>;

    }
      
    var joinBtn = <button id="join-btn">Join Broadcast</button>;
    var yourStreamClasses = "";

    if(this.guest_state == "BROADCASTING" ){
      joinBtn = <button id="leave-btn">Leave Broadcast</button>;
      yourStreamClasses = " hidden ";
    } 

    return(

      <div className="container max-video-width episode-container">
        <div className="episode-menu menu-left">
          <div className="menu-left-controls">
            <div className="inline"><span className="fa fa-bars"></span></div>
            <div className="inline">{this.session_state}</div>
          </div>
          <div className="episode-menu-inner">
            {prevBtn}
            {startBtn}
            {endBtn}
            {joinBtn}
          </div>
        </div>

        <div className="episode-player-container">
          <EpisodePlayer users={ this.users } context={this} />
        </div>

        <div className="episode-menu menu-right">
          <div className="episode-menu-inner">
            {guestsInLineComponent}
          </div>
        </div>

        <div id="your-stream" className={yourStreamClasses}></div>

      </div>
    )
  }
});


