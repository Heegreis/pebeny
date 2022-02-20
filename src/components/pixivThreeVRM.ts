import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRM, VRMSchema, VRMUtils } from '@pixiv/three-vrm';

function loadModel(scene: THREE.Scene, modelPath: string) {
  const loader = new GLTFLoader();
  loader.load(
    // URL of the VRM you want to load
    // 'models/896301698663202135.vrm',
    // 'models/AliciaSolid_vrm-0.51.vrm',
    modelPath,

    // called when the resource is loaded
    (gltf) => {
      // calling this function greatly improves the performance
      VRMUtils.removeUnnecessaryJoints(gltf.scene);

      // generate a VRM instance from gltf
      VRM.from(gltf)
        .then((vrm) => {
          // add the loaded vrm to the scene
          scene.add(vrm.scene);

          // deal with vrm features
          console.log(vrm);

          // 將模型轉正(程式那麼長是為了符合typescript)
          if (vrm.humanoid) {
            const hips = vrm.humanoid.getBoneNode(
              // THREE.VRMSchema.HumanoidBoneName.Hips
              VRMSchema.HumanoidBoneName.Hips
            ) as THREE.Object3D;
            hips.rotation.y = Math.PI;
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },

    // called while loading is progressing
    (progress) =>
      console.log(
        'Loading model...',
        100.0 * (progress.loaded / progress.total),
        '%'
      ),

    // called when loading has errors
    (error) => console.error(error)
  );
}

export { loadModel };
