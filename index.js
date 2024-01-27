const pages = [
    new FullScreenImagePage({
        imageUrl: "images/colloquium_gray.png?d=20231213x",
        start: "2024-01-27 06:00",
        end: "2024-01-27 18:44"
    }),
    new EventsAndVisitorsPage(),
    new FractalXmasPage(),
    new ProblemPage(),
    new LaureePage(),
]
    
function setupInterval(fn, seconds) {
    try {
        fn()
    }
    catch (error) {
        console.log(error)
    }

    setInterval(fn, seconds * 1000)
}

function startLoop() {
    // Routine that updates the clock
    setupInterval(updateClock, 1)

    // Routine that cycles the visibility of the different parts. 
    setupInterval(cycleScreen, 5)
}

function updateClock() {
    const now = moment().tz("Europe/Rome")
    $('#clock').html(`${now.format('ddd MMM DD')} &#8212; ${now.format('HH:mm')} <span style='font-size: 28px'>${now.format("ss")}</span>`)
}

const effectDuration = 500

class Event {
    start() {
        // fade in 
        // return the minimum number of seconds of visibility
    }

    stop(callback) {
        // fade out
        // call callback after fade out
        callback()
    }

    duration() {
        // return the minimal time (milliseconds)
        // this page should be shown
        return 20000
    }

    priority() {
        // priority of this page
        // the probability of choosing this page is proportional to the priority
        // 0: never shown
        // 1: default
        return 1
    }
}

let currentPage = null
let currentPageTimestamp = null

async function cycleScreen() {
    // choose a random page among pages with priority>0
    // probability of choosing a page is proportional to 
    // its priority

    if (pages.length == 0) return

    const timeElapsedMilliseconds = (new Date()) - currentPageTimestamp
    if (currentPage && timeElapsedMilliseconds < currentPage.duration()) {
        console.log(`wait longer...`)
        return
    }

    const priority = pages.map(p => p.priority())
    const total = priority.reduce((a,b) => a+b, 0)
    if (total === 0) {
        // nothing to show!
        if (currentPage) {
            currentPage.stop(() => {})
            currentPage = null
        }
        return
    }

    const r = Math.random() * total
    let sum = 0
    for(let i=0; i<pages.length; i++) {
        sum += priority[i]
        if (sum > r) {
            // choose this!
            $("#bullets").html(priority.map((p,j) => (p>0?(i===j?'●':'○'):'')).filter(s=>(s!=='')).join(''))
            const page = pages[i]
            if (currentPage === page) return

            if (currentPage) currentPage.stop(() => page.start())
            else page.start()
            currentPage = page
            currentPageTimestamp = new Date()
            console.log(`current page: ${currentPage.constructor.name}`)
            return
        }
    }
    console.log(`non dovrebbe succedere!`)
}

