import React, { useEffect, useState }     from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, NavLink  }     from 'react-router-dom';

import { useLocalStorage } from '../../../js/useLocalStorage';
import { tostada_W } from '../../../utils/Tostadas';
import DataTable, { createTheme } from 'react-data-table-component';

import Container     from 'react-bootstrap/Container';
import Button        from 'react-bootstrap/Button';

import Confirmation from '../../Alerts/Confirmation/Confirmation';


import axios from 'axios';
import moment        from 'moment';
import './RecordAttendance.css';

import EditFormTraining from '../EditFormTraining/EditFormTraining';
import AttedanceEmployee from '../AttendanceEmployee/AttendanceEmployee';


const {VITE_APP_API} = import.meta.env;


function RecordAttendance() {
    const navigate= useNavigate();
    
    const [userLogged, setUserLogged] = useLocalStorage('userLogged');
    const [listTrainings, setListTrainings] = useState(null);

    const [show, setShow]     = useState(false);
    const [smShow, setSmShow] = useState(false);
    const [lgShow, setLgShow] = useState(false);
    const [currentRecord, setcurrentRecord] = useState('');

//styles of datatables
const customStyles = {
  rows: {
      style: {
          minHeight: '40px', // override the row height
          fontSize: '1rem',
      },
  },
  headCells: {
      style: {
          paddingLeft: '8px', // override the cell padding for head cells
          paddingRight: '8px',
          backgroundColor: "#FFFDE7",
          center:true,
      },
  },
  cells: {
      style: {
          paddingLeft: '8px', // override the cell padding for data cells
          paddingRight: '8px',
      },
  },
};
createTheme('solarized', {
  text: {
    primary  : '#268bd2',
    secondary: '#2aa198',
  },
  
  context: {
    text: '#FFFFFF',
  },
  divider: {
/*     default: '#073642', */
  },
  action: {
    hover: 'rgba(0,0,0,.08)',
  },
})
//---------------------------------------------
  const columns = [
    {
        name     : 'ID',
        selector : row => row.id,
        sortable : true,
        width    : "3rem",
    },
    {
        name: 'TRAINING',
        selector : row => row.training,
        width    : "28rem",
        sortable : true,
    },
    {
      name: 'TRAINING DATE',
      selector : row => moment(row.dateTraining).format('DD/MMMM/YYYY'),
      sortable : true,
      width    : "8rem",
    },
    {
      name  : 'ATTENDANCE',
      width : "10rem",
      cell  : (row) =>(
                      <NavLink to = {`/trainings/attendanceemployee/${row.id}`}>
                          <Button className = 'btn-sm' id = "btn_register"
                                  disabled  = { userLogged.typeUser === 'User' ? true: false }
                                  variant   = "success"
                                  onClick   = { ()=>handleShowPreview(row) } 
                            >Record Attendance
                          </Button>
                      </NavLink>
                      
                   )
    },
];



    //----------------------------------------------------------

  const getAllTrainings =async()=> {
    try {
      const response = await axios.get(`${VITE_APP_API}/trainings`, {
        headers: {
            "authorization": `Bearer ${userLogged.userToken}`,
        }
        });
        if (response) {
          if (response.data.message==='El token NO es valido!') {
             navigate('/login' );    
             tostada_W(response.data.message,"top-center",1500,'dark');
             return
          } 
        }
      const { data } = response;
      
      if (data) {
        setListTrainings(data);
      }   
    } catch (error) {
      console.log(error.message)
    }
  }

  //-----------------------------------
  

  const handleShowPreview  = (row) =>  {
    setcurrentRecord(row);
    setShow(true);  
  }
  
  const handleShowEdit  = (row) => {
    setcurrentRecord(row);
    setLgShow(true);   
  };

//---------------------------------------------------------





const handleLgClose =()=> {
  setLgShow(false);
}

const handleLgUpdateTraining = ()=> {
  setLgShow(false);
  window.location.reload();
  navigate('/trainings', { replace: true });
}

//----------------------------------------------------------
const DATA = listTrainings;
  useEffect(()=> {  
    getAllTrainings();
  },[])


  return (
    <Container className = "container-fluid optionTrainings">
      <section>
          <DataTable columns      = { columns }  
                    data          = { DATA ? DATA:'' }  
                    customStyles  = {customStyles} 
                      /*  selecttableRows  */
                      fixedHeader 
                      pagination 
                      striped
                      theme="solarized" 
          />


      </section>
  </Container>    
  )
}

export default RecordAttendance;