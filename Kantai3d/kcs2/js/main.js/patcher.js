const { readFileSync } = require("fs")
const { join } = require("path")

let frag = readFileSync(join(__dirname, './kantai3d.frag'));



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

window.displacementSprite.visible = false;

window.displacementFilter.padding = 150;

window.currentChara = this._chara;

if (window.displacementSprite.width != 1) {
    // The depth map is already loaded
    window.displacementFilter.uniforms.displacementMap = window.displacementSprite.texture;
    window.displacementFilter.uniforms.scale = 1.0;
    window.displacementFilter.uniforms.focus = 0.5;
    window.displacementFilter.uniforms.offset = [0.0, 0.0];
    window.currentChara.filters = [window.displacementFilter];
    window.currentChara.addChild(window.displacementSprite);
} else {
    // The depth map is not loaded yet, and may not exist in server at all
    // Disable the filter first
    this._chara.filters = [];
    window.currentChara.filters = [];
    window.displacementSprite.texture.baseTexture.on('loaded', function(){
        // Re-enable the filter when resource loaded
        window.displacementFilter.uniforms.displacementMap = window.displacementSprite.texture;
        window.displacementFilter.uniforms.scale = 1.0;
        window.displacementFilter.uniforms.focus = 0.5;
        window.displacementFilter.uniforms.offset = [0.0, 0.0];
        window.currentChara.filters = [window.displacementFilter];
        window.currentChara.addChild(window.displacementSprite);
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
PIXI.DepthPerspectiveFilter = new PIXI.Filter(null, \`` + frag + `\`);

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

`;
}