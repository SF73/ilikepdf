

export const Home = () => (
    <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold">I Like PDF</h1>
        <p className="text-lg mt-4">A simple tool built on top of <a className="hover:underline font-semibold" href="https://pyodide.org/en/stable/">pyodide</a> and <a className="hover:underline font-semibold" href="https://pymupdf.readthedocs.io/en/latest/">pymupdf</a> to edit PDF in your browser</p>
        <p className="text-lg mt-2">The main goal was to tinker a bit with vite, React and pyodide.</p>
    </div>
);

