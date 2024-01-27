class ProblemPage {
	start() {
		$('.problem').fadeIn(effectDuration);
	}

	stop(callback) {
		$('.problem').fadeOut(effectDuration);
		setTimeout(callback, effectDuration);
		setTimeout(function() {
                       document.querySelector('.problem iframe').src+='';
		}, effectDuration);
	}

	isActive() {
		return true
	}
}

