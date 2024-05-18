import { version as VERSION } from '../package.json'
import { TEST } from './constants'
import { EmbedPage } from './pages/embedPage'
import { EventsAndVisitorsPage } from './pages/eventsAndVisitorsPage'
import { FractalXmasPage } from './pages/fractalXmasPage'
import { FullScreenImagePage } from './pages/fullscreenImagePage'
import { setupInterval } from './utils'

import colloquium_img from '../images/colloquium_huisken.png'

const pages = [
    new FullScreenImagePage({
        imageUrl: colloquium_img, 
        start: "2024-05-23 06:00",
        end: "2024-05-23 18:44",
        test: TEST, // mostra sempre in modalità test
    }),

    new EventsAndVisitorsPage(),

    new FractalXmasPage(),

    // new LaureePage(),

    new EmbedPage({
        url: 'https://lab.phc.dm.unipi.it/problemi/jumbotron',
        duration: 60000,
        priority: () => {
            if (TEST) return 1 // mostra sempre in modalità test
            // show with high priority
            // between 7pm and 7am
            const date = moment().tz('Europe/Rome').format('HH-mm')
            if (date >= '19-00' || date <= '07-00') return 2
            else return 0
        },
    }),

    new EmbedPage({
        url: 'https://montblanc.panomax.com/',
        duration: 60000,
        priority: () => {
            return 0 // disabled
            // if (TEST) return 1 // mostra sempre in modalità test
            // show only in minute 42
            const date = moment().tz('Europe/Rome').format('mm')
            if (date === '42') return 3
            else return 0
        },
        style: 'margin-top: -150px; margin-bottom: -100px; z-index: -1; zoom: 1.2',
        delay: 10000,
    }),

    new EmbedPage({
        url: 'https://seiseralm-puflatsch.panomax.com/',
        duration: 60000,
        priority: () => {
            if (TEST) return 1 // mostra sempre in modalità test
            // show only in minute 42
            const date = moment().tz('Europe/Rome').format('mm')
            if (date === '42') return 3
            else return 0
        },
        style: 'margin-top: -150px; margin-bottom: -100px; z-index: -1; zoom: 1.2',
        delay: 10000,
    }),

    new EmbedPage({
//        url: "https://zoncolan.panomax.com/", 
        url: "https://cortina.panomax.com/",
        duration: 60000,
        priority: () => {
            if (TEST) return 1 // mostra sempre in modalità test
            // show only in minute 19
            const date = moment().tz('Europe/Rome').format('mm')
            if (date === '19') return 3
            else return 0
        },
        style: 'margin-top: -150px; margin-bottom: -100px; z-index: -1; zoom: 1.2',
        delay: 10000,
    }),
]

function startLoop() {

    document.getElementById('version').textContent = `dm-monitor v${VERSION}`

    // Routine that updates the clock
    setupInterval(updateClock, 1)

    // Routine that cycles the visibility of the different parts.
    setupInterval(cycleScreen, 5)
}

function updateClock() {
    const now = moment().tz('Europe/Rome')
    $('#clock').html(
        `${now.format('ddd MMM DD')} &#8212; ${now.format(
            'HH:mm'
        )} <span style='font-size: 28px'>${now.format('ss')}</span>`
    )
}

class Event {
    start() {
        // fade in
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

    if (currentPage && currentPageTimestamp) {
        const timeElapsedMilliseconds = new Date() - currentPageTimestamp
        if (timeElapsedMilliseconds < currentPage.duration()) {
            console.log(`wait longer...`)
            return
        }
    }

    const priority = pages.map(p => p.priority())
    const total = priority.reduce((a, b) => a + b, 0)
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
    // console.log(pages, priority)

    for (let i = 0; i < pages.length; i++) {
        sum += priority[i]
        // console.log(sum, r)
        if (sum > r) {
            // choose this!
            $('#bullets').html(
                priority
                    .map((p, j) => (p > 0 ? (i === j ? '●' : '○') : ''))
                    .filter(s => s !== '')
                    .join('')
            )
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

window.addEventListener('DOMContentLoaded', () => startLoop())
document.onkeydown = function(e) {
    console.log(`key pressed: [${e.key}]`)
    currentPageTimestamp = null // force termination of current page
    cycleScreen()
}