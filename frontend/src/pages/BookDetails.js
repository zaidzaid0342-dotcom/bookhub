import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBookById, makeOffer, getBookOffers, respondToOffer } from '../services/api';

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [offers, setOffers] = useState([]);
  const [offerPrice, setOfferPrice] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const [buyerAcceptedNotification, setBuyerAcceptedNotification] = useState(null);
  const [showBuyerDetails, setShowBuyerDetails] = useState({}); // Track which buyer details to show
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const res = await getBookById(id);
        console.log('Book data received:', res.data);
        setBook(res.data);
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Failed to fetch book details');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        console.log('Fetching offers for book ID:', id);
        const res = await getBookOffers(id);
        console.log('Offers data:', res.data);
        setOffers(res.data);
        
        // Initialize showBuyerDetails state
        const detailsState = {};
        res.data.forEach(offer => {
          detailsState[offer._id] = offer.status === 'accepted';
        });
        setShowBuyerDetails(detailsState);
      } catch (err) {
        console.error('Error fetching offers:', err);
      }
    };
    fetchOffers();
  }, [id]);

  // Check if current user has an accepted offer
  useEffect(() => {
    if (isAuthenticated && user && offers.length > 0) {
      // Check if user is the buyer of any accepted offer
      const acceptedOffer = offers.find(offer => 
        offer.status === 'accepted' && 
        (offer.buyer === user.id || 
         offer.buyer?._id === user.id || 
         offer.buyer?.id === user.id)
      );
      
      if (acceptedOffer) {
        setBuyerAcceptedNotification({
          type: 'success',
          message: `Your offer for ${book?.bookName || 'this book'} has been accepted! Contact the seller to arrange pickup.`,
          sellerInfo: {
            username: book?.seller?.username || 'Seller',
            email: book?.seller?.email || 'Not provided',
            phone: book?.seller?.phone || 'Not provided'
          },
          offerId: acceptedOffer._id
        });
      }
    }
  }, [offers, isAuthenticated, user, book]);

  // Debug information
  console.log('Debug Info:');
  console.log('User:', user);
  console.log('Book seller:', book?.seller);
  console.log('Is authenticated:', isAuthenticated);
  console.log('Is seller condition:', isAuthenticated && user && book?.seller && (user.id === book?.seller?.id || user.id === book?.seller));

  const isSeller = isAuthenticated && user && book?.seller && 
                   (user.id === book.seller.id || user.id === book.seller);

  const handleMakeOffer = async () => {
    try {
      if (!offerPrice || isNaN(offerPrice) || parseFloat(offerPrice) <= 0) {
        setError('Please enter a valid offer price');
        return;
      }

      console.log('Making offer for book ID:', id);
      console.log('Offer price:', offerPrice);
      console.log('User:', user);
      
      const numericOfferPrice = parseFloat(offerPrice);
      
      await makeOffer(id, { offerPrice: numericOfferPrice });
      setOfferPrice('');
      setSuccess(true);
      setError('');
      setTimeout(() => setSuccess(false), 3000);
      
      const res = await getBookOffers(id);
      setOffers(res.data);
    } catch (err) {
      console.error('Error making offer:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.msg || 'Failed to make offer');
    }
  };

  const handleRespondToOffer = async (offerId, status) => {
    try {
      console.log(`Responding to offer ${offerId} with status: ${status}`);
      await respondToOffer(offerId, { status });
      
      const res = await getBookOffers(id);
      setOffers(res.data);
      
      // Update showBuyerDetails state
      setShowBuyerDetails(prev => ({
        ...prev,
        [offerId]: status === 'accepted'
      }));
      
      if (status === 'accepted') {
        const bookRes = await getBookById(id);
        setBook(bookRes.data);
        
        // Set notification for successful deal
        setNotification({
          type: 'success',
          message: 'Offer accepted successfully! Contact information has been shared with both parties.',
          offerId: offerId
        });
        
        // Clear notification after 5 seconds
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (err) {
      console.error('Error responding to offer:', err);
      setNotification({
        type: 'error',
        message: 'Failed to respond to offer. Please try again.'
      });
    }
  };

  const toggleBuyerDetails = (offerId) => {
    setShowBuyerDetails(prev => ({
      ...prev,
      [offerId]: !prev[offerId]
    }));
  };

  const closeBuyerNotification = () => {
    setBuyerAcceptedNotification(null);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading book details...</p>
      </div>
    </div>
  );
  
  if (!book) return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-red-800">Book Not Found</h3>
            <p className="mt-1 text-red-700">
              The book you're looking for may have been removed or the ID is incorrect.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      {/* Seller Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-5 rounded-xl shadow-xl transform transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-base font-semibold ${
                notification.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {notification.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Buyer Accepted Offer Notification */}
      {buyerAcceptedNotification && (
        <div className="fixed top-4 right-4 z-50 p-6 rounded-xl shadow-xl bg-green-50 border-2 border-green-200 w-full max-w-md transform transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-bold text-green-800">Offer Accepted!</h3>
                <div className="mt-2 text-green-700">
                  <p className="font-medium">{buyerAcceptedNotification.message}</p>
                  <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-bold text-gray-800">Seller Contact Information:</h4>
                    <div className="mt-2 space-y-1">
                      <p><span className="font-semibold text-gray-700">Name:</span> {buyerAcceptedNotification.sellerInfo.username}</p>
                      <p><span className="font-semibold text-gray-700">Email:</span> {buyerAcceptedNotification.sellerInfo.email}</p>
                      <p><span className="font-semibold text-gray-700">Phone:</span> {buyerAcceptedNotification.sellerInfo.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={closeBuyerNotification}
              className="text-green-600 hover:text-green-800 focus:outline-none transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Home
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 ml-1 md:ml-2 font-medium">Book Details</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
          <div className="md:flex">
            <div className="md:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center">
              <div className="relative w-full h-96 overflow-hidden rounded-xl shadow-lg">
                <img 
                  src={`${process.env.REACT_APP_API_URL.replace('/api', '')}/${book.image}`} 
                  alt={book.bookName} 
                  className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
            <div className="md:w-1/2 p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{book.bookName}</h1>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-100 text-blue-800 text-sm font-bold px-4 py-2 rounded-full shadow-sm">
                      {book.category}
                    </span>
                    {book.status === 'sold' && (
                      <span className="bg-red-100 text-red-800 text-sm font-bold px-4 py-2 rounded-full shadow-sm">
                        Sold
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">${book.price}</p>
                  <p className="text-gray-500 text-sm mt-1">Listed Price</p>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-100">Book Details</h2>
                <div className="grid grid-cols-1 gap-3 text-gray-700">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    <span className="font-medium w-32">College:</span>
                    <span className="font-medium">{book.collegeName}</span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span className="font-medium w-32">Pickup Address:</span>
                    <span className="font-medium">{book.pickupAddress}</span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="font-medium w-32">Status:</span>
                    <span className={`font-bold ${
                      book.status === 'available' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Seller Information */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-100">Seller Information</h2>
                {isSeller ? (
                  // Show full seller details only to the seller
                  book.seller ? (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl shadow-sm border border-blue-100">
                      <div className="flex items-center mb-4">
                        <div className="bg-blue-100 rounded-full p-3 mr-4 shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{book.seller.username || 'Unknown'}</h3>
                          <p className="text-gray-600">{book.seller.city || 'Unknown'}, {book.seller.state || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                          </svg>
                          <span className="font-medium">College:</span>
                          <span className="ml-2">{book.seller.collegename_class || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                          </svg>
                          <span className="font-medium">Student ID:</span>
                          <span className="ml-2">{book.seller.id || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">Seller information not available</p>
                  )
                ) : isAuthenticated && user && offers.some(offer => 
                  offer.status === 'accepted' && 
                  (offer.buyer === user.id || 
                   offer.buyer?._id === user.id || 
                   offer.buyer?.id === user.id)
                ) ? (
                  // Show seller details to the buyer if their offer is accepted
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl shadow-sm border border-green-100">
                    <div className="flex items-center mb-4">
                      <div className="bg-green-100 rounded-full p-3 mr-4 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{book.seller?.username || 'Unknown'}</h3>
                        <p className="text-gray-600">{book.seller?.city || 'Unknown'}, {book.seller?.state || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        <span className="font-medium">Email:</span>
                        <span className="ml-2">{book.seller?.email || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        <span className="font-medium">Phone:</span>
                        <span className="ml-2">{book.seller?.phone || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Show limited info to other users
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl shadow-sm border border-blue-100">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-blue-800">Seller Information</h3>
                        <div className="mt-2 text-blue-700">
                          <p className="font-medium">Seller contact information will be shared after your offer is accepted.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {isAuthenticated && !isSeller && book.status === 'available' && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-blue-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Make an Offer</h2>
                  {success && (
                    <div className="mb-4 bg-green-100 text-green-800 p-4 rounded-lg flex items-center">
                      <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Offer submitted successfully! The seller will review your offer.
                    </div>
                  )}
                  {error && (
                    <div className="mb-4 bg-red-100 text-red-800 p-4 rounded-lg flex items-center">
                      <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-lg font-bold">$</span>
                      </div>
                      <input
                        type="number"
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        className="block w-full pl-8 pr-4 py-4 border-2 border-gray-300 rounded-l-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-lg transition-all duration-200"
                        placeholder="Your offer price"
                        min="0.01"
                        step="0.01"
                      />
                    </div>
                    <button
                      onClick={handleMakeOffer}
                      className="inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-bold rounded-r-lg text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Submit Offer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Offers Section - Only visible to the book owner/seller */}
        {isSeller && (
          <div className="mt-10 bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Offers
              </h2>
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-md">
                {offers.length} {offers.length === 1 ? 'Offer' : 'Offers'}
              </span>
            </div>
            
            {offers.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className="mt-6 text-xl font-bold text-gray-900">No offers yet</h3>
                <p className="mt-3 text-gray-600 max-w-md mx-auto">When buyers make offers, they'll appear here for you to review.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {offers.map((offer) => (
                  <div key={offer._id} className="border-2 border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-200">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      {/* Buyer Information */}
                      <div className="mb-6 md:mb-0 md:w-2/3">
                        <div className="flex items-center mb-4">
                          <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full p-3 mr-4 shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{offer.buyer?.username || 'Unknown'}</h3>
                            <p className="text-gray-600">{offer.buyer?.city || 'Unknown'}, {offer.buyer?.state || 'Unknown'}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                            <p className="text-gray-500 font-medium mb-1">College</p>
                            <p className="font-bold text-gray-800">{offer.buyer?.collegename_class || 'Unknown'}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                            <p className="text-gray-500 font-medium mb-1">Student ID</p>
                            <p className="font-bold text-gray-800">{offer.buyer?.id || 'Unknown'}</p>
                          </div>
                          
                          {/* Conditionally show contact details - only after offer is accepted */}
                          {showBuyerDetails[offer._id] && (
                            <>
                              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                <p className="text-gray-500 font-medium mb-1">Email</p>
                                <p className="font-bold text-gray-800">{offer.buyer?.email || 'Not provided'}</p>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                <p className="text-gray-500 font-medium mb-1">Phone</p>
                                <p className="font-bold text-gray-800">{offer.buyer?.phone || 'Not provided'}</p>
                              </div>
                            </>
                          )}
                        </div>
                        
                        {/* Additional Buyer Details - only show if offer is accepted */}
                        {showBuyerDetails[offer._id] && (
                          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl shadow-sm border border-blue-100">
                            <h4 className="font-bold text-blue-800 mb-3 flex items-center">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              Additional Buyer Information
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <p className="text-gray-500 font-medium">School</p>
                                <p className="font-bold text-gray-800">{offer.buyer?.schoolName || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">Class</p>
                                <p className="font-bold text-gray-800">{offer.buyer?.className || 'Not provided'}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Offer Details */}
                      <div className="md:w-1/3 md:text-right">
                        <div className="mb-6">
                          <p className="text-gray-500 font-medium">Offer Amount</p>
                          <p className="text-3xl font-bold text-gray-900">${offer.offerPrice}</p>
                        </div>
                        
                        <div className="mb-6">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                            offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                          </span>
                        </div>
                        
                        {offer.status === 'pending' && (
                          <div className="flex flex-col md:flex-row md:justify-end space-y-3 md:space-y-0 md:space-x-3">
                            <button
                              onClick={() => handleRespondToOffer(offer._id, 'accepted')}
                              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105 shadow-md"
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                              Accept Offer
                            </button>
                            <button
                              onClick={() => handleRespondToOffer(offer._id, 'rejected')}
                              className="inline-flex items-center justify-center px-5 py-3 border-2 border-gray-300 text-base font-bold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-sm"
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                              Reject Offer
                            </button>
                          </div>
                        )}
                        
                        {offer.status === 'accepted' && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl shadow-sm border border-green-100">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-3 text-left">
                                <h3 className="text-lg font-bold text-green-800">Deal Closed!</h3>
                                <div className="mt-2 text-green-700">
                                  <p className="font-medium">Contact information has been shared with both parties.</p>
                                  <p className="mt-2 font-medium">Buyer's contact: {offer.buyer?.email || 'Email not provided'} {offer.buyer?.phone ? `| ${offer.buyer.phone}` : ''}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Toggle button for buyer details - only show after offer is accepted */}
                        {offer.status === 'accepted' && (
                          <button
                            onClick={() => toggleBuyerDetails(offer._id)}
                            className="mt-4 text-base font-bold text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center justify-center md:justify-end"
                          >
                            {showBuyerDetails[offer._id] ? (
                              <>
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                                Hide Details
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                                Show Full Details
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Authentication Message */}
        {!isAuthenticated && (
          <div className="mt-10 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 p-6 rounded-xl shadow-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0v-1a1 1 0 012 0v1zm0-3a1 1 0 11-2 0V8a1 1 0 012 0v2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-yellow-800">Authentication Required</h3>
                <div className="mt-2 text-yellow-700">
                  <p className="font-medium">You need to be logged in to make offers. If you are the seller of this book, please log in to view and respond to offers.</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a href="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-bold rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200">
                      Log in
                    </a>
                    <span className="text-yellow-700 font-medium flex items-center">or</span>
                    <a href="/register" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-bold rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200">
                      Register
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetails;