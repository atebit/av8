var EpisodeFanListItem = React.createClass({

  componentWillMount: function() {
    // listeners... init, etc

    // local vars
    this.userData = Params.query(this.props.stream.connection.data);
    this.listItemId = "fan-list-item-"+this.props.stream.id;
    this.previewVidId = "fan-list-item-preview-"+this.props.stream.id;
    this.previewBtnId = "fan-list-item-preview-btn-"+this.props.stream.id;
    this.publishBtnId = "fan-list-item-publish-btn-"+this.props.stream.id;
    this.ignoreBtnId = "fan-list-item-ignore-btn-"+this.props.stream.id;
    this.messageId = "fan-list-item-message-btn-"+this.props.stream.id;
  },
  
  componentDidMount: function() {
    /// click events, etc
    var self = this;
    $("#"+self.previewBtnId).off();
    $("#"+self.previewBtnId).on("click", function(e){
      CSEventManager.broadcast("PREVIEW_GUEST", { streamId: self.props.stream.id, elementId: self.previewVidId });
    });

    $("#"+self.publishBtnId).off();
    $("#"+self.publishBtnId).on("click", function(e){
      CSEventManager.broadcast("PUBLISH_GUEST", { stream: self.props.stream });
      // $("#"+self.listItemId).remove();
    });

    $("#"+self.ignoreBtnId).off();
    $("#"+self.ignoreBtnId).on("click", function(e){
      CSEventManager.broadcast("IGNORE_IN_LINE_GUEST", { stream: self.props.stream });
    });


    $("#"+self.messageId).off();
    $("#"+self.messageId).on("click", function(e){
      CSEventManager.broadcast("INITIATE_CHAT", { stream: self.props.stream });
    });
  },

  componentDidUpdate: function(){
    // component updated.
  },

  render:function(){

    // console.log(this.props);

    return(
      <div id={this.listItemId} className="fan-list-item card grid">
        <div className="col-2-12">
          <div id={this.previewVidId} className="fan-lis-item-preview"></div>
        </div>
        <div className="col-10-12">
          <div className="username">{this.userData.email}</div>
          <button id={this.previewBtnId}>Preview</button>
          <button id={this.publishBtnId}>Publish</button>
          <button id={this.ignoreBtnId}>Ignore</button>
        </div>
      </div>
    )
  }
});


