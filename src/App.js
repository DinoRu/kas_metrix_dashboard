import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Add from "./components/Add";
import Delete from "./components/Delete";
import Download from "./components/Download";
import DownloadPage from './components/DownloadApk';



function App() {
  return (
    <Router>
      <Routes>
        <Route
          path='/'
          element={
            <div className="App mx-4">
              <br />
              <h1 className="text-4xl text-blue-500 text-center text-bold">Тех-Блок</h1>
              <br />
              <div className="flex justify-between">
                <div className="flex">
                  <Add />
                  <Download />
                </div>
                <Delete />
              </div>
            </div>
          }
         />
         <Route
          path='/downloadapk'
          element={<DownloadPage/>}
          />
      </Routes>
    </Router>
  );
}

export default App;
