
const AD_QUEUE = ["banking", "cooking"]
const TRIGGER_ON_MERGE = 8


const body = document.body
const html = document.documentElement;

const popupWindow = document.createElement("div")
popupWindow.style.cssText = `
    background-color: black;
    position: absolute;
    top: 0;
    left: 0;
    visibility: hidden;
    z-index: 99;
    display: flex;
    align-items: center;
    justify-content: center;
`;
document.body.appendChild(popupWindow)

function initializeAd(ad_data) {
    popupVideo = document.createElement("video")
    popupVideo.style.cssText = `
        max-height: 100%;
        max-width: 100%;
    `
    popupVideo.innerHTML = `
        <source src="./media/${ad_data}.mov">
    `

    return popupVideo
}

function resizeAdWindow() {
    console.log("Resize called")
    popupWindow.style.width = `${Math.max( body.scrollWidth, body.offsetWidth )}px`;
    popupWindow.style.height = `${Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight )}px`;
}

var isShowing = false

function showAd(ad_data) {
    // console.log(ad_data)
    if (isShowing) { return }
    isShowing = true

    // Disable game
    document.dispatchEvent(new CustomEvent("gameActionable", {
        detail: false
    }))

    resizeAdWindow()
    popupWindow.style.visibility = "visible"
    popupWindow.animate([
        { transform: "translateX(100%)" },
        { transform: "translateX(0)" },
    ], {
        duration: 500,
        easing: "ease-out"
    })

    const popupVideo = initializeAd(ad_data)
    popupVideo.addEventListener("ended", () => { hideAd(popupVideo) })
    popupWindow.appendChild(popupVideo) 
    // TODO: progress bar
    window.setTimeout(() => { popupVideo.play() }, 500)
}

function hideAd(popupVideo) {
    popupWindow.animate([
        { transform: "translateX(0)" },
        { transform: "translateX(100%)" }
    ], {
        duration: 500,
        easing: "ease-out"
    })

    window.setTimeout(() => { 
        popupVideo.remove() 
        popupWindow.style.visibility = "hidden"
    }, 500)

    document.dispatchEvent(new CustomEvent("gameActionable", {
        detail: true
    }))
    isShowing = false
}

const AD_STACK = AD_QUEUE.reverse()

document.addEventListener("merge", async (e) => {
    console.log(e.detail)
    if (e.detail.includes(TRIGGER_ON_MERGE) && AD_STACK.length > 0) {
        window.setTimeout(showAd, 1000, AD_STACK.pop())
    }
})

window.addEventListener("resize", resizeAdWindow)