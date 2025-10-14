import React from 'react';
import { Link } from 'react-router-dom';

const BookCard = ({ book }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
      {/* Sold Badge */}
      {book.status === 'sold' && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 transform rotate-45 origin-top-right">
            SOLD
          </div>
        </div>
      )}
      
      <div className="relative">
        <img 
          src={`${process.env.REACT_APP_API_URL.replace('/api', '')}/${book.image}`} 
          alt={book.bookName} 
          className={`w-full h-48 object-cover ${book.status === 'sold' ? 'opacity-70' : ''}`}
        />
        {book.status === 'sold' && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <span className="text-white text-xl font-bold">SOLD</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 truncate">{book.bookName}</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
            {book.category}
          </span>
          <span className={`text-sm font-semibold ${
            book.status === 'available' ? 'text-green-600' : 'text-red-600'
          }`}>
            {book.status === 'available' ? 'Available' : 'Sold'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-gray-700 mb-1">College: {book.collegeName}</p>
          <p className="font-bold text-lg">${book.price}</p>
        </div>
        <p className="text-gray-600 text-sm mb-3">Seller: {book.seller?.username || 'Unknown'}</p>
        <Link 
          to={`/book/${book._id}`} 
          className={`block w-full text-center py-2 rounded-md font-medium ${
            book.status === 'available' 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
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