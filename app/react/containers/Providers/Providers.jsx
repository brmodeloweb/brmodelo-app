import React from 'react'
import PropTypes from 'prop-types'

const Providers = ({ children }) => {
    return (
        <>
            <span>CHILDREN</span>
           {children} 
        </>
    )
}

Providers.propTypes = { 
    children: PropTypes.element.isRequired
}

export default Providers
