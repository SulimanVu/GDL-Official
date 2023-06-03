import * as THREE from "three";

import Experience from "../Experience.js";
import Render from "./Render.js";

export default class Lights {
  constructor() {
    this.experience = Experience.instance;
    this.render = new Render();
    this.renderer = this.render.renderer;
    this.camera = this.render.camera;
    this.resources = this.experience.resources;
    this.scene = this.render.scene;

    this.setInstance();
    this.setInstanceHelper();
    this.setCameraHelper();
    this.setCustomShadow();
    this.setDebug();
  }

  setInstance() {
    // Цвет свреху
    this.instance = new THREE.SpotLight(0xffffff, 50, 100, 1.5);
    this.instance.position.set(0, 7, 4);

    // Цвет снизу
    this.i = new THREE.SpotLight(0xffffff, 50, 100, 1.5);
    this.i.position.set(0, -20, 20)

    this.instance.castShadow = true;

    this.instance.shadow.camera.top = 3;
    this.instance.shadow.camera.right = 3;
    this.instance.shadow.camera.bottom = -3;
    this.instance.shadow.camera.left = -3;
    this.instance.shadow.camera.near = 5;
    this.instance.shadow.camera.far = 20;

    this.instance.shadow.radius = 3.3;

    this.instance.shadow.mapSize.set(2048, 2048);
    this.instance.shadow.bias = 0;
    this.instance.shadow.normalBias = 0.0;

    this.scene.add(this.instance);
    this.scene.add(this.i);
    this.scene.add(this.instance.target);
  }

  setInstanceHelper() {
    this.instanceHelper = new THREE.SpotLightHelper(this.instance, 5);
    this.instanceHelper.visible = false;
    this.scene.add(this.instanceHelper);
  }

  setCameraHelper() {
    this.cameraHelper = new THREE.CameraHelper(this.instance.shadow.camera);
    this.cameraHelper.visible = false;
    this.scene.add(this.cameraHelper);
  }

  setCustomShadow() {
    this.customShadow = {};

    this.customShadow.parameters = {};
    this.customShadow.parameters.lightSize = 0.025;
    this.customShadow.parameters.frustumWidth = 5;
    this.customShadow.parameters.nearPlane = 7;
    this.customShadow.parameters.samples = 5;
    this.customShadow.parameters.rings = 1;

    this.customShadow.originalShader =
      THREE.ShaderChunk.shadowmap_pars_fragment;

    this.customShadow.compileShader = () => {
      let shader = this.customShadow.originalShader;

      shader = shader.replace(
        "#ifdef USE_SHADOWMAP",
        `
                    #ifdef USE_SHADOWMAP

                    #define LIGHT_WORLD_SIZE ${this.customShadow.parameters.lightSize.toFixed(
          3
        )}
                    #define LIGHT_FRUSTUM_WIDTH ${this.customShadow.parameters.frustumWidth.toFixed(
          3
        )}
                    #define LIGHT_SIZE_UV (LIGHT_WORLD_SIZE / LIGHT_FRUSTUM_WIDTH)
                    #define NEAR_PLANE ${this.customShadow.parameters.nearPlane.toFixed(
          3
        )}

                    #define NUM_SAMPLES ${this.customShadow.parameters.samples}
                    #define NUM_RINGS ${this.customShadow.parameters.rings}
                    #define BLOCKER_SEARCH_NUM_SAMPLES NUM_SAMPLES

                    vec2 poissonDisk[NUM_SAMPLES];

                    void initPoissonSamples( const in vec2 randomSeed ) {
                        float ANGLE_STEP = PI2 * float( NUM_RINGS ) / float( NUM_SAMPLES );
                        float INV_NUM_SAMPLES = 1.0 / float( NUM_SAMPLES );

                        // jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/
                        float angle = rand( randomSeed ) * PI2;
                        float radius = INV_NUM_SAMPLES;
                        float radiusStep = radius;

                        for( int i = 0; i < NUM_SAMPLES; i ++ ) {
                            poissonDisk[i] = vec2( cos( angle ), sin( angle ) ) * pow( radius, 0.75 );
                            radius += radiusStep;
                            angle += ANGLE_STEP;
                        }
                    }

                    float penumbraSize( const in float zReceiver, const in float zBlocker ) { // Parallel plane estimation
                        return (zReceiver - zBlocker) / zBlocker;
                    }

                    float findBlocker( sampler2D shadowMap, const in vec2 uv, const in float zReceiver ) {
                        // This uses similar triangles to compute what
                        // area of the shadow map we should search
                        float searchRadius = LIGHT_SIZE_UV * ( zReceiver - NEAR_PLANE ) / zReceiver;
                        float blockerDepthSum = 0.0;
                        int numBlockers = 0;

                        for( int i = 0; i < BLOCKER_SEARCH_NUM_SAMPLES; i++ ) {
                            float shadowMapDepth = unpackRGBAToDepth(texture2D(shadowMap, uv + poissonDisk[i] * searchRadius));
                            if ( shadowMapDepth < zReceiver ) {
                                blockerDepthSum += shadowMapDepth;
                                numBlockers ++;
                            }
                        }

                        if( numBlockers == 0 ) return -1.0;

                        return blockerDepthSum / float( numBlockers );
                    }

                    float PCF_Filter(sampler2D shadowMap, vec2 uv, float zReceiver, float filterRadius ) {
                        float sum = 0.0;
                        float depth;
                        #pragma unroll_loop_start
                        for( int i = 0; i < ${this.customShadow.parameters.samples
        } ; i ++ ) {
                            depth = unpackRGBAToDepth( texture2D( shadowMap, uv + poissonDisk[ i ] * filterRadius ) );
                            if( zReceiver <= depth ) sum += 1.0;
                        }
                        #pragma unroll_loop_end
                        #pragma unroll_loop_start
                        for( int i = 0; i < ${this.customShadow.parameters.samples
        } ; i ++ ) {
                            depth = unpackRGBAToDepth( texture2D( shadowMap, uv + -poissonDisk[ i ].yx * filterRadius ) );
                            if( zReceiver <= depth ) sum += 1.0;
                        }
                        #pragma unroll_loop_end
                        return sum / ( 2.0 * float( ${this.customShadow.parameters.samples
        }  ) );
                    }

                    float PCSS ( sampler2D shadowMap, vec4 coords ) {
                        vec2 uv = coords.xy;
                        float zReceiver = coords.z; // Assumed to be eye-space z in this code

                        initPoissonSamples( uv );
                        // STEP 1: blocker search
                        float avgBlockerDepth = findBlocker( shadowMap, uv, zReceiver );

                        //There are no occluders so early out (this saves filtering)
                        if( avgBlockerDepth == -1.0 ) return 1.0;

                        // STEP 2: penumbra size
                        float penumbraRatio = penumbraSize( zReceiver, avgBlockerDepth );
                        float filterRadius = penumbraRatio * LIGHT_SIZE_UV * NEAR_PLANE / zReceiver;

                        // STEP 3: filtering
                        //return avgBlockerDepth;
                        return PCF_Filter( shadowMap, uv, zReceiver, filterRadius );
                    }
                `
      );

      shader = shader.replace(
        "#if defined( SHADOWMAP_TYPE_PCF )",
        `
                    return PCSS( shadowMap, shadowCoord );
                    #if defined( SHADOWMAP_TYPE_PCF )
                `
      );

      THREE.ShaderChunk.shadowmap_pars_fragment = shader;
    };

    this.customShadow.updateSceneMaterial = () => {
      this.customShadow.compileShader();

      this.scene.traverse((_child) => {
        if (_child.isMesh) {
          _child.material.needsUpdate = true;
          _child.material.customProgramCacheKey = () => {
            return Math.random();
          };
        }
      });
    };

    this.customShadow.compileShader();

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20000, 20000, 8, 8),
      new THREE.MeshPhongMaterial({ color: 0x404040, specular: 0x111111 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  setDebug() {
    const debug = this.experience.debug;

    if (!debug.active) return;

    const folder = debug.ui.getFolder("lights");
    folder.open();

    folder
      .add(this.instance.position, "x")
      .min(-10)
      .max(10)
      .step(0.01)
      .name("positionX");
    folder
      .add(this.instance.position, "y")
      .min(-10)
      .max(10)
      .step(0.01)
      .name("positionY");
    folder
      .add(this.instance.position, "z")
      .min(-10)
      .max(10)
      .step(0.01)
      .name("positionZ");

    folder.add(this.instance, "castShadow");
    folder
      .add(this.instance, "intensity")
      .min(0)
      .max(50)
      .step(0.001)
      .name("intensity");
    folder.add(this.instanceHelper, "visible").name("helperVisible");

    const shadowFolder = debug.ui.getFolder("lights/shadow");
    shadowFolder.open();

    shadowFolder.add(this.cameraHelper, "visible").name("cameraHelperVisible");
    shadowFolder
      .add(this.instance.shadow, "bias")
      .min(-0.01)
      .max(0.01)
      .step(0.0001)
      .name("bias");
    shadowFolder
      .add(this.instance.shadow, "radius")
      .min(0)
      .max(10)
      .step(0.001)
      .name("radius");
    shadowFolder
      .add(this.instance.shadow, "normalBias")
      .min(-0.1)
      .max(0.1)
      .step(0.0001)
      .name("normalBias");
    shadowFolder
      .add(this.customShadow.parameters, "lightSize")
      .min(0)
      .max(0.1)
      .step(0.001)
      .name("lightSize")
      .onFinishChange(this.customShadow.updateSceneMaterial);
    shadowFolder
      .add(this.customShadow.parameters, "frustumWidth")
      .min(0)
      .max(10)
      .step(0.001)
      .name("frustumWidth")
      .onFinishChange(this.customShadow.updateSceneMaterial);
    shadowFolder
      .add(this.customShadow.parameters, "nearPlane")
      .min(1)
      .max(10)
      .step(0.001)
      .name("nearPlane")
      .onFinishChange(this.customShadow.updateSceneMaterial);
    shadowFolder
      .add(this.customShadow.parameters, "samples")
      .min(1)
      .max(15)
      .step(1)
      .name("samples")
      .onFinishChange(this.customShadow.updateSceneMaterial);
    shadowFolder
      .add(this.customShadow.parameters, "rings")
      .min(1)
      .max(15)
      .step(1)
      .name("rings")
      .onFinishChange(this.customShadow.updateSceneMaterial);
  }
}
