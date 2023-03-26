import "./style.css";
import * as THREE from "three";
import * as dat from "dat.gui";
import gsap from "gsap";

//Texture
const textureLoader = new THREE.TextureLoader();

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

//Object
const geometry = new THREE.PlaneBufferGeometry(1, 1.3);

/*  Since all images are named as 0,1,2,3,
    Using a for loop is efficient as we can run a loop from 0 to 3
    and use backticks to load these images according to their index,
    and then create a mesh and adding it into the scene.
*/
for (let i = 0; i < 4; i++) {
  //material
  const material = new THREE.MeshBasicMaterial({
    map: textureLoader.load(`/photographs/${i}.avif`),
  });

  const image = new THREE.Mesh(geometry, material); //combining geometry and material to form a mesh.
  image.position.set(Math.random() + 0.3, -i * 1.8); //to add different positions to the image.

  scene.add(image); //adding image to the scene
}

let objects = [];

//traverse to all the objects in the scene and push only the meshs into the "objects" array.
scene.traverse((object) => {
  if (object.isMesh) {
    objects.push(object);
  }
});

// Lights
const pointLight = new THREE.PointLight(0xffffff, 0.1);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 0;
camera.position.y = -0.5;
camera.position.z = 2;
scene.add(camera);

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */

const raycaster = new THREE.Raycaster(); //RayCasting

let y = 0;
let position = 0;

//to move camera position on scroll
const moveElementsOnScroll = (event) => {
  y = event.deltaY * -0.0009;
};

const mouse = new THREE.Vector2(); //this will contain the x and y co-ordinates of the mouse.

window.addEventListener("wheel", moveElementsOnScroll);

//updating Vector 2 co-ordinates
window.addEventListener("mousemove", (event) => {
  //to get a range of -1 to 1
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update objects
  y *= 0.9; // y's value will decrease gradually so that there is an end to camera shifting.
  position += y; //keep on adding the position

  camera.position.y = position; //set the camera position

  //Raycaster
  raycaster.setFromCamera(mouse, camera);

  // To determine when a raycaster which is the "mouse", intersects the elements of "objects".
  const intersects = raycaster.intersectObjects(objects);

  //when intersecting
  //for animating the image mesh on intersection.
  for (const intersect of intersects) {
    gsap.to(intersect.object.scale, { x: 1.3, y: 1.5 });
    gsap.to(intersect.object.rotation, { y: -0.5 });
    gsap.to(intersect.object.position, { z: -0.9 });
  }

  //when NOT intersecting
  //for reverting back to initial state.
  for (const object of objects) {
    if (!intersects.find((intersect) => intersect.object === object)) {
      gsap.to(object.scale, { x: 1, y: 1 });
      gsap.to(object.rotation, { y: 0 });
      gsap.to(object.position, { z: 0 });
    }
  }

  // Update Orbital Controls
  // controls.update()

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
