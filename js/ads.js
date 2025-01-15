
const AD_QUEUE = ["banking", "cooking"]
const TRIGGER_ON_MERGE = 256

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
    pointer-events: none;
`;
document.body.appendChild(popupWindow)

async function preloadVideo(src) {
    const res = await fetch(src);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
}

function initializeAd(ad_data) {
    const popupVideo = document.createElement("video")
    popupVideo.style.cssText = `
        max-height: 100%;
        max-width: 100%;
    `;
    popupVideo.playsInline = true;

    const returnObject = { name: ad_data, data: popupVideo, initalized: false }

    preloadVideo(`./media/${ad_data}.mov`).then((v) => { 
        popupVideo.src = v
        console.log(ad_data)
        returnObject.initalized = true
    })  

    return returnObject
}

const AD_STACK = AD_QUEUE.reverse().map((name) => {
    return initializeAd(name)
})

function resizeAdWindow() {
    console.log("Resize called")
    popupWindow.style.width = `${Math.max( body.scrollWidth, body.offsetWidth )}px`;
    popupWindow.style.height = `${Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight )}px`;
}

var isShowing = false

function tryShowAd() {
    // console.log(ad_data)
    if (isShowing) { return }
    if (AD_STACK.length == 0) { return }
    if (!AD_STACK[0].initalized) { return }
    // console.log(AD_STACK[0])
    // console.log(AD_STACK[1])
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

    const popupVideo = AD_STACK.pop().data
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

document.addEventListener("merge", async (e) => {
    console.log(e.detail)
    if (e.detail.includes(TRIGGER_ON_MERGE)) {
        window.setTimeout(tryShowAd, 1000)
    }
})

window.addEventListener("resize", resizeAdWindow)