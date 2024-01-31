import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LoadFile from './components/LoadFile'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <h1>Lexical Analyzer</h1>
      <LoadFile />
    </>
  )
}

export default App
