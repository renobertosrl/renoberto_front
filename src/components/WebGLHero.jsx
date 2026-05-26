import { useEffect, useRef } from 'react';

// ---- GLSL ----

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  v_uv.y = 1.0 - v_uv.y;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D u_tex;
uniform vec2 u_mouse;
uniform vec2 u_res;
uniform vec2 u_img;
uniform float u_str;
uniform float u_dark;
varying vec2 v_uv;

vec2 cover(vec2 uv) {
  float ca = u_res.x / u_res.y;
  float ia = u_img.x / u_img.y;
  vec2 s = ca > ia ? vec2(1.0, ca / ia) : vec2(ia / ca, 1.0);
  return (uv - 0.5) * s + 0.5;
}

void main() {
  vec2 d = v_uv - u_mouse;
  float ar = u_res.x / u_res.y;
  float dist = length(d * vec2(ar, 1.0));
  float falloff = exp(-dist * dist * 4.5);
  float wave = sin(dist * 18.0 - u_str * 10.0) * falloff * u_str * 0.065;
  vec2 off = normalize(d + 0.0001) * wave;
  vec4 c = texture2D(u_tex, clamp(cover(v_uv) + off, 0.02, 0.98));
  gl_FragColor = vec4(c.rgb * u_dark, 1.0);
}`;

// ---- Helpers ----

function mkShader(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

// ---- Component ----

export default function WebGLHero({ src, darkOverlay = 0.55 }) {
  const canvasRef = useRef(null);
  const st = useRef({}); // shared WebGL state across effects

  // ---- Init GL (once) ----
  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, mkShader(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, mkShader(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([12,12,12,255]));

    const u = {
      tex:   gl.getUniformLocation(prog, 'u_tex'),
      mouse: gl.getUniformLocation(prog, 'u_mouse'),
      res:   gl.getUniformLocation(prog, 'u_res'),
      img:   gl.getUniformLocation(prog, 'u_img'),
      str:   gl.getUniformLocation(prog, 'u_str'),
      dark:  gl.getUniformLocation(prog, 'u_dark'),
    };
    gl.uniform1i(u.tex, 0);
    gl.uniform1f(u.dark, darkOverlay);
    gl.uniform2f(u.img, 1, 1);

    st.current = { gl, tex, u, prog, imgRes: [1, 1] };

    // Resize observer
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Interaction
    let mouse = { x: 0.5, y: 0.5 };
    let target = { x: 0.5, y: 0.5 };
    let strength = 0;
    let targetStr = 0;
    let raf;

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX ?? e.touches?.[0]?.clientX ?? -1;
      const cy = e.clientY ?? e.touches?.[0]?.clientY ?? -1;
      const x = (cx - rect.left) / rect.width;
      const y = (cy - rect.top) / rect.height;
      if (x >= -0.1 && x <= 1.1 && y >= -0.1 && y <= 1.1) {
        target = { x, y };
        targetStr = 1;
      } else {
        targetStr = 0;
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', () => { targetStr = 0; });

    const render = () => {
      mouse.x += (target.x - mouse.x) * 0.07;
      mouse.y += (target.y - mouse.y) * 0.07;
      strength += (targetStr - strength) * 0.05;

      gl.uniform2f(u.mouse, mouse.x, 1 - mouse.y);
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform2f(u.img, st.current.imgRes[0], st.current.imgRes[1]);
      gl.uniform1f(u.str, strength);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      gl.deleteProgram(prog);
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Reload texture when src changes ----
  useEffect(() => {
    const { gl, tex } = st.current;
    if (!gl || !src) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      st.current.imgRes = [img.naturalWidth, img.naturalHeight];
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };
    img.src = src;
  }, [src]);

  // ---- Update darkness when prop changes ----
  useEffect(() => {
    const { gl, u, prog } = st.current;
    if (!gl) return;
    gl.useProgram(prog);
    gl.uniform1f(u.dark, darkOverlay);
  }, [darkOverlay]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}
