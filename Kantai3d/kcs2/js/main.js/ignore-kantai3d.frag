precision mediump float;
uniform vec2 offset;

uniform sampler2D uSampler;
uniform sampler2D displacementMap;

uniform float textureScale;

uniform vec2 textureSize;
uniform vec2 frameSize;
uniform vec2 filterAreaOffset;

uniform float padding;
uniform vec4 filterArea;
uniform vec4 filterClamp;


varying vec2 vTextureCoord;
varying vec4 vColor;
uniform vec4 dimensions;
uniform vec2 mapDimensions;
uniform float scale;
uniform float focus;


vec2 mapCoordDepth(vec2 coord)
{
    return (coord * (frameSize - padding) - filterAreaOffset) / textureSize / textureScale;
}

const float compression = 1.0;
const float dmin = 0.0;
const float dmax = 1.0;

#define MAXSTEPS 600.0
float steps = max(MAXSTEPS *length(offset), 30.0);



void main(void)
{

    float aspect = dimensions.x / dimensions.y;
    vec2 scale2 =
        vec2(scale * min(1.0, 1.0 / aspect), scale * min(1.0, aspect)) * vec2(1, -1);
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

    for (float i = 0.0; i < MAXSTEPS; ++i)
    {
        vec2 vpos = pos + vector[1] - i * vstep;
        dpos = 1.0 - i * dstep;
        float depth = texture2D(displacementMap, mapCoordDepth(vpos)).r;


        if (texture2D(uSampler, vpos)[3] == 0.0)
        {
            depth = 0.0;
        }

        depth = clamp(depth, dmin, dmax);

        if (dpos > depth)
        {
            posSumLast = vpos;
            dposLast = dpos;
        }
        else
        {
            posSum = vpos;
            weigth = (depth - dposLast) / dstep;
            break;
        }
    };

    gl_FragColor = texture2D(
                       uSampler,
                       (posSum - posSumLast) * -clamp(weigth * 0.5 + 0.5, 0.0, 1.5) + posSum);

}