"use client";
import { useState } from "react";

export default function RateJobModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [selectedStars, setSelectedStars] = useState(0);
  const [comment, setComment] = useState("");

  const handleStarClick = (stars) => setSelectedStars(stars);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (comment.length < 10) return;
    console.log("Review enviada:", { estrellas: selectedStars, comentario: comment });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-96">
        <h2 className="text-xl font-bold text-[#2B31E0] mb-4">Rate Job</h2>

        {/* Estrellas */}
        <div className="flex justify-center mb-4">
          {[1, 2, 3].map((num) => (
            <span
              key={num}
              onClick={() => handleStarClick(num)}
              className={`cursor-pointer text-4xl mx-1 ${
                num <= selectedStars ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>

        {/* Etiquetas */}
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>Terrible</span>
          <span>Excelente</span>
        </div>

        {/* Comentario */}
        <textarea
          className="w-full border rounded-md p-2 mb-3 text-gray-700"
          placeholder="Escribe tu comentario (mínimo 10 caracteres)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>

        {/* Botones */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={comment.length < 10}
            className={`px-4 py-2 rounded-md text-white font-medium transition ${
              comment.length < 10
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#2B31E0] hover:bg-[#2B6AE0]"
            }`}
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}
