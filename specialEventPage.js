class SpecialEventPage {
	start() {
		$('.special').fadeIn();
	}

	stop(callback) {
		$('.special').fadeOut(effectDuration);
		setTimeout(callback, effectDuration);
	}

	isActive() {
        return true
        // Inserire qui da quando a quando bisogna mostrare lo special (vedi il <div class="special"></div> sotto)
        const showSpecialStart = moment.tz("2024-01-24 06:00", "Europe/Rome").unix()
        const showSpecialEnd   = moment.tz("2024-01-24 20:00", "Europe/Rome").unix()
		return moment().unix() >= showSpecialStart && moment().unix() <= showSpecialEnd;
	}
};
