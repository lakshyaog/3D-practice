import React from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

/**
 * Dog - Debug / utility component with orbit controls
 * Used for 3D scene exploration during development
 */
const Dog = () => {
    useThree(({ camera }) => {
        // Camera debug helper — uncomment to log position
        // console.log('Camera position:', camera.position)
    })

    return (
        <>
            <OrbitControls enableDamping dampingFactor={0.05} />
        </>
    )
}

export default Dog
