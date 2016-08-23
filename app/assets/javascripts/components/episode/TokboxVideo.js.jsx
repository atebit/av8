var TokboxVideo = React.createClass({

  componentWillMount: function(){ 
    this.videoId = "tokbox-video-"+Guid.get();
  },
  componentDidMount: function() { 
    console.log("RENDER TOKBOX VIDEO:", this.props);

    var video = $("#"+this.videoId)[0];

    if(this.props.videoElement){
      video.srcObject = this.props.videoElement.srcObject; 
    }

  },
  componentDidUpdate: function(){ },

  render:function(){

    return(
      <video id={this.videoId} autoPlay="true" />
    )
  }
});




    