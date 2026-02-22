import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

const BmwModel = (props) => {
    const { scene } = useGLTF('/bmw_m4.glb')

    return (
        <primitive
            object={scene}
            {...props}
        />
    )
}

useGLTF.preload('/bmw_m4.glb')

export default BmwModel
