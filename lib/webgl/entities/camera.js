import { vec3, mat4 } from "gl-matrix/src/gl-matrix";
import { quat } from "gl-matrix";

export default class Camera {
  constructor(eye, center, up) {
    this.eye = eye;
    this.center = center;
    this.rotation = 0;
    this.up = up;

    this.rotate = 0;
    this.translation = 0;

    this.currentAngle = 0;
    window.addEventListener("keydown", (evt) => {
      if (evt.key === "ArrowLeft") {
        this.rotate = -1;
      } else if (evt.key === "ArrowRight") {
        this.rotate = 1;
      } else if (evt.key === "ArrowUp") {
        this.translation = 1;
      } else if (evt.key === "ArrowDown") {
        this.translation = -1;
      }
    });

    window.addEventListener("keyup", (evt) => {
      if (evt.key === "ArrowLeft") {
        this.rotate = 0;
      } else if (evt.key === "ArrowRight") {
        this.rotate = 0;
      } else if (evt.key === "ArrowUp") {
        this.translation = 0;
      } else if (evt.key === "ArrowDown") {
        this.translation = 0;
      }
    });
  }
  move() {
    this.eye[1] += this.translation;
    if (this.eye[1] < 0) this.eye[1] = 0;
    if (this.eye[1] >= 40) this.eye[1] = 40;

    this.rotation = 0;
    if (this.currentAngle < (2 * Math.PI) / 12 && this.rotate === 1) {
      this.rotation = 0.02;
      this.currentAngle += 0.02;
    } else if (this.currentAngle > (-2 * Math.PI) / 12 && this.rotate === -1) {
      this.rotation = -0.02;
      this.currentAngle -= 0.02;
    }
    this.rotateY();
  }

  rotateY() {
    let rotationMat = mat4.create();
    mat4.fromYRotation(rotationMat, this.rotation);
    vec3.transformMat4(this.up, this.up, rotationMat);
    vec3.transformMat4(this.eye, this.eye, rotationMat);
  }

  getViewMatrix() {
    let eye = vec3.create();
    let center = vec3.create();
    let up = vec3.create();
    let viewMatrix = mat4.create();

    vec3.set(eye, this.eye[0], this.eye[1], this.eye[2]);
    vec3.set(center, this.center[0], this.center[1], this.center[2]);
    vec3.set(up, this.up[0], this.up[1], this.up[2]);

    mat4.lookAt(viewMatrix, eye, center, up);
    return viewMatrix;
  }

  // Instance Variable Getters
  //-------------------------
  // Returns right vector
  right() {
    return this._right.copy();
  }

  // Returns up vector
  up() {
    return this._up.copy();
  }

  // Returns the position of the target
  target() {
    return this.pos().copy().add(this.forward().copy().scale(-this._dist));
  }

  // Returns position of camera
  pos() {
    return this._eye.copy();
  }

  // Camera::offset - Offsets the camera
  // @param dir - the direction to offset the camera
  // @param dt - the distance to offset the camera
  // @param offsetTarget - if true, also offsets the target position,
  //                       otherwise keeps original target
  offset(dir, dt, offsetTarget) {
    console.assert(dir != null);
    console.assert(dt != null);
    // Offset the camera position
    dir.normalize();
    dir.scale(dt);
    const target = this.target();
    this._eye.add(dir);
    if (offsetTarget === true) {
      target.add(dir);
    }
    this.setTarget(target);
  }

  // Camera::rotate   - rotates the camera about any arbitrary axis to the
  //                    camera
  // @param axis      - a vec3 specify the axis to rotate about
  // @param radians   - the number of radians to rotate the camera,
  //                    the sign of the number affects rotation direction
  // @param pos       - position of the axis of rotation. If not given, the
  //                    axis is assumed to pass through the camera
  rotate(axis, radians, pos) {
    // TODO: add preconditions and checks for small angles or axis
    console.assert(axis != null);
    console.assert(radians != null);
    axis.normalize();
    // Compute rotation matrix
    const rotMat = new mat4().setIdentity();
    rotMat.rotate(radians, axis);
    // Compute new basis vectors
    this._up = rotMat.multiplyVec3(this._up);
    this._forward = rotMat.multiplyVec3(this._forward);
    this._right = rotMat.multiplyVec3(this._right);
    const rotQuat = Quat.fromAxisAngle(axis, radians);
    this._orientation = Quat.product(rotQuat, this._orientation);
    if (pos != null) {
      let posToEye = vec3.difference(this._eye, pos);
      posToEye = rotMat.multiplyVec3(posToEye);
      this._eye = vec3.sum(pos, posToEye);
    }
  }
}
