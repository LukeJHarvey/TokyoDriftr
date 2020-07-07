import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three/examples/jsm/loaders/GLTFLoader.js';
import {keyboardControls} from '/js/controller.js'
import * as CARS from '/js/cars.js'
import * as GAME_CONTROL from '/js/game_control.js'
import { stateManager } from '/js/stateManager.js'
import { gameState } from '/js/gameState.js'
import { playGameState } from '/js/playGameState.js';

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return minutes+':'+seconds;
}


export class endScreenGameState extends gameState{
    constructor(renderer,scene,manager,data) {
        super(manager)

        this.objects = {}
        this.camcontrols
        this.renderer = renderer
        this.canvas = this.renderer.domElement
        this.scene = scene
        this.keyControls=new keyboardControls()
        this.changing = false
        this.playerTime = data.time/1000
    }
    async Entered() {
        this.objects["camera"] = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
        this.objects["camera"].position.z = 5;

				this.objects['light'] = new THREE.SpotLight( 0xFFFFFF,1 );
				this.objects['light'].position.set(100,100,100)
				this.scene.add(this.objects['light'])


        this.objects['mesh'] = new THREE.Mesh( new THREE.Geometry(), new THREE.MeshPhongMaterial( { color: 0x00fffc } ));
        this.scene.add( this.objects['mesh']  );

        var newtime = {time: this.playerTime, course: 3, name:"Name"}
        console.log(JSON.stringify(newtime))
        await fetch('http://localhost:8080/newtime', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(newtime)
        });

        var times = await fetch('http://localhost:8080/alltimes/3', {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            return data;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
        if(typeof times != 'undefined' && times instanceof Array){
            var best = 99999
            var i = 0
        }
        else {
            var best = this.playerTime>times[0].time ? times[0].time:this.playerTime

            var t = times[0].time
            var i = 0
            while(this.playerTime>t) {
                t = times[i].time
                i++
            }
        }

        var data = {
            text : "You Finished!\nYour Time: "+this.playerTime.toString().toHHMMSS()+"\nBest Time: "+best.toString().toHHMMSS()+"\nYou're in "+(i+1)+" place",
            size : .5,
            height : 0.1,
            curveSegments : 10,
            font : "helvetiker",
            weight : "Regular",
            bevelEnabled : false,
            bevelThickness : .5,
            bevelSize : 0.2,
            bevelSegments: 10,
        };

        var fonts = [
            "Black",
        ];


        this.controller = () => {
            this.textColor = this.objects['mesh'].material.color.getHex();
           
        }

            var loader = new THREE.FontLoader();
       
            loader.load( 'https://threejs.org//examples/fonts/helvetiker_regular.typeface.json',  ( font ) => {
                
                var geometry = new THREE.TextGeometry( data.text, {
                    font: font,
                    size: data.size,
                    height: data.height,
                    curveSegments: data.curveSegments,
                    bevelEnabled: data.bevelEnabled,
                    bevelThickness: data.bevelThickness,
                    bevelSize: data.bevelSize,
                    bevelSegments: data.bevelSegments
                } );

                geometry.computeBoundingBox()
                console.log(geometry.boundingBox)
                geometry.center();
                this.objects['mesh'].geometry.dispose();
                this.objects['mesh'].geometry = geometry;
                this.objects['mesh'].position.set(0,0,0)
                //var box = new THREE.BoxHelper( this.objects['mesh'], 0xff0000 );
                
                //this.scene.add( box );
            })
        /*var gui = new dat.GUI();
        var folder = gui.addFolder( 'Text' );
            folder.add( data, 'text' ).onChange( generateGeometry );
            folder.add( data, 'size', 1, 30 ).onChange( generateGeometry );
            folder.add( data, 'height', 0, 20 ).onChange( generateGeometry );
            folder.addColor( controller, 'textColor').onChange( function() { valuer=mesh.material.color.set(controller.textColor);
              
            });*/

        this.Draw()
    }
    Draw() {
        this.manager.draw()
    }
    //Update() watches for any keystrokes and updates any moving objects
    Update() {
        //this.camcontrols.update()
        if(this.keyControls.one && !this.changing) {
            this.manager.setState(new playGameState(this.renderer, this.scene, this.manager))
            this.changing = true
        }
    }
    //Leaving() clears all objects, gemoetry, and materials on the scene when changing to another scene
    //Leaving() is async so that when objects are being deleted it doesn't start deleting objects in the new scene
    async Leaving() {
        function clearThree(obj){
            while(obj.children.length > 0){ 
            clearThree(obj.children[0])
            obj.remove(obj.children[0]);
            }
            if(obj.geometry) obj.geometry.dispose()
        
            if(obj.material){ 
                //in case of map, bumpMap, normalMap, envMap ...
                Object.keys(obj.material).forEach(prop => {
                    if(!obj.material[prop])
                    return         
                    if(typeof obj.material[prop].dispose === 'function')                                  
                    obj.material[prop].dispose()                                                        
                })
                //obj.material.dispose()
            }
            return 1
        }   
        clearThree(this.scene)
    }
}