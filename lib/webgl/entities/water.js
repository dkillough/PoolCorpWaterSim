import { vec3, mat4, quat, mat3 } from "gl-matrix";
import { vec2, vec4 } from "gl-matrix/src/gl-matrix";
import Renderable from './renderable';
import { generatePlane } from '../utils/geometryGenerator';
import { loadTexture } from '../utils/textureLoader';
import waterURL from '../../../res/water.jpg';
import water2URL from '../../../res/water2.jpg';

export default class Water extends Renderable{
  /**
   * 
   * @param {WebGLRenderingContext} GL 
   */
  constructor(GL, shader){
    super(vec3.fromValues(-14.14,0,10), vec3.fromValues(0,45,0), vec3.fromValues(1,1,1), true, true);
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
    this.amplitude = document.getElementById("amplitude");
    document.getElementById("amplitudeVal").innerText = "Amplitude";
    
    this.wavelength = document.getElementById("wavelength");
    document.getElementById("wavelengthVal").innerText = "Wavelength";

    this.frequency = document.getElementById("frequency");
    document.getElementById("frequencyVal").innerText = "Frequency";

    this.steepness = document.getElementById("steepness");
    document.getElementById("steepnessVal").innerText = "Steepness";
    
    this.r = document.getElementById("r");
    document.getElementById("rVal").innerText = "Red";

    this.g = document.getElementById("g");
    document.getElementById("gVal").innerText = "Green";

    this.b = document.getElementById("b");
    document.getElementById("bVal").innerText = "Blue";

    this.a  = document.getElementById("a");
    document.getElementById("aVal").innerText = "Alpha";

    this.timeOfDay  = document.getElementById("tod");
    document.getElementById("timeOfDay").innerText = "Time of Day";
    
    this.initBuffers();
    this.initTexture();
  }

  initBuffers(){
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

  initTexture(){
    this.texture = loadTexture(this.GL, waterURL);
    this.texture2 = loadTexture(this.GL, water2URL);
  }
  
  calculateWaterColor(val) {
    switch(val) {
      case "white":
        // (234, 231, 224)
        return [0.91765, 0.90588, 0.87843, 1];
      case "med-blue":
        // (86, 233, 134)
        return [0.337254902, 0.478431373, 0.525490196, 1];
      case "dark-blue":
        return this.normalizeRGB(64, 106, 130);
      case "gray":
        return this.normalizeRGB(107, 118, 120);
      case "tan":
        return this.normalizeRGB(106, 114, 93);
      case "black":
        return this.normalizeRGB(70, 73, 78);
    }
    return [0, 0, 1, 1];
  }

  // normalize RGB values to between 0 and 1
  normalizeRGB(r, g, b) {
    return [r/255, g/255, b/255, 1];  // alpha = 1 (opaque)
  }

  render(deltaTime, totalTime, viewMatrix, projectionMatrix){
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
    
    console.log(this.blueChecked);
    
    if(this.blueChecked)
    {
      this.GL.uniform4fv(uColor, [0, 0, 1, 1]);
    }
    else
    {
      this.GL.uniform4fv(uColor, [this.r.value/255, this.g.value/255, this.b.value/255, this.a.value/255]);
    }

    this.GL.uniform1f(uAmplitude, this.amplitude.value/80);
    
    this.GL.uniform1f(uSteepness, this.steepness.value/100);

    this.GL.uniform1f(uWavelength, this.wavelength.value/10);
    
    this.GL.uniform1f(uFrequency, this.frequency.value/100);


    this.GL.uniform1f(uTime, totalTime);
    
    this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.GL.drawElements(this.primativeType, this.plane.indices.length, this.GL.UNSIGNED_SHORT, 0);
  }
}