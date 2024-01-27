class FractalXmasPage {
	start() {
		$('.xmas').fadeIn(effectDuration);
		const canvas = document.getElementById('xmas_canvas');
		this.xmas = new Xmas(canvas, {
			nFlakes: 25,
			fillColor: '#003c71',
			speed: 3.0,
		});
	}

	stop(callback) {
		$('.xmas').fadeOut(effectDuration);
		setTimeout(() => {
			this.xmas.stop();
			callback();
		}, effectDuration);
	}

	isActive() {
        return true
		// è attivo dall'8 dicembre al 6 gennaio
		const date = moment().tz("Europe/Rome").format('MM-DD')
		return date >= '12-08' || date <= '01-06'
	}
};

