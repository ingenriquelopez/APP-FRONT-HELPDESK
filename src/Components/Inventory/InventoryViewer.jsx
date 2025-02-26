import React, { useEffect, useState }  from 'react'
import {Link}                          from 'react-router-dom';
import { useSelector, useDispatch }    from 'react-redux';
import { useNavigate }                 from 'react-router-dom';
import { useLocalStorage }             from '../../js/useLocalStorage';
import './InventoryViewer.css';

import DataTable, { createTheme } from 'react-data-table-component';
import Container                  from 'react-bootstrap/Container';
import Form                       from 'react-bootstrap/Form';
import Button                     from 'react-bootstrap/Button';
import Row                        from 'react-bootstrap/Row';
import Col                        from 'react-bootstrap/Col';

import { FcCancel }               from "react-icons/fc";
import { BiEditAlt }              from "react-icons/bi";
import Confirmation               from '../Alerts/Confirmation/Confirmation';
import Annoument                  from '../Alerts/Annoument/Annoument';
 import EditFormInventory         from './EditFormInventory/EditFormInventory';

import { tostada_W }              from '../../utils/Tostadas';
import axios                      from 'axios';

import { loadAllInventory, loadInventory } from '../../redux/Inventory/inventoryReducer';
import { createListClassRooms }            from '../../redux/classRooms/classRoomsReducer';

/* import ExportToXLS from '../ExportToXLS/ExportToXLS'; */

const {VITE_APP_API} = import.meta.env;


function InventoryViewer() {
  const dispatch = useDispatch();  
  const navigate = useNavigate();
  const { listOfInventory } = useSelector( state=> state.inventory);
  
  const [userLogged, setUserLogged] = useLocalStorage('userLogged');
  
  const [show, setShow]     = useState(false);
  const [smShow, setSmShow] = useState(false);
  const [lgShow, setLgShow] = useState(false);
  const [currentRecord, setcurrentRecord] = useState('');



//styles of datatables
const customStyles = {
  rows: {
      style: {
          minHeight: '40px', // override the row height
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
    primary: '#268bd2',
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
        name: 'INTERNAL CODE',
        selector: row => row.internalCode,
        sortable: true,
    },
    {
        name: 'SERIAL',
        selector: row => row.serial,
        sortable: true,
    },
    {
      name: 'DEVICE',
      selector: row => row.device,
      sortable: true,
    },
    {
      name: 'TRADE',
      selector: row => row.trade,
      sortable: true,
    },
    {
      name: 'MODEL',
      selector: row => row.model,
      sortable: true,
      //wrap: true,
    },
    {
      name: 'UBICATION',
      selector: row => row.room,
      sortable:true,
    },
    {
      name: 'STATUS',
      selector: row => <Button className = 'btn-sm'
                          onClick  = { ()=>handleResolve(row) } 
                          disabled = { userLogged.typeUser === 'User' ? true: false}
                          variant  = {row.status === 'Operating'       
                                        ? 'success' 
                                        : row.status ==='Repair' ? 'primary' 
                                        : row.status ==='Cancel' ? 'danger': 'warning' 
                                      }
                        > 
                          {row.status}  
                        </Button>  ,
      sortable: true
    },
    {
      name: 'DELETE',
      width: "4rem",
      cell: (row) =>(
                      <Button className = 'btn-sm'
                        disabled  = { userLogged.typeUser === 'User' ? true: false }
                        style     = {{backgroundColor:"transparent"}}
                        variant   = "light" 
                        onClick   = { ()=>handleShowPreview(row) } 
                      >
                      <FcCancel/> 
                      </Button>
                   )
    },
    {
      name: 'EDIT',
      width: "4rem",
      cell: (row) => (
        <Button  className  = "btn-sm"
                                style     = {{backgroundColor:"transparent"}}
                                variant   = "light" 
                                 onClick  = { ()=>handleShowEdit(row) } 
                       >
                          <BiEditAlt/>
                       </Button>
      )  
    }
];




const DATA = listOfInventory;

  useEffect(() => {
      dispatch(createListClassRooms(userLogged.levelUser));
      dispatch(loadAllInventory(userLogged.levelUser));
  },[])

  useEffect(() => {
    dispatch(loadAllInventory(userLogged.levelUser));
},[listOfInventory]);

//*----------------------------------------------------



async function handleClickDelete() { 
  //primero lo eliminamos de la base de datos
  try {
    const response = await axios.delete(`${VITE_APP_API}/inventory/code/${currentRecord.internalCode}`, {
      headers: {
          "authorization": `Bearer ${userLogged.userToken}`,
      }
    });
    
    if (response.status === 200) {
      if (response.data.message==='El token NO es valido!') {
        navigate('/login' );    
        tostada_W(response.data.message,"top-center",1500,'dark');
        return
     } 

      if (response.data === 'RequestDeleted') {
        setShow(false);
        navigate('/home', { replace: true });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}

const handleClose = () => {
  setShow(false);
}

const handleDelete = ()=> {
  handleClickDelete();
  setShow(false)
}

const handleSmClose =() => {
  setSmShow(false);
}

const handleLgClose =()=> {
  setLgShow(false);
}

const handleLgUpdate = ()=> {
  setLgShow(false);
}

const handleShowPreview  = (row) =>  {
  setcurrentRecord(row);
  setShow(true);  
}

const handleShowEdit  = (row) => {
  setcurrentRecord(row);
  setLgShow(true);   
};


  
const handleResolve =(row)=> {
  navigate(`/homeresolve/${row.number}`);
}

let myData = {
  internalCode  : currentRecord.internalCode,
  serial        : currentRecord.serial,
  device        : currentRecord.device,
  trade         : currentRecord.trade,
  model         : currentRecord.model,
  color         : currentRecord.color,
  room          : currentRecord.room,
  level         : currentRecord.level,
  campus        : currentRecord.campus,
  userDevice    : currentRecord.userDevice,
  docRes        : currentRecord.docRes,
  docPur        : currentRecord.docPur, 
  lastRevision  : currentRecord.lastRevision,
  note          : currentRecord.note,
  checkedBy     : currentRecord.checkedBy,
  status        : currentRecord.statusDefault,
}


  return (
    <Container className = "container-fluid py-5 mb-2">
      <Row>
        <Col xxl = {3} xl = {3} lg = {4} md = {6} sm = {12} className = "text-center"> 
          <Link to='/dashboard/newdeviceinventory'>
            <button className ="btn btn-primary mx-1">Add New Device</button>  
          </Link>
        </Col>

        <Col xxl = {3} xl = {3} lg = {4} md = {6} sm = {12} className = "text-center"> 
            {/* <ExportToXLS DATA = {DATA}/> */}
        </Col>

      </Row>
    
      
     
      <DataTable columns      = { columns }  
                 data         = { DATA }   
                 customStyles = {customStyles} 
                  /*  selecttableRows  */
                   fixedHeader 
                   pagination 
                   striped
                   /* theme="solarized" */
                   id = "tablaDeInventario"
      />

      <Confirmation  
        titulo       = "Warning!"     
        mensaje      = "Do you want Delete this Device?"   
        textBtn      = "Delete"
        show         = { show }    
        handleClose  = { handleClose } 
        handleDelete = { handleDelete }
      />
      <Annoument     titulo       = "Annoument"    
                    mensaje       = "Request deleted susscesfull ✅ " 
                    smShow        = { smShow }  
                    handleSmClose = { handleSmClose }
      /> 
       <EditFormInventory myTitle        = "Edit Device" 
                    myData         = { currentRecord }    
                    lgShow         = { lgShow }             
                    handleLgClose  = { handleLgClose }     
                    handleLgUpdate = { handleLgUpdate }
      />
     </Container>    
  );
}

export default InventoryViewer;