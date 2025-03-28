import {useNavigate} from 'react-router-dom'
import { FaUserShield } from 'react-icons/fa6';
import { Button } from "./Button";
import Add from "./Add";
import Delete from "./Delete";
import Download from "./Download";


function Home() {
    const navigate = useNavigate();
    return (
      <div className="App mx-4">
        <br />
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-4xl text-blue-500 font-bold">Тех-Блок</h1>
          <Button
            onClick={() => navigate('/login')} 
            className="bg-blue-800 text-white px-4 py-2 rounded flex items-center"
          >
            <FaUserShield className="mr-2" />
            Admin
          </Button>
        </div>
        <hr className='text-blue-200'/>
        <br />
        <div className="flex justify-between">
          <div className="flex">
            <Add />
            <Download />
          </div>
          <Delete />
        </div>
      </div>
    );
  }
  
export default Home;