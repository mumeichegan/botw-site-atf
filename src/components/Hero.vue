<script setup>
import imgPattern from '@assets/pattern.jpg'
import imgLogo from '@assets/logo.png'
import imgPetal from '@assets/petal.png'
import imgSmallLogo from '@assets/logo-small.png'

import videoH264 from '@assets/video.h264.mp4'
import videoHEVC from '@assets/video.hevc.mp4'
import videoAV1 from '@assets/video.av1.mp4'

import { ref, onMounted } from 'vue'

function getElementPosition(element, toWorld = true) {
  const offset = {
    top: 0,
    left: 0,
  };

  if (toWorld === false) {
    offset.top = element.offsetTop;
    offset.left = element.offsetLeft;
  } else {
    const positionToViewport = element.getBoundingClientRect();

    const scrollTop = window.pageYOffset;
    const scrollLeft = window.pageXOffset;

    const clientTop = document.body.clientTop || 0;
    const clientLeft = document.body.clientLeft || 0;

    offset.top += Math.round(positionToViewport.top + scrollTop - clientTop);
    offset.left += Math.round(
      positionToViewport.left + scrollLeft - clientLeft
    );
  }

  return offset;
}

function Petal(position, velocity, density) {
    this.maxAge = this.maxAge || 100
    this.decayLength = 30

    this.state = this.state || 0

    this.position = position
    this.velocity = velocity 
    this.originalDensity = density // [.4, 1]
    this.density = density

    this.rotationalIterant = 5e2 * Math.random()
    this.ageIterant = 0

    // create a sprite directly from an image
    this.sprite = new PIXI.Sprite(petalTexture)

    this.petalContainer = new PIXI.Container
    this.decayContainer = new PIXI.Container

    this.sprite.scale.set(this.density)
    this.sprite.alpha = .5 + Math.abs(1 - density)

    this.petalContainer.position = this.position
    this.petalContainer.rotation = Math.sin(this.rotationalIterant) 

    // container > petalContainer > decayContainer > sprite
    this.decayContainer.addChild(this.sprite)
    this.petalContainer.addChild(this.decayContainer)
    container.addChild(this.petalContainer)

    this.maxAge = this.maxAge + Math.random() * this.maxAge
}

Petal.prototype.kill = function() {
    container.removeChild(this.sprite)
}

Petal.prototype.update = function() {
    let velocityClone0 = this.velocity.clone()
    let velocityClone1 = this.velocity.clone()
    let velocityClone2 = this.velocity.clone()

    this.rotationalIterant++
    this.ageIterant++

    var modifier = this.ageIterant / this.maxAge * -8;

    this.velocity
        .add(initialVelocity)
        .add({
            x: 0,
            y: Math.sin((this.rotationalIterant + (120 + Math.random() * 5)) / 500) * modifier
            
        })
        .multiplyScalar(this.density)
        .multiplyScalar(.3)
    this.position
        .add(this.velocity.multiplyScalarNew(2))
    this.petalContainer.position = this.position

    velocityClone1 = this.velocity.subtractNew(velocityClone2)
    velocityClone0 = velocityClone1.angle

    this.petalContainer.rotation += velocityClone0 / 75 * 2

    this.petalContainer.scale.x = Math.sin(this.rotationalIterant / 25 * 2)

    // decay phase
    if (this.state === 2) {
        // preDecayLength
        const preDecayLength = this.maxAge - this.decayLength
        // ageFromEnteringDecay
        const ageFromEnteringDecay = this.ageIterant - preDecayLength
        // timeToLive
        const timeToLive = Math.abs(this.decayLength - ageFromEnteringDecay)

        this.density = this.originalDensity * timeToLive / this.decayLength
        this.decayContainer.scale.set(1 * timeToLive / this.decayLength)
    }

    // detect dead
    if (
        this.ageIterant >= this.maxAge
    ) { 
        if (this.decayContainer.scale.x > 0) {            
            this.decayContainer.scale.set(0)
        }
        this.state = 4
        setTimeout(() => {
            isSceneEnding = true
        }, 1000)
    }
    // detect decay
    else if (this.ageIterant >= this.maxAge - this.decayLength) {
        this.state = 2
    }

}

const overlay = ref(null)
const logoMasker = ref(null)
const logo = ref(null)
const smallLogo = ref(null)
const video = ref(null)

const activeSmallLogoTransform = ref(null)

const loadedImgPattern = ref(null) // ?

const logoSize = {
    small: {
        width: 320,
        height: 254
    },
    notSmall: {
        width: 514,
        height: 408
    }
}
const maxLogoWidth = logoSize.notSmall.width

const logoWidth = ref(0)
const logoHeight = ref(0)

const screenBreakPoint = 640

let currentScreenSize
if (window.innerWidth < screenBreakPoint) {
    logoWidth.value = logoSize.small.width
    logoHeight.value = logoSize.small.height
    currentScreenSize = 'small'
}
else {
    logoWidth.value = logoSize.notSmall.width
    logoHeight.value = logoSize.notSmall.height
    currentScreenSize = 'notSmall'
}

let PIXI = null
let WTCVector = null

let petalTexture = null
let container = null
let initialVelocity = null
let hasPetalLeftovers = true
let isSceneEnding = false

function isWeixinBrowser() {
    let ua = navigator.userAgent.toLowerCase()
    return /micromessenger/.test(ua) ? true : false
}

onMounted(async () => {

    if (isWeixinBrowser()) {
        const script = document.createElement('script')
        script.onload = function() {
            if (window.WeixinJSBridge) {
                WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
                    video.value.play()
                }, false)
            } else {
                document.addEventListener("WeixinJSBridgeReady", function () {
                    WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
                        video.value.play()
                    })
                }, false)
            }
        }
        script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js'
        document.head.appendChild(script)
    }

    const patternImage = new Image()
    patternImage.addEventListener('load', function() {
        loadedImgPattern.value = `url(${this.src})`
    })
    patternImage.src = imgPattern

    ;[PIXI, { default: WTCVector }] = await Promise.all([
        import('pixi.js'),
        import('wtc-vector')
    ])

    const petalImage = new Image()
    petalImage.addEventListener('load', function() {
        const texture = PIXI.Texture.from(this.src)
        petalTexture = texture
    })
    petalImage.src = imgPetal

    container = new PIXI.Container
    initialVelocity = new WTCVector(12, -1)
    const vec = new WTCVector(-9999, -9999)
    let petals = []

    const renderer = new PIXI.Renderer({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundAlpha: 0,
        resolution: 2
    })

    window.addEventListener('resize', () => {
        if (!PIXI) {
            return
        }

        const lastScreenSize = currentScreenSize

        if (window.innerWidth < screenBreakPoint) {
            logoWidth.value = logoSize.small.width
            logoHeight.value = logoSize.small.height
            currentScreenSize = 'small'
        }
        else {
            logoWidth.value = logoSize.notSmall.width
            logoHeight.value = logoSize.notSmall.height
            currentScreenSize = 'notSmall'
        }

        if (lastScreenSize !== currentScreenSize) {
            for (let i = 0; i < petals.length; i++) {
                petals[i].sprite.scale.set(0)
            }
        }

        if (!continueRevealing) {
            logoMasker.value.style.width = logoWidth.value + 'px'
        }

        if (!hasPetalLeftovers) {
            return
        }

        renderer.resize(window.innerWidth, window.innerHeight)
    })

    renderer.view.id = 'petal-canvas'
    document.body.appendChild(renderer.view)

    let continueRevealing = true
    let time = 0
    
    genPetal0()

    function genPetal0() {
        time++
        // the logo is being revealed
        if (continueRevealing) {
            // logo masker width increases 5px per frame
            const logoMaskerWidth = 5 * time
            logoMasker.value.style.width = logoMaskerWidth + 'px'
            const logoMaskerBounds = getElementPosition(logoMasker.value)
            // petal horizontal speed syncs with the speed of logo masker width increment
            // but slows down a bit
            vec.x = logoMaskerBounds.left + logoMaskerWidth - 10
            // petal vertical starting position
            // 100px to the bottom of the logo
            const petalBottomMostOffset = window.innerWidth < screenBreakPoint ? 
                100 * logoSize.small.width / 514 
                : 100
            vec.y = logoMaskerBounds.top + (logoMasker.value.offsetHeight - petalBottomMostOffset)
            // if the logo has been fully revealed
            // update continueReveal to false
            // fix the logo width
            if (logoMaskerWidth >= maxLogoWidth) {
                continueRevealing = false
                logoMasker.value.style.width = logoWidth.value + 'px'
            }
            // add particles to the particle array
            // n O calls per frame?
            for (let i = 0; i < 5 + (Math.floor(Math.random() * 5) + 1) ; i++) {
                genPetal1()
            }
        }
        updatePetal()
        
        if (isSceneEnding) {
            // overlay opacity 0
            overlay.value.style.opacity = 0
            // logoMasker opacity 0
            logoMasker.value.style.opacity = 0
            // smallLogo active
            activeSmallLogoTransform.value = 'translateX(0)'
        }
        
        if (hasPetalLeftovers) {
            renderer.render(container)
            requestAnimationFrame(genPetal0)
        }
    }

    function genPetal1() {
        // generate y position for petals per frame
        // from a base y position (100px to the bottom of the logo)
        // x position remains
        const position = vec.clone() // clone a 2d vector

        // vertical spread is 200px
        // covering significant vertical space of the logo
        const verticalSpreadLength = window.innerWidth < screenBreakPoint 
            ? logoSize.small.width * 200 / logoSize.notSmall.width
            : 200
        position.y = position.y - verticalSpreadLength * Math.random()

        const velocity = initialVelocity.clone()
        // instantiate particle
        const petal = new Petal(position, velocity, .4 + .6 * Math.random())
        // push it to a particle array
        petals.push(petal)
    }

    function updatePetal() {
        petals.forEach((petal, index) => {
            // dead phase
            if (petal.state === 4) {
                petals.splice(index, 1)
                if (petals.length === 0) {
                    hasPetalLeftovers = false
                    const petalCanvas = document.getElementById("petal-canvas")
                    petalCanvas && petalCanvas.parentNode.removeChild(petalCanvas)
                    renderer.destroy()
                }
            }
            // not dead
            // update
            else {
                petal.update()
            }
        })
    }
})
</script>

<template>
    <article
        h="[calc(100vh-110px)]"
        class="i"
        :style="{ backgroundImage: loadedImgPattern }"
        bg="center"
        overflow-hidden
        relative>
        <div
            absolute
            w="100%"
            h="90%"
            left="0"
            top="0"
            bg="#170606"
            flex="~ justify-center"
            overflow="hidden">
            <div
                absolute
                w="100%"
                h="100%"
                top="0"
                left="0"
                ref="overlay"
                bg="black/50"
                z="5"
                :class="$style.r0_p0_p0">
            </div>
            <!-- width="1280" -->
                <video
                    ref="video"
                    
                    autoplay
                    loop
                    muted
                    playsinline

                    block
                    absolute
                    left="50%"
                    translate="-50%"
                    top="50%"
                    
                    style="width: 100%; height: 100%; object-fit: cover;"

                    webkit-playsinline="true"
                    x5-playsinline="true"

                    x5-video-player-type="h5" 
                    x5-video-player-fullscreen="true"
                    x5-video-orientation="portrait">
                        <source
                            :src="videoAV1"
                            type="video/mp4; codecs=av01.0.05M.08,opus">
                        <source
                            :src="videoHEVC"
                            type="video/mp4; codecs=hvc1">
                        <source
                            :src="videoH264"
                            type="video/mp4; codecs=avc1.4D401E,mp4a.40.2">
                </video>
            
        </div>
        <div
            relative
            z="5"
            w="100%"
            h="90%"
            flex="~ justify-center items-center"
            :class="$style.r0_r0">
            <div
                w="320px"
                h="254px"
                sm:w="514px"
                sm:h="408px"
                relative>
                <div
                    absolute
                    top="0"
                    left="0"
                    w="100%"
                    h="100%">
                    <div
                        ref="logoMasker"
                        w="0"
                        h="100%"
                        overflow-hidden
                        :class="$style.r0_r1_r0">
                        <img
                            ref="logo"
                            :style="{ width: logoWidth + 'px', height: logoHeight + 'px'}"
                            :src="imgLogo" 
                            alt="">
                    </div>
                </div>
                
            </div>
        </div>

        <div
            ref="smallLogo"
            absolute
            top="21px"
            right="0"
            translate="x-100%"
            :style="{ transform: activeSmallLogoTransform }"
            :class="$style.r0_p1">
            <img
                width="182"
                height="147"
                :src="imgSmallLogo" alt="">
        </div>
        
        <div
            absolute
            w="100%"
            h="20%"
            top="0"
            left="0"
            :class="$style.r0_p0"></div>
    </article>
</template>

<style module>
.r0_p0 {
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
}
.r0_p0_p0 {
    transition: opacity .5s ease;
}
.r0_r1_r0 {
    transition: opacity .8s ease;   
}
.r0_p1 {
    transition: .3s .7s transform ease;
}
.r0_r0::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 21px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='722' height='21' viewBox='0 0 722 20'%3E%3Cdefs%3E%3Cpath id='path-1' d='M0 20.8h719.643V.536H0z'/%3E%3C/defs%3E%3Cg id='Symbols' fill='none' fill-rule='evenodd' stroke='none' stroke-width='1'%3E%3Cg id='Border2'%3E%3Cg id='Page-1'%3E%3Cg id='Group-3' fill='%23120404' transform='translate(0 .49)'%3E%3Cpath id='Fill-1' d='M20.27 3.183v11.539h-3.387V.368c0-.323.183-.389.411-.163l2.976 2.978Zm-5.631 13.803h5.356c.297 0 .366.186.16.391l-3 2.93h-2.516l-3.39-3.32V.07h3.39v16.915ZM.01 17.26V5.701h3.367v14.332c0 .297-.163.363-.391.16L.01 17.26ZM3.1.07h2.541l3.367 3.387v16.85H5.64V3.457H.285c-.32 0-.366-.16-.16-.388L3.1.07Z'/%3E%3C/g%3E%3Cpath id='Fill-4' fill='%23120404' d='m39.464.56 3.367 3.387v13.529l-3.367 3.32h-5.63v-3.32h5.63V3.947h-5.63V.56h5.63ZM28.18 15.211h9.02v-3.363h-9.02v3.363Zm0-5.63h9.02V6.214h-9.02v3.367Zm-2.245-5.634v13.529h5.631v3.32h-5.63l-3.387-3.32V3.947L25.935.56h5.631v3.387h-5.63Z'/%3E%3Cmask id='mask-2' fill='%23fff'%3E%3Cuse xlink:href='%23path-1'/%3E%3C/mask%3E%3Cpath id='Fill-6' fill='%23120404' d='M56.393 9.581h3.366v-3.39h-3.366v3.39Zm5.63-9.02 3.367 3.387v13.529l-3.366 3.32H48.495l-3.387-3.32V3.673L48.107.695c.228-.203.388-.16.388.16v16.622h13.529V3.947h-7.898v7.899h5.633v3.366h-5.633l-3.387-3.366V3.948L54.126.56h7.898Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-8' fill='%23120404' d='M82.32.56v3.364H73.3V.535l9.02.025Zm5.356 16.893c.297 0 .366.183.16.389l-2.975 2.955-14.08-.023-2.976-2.932c-.228-.206-.16-.389.16-.389h19.711ZM87.95 3.65v8.172l-3.366 3.39h-2.265l-3.366-3.39V9.558h-2.265v2.264L73.3 15.186h-2.242l-3.389-3.364V3.65L70.667.675c.205-.206.39-.14.39.16v10.987H73.3V9.558l3.39-3.367h2.264l3.366 3.367v2.264h2.265V.835c0-.3.185-.366.39-.16L87.95 3.65Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-9' fill='%23120404' d='M99.248 6.213h-.023L95.86 9.58H90.23V6.19h5.63V3.97h-5.333c-.322 0-.39-.184-.16-.412L93.343.583h2.518l3.387 3.386v2.244Zm10.873-2.93.391.39v13.802l-3.366 3.32h-13.53l-3.386-3.32v-2.264l3.387-3.364h7.898V.583h3.364v11.264l-3.364 3.364h-7.898v2.264h13.529V.857c0-.32.16-.389.388-.16l2.587 2.587Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-10' fill='%23120404' d='M124.073 9.581h3.367v-3.39h-3.367v3.39Zm5.634-9.02 3.363 3.387v13.529l-3.363 3.32h-13.53l-3.389-3.32V3.673l2.999-2.978c.23-.203.39-.16.39.16v16.622h13.53V3.947h-7.898v7.899h5.63v3.366h-5.63l-3.39-3.366V3.948L121.81.56h7.898Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-11' fill='%23120404' d='M152.266 11.822h3.366v5.63l-3.366 3.344H150l-3.366-3.343V9.512h-2.267v7.94l-3.387 3.344h-2.244l-3.387-3.343v-5.631h3.387v5.63h2.244v-7.94l3.387-3.39h2.313l3.32 3.39v7.94h2.265v-5.63ZM138.736.535h13.53l3.366 3.389v5.633h-3.366V3.924h-13.53v5.633h-3.386V3.924l3.387-3.39Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-12' fill='%23120404' d='M174.805 3.925h3.386V.535h-3.386v3.39Zm-2.244 13.529h5.356c.297 0 .366.182.16.388l-2.975 2.955h-2.541v-.117.092l-3.39-3.341v-2.267l3.39-3.364h2.244V6.146h3.386V11.8l-3.386 3.364h-2.244v2.29Zm-3.39-7.896V3.925h-2.241v5.633h-3.39v-5.61L166.93.56V.536h2.264v.048l3.367 3.364v5.61h-3.39ZM161.3 11.8h2.241l3.39 3.387v2.267l-3.39 3.343v-.025h-2.518l-1.693-1.648-1.282-1.305c-.206-.228-.16-.388.16-.388h5.333v-2.244H161.3l-3.39-3.387V6.169h3.39v5.63Zm-3.39-7.852h3.387V.56h-3.387v3.387Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-13' fill='%23120404' d='M191.753 15.212h8.998v-3.364h-8.998v3.364Zm.003-5.63h8.997v-3.39h-8.997v3.39Zm8.72 7.895c.298 0 .366.182.16.39l-2.975 2.93h-14.077l-2.976-2.93c-.23-.208-.162-.39.16-.39h19.708Zm-10.987-5.631-3.387 3.366h-2.244l-3.387-3.366V3.673l.411-.39L183.47.694c.229-.225.389-.16.389.16v10.99h2.244V3.97l3.364-3.386h8.195l2.975 2.975c.231.229.138.411-.16.411H189.49v7.876Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-14' fill='%23120404' d='M223.312 3.673V15.21h-3.366V.857c0-.322.162-.388.39-.162l2.976 2.978Zm-9.02 5.908h3.389V6.19h-3.39v3.39Zm-5.629 0h3.387V6.19h-3.387v3.39Zm14.375 7.895c.297 0 .365.185.16.391l-2.976 2.93h-14.08l-2.975-2.93c-.228-.206-.16-.391.16-.391h19.71Zm-5.357-2.265h-11.262l-3.39-3.363v-7.9L206.42.56h11.262v3.387h-11.262v7.9h11.262v3.364Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-15' fill='%23120404' d='M242.505 20.797h3.367v-3.32h-3.367v3.32Zm-16.913 0h3.387v-3.32h-3.387v3.32Zm11.285-3.32v-2.265l3.364-3.366h5.63v3.386h-5.63v2.245l-3.364 3.32h-2.267l-3.39-3.32v-2.265h-5.63v-3.366h5.676l3.344 3.366v2.265h2.267ZM242.507.56l3.365 3.364V9.58h-3.364V3.948h-2.267v2.267l-3.364 3.366h-2.267l-3.39-3.366V3.948h-2.241V9.58h-3.39V3.948L228.98.56h2.242l3.389 3.387v2.244h2.267V3.925L240.24.56h2.267Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-16' fill='%23120404' d='M268.433 3.673V15.21h-3.387V.857c0-.322.183-.388.411-.162l2.976 2.978Zm-5.631 13.803h5.356c.297 0 .366.185.16.391l-3 2.93h-2.516l-3.39-3.321V.56h3.39v16.916Zm-14.628.274V6.191h3.366v14.332c0 .297-.163.363-.391.16l-2.975-2.933Zm3.09-17.19h2.54l3.367 3.387v16.85h-3.367V3.947h-5.356c-.32 0-.366-.16-.16-.388L251.263.56Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-17' fill='%23120404' d='M287.629 3.948h3.366V.56h-3.366v3.387Zm-5.634.022h3.367V.584h-3.367V3.97Zm-5.653 11.242 3.389-3.366h2.264l3.367 3.366v5.585h-3.367v-5.585h-2.264v5.585h-3.39v-5.585Zm0-11.242h3.386V.584h-3.386V3.97Zm11.287 2.222 3.364 3.39v8.169l-2.976 2.93c-.228.205-.388.14-.388-.16V9.581h-13.53V20.52c0 .3-.16.366-.39.16l-2.998-2.93V9.582l3.389-3.39h13.529ZM270.71 3.97h3.389V.584h-3.39V3.97Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-18' fill='%23120404' d='M310.165 3.925h3.387V.535h-3.387v3.39Zm-2.242 13.529h5.355c.3 0 .368.182.16.388l-2.976 2.955h-2.539v-.117.092l-3.389-3.341v-2.267l3.39-3.364h2.241V6.146h3.387V11.8l-3.387 3.364h-2.242v2.29Zm-3.389-7.896V3.925h-2.244v5.633h-3.387v-5.61L302.29.56V.536h2.267v.048l3.366 3.364v5.61h-3.389ZM296.66 11.8h2.244l3.387 3.387v2.267l-3.387 3.343v-.025h-2.518l-1.696-1.648-1.28-1.305c-.205-.228-.162-.388.16-.388h5.334v-2.244h-2.244l-3.387-3.387V6.169h3.387v5.63Zm-3.387-7.852h3.387V.56h-3.387v3.387Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-19' fill='%23120404' d='M332.747 3.948h3.367V.56h-3.367v3.387Zm-5.63.022h3.366V.584h-3.367V3.97Zm-5.654 11.242 3.389-3.366h2.264l3.367 3.366v5.585h-3.367v-5.585h-2.264v5.585h-3.39v-5.585Zm0-11.242h3.386V.584h-3.386V3.97Zm11.284 2.222 3.367 3.39v8.169l-2.976 2.93c-.228.205-.39.14-.39-.16V9.581H319.22V20.52c0 .3-.163.366-.391.16l-2.998-2.93V9.582l3.389-3.39h13.526ZM315.832 3.97h3.386V.584h-3.386V3.97Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-20' fill='%23120404' d='M353.043.56v3.364h-9.02V.535l9.02.025Zm5.356 16.893c.297 0 .366.183.16.389l-2.975 2.955-14.08-.023-2.975-2.932c-.229-.206-.16-.389.16-.389h19.71Zm.275-13.803v8.172l-3.367 3.39h-2.264l-3.367-3.39V9.558h-2.264v2.264l-3.39 3.364h-2.241l-3.39-3.364V3.65L341.39.675c.205-.206.39-.14.39.16v10.987h2.243V9.558l3.389-3.367h2.264l3.367 3.367v2.264h2.264V.835c0-.3.186-.366.391-.16l2.976 2.975Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-21' fill='%23120404' d='M381.234 3.673V15.21h-3.387V.857c0-.322.183-.388.412-.162l2.975 2.978Zm-5.63 13.803h5.356c.297 0 .365.185.16.391l-3.001 2.93h-2.516l-3.39-3.321V.56h3.39v16.916Zm-14.63.274V6.191h3.367v14.332c0 .297-.162.363-.39.16l-2.976-2.933Zm3.09-17.19h2.542l3.366 3.387v16.85h-3.366V3.947h-5.357c-.32 0-.365-.16-.16-.388L364.065.56Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-22' fill='%23120404' d='m400.429.56 3.366 3.387v13.529l-3.366 3.32h-5.631v-3.32h5.63V3.947h-5.63V.56h5.63Zm-11.285 14.651h9.02v-3.363h-9.02v3.363Zm0-5.63h9.02V6.214h-9.02v3.367ZM386.9 3.947v13.529h5.63v3.32h-5.63l-3.387-3.32V3.947L386.9.56h5.63v3.387h-5.63Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-23' fill='%23120404' d='M417.358 9.581h3.367v-3.39h-3.367v3.39Zm5.631-9.02 3.367 3.387v13.529l-3.367 3.32H409.46l-3.386-3.32V3.673l2.998-2.978c.228-.203.388-.16.388.16v16.622h13.53V3.947h-7.899v7.899h5.634v3.366h-5.634l-3.387-3.366V3.948L415.091.56h7.898Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-24' fill='%23120404' d='M443.284.56v3.364h-9.02V.535l9.02.025Zm5.357 16.893c.297 0 .365.183.16.389l-2.976 2.955-14.08-.023-2.975-2.932c-.229-.206-.16-.389.16-.389h19.71Zm.274-13.803v8.172l-3.367 3.39h-2.264l-3.367-3.39V9.558h-2.264v2.264l-3.39 3.364h-2.241l-3.39-3.364V3.65l2.999-2.975c.206-.206.391-.14.391.16v10.987h2.242V9.558l3.389-3.367h2.264l3.367 3.367v2.264h2.264V.835c0-.3.186-.366.391-.16l2.976 2.975Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-25' fill='%23120404' d='M460.212 6.213h-.023l-3.364 3.367h-5.63V6.19h5.63V3.97h-5.333c-.323 0-.391-.184-.163-.412l2.978-2.975h2.518l3.387 3.386v2.244Zm10.874-2.93.388.39v13.802l-3.364 3.32h-13.529l-3.386-3.32v-2.264l3.386-3.364h7.898V.583h3.364v11.264l-3.364 3.364h-7.898v2.264h13.53V.857c0-.32.16-.389.388-.16l2.587 2.587Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-26' fill='%23120404' d='M485.038 9.581h3.367v-3.39h-3.367v3.39Zm5.631-9.02 3.367 3.387v13.529l-3.367 3.32H477.14l-3.386-3.32V3.673l2.998-2.978c.229-.203.388-.16.388.16v16.622h13.53V3.947h-7.899v7.899h5.634v3.366h-5.634l-3.386-3.366V3.948L482.77.56h7.898Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-27' fill='%23120404' d='M513.23 11.822h3.367v5.63l-3.367 3.344h-2.267l-3.364-3.343V9.512h-2.267v7.94l-3.386 3.344H499.7l-3.386-3.343v-5.631h3.386v5.63h2.245v-7.94l3.386-3.39h2.313l3.318 3.39v7.94h2.267v-5.63ZM499.701.535h13.53l3.366 3.389v5.633h-3.367V3.924h-13.529v5.633h-3.386V3.924L499.7.534Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-28' fill='%23120404' d='M535.768 3.925h3.386V.535h-3.386v3.39Zm-2.242 13.529h5.354c.3 0 .368.182.16.388l-2.975 2.955h-2.54v-.117.092l-3.388-3.341v-2.267l3.389-3.364h2.242V6.146h3.389V11.8l-3.39 3.364h-2.241v2.29Zm-3.39-7.896V3.925h-2.244v5.633h-3.386v-5.61L527.892.56V.536h2.267v.048l3.367 3.364v5.61h-3.39Zm-7.875 2.242h2.245l3.386 3.387v2.267l-3.386 3.343v-.025h-2.519l-1.693-1.648-1.282-1.305c-.206-.228-.16-.388.16-.388h5.334v-2.244h-2.245l-3.386-3.387V6.169h3.386v5.63Zm-3.386-7.852h3.386V.56h-3.386v3.387Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-29' fill='%23120404' d='M552.719 15.212h8.997v-3.364h-8.997v3.364Zm0-5.63h8.997v-3.39h-8.997v3.39Zm8.723 7.895c.297 0 .365.182.16.39l-2.976 2.93h-14.08l-2.975-2.93c-.228-.208-.16-.39.16-.39h19.71Zm-10.988-5.631-3.39 3.366h-2.24l-3.39-3.366V3.673l.411-.39 2.587-2.588c.229-.225.391-.16.391.16v10.99h2.242V3.97L550.43.584h8.195l2.976 2.975c.228.229.137.411-.16.411h-10.988v7.876Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-30' fill='%23120404' d='M584.276 3.673V15.21h-3.366V.857c0-.322.163-.388.391-.162l2.975 2.978Zm-9.02 5.908h3.39V6.19h-3.39v3.39Zm-5.628 0h3.387V6.19h-3.387v3.39Zm14.374 7.895c.297 0 .366.185.16.391l-2.975 2.93h-14.08l-2.975-2.93c-.229-.206-.16-.391.16-.391h19.71Zm-5.356-2.265h-11.262l-3.39-3.363v-7.9l3.39-3.388h11.262v3.387h-11.262v7.9h11.262v3.364Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-31' fill='%23120404' d='M603.47 20.797h3.367v-3.32h-3.366v3.32Zm-16.915 0h3.387v-3.32h-3.387v3.32Zm11.285-3.32v-2.265l3.366-3.366h5.63v3.386h-5.63v2.245l-3.366 3.32h-2.267l-3.387-3.32v-2.265h-5.631v-3.366h5.677l3.34 3.366v2.265h2.268ZM603.47.56l3.367 3.364V9.58h-3.366V3.948h-2.265v2.267L597.84 9.58h-2.267l-3.387-3.366V3.948h-2.244V9.58h-3.387V3.948L589.942.56h2.244l3.387 3.387v2.244h2.267V3.925L601.206.56h2.265Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-32' fill='%23120404' d='M629.397 3.673V15.21h-3.387V.857c0-.322.183-.388.412-.162l2.975 2.978Zm-5.63 13.803h5.356c.297 0 .366.185.16.391l-3 2.93h-2.517l-3.389-3.321V.56h3.39v16.916Zm-14.629.274V6.191h3.366v14.332c0 .297-.162.363-.39.16l-2.976-2.933Zm3.09-17.19h2.54l3.367 3.387v16.85h-3.366V3.947h-5.357c-.32 0-.365-.16-.16-.388L612.228.56Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-33' fill='%23120404' d='M648.592 3.948h3.366V.56h-3.366v3.387Zm-5.631.022h3.366V.584h-3.366V3.97Zm-5.654 11.242 3.387-3.366h2.267l3.366 3.366v5.585h-3.366v-5.585h-2.267v5.585h-3.387v-5.585Zm0-11.242h3.39V.584h-3.39V3.97Zm11.285 2.222 3.366 3.39v8.169l-2.976 2.93c-.23.205-.39.14-.39-.16V9.581h-13.53V20.52c0 .3-.16.366-.388.16l-2.998-2.93V9.582l3.387-3.39h13.529ZM631.676 3.97h3.387V.584h-3.387V3.97Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-34' fill='%23120404' d='M671.13 3.925h3.387V.535h-3.387v3.39Zm-2.244 13.529h5.357c.297 0 .366.182.16.388l-2.976 2.955h-2.54v-.117.092l-3.39-3.341v-2.267l3.39-3.364h2.243V6.146h3.387V11.8l-3.387 3.364h-2.244v2.29Zm-3.389-7.896V3.925h-2.242v5.633h-3.389v-5.61l3.39-3.387V.536h2.266v.048l3.364 3.364v5.61h-3.389Zm-7.873 2.242h2.242l3.39 3.387v2.267l-3.39 3.343v-.025h-2.518l-1.694-1.648-1.282-1.305c-.205-.228-.16-.388.16-.388h5.334v-2.244h-2.242l-3.389-3.387V6.169h3.39v5.63Zm-3.389-7.852h3.39V.56h-3.39v3.387Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-35' fill='%23120404' d='M693.713 3.948h3.366V.56h-3.366v3.387Zm-5.631.022h3.366V.584h-3.366V3.97Zm-5.654 11.242 3.386-3.366h2.268l3.366 3.366v5.585h-3.366v-5.585h-2.268v5.585h-3.386v-5.585Zm0-11.242h3.386V.584h-3.386V3.97Zm11.285 2.222 3.366 3.39v8.169l-2.978 2.93c-.229.205-.388.14-.388-.16V9.581h-13.53V20.52c0 .3-.16.366-.388.16l-2.998-2.93V9.582l3.387-3.39h13.529ZM676.797 3.97h3.387V.584h-3.387V3.97Z' mask='url(%23mask-2)'/%3E%3Cpath id='Fill-36' fill='%23120404' d='M714.007.56v3.364h-9.02V.535l9.02.025Zm5.357 16.893c.297 0 .365.183.16.389l-2.976 2.955-14.08-.023-2.975-2.932c-.228-.206-.16-.389.16-.389h19.71Zm.274-13.803v8.172l-3.366 3.39h-2.265l-3.366-3.39V9.558h-2.265v2.264l-3.389 3.364h-2.242l-3.389-3.364V3.65l2.998-2.975c.206-.206.391-.14.391.16v10.987h2.242V9.558l3.39-3.367h2.264l3.366 3.367v2.264h2.265V.835c0-.3.185-.366.39-.16l2.976 2.975Z' mask='url(%23mask-2)'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>