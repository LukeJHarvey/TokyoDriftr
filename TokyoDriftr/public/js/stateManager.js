/* TokyoDriftr/public/stateManager.js 

stateManager keeps track of the current state and volume controls
stateManager also handles the transition between states

The constructor sets up all variables that are used in each state and also handles starting the music for each state.
*/
import { GUI } from 'https://unpkg.com/three/examples/jsm/libs/dat.gui.module.js';
export class stateManager {
    constructor(renderer, scene) {
        this.currentState = null;
        this.renderer = renderer
        this.scene = scene
        this.fadeOut = null
        this.ready = false


        //Setup GUI with both volume control and mute control
        {
            this.gui = new GUI()
            this.soundControls = new function() {
                this.volume = .7;
                this.muted = false;
            }
            var soundgui = this.gui.add(this.soundControls, 'volume', 0, 1, .05)
            soundgui.onChange(() => {
                if(this.currentState != null && !this.soundControls.muted)
                    this.currentState.changeVolume(this.soundControls.volume)
            })
            var mutedgui = this.gui.add(this.soundControls, 'muted')
            mutedgui.onChange(() => {
                if(this.currentState != null)
                    this.currentState.changeVolume(this.soundControls.muted ? 0:this.soundControls.volume)
            })
            this.gui.open()
        }
    }
    //Takes a new state as a parameter
    //Leaves the currentState
    //After Leaving currentState Enters the new state.
    setState(newState) {
        this.ready =false
        if(typeof this.currentState == 'undefined' || this.currentState == null){
            this.currentState = newState;
            newState.Entered()
            this.ready = true
        }
        else {
            this.currentState.Leaving().then(() => {
                this.currentState = newState
                newState.Entered().then(()=>{

                    this.ready = true
                })
            })
        }
    }
    //returns the currentState
    getState() {
        return this.currentState;
    }
    //draw() Renders the current scene and then calls the currentStates update
    //draw() Keeps track of ticks for animations and timings
    draw() {
        //if the state is fully loaded then render otherwise do nothing
        if (!this.ready) return
        
        //render() renders the current scene and calls the currentStates update
        let render = () => {
            this.currentState.renderer.render(this.currentState.scene, this.currentState.objects["camera"]);
            this.currentState.Update()
            if(this.fadeOut != null) {
                if(this.fadeOutMusic(this.fadeOut) <= 0) {
                    this.fadeOut.stop()
                    this.fadeOut = null
                }
            }
        };
        setTimeout(() =>{
            tick();
        }, 200)
        
        var oldTime = Date.now();
        var tick = function() {
            var dframe = getFramesPassed();
            render()
            requestAnimationFrame(tick);
        }
    
        //Runs at 60 fps, returns how many frames passed since the last tick
        function getFramesPassed() {
            var now = Date.now();
            var dframe = Math.floor((now - oldTime)*3/50)
            if (dframe > 0) oldTime = Date.now();
            return dframe;
        }
    }
    //Fades the music to 0, used to fade out previous states music.
    fadeOutMusic(sound) {
        if(!this.muted){
            var num = sound.getVolume()
            num -= .01
            sound.setVolume(num)
            return num;
        }
    }
    

}