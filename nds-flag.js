/* <nds-flag> — a slowly waving US flag, drawn in code so it stays sharp at any size.
 * WebGL renders the cloth folds and lighting; it falls back to a still image when
 * WebGL is unavailable or the visitor has reduced motion turned on.
 * Attributes (all optional):
 *   shade   0–1, how dark the flag is graded toward the site navy (default .62)
 *   speed   wave speed multiplier (default 1)
 */
(function () {
  var INK = [11 / 255, 27 / 255, 35 / 255];

  // ---------- flag texture (correct US flag proportions, 50 stars) ----------
  function flagTexture(W) {
    var H = Math.round(W / 1.9), c = document.createElement('canvas');
    c.width = W; c.height = H;
    var g = c.getContext('2d'), s = H / 13;
    for (var i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#ffffff' : '#b22234'; g.fillRect(0, Math.floor(i * s), W, Math.ceil(s) + 1); }
    var uw = 0.76 * H, uh = 7 * s;
    g.fillStyle = '#3c3b6e'; g.fillRect(0, 0, uw, uh);
    var r = 0.0616 * H / 2, G = 0.063 * H, E = 0.054 * H;
    g.fillStyle = '#ffffff';
    for (var row = 0; row < 9; row++) {
      var six = row % 2 === 0, n = six ? 6 : 5;
      for (var k = 0; k < n; k++) star(g, G * (six ? 2 * k + 1 : 2 * k + 2), E * (row + 1), r);
    }
    return c;
  }
  function star(g, cx, cy, R) {
    var r = R * 0.382; g.beginPath();
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, d = i % 2 ? r : R;
      g.lineTo(cx + d * Math.cos(a), cy + d * Math.sin(a));
    }
    g.closePath(); g.fill();
  }

  // ---------- shaders ----------
  var VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision highp float;',
    'varying vec2 v;uniform sampler2D tex;uniform float t,aspect,shade;uniform vec3 ink;',
    // height field of the cloth: a few slow travelling waves, stronger toward the fly end
    'float hgt(vec2 u){',
    '  float f=.35+.65*smoothstep(-.1,1.,u.x);',
    '  return f*(.55*sin(5.2*u.x-1.05*t+1.6*u.y)+.28*sin(9.1*u.x+3.7*u.y-1.55*t+1.3)+.12*sin(15.*u.x-5.*u.y-2.2*t));',
    '}',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
    'void main(){',
    // frame the flag: rotated, zoomed crop with the union on the left like a draped flag photo
    '  vec2 q=v-.5; q.x*=aspect;',
    '  float a=-.21; q=mat2(cos(a),-sin(a),sin(a),cos(a))*q;',
    '  vec2 u=q*vec2(.52,.98)/max(aspect*.42,1.)+vec2(.42,.46);',
    '  float h=hgt(u);',
    '  vec2 e=vec2(.004,0.);',
    '  float hx=(hgt(u+e.xy)-hgt(u-e.xy))/(2.*e.x), hy=(hgt(u+e.yx)-hgt(u-e.yx))/(2.*e.x);',
    // folds pull the fabric: displace lookup by the slope, which bends stripes and stars
    '  vec2 uv=u+vec2(hx*.008,h*.034+hy*.006);',
    '  vec3 n=normalize(vec3(-hx*.2,-hy*.2,1.));',
    '  vec3 L=normalize(vec3(-.45,.55,.7));',
    '  float dif=clamp(dot(n,L),0.,1.);',
    '  float spec=pow(clamp(dot(reflect(-L,n),vec3(0,0,1)),0.,1.),18.)*.35;',
    '  vec3 c=texture2D(tex,vec2(uv.x,1.-uv.y)).rgb;',
    '  c=c*(.18+1.05*dif*dif)+spec;',
    '  float lum=dot(c,vec3(.299,.587,.114)); c=mix(vec3(lum),c,.6)*vec3(.92,.97,1.02);', // mute and cool the colours
    '  c+= (hash(gl_FragCoord.xy+fract(t))-.5)*.03;',                              // fabric grain
    // grade toward the site navy: darker on the left (headline side) and at the bottom edge;
    // on narrow screens the text spans the full width, so grade evenly instead
    '  float side=mix(.84,mix(1.,.62,smoothstep(.0,1.,v.x)),smoothstep(1.1,1.7,aspect));',
    '  float k=side*shade+(1.-shade)*.25;',
    '  k=max(k,smoothstep(.32,0.,v.y));',
    '  k=max(k,smoothstep(.86,1.,v.y)*.8);',
    '  c=mix(c,ink,k);',
    '  gl_FragColor=vec4(c,1.);',
    '}'
  ].join('\n');

  function compile(gl, type, src) {
    var sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    return sh;
  }

  class NdsFlag extends HTMLElement {
    connectedCallback() {
      if (this._c) return;
      this.style.display = 'block'; this.style.overflow = 'hidden'; this.style.pointerEvents = 'none';
      this.style.background = '#0b1b23';
      this.setAttribute('aria-hidden', 'true');
      var c = this._c = document.createElement('canvas');
      c.style.cssText = 'display:block;width:100%;height:100%;opacity:0;transition:opacity 1.2s ease';
      this.appendChild(c);
      this._reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this._speed = +(this.getAttribute('speed') || 1);
      this._shade = +(this.getAttribute('shade') || 0.86);
      try { this._initGL(); } catch (e) { this._gl = null; }
      if (!this._gl) this._draw2D = true;
      var self = this;
      this._ro = new ResizeObserver(function () { self._resize(); self._frame(self._t || 0); });
      this._ro.observe(this);
      this._io = new IntersectionObserver(function (es) { self._vis = es[0].isIntersecting; if (self._vis) self._loop(); }, { rootMargin: '100px' });
      this._io.observe(this);
      this._resize(); this._frame(0);
      requestAnimationFrame(function () { c.style.opacity = '1'; });
    }
    disconnectedCallback() {
      if (this._ro) this._ro.disconnect(); if (this._io) this._io.disconnect();
      cancelAnimationFrame(this._raf); this._vis = false;
    }
    _initGL() {
      // preserveDrawingBuffer keeps the last frame, so a paused or reduced-motion flag still repaints
      var gl = this._c.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: true, powerPreference: 'low-power' });
      if (!gl) return;
      var self = this;
      this._c.addEventListener('webglcontextlost', function (e) {
        e.preventDefault(); cancelAnimationFrame(self._raf); self._running = false; self._gl = null;
        // a canvas that has held a WebGL context cannot switch to 2D, so swap in a fresh one
        var c2 = self._c.cloneNode(); self._c.replaceWith(c2); self._c = c2; c2.style.opacity = '1';
        self._draw2D = true; self._resize(); self._frame(self._t || 0);
      });
      var pr = gl.createProgram();
      gl.attachShader(pr, compile(gl, gl.VERTEX_SHADER, VS));
      gl.attachShader(pr, compile(gl, gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
      gl.useProgram(pr);
      var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      var tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, flagTexture(2048));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this._u = { t: gl.getUniformLocation(pr, 't'), aspect: gl.getUniformLocation(pr, 'aspect'), shade: gl.getUniformLocation(pr, 'shade'), ink: gl.getUniformLocation(pr, 'ink') };
      gl.uniform1f(this._u.shade, this._shade); gl.uniform3fv(this._u.ink, INK);
      this._gl = gl;
    }
    _resize() {
      var r = this.getBoundingClientRect(), w = Math.max(1, this.clientWidth || r.width), h = Math.max(1, this.clientHeight || r.height);
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5), cw = Math.round(w * dpr), ch = Math.round(h * dpr);
      if (this._c.width !== cw || this._c.height !== ch) { this._c.width = cw; this._c.height = ch; }
      this._aspect = w / h;
    }
    _frame(t) {
      this._t = t;
      if (this._gl) {
        var gl = this._gl; gl.viewport(0, 0, this._c.width, this._c.height);
        gl.uniform1f(this._u.t, t); gl.uniform1f(this._u.aspect, this._aspect);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      } else if (this._draw2D) { this._still(); }
    }
    _still() {
      var c = this._c, g = c.getContext('2d'); if (!g) return;
      var tex = this._tex || (this._tex = flagTexture(1600)), W = c.width, H = c.height;
      g.fillStyle = '#0b1b23'; g.fillRect(0, 0, W, H);
      g.save(); g.translate(W * .5, H * .5); g.rotate(.21); var s = Math.max(W / tex.width * 1.9, H / tex.height * 1.4);
      g.drawImage(tex, -tex.width * s * .42, -tex.height * s * .46, tex.width * s, tex.height * s); g.restore();
      var lg = g.createLinearGradient(0, 0, W, 0); lg.addColorStop(0, 'rgba(11,27,35,.9)'); lg.addColorStop(1, 'rgba(11,27,35,.55)');
      g.fillStyle = lg; g.fillRect(0, 0, W, H);
      var bg = g.createLinearGradient(0, H * .65, 0, H); bg.addColorStop(0, 'rgba(11,27,35,0)'); bg.addColorStop(1, 'rgba(11,27,35,1)');
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
    }
    _loop() {
      if (this._reduce || !this._gl || this._running) return;
      this._running = true;
      var self = this, t0 = performance.now() - (this._t || 0) * 1000 / this._speed, last = 0;
      var tick = function (now) {
        if (!self._vis || !self.isConnected) { self._running = false; return; }
        self._raf = requestAnimationFrame(tick);
        if (now - last < 32) return;            // ~30fps is plenty for slow cloth
        last = now; self._frame((now - t0) / 1000 * self._speed);
      };
      this._raf = requestAnimationFrame(tick);
    }
  }
  if (!customElements.get('nds-flag')) customElements.define('nds-flag', NdsFlag);
})();
