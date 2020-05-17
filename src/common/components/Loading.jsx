import React from 'react';
import ReactLoading from 'react-loading';
 
const Loading = ({ color }) => (
    <ReactLoading type='spinningBubbles' color={color} height={'20%'} width={'20%'} />
);
 
export default Loading;