import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {gsap} from 'gsap'

let height, width, color, carModel;
width = window.innerWidth
height = window.innerHeight
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);
renderer.setSize( width, height );
const camera = new THREE.PerspectiveCamera( 36, width / height , 0.1, 1000 );
const sceneLimitXMin = -100;
const sceneLimitXMax = 100;
const sceneLimitZMin = -100;
const sceneLimitZMax = 100;
const clock = new THREE.Clock(); 
const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
const planeMaterial = new THREE.MeshBasicMaterial({ visible: false });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;  // Orienter le plan horizontalement
scene.add(plane);

// Initialiser le raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('dblclick', function(event) {
    event.preventDefault();

    // Convertir les coordonnées de la souris
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Raycasting
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(plane);

    if (intersects.length > 0) {
        const targetPosition = intersects[0].point;

        // Calculer le vecteur direction opposé
        const direction = new THREE.Vector3().subVectors(camera.position, targetPosition).normalize();

        // Déterminer la nouvelle orientation de la caméra
        const newCameraPosition = targetPosition;
        const lookAtPosition = new THREE.Vector3().addVectors(targetPosition, direction);

        // Animer la caméra
        gsap.to(camera.position, {
            x: newCameraPosition.x,
            y: newCameraPosition.y,
            z: newCameraPosition.z,
            duration: 2,
            ease: "power3.inOut",
            onUpdate: function () {
                camera.lookAt(lookAtPosition);
                checkBounds();
            }
        });
    }
});


// Ajouter des écouteurs d'événements clavier
document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

// Variables pour suivre les touches enfoncées
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// Fonction pour mettre à jour les touches enfoncées
function onKeyDown(event) {
    if (event.key in keys) {
        keys[event.key] = true;
    }
}

function onKeyUp(event) {
    if (event.key in keys) {
        keys[event.key] = false;
    }
}

function checkBounds() {
    console.log(`Before: x=${camera.position.x}, z=${camera.position.z}`);
    camera.position.x = Math.max(sceneLimitXMin, Math.min(sceneLimitXMax, camera.position.x));
    camera.position.z = Math.max(sceneLimitZMin, Math.min(sceneLimitZMax, camera.position.z));
    console.log(`After: x=${camera.position.x}, z=${camera.position.z}`);

}

const cameraSpeed = 5;

function updateCameraPosition(delta) {
    if (!delta) delta = clock.getDelta(); // S'assure que delta est défini
    // Calcul des vecteurs de déplacement avant et latéral basés sur l'orientation de la caméra
    let forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0; // Ne change pas l'altitude de la caméra
    forward.normalize();

    let right = new THREE.Vector3();
    right.crossVectors(forward, camera.up);
    right.normalize();

    // Détection des touches pressées et ajustement de la position de la caméra
    if (keys.ArrowUp) {
        camera.position.addScaledVector(forward, cameraSpeed * delta);
    }
    if (keys.ArrowDown) {
        camera.position.addScaledVector(forward, -cameraSpeed * delta);
    }
    if (keys.ArrowLeft) {
        camera.position.addScaledVector(right, -cameraSpeed * delta);
    }
    if (keys.ArrowRight) {
        camera.position.addScaledVector(right, cameraSpeed * delta);
    }
    checkBounds();
}


renderer.shadowMap.enabled = true
document.getElementById("three").
appendChild( renderer.domElement );

// lighting
const light = new THREE.AmbientLight( 0xcccccc );
scene.add( light );

const spotLight = new THREE.SpotLight(0xffffff, 60)
spotLight.angle = Math.PI
spotLight.penumbra = 0.2
spotLight.position.set(5, 3, 5)
spotLight.castShadow = true
spotLight.shadow.camera.near = 1
spotLight.shadow.camera.far = 30
spotLight.shadow.mapSize.width = 1024
spotLight.shadow.mapSize.height = 1024
scene.add(spotLight)

const dirLight = new THREE.DirectionalLight(0x55505a, 3)
dirLight.position.set(0, 5 , 0)
dirLight.castShadow = true;
dirLight.shadow.camera.right = 1
dirLight.shadow.camera.right = -10
dirLight.shadow.camera.top = 1
dirLight.shadow.camera.bottom = -10
dirLight.shadow.mapSize.width = 2024
dirLight.shadow.mapSize.height = 1024
scene.add(dirLight)

scene.background = new THREE.Color("rgb(245, 245, 220)")
camera.position.set(9, 2, 19)
//camera.lookAt(5, 2, 17.5)

// loading models
let loadingIndicator = document.querySelector('.ld-ripple-container') 
let loadingProgress = document.querySelector('.progress')
const manager = new THREE.LoadingManager();
manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
    console.log('Started loading file: ' + url + '\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    loadingProgress.innerText = "0%"
};

manager.onLoad = function ( ) {
    console.log('All resources are loaded');
    loadingIndicator.style.display = "none"
};

manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
    console.log('Loading file: ' + url + ' (' + itemsLoaded + '/' + itemsTotal + ')');
    console.log( Math.floor((itemsLoaded/itemsTotal) * 100) + "%")
    loadingProgress.innerText = Math.floor((itemsLoaded/itemsTotal) * 100) + "%"
};

manager.onError = function ( url ) {

    console.log( 'There was an error loading ' + url );
};

const loader = new GLTFLoader(manager)
// set the ground
const planeGeo = new THREE.PlaneGeometry(100,100)
const planetex = new THREE.TextureLoader().load('/main_scene/textures/floor.jpg')
planetex.wrapS = THREE.RepeatWrapping
planetex.wrapT = THREE.RepeatWrapping
planetex.repeat.set(20,50)
const planeMat = new THREE.MeshPhongMaterial({map: planetex})
planetex.encoding = THREE.sRGBEncoding
const mesh = new THREE.Mesh(planeGeo, planeMat)
mesh.rotation.x = - Math.PI / 2
mesh.rotation.z = 2
mesh.receiveShadow = true
mesh.position.set(0, 0.05, 0)
scene.add(mesh)
const controls = new OrbitControls( camera, renderer.domElement );
 controls.enableDaming = true
 controls.screenPanning = true
 //controls.enabled = false;

// controls.minDistance = 9
// controls.maxDistance = 14

// limit vertical rotation
controls.minPolarAngle = Math.PI / 4
controls.maxPolarAngle = Math.PI / 2
controls.rotateSpeed = 0.4

//add animatiobns
const info = document.querySelector('.info')
const specs = document.querySelector('.specs')
controls.addEventListener("start",()=>{
    gsap.to(info,{duration:0.5, x:-100, opacity:0})
    gsap.to(colors,{duration: 0.7, opacity:0})
    gsap.to(specs,{duration:0.6, y:100, opacity:0})
})

controls.addEventListener("end",()=>{
    gsap.to(info,{duration:0.5, x:0, opacity:1})
    gsap.to(colors,{duration: 0.7, opacity:1})
    gsap.to(specs,{duration:0.6, y:0, opacity:1})
})
// garage
loader.load("/main_scene/scene.gltf", (gltf)=>{
    const model = gltf.scene
    model.position.set(0,0,0);
    model.rotation.set(0 , 2 ,0)
    model.scale.set(5, 2.5, 2)
    model.receiveShadow = true
    const boundingBox = new THREE.Box3().setFromObject(model);

    scene.add(model)
});


loader.load('../walnut_wood_sofa_sf.001/scene.gltf',(gltf)=>{
        const model = gltf.scene;
    
        model.position.set(2, -0.46, 10.5)
        model.rotation.set(0, 13, 0)
        model.scale.set(0.05, 0.05, 0.05);    
        model.castShadow = true
        controls.target.copy(model.position)
    
    
    // Add the tree to the scene
    scene.add(model);

});

function animate() {
    const delta = clock.getDelta();
    updateCameraPosition(delta);
	requestAnimationFrame( animate );
    controls.update()
	renderer.render( scene, camera );
}

window.onresize = function(){
    camera.aspect = window.innerWidth/ window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(widow.innerWidth, window.innerheight)
}


animate();

