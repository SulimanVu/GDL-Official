import * as THREE from 'three'

import Experience from '../Experience.js'
import Camera from './Camera/Camera.js'
import Renderer from './Renderer.js'
import Models from './Models.js'
import EnvironmentMap from './EnvironmentMap.js'
import Lights from './Lights.js'

export default class Render
{
    static instance

    constructor(_options)
    {
        // Singleton
        if(Render.instance)
        {
            return Render.instance
        }
        Render.instance = this

        this.experience = Experience.instance
        this.resources = this.experience.resources

        this.scene = new THREE.Scene()
        this.camera = new Camera()
        this.renderer = new Renderer()

        this.resources.on('groupEnd', (_group) =>
        {
            if(_group.name === 'base')
            {
                this.models = new Models()
                this.environmentMap = new EnvironmentMap()
                this.lights = new Lights()
            }
        })
    }

    resize()
    {
        this.camera.resize()
        this.renderer.resize()
        
        if(this.models)
            this.models.resize()
    }

    update()
    {
        if(this.models)
            this.models.update()

        if(this.environmentMap)
            this.environmentMap.update()
                
        this.camera.update()
        this.renderer.update()
    }

    destroy()
    {
    }
}