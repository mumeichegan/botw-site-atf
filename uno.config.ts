import { 
    defineConfig, 
    presetUno,
    presetAttributify
} from 'unocss'



export default defineConfig({
    presets: [
        presetAttributify(), 
        presetUno()
    ],
    theme: {
        colors: {
            'primary': '#B99F65',
        }
    }
})