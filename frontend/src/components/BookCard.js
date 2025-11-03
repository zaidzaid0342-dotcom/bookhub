import React from 'react';
import { Link } from 'react-router-dom';

const BookCard = ({ book }) => {
  // Automatically detect backend base URL (Render / localhost)
  const backendBase = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace('/api', '')
    : 'http://localhost:5000';

  // Full image URL or fallback image
  const imageUrl = book.image
    ? `${backendBase}${book.image.startsWith('/') ? book.image : `/${book.image}`}`
    : '/default-book.jpg';

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-transform duration-300 hover:-translate-y-1 relative bg-white">
      {/* SOLD Badge */}
      {book.status === 'sold' && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 transform rotate-45 origin-top-right shadow-md">
            SOLD
          </div>
        </div>
      )}

      {/* Book Image */}
      <div className="relative">
        <img
          src={imageUrl}
          alt={book.bookName || 'Book image'}
          onError={(e) => (e.target.src = '/default-book.jpg')}
          className={`w-full h-48 object-cover transition-all duration-300 ${
            book.status === 'sold' ? 'opacity-60' : ''
          }`}
        />
        {book.status === 'sold' && (
          <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center">
            <span className="text-white text-lg font-bold tracking-wide">SOLD</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 truncate text-gray-800">{book.bookName}</h3>

        <div className="flex justify-between items-center mb-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
            {book.category || 'General'}
          </span>
          <span
            className={`text-sm font-semibold ${
              book.status === 'available' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {book.status === 'available' ? 'Available' : 'Sold'}
          </span>
        </div>

        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-700 text-sm">College: {book.collegeName}</p>
          <p className="font-bold text-lg text-emerald-700">₹{book.price}</p>
        </div>

        <p className="text-gray-600 text-sm mb-3">
          Seller: {book.seller?.username || 'Unknown'}
        </p>

        <Link
          to={`/book/${book._id}`}
          className={`block w-full text-center py-2 rounded-md font-medium ${
            book.status === 'available'
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } transition-colors duration-300`}
        >
          {book.status === 'available' ? 'View Details' : 'View Details (Sold)'}
        </Link>
      </div>
    </div>
  );
};

export default BookCard;