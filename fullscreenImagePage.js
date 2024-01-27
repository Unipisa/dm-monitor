class FullScreenImagePage {
    constructor({imageUrl,start,end}) {
        this.imageUrl = imageUrl
        this.start = start
        this.end = end
        console.log(`constructor ${this.start}`)
    }

	start() {
        console.log(`start special`)
        if (this.div) {
            throw Error(`reentrant call!`)
        }
        this.div = document.createElement('div')
        this.div.className = 'special'
        this.div.innerHTML = `<img class="fullscreen-img" src="${imageUrl}"/>`
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

    duration() {
        return 20000
    }

	priority() {
        const showSpecialStart = moment.tz(this.start, "Europe/Rome").unix()
        const showSpecialEnd   = moment.tz(this.end, "Europe/Rome").unix()
		if (moment().unix() >= showSpecialStart && moment().unix() <= showSpecialEnd) {
            return 2
        }
        return 0
	}
};
