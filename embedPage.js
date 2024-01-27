class EmbedPage {
    constructor({url,priority,duration}) {
        this.durationProp = duration
        this.priorityProp = priority
        this.html = `<iframe src="${url}"></iframe>`
    }

	start() {
        if (this.div) throw Error(`reentrant call`)
        this.div = document.createElement('div')
        this.div.className = 'embed'
        this.div.innerHTML = this.html
        document.body.appendChild(this.div)
		$(this.div).fadeIn(500)
	}

	stop(callback) {
        const div = this.div
		$(div).fadeOut(500, () => {
            document.querySelector('.embed iframe').src+='';
            div.remove()
            callback()    
        })
        this.div = null
	}

    duration() {
        return this.durationProp || 60000
    }

	priority() {
        if (this.priorityProp) {
            if (typeof this.priorityProp === 'function') {
                return this.priorityProp()
            }
            return this.priorityProp
        }
		return 1
	}
}

