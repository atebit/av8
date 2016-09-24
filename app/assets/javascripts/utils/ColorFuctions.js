
var ColorFunctions = {

  randomPastel: function(hex) {
    var red = Math.round(Math.random()*256);
    var green = Math.round(Math.random()*256);
    var blue = Math.round(Math.random()*256);

    var rgb = ColorFunctions.hexToRgb(hex);
    // mix the color
    if (hex !== null){
      red = (red + rgb.r) / 2;
      green = (green + rgb.g) / 2;
      blue = (blue + rgb.b) / 2;
    }

    return ColorFunctions.RGBToHex( red, green, blue );
  },

  hexToRgb: function( hex ) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  RGBToHex: function(r,g,b){
    var bin = r << 16 | g << 8 | b;
    return (function(h){
      return new Array(7-h.length).join("0")+h
    })(bin.toString(16).toUpperCase())
  },

  stringToHex: function(str){
    return ColorFunctions.intToRGB(ColorFunctions.hashCode(str));
  },

  hashCode: function(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  },

  intToRGB: function(i){
    var c = (i & 0x00FFFFFF)
      .toString(16)
      .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
  }


};