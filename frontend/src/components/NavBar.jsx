import { NavLink } from "react-router";
import { useState } from "react";
const NavBar = () => {

    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const style = ({ isActive, isPending }) => {
        let className = "block text-gray-300 hover:text-white";
        className += isActive ? " font-bold text-shadow-lg" : " font-normal";
        return className;
    };

    return (

    <>
    <div className="flex sm:hidden bg-slate-800 text-white p-4">
        <button onClick={toggleMenu} aria-label="Toggle menu">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
    </div>

    <div
        className={`
          bg-slate-800 text-white p-4 transition-transform duration-300 
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          sm:translate-x-0 sm:w-1/4 md:w-1/5 fixed sm:static top-0 left-0 h-screen w-2/3
        `}
      >

      <ul className="space-y-2">
        <li><NavLink onClick={() => setIsOpen(false)} className = {style} to="/">Home</NavLink></li>
        <li><NavLink onClick={() => setIsOpen(false)} className = {style} to="extract-images">Extract Images</NavLink></li>
        <li><NavLink onClick={() => setIsOpen(false)} className = {style} to="metadata">Edit Metadata</NavLink></li>
        <li><NavLink onClick={() => setIsOpen(false)} className = {style} to="split">Split</NavLink></li>
        <li><NavLink onClick={() => setIsOpen(false)} className = {style} to="merge">Merge</NavLink></li>
      </ul>
    </div>
    </>
  );

}
    

export default NavBar;
