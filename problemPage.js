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
		return 1 // testing
        return 0 // disabled
	}
}

