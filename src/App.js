import Add from "./components/Add";
import Delete from "./components/Delete";
import Download from "./components/Download";



function App() {
  return (
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
  );
}

export default App;
