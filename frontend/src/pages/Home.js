import React, { useState, useEffect } from 'react';
import { getAllBooksWithoutFilter, searchBooks } from '../services/api';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpenIcon, 
  TagIcon, 
  ShoppingCartIcon, 
  ArrowPathIcon, 
  PlusCircleIcon, 
  UserPlusIcon,
  MagnifyingGlassIcon,
  CircleStackIcon,
  HandThumbUpIcon,
  TruckIcon,
  UsersIcon,
  HeartIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { BoltIcon } from '@heroicons/react/24/solid';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch all books on initial load
        const res = await getAllBooksWithoutFilter();
        setBooks(res.data);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to fetch books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handleSearch = async (searchParams) => {
    try {
      setLoading(true);
      setError(null);
      setSearchPerformed(true);
      
      // Extract search query from searchParams
      const query = searchParams.query || '';
      
      // Call searchBooks with the query parameter
      const res = await searchBooks({ query });
      setBooks(res.data);
    } catch (err) {
      console.error('Error searching books:', err);
      setError('Failed to search books. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      setError(null);
      setSearchPerformed(false);
      // Re-fetch all books
      const res = await getAllBooksWithoutFilter();
      setBooks(res.data);
    } catch (err) {
      console.error('Error resetting books:', err);
      setError('Failed to reset books. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate available books count
  const availableBooksCount = books.filter(book => book.status === 'available').length;
  const soldBooksCount = books.filter(book => book.status === 'sold').length;
  const totalBooksCount = books.length;

  // Modernized Icons
  const SellBookIcon = PlusCircleIcon;
  const JoinNowIcon = UserPlusIcon;
  const BrowseBooksIcon = MagnifyingGlassIcon;

  // Split books into chunks of 10 for multiple carousels
  const chunkSize = 10;
  const bookChunks = [];
  for (let i = 0; i < books.length; i += chunkSize) {
    bookChunks.push(books.slice(i, i + chunkSize));
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      {/* Hero Section - Deep Industrial Teal/Green */}
      <div className="relative overflow-hidden bg-gray-900 shadow-xl">
        {/* Subtle Diagonal Lines Background */}
        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,.07) 0px, rgba(255,255,255,.07) 1px, transparent 1px, transparent 10px)' }}></div>
        
        {/* Main Content with Gradient Overlay */}
        <div className="relative z-10 bg-gradient-to-br from-teal-800 to-green-900 text-white pt-24 pb-28 px-4 sm:pt-32 sm:pb-40">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-4 inline-block px-4 py-1 text-sm font-semibold tracking-widest text-emerald-200 bg-emerald-700/50 rounded-full border border-emerald-500/50 uppercase shadow-lg">
                STUDENT BOOK MARKETPLACE
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-lg">
                Textbooks, <span className="text-emerald-300">Simplified.</span>
              </h1>
              <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-2xl mx-auto font-light">
                Browse, buy, and sell used textbooks with students across your campus at **unbeatable prices**.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {isAuthenticated ? (
                  <a 
                    href="/add-book" 
                    className="inline-flex items-center justify-center bg-white text-teal-800 hover:bg-gray-100 font-bold py-4 px-10 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg ring-4 ring-white/50"
                  >
                    <SellBookIcon className="w-6 h-6 mr-2" />
                    Sell Your Book
                  </a>
                ) : (
                  <a 
                    href="/register" 
                    className="inline-flex items-center justify-center bg-white text-teal-800 hover:bg-gray-100 font-bold py-4 px-10 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg ring-4 ring-white/50"
                  >
                    <JoinNowIcon className="w-6 h-6 mr-2" />
                    Join Now to Sell
                  </a>
                )}
                <a 
                  href="#browse" 
                  className="inline-flex items-center justify-center bg-transparent border-2 border-white/40 hover:border-white text-white font-semibold py-4 px-10 rounded-xl shadow-lg transition-all duration-300 transform hover:bg-white/10 text-lg"
                >
                  <BrowseBooksIcon className="w-6 h-6 mr-2" />
                  Browse Listings
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div id="browse" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Search Section */}
        <SearchBar onSearch={handleSearch} />

        {/* Listing Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
          <div>
            <h2 className="text-4xl font-extrabold text-gray-800 mb-3 border-l-4 border-emerald-600 pl-4">Book Listings</h2>
            <div className="flex items-center space-x-4 text-lg text-gray-600">
              <p>
                {searchPerformed 
                  ? `Search Results: `
                  : `Total Listings: `
                }
                <span className="font-bold text-emerald-600">{books.length}</span>
                {searchPerformed ? "" : <span> books</span>}
              </p>
              {!searchPerformed && (
                <>
                  <span className="text-gray-300">|</span>
                  <p>
                    <span className="font-bold text-green-600">{availableBooksCount}</span> Available
                  </p>
                  <p>
                    <span className="font-bold text-red-600">{soldBooksCount}</span> Sold
                  </p>
                </>
              )}
            </div>
          </div>
          
          {searchPerformed && (
            <button 
              onClick={handleReset}
              className="mt-6 md:mt-0 flex items-center text-emerald-600 hover:text-emerald-800 transition-colors duration-300 bg-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl font-semibold border border-gray-200"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Reset Search
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-5 mb-10 rounded-xl shadow-lg" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <BoltIcon className="h-6 w-6 text-red-500" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Operation Failed</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="text-center">
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-emerald-600 mx-auto"></div>
              <p className="mt-6 text-xl font-medium text-gray-700">Fetching the latest listings...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Books Carousels */}
            {books.length > 0 ? (
              <div>
                {bookChunks.map((chunk, index) => (
                  <div key={index} className="mb-12">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      {searchPerformed ? "Search Results" : `Books ${index * chunkSize + 1}-${Math.min((index + 1) * chunkSize, totalBooksCount)}`}
                    </h3>
                    <Swiper
                      modules={[Navigation, Pagination, A11y]}
                      spaceBetween={30}
                      slidesPerView={1}
                      breakpoints={{
                        640: {
                          slidesPerView: 2,
                        },
                        768: {
                          slidesPerView: 3,
                        },
                        1024: {
                          slidesPerView: 4,
                        },
                      }}
                      navigation
                      pagination={{ clickable: true }}
                      className="pb-12"
                    >
                      {chunk.map(book => (
                        <SwiperSlide key={book._id}>
                          <div className="h-full">
                            <BookCard book={book} />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-20 px-4 bg-white rounded-3xl shadow-xl border border-gray-100">
                <div className="max-w-lg mx-auto">
                  <div className="flex justify-center mb-6">
                    <div className="bg-emerald-100 rounded-full p-5 shadow-inner">
                      <BookOpenIcon className="h-16 w-16 text-emerald-600" aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="mt-6 text-3xl font-bold text-gray-900">No Books Found</h3>
                  <p className="mt-4 text-xl text-gray-600">
                    {searchPerformed 
                      ? "Your search didn't match any listings. Try broader terms or reset the search." 
                      : "The marketplace is awaiting new listings! Be the first to add a book."}
                  </p>
                  <div className="mt-10">
                    {searchPerformed ? (
                      <button
                        onClick={handleReset}
                        className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl shadow-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-emerald-500/50 transition-all duration-300"
                      >
                        <ArrowPathIcon className="w-5 h-5 mr-2" />
                        Browse All Books
                      </button>
                    ) : (
                      <a
                        href={isAuthenticated ? "/add-book" : "/register"}
                        className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl shadow-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-emerald-500/50 transition-all duration-300"
                      >
                        <SellBookIcon className="w-6 h-6 mr-2" />
                        {isAuthenticated ? "Add a Book Today" : "Join to Start Selling"}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Features Section - How It Works */}
      <div className="bg-white py-20 border-t border-b border-gray-100 shadow-inner">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1 text-sm font-semibold tracking-widest text-emerald-800 bg-emerald-100 rounded-full mb-4 uppercase">
              SEAMLESS TRANSACTIONS
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">The Student Advantage</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We connect you directly with local students, ensuring fast, affordable, and trustworthy exchanges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="text-center bg-gray-50 p-8 rounded-3xl shadow-xl border border-gray-200 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-600 text-white shadow-lg">
                  <CircleStackIcon className="w-8 h-8"/>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Vast Inventory</h3>
              <p className="text-gray-700 text-lg">
                Access thousands of college textbooks and course materials you won't find anywhere else.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center bg-gray-50 p-8 rounded-3xl shadow-xl border border-gray-200 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-600 text-white shadow-lg">
                  <TagIcon className="w-8 h-8"/>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Save Big</h3>
              <p className="text-gray-700 text-lg">
                Cut the bookstore markup. Buy used books directly from peers at a fraction of the retail price.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center bg-gray-50 p-8 rounded-3xl shadow-xl border border-gray-200 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-600 text-white shadow-lg">
                  <HandThumbUpIcon className="w-8 h-8"/>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Simple Exchange</h3>
              <p className="text-gray-700 text-lg">
                Connect and arrange pick-up or delivery quickly and securely, often on or near campus.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Community Section - Helping Friends */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 py-20 border-t border-b border-gray-100 shadow-inner">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1 text-sm font-semibold tracking-widest text-emerald-800 bg-emerald-100 rounded-full mb-4 uppercase">
              COMMUNITY SPIRIT
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Helping Friends, Saving Together</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our mission goes beyond just selling books. We believe in helping students access affordable education by connecting peers who want to give away or sell books at low prices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Community Feature 1 */}
            <div className="text-center bg-white p-8 rounded-3xl shadow-xl border border-gray-200 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-amber-500 text-white shadow-lg">
                  <GiftIcon className="w-8 h-8"/>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Free Books</h3>
              <p className="text-gray-700 text-lg">
                Many students offer books for free to help others. Find textbooks at no cost and pay it forward when you're done.
              </p>
            </div>

            {/* Community Feature 2 */}
            <div className="text-center bg-white p-8 rounded-3xl shadow-xl border border-gray-200 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-amber-500 text-white shadow-lg">
                  <UsersIcon className="w-8 h-8"/>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Help Friends</h3>
              <p className="text-gray-700 text-lg">
                Connect directly with classmates and friends in your college community. Help each other succeed by sharing resources.
              </p>
            </div>

            {/* Community Feature 3 */}
            <div className="text-center bg-white p-8 rounded-3xl shadow-xl border border-gray-200 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-amber-500 text-white shadow-lg">
                  <HeartIcon className="w-8 h-8"/>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Low Prices</h3>
              <p className="text-gray-700 text-lg">
                Find books at significantly lower prices than bookstores. Students helping students keep education affordable.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200 max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Join Our Community of Givers</h3>
              <p className="text-gray-700 text-lg mb-6">
                Every book shared is a step toward making education more accessible. Whether you're giving away books for free or selling at a low price, you're making a difference in someone's educational journey.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {isAuthenticated ? (
                  <a 
                    href="/add-book" 
                    className="inline-flex items-center justify-center bg-amber-500 text-white hover:bg-amber-600 font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <GiftIcon className="w-5 h-5 mr-2" />
                    Share a Book
                  </a>
                ) : (
                  <a 
                    href="/register" 
                    className="inline-flex items-center justify-center bg-amber-500 text-white hover:bg-amber-600 font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <UserPlusIcon className="w-5 h-5 mr-2" />
                    Join the Community
                  </a>
                )}
                <a 
                  href="#browse" 
                  className="inline-flex items-center justify-center bg-transparent border-2 border-amber-500 text-amber-600 hover:bg-amber-50 font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300"
                >
                  <BrowseBooksIcon className="w-5 h-5 mr-2" />
                  Browse Free Books
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section - Final Push */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-800 py-20 shadow-inner">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow">
            Ready to <span className="text-emerald-300">Maximize Your Savings?</span>
          </h2>
          <p className="text-xl text-teal-100 mb-10 max-w-3xl mx-auto font-light">
            Whether you're buying or selling, join the smart student marketplace today.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isAuthenticated ? (
              <>
                <a 
                  href="/add-book" 
                  className="inline-flex items-center justify-center bg-white text-emerald-700 hover:bg-gray-100 font-bold py-4 px-10 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg"
                >
                  <SellBookIcon className="w-6 h-6 mr-2" />
                  List Your Book
                </a>
                <a 
                  href="#browse" 
                  className="inline-flex items-center justify-center bg-transparent border-2 border-white/40 hover:border-white text-white font-semibold py-4 px-10 rounded-xl shadow-lg transition-all duration-300 transform hover:bg-white/10 text-lg"
                >
                  <BrowseBooksIcon className="w-6 h-6 mr-2" />
                  Start Browsing
                </a>
              </>
            ) : (
              <a 
                href="/register" 
                className="inline-flex items-center justify-center bg-white text-emerald-700 hover:bg-gray-100 font-bold py-4 px-12 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 text-xl ring-4 ring-white/50"
              >
                <UserPlusIcon className="w-6 h-6 mr-2" />
                Create Your Free Account
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 border-b border-gray-700 pb-8 mb-8">
            <div>
              <h3 className="text-2xl font-extrabold mb-4 text-emerald-400">BookMarket</h3>
              <p className="text-gray-400 text-sm">
                The modern platform for students to efficiently manage their course materials.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="/" className="text-gray-400 hover:text-emerald-300 transition-colors text-sm">Home</a></li>
                <li><a href="/browse" className="text-gray-400 hover:text-emerald-300 transition-colors text-sm">Browse Listings</a></li>
                <li><a href="/add-book" className="text-gray-400 hover:text-emerald-300 transition-colors text-sm">Sell a Book</a></li>
                <li><a href="/profile" className="text-gray-400 hover:text-emerald-300 transition-colors text-sm">My Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="/help" className="text-gray-400 hover:text-emerald-300 transition-colors text-sm">Help Center</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-emerald-300 transition-colors text-sm">Contact Us</a></li>
                <li><a href="/faq" className="text-gray-400 hover:text-emerald-300 transition-colors text-sm">FAQ</a></li>
                <li><a href="/terms" className="text-gray-400 hover:text-emerald-300 transition-colors text-sm">Terms & Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Stay Connected</h4>
              <p className="text-gray-400 mb-4 text-sm">Follow us for updates and exclusive deals.</p>
              <div className="flex space-x-4">
                {/* Social Icons (simplified using placeholders for brevity) */}
                <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors" aria-label="Facebook">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors" aria-label="Instagram">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058z" clipRule="evenodd" /></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors" aria-label="Twitter">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="text-center pt-8 text-sm text-gray-500">
            
            &copy; {new Date().getFullYear()} **BookMarket. All rights reserved.**
          </div>
          <div className='px-6 pt-2'><p className="text-emerald-400 font-medium flex justify-between">Designed and Developed by Mohammed Zaid</p></div>
        </div>
      </footer>
    </div>
  );
};

export default Home;