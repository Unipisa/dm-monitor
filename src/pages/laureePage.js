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
	constructor({ start, end, test, title, data}) {
		this.test = test
		this.title = title || data?.title || "Appello di laurea" 
		this.data = data || example_data
		this.start_moment = moment.tz(start, "Europe/Rome").unix()
        this.end_moment = moment.tz(end, "Europe/Rome").unix()
		this.div = null
	}

	html() {
		let html = `<h1>${this.title}</h1>`
		html += `<div class="row">`
		for (const room of this.data) {
			html += `<div class="col-4 p-4">
					<h2>
						${room.room} 
						<span class="badge badge-sm badge-primary">${room.floor}</span>
					</h2>`
			html += "<table class='table table-sm'>"
			for (const event of room.events) {
				if (event.html !== undefined) {
					html += `<tr class="separator"><td colspan="3">${event.html}</td></tr>`
				} else {
					html += `<tr>
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
        if (this.div) {
            throw Error(`reentrant call!`)
        }
        this.div = document.createElement('div')
        this.div.className = 'lauree'
        this.div.innerHTML = this.html()
        document.body.appendChild(this.div)
        $(this.div).fadeIn();
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

