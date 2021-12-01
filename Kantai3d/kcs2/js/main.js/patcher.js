const { readFileSync } = require("fs")
const { join } = require("path")

let frag = readFileSync(join(__dirname, './ignore-kantai3d.frag'));



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

window.displacementSprite = PIXI.Sprite.fromImage(window.displacementPath.replace(/resources\\/ship\\/full[_dmg]*\\/([0-9]*)_([0-9_a-z]*).png(\\?version=)?([0-9]*)/g, \"https://cdn.jsdelivr.net/gh/laplamgor/kantai3d-depth-maps@master/source/$$1/$$1_$$2_v$$4.png\"));
window.displacementFilter = PIXI.DepthPerspectiveFilter;

window.displacementFilter.uniforms.textureWidth = this._chara.texture.width;
window.displacementFilter.uniforms.textureHeight = this._chara.texture.height;

window.displacementSprite.visible = false;

window.displacementFilter.padding = 150;

window.currentChara = this._chara;

if (window.displacementSprite.width != 1) {
    console.log('The depth map for this secretary is already loaded.');
    // The depth map is already loaded
    window.displacementFilter.uniforms.displacementMap = window.displacementSprite.texture;
    window.displacementFilter.uniforms.scale = 1.0;
    window.displacementFilter.uniforms.focus = 0.5;
    window.displacementFilter.uniforms.offset = [0.0, 0.0];
    window.currentChara.filters = [window.displacementFilter];
    window.currentChara.addChild(window.displacementSprite);

    window.mousex1 = null;
    window.mousey1 = null;
    prepareJiggle(window.currentChara.texture, window.displacementSprite.texture);
    window.displacementFilter.uniforms.displacementMap = window.jiggledDepthMapRT.texture;
} else {
    // The depth map is not loaded yet, and may not exist in server at all
    // Disable the filter first
    this._chara.filters = [];
    window.currentChara.filters = [];
    window.displacementSprite.texture.baseTexture.on('loaded', function(){

        console.log('The depth map for this secretary is now loaded.');
        // Re-enable the filter when resource loaded
        window.displacementFilter.uniforms.displacementMap = window.displacementSprite.texture;
        window.displacementFilter.uniforms.scale = 1.0;
        window.displacementFilter.uniforms.focus = 0.5;
        window.displacementFilter.uniforms.offset = [0.0, 0.0];
        window.currentChara.filters = [window.displacementFilter];
        window.currentChara.addChild(window.displacementSprite);

        window.mousex1 = null;
        window.mousey1 = null;
        prepareJiggle(window.currentChara.texture, window.displacementSprite.texture);
        window.displacementFilter.uniforms.displacementMap = window.jiggledDepthMapRT.texture;
    });

    window.displacementSprite.texture.baseTexture.on('error', function(){
        console.log('The depth map for this secretary is not available. Please visit https://github.com/laplamgor/kantai3d to check the supported CG list and consider to contribute your own depth map.');
    })
}


///////////////////////////////////

function prepareJiggle(baseMap, depthMap) {

    window.jigglePositions = [];
    window.jiggleVelocities = [];
    window.jiggleForces = [];

    window.jiggleStaticFlags = [];
    window.jiggleMovement = [];

    window.damping = [];
    window.springiness = [];
    

    var depthImg = depthMap.baseTexture.source;
    var tempCanvas = document.createElement('canvas');
    tempCanvas.width = depthImg.width;
    tempCanvas.height = depthImg.height;
    let tmCtx = tempCanvas.getContext('2d');
    tmCtx.drawImage(depthImg, 0, 0);
    var dmData = tmCtx.getImageData(0, 0, depthImg.width, depthImg.height).data;


    window.jiggleMeshW = Math.ceil(baseMap.width / 10.0);
    window.jiggleMeshH = Math.ceil(baseMap.height / 10.0);

    // This is the jiggled mseh
    window.jiggledDepthMapMesh = new PIXI.mesh.Plane(window.displacementSprite.texture, window.jiggleMeshW, window.jiggleMeshH);
    window.jiggledDepthMapMesh.visible = false;

    // This is the render texture of the jiggled mseh
    window.jiggledDepthMapRT = new PIXI.Sprite(PIXI.RenderTexture.create(baseMap.width, baseMap.height));
    window.jiggledDepthMapRT.visible = false;

    
    window.jiggledBaseMapMesh = new PIXI.mesh.Plane(baseMap, window.jiggleMeshW, window.jiggleMeshH);
    
    window.pixiApp.stage.addChild(window.jiggledDepthMapMesh);
    window.pixiApp.stage.addChild(window.jiggledDepthMapRT);
    window.currentChara.addChild(window.jiggledBaseMapMesh);
    
    window.gridW = baseMap.width / (window.jiggleMeshW - 1.0);
    window.gridH = baseMap.height / (window.jiggleMeshH - 1.0);
    for (var y = 0; y < window.jiggleMeshH; y++) {
        for (var x = 0; x < window.jiggleMeshW; x++) {
            window.jigglePositions.push({ x: window.gridW * x, y: y * window.gridH });
            window.jiggleVelocities.push({ x: 0, y: 0 });
            window.jiggleForces.push({ x: 0, y: 0 });

            var r = dmData[(Math.floor(y * window.gridH) * baseMap.width + Math.floor(x * window.gridW)) * 4 + 0];
            var b = dmData[(Math.floor(y * window.gridH) * baseMap.width + Math.floor(x * window.gridW)) * 4 + 2];

            window.damping.push(1.0 / (b / 255.0 * 16.0 + 1));
            window.springiness.push(1.0 / ( b / 255.0 * 32.0 + 1));
        

            window.jiggleStaticFlags.push(b == 0);
            window.jiggleMovement.push((r - 127.0) / 128.0);
        }
    }
    
    window.Mx = null;
    window.My = null;
    window.Mx2 = null;
    window.My2 = null;
    
    // start animating
    window.pixiApp.ticker.add(function (t) {

    });
}
`);

    contents = contents.replace(/(\=Math\[.{0,99}\]\(.{0,99}\),.{0,99}\=0x1\+0\.012\*\(0\.5\+0\.5\*.{0,99}\);this\[.{0,99}\]\[.{0,99}\]\(.{0,99}\),)/g, 
        "\n = window.charasin $1");

    contents = contents.replace(/(this\['y'\]=this\[.{0,99}\('.{0,99}'\)]-1.5\*.{0,99}\*1.8;)/g, 
        `$1

window.displacementFilter.uniforms.textureScale = this.scale.x;

`);

    return contents + `;



document.addEventListener('mouseleave', e => {
    window.mouseoutside = true;
    window.mousex1 = null;
    window.mousey1 = null;
});

document.addEventListener('mouseenter', e => {
    window.mouseoutside = false;
});




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


  //////// mouse
  var mousex2 = (window.pixiApp.renderer.plugins.interaction.mouse.global.x);
  var mousey2 = (window.pixiApp.renderer.plugins.interaction.mouse.global.y);

  if (!window.mouseoutside) {
      if (!window.mousex1)
          window.mousex1 = mousex2;
      if (!window.mousey1)
          window.mousey1 = mousey2;

      if (!window.mousex)
          window.mousex = 0;
      if (!window.mousey)
          window.mousey = 0;
      if (!window.mouset)
          window.mouset = Date.now();

      window.mousex += (mousex2 - window.mousex1) * (Date.now() - window.mouset);
      window.mousey += (mousey2 - window.mousey1) * (Date.now() - window.mouset);

      window.mousex1 = mousex2;
      window.mousey1 = mousey2;
  }

  var flip = (window.currentChara.transform.position.x - window.portOffset) / (window.portOffsetR) - 0.5;
  window.displacementFilter.uniforms.offset = [flip * (window.mousex / 1200.0 * 0.05) * 1.3, 0.02 * window.charasin - 0.01 + (window.mousey / 720.0 * 0.05) * 0.6];

  window.mousex = window.mousex * Math.pow(0.9, (Date.now() - window.mouset) / 30.0);
  window.mousey = window.mousey * Math.pow(0.9, (Date.now() - window.mouset) / 30.0);
  window.mouset = Date.now();


  ////////
  
  var vertices = window.jiggledBaseMapMesh.vertices;
  var vertices2 = window.jiggledDepthMapMesh.vertices;

  var newMx = window.displacementFilter.uniforms.offset[0];
  var newMy = window.displacementFilter.uniforms.offset[1];
  
  var baseMap = window.currentChara.texture;
  var depthMap = window.displacementSprite.texture;
  if (baseMap && baseMap.baseTexture && depthMap && depthMap.baseTexture) {

      window.My2 = window.My;
      window.Mx2 = window.Mx;
      window.My = newMy;
      window.Mx = newMx;
      for (var y = 0; y < window.jiggleMeshH; y++) {
          for (var x = 0; x < window.jiggleMeshW; x++) {
              resetForce(x, y);
          }
      }

      if (window.Mx && window.My && window.Mx2 && window.My2 && newMx != -999999 && window.Mx != -999999 && window.Mx2 != -999999) {
  
          var aX = (window.Mx2 - window.Mx) - (window.Mx - newMx);
          var aY = (window.My2 - window.My) - (window.My - newMy);
  
          for (var y = 0; y < window.jiggleMeshH; y++) {
              for (var x = 0; x < window.jiggleMeshW; x++) {
                  var m = window.jiggleMovement[y * window.jiggleMeshW + x];
                  window.jiggleForces[y * window.jiggleMeshW + x].x += aX * m * -50;
                  window.jiggleForces[y * window.jiggleMeshW + x].y += aY * m * 50;
              }
          }
      }
  

      for (var y = 0; y < window.jiggleMeshH; y++) {
          for (var x = 0; x < window.jiggleMeshW; x++) {
              if (x != 0) {
                  springUpdate(x - 1, y, x, y);
              }
              if (y != 0) {
                  springUpdate(x, y - 1, x, y);
              }
          }
      }
  
  
      for (var y = 0; y < window.jiggleMeshH; y++) {
          for (var x = 0; x < window.jiggleMeshW; x++) {
              addDampingForce(x, y);
              update(x, y);
          }
      }

  
      for (var i = 0; i < window.jigglePositions.length; i++) {
          var pos = window.jigglePositions[i];
          vertices[i * 2] = Math.min(Math.max(pos.x, 0), baseMap.width);
          vertices[i * 2 + 1] = Math.min(Math.max(pos.y, 0), baseMap.height);
  
          vertices2[i * 2] = vertices[i * 2];
          vertices2[i * 2 + 1] = vertices[i * 2 + 1];
      }
  }
  ////////









  window.jiggledDepthMapMesh.visible = true;
  window.pixiApp.renderer.render(window.jiggledDepthMapMesh, window.jiggledDepthMapRT.texture);
  window.jiggledDepthMapMesh.visible = false;


  // draw the filter...
  filterManager.applyFilter(this, input, output);
}


function resetForce(x, y) {
    window.jiggleForces[y * window.jiggleMeshW + x] = { x: 0, y: 0 };
}

function addForce(x, y, addX, addY) {
    var f = window.jiggleForces[y * window.jiggleMeshW + x];
    f.x += addX;
    f.y += addY;
}

function addDampingForce(x, y) {
    var v = jiggleVelocities[y * window.jiggleMeshW + x];
    var f = window.jiggleForces[y * window.jiggleMeshW + x];
    f.x -= v.x * window.damping[y * window.jiggleMeshW + x];
    f.y -= v.y * window.damping[y * window.jiggleMeshW + x];
}


function update(x, y) {
    var p = window.jigglePositions[y * window.jiggleMeshW + x];
    var v = window.jiggleVelocities[y * window.jiggleMeshW + x];
    var f = window.jiggleForces[y * window.jiggleMeshW + x];

    if (window.jiggleStaticFlags[y * window.jiggleMeshW + x] == false) {
        v.x += f.x;
        v.y += f.y;
        p.x += v.x;
        p.y += v.y;
    }
}



function springUpdate(x1, y1, x2, y2) {
    if (window.jiggleStaticFlags[x1 + y1 * window.jiggleMeshW.w] && !window.jiggleStaticFlags[x2 + y2 * window.jiggleMeshW.w]) 
        return;

    var distanceOrigin = (x2 - x1) * window.gridW + (y2 - y1) * window.gridH;
    
    

    var p1 = window.jigglePositions[y1 * window.jiggleMeshW + x1];
    var p2 = window.jigglePositions[y2 * window.jiggleMeshW + x2];

    var distance = len(sub(p1, p2));

    var springiness = (window.springiness[y1 * window.jiggleMeshW + x1] + window.springiness[y2 * window.jiggleMeshW + x2]) / 2;

    var springForce = springiness * (distanceOrigin - distance);
    var frcToAdd = tim(normalize(sub(p1, p2)), springForce);

    addForce(x1, y1, frcToAdd.x, frcToAdd.y);
    addForce(x2, y2, -frcToAdd.x, -frcToAdd.y);
}


function len(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

function normalize(v) {
    var l = len(v);
    return { x: v.x / l, y: v.y / l };
}

function sub(v1, v2) {
    return { x: v1.x - v2.x, y: v1.y - v2.y }
}

function tim(v1, s) {
    return { x: v1.x * s, y: v1.y * s }
}
`;
}