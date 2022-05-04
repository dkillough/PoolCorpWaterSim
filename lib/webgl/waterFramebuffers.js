var ByteBuffer = require("bytebuffer");

const REFLECTION_WIDTH = 320;
const REFLECTION_HEIGHT = 180;
const REFRACTION_WIDTH = 1280;
const REFRACTION_HEIGHT = 720;

let reflectionFramebuffer;
let reflectionTexture;
let reflectionDepthbuffer;

let refractionFramebuffer;
let refractionTexture;
let refractionDepthTexture;

export default class waterFramebuffers {
  /**
   * @param {WebGLRenderingContext} GL 
   */
   constructor(GL) {
    this.gl = GL;
    initializeReflectionFramebuffer();
    initializeRefractionFramebuffer();
  }
  
  cleanUp() { // removes textures. call when closing the game
		this.gl.deleteFramebuffer(reflectionFramebuffer);
		this.gl.deleteTexture(reflectionTexture);
		this.gl.deleteRenderbuffer(reflectionDepthbuffer);
		this.gl.deleteFramebuffer(refractionFramebuffer);
		this.gl.deleteTexture(refractionTexture);
		this.gl.deleteTexture(refractionDepthTexture);
	}

	bindReflectionFramebuffer() { // call before rendering to this FBO
		bindFramebuffer(reflectionFramebuffer, REFLECTION_WIDTH, REFLECTION_HEIGHT);  // our own overloaded bind function
	}
	
	bindRefractionFramebuffer() { // call before rendering to this FBO
		bindFramebuffer(refractionFramebuffer, REFRACTION_WIDTH, REFRACTION_HEIGHT);
	}
	
	unbindCurrentFramebuffer() { // call to switch to default frame buffer. anything rendered afterwards goes to screen.
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);					// null: reset to default (** different than zero from video)
		this.gl.viewport(0, 0, window.innerWidth, window.innerHeight);  // changed from Display() since we're running in web
	}

	getReflectionTexture() { // get the resulting texture
		return reflectionTexture;
	}
	
	getRefractionTexture() { // get the resulting texture
		return refractionTexture;
	}
	
	getRefractionDepthTexture() { // get the resulting depth texture
		return refractionDepthTexture;
	}
}

function initializeReflectionFramebuffer() {
  reflectionFramebuffer = createFramebuffer();
  reflectionTexture = createTextureAttachment(REFLECTION_WIDTH,REFLECTION_HEIGHT);
  reflectionDepthbuffer = createDepthBufferAttachment(REFLECTION_WIDTH,REFLECTION_HEIGHT);
  unbindCurrentFramebuffer();
}

function initializeRefractionFramebuffer() {
  refractionFramebuffer = createFramebuffer();
  refractionTexture = createTextureAttachment(REFRACTION_WIDTH, REFRACTION_HEIGHT);
  refractionDepthTexture = createDepthTextureAttachment(REFRACTION_WIDTH, REFRACTION_HEIGHT);
  unbindCurrentFrameBuffer();
}

// tell openGL we want to render to one of our own FBO's instead of the default
// everything rendered after this will be bound to the FBO instead of the default
function bindFramebuffer(framebuffer, width, height) {
  this.gl.bindTexture(this.gl.TEXTURE_2D, 0); //To make sure the texture isn't bound
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
  this.gl.viewport(0, 0, width, height);			// choosing resolutions (can change with global vars at top)
}

function createFramebuffer() {
  let framebuffer = this.gl.glGenFramebuffers();  // call GL Gen, which gets new FB ready and returns ID. 
                                                  // might break. if so, maybe this.gl.createFramebuffer() and rework?
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);	// generate name for frame buffer
                                                            // have to bind to name using ID to be bound
  this.gl.glDrawBuffer(this.gl.COLOR_ATTACHMENT0);	// create the framebuffer
                                                // which color attachments to render to. always using 1 here
                                                // indicate that we will always render to color attachment 0
  return framebuffer;
}

// adds color buffer texture attachment to current FBO
function createTextureAttachment(width, height) {
  let texture = this.gl.GenTextures();
  this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
  this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, width, height,
      0, this.gl.RGB, this.gl.UNSIGNED_BYTE, (ByteBuffer)null);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
  this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0,
      texture, 0);				// adds texture attachment to currently bound FBO @ attachment. Last 0 is mipmap level.
  return texture;
}

// depth buffer attachment
function createDepthTextureAttachment(width, height){
  let texture = this.gl.genTextures();
  this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
  this.gl.texImage2D(this.gl.TEXTURE_2D, 0, GL14.GL_DEPTH_COMPONENT32, width, height,
      0, this.gl.DEPTH_COMPONENT, this.gl.FLOAT, (ByteBuffer)null);			// 32 bit depth texture
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
  GL32.glFramebufferTexture(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT,
      texture, 0);																			// add depth attachment instead of color
  return texture;
}

function createDepthBufferAttachment(width, height) {
  let depthBuffer = this.gl.genRenderbuffers();											// new render buffer: gets id, then bound
  this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depthBuffer);
  this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT, width,
      height);
  this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT,
      this.gl.RENDERBUFFER, depthBuffer);
  return depthBuffer;
}