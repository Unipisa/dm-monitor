const example_data = [
	{
		room: "Aula Riunioni",
		floor: "Primo piano",
		events: [
			{ time: "10:10", name: "Cognome Nome Secondo Nome Terzo Nome", type: "LM" },
			{ time: "11:10", name: "Cognome Nome", type: "LT" },
			{ time: "11:40", name: "Cognome Nome", type: "LM" }
		]
	},
	{
		room: "Aula Seminari",
		floor: "Primo piano",
		events: [
			{ time: "9:00", name: "Cognome Nome", type: "LT" },
			{ time: "9:30", name: "Cognome Nome", type: "LT" },
			{ time: "10:10", name: "Cognome Nome", type: "LM" },
			{ html: "&dash;" }, // separator
			{ time: "11:00", name: "Cognome Nome", type: "LT" },
			{ time: "11:40", name: "Cognome Nome", type: "LM" },
			{ time: "12:20", name: "Cognome Nome", type: "LT" }
		]
	},
	{
		room: "Aula Magna",
		floor: "Piano terra",
		events: [
			{ time: "8:30", name: "Cognome Nome", type: "LT" },
			{ time: "9:00",	name: "Cognome Nome", type: "LM" },
			{ time: "9:30", name: "Cognome Nome", type: "LT" },
			{ time: "10:00", name: "Cognome Nome", type: "LM" },
			{ time: "10:30", name: "Cognome Nome", type: "LT" },
			{ time: "11:20", name: "Cognome Nome", type: "LM" },
			{ time: "12:00", name: "Cognome Nome", type: "LT" },
			{ time: "12:40", name: "Cognome Nome", type: "LM" },
			{ html: "&dash;" },	// separator
			{ time: "14:10", name: "Cognome Nome", type: "LT" },
			{ time: "14:50", name: "Cognome Nome", type: "LM" },
			{ time: "15:30", name: "Cognome Nome", type: "LT" },
			{ time: "16:30", name: "Cognome Nome", type: "LM" },
		]
	},
]

export class LaureePage {
	constructor({ start, end, test, title, data, url}) {
		this.test = test
		this.title = title || data?.title || "Appello di laurea" 
		this.data = data || example_data
		this.start_moment = moment.tz(start, "Europe/Rome").unix()
        this.end_moment = moment.tz(end, "Europe/Rome").unix()
		this.div = null
		this.url = url
	}

	getCurrentTime() {
		const params = new URLSearchParams(location.search)
		if (params.has('testTime')) return params.get('testTime')
		return moment().tz("Europe/Rome").format('HH:mm')
	}

	timeToMinutes(t) {
		const [h, m] = t.split(':').map(Number)
		return h * 60 + m
	}

	getCurrentEventIndex(events, currentTime) {
		const cur = this.timeToMinutes(currentTime)
		let idx = -1
		for (let i = 0; i < events.length; i++) {
			const e = events[i]
			if (e.time) {
				const t = this.timeToMinutes(e.time)
				if (t <= cur && cur < t + 40) idx = i
			}
		}
		return idx
	}

	html() {
		const currentTime = this.getCurrentTime()
		let html = `<h1>${this.title}</h1>`
		html += `<div class="row">`
		for (const room of this.data) {
			const curIdx = this.getCurrentEventIndex(room.events, currentTime)
			html += `<div class="col-4 p-4">
					<h2>
						${room.room} 
						<span class="badge badge-sm badge-primary">${room.floor}</span>
					</h2>`
			html += "<table class='table table-sm'>"
			for (let i = 0; i < room.events.length; i++) {
				const event = room.events[i]
				if (event.html !== undefined) {
					html += `<tr class="separator"><td colspan="3">${event.html}</td></tr>`
				} else {
					html += `<tr${i === curIdx ? ' class="current"' : ''}>
						<td class="time"><strong>${event.time}</strong></td>
						<td><span class="badge badge-sm badge-type">${event.type ?? ''}</span></td>
					 	<td>${event.name}</td>
						</tr>`
				}
			}
			html += `</table></div>`
		}
		html += `</div>`
		return html
	}

	start() {
		const f = () => {
			if (this.div) {
				throw Error(`reentrant call!`)
			}
			this.div = document.createElement('div')
			this.div.className = 'lauree'
			this.div.innerHTML = this.html()
			document.body.appendChild(this.div)
			$(this.div).fadeIn();
		}

		if (this.url) {
			console.log(`Fetching lauree data from ${this.url}`)
			fetch(this.url)
				.then(response => response.json())
				.then(data => {
					this.data = data
					f()
				})
				.catch(error => {
					console.error('Error fetching data:', error)
				})
		} else {
			f()
		}
	}

	stop(callback) {
		$('.lauree').fadeOut(500, () => {
            this.div.remove()
            this.div = null
            callback()    
        })
	}

    duration() {
        return 20000
    }

	priority() {
		if (this.test) return 1
		const now = moment().tz("Europe/Rome").unix()
		if (now >= this.start_moment && now <= this.end_moment) {
			return 2
		}
		return 0
	}	
}

