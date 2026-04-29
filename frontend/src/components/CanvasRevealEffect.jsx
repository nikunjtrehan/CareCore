// src/components/CanvasRevealEffect.jsx
// Adapted from the provided component — runs in Vite/React (no Next.js deps)
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ── ShaderMaterial mesh ──────────────────────────────────────────────────────
function ShaderMesh({ source, uniforms, maxFps = 60 }) {
  const { size } = useThree();
  const ref = useRef(null);

  const preparedUniforms = useMemo(() => {
    const out = {};
    for (const name in uniforms) {
      const u = uniforms[name];
      if (u.type === 'uniform1f')  out[name] = { value: u.value };
      else if (u.type === 'uniform1i')  out[name] = { value: u.value };
      else if (u.type === 'uniform1fv') out[name] = { value: u.value };
      else if (u.type === 'uniform3fv') out[name] = { value: u.value.map((v) => new THREE.Vector3(...v)) };
    }
    out.u_time = { value: 0 };
    out.u_resolution = { value: new THREE.Vector2(size.width * 2, size.height * 2) };
    return out;
  }, [size.width, size.height]);  // eslint-disable-line

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `
          precision mediump float;
          uniform vec2 u_resolution;
          out vec2 fragCoord;
          void main(){
            gl_Position = vec4(position.xy, 0.0, 1.0);
            fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
            fragCoord.y = u_resolution.y - fragCoord.y;
          }`,
        fragmentShader: source,
        uniforms: preparedUniforms,
        glslVersion: THREE.GLSL3,
        blending: THREE.CustomBlending,
        blendSrc: THREE.SrcAlphaFactor,
        blendDst: THREE.OneFactor,
      }),
    [source] // eslint-disable-line
  );

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.material.uniforms.u_time.value = clock.getElapsedTime();
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

// ── DotMatrix ─────────────────────────────────────────────────────────────────
function DotMatrix({
  colors = [[0, 0, 0]],
  opacities = [0.04, 0.04, 0.04, 0.04, 0.04, 0.08, 0.08, 0.08, 0.08, 0.14],
  totalSize = 20,
  dotSize = 2,
  reverse = false,
  center = ['x', 'y'],
}) {
  const colorsArray = useMemo(() => {
    if (colors.length === 1) return Array(6).fill(colors[0]);
    if (colors.length === 2) return [...Array(3).fill(colors[0]), ...Array(3).fill(colors[1])];
    return [colors[0], colors[0], colors[1], colors[1], colors[2], colors[2]];
  }, [colors]);

  const uniforms = {
    u_colors:     { value: colorsArray.map(([r, g, b]) => [r / 255, g / 255, b / 255]), type: 'uniform3fv' },
    u_opacities:  { value: opacities, type: 'uniform1fv' },
    u_total_size: { value: totalSize, type: 'uniform1f' },
    u_dot_size:   { value: dotSize,   type: 'uniform1f' },
    u_reverse:    { value: reverse ? 1 : 0, type: 'uniform1i' },
  };

  const source = `
    precision mediump float;
    in vec2 fragCoord;
    uniform float u_time;
    uniform float u_opacities[10];
    uniform vec3  u_colors[6];
    uniform float u_total_size;
    uniform float u_dot_size;
    uniform vec2  u_resolution;
    uniform int   u_reverse;
    out vec4 fragColor;

    float PHI = 1.61803398874989484820459;
    float random(vec2 xy){
      return fract(tan(distance(xy*PHI,xy)*0.5)*xy.x);
    }
    void main(){
      vec2 st = fragCoord.xy;
      ${center.includes('x') ? 'st.x -= abs(floor((mod(u_resolution.x,u_total_size)-u_dot_size)*0.5));' : ''}
      ${center.includes('y') ? 'st.y -= abs(floor((mod(u_resolution.y,u_total_size)-u_dot_size)*0.5));' : ''}

      float opacity = step(0.0,st.x)*step(0.0,st.y);
      vec2 st2 = vec2(int(st.x/u_total_size), int(st.y/u_total_size));

      float show_offset = random(st2);
      float rand = random(st2*floor((u_time/5.0)+show_offset+5.0));
      opacity *= u_opacities[int(rand*10.0)];
      opacity *= 1.0-step(u_dot_size/u_total_size, fract(st.x/u_total_size));
      opacity *= 1.0-step(u_dot_size/u_total_size, fract(st.y/u_total_size));

      vec3 color = u_colors[int(show_offset*6.0)];

      float animation_speed_factor = 0.5;
      vec2  center_grid = u_resolution/2.0/u_total_size;
      float dist = distance(center_grid, st2);
      float max_dist = distance(center_grid, vec2(0.0));

      float t_intro  = dist*0.01 + random(st2)*0.15;
      float t_outro  = (max_dist-dist)*0.02 + random(st2+42.0)*0.2;

      if(u_reverse==1){
        opacity *= 1.0-step(t_outro, u_time*animation_speed_factor);
        opacity *= clamp(step(t_outro+0.1, u_time*animation_speed_factor)*1.25, 1.0, 1.25);
      } else {
        opacity *= step(t_intro, u_time*animation_speed_factor);
        opacity *= clamp((1.0-step(t_intro+0.1, u_time*animation_speed_factor))*1.25, 1.0, 1.25);
      }

      fragColor = vec4(color, opacity);
      fragColor.rgb *= fragColor.a;
    }`;

  return <ShaderMesh source={source} uniforms={uniforms} />;
}

// ── Public export ─────────────────────────────────────────────────────────────
export function CanvasRevealEffect({
  animationSpeed = 10,
  opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
  colors = [[0, 255, 255]],
  containerClassName = '',
  dotSize,
  showGradient = true,
  reverse = false,
}) {
  return (
    <div className={`h-full relative w-full ${containerClassName}`}>
      <Canvas className="absolute inset-0 h-full w-full" style={{ position: 'absolute' }}>
        <DotMatrix
          colors={colors}
          dotSize={dotSize ?? 3}
          opacities={opacities}
          reverse={reverse}
          center={['x', 'y']}
        />
      </Canvas>
      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      )}
    </div>
  );
}
