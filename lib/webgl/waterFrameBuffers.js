export default class waterFrameBuffers {

  const REFLECTION_WIDTH = 320;
  const REFLECTION_HEIGHT = 180;
  const REFRACTION_WIDTH = 1280;
  const REFRACTION_WIDTH = 720;

  let reflectionFrameBuffer;
  let reflectionTexture;
  let reflectionDepthBuffer;

  let refractionFrameBuffer;
	let refractionTexture;
	let refractionDepthTexture;

  /**
   * @param {WebGLRenderingContext} GL 
   */
  constructor(GL) {
    
  }

  void cleanUp() { // removes textures. call when closing the game
		GL30.glDeleteFramebuffers(reflectionFrameBuffer);
		GL11.glDeleteTextures(reflectionTexture);
		GL30.glDeleteRenderbuffers(reflectionDepthBuffer);
		GL30.glDeleteFramebuffers(refractionFrameBuffer);
		GL11.glDeleteTextures(refractionTexture);
		GL11.glDeleteTextures(refractionDepthTexture);
	}

	function bindReflectionFrameBuffer() {//call before rendering to this FBO
		bindFrameBuffer(reflectionFrameBuffer,REFLECTION_WIDTH,REFLECTION_HEIGHT);
	}
	
	function bindRefractionFrameBuffer() {//call before rendering to this FBO
		bindFrameBuffer(refractionFrameBuffer,REFRACTION_WIDTH,REFRACTION_HEIGHT);
	}
	
	function unbindCurrentFrameBuffer() {//call to switch to default frame buffer. anything rendered afterwards goes to screen.
		GL30.glBindFramebuffer(GL30.GL_FRAMEBUFFER, 0);					// zero ID: reset to default
		GL11.glViewport(0, 0, Display.getWidth(), Display.getHeight());
	}

	function getReflectionTexture() {//get the resulting texture
		return reflectionTexture;
	}
	
	function getRefractionTexture() {//get the resulting texture
		return refractionTexture;
	}
	
	function getRefractionDepthTexture(){//get the resulting depth texture
		return refractionDepthTexture;
	}

	function initializeReflectionFrameBuffer() {
		reflectionFrameBuffer = createFrameBuffer();
		reflectionTexture = createTextureAttachment(REFLECTION_WIDTH,REFLECTION_HEIGHT);
		reflectionDepthBuffer = createDepthBufferAttachment(REFLECTION_WIDTH,REFLECTION_HEIGHT);
		unbindCurrentFrameBuffer();
	}
	
	function initializeRefractionFrameBuffer() {
		refractionFrameBuffer = createFrameBuffer();
		refractionTexture = createTextureAttachment(REFRACTION_WIDTH,REFRACTION_HEIGHT);
		refractionDepthTexture = createDepthTextureAttachment(REFRACTION_WIDTH,REFRACTION_HEIGHT);
		unbindCurrentFrameBuffer();
	}
	
	// tell openGL we want to render to one of our own FBO's instead of the default
	// everything rendered after this will be bound to the FBO instead of the default
	function bindFrameBuffer(int frameBuffer, int width, int height) {
		GL11.glBindTexture(GL11.GL_TEXTURE_2D, 0); //To make sure the texture isn't bound
		GL30.glBindFramebuffer(GL30.GL_FRAMEBUFFER, frameBuffer);
		GL11.glViewport(0, 0, width, height);			// choosing resolutions (can change with global vars at top)
	}

	function createFrameBuffer() {
	  let frameBuffer = GL30.glGenFramebuffers();								// call GL Gen, which gets new FB ready and returns ID
		//generate name for frame buffer
		GL30.glBindFramebuffer(GL30.GL_FRAMEBUFFER, frameBuffer);	// have to bind to name using ID to be bound
		//create the framebuffer
		GL11.glDrawBuffer(GL30.GL_COLOR_ATTACHMENT0);							// which color attachments to render to. always using 1 here
		//indicate that we will always render to color attachment 0
		return frameBuffer;
	}

	// adds color buffer texture attachment to current FBO
	function createTextureAttachment( int width, int height) {
		let texture = GL11.glGenTextures();
		GL11.glBindTexture(GL11.GL_TEXTURE_2D, texture);
		GL11.glTexImage2D(GL11.GL_TEXTURE_2D, 0, GL11.GL_RGB, width, height,
				0, GL11.GL_RGB, GL11.GL_UNSIGNED_BYTE, (ByteBuffer) null);
		GL11.glTexParameteri(GL11.GL_TEXTURE_2D, GL11.GL_TEXTURE_MAG_FILTER, GL11.GL_LINEAR);
		GL11.glTexParameteri(GL11.GL_TEXTURE_2D, GL11.GL_TEXTURE_MIN_FILTER, GL11.GL_LINEAR);
		GL32.glFramebufferTexture(GL30.GL_FRAMEBUFFER, GL30.GL_COLOR_ATTACHMENT0,
				texture, 0);				// adds texture attachment to currently bound FBO @ attachment. Last 0 is mipmap level.
		return texture;
	}
	
	// depth buffer attachment
	function createDepthTextureAttachment(int width, int height){
		let texture = GL11.glGenTextures();
		GL11.glBindTexture(GL11.GL_TEXTURE_2D, texture);
		GL11.glTexImage2D(GL11.GL_TEXTURE_2D, 0, GL14.GL_DEPTH_COMPONENT32, width, height,
				0, GL11.GL_DEPTH_COMPONENT, GL11.GL_FLOAT, (ByteBuffer) null);			// 32 bit depth texture
		GL11.glTexParameteri(GL11.GL_TEXTURE_2D, GL11.GL_TEXTURE_MAG_FILTER, GL11.GL_LINEAR);
		GL11.glTexParameteri(GL11.GL_TEXTURE_2D, GL11.GL_TEXTURE_MIN_FILTER, GL11.GL_LINEAR);
		GL32.glFramebufferTexture(GL30.GL_FRAMEBUFFER, GL30.GL_DEPTH_ATTACHMENT,
				texture, 0);																			// add depth attachment instead of color
		return texture;
	}

	function createDepthBufferAttachment(int width, int height) {
	  let depthBuffer = GL30.glGenRenderbuffers();											// new render buffer: gets id, then bound
		GL30.glBindRenderbuffer(GL30.GL_RENDERBUFFER, depthBuffer);
		GL30.glRenderbufferStorage(GL30.GL_RENDERBUFFER, GL11.GL_DEPTH_COMPONENT, width,
				height);
		GL30.glFramebufferRenderbuffer(GL30.GL_FRAMEBUFFER, GL30.GL_DEPTH_ATTACHMENT,
				GL30.GL_RENDERBUFFER, depthBuffer);
		return depthBuffer;
	}
}