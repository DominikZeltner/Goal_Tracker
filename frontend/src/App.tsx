import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Timeline from './pages/Timeline';
import Tree from './pages/Tree';
import Detail from './pages/Detail';
import NewGoal from './pages/NewGoal';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Timeline />} />
          <Route path="tree" element={<Tree />} />
          <Route path="ziel/neu" element={<NewGoal />} />
          <Route path="ziel/:id" element={<Detail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
