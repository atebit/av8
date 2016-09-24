var EpisodeChatStream = React.createClass({

  componentWillMount: function(){
    // the state data for this component
    this.store = {
      thread_id: this.props.chat_thread_id,
      messages_id: "chat-messages-"+Guid.get(),
      messages: undefined,
      scroll_listen: false,
      scroll_takeover: false,
    }
    // listen for when to update the thread..
    CSEventManager.addListener("CHAT_THREAD_UPDATE", this, "onChatThreadUpdate");

    //TODO: should probably listen for page resize..
    
  },

  componentDidMount: function() { 
    // load the thread the first time..
    this.onChatThreadUpdate();
  },

  componentDidUpdate: function(){ },

  onChatThreadUpdate: function(){

    var self = this;
    var thread_id = self.store.thread_id;
    var api = '/api/chat_messages/find/?thread_id=' + thread_id;
    var method = "get";
    var data = {};

    self.serverRequest = $.ajax({
      url: api,
      method: method,
      data: data,
      dataType: "json"
    }).complete( function (data) {
      // console.log("response", data);
      if(data.status == 200){
        self.store.messages = data.responseJSON;
        // self.setState({ messages: data.responseJSON });
        self.forceUpdate();

        if (!self.scroll_takeover) {
          self.scrollToBottom();
        };

      }else{
        console.log("error", data);
      }
    });
  },

  onMessageScroll: function() {
    if (!this.store.scroll_listen) {
      //skip first scroll
      this.store.scroll_listen = true;
      return;
    };

    var elem = $("#"+this.store.messages_id);
    var x = elem[0].scrollHeight - elem.scrollTop();  

    if(x == elem.outerHeight()) {
      //at bottom
      this.store.scroll_takeover = false;
      this.goToNewMessages();
    }
    else if (elem.outerHeight() < x) {
      //scroll take over
      this.store.scroll_takeover = true;
    }
  },

  scrollToBottom: function() {
    $("#"+this.store.messages_id).scrollTop( $("#"+this.store.messages_id)[0].scrollHeight );
  },

  goToNewMessages: function() {
    this.scrollToBottom();
    this.store.scroll_takeover = false;
    this.forceUpdate();
  },

  render:function(){

    var messages = "";
    var messageFormComponent = "";

    // TODO: for all messages, create a chat message and give it style props for "fading out" as it nears the top of the page.

    return(

      <section className="episode-control-content episode-chat">
        {messages}
        {messageFormComponent}
      </section>
    )
  }
});


