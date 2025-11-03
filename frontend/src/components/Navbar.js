// frontend/src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, User, PlusCircle, Bookmark, Settings, LogOut, LogIn, Menu, X, Home as HomeIcon } from 'lucide-react'; 

const Navbar = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin whenever user data changes
  useEffect(() => {
    if (user && user.isAdmin) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  // Helper component for consistent desktop links
  const DesktopLink = ({ to, icon: Icon, children }) => (
    <Link 
      to={to} 
      className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors duration-200"
      onClick={closeMenu}
      title={children}
    >
      <Icon className="h-5 w-5 mr-1" />
      <span className="hidden lg:inline">{children}</span>
    </Link>
  );

  // Helper component for consistent mobile links
  const MobileLink = ({ to, icon: Icon, children, isPrimary = false }) => (
    <Link 
      to={to} 
      onClick={closeMenu}
      className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
        isPrimary 
          ? 'bg-amber-400 text-gray-900 hover:bg-amber-300 font-bold mt-2 shadow-md' // Highlighted button
          : 'hover:bg-emerald-600' // Regular link
      }`}
    >
      <Icon className="h-6 w-6 mr-3" />
      {children}
    </Link>
  );

  return (
    <nav className="bg-gradient-to-r from-emerald-800 to-teal-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          
          {/* Logo - Modern Professional Look */}
          <Link to="/" className="text-3xl font-extrabold flex items-center tracking-tight">
            <div className="bg-white p-1 rounded-lg mr-2">
              <BookOpen className="h-6 w-6 text-emerald-700" strokeWidth={2.5} />
            </div>
            <span className="hidden sm:inline">Book<span className="text-amber-300">Hub</span></span>
            <span className="sm:hidden text-amber-300">Book<span className="text-amber-300">Hub</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <DesktopLink to="/" icon={HomeIcon}>Home</DesktopLink>
            
            {loading ? (
              <div className="flex items-center px-3 py-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                <span className="text-sm">Loading...</span>
              </div>
            ) : isAuthenticated ? (
              <>
                <DesktopLink to="/profile" icon={User}>Profile</DesktopLink>
                <DesktopLink to="/my-books" icon={Bookmark}>My Books</DesktopLink>
                
                {/* CTA Button - Modern Look */}
                <Link 
                  to="/add-book" 
                  className="inline-flex items-center bg-amber-400 text-gray-900 font-bold px-4 py-2 rounded-full shadow-lg hover:bg-amber-300 transition-all duration-200 ml-4 transform hover:scale-105"
                >
                  <PlusCircle className="h-5 w-5 mr-1" />
                  List a Book
                </Link>
                
                {isAdmin && (
                  <DesktopLink to="/admin" icon={Settings}>Admin</DesktopLink>
                )}
                
                <button 
                  onClick={handleLogout} 
                  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg text-white hover:text-red-300 hover:bg-emerald-700 transition-colors duration-300"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <DesktopLink to="/login" icon={LogIn}>Login</DesktopLink>
                
                <Link 
                  to="/register" 
                  className="bg-amber-400 text-gray-900 hover:bg-amber-300 px-4 py-2 rounded-full font-bold transition-colors duration-300 shadow-md transform hover:scale-105"
                >
                  <User className="h-5 w-5 mr-1" />
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu} 
              className="p-2 rounded-lg text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Improved Dropdown */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-screen opacity-100 py-4 border-t border-emerald-700' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col space-y-2">
            <MobileLink to="/" icon={HomeIcon}>Home</MobileLink>
            
            {loading ? (
              <div className="flex items-center px-4 py-3">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                <span>Loading...</span>
              </div>
            ) : isAuthenticated ? (
              <>
                <MobileLink to="/profile" icon={User}>Profile</MobileLink>
                <MobileLink to="/my-books" icon={Bookmark}>My Listings</MobileLink>
                
                {/* Mobile CTA */}
                <MobileLink to="/add-book" icon={PlusCircle} isPrimary={true}>List a New Book</MobileLink> 
                
                {isAdmin && (
                  <MobileLink to="/admin" icon={Settings}>Admin Tools</MobileLink>
                )}
                
                <button 
                  onClick={handleLogout} 
                  className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-white hover:bg-red-700 bg-red-600 transition-colors duration-200 mt-2 w-full text-left"
                >
                  <LogOut className="h-6 w-6 mr-3" />
                  Log Out
                </button>
              </>
            ) : (
              <>
                <MobileLink to="/login" icon={LogIn}>Login</MobileLink>
                
                {/* Mobile Register Button */}
                <MobileLink to="/register" icon={User} isPrimary={true}>Create Account (Register)</MobileLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;