var m = require('mithril')
var timer = require('./timer')
var settings = require('./settings')

function viewModel() {
	return {
		settings: settings.model(),
		timer: timer.viewModel(),
		showSettings: m.prop(false)
	}
}

function controller(vm) {
	vm = vm || viewModel()
	var toggleSettings = function() {
		vm.showSettings(!vm.showSettings())
	}
	return {
		vm: vm,
		toggleSettings: toggleSettings,
		settings: settings.controller(vm.settings),
		timer: timer.controller(vm.timer)
	}
}

function view(ctrl) {
	ctrl = ctrl || controller()
	return m('.pomodori', [
		m('label', [
			m('input[type="checkbox"]', {
				onchange: ctrl.toggleSettings
			}),
			(ctrl.vm.showSettings() ? 'Hide' : 'Show') + 'settings'
		]),
		m('div', {
			style: {
				display: ctrl.vm.showSettings() ? 'block' : 'none'
			}
		}, [
				settings.view(ctrl.settings)
			]),
		timer.view(ctrl.timer),
		m('button', {
			onclick: ctrl.timer.toggle
		}, ctrl.timer.vm.ticker() ? 'Stop' : 'Start')
	])
}

module.exports = {
	viewModel: viewModel,
	controller: controller,
	view: view
}
