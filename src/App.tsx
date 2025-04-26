import { Layout } from '@/app/layout'
import { HashRouter, Routes, Route } from "react-router";
import MetadataEditor from '@/components/MetadataEditor'
import FileInput from '@/components/FileInput';
import { TestComponents } from './app/TestComponents';

const Home = () => (
  <>
    <h1>Home</h1>
    <p>blablalba</p>
    <FileInput
      acceptedFileTypes="application/pdf"
      allowMultiple={false}
    />
  </>
);


function App() {

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="metadata-worker" element={<MetadataEditor />} />
          <Route path="test-components" element={<TestComponents />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
