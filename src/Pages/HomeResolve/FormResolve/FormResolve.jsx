import React, { useState, useEffect }        from 'react'
import { Container, Form, Row, Col, Button } from 'react-bootstrap'
import "react-datepicker/dist/react-datepicker.css";
import './FormResolve.css';
import { useLocalStorage } from '../../../js/useLocalStorage';

import { useNavigate }          from 'react-router-dom';

import NewService               from '../../../Components/Services/NewService/NewService';
import { ToastContainer }       from 'react-toastify';
import { tostada_S, tostada_W } from '../../../utils/Tostadas';

import moment from 'moment';
import DatePicker               from "react-datepicker";

import axios from 'axios'



function FormResolve( {propNumber}) {
   const navigate = useNavigate();
   const [modalShow, setModalShow] = useState(false);

   const [taskState        ,       settaskState]    = useState('');
   /* state para campos individuales que despues formaran el registro para el endpoint */
   const [newStatus        ,       setnewStatus]    = useState('Process');
   const [dateTaskRequired , setdateTaskRequired]   = useState('');
   const [newDateReview    ,   setnewDateReview]    = useState('');
   const [newNotes         ,        setnewNotes]    = useState('');
   const [newDateRejected  ,setnewDateRejected]     = useState('');
   const [newReason        ,        setnewReason]   = useState('');
   const [newSolution      ,     setnewSolution]    = useState('');
   const [newDateSolution  , setnewDateSolution]    = useState('');
   const [newOrderService  , setnewOrderService]    = useState('');
   const [disabledOS       ,      setdisabledOS]    = useState(false);
   const [disableCOMPLETED , setdisableCOMPLETED]   = useState(true);
   
   const [startDate        , setStartDate]          = useState('');
   const [isOpenDR         , setIsOpenDR]           = useState(false);
   const [isOpenDS         , setIsOpenDS]           = useState(false);
   const [isOpenDREJ       , setIsOpenDREJ]         = useState(false);

   const [userLogged    , setUserLogged]    = useLocalStorage('userLogged','');
   

   const {VITE_APP_API} = import.meta.env;
      
   //---------------MOSTRAR EL MODAL DE NewService.jsx ---------------------//
   const handleShowService       = () =>  setModalShow(true);   

    const findTaskOnDB = async() => {
      try {
         const statusTask = await axios.get(`${VITE_APP_API}/task/status/${propNumber}`, {
            headers: {
                "authorization": `Bearer ${userLogged.userToken}`,
            }
            }
         );
         if (statusTask) {
            settaskState(statusTask.data);
            setnewNotes(statusTask.data.notes);
            setnewReason(statusTask.data.reasonRejected);
            const orderService = statusTask.data.orderService;
            
            orderService  ? setdisabledOS(true): setdisabledOS(false);
            orderService  ? setnewOrderService(orderService)    : setnewOrderService('');
            if (statusTask.data.statusTask === 'Process' && !orderService) setdisableCOMPLETED(false);
            if (orderService) { // si hay una orden de servicio en la tabla de tareas de esta tarea encontrada en particular, busca el estado de esta orden
               try {
                  const statusService = await axios.get(`${VITE_APP_API}/services/number/${orderService}`, {
                     headers: {
                         "authorization": `Bearer ${userLogged.userToken}`,
                     }
                     });
                  if (statusService) {
                     console.log(statusService.data.serviceStatus)
                     if (statusService.data.serviceStatus === 'Done') {
                        setdisableCOMPLETED(false);
                     }
                  }
               } catch(error) {
                  console.log(error.message)
               }
               
            }

            let dt = new Date(statusTask.data.dateTask);
            dt.setTime(Date.parse(statusTask.data.dateTask));
            statusTask.data.dateTask ? setdateTaskRequired(dt) : setdateTaskRequired('');
            
            let dr = new Date(statusTask.data.dateReview);
            statusTask.data.dateReview ? setnewDateReview(dr) : setnewDateReview('');
            statusTask.data.dateReview ? setStartDate(dr): setStartDate(new Date());
                        
            let drej = new Date(statusTask.data.dateRejected);
            statusTask.data.dateRejected ? setnewDateRejected(drej) : setnewDateRejected('');
            
            let ds = new Date();
            ds.setTime(Date.parse(statusTask.data.dateSolution))
            statusTask.data.dateSolution ? setnewDateSolution(ds) : setnewDateSolution('');
            
            
            return(statusTask.data)
         }   
         return statusTask;
      } catch (error) {
         console.log(error.message);
      }
    }


    const saveStatusProcess = async()=> {
         const dataOfNewState= {
            number        : taskState.number,
            statusTask    : newStatus,
            dateReview    : newDateReview,
            notes         : newNotes,
            solution      : '',
            dateSolution  : null,
            reasonRejected: '',
            dateRejected  : null,
            orderService  : newOrderService,
         }
         
         try {
            const response = await axios.put(`${VITE_APP_API}/task/status`,dataOfNewState, {
               headers: {
                   "authorization": `Bearer ${userLogged.userToken}`,
               }
               });
            if (response) {
               tostada_S('Changing Status to PROCESS',"top-right",2500,'colored');
               setTimeout( ()=> { navigate('/home', { replace: true })},2500)              
            }
            
            navigate('/home');
            return response;

         } catch (error) {
            console.log(error.message);
         }
    }

    const saveStatusRejected = async()=> {
      const dataOfNewState= {
         number        : taskState.number,
         statusTask    : newStatus,
         dateRejected  : newDateRejected,
         reasonRejected: newReason,
         solution      : '',
         dateSolution: null,
      }
      try {
         const response = await axios.put(`${VITE_APP_API}/task/status`,dataOfNewState, {
            headers: {
                "authorization": `Bearer ${userLogged.userToken}`,
            }
            });
         tostada_S('Changing Status to PROCESS',"top-right",2500,'colored');
         setTimeout( ()=> { navigate('/home', { replace: true })},2500)              

         navigate('/home');
         return response;
      } catch (error) {
         console.log(error.message);
      }
 }

    const saveStatusCompleted = async()=> {
      let canContinue = false;
      if (!newOrderService) canContinue = true;
      else {
         let response = await axios.get(`${VITE_APP_API}/services/number/${newOrderService}`, {
            headers: {
                "authorization": `Bearer ${userLogged.userToken}`,
            }
            }
         );
         if (response.data.serviceStatus ==='Done')  canContinue = true;
         else canContinue = false;
      }
      
      if (canContinue) {
         const dataOfNewState= {
            number        : taskState.number,
            statusTask    : newStatus,
            solution      : newSolution,
            dateSolution  : newDateSolution,
         }
         try {
            const response = await axios.put(`${VITE_APP_API}/task/status`,dataOfNewState, {
               headers: {
                   "authorization": `Bearer ${userLogged.userToken}`,
               }
               });
            tostada_S('Changing Status to COMPLETED',"top-right",2500,'colored');
            setTimeout( ()=> { navigate('/home', { replace: true })},2500)              

            navigate('/home');
            return response;
         } catch (error) {
            console.log(error.message);
         }
      } else {
            tostada_W('Service not Done yet!',"top-center",2500,'dark');
            setTimeout( ()=> { navigate('/home', { replace: true })},2500)              
         } 
    }

    /*  ______________________H A N D L E R S __________________________ */
    const handleNewStatus = (e)=> {
      setnewStatus(e)
    }
    const handleNewNotes = (e)=> {
      setnewNotes(e.toUpperCase());
    }

    const handleNewReason = (e)=> {
      setnewReason(e)
    }

    const handleNewOrderService = (e)=> {
      setnewOrderService(e);
    }
    
    const handleCancel=()=> {
      navigate('/home');
    }

    const handleNewSolution = (e)=> {
      setnewSolution(e)
    }

    const handleFormResolve = (e) => {
      e.preventDefault();
      if (newStatus === 'Process')   saveStatusProcess();
      if (newStatus === 'Completed') saveStatusCompleted();
      if (newStatus === 'Rejected')  saveStatusRejected();
    }

    
    const thereAreDoc =async()=> {
      try 
         {
            const response = await axios.get(`${VITE_APP_API}/configServiceOrder`, {
               headers: {
                "authorization": `Bearer ${userLogged.userToken}`,
               }
            });

            if (response.data.length <= 0) setdisabledOS (true);   
         } catch (error) {
            console.log(error.message)
            }
   }


    const handleChangeDateReview   = (date) => {
      setIsOpenDR(!isOpenDR);
      setnewDateReview(date);
    };

    const handleClickDateReview    = (e) => {
      e.preventDefault();
      setIsOpenDR(!isOpenDR);
    }

    const handleClickDateRejected    = (e) => {
      e.preventDefault();
      setIsOpenDREJ(!isOpenDREJ);
    }
    const handleChangeDateRejected   = (date) => {
      setIsOpenDREJ(!isOpenDREJ);
      setnewDateRejected(date);
    };

    const handleChangeDateSolution  = (e) => {
      setIsOpenDS(!isOpenDS);
      setnewDateSolution(e);
    };

    const handleClickDateSolution  = (e)=> {
      e.preventDefault();
      setIsOpenDS(!isOpenDS);
    }



    useEffect( ()=> {
        findTaskOnDB();
        thereAreDoc();
    },[])

  return (
   <Container fluid id = "containerFormResolve" className = "d-flex flex-row">
      <div className ="dataOfRequest container-fluid align-content-center" id = "panelRequest">
      <Row className = "d-md-flex justify-content-center py-2">
            <Col xl = {4} lg = {4} md = {4} sm className = "text-center" >
               <Form.Label className ="text-center font-weight-bold" htmlFor='number'>NUMBER REQUEST</Form.Label>   
               <Form.Control 
                  disabled 
                  className    = "text-center" 
                  type         = "text" 
                  defaultValue = {taskState.number} 
               />
            </Col>
            <Col xl = {4} lg = {4} md = {4} sm className = "text-center" >
               <Form.Label className ="text-center font-weight-bold" htmlFor='number'>CURRENT STATUS</Form.Label>   
               <Form.Control 
                  disabled 
                  className    = "text-center" 
                  type         = "text" 
                  defaultValue = {taskState.statusTask} 
               />
            </Col>
         </Row>

         <Row className = "py-2">
               <Form.Label className = "text-center font-weight-bold">DATE</Form.Label>                
             
                   <Form.Label className = "text-center text-decoration-underline mb-3" > 
                     {moment(dateTaskRequired).format('dddd DD/MMMM/YYYY')}
                  </Form.Label> 
             
         </Row>
         <Row className = "d-md-flex justify-content-center py-2">
               <Form.Label className = "text-center font-weight-bold">GYG</Form.Label>                
               
                  <Form.Label className = "text-center text-decoration-underline mb-3">{taskState.gyg}</Form.Label>

         </Row>
         
         <Row className = "d-md-flex justify-content-center py-2">
               <Form.Label className = "text-center font-weight-bold mt-2"> DEVICE</Form.Label>
               <Form.Label className = "text-center text-decoration-underline mb-3">{taskState.device}</Form.Label>
         </Row>
         <Row className = "d-md-flex justify-content-center py-1">
               <Form.Label className = "text-center font-weight-bold mt-1"> PROBLEM</Form.Label>
               <Form.Control 
                  as    = "textarea"  
                  name  = "problem" 
                  disabled
                  defaultValue = {taskState.problem}
                  className = "text-center mb-3 "
               /> 
            
         </Row>
      </div>

      {/*-------------------------------*/}
      <div className ="dataOfSolution " id = "panelSolution">
         <Form onSubmit = { (e) => handleFormResolve(e)} id ="formSolution">
            <Row className = "d-md-flex justify-content-center py-2"> 
               <Col xl = {6}>
                  <Form.Label>Set New Status</Form.Label>
                  <Form.Select onChange = { (e)=> handleNewStatus(e.target.value)}>
                  <option value = "Process"  >Process</option>
                  <option value = "Completed">Completed</option>
                  <option value = "Rejected" >Rejected</option>
                  </Form.Select>
               </Col>
            </Row> 
            {
              newStatus ==='Process' 
              ? 
               <>
                 <Row className = "d-md-flex justify-content-center py-1">
                     <Col xl = {12} lg = {12} md = {12} sm className = "text-center">            
                       <Form.Label className = "text-center font-weight-bold mt-1">REVIEW DATE</Form.Label>
                    </Col>
                    <Col xl = {5} lg = {5} md = {5} sm className = "text-center">            
                       <Row className = "d-md-flex justify-content-center py-1">
                          <Col>
                             
                             <button className = {newDateReview ? "btn-info" : "btn-light"}
                                   onClick = { (e) => handleClickDateReview(e) } 
                                         > 
                                         {newDateReview ? moment(newDateReview).format("dddd DD/MMMM/YYYY"): 'Date...?' }
                             </button> 
                                         {isOpenDR && (<DatePicker selected={newDateReview} onChange={ (date) => handleChangeDateReview(date)} inline />  )}  
                          </Col>
                       </Row>
                    </Col> 
                 </Row>
                 <Row className = "d-md-flex justify-content-center py-1">
                     <Col xl = {12} lg = {12} md = {12} sm className = "text-center" >   
                       <Form.Label className = "text-center font-weight-bold mt-1"> NOTES</Form.Label>
                       <Form.Control 
                          as           = "textarea"  
                          name         = "notes" 
                          //defaultValue = {taskState.notes}
                          className    = "text-center mb-0 "
                          value        = {newNotes}
                          onChange     = { (e)=> handleNewNotes(e.target.value)}
                       />
                    </Col>
                 </Row> 
                 <Row className = "d-md-flex justify-content-center py-2 mt-0">
                    <Col xl = {3} lg = {3} md = {3} sm className = "text-center">
                       <Button disabled = {disabledOS} variant = "link" onClick = { ()=> handleShowService()}>Order Service:</Button>
                       <Form.Control 
                          disabled     
                          className    = "text-center" 
                          type         = "text" 
                          //defaultValue = {taskState.orderService} 
                          value        = {newOrderService ? newOrderService:''}
                          onChange     = { (e)=> handleNewOrderService(e.target.value)}
                       />
                    </Col>
                 </Row> 
              </>
           : 
              newStatus === 'Rejected' 
                 ?
                    <>
                       <Row className = "d-md-flex justify-content-center py-1">
                          <Col xl = {12} lg = {12} md = {12} sm className = "text-center">            
                             <Form.Label className = "text-center font-weight-bold mt-1">REJECTED DATE</Form.Label>
                          </Col>
                          <Col xl = {5} lg = {5} md = {5} sm className = "text-center">            
                             <Row className = "d-md-flex justify-content-center py-1">
                                <Col>
                                   <button className = {newDateRejected ? "btn-info" : "btn-light"}
                                      onClick = { (e) => handleClickDateRejected(e) } 
                                   >
                                      {newDateRejected ? moment(newDateRejected).format("dddd DD/MMMM/YYYY"): 'Date...?' }
                                      
                                   </button>
                                   {isOpenDREJ && (<DatePicker selected={newDateRejected} onChange={ (date) => handleChangeDateRejected(date)} inline />  )} 
                                </Col>
                             </Row>
                          </Col>
                       </Row>
                       <Row className = "d-md-flex justify-content-center py-1">
                          <Col xl = {12} lg = {12} md = {12} sm className = "text-center" >   
                             <Form.Label className = "text-center font-weight-bold mt-1"> REASON REJECTED</Form.Label>
                             <Form.Control 
                                as           = "textarea"  
                                name         = "reason" 
                                defaultValue = {taskState.reasonRejected }
                                className    = "text-center mb-0 "
                                onChange     = { (e)=> handleNewReason(e.target.value)}
                             />
                          </Col>
                       </Row> 
                    </>
                 : 
                 <>
                 <Row className = "d-md-flex justify-content-center py-1">
                     <Col xl = {12} lg = {12} md = {12} sm className = "text-center" >   
                      <Form.Label className = "text-center font-weight-bold mt-1">S O L U T I O N</Form.Label>
                      <Form.Control 
                          as           = "textarea"  
                          name         = "solution" 
                          defaultValue = {taskState.solution}
                          className    = "text-center mb-3 "
                          disabled     = {disableCOMPLETED}
                          onChange     = { (e)=> handleNewSolution(e.target.value) }
                       />
                     </Col>
                    </Row>
                    <Row className = "d-md-flex justify-content-center py-1">
                       <Col xl = {12} lg = {12} md = {12} sm className = "text-center" >            
                          <Form.Label className = "text-center font-weight-bold mt-1">SOLVE DATE</Form.Label>
                       </Col>
                       <Col xl = {5} lg = {5} md = {5} sm className = "text-center">            
                             <Row className = "d-md-flex justify-content-center py-1">
                                <button disabled = {disableCOMPLETED} className = {newDateSolution ? "btn-success" : "btn-light"}
                                      onClick = { (e) => handleClickDateSolution(e) }
                                >      
                                {newDateSolution ? moment(newDateSolution).format("dddd DD/MMMM/YYYY"): 'Date...?' }
                                   
                                </button>
                                {isOpenDS && (<DatePicker showIcon = {true} selected={newDateSolution} onChange={ (date) => handleChangeDateSolution(date)} inline />  )} 
                             </Row>
                          </Col>
                    </Row>
                 </>
     }
     
        <Row className = "d-md-flex justify-content-center py-1">
           <Col xl = {3} lg = {3} md = {3} sm className = "text-center" >
              <Button variant = "danger" onClick = { (e)=> {handleCancel(e)}}>Cancel</Button>
           </Col>
           <Col xl = {3} lg = {3} md = {3} sm className = "text-center">
              <Button 
                    type     = "submit" 
                    variant  = "success"
                    disabled = { newStatus ==='Completed' && !newDateSolution ? true: false}
                    
              >
                 Apply
              </Button>
           </Col>
        </Row>
     </Form>        
      </div>

   </Container>
    
  )
}

export default FormResolve