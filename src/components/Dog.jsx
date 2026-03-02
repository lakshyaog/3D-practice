import React from 'react'
import { OrbitControls } from '@react-three/drei'

/**
 * Dog — Development utility component that provides orbit controls
 * for free-camera scene exploration. Remove from production build.
 *
 * Tip: Increase dampingFactor for snappier control, decrease for silkier inertia.
 */
const Dog = () => {
    return (
        <>
            <OrbitControls
                enableDamping
                dampingFactor={0.07}
                minDistance={3}
                maxDistance={30}
            />
        </>
    )
}

export default Dog
