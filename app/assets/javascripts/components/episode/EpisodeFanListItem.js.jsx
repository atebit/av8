var EpisodeFanListItem = React.createClass({

  componentWillMount: function(){
    // local vars
    this.listItemId = "fan-list-item-"+this.props.user.stream.id;
    this.previewVidId = "fan-list-item-preview-"+this.props.user.stream.id;
    this.previewBtnId = "fan-list-item-preview-btn-"+this.props.user.stream.id;
    this.publishBtnId = "fan-list-item-publish-btn-"+this.props.user.stream.id;
    this.ignoreBtnId = "fan-list-item-ignore-btn-"+this.props.user.stream.id;
    this.messageId = "fan-list-item-message-btn-"+this.props.user.stream.id;
  },
  
  componentDidMount: function() {
    /// click events, etc
    var self = this;
    $("#"+self.previewBtnId).off();
    $("#"+self.previewBtnId).on("click", function(e){
      if( self.preview_state == "preview" ){
        self.preview_state = "idle";
        CSEventManager.broadcast("HIDE_GUEST_PREVIEW", { identity: self.props.user.identity, elementId: self.previewVidId }); 
      }else{
        self.preview_state = "preview";
        CSEventManager.broadcast("SHOW_GUEST_PREVIEW", { identity: self.props.user.identity, elementId: self.previewVidId }); 
      }
      self.forceUpdate();
    });

    $("#"+self.publishBtnId).off();
    $("#"+self.publishBtnId).on("click", function(e){
      if(self.props.user.session_status == "broadcasting"){
        CSEventManager.broadcast("UNPUBLISH_GUEST", { identity: self.props.user.identity });
      }else{
        CSEventManager.broadcast("PUBLISH_GUEST", { identity: self.props.user.identity });        
      }
    });

    $("#"+self.ignoreBtnId).off();
    $("#"+self.ignoreBtnId).on("click", function(e){
      CSEventManager.broadcast("IGNORE_IN_LINE_GUEST", { identity: self.props.user.identity });
    });

    $("#"+self.messageId).off();
    $("#"+self.messageId).on("click", function(e){
      CSEventManager.broadcast("INITIATE_CHAT", { identity: self.props.user.identity });
    });
  },

  componentDidUpdate: function(){
    // component updated.
  },

  render:function(){



    var previewButtonComponent = <button className="fan-list-item-btn" id={this.previewBtnId}><span className="fa fa-eye"></span></button>;
    if(this.preview_state == "preview"){
      previewButtonComponent = <button className="fan-list-item-btn" id={this.previewBtnId}><span className="fa fa-eye-slash"></span></button>;
    }

    if(this.props.user.guest_status == "broadcasting"){
      previewButtonComponent = "";
    }

    var publishComponent = <button className="fan-list-item-btn" id={this.publishBtnId}><span className="fa fa-video-camera"></span></button>;
    if(this.props.user.guest_status == "broadcasting"){
      publishComponent = <button className="fan-list-item-btn" id={this.publishBtnId}><span className="fa fa-thumbs-down"></span></button>;
    }

    var ignoreComponent = "";
    if(this.props.user.guest_status != "broadcasting"){
      ignoreComponent = <button className="fan-list-item-btn" id={this.ignoreBtnId}><span className="fa fa-thumbs-down"></span></button>;
    }
    // console.log(this.props);

    return(
      <div id={this.listItemId} className="fan-list-item card">
        <div className="fan-list-item-username">{this.props.user.identity}</div>
        <div>
          <div className="fan-list-item-preview">
            <div id={this.previewVidId}></div>
          </div>
          {previewButtonComponent}
          {publishComponent}
          {ignoreComponent}
        </div>
      </div>
    )
  }
});


