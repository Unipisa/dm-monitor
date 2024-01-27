class FractalXmasPage {
	start() {
        if (this.div) throw Error('reentrant call')
        this.div = document.createElement('div')
        this.div.className = 'xmas'
        this.div.innerHTML = `
            <canvas id="xmas_canvas" width=1920 height=900>
        `
        document.body.appendChild(this.div)
		$('.xmas').fadeIn(500)
		const canvas = document.getElementById('xmas_canvas');
		this.xmas = new Xmas(canvas, {
			nFlakes: 25,
			fillColor: '#003c71',
			speed: 3.0,
		});
	}

	stop(callback) {
        const div = this.div
        const xmas = this.xmas
		$('.xmas').fadeOut(500, () => {
            xmas.stop()
            div.remove()            
            callback()
        });
        this.div = null
        this.xmas = null
	}

    duration() {
        return 20000
    }

	priority() {
		// è attivo dall'8 dicembre al 6 gennaio
		const date = moment().tz("Europe/Rome").format('MM-DD')
		if (date >= '12-08' || date <= '01-06') return 10

        return 0
	}
};

