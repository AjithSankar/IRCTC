import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TrainList from "./pages/TrainList";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trains" element={<TrainList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;