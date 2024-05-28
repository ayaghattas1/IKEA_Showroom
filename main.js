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
const camera = new THREE.PerspectiveCamera( 50, width / height , 0.1, 1000 );
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
const colors = document.querySelectorAll('.color')
const selectColor = (color)=>{
    switch(color){
        case "white":
        return {r:1,g:1,b:1}
        break
        case "red":
        return {r:1,g:0,b:0}
        break
        case "blue":
        return {r: 0, g: 0, b: .9}
        break
        case "orange":
        return {r: 1, g: 0.3, b: 0}
        break
        case "black":
        return {r:0,g:0,b:0}
        break
    }
}
colors.forEach(el=>{
    console.log(el)
    el.addEventListener('click',(e)=>{
        color = e.target.id
        color = selectColor(color)
         carModel.traverse((node)=>{
        if(node.isMesh){
            console.log(node.name)
            let name = node.name.split('_')
            if(name[1] === "CarpaintMain-material"){
                gsap.to(node.material.color,{duration:2, r:color.r,g:color.g,b:color.b, ease:"sine.out"})
                // node.material.color.set(color)
            }
        }
    })
    })
})
// lighting
function addSpotLight(scene, color, intensity, angle, penumbra, position, shadowMapWidth, shadowMapHeight) {
    const spotLight = new THREE.SpotLight(color, intensity);
    spotLight.angle = angle;
    spotLight.penumbra = penumbra;
    spotLight.position.set(...position);
    spotLight.castShadow = true;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 30;
    spotLight.shadow.mapSize.width = shadowMapWidth;
    spotLight.shadow.mapSize.height = shadowMapHeight;
    scene.add(spotLight);
}

// Éclairage ambiant
const ambientLight = new THREE.AmbientLight(0xcccccc);
scene.add(ambientLight);

// Ajout des SpotLights
addSpotLight(scene, 0xffffff, 60, Math.PI, 0.2, [5, 3, 5], 1024, 1024);
addSpotLight(scene, 0xffffff, 60, Math.PI, 0.2, [-20, 3, -6.5], 2524, 1024);
addSpotLight(scene, 0xffffff, 60, Math.PI, 0.2, [11, 3, -22], 2524, 1024);
addSpotLight(scene, 0xffffff, 60, Math.PI, 0.2, [-6, 3, -12], 2524, 1024);

const dirLight = new THREE.DirectionalLight(0x55505a, 3)
dirLight.position.set(0, 5 , 0)
dirLight.castShadow = true;
dirLight.shadow.camera.right = 1
dirLight.shadow.camera.right = -10
dirLight.shadow.camera.top = 1
dirLight.shadow.camera.bottom = -10
dirLight.shadow.mapSize.width = 1024
dirLight.shadow.mapSize.height = 1024
scene.add(dirLight)

scene.background = new THREE.Color("rgb(245, 245, 220)")
camera.position.set(7, 3, 17)
// camera.lookAt(2,0.13,10)
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

// limit vertical rotation
controls.minPolarAngle = Math.PI / 4
controls.maxPolarAngle = Math.PI / 2
controls.rotateSpeed = 0.4

//add animations
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

// load the car model
loader.load('/2017_kia_sportage/scene.gltf',(gltf)=>{
    const model = gltf.scene
   carModel = model
   model.position.set(4.5, 1.39, 4)
    model.rotation.set(0, 0.1, 0)
    model.scale.set(0.025,0.025,0.025)
    model.castShadow = true
    controls.target.copy(model.position)

    scene.add(model)
    // Add event listener to the renderer element
    renderer.domElement.addEventListener('click', handleClick);

    function handleClick(event) {
        // Get mouse coordinates relative to the renderer element
        const mouse = {
            x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
            y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
        };

        // Set up raycaster
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        // Check for intersections
        const intersects = raycaster.intersectObjects([model], true);

        // If model is clicked, navigate to another HTML page
        if (intersects.length > 0) {
            window.open('/pages/car.html', '_blank'); // Open in a new tab
        }
    }
})

// load the man model
loader.load('/man_win/scene.gltf',(gltf)=>{
    const model = gltf.scene
   carModel = model
    model.position.set(8, 0.13, 2)
    model.rotation.set(0, -0.06, 0)
    model.scale.set(0.18, 0.18, 0.18)
    model.castShadow = true
    controls.target.copy(model.position)

    scene.add(model)
})
loader.load('/cadeau/scene.gltf',(gltf)=>{
    const model = gltf.scene
    model.position.set(-2, 0.13, 5)
    model.rotation.set(0, 1, 0)
    model.scale.set(0.7, 0.7, 0.7)
    model.castShadow = true
    controls.target.copy(model.position)

    scene.add(model)
})
loader.load('/people/scene.gltf',(gltf)=>{
    const model = gltf.scene
    model.position.set(-35, 0.13, 16)
    model.rotation.set(0, 1.7, 0)
    model.scale.set(0.03, 0.03, 0.03)
    model.castShadow = true
    controls.target.copy(model.position)

    scene.add(model)
})

loader.load('/woman/scene.gltf', (gltf) => {
    const model = gltf.scene;
    
    //Position, rotate, and scale the tree
    model.position.set(-35, 0.13, 14)
    model.rotation.set(0, 5 , 0)
    model.scale.set(0.8, 0.8, 0.8);
    model.castShadow = true
    controls.target.copy(model.position)// Example scale

    // Add the tree to the scene
    scene.add(model);
});

loader.load('/indian_man_in_suit/scene.gltf',(gltf)=>{
    const model = gltf.scene
   model.position.set(-40, 0.08, 15)
   model.rotation.set(0, 0, 0)
   model.scale.set(0.8, 0.8, 0.8);
    model.castShadow = true
    controls.target.copy(model.position)

    scene.add(model)
});

loader.load('/people1/scene.gltf',(gltf)=>{
    const model = gltf.scene
    model.position.set(-9, 0.13, -2.5)
    model.rotation.set(0, 3.5, 0)
    model.scale.set(0.8, 0.8, 0.8)
    model.castShadow = true
    controls.target.copy(model.position)

    scene.add(model)
})

loader.load('/people1/scene.gltf',(gltf)=>{
    const model = gltf.scene
    model.position.set(-5, 0.13, 20)
    model.rotation.set(0, 3.5, 0)
    model.scale.set(0.8, 0.8, 0.8)
    model.castShadow = true
    controls.target.copy(model.position)

    scene.add(model)
})


// SOFA'S
loader.load('/low_poly_living_room_with_furniture/scene.gltf', (gltf) => {
    const model = gltf.scene;
    
    //Position, rotate, and scale the tree
    model.position.set(10, 0.5, -20)
    model.rotation.set(0, 0.4 , 0)
    model.scale.set(1.75, 1.75, 1.75);
    model.castShadow = true
    controls.target.copy(model.position)// Example scale

    // Add the tree to the scene
    scene.add(model);
});
loader.load('/woman3/scene.gltf', (gltf) => {
    const model = gltf.scene;
    
    //Position, rotate, and scale the tree
    model.position.set(3, 0.08, -17)
    model.rotation.set(0, 0.35, 0)
    model.scale.set(0.02, 0.02, 0.02);
    model.castShadow = true
    controls.target.copy(model.position)// Example scale

    // Add the tree to the scene
    scene.add(model);
});

// addSpotLight(scene, 0xffffff, 60, Math.PI, 0.2, [-20, -0.13, -40], 2524, 1024);
loader.load('/woman3/scene.gltf', (gltf) => {
    const model = gltf.scene;
    
    //Position, rotate, and scale the tree
    model.position.set(-30, 0.08, -2)
    model.rotation.set(0, 0.35, 0)
    model.scale.set(0.02, 0.02, 0.02);
    model.castShadow = true
    controls.target.copy(model.position)// Example scale

    // Add the tree to the scene
    scene.add(model);
});

loader.load('/set_sofa_v.001/scene.gltf', (gltf) => {
    const model = gltf.scene;
    
    // Position, rotate, and scale the tree
    //model.position.set(0, -0.13, 10) centre 
    model.position.set(-20, 0.08, -6)
    model.rotation.set(0, 0.4, 0)
    model.scale.set(0.05, 0.05, 0.05);  
    
    // Add the tree to the scene
    scene.add(model);

     // Add event listener to the renderer element
     renderer.domElement.addEventListener('click', handleClick);

     function handleClick(event) {
         // Get mouse coordinates relative to the renderer element
         const mouse = {
             x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
             y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
         };
 
         // Set up raycaster
         const raycaster = new THREE.Raycaster();
         raycaster.setFromCamera(mouse, camera);
 
         // Check for intersections
         const intersects = raycaster.intersectObjects([model], true);
 
         // If model is clicked, navigate to another HTML page
         if (intersects.length > 0) {
            // window.location.href = ('/pages/bed.html',' _blank'); 
             window.open('/pages/set_sofa_v.html', '_blank'); // Open in a new tab

         }
     }
});
loader.load('/woman2/scene.gltf', (gltf) => {
    const model = gltf.scene;
    
    //Position, rotate, and scale the tree
    model.position.set(-12, 0.08, -6)
    model.rotation.set(0, 0.35, 0)
    model.scale.set(2, 2, 2);
    model.castShadow = true
    controls.target.copy(model.position)// Example scale

    // Add the tree to the scene
    scene.add(model);
});

loader.load('/walnut_wood_sofa_sf.001/scene.gltf', (gltf) => {
    const model = gltf.scene;
    
    // Position, rotate, and scale the tree
    //model.position.set(0, -0.13, 10) centre 
    model.position.set(-10, -0.46, -6.5)
    model.rotation.set(0, 0.4, 0)
    model.scale.set(0.05, 0.05, 0.05);  
    
    // Add the tree to the scene
    scene.add(model);

     // Add event listener to the renderer element
     renderer.domElement.addEventListener('click', handleClick);

     function handleClick(event) {
         // Get mouse coordinates relative to the renderer element
         const mouse = {
             x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
             y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
         };
 
         // Set up raycaster
         const raycaster = new THREE.Raycaster();
         raycaster.setFromCamera(mouse, camera);
 
         // Check for intersections
         const intersects = raycaster.intersectObjects([model], true);
 
         // If model is clicked, navigate to another HTML page
         if (intersects.length > 0) {
            // window.location.href = ('/pages/bed.html',' _blank'); 
             window.open('/pages/walnut_wood_sofa_sf.html', '_blank'); // Open in a new tab

         }
     }
});

loader.load('/sofa_set_01/scene.gltf', (gltf) => {
    const model = gltf.scene;
    
    //Position, rotate, and scale the tree
    model.position.set(-34.1, 0.3, -3)
    model.rotation.set(0, 0.5 , 0)
    model.scale.set(1, 1, 1);
    model.castShadow = true
    controls.target.copy(model.position)// Example scale

    // Add the tree to the scene
    scene.add(model);
});
addSpotLight(scene, 0xffffff, 60, Math.PI, 0.2, [-40, -0.46, 2.15], 2524, 1024);
addSpotLight(scene, 0xffffff, 60, Math.PI, 0.2, [-37, -0.46, 2.15], 2524, 1024);

// DESK
loader.load('/set_directors_desk_v.002/scene.gltf', (gltf) => {
    const model = gltf.scene;
    
    // Position, rotate, and scale the tree
    //model.position.set(0, -0.13, 10) centre 
    model.position.set(0, -0.13, -53)
    model.rotation.set(0, -1.3, 0)
    model.scale.set(0.05, 0.05, 0.05);  
    
    // Add the tree to the scene
    scene.add(model);

     // Add event listener to the renderer element
     renderer.domElement.addEventListener('click', handleClick);

     function handleClick(event) {
         // Get mouse coordinates relative to the renderer element
         const mouse = {
             x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
             y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
         };
 
         // Set up raycaster
         const raycaster = new THREE.Raycaster();
         raycaster.setFromCamera(mouse, camera);
 
         // Check for intersections
         const intersects = raycaster.intersectObjects([model], true);
 
         // If model is clicked, navigate to another HTML page
         if (intersects.length > 0) {
            // window.location.href = ('/pages/bed.html',' _blank'); 
             window.open('/pages/set_directors_desk_v.html', '_blank'); // Open in a new tab

         }
     }
});
//addSpotLight(scene, 0xffffff, 60, Math.PI, 0.2, [-27, -0.13, -55], 2524, 1024);

//KITCHENS
loader.load('/simple_house_-_kitchen/scene.gltf', (gltf) => {
    const model = gltf.scene;
    
    model.position.set(20, 0.7, 6)
    model.rotation.set(0, -1.2, 0)
    model.scale.set(1.5, 1.5, 1.5);   
    
    // Add the tree to the scene
    scene.add(model);

     // Add event listener to the renderer element
     renderer.domElement.addEventListener('click', handleClick);

     function handleClick(event) {
         // Get mouse coordinates relative to the renderer element
         const mouse = {
             x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
             y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
         };
 
         // Set up raycaster
         const raycaster = new THREE.Raycaster();
         raycaster.setFromCamera(mouse, camera);
 
         // Check for intersections
         const intersects = raycaster.intersectObjects([model], true);
 
         // If model is clicked, navigate to another HTML page
         if (intersects.length > 0) {
            // window.location.href = ('/pages/bed.html',' _blank'); 
             window.open('/pages/simple_house_-_kitchen.html', '_blank'); // Open in a new tab

         }
     }
});

loader.load('/woman2/scene.gltf', (gltf) => {
    const model = gltf.scene;
    
    //Position, rotate, and scale the tree
    model.position.set(10, 0.13, 18)
    model.rotation.set(0, 3 , 0)
    model.scale.set(2, 2, 2);
    model.castShadow = true
    controls.target.copy(model.position)// Example scale

    // Add the tree to the scene
    scene.add(model);
});

loader.load('/kitchen/scene.gltf', (gltf) => {
    const model = gltf.scene;
    
    //Position, rotate, and scale the tree
    model.position.set(5, 0.13, 10)
    model.rotation.set(0, -1.2, 0)
    model.scale.set(0.05, 0.05, 0.05);
    model.castShadow = true
    controls.target.copy(model.position)// Example scale

    // Add the tree to the scene
    scene.add(model);

     // Add event listener to the renderer element
     renderer.domElement.addEventListener('click', handleClick);

     function handleClick(event) {
         // Get mouse coordinates relative to the renderer element
         const mouse = {
             x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
             y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
         };
 
         // Set up raycaster
         const raycaster = new THREE.Raycaster();
         raycaster.setFromCamera(mouse, camera);
 
         // Check for intersections
         const intersects = raycaster.intersectObjects([model], true);
 
         // If model is clicked, navigate to another HTML page
         if (intersects.length > 0) {
             window.open('/pages/kitchen1.html', '_blank'); // Open in a new tab

         }
     }
});
addSpotLight(scene, 0xffffff, 60, Math.PI, 0.2, [11, 0.13, 26], 2524, 1024);


loader.load('/kitchenn/scene.gltf', (gltf) => {
    const model = gltf.scene;
    
    //Position, rotate, and scale the tree
    model.position.set(-3, 0.08, 30)
    model.rotation.set(0, 3.6, 0)
    model.scale.set(0.002, 0.002, 0.002);  
    model.castShadow = true
    controls.target.copy(model.position)// Example scale

    // Add the tree to the scene
    scene.add(model);

     // Add event listener to the renderer element
     renderer.domElement.addEventListener('click', handleClick);

     function handleClick(event) {
         // Get mouse coordinates relative to the renderer element
         const mouse = {
             x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
             y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
         };
 
         // Set up raycaster
         const raycaster = new THREE.Raycaster();
         raycaster.setFromCamera(mouse, camera);
 
         // Check for intersections
         const intersects = raycaster.intersectObjects([model], true);
 
         // If model is clicked, navigate to another HTML page
         if (intersects.length > 0) {
             window.open('/pages/kitchenn.html', '_blank'); 

         }
     }
});
addSpotLight(scene, 0xffffff, 60, Math.PI, 0.2, [-3, 0.08, 30], 2524, 1024);


loader.load('/modern_kitchen/scene.gltf', (gltf) => {
    const model = gltf.scene;
    
    //Position, rotate, and scale the tree
    model.position.set(47, 0.13, 13)
    model.rotation.set(0, 2 , 0)
    model.scale.set(1.2, 1.2, 1.2);
    model.castShadow = true
    controls.target.copy(model.position)// Example scale

    // Add the tree to the scene
    scene.add(model);
});
addSpotLight(scene, 0xffffff, 60, Math.PI, 0.2, [47, 0.13, 13], 2524, 1024);

//beds

loader.load('/bedroom1/scene.gltf', (gltf) => {
    const model = gltf.scene;
    
    //Position, rotate, and scale the tree
    model.position.set(55, 0.13, 9)
    model.rotation.set(0, 5.15 , 0)
    model.scale.set(1.3, 1.3, 1.3);
    model.castShadow = true
    controls.target.copy(model.position)// Example scale

    // Add the tree to the scene
    scene.add(model);
});
addSpotLight(scene, 0xffffff, 60, Math.PI, 0.2, [55, 0.13, 9], 2524, 1024);

loader.load('/bedroom/scene.gltf', (gltf) => {
    const model = gltf.scene;
    
    //Position, rotate, and scale the tree
    model.position.set(28, 0.13, 31)
    model.rotation.set(0, -2.8 , 0)
    model.scale.set(5, 5, 5);
    model.castShadow = true
    controls.target.copy(model.position)// Example scale

    // Add the tree to the scene
    scene.add(model);
});
addSpotLight(scene, 0xffffff, 60, Math.PI, 0.2, [28, 0.13, 30], 2524, 1024);

loader.load('/bedroom5/scene.gltf', (gltf) => {
    const model = gltf.scene;
    
    //Position, rotate, and scale the tree
    model.position.set(-15, 0.13, 49)
    model.rotation.set(0, 0.42 , 0)
    model.scale.set(1.4, 1.4, 1.4);
    model.castShadow = true
    controls.target.copy(model.position)// Example scale

    // Add the tree to the scene
    scene.add(model);
});

// loader.load('/bedroom2/scene.gltf', (gltf) => {
//     const model = gltf.scene;
    
//     //Position, rotate, and scale the tree
//     model.position.set(-9, 0.13, 49)
//     model.rotation.set(0, 0.42 , 0)
//     model.scale.set(0.05, 0.05, 0.05);
//     model.castShadow = true
//     controls.target.copy(model.position)// Example scale

//     // Add the tree to the scene
//     scene.add(model);
// });
// addSpotLight(scene, 0xffffff, 60, Math.PI, 0.2, [-15, 0.13, 30], 2524, 1024);


// Fonction générique pour charger et ajouter un modèle GLTF à la scène
function addModel(path, position, rotation, scale, controls) {
    loader.load(path, (gltf) => {
        const model = gltf.scene;

        // Position, rotation et échelle du modèle
        model.position.set(position.x, position.y, position.z);
        model.rotation.set(rotation.x, rotation.y, rotation.z);
        model.scale.set(scale.x, scale.y, scale.z);
        model.castShadow = true;

        // Mise à jour de la cible des contrôles
        controls.target.copy(model.position);

        // Ajouter le modèle à la scène
        scene.add(model);
    });
}

// Fonction pour ajouter des fenêtres
function addGlassWindow(position, rotation, scale, controls) {
    addModel('/glass_window/scene.gltf', position, rotation, scale, controls);
}

// Fonction pour ajouter des tapis
function addCarpet(position, rotation, scale, controls) {
    addModel('/carpet__-_medieval_fantasy_challenge/scene.gltf', position, rotation, scale, controls);
}

// Utiliser les fonctions pour ajouter des fenêtres et des tapis
addGlassWindow({ x: 35, y: -0.5, z: -2 }, { x: 0, y: -1.2, z: 0 }, { x: 5, y: 5, z: 5 }, controls);
addGlassWindow({ x: 8, y: -0.5, z: 8.5 }, { x: 0, y: -1.2, z: 0 }, { x: 5, y: 5, z: 5 }, controls);
addGlassWindow({ x: -19, y: -0.5, z: 19.1 }, { x: 0, y: -1.2, z: 0 }, { x: 5, y: 5, z: 5 }, controls);

addGlassWindow({ x: 9.5, y: -0.5, z: -53 }, { x: 0, y: -1.2, z: 0 }, { x: 5, y: 5, z: 5 }, controls);
addGlassWindow({ x: -16.9, y: -0.5, z: -43.1 }, { x: 0, y: -1.2, z: 0 }, { x: 5, y: 5, z: 5 }, controls);
addGlassWindow({ x: -44, y: -0.5, z: -32.7 }, { x: 0, y: -1.2, z: 0 }, { x: 5, y: 5, z: 5 }, controls);

addCarpet({ x: -50, y: 0.05, z: -55 }, { x: 0, y: -1.2, z: 0 }, { x: 1, y: 1, z: 1 }, controls);
addCarpet({ x: -33.6, y: 0.05, z: -61.35 }, { x: 0, y: -1.2, z: 0 }, { x: 1, y: 1, z: 1 }, controls);
addCarpet({ x: -15, y: 0.05, z: -68.6 }, { x: 0, y: -1.2, z: 0 }, { x: 1, y: 1, z: 1 }, controls);
addCarpet({ x: 3.65, y: 0.05, z: -75.9 }, { x: 0, y: -1.2, z: 0 }, { x: 1, y: 1, z: 1 }, controls);

addCarpet({ x: -57, y: 0.05, z: -75 }, { x: 0, y: -1.2, z: 0 }, { x: 1, y: 1, z: 1 }, controls);
addCarpet({ x: -38.5, y: 0.05, z: -82.2 }, { x: 0, y: -1.2, z: 0 }, { x: 1, y: 1, z: 1 }, controls);
addCarpet({ x: -19.9, y: 0.05, z: -89.5 }, { x: 0, y: -1.2, z: 0 }, { x: 1, y: 1, z: 1 }, controls);
addCarpet({ x: -1.55, y: 0.05, z: -96.68 }, { x: 0, y: -1.2, z: 0 }, { x: 1, y: 1, z: 1 }, controls);


function animate() {
    const delta = clock.getDelta();
    updateCameraPosition(delta);
    //moveCameraWithKeys();
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
