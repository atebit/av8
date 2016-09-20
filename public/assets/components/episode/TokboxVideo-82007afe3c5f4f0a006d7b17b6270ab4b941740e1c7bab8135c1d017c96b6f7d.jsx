var TokboxVideo = React.createClass({

  componentWillMount: function(){  this.videoId = "tokbox-video-"+Guid.get(); },
  componentDidMount: function() {  this.attachVideo(); },
  componentDidUpdate: function(){  this.attachVideo(); },

  attachVideo: function(){
    var video = $("#"+this.videoId)[0];
    if(this.props.videoElement){
      video.srcObject = this.props.videoElement.srcObject; 
    }
  },

  render:function(){

    // console.log("-- Render VIDEO:", this.props.videoElement);

    return(
      <video id={this.videoId}  autoPlay="true" />
    )
  }
});




    