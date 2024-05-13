import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {gsap} from 'gsap'

let height, width, color, carModel;
width = window.innerWidth
height = window.innerHeight
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 30, width / height , 0.1, 1000 );

// Nouvelles limites de la scène
const sceneLimitXMin = -500; // Limite minimale sur l'axe X
const sceneLimitXMax = 500; // Limite maximale sur l'axe X
const sceneLimitZMin = -500; // Limite minimale sur l'axe Z
const sceneLimitZMax = 500; // Limite maximale sur l'axe Z



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


// Functions to move the camera
function moveCameraUp() {
    if (keys.ArrowUp || camera.position.z - 1 >= sceneLimitZMin) {
        camera.position.z -= 1;
    }
}

function moveCameraDown() {
    if (keys.ArrowDown || camera.position.z + 1 <= sceneLimitZMax) {
        camera.position.z += 1;
    }
}

function moveCameraLeft() {
    if (keys.ArrowLeft || camera.position.x - 1 >= sceneLimitXMin) {
        camera.position.x -= 1;
    }
}

function moveCameraRight() {
    if (keys.ArrowRight || camera.position.x + 1 <= sceneLimitXMax) {
        camera.position.x += 1;
    }
}
// Functions to move the camera based on keyboard input
function moveCameraWithKeys() {
    if (keys.ArrowUp) {
        moveCameraDown();
    }
    if (keys.ArrowDown) {
        moveCameraUp();
    }
    if (keys.ArrowLeft) {
        moveCameraLeft();

    }
    if (keys.ArrowRight) {
        moveCameraRight();

    }
}





const renderer = new THREE.WebGLRenderer();
renderer.setSize( width, height );
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
dirLight.shadow.mapSize.width = 1024
dirLight.shadow.mapSize.height = 1024
scene.add(dirLight)

scene.background = new THREE.Color("rgb(245, 245, 220)")
camera.position.set(0,-0.2, 0)
camera.lookAt(0,0,0)
// loading models
let loadingIndicator = document.querySelector('.ld-ripple-container') 
let loadingProgress = document.querySelector('.progress')
const manager = new THREE.LoadingManager();
manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
    loadingProgress.innerText = "0%"
};

manager.onLoad = function ( ) {
    loadingIndicator.style.display = "none"
};

manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
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
controls.minDistance = 9
controls.maxDistance = 14

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

    scene.add(model)
});



// load the car model
loader.load('../set_directors_desk_v.002/scene.gltf',(gltf)=>{
    const model = gltf.scene;
    let sofaColor = {r:1, g:1, b:1}; // Couleur de départ du canapé
    model.traverse((child) => {
        if (child.isMesh) {
            // Vérifiez si le matériau est basé sur MeshStandardMaterial
            if (child.material.isMeshStandardMaterial) {
                // Assurez-vous que le matériau ait une propriété de couleur
                if (child.material.color) {
                    // Appliquer la couleur initiale
                    child.material.color.set(sofaColor);
                }
            }
        }
    });

    colors.forEach(el => {
        el.addEventListener('click', (e) => {
            // Mettez à jour la couleur du canapé lorsque vous cliquez sur une couleur
            const colorName = e.target.id;
            sofaColor = selectColor(colorName);
            model.traverse((child) => {
                if (child.isMesh) {
                    // Vérifiez si le matériau est basé sur MeshStandardMaterial
                    if (child.material.isMeshStandardMaterial) {
                        // Assurez-vous que le matériau ait une propriété de couleur
                        if (child.material.color) {
                            // Appliquer la nouvelle couleur
                            gsap.to(child.material.color, { duration: 2, r: sofaColor.r, g: sofaColor.g, b: sofaColor.b, ease: "sine.out" });
                        }
                    }
                }
            });
        });
    });


    model.position.set(3, 0.13, 0)
    model.rotation.set(0, -0.60, 0)
    model.scale.set(0.05, 0.05, 0.05);    
    model.castShadow = true
    controls.target.copy(model.position)

    scene.add(model)
   
})





function animate() {
    moveCameraWithKeys();
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
