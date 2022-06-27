import { vec3, mat4, quat, mat3 } from "gl-matrix";
import { vec2, vec4 } from "gl-matrix/src/gl-matrix";
import Renderable from './renderable';
import { generatePlane } from '../utils/geometryGenerator';
import { loadTexture } from '../utils/textureLoader';
import waterURL from '../../../res/water.jpg';
import water2URL from '../../../res/water2.jpg';

export default class Water extends Renderable {
  /**
   * 
   * @param {WebGLRenderingContext} GL 
   */
  constructor(GL, shader) {
    super(vec3.fromValues(-14.14, 0, 10), vec3.fromValues(0, 45, 0), vec3.fromValues(1, 1, 1), true);
    this.GL = GL;
    this.shader = shader;
    this.plane = generatePlane();
    this.uniforms = {
      color: shader.uniforms["color"],
      time: shader.uniforms["time"],
      amplitude: shader.uniforms["amplitude"],
      frequency: shader.uniforms["frequency"],
      wavelength: shader.uniforms["wavelength"],
      sampler: shader.uniforms["sampler"],
      sampler2: shader.uniforms["sampler2"],
      steepness: shader.uniforms["steepness"]
    };

    this.attributes = {
      position: shader.attributes["position"],
      texCoord: shader.attributes["texCoord"]
    };

    this.waterColors = document.getElementsByName("colors");

    this.timeOfDay = document.getElementById("tod");
    document.getElementById("timeOfDay").innerText = "Time of Day";

    this.initBuffers();
    this.initTexture();
  }

  initBuffers() {
    this.vertexBuffer = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.vertexBuffer);
    this.GL.bufferData(this.GL.ARRAY_BUFFER, this.plane.vertices, this.GL.STREAM_DRAW);

    this.indexBuffer = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, this.plane.indices, this.GL.STATIC_DRAW);

    this.texBuffer = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.texBuffer);
    this.GL.bufferData(this.GL.ARRAY_BUFFER, this.plane.texCoords, this.GL.STREAM_DRAW);
  }

  initTexture() {
    this.texture = loadTexture(this.GL, waterURL);
    this.texture2 = loadTexture(this.GL, water2URL);
  }

  calculateWaterColor(val) {
    // ideally, we'd calculate this after the following selection so we aren't repeating code with the alpha pass in
    let alpha = this.calculateTime();
    switch (val) {
      case "white":
        return this.normalizeRGB(234, 231, 224, alpha);
      case "med-blue":
        return this.normalizeRGB(86, 233, 134, alpha);
      case "dark-blue":
        return this.normalizeRGB(64, 106, 130, alpha);
      case "gray":
        return this.normalizeRGB(107, 118, 120, alpha);
      case "tan":
        return this.normalizeRGB(106, 114, 93, alpha);
      case "black":
        return this.normalizeRGB(70, 73, 78, alpha);
    }
    return [0, 0, 0, 1];  // default return
  }

  /* helper function to normalize RGB values to between 0 and 1 */
  normalizeRGB(r, g, b, a) {
    return [r / 255, g / 255, b / 255, a];  // alpha passed in from time of day slider
  }

  // semi-circle formula
  calcSemiCircle(a, r, x, h, k) {
    let xtrans = x-h;
    let discriminant = r*r - xtrans*xtrans;
    return (a*Math.sqrt(discriminant) + k);
  }
  
  // precomputed semi-circle method
  // a = 1
  // r = 0.5
  // h = 0.5
  // k = 0.49
  constSemiCircle(x) {
    // sqrt(r^2 - (x^2 - 2xh + h^2))
    return (Math.sqrt(0.25 - (x*x - x + 0.25)) + 0.49);
  }

  // Calculate time of day alpha value based on semi-circle function
  // div 100 b/c original range 0 - 100
  calculateTime() {
    // let alpha = this.constSemiCircle(this.timeOfDay.value/100); 
    // return alpha;

    // nvm this isn't C
    return this.constSemiCircle(this.timeOfDay.value/100); 
  }

  render(deltaTime, totalTime, viewMatrix, projectionMatrix) {
    super.render(deltaTime, totalTime, viewMatrix, projectionMatrix);
    let uColor = this.uniforms.color;
    let uTime = this.uniforms.time;
    let uAmplitude = this.uniforms.amplitude;
    let uFrequency = this.uniforms.frequency;
    let uWavelength = this.uniforms.wavelength;
    let uSampler = this.uniforms.sampler;
    let uSteepness = this.uniforms.steepness;
    let uSampler2 = this.uniforms.sampler2;

    let aPosition = this.attributes.position;
    let aTexCoord = this.attributes.texCoord;

    /* modifiable magic numbers. please see original project [ https://github.com/dkillough/354-WebGLWaterSimulation ] to modify & port over values*/
    const ampl = 0.75;
    const wavel = 21.6;
    const freq = 0.4;
    const steepn = 0.15;

    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.vertexBuffer);
    this.GL.vertexAttribPointer(aPosition, 3, this.GL.FLOAT, false, 0, 0);

    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.texBuffer);
    this.GL.vertexAttribPointer(aTexCoord, 2, this.GL.FLOAT, false, 0, 0);

    this.GL.activeTexture(this.GL.TEXTURE0);
    this.GL.bindTexture(this.GL.TEXTURE_2D, this.texture);
    this.GL.uniform1i(uSampler, 0);

    this.GL.activeTexture(this.GL.TEXTURE1);
    this.GL.bindTexture(this.GL.TEXTURE_2D, this.texture2);
    this.GL.uniform1i(uSampler2, 1);

    /*** water color selection ***/
    let checked = false;

    for (let i = 0; i < this.waterColors.length; i++) {
      if (this.waterColors[i].checked) {
        this.GL.uniform4fv(uColor, this.calculateWaterColor(this.waterColors[i].id));
        checked = true;
        break;
      }
    }

    if (!checked) {
      // console.log("no water buttons selected");
      this.GL.uniform4fv(uColor, [0, 0, 1, 1]);
    }
    /*** ********************* ***/

    /* static uniform settings. see const lines above */
    this.GL.uniform1f(uAmplitude, ampl);
    this.GL.uniform1f(uSteepness, steepn);
    this.GL.uniform1f(uWavelength, wavel);
    this.GL.uniform1f(uFrequency, freq);
    this.GL.uniform1f(uTime, totalTime);

    this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.GL.drawElements(this.primativeType, this.plane.indices.length, this.GL.UNSIGNED_SHORT, 0);
  }
}