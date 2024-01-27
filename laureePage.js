class LaureePage {
	start() {
		$('.lauree').fadeIn(500)
	}

	stop(callback) {
		$('.lauree').fadeOut(500, () => {
            callback()    
        })
	}

    duration() {
        return 20000
    }

	priority() {
        return 0 // disabled
        return 1
	}
}

