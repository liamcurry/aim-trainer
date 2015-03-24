import THREE from 'three'
import EventEmitter from 'eventemitter3'

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

export default class Target extends EventEmitter {
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
