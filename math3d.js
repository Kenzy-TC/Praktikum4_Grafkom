// math3d.js — helper Vec3 & Mat4

export const Vec3 = {
  subtract(a, b){ return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; },
  cross(a, b){
    return [
      a[1]*b[2] - a[2]*b[1],
      a[2]*b[0] - a[0]*b[2],
      a[0]*b[1] - a[1]*b[0],
    ];
  },
  normalize(v){
    const l = Math.hypot(v[0], v[1], v[2]);
    if (l < 1e-6) return [0,0,0];
    return [v[0]/l, v[1]/l, v[2]/l];
  },
  dot(a, b){ return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; },
};

export const Mat4 = {
  identity(){
    return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
  },
  translation(tx, ty, tz){
    return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, tx,ty,tz,1]);
  },
  rotationX(rad){
    const c = Math.cos(rad), s = Math.sin(rad);
    return new Float32Array([1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]);
  },
  rotationY(rad){
    const c = Math.cos(rad), s = Math.sin(rad);
    return new Float32Array([c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]);
  },
  scaling(sx, sy, sz){
    return new Float32Array([sx,0,0,0, 0,sy,0,0, 0,0,sz,0, 0,0,0,1]);
  },
  multiply(a, b){
    const out = new Float32Array(16);
    for (let c = 0; c < 4; c++){
      for (let r = 0; r < 4; r++){
        let s = 0;
        for (let k = 0; k < 4; k++){
          s += a[k*4 + r] * b[c*4 + k];
        }
        out[c*4 + r] = s;
      }
    }
    return out;
  },
  lookAt(position, target, up){
    const forward = Vec3.normalize(Vec3.subtract(target, position));
    const right   = Vec3.normalize(Vec3.cross(forward, up));
    const cUp     = Vec3.cross(right, forward);
    return new Float32Array([
       right[0],      cUp[0],      -forward[0], 0,
       right[1],      cUp[1],      -forward[1], 0,
       right[2],      cUp[2],      -forward[2], 0,
      -Vec3.dot(right, position),
      -Vec3.dot(cUp,   position),
       Vec3.dot(forward, position),
       1,
    ]);
  },
  perspective(fovRad, aspect, near, far){
    const f = 1.0 / Math.tan(fovRad / 2);
    const rangeInv = 1.0 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, 2 * near * far * rangeInv, 0,
    ]);
  },
  orthographic(l, r, b, t, n, f){
    return new Float32Array([
      2/(r-l), 0, 0, 0,
      0, 2/(t-b), 0, 0,
      0, 0, -2/(f-n), 0,
      -(r+l)/(r-l), -(t+b)/(t-b), -(f+n)/(f-n), 1,
    ]);
  },
};

export const degToRad = d => (d * Math.PI) / 180;