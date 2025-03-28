import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">Тех-Блок</h1>
        <Link 
          to="/login" 
          className="text-white bg-blue-700 px-4 py-2 rounded hover:bg-blue-600"
        >
          Admin
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;