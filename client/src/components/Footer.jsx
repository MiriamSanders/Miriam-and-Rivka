import React from "react";
export default function Footer() {
    const handleSubmit=async()=>{
        
    }
  return (
    <footer className="bg-gray-800 text-white p-6 mt-12">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-2">Request to join as a chef</h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="name"
            className="p-2 rounded bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="email"
            className="p-2 rounded bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Anything you would like to add?"
            rows="4"
            className="p-2 rounded bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            send
          </button>
        </form>
        <p className="text-sm mt-4 text-gray-400">&copy; 2025 All rights reserved.</p>
      </div>
    </footer>
  );
}
