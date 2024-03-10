
export function setupInterval(fn, seconds) {
    try {
        fn()
    }
    catch (error) {
        console.log(error)
    }

    setInterval(fn, seconds * 1000)
}
