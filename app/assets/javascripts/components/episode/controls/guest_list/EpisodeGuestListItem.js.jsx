var EpisodeGuestListItem = React.createClass({

  componentWillMount: function(){

    this.control_view_state = "HIDDEN";
    this.preview_state = "HIDDEN";

    // local vars
    var guid = Guid.get();

    this.listItemId = "guest-list-item-"+guid;
    this.guestInfoId = "guest-list-guestinfo-"+guid;
    this.previewVidId = "guest-list-item-preview-container-"+guid;
    this.previewBtnId = "guest-list-item-preview-btn-"+guid;
    this.publishBtnId = "guest-list-item-publish-btn-"+guid;
    this.ignoreBtnId = "guest-list-item-ignore-btn-"+guid;
    this.messageId = "guest-list-item-message-btn-"+guid;
  },
  
  componentDidMount: function() { this.setInteraction(); },
  componentDidUpdate: function(){ this.setInteraction(); },

  setInteraction: function(){
    /// click events, etc
    var self = this;

    // when the moderator clicks on the guests name.
    $("#"+this.guestInfoId).off();
    $("#"+this.guestInfoId).on("click", function(e){
      if( self.control_view_state == "HIDDEN" ){
        self.control_view_state = "SHOW";
      }else{
        self.control_view_state = "HIDDEN";
      }
      self.forceUpdate();
    });

    // preview
    $("#"+self.previewBtnId).off();
    $("#"+self.previewBtnId).on("click", function(e){
      if( self.preview_state == "PREVIEW" ){
        self.preview_state = "HIDDEN";
        CSEventManager.broadcast("HIDE_GUEST_PREVIEW", { identity: self.props.user.identity, elementId: self.previewVidId }); 
      }else{
        self.preview_state = "PREVIEW";
        CSEventManager.broadcast("SHOW_GUEST_PREVIEW", { identity: self.props.user.identity, elementId: self.previewVidId }); 
      }
      self.forceUpdate();
    });

    // publish user stream
    $("#"+self.publishBtnId).off();
    $("#"+self.publishBtnId).on("click", function(e){
      if(self.props.user.guest_state == "BROADCASTING"){
        // CSEventManager.broadcast("UNPUBLISH_GUEST", { identity: self.props.user.identity });
      }else{
        CSEventManager.broadcast("PUBLISH_GUEST", { identity: self.props.user.identity });        
      }
    });

    // ignore button
    $("#"+self.ignoreBtnId).off();
    $("#"+self.ignoreBtnId).on("click", function(e){
      CSEventManager.broadcast("IGNORE_IN_LINE_GUEST", { identity: self.props.user.identity });
    });

    // personal message
    $("#"+self.messageId).off();
    $("#"+self.messageId).on("click", function(e){
      CSEventManager.broadcast("INITIATE_CHAT", { identity: self.props.user.identity });
    });
  },


  // Get preview button..
  getPreviewComponent: function(){
    if( this.preview_state == "PREVIEW"){
      return(
        <div id={this.previewBtnId} className="menu-item active">
          <div className="icon">
            <span className="fa fa-eye-slash"></span>
          </div>
          <div className="title">Hide Preview</div>
        </div>
      )
    }else{
      return(
        <div id={this.previewBtnId} className="menu-item">
          <div className="icon">
            <span className="fa fa-eye"></span>
          </div>
          <div className="title">Preview</div>
        </div>
      )
    }
  },


  // get add button
  getAddComponent: function(){
    if( this.props.user.guest_state == "IN_LINE"){
      return(
        <div id={this.publishBtnId} className="menu-item">
          <div className="icon">
            <span className="fa fa-thumbs-up"></span>
          </div>
          <div className="title">Add</div>
        </div>
      )
    }else{
      return(
        <div className="menu-item deactivated">
          <div className="icon">
            <span className="fa fa-thumbs-up"></span>
          </div>
          <div className="title">Add</div>
        </div>
      )
    }
  },


  // get add button
  getRemoveComponent: function(){
    if( this.props.user.guest_state == "IN_LINE" || this.props.user.guest_state == "BROADCASTING"){
      return(
        <div id={this.ignoreBtnId} className="menu-item">
          <div className="icon">
            <span className="fa fa-thumbs-down"></span>
          </div>
          <div className="title">Remove</div>
        </div>
      )
    }else{
      return "";
    }
  },


  // get add button
  getPersonalMessageComponent: function(){
    if( this.props.user.guest_state == "IN_LINE" || this.props.user.guest_state == "BROADCASTING"){
      return(
        <div className="menu-item deactivated">
          <div className="icon">
            <span className="fa fa-comments"></span>
          </div>
          <div className="title">PM</div>
        </div>
      )
    }else{
      return "";
    }
  },




  render:function(){

    var guest_state = this.props.user.guest_state;
    var stateClasses = "guest-list-item";
    var identity = this.props.user.identity;
    var role = this.props.user.role;

    if( guest_state == "BROADCASTING" ){
      stateClasses += " state_broadcasting ";
    }else if( guest_state == "IN_LINE" ){
      stateClasses += " state_in_line ";
    }

    // define the preview button
    var previewComponent = this.getPreviewComponent();
    var addComponent = this.getAddComponent();
    var removeComponent = this.getRemoveComponent();
    var pmComponent = this.getPersonalMessageComponent();

    // render the guest controls component
    var guestControlsComponent = "";
    if( this.control_view_state != "HIDDEN" ){

      stateClasses += " focused ";

      guestControlsComponent = 
        <div className="guest-controls">
          { previewComponent }
          { addComponent }
          { removeComponent }
          { pmComponent }
        </div>;
    }

    return(
      <div className={ stateClasses }>
        <div id={ this.guestInfoId } className="guest-info clear">
          <div className="avatar">
            <div id={this.previewVidId} ></div>
          </div>
          <div className="identity">
            <div className="name">{identity}</div>
            <div className="email">{role}</div>
          </div>
        </div>
        { guestControlsComponent }
      </div>

    )
  }
});





