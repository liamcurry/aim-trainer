import THREE from 'three'
import EventEmitter from 'eventemitter3'
import Target from './Target'

export default class Game extends EventEmitter {
	constructor(config={}) {
		this.numTargets = config.numTargets || 1
		this.duration = config.duration || 30 * 1000
		this.geometry = config.geometry

		// DOM
		this.el = document.querySelector(config.el)
		if (!this.el) {
			throw new Error(`element with selector "${config.el}" not found`)
		}

		this.targets = []
		this.raycaster = new THREE.Raycaster()
		this.mouse = new THREE.Vector2()
		this.scene = new THREE.Scene()

		this.init()
		this.animate()
	}
	width() {
		return this.el.getBoundingClientRect().width
	}
	height() {
		return this.el.getBoundingClientRect().height
	}
	aspect() {
		return this.width() / this.height()
	}
	init() {
		this.initCamera()
		this.initRenderer()
		this.initScene()
		this.initTargets()
		this.initEvents()
	}
	initScene() {
		let geometry = new THREE.PlaneGeometry(500, 500, 32)
		let material = new THREE.MeshBasicMaterial({
			color: 0xffff00,
			side: THREE.DoubleSide
		})
		let plane = this.plane = new THREE.Mesh(geometry, material)
		this.scene.add(plane)
		console.log('plane', plane)
	}
	initCamera() {
		let camera = this.camera = new THREE.PerspectiveCamera(70, this.aspect(), 1, 10000)
		camera.position.set(0, 300, 500)
		this.radius = 600
		this.theta = 0
	}
	initRenderer() {
		let renderer = this.renderer = new THREE.WebGLRenderer()
		renderer.setClearColor(0xf0f0f0)
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.setSize(this.width(), this.height())
		this.el.appendChild(renderer.domElement)
	}
	initEvents() {
		this.el.addEventListener('mousedown', this.onMouseDown.bind(this), false)
		this.el.addEventListener('touchstart', this.onTouchStart.bind(this), false)
		this.on('hit', this.onHit.bind(this), false)
	}
	initTargets() {
		for (let i=this.numTargets; i--;) {
			this.spawnTarget()
		}
	}
	spawnTarget() {
		let target = new Target()
		let object = target.object
		this.scene.add(object)
		this.targets.push(target)
	}
	start() {
		this.startTime = Date.now()
		this.animate()
		this.emit('started', this)
	}
	setSize() {
		this.camera.aspect = this.aspect()
		this.camera.updateProjectionMatrix()
		this.renderer.setSize(this.width(), this.height())
	}
	onTouchStart(e) {
		e.preventDefault()
		e.clientX = e.touches[0].offsetX
		e.clientY = e.touches[0].offsetY
		this.onMouseDown(e)
	}
	onMouseDown(e) {
		e.preventDefault()

		// set the mouse position to the click location
		this.mouse.x = (e.offsetX / this.width()) * 2 - 1
		this.mouse.y = -(e.offsetY / this.height()) * 2 + 1

		// get everything in a straight line from the camera
		this.raycaster.setFromCamera(this.mouse, this.camera)

		// get all the objects that intersect
		let hits = this.raycaster.intersectObjects(this.objects)
		if (hits.length) {
			this.emit('hit', hits[0])
		} else {
			this.emit('miss')
		}
		this.emit('fire')
	}
	get objects() {
		return this.targets.map((t) => t.object)
	}
	onHit(hit) {
		let object = hit.object
		this.scene.remove(object)
		for (var i=this.targets.length; i--;) {
			if (this.targets[i].object == object) {
				this.targets.splice(i, 1)
				break
			}
		}
		this.spawnTarget()
	}
	animate() {
		requestAnimationFrame(this.animate.bind(this))
		this.update()
	}
	update() {
		this.updateCamera()
	}
	updateCamera() {
		/*let thetaRads = THREE.Math.degToRad(this.theta)
		this.camera.position.x = this.radius * Math.sin(thetaRads)
		this.camera.position.y = this.radius * Math.sin(thetaRads)
		this.camera.position.z = this.radius * Math.cos(thetaRads)*/
		this.camera.lookAt(this.plane.position)
		this.renderer.render(this.scene, this.camera)
		this.theta += 0.1
	}
}
