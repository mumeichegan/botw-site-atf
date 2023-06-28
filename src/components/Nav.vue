<script setup>
import imgPattern from '@assets/pattern.jpg'

import { ref, onMounted } from 'vue'

let PIXI = null
let gsap = null

let pixiApp = null

const screenBreakPoint = 640

const isCanvasInitialized = ref(false)

const nav = ref(null)
const navList = ref(null)
const canvas = ref(null)
const topmostBar = ref(null)

const canvasTop = ref(0)
const canvasWidth = ref(null)
const canvasHeight = ref(null)

const pointInterval = 17.5
const pointCount = 4
const filledAreaHeight = 21

let groupedStopPoints = null
let groupedStopPointsInitialState = [...Array(pointCount)]
  .map(_ => [])

const loadedImgPattern = ref(null)

const currentScreenSize = ref(window.innerWidth < screenBreakPoint ? 'small' : 'notSmall')

onMounted(async () => {
    const patternImage = new Image()
    patternImage.addEventListener('load', function() {
        loadedImgPattern.value = `url(${this.src})`
    })
    patternImage.src = imgPattern

    ;[PIXI, { gsap }] = await Promise.all([
        import('pixi.js'),
        import('gsap')
    ])
    
    initCanvas()

    let currentAnimIndex = 0
    let previousAnimIndex = navList.value.children.length - 1
    setInterval(() => {
        if (currentAnimIndex === navList.value.children.length) {
            currentAnimIndex = 0
        }
        
        if (previousAnimIndex === navList.value.children.length) {
            previousAnimIndex = 0
        }
            
        const event = {
            currentTarget: {
                dataset: {
                    index: null
                }
            }
        }
        event.currentTarget.dataset.index = previousAnimIndex
        handleMouseLeave(event)
        event.currentTarget.dataset.index = currentAnimIndex
        handleMouseEnter(event)
        
        currentAnimIndex++
        previousAnimIndex++
            
    }, 1000)
})

window.addEventListener('resize', () => {
    currentScreenSize.value = window.innerWidth < screenBreakPoint ? 'small' : 'notSmall'
    if (!PIXI) {
        return
    }
    pixiApp.stage.removeChildren()
    pixiApp.ticker.destroy()
    canvasWidth.value = null
    canvasHeight.value = null
    pixiApp = null
    initCanvas()
})

function initCanvas() {
    const navListItemBounds = navList.value.children[0]
        .getBoundingClientRect()
    
    const canvasHalfHeight = (nav.value.offsetHeight 
        - (navListItemBounds.top + navListItemBounds.height - topmostBar.value.offsetHeight))
        * 2
    
    groupedStopPoints = [...navList.value.children]
        .map((listItem, index) => {
            const listItemBounds = listItem.getBoundingClientRect() 
            const startX = listItemBounds.left
                + (listItemBounds.width - (pointCount - 1) * pointInterval) * .5
            let group0 = [], 
                group1 = []
            for (let i = 0; i < pointCount; i++) {
                group0.push({
                    x: startX + pointInterval * i,
                    y: filledAreaHeight,
                    radius: 0
                })
                group1.push({
                    x: startX + pointInterval * i,
                    y: filledAreaHeight,
                    radius: 0
                })
            }
            groupedStopPointsInitialState[index] = group1
            return group0
        })

    canvasTop.value = navListItemBounds.top
        + navListItemBounds.height 
        - topmostBar.value.offsetHeight
        + canvasHalfHeight * .5
    
    canvasWidth.value = window.innerWidth
    canvasHeight.value = canvasHalfHeight * 2

    pixiApp = new PIXI.Application({
        resolution: Math.min(window.devicePixelRatio, 2),
        width: canvasWidth.value,
        height: canvasHeight.value,
        view: canvas.value,
        antialias: true,
        backgroundAlpha: 0
    })

    const graphics = new PIXI.Graphics()

    pixiApp.ticker.add(_ => {
        graphics.clear()

        // draw filled area
        graphics.beginFill('#000')
        graphics.moveTo(0, 0)
        graphics.lineTo(0, filledAreaHeight)
        
        for (let i = 0; i < groupedStopPoints.length; i++) {
            for (let j = 0; j < pointCount; j++) {
            const { x , y } = groupedStopPoints[i][j]
                // draw stop points
                graphics.lineTo(x, y)
            }
        }
    
        graphics.lineTo(window.innerWidth, filledAreaHeight)
        graphics.lineTo(window.innerWidth, 0)
        graphics.closePath()
        graphics.endFill()

        // draw line
        graphics.lineStyle(2, '#B99F65')
        graphics.moveTo(0, filledAreaHeight)
        for (let i = 0; i < groupedStopPoints.length; i++) {
            for (let j = 0; j < pointCount; j++) {
            const { x , y } = groupedStopPoints[i][j]
                // draw stop points
                graphics.lineTo(x, y)
            }
        }
        graphics.lineTo(window.innerWidth, filledAreaHeight)
        // draw points
        for (let i = 0; i < groupedStopPoints.length; i++) {
            for (let j = 0; j < pointCount; j++) {
                const { x , y, radius } = groupedStopPoints[i][j]
                // draw circles on stop points
                graphics.beginFill('#000')
                graphics.lineStyle(2.5, '#B99F65')
                graphics.drawCircle(x, y, radius)
                graphics.endFill()
            }
        }
        pixiApp.stage.addChild(graphics)
    })
}

function handleMouseEnter(event) {
    if (!isCanvasInitialized.value) {
        isCanvasInitialized.value = true
    }

    const groupIndex = event.currentTarget.dataset.index

    const y0 = (2.5 + Math.random() * 10) * (Math.random() > .5 ? 1 : -1)
    const y1 = - y0

    groupedStopPoints[groupIndex].forEach((stopPoint, index) => {
        if (index === 1) {
            gsap.to(stopPoint, {
            y: '+=' + y0,
            x: '+=random(-5, 3, .5)',
            duration: .5
            })
        }
        else if (index === 2) {
            gsap.to(stopPoint, {
                y: '+=' + y1,
                x: '+=random(-5, 3, .5)',
                duration: .5
            })
        }
        gsap.to(stopPoint, {
            radius: 'random(2.75, 5, .1)',
            duration: .5
        })
    })
}

function handleMouseLeave(event) {
    const groupIndex = event.currentTarget.dataset.index
    groupedStopPoints[groupIndex].forEach((stopPoint, index) => {
        gsap.to(stopPoint, {
            x: groupedStopPointsInitialState[groupIndex][index].x,
            y: groupedStopPointsInitialState[groupIndex][index].y,
            radius: groupedStopPointsInitialState[groupIndex][index].radius,
            duration: .5
        })
    })
}

const links = [
    'commodo',
    'dolor',
    'proident',
    'deserunt'
]
</script>

<template>
    
    <header>
        <aside 
            ref="topmostBar"
            text="center" 
            p-y="3" 
            border="b-solid b-2 primary"
            bg="#000"
            relative
            :class="$style.r0_r0">
            <span
                color="#fff" 
                relative
                :class="$style.r0_r0_r0">laborum magna</span>
        </aside>
        <nav
            relative
            ref="nav"
            :class="[
                $style.r0_r1,
                currentScreenSize === 'small' ? $style['r0_r1--a'] : null
            ]">
            <ul 
                ref="navList"
                relative
                z="5"
                bg="center"
                flex="~ justify-center"
                :style="{ backgroundImage: loadedImgPattern }"
                :class="{ 
                    [$style.r0_r1_r0]: true,
                    [$style['r0_r1_r0--a']]: !isCanvasInitialized
                }">
                <li 
                    z="25"
                    mt="8" 
                    mb="4"
                    sm:mx="4"
                    mx="2"
                    @mouseenter="handleMouseEnter($event)"
                    @mouseleave="handleMouseLeave($event)"
                    :data-index="index"
                    v-for="(link, index) of links">
                    <a 
                        color="#fff"
                        href="#"
                        @click.prevent>{{ link }}</a>
                </li>
            </ul>
            
            <div
                w="100%"
                h="100%"
                top="0"
                left="0"
                z="1"
                absolute
                class="i"></div>
            
            <div
                absolute
                left="0"
                z="10"
                :style="{
                    top: `${canvasTop}px`,
                    width: '100%', 
                    height: `${canvasHeight}px` 
                }">
                <canvas
                    style="width: 100%; height: 100%"
                    top="0"
                    left="0"
                    absolute
                    ref="canvas">
                </canvas>    
            </div>
        </nav>
    </header>

</template>

<style module>
.r0_r0_r0::before,
.r0_r0_r0::after {
    content: '';
    position: absolute;
    width: 23px;
    height: 6px;
    top: 50%;
    transform: translateY(-50%);
    background-repeat: no-repeat;
    background-size: contain;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='23' height='6'%3E%3Cg id='Phase-2' fill='none' fill-rule='evenodd' stroke='none' stroke-width='1'%3E%3Cg id='Pages/1-Homepage-Day' fill='%23B99F65' transform='translate(-618 -94)'%3E%3Cpath id='Divider-M-Copy-3' d='M622.804 96.035 620.494 94l-2.492 2.197-.002 1.467 2.494 2.2 2.31-2.035 2.093 2.035 15.463-2.813v-.238L624.897 94z' transform='rotate(-180 629.18 96.932)'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
.r0_r0_r0::before {
    right: 105%;
}
.r0_r0_r0::after {
    left: 105%;
    transform: translateY(-50%) scaleX(-1);
}
.r0_r0::before,
.r0_r0::after {
    position: absolute;
    width: 20%;
    height: 20px;
    bottom: -2px;
    content: '';
    background: linear-gradient(to right, black 0%, rgba(0, 0, 0, 0.5) 80%, transparent 100%);
}
.r0_r0::before {
    left: 0;
} 
.r0_r0::after {
    right: 0;
    transform: scaleX(-1);
}
.r0_r1_r0::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: linear-gradient(to top, black 0%, rgba(0, 0, 0, 0.5) 10%, transparent 50%);
}
.r0_r1_r0--a::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 21px;
    top: 100%;
    left: 0;
    background: #000;
}
.r0_r1::before,
.r0_r1::after {
    content: '';
    position: absolute;
    top: calc(100% + (2 / 2) * 1px);
    width: 20%;
    height: 21px;
    background: linear-gradient(to right, black 0%, rgba(0, 0, 0, 0.5) 80%, transparent 100%);
    z-index: 20;
}
.r0_r1::before {
    left: 0;
}
.r0_r1::after {
    right: 0;
    transform: scaleX(-1)
}

.r0_r1--a::before,
.r0_r1--a::after {
    display: none;
}
</style>