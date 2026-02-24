import React, { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'

/**
 * BmwModel - Renders the BMW M4 Competition 3D model
 * @param {object} props - Standard Three.js mesh props (position, scale, rotation, etc.)
 */
const BmwModel = (props) => {
    const { scene } = useGLTF('/bmw_m4.glb')
    const modelRef = useRef()

    // Enable shadow casting on all meshes
    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }, [scene])

    return (
        <primitive
            ref={modelRef}
            object={scene}
            {...props}
        />
    )
}

useGLTF.preload('/bmw_m4.glb')

export default BmwModel
