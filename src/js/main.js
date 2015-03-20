import THREE from 'three'
import Stats from 'stats-js'

const numTargets = 1

let stats
let camera, camControls, scene, renderer, clock
let particleMaterial
let raycaster
let mouse
let objects = []
let geometry = new THREE.BoxGeometry(100, 100, 100)
let lastHitTime = Date.now()

// stats
let hitTimes = []
let numHits = 0
let numMisses = 0

function createTarget() {
	let material = new THREE.MeshBasicMaterial({
		color: Math.random() * 0xffffff,
		opacity: 0.5,
		transparent: true
	})

	let object = new THREE.Mesh(geometry, material)

	object.position.x = Math.random() * 800 - 400
	object.position.y = Math.random() * 800 - 400
	object.position.z = Math.random() * 800 - 400

	object.scale.x = Math.random() * 2 + 1
	object.scale.y = Math.random() * 2 + 1
	object.scale.z = Math.random() * 2 + 1

	object.rotation.x = Math.random() * 2 * Math.PI
	object.rotation.y = Math.random() * 2 * Math.PI
	object.rotation.z = Math.random() * 2 * Math.PI

	return object
}

function spawnTarget() {
	let object = createTarget()
	scene.add(object)
	objects.push(object)
	return object
}

function init() {

	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000)
	camera.position.set(0, 300, 500)

	/*clock = new THREE.Clock()
	camControls = new THREE.FirstPersonControls(camera)
	camControls.lookSpeed = 0.4
	camControls.movementSpeed = 20
	camControls.noFly = true
	camControls.lookVertical = true
	camControls.constrainVertical = true
	camControls.verticalMin = 1.0
	camControls.verticalMax = 2.0
	camControls.lon = -150
	camControls.lat = 120*/

	scene = new THREE.Scene()

	for (let i=0, l=numTargets; i < l; i++) {
		spawnTarget()
	}

	/*let PI2 = Math.PI * 2
	particleMaterial = new THREE.SpriteCanvasMaterial( {
		color: 0x000000,
		program: function ( context ) {
			context.beginPath()
			context.arc( 0, 0, 0.5, 0, PI2, true )
			context.fill()
		}
		} )*/

	raycaster = new THREE.Raycaster()
	mouse = new THREE.Vector2()

	let container = document.createElement('div')
	document.body.appendChild(container)

	renderer = new THREE.WebGLRenderer()
	renderer.setClearColor(0xf0f0f0)
	renderer.setPixelRatio(window.devicePixelRatio)
	renderer.setSize(window.innerWidth, window.innerHeight)
	container.appendChild(renderer.domElement)

	stats = new Stats()
	stats.domElement.style.position = 'absolute'
	stats.domElement.style.top = '0px'
	container.appendChild(stats.domElement)

	document.addEventListener('mousedown', onDocumentMouseDown, false)
	document.addEventListener('touchstart', onDocumentTouchStart, false)
	window.addEventListener('resize', onWindowResize, false)
	animate()
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
}

function onDocumentTouchStart(e) {
	e.preventDefault()
	e.clientX = e.touches[0].clientX
	e.clientY = e.touches[0].clientY
	onDocumentMouseDown(e)
}

function onDocumentMouseDown(e) {
	e.preventDefault()
	mouse.x = (e.clientX / renderer.domElement.width) * 2 - 1
	mouse.y = -(e.clientY / renderer.domElement.height) * 2 + 1

	raycaster.setFromCamera(mouse, camera)

	let intersects = raycaster.intersectObjects(objects)
	if (intersects.length > 0) {
		let object = intersects[0].object
		onHit(object)
		numHits++
	} else {
		numMisses++
	}
}

function onHit(object) {
	object.material.color.setHex(Math.random() * 0xffffff)
	let now = Date.now()
	let elapsed = now - lastHitTime

	console.log(elapsed)
	lastHitTime = now
	hitTimes.push(elapsed)
	let total = hitTimes.reduce((a, b) => a + b)
	console.log(total, total / hitTimes.length)
	/*let particle = new THREE.Sprite(particleMaterial)
	particle.position.copy(object.point)
	particle.scale.x = particle.scale.y = 16
	scene.add(particle)*/
	scene.remove(object)
	for (let i=objects.length; i--;) {
		if (objects[i].id === object.id) {
			objects.splice(i, 1)
		}
	}
	spawnTarget()
}

function animate() {
	requestAnimationFrame(animate)
	render()
}

let radius = 600
let theta = 0

function render() {
	//let delta = clock.getDelta()
	//camControls.update(delta)
	stats.update()
	theta += 0.1
	camera.position.x = radius * Math.sin(THREE.Math.degToRad(theta))
	camera.position.y = radius * Math.sin(THREE.Math.degToRad(theta))
	camera.position.z = radius * Math.cos(THREE.Math.degToRad(theta))
	camera.lookAt(scene.position)
	renderer.render(scene, camera)
}

window.onload = init
