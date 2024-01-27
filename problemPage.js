class ProblemPage {
	start() {
        if (this.div) throw Error(`reentrant call`)
        this.div = document.createElement('div')
        this.div.className = 'problem'
        this.div.innerHTML = `
            <iframe src="https://lab.phc.dm.unipi.it/problemi/jumbotron"></iframe>
        `
        document.body.appendChild(this.div)
		$('.problem').fadeIn(500)
	}

	stop(callback) {
        const div = this.div
		$('.problem').fadeOut(500, () => {
            document.querySelector('.problem iframe').src+='';
            div.remove()
            callback()    
        })
        this.div = null
	}

    duration() {
        return 60000
    }

	priority() {
        // show with high priority
        // after between 7pm and 7am
		const date = moment().tz("Europe/Rome").format('HH-mm')
		if (date >= '19-00' || date <= '07-00') return 4
		return 0
	}
}

