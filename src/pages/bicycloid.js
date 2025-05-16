export class BicycloidPage {
	start() {
        if (this.div) throw Error('reentrant call')
        this.div = document.createElement('div')
        this.div.className = 'bicyloid'
        this.div.innerHTML = `
            <canvas id="bicycloid_canvas" width=1920 height=900>
        `
        document.body.appendChild(this.div)
		$('.bicycloid').fadeIn(500)
		const canvas = document.getElementById('bicycloid_canvas');
		this.world = new World(canvas, {
			nObjects: 5,
		});
	}

	stop(callback) {
        const div = this.div
        const world = this.world
		$('.bicycloid').fadeOut(500, () => {
            world.stop()
            div.remove()            
            callback()
        });
        this.div = null
        this.bicycloid = null
	}

    duration() {
        return 20000
    }

	priority() {
		const date = moment().tz("Europe/Rome")
        const day = date.format('YYYY-MM-DD')
		if (day >= '2025-05-15' && day <= '2025-07-01') {
            const minute = date.format('mm')
            if (minute === '42' || minute === '09') return 30
        }
        return 0
	}
};

