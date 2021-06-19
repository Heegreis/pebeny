<template>
  <div>
    <div ref="dragBar" class="q-electron-drag bg-primary">123</div>
    <div ref="renderDiv"></div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import * as THREE from 'three'
// import {WebGLRenderer} from 'three'
// import GLTFLoader from 'three/examples/jsm/loaders/GLTFLoader'
// import OrbitControls from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { VRM, VRMSchema, VRMUtils } from '@pixiv/three-vrm'

export default Vue.extend({
  name: 'Vrm',
  // created: function() {
  //   // <HTMLElement>this.$refs.renderDiv
  //   // this.renderDiv = this.$refs.renderDiv as HTMLElement
  // },
  mounted: function() {
    const dragBarHeight: number = (this.$refs.dragBar as HTMLElement)
      .offsetHeight
    // const dragBarHeight = this.$refs.dragBar.offsetHeight
    // renderer
    const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
      alpha: true
    })
    renderer.setSize(window.innerWidth, window.innerHeight - dragBarHeight)
    renderer.setClearColor(0x000000, 0) // the default
    renderer.setPixelRatio(window.devicePixelRatio)
    // document.body.appendChild(renderer.domElement)
    // this.$refs.renderDiv.appendChild(renderer.domElement)
    let renderDiv = this.$refs.renderDiv as HTMLElement
    renderDiv.appendChild(renderer.domElement)

    // camera
    const camera = new THREE.PerspectiveCamera(
      30.0,
      window.innerWidth / (window.innerHeight - dragBarHeight),
      // window.innerWidth / window.innerHeight,
      0.1,
      20.0
    )
    camera.position.set(0.0, 1.0, 5.0)

    // camera controls
    const controls: OrbitControls = new OrbitControls(
      camera,
      renderer.domElement
    )
    controls.screenSpacePanning = true
    controls.target.set(0.0, 1.0, 0.0)
    controls.update()

    // scene
    const scene = new THREE.Scene()

    // light
    const light = new THREE.DirectionalLight(0xffffff)
    light.position.set(1.0, 1.0, 1.0).normalize()
    scene.add(light)

    // gltf and vrm
    const loader: GLTFLoader = new GLTFLoader()
    loader.crossOrigin = 'anonymous'
    loader.load(
      // URL of the VRM you want to load
      '/models/896301698663202135.vrm',

      // called when the resource is loaded
      gltf => {
        // calling this function greatly improves the performance
        // VRMUtils.VRMUtils.removeUnnecessaryJoints(gltf.scene)
        VRMUtils.removeUnnecessaryJoints(gltf.scene)

        // generate VRM instance from gltf
        VRM.from(gltf)
          .then(vrm => {
            console.log(vrm)
            scene.add(vrm.scene)

            vrm.humanoid.getBoneNode(
              // THREE.VRMSchema.HumanoidBoneName.Hips
              VRMSchema.HumanoidBoneName.Hips
            ).rotation.y = Math.PI
          })
          .catch(error => console.log(error))
      },

      // called while loading is progressing
      progress =>
        console.log(
          'Loading model...',
          100.0 * (progress.loaded / progress.total),
          '%'
        ),

      // called when loading has errors
      error => console.error(error)
    )

    // helpers
    const gridHelper = new THREE.GridHelper(10, 10)
    scene.add(gridHelper)

    const axesHelper = new THREE.AxesHelper(5)
    scene.add(axesHelper)

    function animate() {
      requestAnimationFrame(animate)

      renderer.render(scene, camera)
    }

    animate()
  }
})
</script>
