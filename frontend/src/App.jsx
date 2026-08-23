import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get('http://localhost:8080/api/health')
      .then(res => setHealth(res.data))
      .catch(err => setError(err.message))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          Neighborhood Services
        </h1>
        <p className="text-gray-600 mb-2">Frontend ↔ Backend connection test</p>
        {health && (
          <p className="text-green-600 font-semibold">
            Backend status: {health.status} (checked at {health.timestamp})
          </p>
        )}
        {error && (
          <p className="text-red-600 font-semibold">
            Error reaching backend: {error}
          </p>
        )}
      </div>
    </div>
  )
}

export default App