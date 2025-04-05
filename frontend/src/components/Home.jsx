import React, { useState } from 'react';
import { usePyodide } from './PyodideProvider';


const Home = () => {
  const { pyodide, loading,  pymupdf } = usePyodide();
 
    return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h2 className="text-4xl font-bold mb-4">I Like PDF</h2>
      <p className="text-lg">A simple tool build on top of pyodide and pymupdf to <span className='font-bold'>locally</span> manipulate pdf files.</p>
      <p>Pyodide {loading ? "is loading" : pyodide.version}</p>
      <p>Pymupdf {loading ? "is loading" : pymupdf.__doc__}</p>
    </div>
    );
};


export default Home;