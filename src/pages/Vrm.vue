<template>
  <div ref="dragBar" class="q-electron-drag bg-primary">dragBar</div>
  <div ref="renderDiv"></div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, Ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { loadModel } from 'components/pixivThreeVRM';

function setDragBar() {
  const dragBar = ref();
  const dragBarHeight = ref(0);
  // let dragBarHeight = 0;
  onMounted(() => {
    dragBarHeight.value = (dragBar.value as HTMLElement).offsetHeight;
  });
  return { dragBar, dragBarHeight };
}

function setThreejs(dragBarHeight: Ref) {
  const renderDiv = ref();

  onMounted(() => {
    // renderer
    const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
      alpha: true, // 是否可以設定背景色透明
      antialias: true, // 反鋸齒
    });
    renderer.setSize(
      window.innerWidth,
      window.innerHeight - dragBarHeight.value
    );
    renderer.setClearColor(0x000000, 0); // the default
    renderer.setPixelRatio(window.devicePixelRatio);
    (renderDiv.value as HTMLElement).appendChild(renderer.domElement);

    // camera
    const camera = new THREE.PerspectiveCamera(
      30.0,
      window.innerWidth / (window.innerHeight - dragBarHeight.value),
      // window.innerWidth / window.innerHeight,
      0.1,
      20.0
    );
    camera.position.set(0.0, 1.0, 5.0);

    // camera controls
    const controls: OrbitControls = new OrbitControls(
      camera,
      renderer.domElement
    );
    controls.screenSpacePanning = true;
    controls.target.set(0.0, 1.0, 0.0);
    controls.update();

    // scene
    const scene = new THREE.Scene();

    // light
    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1.0, 1.0, 1.0).normalize();
    scene.add(light);

    // midel
    const modelPath = 'models/896301698663202135.vrm';
    // const modelPath = 'models/AliciaSolid_vrm-0.51.vrm';
    loadModel(scene, modelPath);

    // helpers
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    function animate() {
      requestAnimationFrame(animate);

      renderer.render(scene, camera);
    }

    animate();
  });

  return {
    renderDiv,
  };
}

export default defineComponent({
  name: 'Vrm',
  setup() {
    const { dragBar, dragBarHeight } = setDragBar();

    const { renderDiv } = setThreejs(dragBarHeight);

    return {
      dragBar,
      renderDiv,
    };
  },
});
</script>
