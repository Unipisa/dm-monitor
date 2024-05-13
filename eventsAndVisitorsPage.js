const DM_MANAGER_HOST =
    'https://manage.dm.unipi.it'
//    'https://manage.develop.lb.cs.dm.unipi.it'

class EventsAndVisitorsPage {
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
		$('.eventi').fadeOut(effectDuration, () => {
            eventi.remove()
            callback()
        })
		$('.visitors').fadeOut(effectDuration, () => {
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
    const dateA = new Date(eventA.startDatetime)
    const dateB = new Date(eventB.startDatetime)

    return dateA.getTime() - dateB.getTime()
}

async function loadEvents() {
    var events = [];
    
    // ATTENZIONE: le date dei seminari sono in UTC, comprendendo anche l'ora.
    // invece le date delle conferenze sono attualmente la mezzanotte di UTC (e non dell'ora locale)
    const midnight = moment().tz("Europe/Rome").startOf('day').utc().format()
    const today = moment().format('YYYY-MM-DD')
    
    try {
        // let res = await fetch('https://www.dm.unipi.it/wp-json/wp/v2/unipievents?per_page=50');
        let res_sem = await (await fetch(DM_MANAGER_HOST + `/api/v0/public/seminars?from=${midnight}&_sort=startDatetime`)).json()
        let res_con = await (await fetch(DM_MANAGER_HOST + `/api/v0/public/conferences?from=${today}&_sort=startDate`)).json()

        const res_sem_aug = res_sem.data.map((x) => {
            return {  ...x, 
                type: 'seminar',
                startDatetime: moment.utc(x.startDatetime).tz("Europe/Rome"),
                endDatetime: moment.utc(x.startDatetime).tz("Europe/Rome").add(x.duration, 'minutes'),
            }
        })
        const res_con_aug = res_con.data.map((x) => {
            return { ...x, 
                type: 'conference', 
                startDatetime: moment.tz(x.startDate, "Europe/Rome").startOf('day'),
                endDatetime: moment.tz(x.endDate || x.startDate, "Europe/Rome").startOf('day').add(1, 'days'),
            }
        })
        events = [ ...res_sem_aug, ...res_con_aug ]
        events.sort((x,y) => x.startDatetime - y.startDatetime)
        // console.log(JSON.stringify({events}, null, 2))
    } catch (error) {
       return;
    }

    const now = moment.utc().tz("Europe/Rome")
    // We only collect the events that end in the future.
    events = events.filter(x => (now <= x.endDatetime));

    let number_of_events_in_the_same_day = 0;
    var first_event_date = null;
    for (var i = 0; i < events.length; i++) {
        var event_date = events[i]?events[i].startDatetime.format('YYYY-MM-DD'):'';
        if (event_date && !first_event_date) first_event_date = event_date;
        if (event_date == first_event_date) {
            number_of_events_in_the_same_day++;
        }
    }

    // console.log(events)

    const number_of_events = Math.min(events.length,Math.max(4, number_of_events_in_the_same_day));
    const smaller = (number_of_events > 4)
    
    let html = '';
    for (var i = 0; i < number_of_events; i++) {
        const event = events[i]
        let clock_icon = '<i class="fa-solid fa-clock"></i>';
        let venue_icon = `<i class="fa-solid fa-location-dot"></i>`;

        var to = ""
        var from = ""

        if (event.type == 'conference') {
            to = moment.utc(event.endDate)
            from = moment.utc(event.startDate)
            from = `<span class="badge badge-sm badge-primary${smaller?' smaller':''}">${clock_icon} ${from.format('MMM DD')}</span>`;
        }
        else {
            // Seminar here
            to = event.endDatetime
            from = event.startDatetime

            if (from <= now && now <= to) {
                from = `<span class="badge badge-sm badge-success">${clock_icon} Running now</span>`;
            } else {
                console.log(`> ${from} ${now} ${to}`)
                from = `<span class="badge badge-sm badge-primary${smaller?' smaller':''}">${clock_icon} ${from.format('MMM DD HH:mm')}</span>`;
            }
        }

                
        let venue = `<span class="badge badge-sm badge-secondary smaller">${venue_icon} ${event.conferenceRoom?.name}</span>`
        
        var border_override = "";
        if (i == 0) {
            border_override = ` style="border-top: 0px;"`;
        }
        
        var tag = "";
        var speaker = "";
        if (event.type == 'conference') {
            tag = '<span class="badge badge-sm badge-primary smaller">Conference</span>';
        }
        else if (event.type == 'seminar') {
            tag = '<span class="badge badge-sm badge-primary smaller">Seminar</span>';
            if (event.speakers) {
                speaker = event.speakers.map(speaker => formatPerson(speaker)).join(', ')
            } else {
                speaker = formatPerson(event.speaker)
            }
        }
        
        let el = `
        <div class="event ${smaller?'smaller':''}" ${border_override}>
        <div class="venue">
        ${from} 
        ${venue}
        ${tag}
        </div>
        <h3>
        ${speaker?speaker+(smaller?'':'<br />'):''}
        <i class="title">${event.title}</i>
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
        const endpoint = DM_MANAGER_HOST + '/api/v0/public/visits';    
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

        return `<b class="speaker">${person.firstName} ${person.lastName}</b> <span class="affiliation">${affiliationsLine}</span>`
}
