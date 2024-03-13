import { EFFECT_DURATION } from '../constants'

import { setupInterval } from "../utils"

export class EventsAndVisitorsPage {
    constructor() {
        this.lastUpdate = null
        this.reload()
        // Block of routines that periodically poll events from different sources and 
        // update the relevant blocks in the HTML
        setupInterval(() => this.reload(), 600)

        // Scroll effect for the visitor block
        setInterval(scrollVisitors, 100)
    }

    async reload() {
        this.events_html = await loadEvents()
        this.visitors_html = await loadVisitors()
        this.lastUpdate = new Date()
    }

	start() {
        if (this.eventi) throw Error(`reentrant call`)
        this.eventi = document.createElement('div')
        this.eventi.className = 'eventi'
        this.eventi.innerHTML = this.events_html

        this.visitors = document.createElement('div')
        this.visitors.className = 'visitors'
        this.visitors.innerHTML = this.visitors_html

        document.body.appendChild(this.eventi)
        document.body.appendChild(this.visitors)
		$('.visitors, .eventi').fadeIn(500) 
	}

	stop(callback) {
        const eventi = this.eventi
        const visitors = this.visitors
        this.eventi = null
        this.visitors = null
		$('.eventi').fadeOut(EFFECT_DURATION, () => {
            eventi.remove()
            callback()
        })
		$('.visitors').fadeOut(EFFECT_DURATION, () => {
            visitors.remove()
        })
	}

    duration() {
        return 20000
    }

	priority() {
        if (!this.lastUpdate) return 0
		return 1
	}

};

function scrollVisitors() {
    const visitorContainers = document.getElementsByClassName("visitors-container")
    const stop_up = 50;
    const stop_bottom = 50;
    if (visitorContainers.length > 0) {
        const vc = visitorContainers[0]
	// console.log(vc['data-wait']);
        if (vc['data-wait'] > 0) {
           if (vc['data-wait']<stop_up)  vc.scrollTop = 0;
           vc['data-wait'] --;
           return
        }
        const currentTop = vc.scrollTop
        const newTop = vc.scrollTop + 1

        // If we get to the bottom, wrap to the top
        vc.scrollTop = newTop
        if (currentTop && currentTop == vc.scrollTop) {
	    vc['data-wait'] = stop_up + stop_bottom;
        }
    }
}

function sortEvents(eventA, eventB) {
    var dateA = null;
    if (eventA.type == 'conference') {
        dateA = new Date(eventA.startDate)
    }
    else {
        dateA = new Date(eventA.startDatetime)
    }


    if (eventB.type == 'conference') {
        dateB = new Date(eventB.startDate)
    }
    else {
        dateB = new Date(eventB.startDatetime)
    }

    return dateA.getTime() - dateB.getTime()
}

async function loadEvents() {
    var data = null;

    try {
        // let res = await fetch('https://www.dm.unipi.it/wp-json/wp/v2/unipievents?per_page=50');
        let res_sem = await (await fetch('https://manage.dm.unipi.it/api/v0/public/seminars?from=now')).json()
        let res_con = await (await fetch('https://manage.dm.unipi.it/api/v0/public/conferences?from=now')).json()

        const res_sem_aug = res_sem.data.map((x) => {
            return {  ...x, type: 'seminar' }
        })
        const res_con_aug = res_con.data.map((x) => {
            return { ...x, type: 'conference' }
        })
        data = [ ...res_sem_aug, ...res_con_aug ]
        data.sort(sortEvents)
    } catch (error) {
       return;
    }

    var valid_events = [];
    const now = moment.utc().tz("Europe/Rome")

    // We only collect the events that end in the future.
    for (var i = 0; i < data.length; i++) {
        if (data[i].startDatetime) {
            let eventDate = moment.utc(data[i].startDatetime).tz("Europe/Rome")
            if (now <= moment.utc(data[i].startDatetime).tz("Europe/Rome").add(data[i].duration, "minutes")) {
                valid_events.push(data[i])
            }
        }
        else {
            valid_events.push(data[i])
        }
    }

    // console.log(valid_events)

    const number_of_events = Math.min(valid_events.length,4)
    
    let html = '';
    for (var i = 0; i < number_of_events; i++) {
        let clock_icon = '<i class="fa-solid fa-clock"></i>';
        let venue_icon = `<i class="fa-solid fa-location-dot"></i>`;

        var to = ""
        var from = ""

        if (valid_events[i].type == 'conference') {
            to = moment.utc(valid_events[i].endDate)
            from = moment.utc(valid_events[i].startDate)
            from = `<span class="badge badge-sm badge-primary">${clock_icon} ${from.format('MMM DD')}</span>`;
        }
        else {
            // Seminar here
            to = moment.utc(valid_events[i].startDatetime).add(valid_events[i].duration, 'minutes').tz("Europe/Rome")
            from = moment.utc(valid_events[i].startDatetime).tz("Europe/Rome")

            if (from >= now && to <= now) {
                from = `<span class="badge badge-sm badge-success">${clock_icon} Running now</span>`;
            } else {
                from = `<span class="badge badge-sm badge-primary">${clock_icon} ${from.format('MMM DD HH:mm')}</span>`;
            }
        }

                
        let venue = `<span class="badge badge-sm badge-secondary">${venue_icon} ${valid_events[i].conferenceRoom?.name}</span>`
        
        var border_override = "";
        if (i == 0) {
            border_override = ` style="border-top: 0px;"`;
        }
        
        var tag = "";
        var speaker = "";
        if (valid_events[i].type == 'conference') {
            tag = '<span class="badge badge-sm badge-primary">Conference</span>';
        }
        else if (valid_events[i].type == 'seminar') {
            tag = '<span class="badge badge-sm badge-primary small">Seminar</span>';
            if (valid_events[i].speakers) {
                speaker = valid_events[i].speakers.map(speaker => formatPerson(speaker)).join(', ')
            } else {
                speaker = formatPerson(valid_events[i].speaker)
            }
        }
        
        let el = `
        <div class="event" ${border_override}>
        <div class="venue">
        ${from} 
        ${venue}
        ${tag}
        </div>
        <h3>
        ${speaker?speaker+'<br />':''}
        <i style="font-size: 90%">${valid_events[i].title}</i>
        </h3>
        </div>
        `;
        html += el;
    }
    return html
}

async function loadVisitors() {
    var visits = [];

    try {
        const endpoint = 'https://manage.dm.unipi.it/api/v0/public/visits';    
        const res = await fetch(endpoint)
        visits = (await res.json()).data
    }
    catch (error) {
        console.log("Error loading visitors");
        return;
    }
    
    visits.sort((a,b) => a.startDate.localeCompare(b.startDate)).reverse()
    
    let html = '<h2>Current visitors</h2><div class="visitors-container">'
    for (const visit of visits) {
        const startDay = moment.utc(visit.startDate).format('DD')
        const startMonth = moment.utc(visit.startDate).format('MMM')
        const startYear = moment.utc(visit.startDate).format('YYYY')
        const endDay = moment.utc(visit.endDate).format('DD')
        const endMonth = moment.utc(visit.endDate).format('MMM')
        const endYear = moment.utc(visit.endDate).format('YYYY')
        
        var date = `${startMonth} ${startDay} &ndash; ${startMonth==endMonth?'':endMonth} ${endDay}`
        if (startYear != endYear) {
            date = `${startYear}, ${startMonth} ${startDay} &ndash; ${endYear}, ${endMonth} ${endDay}`
        }
        
        const datesBadge = `<span class="badge badge-sm badge-primary">${date}</span>`
        
        const room = visit?.roomAssignment?.room
        const roomBadge = room?`<span class="badge badge-sm badge-secondary">Room ${room.building}&ndash;${room.floor}&ndash;${room.number}</span>`:'' 
        const person = visit?.person

        const personLine = formatPerson(person)

        const el = `
        <div class="visitor">
        ${datesBadge} ${roomBadge}
        <br>
        ${personLine}
        </div>`
        html += el
    }
    html +='</div>'

    return html
}

function formatPerson(person) {
	var affiliationsLine = "";
        try {
            const affiliations = person?.affiliations.map(_ => _.name)
            affiliationsLine = affiliations?` (${affiliations.join(', ')})`:''
        } catch (error) {
            // No valid affiliations, keep an empty string
        }

        return `<b>${person.firstName} ${person.lastName}</b> <span style='font-size: 75%'>${affiliationsLine}</span>`
}
