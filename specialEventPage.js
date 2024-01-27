class SpecialEventPage {
	start() {
        console.log(`start special`)
        if (this.div) {
            throw Error(`reentrant call!`)
        }
        this.div = document.createElement('div')
        this.div.className = 'special'
        this.div.innerHTML = `
<img class="fullscreen-img" src="images/colloquium_gray.png?d=20231213x"/>
        `
        document.body.appendChild(this.div)
        $(this.div).fadeIn();
	}

	stop(callback) {
        console.log(`stop special`)
        const div = this.div
        this.div = null
        $(div).fadeOut(500, () => {
            console.log(`remove special`)
            div.remove()
            callback()
        });
	}

	priority() {
        return 1 // testing
        // Inserire qui da quando a quando bisogna mostrare lo special (vedi il <div class="special"></div> sotto)
        const showSpecialStart = moment.tz("2024-01-24 06:00", "Europe/Rome").unix()
        const showSpecialEnd   = moment.tz("2024-01-24 20:00", "Europe/Rome").unix()
		return moment().unix() >= showSpecialStart && moment().unix() <= showSpecialEnd ? 1 : 0
	}
};
