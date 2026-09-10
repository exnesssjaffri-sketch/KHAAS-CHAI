import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Blog from './pages/Blog';
import Order from './pages/Order';

function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />
      <main className="flex-1" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="blog" element={<Blog />} />
          <Route path="order" element={<Order />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;