import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react' 
import './App.css' 
import Index from "./assets/pages/Index";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>

      <BrowserRouter>
        <Routes>
          {/* Auth Pages */}
          <Route path="/" element={<Index />} />       

        </Routes>
      </ BrowserRouter>

    </>
  )
}

export default App
