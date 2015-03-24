import Stats from 'stats-js'
import m from 'mithril'


export default class PlayerStats {
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
