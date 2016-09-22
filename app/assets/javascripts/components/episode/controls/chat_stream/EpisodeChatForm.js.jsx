var EpisodeChatForm = React.createClass({

  componentWillMount: function() { 
    this.input_id = "chat-thread-input-"+Guid.get(); 
  },
  componentDidMount: function() { this.setInteraction(); },
  componentWillUnmount: function() { },
  componentDidUpdate: function() { },

  setInteraction: function(){
    var self = this;
    var input = $("#"+this.input_id);
    input.val("");
    input.off();
    input.on("keyup", function(e){
      var keyCode = e.keyCode;
      if(keyCode =="13"){
        self.submit();
      } 
    });
  },

  submit: function(){
    // console.log("submit");
    var self = this;
    var input = $("#"+this.input_id);
    if( $.trim( input.val() ) == "" ) return false;

    var api = "/api/chat_messages/";
    var method = "post";
    var data = {
      user_id: TEISession.CurrentUserID,
      message: input.val(),
      thread_id: this.props.thread_id
    }

    self.serverRequest = $.ajax({
      url: api,
      method: method,
      data: data
    }).complete(function (response) {
      // console.log(response)
      if(response.responseText.indexOf("SUCCESS") != -1){
        self.setInteraction();
        // push messages happen to, but this is useful.
        CSEventManager.broadcast( "EPISODE_CHAT_THREAD_UPDATE" );
      }else{
        // CSEventManager.broadcast( AppMessages.SHOW_TOAST_NOTIFICATION, {
        //   type: "error",
        //   message: response.responseText
        // });
        console.log("error posting chat", response.responseText)
      }
    });
  },

  render:function(){
    return(
      <div className="chat-thread-form">
        <div className="input-container">
          <input type="text" id={this.input_id} placeholder="Say what?" />          
        </div>
      </div>
    )
  }
});