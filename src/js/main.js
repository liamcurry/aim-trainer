import Game from './Game'
import PlayerStats from './PlayerStats'

function makeAudio(src) {
	let audio = document.createElement('audio')
	let source = document.createElement('source')
	source.src = src
	audio.appendChild(source)
	return audio
}

// hitsounds
//let hsHeadshot = makeAudio('headshot.mp3')
let hsBodyshot = makeAudio('hit.mp3')
let hsTeammate = makeAudio('hitteammate.mp3')

window.onload = function () {
	let game = new Game({
		el: '#game'
	})
	let stats = new PlayerStats({
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
