import React from 'react'
import Navbar from './navbar'


export default props => (
    <header className='main-header'>
        <a href='/#/' className='logo'>
            <span className='logo-mini'>
                <img src="./logo.png" alt="Votação gladius" width="35" height="35"></img>
            </span>
            <span className='logo-lg'>
                <img src="./logo.png" alt="Votação gladius" width="35" height="35"></img>
                <font style={({ marginLeft: '0.8rem' })}>Votação gladius</font>
            </span>        
        </a>
        <nav className='navbar navbar-static-top'>
            <a href className='sidebar-toggle' data-toggle='offcanvas'></a>
            <Navbar />
        </nav>
    </header>
)