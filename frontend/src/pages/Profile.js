import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, getUserBooks, getBookOffers, getUserOffers } from '../services/api';

// Memoized Book Card Component
const BookCard = React.memo(({ book }) => {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="h-56 bg-gray-200 relative overflow-hidden">
        {book.image ? (
          <img 
            src={`${process.env.REACT_APP_API_URL.replace('/api', '')}/${book.image}`} 
            alt={book.bookName} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.218.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm ${
            book.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {book.status || 'Unknown'}
          </span>
        </div>
      </div>
      <div className="p-6 bg-white">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{book.bookName || 'Untitled Book'}</h3>
        <p className="text-gray-600 mb-4">{book.category || 'Uncategorized'}</p>
        <div className="flex justify-between items-center mb-5">
          <span className="text-2xl font-bold text-blue-600">${book.price || '0'}</span>
        </div>
        <div className="flex justify-between">
          <a
            href={`/book/${book._id}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300"
          >
            View Details
          </a>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
});

// Helper function to get offer status (can be used outside of components)
const getOfferStatus = (status) => {
  if (status === 'pending') {
    return { 
      text: 'Pending', 
      color: 'bg-yellow-100 text-yellow-800',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    };
  } else if (status === 'accepted') {
    return { 
      text: 'Accepted', 
      color: 'bg-green-100 text-green-800',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    };
  } else {
    return { 
      text: 'Rejected', 
      color: 'bg-red-100 text-red-800',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    };
  }
};

// Memoized Offer Status Component
const OfferStatus = React.memo(({ status }) => {
  const statusInfo = useMemo(() => getOfferStatus(status), [status]);
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
      {statusInfo.icon}
      <span className="ml-1">{statusInfo.text}</span>
    </span>
  );
});

// Memoized Offer Item Component
const OfferItem = React.memo(({ book, offers }) => {
  const latestOffer = useMemo(() => {
    return offers.reduce((latest, offer) => {
      return !latest || new Date(offer.createdAt) > new Date(latest.createdAt) ? offer : latest;
    }, null);
  }, [offers]);

  const status = useMemo(() => {
    return latestOffer ? getOfferStatus(latestOffer.status) : null;
  }, [latestOffer]);

  return (
    <div className="border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
        <div className="mb-6 md:mb-0 md:w-2/3">
          <div className="flex items-center mb-4">
            <div className="bg-gray-100 rounded-xl p-3 mr-4 shadow-sm">
              {book.image ? (
                <img 
                  src={`${process.env.REACT_APP_API_URL.replace('/api', '')}/${book.image}`} 
                  alt={book.bookName} 
                  className="w-20 h-20 object-cover rounded-lg"
                  loading="lazy"
                />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.218.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{book.bookName || 'Untitled Book'}</h3>
              <p className="text-gray-600">{book.category || 'Uncategorized'}</p>
              <p className="text-gray-600 mt-1">Seller: {book.seller?.username || 'Unknown'}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-lg font-medium text-gray-800 mb-3">Your Offers:</h4>
            <div className="space-y-3">
              {offers.map((offer) => (
                <div key={offer._id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div>
                    <p className="text-lg font-medium text-gray-900">${offer.offerPrice}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(offer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <OfferStatus status={offer.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="md:w-1/3 md:text-right md:pl-6">
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">Latest Offer</p>
            <p className="text-3xl font-bold text-blue-600">${latestOffer?.offerPrice || '0'}</p>
          </div>
          
          <div className="mb-6">
            {status && (
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${status.color}`}>
                {status.icon}
                <span className="ml-2">{status.text}</span>
              </span>
            )}
          </div>
          
          {latestOffer?.status === 'accepted' && (
            <div className="bg-green-50 p-5 rounded-xl mb-6 border border-green-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3 text-left">
                  <h3 className="text-lg font-medium text-green-800">Offer Accepted!</h3>
                  <div className="mt-2 text-green-700">
                    <p>Congratulations! Your offer has been accepted by the seller.</p>
                    <p className="mt-2 font-medium">Contact the seller to arrange pickup:</p>
                    <p className="mt-1">Email: {book.seller?.email || 'Not provided'}</p>
                    <p className="mt-1">Phone: {book.seller?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {latestOffer?.status === 'rejected' && (
            <div className="bg-red-50 p-5 rounded-xl mb-6 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3 text-left">
                  <h3 className="text-lg font-medium text-red-800">Offer Rejected</h3>
                  <div className="mt-2 text-red-700">
                    <p>Unfortunately, the seller has rejected your offer.</p>
                    <p className="mt-2">You can browse other similar books or make a new offer on this book if it's still available.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <a
              href={`/book/${book._id}`}
              className="inline-flex items-center px-5 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 w-full md:w-auto justify-center"
            >
              View Book Details
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

// Memoized Received Offer Item Component
const ReceivedOfferItem = React.memo(({ offer, handleRespondToOffer }) => {
  const status = useMemo(() => getOfferStatus(offer.status), [offer.status]);

  return (
    <div className="border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
        <div className="mb-6 md:mb-0 md:w-2/3">
          <div className="flex items-center mb-4">
            <div className="bg-gray-100 rounded-xl p-3 mr-4 shadow-sm">
              {offer.book?.image ? (
                <img 
                  src={`${process.env.REACT_APP_API_URL.replace('/api', '')}/${offer.book.image}`} 
                  alt={offer.book.bookName} 
                  className="w-20 h-20 object-cover rounded-lg"
                  loading="lazy"
                />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.218.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{offer.book?.bookName || 'Untitled Book'}</h3>
              <p className="text-gray-600">{offer.book?.category || 'Uncategorized'}</p>
              <p className="text-gray-600 mt-1">Your Book</p>
            </div>
          </div>
        </div>
        
        <div className="md:w-1/3 md:text-right md:pl-6">
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">Buyer Information</p>
            <p className="text-lg font-medium text-gray-900">{offer.buyer?.username || 'Unknown User'}</p>
            <p className="text-gray-600 mt-1">{offer.buyer?.email || 'No email provided'}</p>
            <p className="text-gray-600">{offer.buyer?.phone || 'No phone provided'}</p>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">Offer Amount</p>
            <p className="text-3xl font-bold text-blue-600">${offer.offerPrice || '0'}</p>
          </div>
          
          <div className="mb-6">
            <OfferStatus status={offer.status} />
          </div>
          
          {offer.status === 'pending' && (
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button 
                onClick={() => handleRespondToOffer(offer._id, 'accepted')}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 flex-1"
              >
                Accept
              </button>
              <button 
                onClick={() => handleRespondToOffer(offer._id, 'rejected')}
                className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 flex-1"
              >
                Reject
              </button>
            </div>
          )}
          
          <div className="mt-6">
            <a
              href={`/book/${offer.book?._id}`}
              className="inline-flex items-center px-5 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 w-full md:w-auto justify-center"
            >
              View Book Details
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

const Profile = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    schoolName: '',
    collegeName: '',
    className: '',
    username: '',
    id: '',
    city: '',
    state: '',
    email: '',
    phone: '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [userBooks, setUserBooks] = useState([]);
  const [receivedOffers, setReceivedOffers] = useState([]);
  const [userOffers, setUserOffers] = useState([]);
  const [notification, setNotification] = useState(null);

  // Memoize the booksWithOffers calculation
  const booksWithOffers = useMemo(() => {
    const bookMap = new Map();
    
    userOffers.forEach(offer => {
      if (offer.book && offer.book._id) {
        if (!bookMap.has(offer.book._id)) {
          bookMap.set(offer.book._id, {
            book: offer.book,
            offers: []
          });
        }
        bookMap.get(offer.book._id).offers.push(offer);
      }
    });
    
    return Array.from(bookMap.values());
  }, [userOffers]);

  // Memoize the handleRespondToOffer function
  const handleRespondToOffer = useCallback(async (offerId, status) => {
    try {
      const { respondToOffer } = await import('../services/api');
      await respondToOffer(offerId, { status });
      
      // Refresh offers data
      try {
        const booksRes = await getUserBooks();
        setUserBooks(booksRes.data || []);
        
        const allReceivedOffers = [];
        if (booksRes.data && booksRes.data.length > 0) {
          for (const book of booksRes.data) {
            try {
              const offersRes = await getBookOffers(book._id);
              if (offersRes.data && offersRes.data.length > 0) {
                const offersWithBook = offersRes.data.map(offer => ({
                  ...offer,
                  book: book
                }));
                allReceivedOffers.push(...offersWithBook);
              }
            } catch (err) {
              console.error(`Error fetching offers for book ${book._id}:`, err);
            }
          }
        }
        
        setReceivedOffers(allReceivedOffers);
      } catch (refreshError) {
        console.error('Error refreshing offers:', refreshError);
      }
      
      setNotification({
        type: 'success',
        message: `Offer ${status} successfully!`
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Error responding to offer:', err);
      setNotification({
        type: 'error',
        message: 'Failed to respond to offer. Please try again.'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await getUserProfile();
        setFormData(res.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && user) {
      fetchProfile();
    }
  }, [isAuthenticated, user, authLoading]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    const fetchUserData = async () => {
      try {
        // Fetch user's books
        console.log('Fetching user books...');
        const booksRes = await getUserBooks();
        console.log('Books response:', booksRes);
        console.log('Books data:', booksRes.data);
        setUserBooks(booksRes.data || []);
        
        // Fetch offers for user's books (received offers)
        setOffersLoading(true);
        const allReceivedOffers = [];
        
        if (booksRes.data && booksRes.data.length > 0) {
          // Use Promise.all for parallel fetching
          const offerPromises = booksRes.data.map(async (book) => {
            try {
              console.log(`Fetching offers for book ${book._id}...`);
              const offersRes = await getBookOffers(book._id);
              console.log(`Offers for book ${book._id}:`, offersRes.data);
              
              if (offersRes.data && offersRes.data.length > 0) {
                return offersRes.data.map(offer => ({
                  ...offer,
                  book: book
                }));
              }
              return [];
            } catch (err) {
              console.error(`Error fetching offers for book ${book._id}:`, err);
              return [];
            }
          });
          
          const offersResults = await Promise.all(offerPromises);
          offersResults.forEach(offers => {
            allReceivedOffers.push(...offers);
          });
        }
        
        console.log('All received offers:', allReceivedOffers);
        setReceivedOffers(allReceivedOffers);
        
        // Fetch offers made by the user
        try {
          console.log('Fetching user made offers...');
          const userOffersRes = await getUserOffers();
          console.log('User made offers response:', userOffersRes);
          console.log('User made offers data:', userOffersRes.data);
          setUserOffers(userOffersRes.data || []);
        } catch (err) {
          console.error('Error fetching user made offers:', err);
          setUserOffers([]);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setUserBooks([]);
        setReceivedOffers([]);
        setUserOffers([]);
      } finally {
        setOffersLoading(false);
      }
    };
    
    fetchUserData();
  }, [isAuthenticated, user]);

  const {
    schoolName,
    collegeName,
    className,
    username,
    id,
    city,
    state,
    email,
    phone,
  } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(formData);
      setSuccess(true);
      setNotification({
        type: 'success',
        message: 'Profile updated successfully!'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
      setNotification({
        type: 'error',
        message: 'Failed to update profile. Please try again.'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Show loading state while checking authentication
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <svg className="h-10 w-10 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Authentication Required</h2>
              <p className="mt-4 text-lg text-gray-600">
                You need to be logged in to view your profile. Please log in to continue.
              </p>
              <div className="mt-8">
                <a
                  href="/login"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300"
                >
                  Log In to Your Account
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 p-5 rounded-xl shadow-xl transform transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-base font-medium ${
                notification.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {notification.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-3">My Profile</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your account and track your book listings and offers
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-5 px-8 text-center border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile Information
                </span>
              </button>
              <button
                onClick={() => setActiveTab('books')}
                className={`py-5 px-8 text-center border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeTab === 'books'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.218.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  My Books ({userBooks.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('offers')}
                className={`py-5 px-8 text-center border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeTab === 'offers'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Books I Offered On ({booksWithOffers.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('received')}
                className={`py-5 px-8 text-center border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeTab === 'received'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Offers Received ({receivedOffers.length})
                </span>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center mb-10">
                  <div className="bg-blue-100 rounded-full p-4 mr-5 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Personal Information</h2>
                    <p className="text-gray-600 mt-1">Update your account details and contact information</p>
                  </div>
                </div>

                {success && (
                  <div className="mb-8 bg-green-50 border-l-4 border-green-500 p-5 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-base font-medium text-green-800">
                          Profile updated successfully!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-5 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-base font-medium text-red-800">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={onSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                      <input
                        type="text"
                        id="id"
                        name="id"
                        value={id}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={phone}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
                      <input
                        type="text"
                        id="schoolName"
                        name="schoolName"
                        value={schoolName}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      />
                    </div>
                    <div>
                      <label htmlFor="collegeName" className="block text-sm font-medium text-gray-700 mb-2">College Name</label>
                      <input
                        type="text"
                        id="collegeName"
                        name="collegeName"
                        value={collegeName}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      />
                    </div>
                    <div>
                      <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                      <input
                        type="text"
                        id="className"
                        name="className"
                        value={className}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={city}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={state}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300"
                    >
                      Update Profile
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* My Books Tab */}
            {activeTab === 'books' && (
              <div>
                <div className="flex items-center mb-8">
                  <div className="bg-blue-100 rounded-full p-4 mr-5 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.218.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">My Books</h2>
                    <p className="text-gray-600 mt-1">Manage your book listings and track their status</p>
                  </div>
                </div>

                {userBooks.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.218.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.a477-4.5 1.253" />
                    </svg>
                    <h3 className="mt-6 text-2xl font-bold text-gray-900">No books listed yet</h3>
                    <p className="mt-3 text-lg text-gray-600 max-w-md mx-auto">
                      Start selling your books by adding them to our marketplace.
                    </p>
                    <div className="mt-8">
                      <a
                        href="/add-book"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300"
                      >
                        Add Your First Book
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {userBooks.map((book) => (
                      <BookCard key={book._id} book={book} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Books I Offered On Tab */}
            {activeTab === 'offers' && (
              <div>
                <div className="flex items-center mb-8">
                  <div className="bg-blue-100 rounded-full p-4 mr-5 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Books I Offered On</h2>
                    <p className="text-gray-600 mt-1">Track the status of your offers on various books</p>
                  </div>
                </div>

                {offersLoading ? (
                  <div className="flex justify-center items-center py-16">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-lg font-medium text-gray-700">Loading your offers...</p>
                    </div>
                  </div>
                ) : booksWithOffers.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <h3 className="mt-6 text-2xl font-bold text-gray-900">No offers made yet</h3>
                    <p className="mt-3 text-lg text-gray-600 max-w-md mx-auto">
                      Start making offers on books you're interested in.
                    </p>
                    <div className="mt-8">
                      <a
                        href="/"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300"
                      >
                        Browse Books
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {booksWithOffers.map(({ book, offers }) => (
                      <OfferItem key={book._id} book={book} offers={offers} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Offers Received Tab */}
            {activeTab === 'received' && (
              <div>
                <div className="flex items-center mb-8">
                  <div className="bg-blue-100 rounded-full p-4 mr-5 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Offers Received</h2>
                    <p className="text-gray-600 mt-1">Manage offers made on your books</p>
                  </div>
                </div>

                {offersLoading ? (
                  <div className="flex justify-center items-center py-16">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-lg font-medium text-gray-700">Loading received offers...</p>
                    </div>
                  </div>
                ) : receivedOffers.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <h3 className="mt-6 text-2xl font-bold text-gray-900">No offers received yet</h3>
                    <p className="mt-3 text-lg text-gray-600 max-w-md mx-auto">
                      When buyers make offers on your books, they will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {receivedOffers.map((offer) => (
                      <ReceivedOfferItem 
                        key={offer._id} 
                        offer={offer} 
                        handleRespondToOffer={handleRespondToOffer} 
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;