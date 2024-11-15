import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import gsap from 'gsap';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit controls
//const controls = new OrbitControls(camera, renderer.domElement);
//controls.enableDamping = true;

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 10);
scene.add(ambientLight);

// Texture loader
const textureLoader = new THREE.TextureLoader();
const texture360 = textureLoader.load('textures/360_view_imag.png');
const matcapTexture = textureLoader.load('textures/7877EE_D87FC5_75D9C7_1C78C0.jpg'); // Load your matcap texture here
const textureCamo = textureLoader.load('textures/2A6276_041218_739BA6_042941.jpg');
textureCamo.colorSpace = THREE.SRGBColorSpace;
const smokeTexture = textureLoader.load('textures/smoke/Explosion/explosion00.png',);


// load cubetectures /envmap/nightSky/nx.png
const cubeTextureLoader = new THREE.CubeTextureLoader();
const environmentMapTexture = cubeTextureLoader.load([
  'textures/envmap/nightSky/nx.png',
  'textures/envmap/nightSky/px.png',
  'textures/envmap/nightSky/py.png',
  'textures/envmap/nightSky/ny.png',
  'textures/envmap/nightSky/pz.png',
  'textures/envmap/nightSky/nz.png',
]);

scene.environment = environmentMapTexture;

// Green cube for reference
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
//scene.add(cube);


// 360-degree textured sphere background
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(10, 32, 32),
  new THREE.MeshBasicMaterial({
    map: texture360,
    side: THREE.DoubleSide,
  })
);
scene.add(sphere);

// loop 20x, make a plane with smokeTextures in random position
const smokeParticles = new THREE.Group();
const smokeMaterial = new THREE.MeshBasicMaterial({
  map: smokeTexture,
  transparent: true,
  opacity: 0.5,
  color: 0xffffff,
});

for (let i = 0; i < 20; i++) {
  const smokeGeo = new THREE.PlaneGeometry(1, 1);
  const smoke = new THREE.Mesh(smokeGeo, smokeMaterial);
  smoke.position.set(Math.random() * 10 - 0.5, Math.random() * 10 - 0.5, Math.random() * 10 - 0.5);
  smoke.material.opacity = 0.6;
  smokeParticles.add(smoke);
}

smokeParticles.position.y = 2;
scene.add(smokeParticles);


//spacegroup
const spaceGroup = new THREE.Group();
  

// Load GLTF model with MeshMatcapMaterial using custom matcap texture
const gltfLoader = new GLTFLoader();
let model; // Variable to store the GLTF model

gltfLoader.load('models/rainbow_butterfly/scene.gltf', (gltf) => {
  // Traverse each mesh in the GLTF scene and apply the custom MeshMatcapMaterial
  gltf.scene.traverse((child) => {
     if(child.name !== 'Object_7'){
      console.log(child.name);
       //child.material = new THREE.MeshMatcapMaterial({
        //matcap: matcapTexture, // Use your custom matcap texture here
        child.material = new THREE.MeshStandardMaterial({ // add own color for reflection
          map: textureCamo,
          color: 0xffffff,
          metalness: 1,
          roughness: 0.1,
        });
     }  //else {
          //child.material = new THREE.MeshStandardMaterial({ // add own color for reflection
          //map: textureCamo,
          //color: 0xffffff,
          //metalness: 0.9,
          //roughness: 0.1,
      //});
     //}
  });

  // Scale and position adjustments
  gltf.scene.scale.set(2, 2, 2);
  gltf.scene.position.y = -1;

  // Save reference to the model for animation
  model = gltf.scene;

  // Add the GLTF model to the scene
  scene.add(model);
  // add spacegroup
  scene.add(spaceGroup);
});

// Handle window resizing
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Animation loop
let clock = new THREE.Clock();

// deetct scroll
window.addEventListener("scroll", () => {
  const scroll = window.scrollY;

  //move model forward Z on scroll
  model.position.z = scroll * 0.001;

});
  

function animate() {
  // Rotate the cube
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  // Animate the model if it's loaded
  if (model) {
    // Use a sine wave for smooth up-and-down motion
    const time = clock.getElapsedTime();
    model.position.y = -1 + Math.sin(time) * 0.5; // Adjust amplitude and offset as needed
  }

  // Update controls
  //controls.update();

  // Render scene
  renderer.render(scene, camera);
}

// Set the animation loop
renderer.setAnimationLoop(animate);
