import THREE from 'three'
import Stats from 'stats-js'
import EventEmitter from 'eventemitter3'
import m from 'mithril'

function makeAudio(src) {
	let audio = document.createElement('audio')
	let source = document.createElement('source')
	source.src = src
	audio.appendChild(source)
	return audio
}

// hitsounds
let hsHeadshot = makeAudio('headshot.mp3')
let hsBodyshot = makeAudio('hit.mp3')
let hsTeammate = makeAudio('hitteammate.mp3')

function randomizeObjScale(object) {
	object.scale.x = Math.random() * 2 + 1
	object.scale.y = Math.random() * 2 + 1
	object.scale.z = Math.random() * 2 + 1
}

function randomizeObjRotation(object) {
	object.rotation.x = Math.random() * 2 * Math.PI
	object.rotation.y = Math.random() * 2 * Math.PI
	object.rotation.z = Math.random() * 2 * Math.PI
}

function randomizeObjPosition(object) {
	object.position.x = Math.random() * 800 - 400
	object.position.y = Math.random() * 800 - 400
	object.position.z = Math.random() * 800 - 400
}

function randomizeObj(object) {
	randomizeObjScale(object)
	randomizeObjRotation(object)
	randomizeObjPosition(object)
}

class Target extends EventEmitter {
	constructor(config={}) {
		this.material = new THREE.MeshBasicMaterial({
			color: config.color || Math.random() * 0xffffff,
			opacity: config.opacity || 0.5,
			transparent: true
		})
		this.geometry = config.geometry || new THREE.BoxGeometry(100, 100, 100)
		this.object = new THREE.Mesh(this.geometry, this.material)
		randomizeObj(this.object)
	}
}

class Game extends EventEmitter {
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
		this.initTargets()
		this.initEvents()
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
		let thetaRads = THREE.Math.degToRad(this.theta)
		this.camera.position.x = this.radius * Math.sin(thetaRads)
		this.camera.position.y = this.radius * Math.sin(thetaRads)
		this.camera.position.z = this.radius * Math.cos(thetaRads)
		this.camera.lookAt(this.scene.position)
		this.renderer.render(this.scene, this.camera)
		this.theta += 0.1
	}
}

class GameStats {
	constructor(config) {
		if (!config.game) {
			throw new Error('"game" parameter required')
		}

		this.el = document.querySelector('#stats')

		this.game = config.game
		this.hitTimes = [0]
		this.numHit = 0
		this.numMiss = 0
		this.timeStarted = Date.now()
		this.timeLastHit = Date.now()

		this.init()
		this.animate()
	}
	init() {
		this.initFPS()
		this.initView()
	}
	initFPS() {
		let fps = this.fps = new Stats()
		fps.domElement.style.position = 'absolute'
		fps.domElement.style.top = '0px'
		this.game.el.appendChild(fps.domElement)
	}
	initView() {
		this.render()
	}
	render() {
		m.render(this.el, this.view())
	}
	view() {
		let avgResponseTime = Math.floor(this.avgResponseTime)
		let accuracy = this.accuracy || 1
		accuracy = Math.floor(accuracy * 100)
		return [
			m('.stat', [
				m('h3', 'Accuracy'),
				m('strong', `${accuracy}%`)
			]),
			m('.stat', [
				m('h3', 'Hits'),
				m('strong', this.numHit)
			]),
			m('.stat', [
				m('h3', 'Misses'),
				m('strong', this.numMiss)
			]),
			m('.stat', [
				m('h3', 'Avg. Response Time'),
				m('strong', `${avgResponseTime}ms`)
			])
		]
	}
	addHit() {
		let now = Date.now()
		let elapsed = now - this.timeLastHit
		this.timeLastHit = now
		this.hitTimes.push(elapsed)
		this.numHit++
	}
	addMiss() {
		this.numMiss++
	}
	animate() {
		requestAnimationFrame(this.animate.bind(this))
		this.fps.update()
	}
	get width() {
		return this.el.getBoundingClientRect().width
	}
	get height() {
		return this.el.getBoundingClientRect().height
	}
	get aspect() {
		return this.width() / this.height()
	}
	get totalTime() {
		console.log(this.hitTimes)
		return this.hitTimes.reduce((a, b) => a + b)
	}
	get avgResponseTime() {
		console.log(this.totalTime)
		return this.totalTime / this.hitTimes.length
	}
	get totalShots() {
		return this.numHit + this.numMiss
	}
	get accuracy() {
		return this.numHit / this.totalShots
	}
}

window.onload = function () {
	let game = new Game({
		el: '#game'
	})
	let stats = new GameStats({
		el: '#stats',
		game: game
	})
	game.on('hit', (object) => {
		hsBodyshot.play()
		stats.addHit()
		console.log('hit', object)
		console.log(`Average response time: ${stats.avgResponseTime}ms`)
		console.log(`Hits: ${stats.numHit}, Misses: ${stats.numMiss}`)
		console.log(`Accuracy: ${stats.accuracy * 100}%`)
	})
	game.on('miss', () => {
		hsTeammate.play()
		stats.addMiss()
		console.log('miss')
	})
	game.on('fire', () => {
		stats.render()
	})
	window.addEventListener('resize', game.setSize.bind(game), false)
}
