var ChatThread = React.createClass({

  etInitialState: function() {  },

  componentWillMount: function() {
    this.store = {};

    this.store.messages_id = "chat-messages-"+Guid.get();
    this.store.thread_id = this.props.thread_id;
    this.store.scroll_takeover = false;
    this.store.scroll_listen = false;

    this.bindChannel();

    CSEventManager.addListener(AppMessages.CHAT_THREAD_UPDATE, this, "onChatThreadUpdate");
  },

  onChatThreadUpdate: function(){ this.loadMessages(); },
  componentDidMount: function() { this.loadMessages(); },
  componentWillUnmount: function() { },
  componentDidUpdate: function() { },

  handlePush: function( data ){
    this.loadMessages( this.store.thread_id );
  },

  bindChannel: function(){
    var self = this;
    self.pusher = new Pusher(String(PUSHER_KEY), { encrypted: true });
    var chat_thread_channel = self.pusher.subscribe('chat_stream');
    var thread = 'thread-'+self.store.thread_id;
    chat_thread_channel.bind(thread, function(data) { self.handlePush( data ); });
  },

  loadMessages:function( ){

    var self = this;
    var thread_id = self.store.thread_id
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

    if( ! this.store.messages ) return false;

    var messages = [];

    $(this.store.messages).each(function(i, message){
      messages.push( <ChatMessage messageData={message} key={i} />);
    });

    var messageFormComponent = "";
    if(this.props.archive_status != "archived"){
      messageFormComponent = <AddNewChatMessageForm thread_id={this.props.thread_id} />;
    }

    var newMessages = null;
    if (this.store.scroll_takeover) {
      newMessages = <div className="chat-new-messages" onClick={this.goToNewMessages}> New Messages </div>
    };

    return(
      <div className="chat-thread">
        <div id={this.store.messages_id} className="chat-messages" onScroll={this.onMessageScroll}>
        {messages}
        </div>
        {newMessages}
        {messageFormComponent}
      </div>
    )
  }
});
