const { readFileSync } = require("fs")
const { join } = require("path")

module.exports = (file, contents) => {

    contents = contents.toString();

    contents = contents.replace(/(return .{0,99}\!\=.{0,99}\|\|null\!\=\(.{0,99}\=.{0,99}\(.{0,99}\)\)&&\(.{0,99}\='_'\+.{0,99}\),.{0,99}\+\(.{0,99}\+.{0,99}\+'\/'\+\(.{0,99}\+.{0,99}\(.{0,99},.{0,99}\)\)\+'_'\+.{0,99}\+.{0,99}\+.{0,99}\+.{0,99}\(0x0,parseInt\(.{0,99}\)\)\);)/g, 
        "\n return window.displacementPath = (function () {\n$1\n})();\n");


    contents = contents.replace(/(new PIXI\[.{0,99}\]\(.{0,99}\[.{0,99}\]\[.{0,99}\],.{0,99},.{0,99}\);document)/g, 
        "\n window.pixiApp = $1");

    contents = contents.replace(/(\=[^=]{0,99}\[[^\[]{0,99}\]\[[^\[]{0,99}\]\([^\(]{0,99}\),[^,]{0,99}\=0x0\=\=.{0,99}\?0x0\:.{0,99},.{0,99}\=.{0,99}\[.{0,99}\]\[.{0,99}\]\[.{0,99}\]\(.{0,99}\);)/g, 
        "\n = window.charar $1");

    contents = contents.replace(/(var .{0,99}\=new PIXI\[\(.{0,99}\)\]\(.{0,99}\);this\[.{0,99}\]\=.{0,99}\[.{0,99}\]\[.{0,99}\]\[.{0,99}\]\[.{0,99}\]\[.{0,99}\]\(.{0,99}\),this\[.{0,99}\]\[.{0,99}]\[.{0,99}\]\(.{0,99},\-.{0,99}\);var [^=]{0,99}=)/g, 
        "$1 window.charal = \n");

    contents = contents.replace(/(\=[^=]{0,99}\[[^=]{0,99}\]\[[^=]{0,99}\]\[.{0,99}\]\[.{0,99}\]\(.{0,99}\)\[.{0,99}\]\(.{0,99}\);this\[.{0,99}\]\[.{0,99}\]\[.{0,99}\]\(\-.{0,99}\+.{0,99}\['x'\]\+.{0,99},\-.{0,99}\+.{0,99}\['y'\]\),)/g, 
        "\n = window.charah $1");

    contents = contents.replace(/(\['y'\]\),this\[.{0,99}\('.{0,99}'\)\]\[.{0,99}\('.{0,99}'\)\]\(.{0,99}\+.{0,99},.{0,99}\-.{0,99}\);)/g, 
        "$1 " + `
window.portOffset = -window.charal + window.charah.x;//-l+h.x
window.portOffsetR = window.charar;//r

window.displacementSprite = PIXI.Sprite.fromImage('https://kantai3d.com/'+ window.displacementPath );
window.displacementFilter = PIXI.DepthPerspectiveFilter;

window.displacementFilter.uniforms.textureWidth = this._chara.texture.width;
window.displacementFilter.uniforms.textureHeight = this._chara.texture.height;
window.displacementFilter.padding = 0;


window.displacementSprite.visible = false;

window.displacementFilter.padding = 150;

window.currenctChara = this._chara;

if (window.displacementSprite.width != 1) {
    // The depth map is already loaded
    window.displacementFilter.uniforms.displacementMap = window.displacementSprite.texture;
    window.displacementFilter.uniforms.scale = 1.0;
    window.displacementFilter.uniforms.focus = 0.5;
    window.displacementFilter.uniforms.offset = [0.0, 0.0];
    window.currenctChara.filters = [window.displacementFilter];
    window.currenctChara.addChild(window.displacementSprite);
} else {
    // The depth map is not loaded yet, and may not exist in server at all
    // Disable the filter first
    this._chara.filters = [];
    window.currenctChara.filters = [];
    window.displacementSprite.texture.baseTexture.on('loaded', function(){
        // Re-enable the filter when resource loaded
        window.displacementFilter.uniforms.displacementMap = window.displacementSprite.texture;
        window.displacementFilter.uniforms.scale = 1.0;
        window.displacementFilter.uniforms.focus = 0.5;
        window.displacementFilter.uniforms.offset = [0.0, 0.0];
        window.currenctChara.filters = [window.displacementFilter];
        window.currenctChara.addChild(window.displacementSprite);
    });
}
`);

    contents = contents.replace(/(\=Math\[.{0,99}\]\(.{0,99}\),.{0,99}\=0x1\+0\.012\*\(0\.5\+0\.5\*.{0,99}\);this\[.{0,99}\]\[.{0,99}\]\(.{0,99}\),)/g, 
        "\n = window.charasin $1");

    contents = contents.replace(/(this\['y'\]=this\[.{0,99}\('.{0,99}'\)]-1.5\*.{0,99}\*1.8;)/g, 
        `$1
var mousex = (window.pixiApp.renderer.plugins.interaction.mouse.global.x/1200.0-0.5);
var mousey = (window.pixiApp.renderer.plugins.interaction.mouse.global.y/720.0-0.5);

window.displacementFilter.uniforms.textureScale = this.scale.x;

var flip = (this.parent._chara.transform.position.x - window.portOffset) / (window.portOffsetR) - 0.5;
window.displacementFilter.uniforms.offset = [flip * mousex *1.3
,0.02 * window.charasin - 0.01 + mousey * 0.6];

`);

    return contents + `;

'use strict';
PIXI.DepthPerspectiveFilter = new PIXI.Filter(
\`
#ifdef GL_ES
precision highp float;
#endif

attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
varying vec2 vTextureCoord;


uniform mat3 projectionMatrix;


void main(void){

    vTextureCoord = aTextureCoord;
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
}
\`

    , 
\`
precision mediump float;
uniform vec2 offset;

uniform sampler2D uSampler;
uniform sampler2D displacementMap;

uniform float textureScale;
uniform float textureWidth;
uniform float textureHeight;
uniform float frameWidth;
uniform float frameHeight;

uniform float padding;

uniform vec4 filterArea;
uniform vec4 filterClamp;


varying vec2 vTextureCoord;
varying vec4 vColor;
uniform vec4 dimensions;
uniform vec2 mapDimensions;
uniform float scale;
uniform float focus;


vec2 mapCoordDepth(vec2 coord) {
  return vec2((coord[0] * frameWidth - padding) / textureWidth / textureScale,
              (coord[1] * frameHeight - padding) / textureHeight / textureScale);
}

vec2 mapCoord2(vec2 coord) {
  return vec2(coord[0] * frameWidth / textureWidth / textureScale,
              coord[1] * frameHeight / textureHeight / textureScale);
}

const float compression = 1.0;
const float dmin = 0.0;
const float dmax = 1.0;

#define MAXSTEPS 600.0
float steps = max(MAXSTEPS * length(offset), 30.0);

void main(void) {

  float aspect = dimensions.x / dimensions.y;
  vec2 scale2 =
      vec2(scale * min(1.0, 1.0 / aspect), scale* min(1.0, aspect)) * vec2(1, -1);
  mat2 baseVector =
      mat2(vec2((0.5 - focus) * (offset) - (offset) / 2.0) * scale2,
           vec2((0.5 - focus) * (offset) + (offset) / 2.0) * scale2);


  vec2 pos = (vTextureCoord);
  mat2 vector = baseVector;

  float dstep = compression / (steps - 1.0);
  vec2 vstep = (vector[1] - vector[0]) / vec2((steps - 1.0));

  vec2 posSumLast = vec2(0.0);
  vec2 posSum = vec2(0.0);

  float weigth = 1.0;
  float dpos;
  float dposLast;


  for (float i = 0.0; i < MAXSTEPS; ++i) {
    vec2 vpos = pos + vector[1] - i * vstep;
    dpos = 1.0 - i * dstep;

    float depth = texture2D(displacementMap, mapCoordDepth(vpos)).r;


    if (texture2D(uSampler,vpos)[3] == 0.0) {
        depth = 0.0;
    }


    depth = clamp(depth, dmin, dmax);
    float confidence;

#define CORRECT 100
#if CORRECT == 10
#define CORRECTION_MATH +((vec2((depth - dpos) / (dstep)) * vstep))
#else
#define CORRECTION_MATH
#endif

    if (dpos > depth) {
      posSumLast = (vpos CORRECTION_MATH);
      dposLast = dpos;
    } else {
      posSum = (vpos CORRECTION_MATH);
      weigth = (depth - dposLast) / (dstep);
      break;
    }
  };

  gl_FragColor = texture2D(
      uSampler,
      (posSum - posSumLast) * -clamp(weigth * 0.5 + 0.5, 0.0, 1.5) + posSum);

}
\`  );

PIXI.DepthPerspectiveFilter.apply = function(filterManager, input, output)
{
  this.uniforms.dimensions = {};
  this.uniforms.dimensions[0] = input.sourceFrame.width;
  this.uniforms.dimensions[1] = input.sourceFrame.height;

  this.uniforms.padding = this.padding;
  
  this.uniforms.frameWidth = input.size.width;
  this.uniforms.frameHeight = input.size.height;

  // draw the filter...
  filterManager.applyFilter(this, input, output);
}


// var isloaded = false;
//   var alpha    = 0;
//   var beta     = 0;
//   var gamma    = 0;


// window.addEventListener("deviceorientation", handleOrientation, true);

// function handleOrientation(e) {
//   if (!isloaded) {
//     alpha = e.alpha;
//     beta = e.beta;
//     gamma = e.gamma;
//     isloaded = true;
//    }
//   console.log("ha" + e.alpha);

//   if (window.displacementFilter && window.displacementFilter.uniforms && window.displacementFilter.uniforms.offset) {
//     window.displacementFilter.uniforms.offset =  [(window.displacementFilter.uniforms.offset[0] + (e.alpha - alpha)/180.0) * 0.5, 
//     (window.displacementFilter.uniforms.offset[1] + (e.beta - beta)/180.0) * 0.5];

//     console.log((window.displacementFilter.uniforms.offset[0] + (e.alpha - alpha)/180.0) * 0.5);
//   }
//   alpha = e.alpha;
//   beta = e.beta;
//   gamma = e.gamma;
// }
`;
}