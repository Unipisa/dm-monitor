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
		return 1 // testing
        return 0 // disabled
	}
}

