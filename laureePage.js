class LaureePage {
	start() {
		$('.lauree').fadeIn(500)
	}

	stop(callback) {
		$('.lauree').fadeOut(500, () => {
            callback()    
        })
	}

	priority() {
		return 1 // testing
        return 0 // disabled
	}
}

