import React from 'react'
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom'
import './App.css'
import Home from './Components/Home.jsx'
import SearchResults from './Components/SearchResults.jsx'
import Quiz from './Components/Quiz.jsx'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const Layout = () => {
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/search">Search</Link>
          </li>
          <li>
            <Link to="/quiz">Quiz</Link>
          </li>
        </ul>
      </nav>

      <Outlet />
    </>
  )
};

const NoPage = () => {
  return <h1>404</h1>;
};

export default App;