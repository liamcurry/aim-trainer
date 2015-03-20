var m = require('mithril')

function viewModel() {
	var msTotal = m.prop(25 * 60 * 1000)
	var msLeft = m.prop(msTotal())
	var ticker = m.prop()

	function toString() {
		var ms = msLeft()
		var min = Math.floor(ms / 60000)
		var sec = Math.floor(ms % 60000 / 1000)
		return min + ':' + sec
	}

	return {
		msTotal: msTotal,
		msLeft: msLeft,
		ticker: ticker,
		toString: toString
	}
}

function controller(vm) {
	vm = vm || viewModel()
	var updateTime
	function update() {
		var msElapsed = Date.now() - updateTime
		m.startComputation()
		vm.msLeft(Math.max(vm.msLeft() - msElapsed, 0))
		m.endComputation()
		updateTime = Date.now()
	}

	var ticker = m.prop()
	function start() {
		vm.ticker(setInterval(update, 1000))
		updateTime = Date.now()
	}
	function stop() {
		vm.ticker(clearInterval(vm.ticker()))
	}
	function toggle() {
		return ticker() ? stop() : start()
	}

	return {
		vm: vm,
		start: start,
		stop: stop,
		toggle: toggle
	}
}

function view(ctrl) {
	ctrl = ctrl || controller()
	return m('.timer', [
		m('.timer-circle'),
		m('p', [
			m('.span', 'Time left'),
			m('.span', ctrl.vm.toString())
		])
	])
}

module.exports = {
	viewModel: viewModel,
	controller: controller,
	view: view
}
