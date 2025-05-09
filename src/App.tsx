import { Layout } from '@/app/layout'
import { HashRouter, Routes, Route } from "react-router";
import MetadataEditor from '@/app/MetadataEditor'
import { Merge } from '@/app/Merge';
import ImageExtractor from '@/app/ImageExtractor';
import PageComposer from '@/app/PageComposer';

const Home = () => (
  <>
    <h1>Home</h1>
    <p>blablalba</p>
  </>
);

const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-screen">
    <h1 className="text-4xl font-bold">404 - Not Found</h1>
    </div>
);

function App() {

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="metadata" element={<MetadataEditor />} />
          <Route path="merge" element={<Merge />} />
          <Route path="extract-images" element={<ImageExtractor />} />
          <Route path="compose-pages" element={<PageComposer />} />
          <Route path="*" element={<NotFound/>} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
