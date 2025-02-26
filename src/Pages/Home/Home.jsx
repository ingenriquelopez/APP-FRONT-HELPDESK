import React from 'react';
import NavBarHD   from '../../Components/NavBarHD/NavBarHD';
import Footer     from '../../Components/Footer/Footer';
import TaskViewer from '../../Components/TaskViewer/TaskViewer';
import { Outlet } from 'react-router-dom';


function Home() {
  return (
    <div className = "container">
      <NavBarHD buttonEnabled={false} />  
      <TaskViewer/>   
      <Footer/> 
      <Outlet/>
    </div>    
    )
}

export default Home