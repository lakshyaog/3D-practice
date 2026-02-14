import React from 'react'
import { Canvas, useThree} from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

const Dog = () => {


    useThree(({camera, scene, gl}) => {
        console.log(camera.position)
    })


    return (
        <>   


        <OrbitControls />
        
        
        </>

    
  )
}

export default Dog
