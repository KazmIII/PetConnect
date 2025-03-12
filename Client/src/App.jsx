// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation} from 'react-router-dom';
import { NavbarProvider, useNavbar } from "./components/NavbarContext";
import Home from "./components/Home";
import MyPets from "./components/MyPets";
import Navbar from "./components/Navbar";
import Login from './components/Login';
import UserRegister from './components/UserRegister';
import ProviderRegister from './components/ProviderRegister';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import VerifyOTP from './components/VerifyOTP';
import ClinicRegister from './components/ClinicRegister';
import MemoryBooks from './components/MemoryBooks';
import CreateMemoryBookForm from './components/CreateMemoryBookForm';
import AddMemory from './components/AddMemory';
import MemoryList from './components/MemoryList';
import MemoryDetail from './components/MemoryDetail';
import EmotionPrediction from './components/EmotionPrediction';
import { ToastContainer } from 'react-toastify';
import SitterProfile from './components/SitterProfile';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute1 from './components/ProtectedRoute';
import ListPetAdoption from './components/ListPetAdoption';
import InfoModal from './components/InfoModal';
import Footer from './components/Footer';
import ClinicDashboard from './components/ClinicDashboard';
import ClinicProfile from './components/ClinicProfile';
import PetEmotion from './components/PetEmotion';

import PetAdoption from './components/PetAdoption';
import PetAdoptionDetail from './components/PetAdoptionDetail';
import AdoptionForm from './components/AdoptionForm';
import MyApplications from './components/MyApplications';
import MyListings from './components/MyListings';

import UserProfile from './components/UserProfile';
import AddService from './components/AddService';
import Services from './components/Services';
import EditService from './components/EditService';
import BlogSection from './components/BlogSection';
import BlogDetail from './components/BlogDetail';
import ReportPet from './components/ReportPet';

const Modal = () => {
  const { activeComponent, update, checkLoginStatus, handleHideComponents, otpType, otpCode, userEmail, role, handleShowComponent } = useNavbar();
  const [showModal, setShowModal] = useState(false);

  return (
    activeComponent && (
      <div className="fixed inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-xs sm:max-w-sm md:max-w-sm lg:max-w-md px-4 sm:px-6 pt-4 sm:pt-6 relative">
          {/* Dynamically Render Active Component */}
          {activeComponent === 'login' && (
            <Login
              notVerified = {(email, role) => handleShowComponent('verifyOTP', 'email', email, '', role)}
              onRegisterClick={() => handleShowComponent('userRegister')}
              onUserRegisterClick={() => handleShowComponent('userRegister')}
              onForgotPasswordClick={() => handleShowComponent('forgotPassword')}
              onLoginSuccessful={() => {
                checkLoginStatus();  // Check login status after successful login
                handleHideComponents();
              }}
              onClose={handleHideComponents}
            />
          )}
          {activeComponent === 'userRegister' && (
            <UserRegister
              onRegisterSuccess={(email) =>
                handleShowComponent('verifyOTP', 'email', email, '', 'pet_owner')
              }
              onClose={handleHideComponents}
            />
          )}
          {activeComponent === 'clinicRegister' && (
            <ClinicRegister
              onRegisterSuccess={(email) =>
                handleShowComponent('verifyOTP', 'email', email, '', 'clinic')
              }
              onClose={handleHideComponents}
            />
          )}
          {activeComponent === 'providerRegister' && (
            <ProviderRegister 
              onRegisterSuccess={(email, role) =>
                handleShowComponent('verifyOTP', 'email', email, '', role)
              }
              onClose={handleHideComponents} />
          )}
          {activeComponent === 'verifyOTP' && (
            <VerifyOTP
              type={otpType}
              email={userEmail}
              role={role}
              update={update}
              onOTPSuccess={(otp) => {
                if (otpType === 'reset') {
                  handleShowComponent('resetPassword', '', '', otp, role);
                } else if (otpType === 'email') {
                  if(update){
                    handleHideComponents();
                  }
                  else if (role === 'clinic' || role === 'vet' || role === 'groomer' || role === 'sitter') {
                    setShowModal(true); // Show modal for clinics or providers
                  } else {
                    handleShowComponent('login'); // Redirect to login for other roles
                  }
                }
              }}
              onClose={handleHideComponents}
            />
          )}

          {activeComponent === 'forgotPassword' && (
            <ForgotPassword
              notVerified={(email) => handleShowComponent('verifyOTP', 'email', email)}
              onMailSuccess={(email, role) => handleShowComponent('verifyOTP', 'reset', email, '', role)}
              onClose={handleHideComponents}
            />
          )}
          {activeComponent === 'resetPassword' && (
            <ResetPassword
              otp={otpCode}
              role={role}
              onResetSuccessful={() => handleShowComponent('login')}
              onClose={handleHideComponents}
            />
          )}
          {showModal && (
            <InfoModal
              title="Registeration Successful"
              message="Thank you for verifying your email. Your account will be reviewed, and you will be notified once it's approved."
              onClose={() => {
                setShowModal(false);
                handleHideComponents();
              }}
            />
          )}
        </div>
      </div>
    )
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isLoggedIn, userRole  } = useNavbar();
  if (isLoggedIn === null || userRole === null) {
    return null;
  }

  const isAuthorized =
    isLoggedIn &&
    (Array.isArray(requiredRole)
      ? requiredRole.includes(userRole)
      : userRole === requiredRole);

  if (isAuthorized) {
    return children;
  }
  return <Navigate to="/" />;
};

const AppContent = () => {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isClinicRoute = location.pathname.startsWith("/clinic");

  return (
    <>
      {/* Conditionally render Navbar */}
      {!isAdminRoute && !isClinicRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/find-a-pet" element={<PetAdoption />} />
        <Route path="/pet-listing/:id" element={<PetAdoptionDetail />} />
        <Route path="/pet-listing/:id/adoption-application" element={<ProtectedRoute requiredRole="pet_owner"> <AdoptionForm /> </ProtectedRoute>} />
        <Route path="/myPets" element={<ProtectedRoute requiredRole="pet_owner"> <MyPets /> </ProtectedRoute>} />
        <Route path="/myEnquiries" element={<ProtectedRoute requiredRole="pet_owner"> <MyApplications /> </ProtectedRoute>} />
        <Route path="/myListings" element={<ProtectedRoute requiredRole="pet_owner"> <MyListings /> </ProtectedRoute>} />
        <Route path="/myPets/:petId" element={<ProtectedRoute requiredRole="pet_owner"> <MyPets /> </ProtectedRoute>} />
        <Route path="/profile/user" element={<ProtectedRoute requiredRole="pet_owner"> <UserProfile /> </ProtectedRoute>} />
        <Route path="/profile/post-adoption" element={<ProtectedRoute requiredRole="pet_owner"> <ListPetAdoption /> </ProtectedRoute>} />
        <Route path="/profile/vet" element={<ProtectedRoute requiredRole="vet"> <UserProfile /> </ProtectedRoute>} />

        <Route path="/profile/groomer" element={<ProtectedRoute requiredRole="groomer"> <UserProfile /> </ProtectedRoute>} />
        <Route path="/add-service" element={<ProtectedRoute requiredRole={["groomer", "sitter", "vet"]}> <AddService /> </ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute requiredRole={["groomer", "sitter", "vet"]}> <Services /> </ProtectedRoute>} />
        <Route path="/edit-service/:serviceId" element={<ProtectedRoute requiredRole={["groomer", "sitter", "vet"]}> <EditService /> </ProtectedRoute>} />

        <Route path="/profile/sitter" element={<ProtectedRoute requiredRole="sitter"> <SitterProfile /> </ProtectedRoute>} />

        <Route path="/clinic/*" element={<ProtectedRoute requiredRole="clinic"><ClinicDashboard /></ProtectedRoute>} />
        <Route path="/profile/clinic" element={<ProtectedRoute requiredRole="clinic"><ClinicProfile /></ProtectedRoute>} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<ProtectedRoute1 component={AdminDashboard} />} />

        <Route path="/memory-books/:petId" element={<ProtectedRoute requiredRole="pet_owner"><MemoryBooks /> </ProtectedRoute>} />
        <Route path="/memory-books/create/:petId" element={<ProtectedRoute requiredRole="pet_owner"><CreateMemoryBookForm /> </ProtectedRoute>} />
        <Route path="/memory-books/:petId/:bookId/memory-list" element={<ProtectedRoute requiredRole="pet_owner"><MemoryList /> </ProtectedRoute>} />
        <Route path="/memory-books/:petId/:bookId/memories" element={<ProtectedRoute requiredRole="pet_owner"><AddMemory /> </ProtectedRoute>} />
        <Route path="/memory-books/:petId/:bookId/memories/:memoryId" element={<ProtectedRoute requiredRole="pet_owner"><MemoryDetail /> </ProtectedRoute>} />
        <Route path="/pet/:petName/emotions" element={<ProtectedRoute requiredRole="pet_owner"><PetEmotion /> </ProtectedRoute>} />
        <Route path="/predict-emotion" element={<EmotionPrediction />} />
        <Route path="/blogs" element={<BlogSection />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/lost" element={<ReportPet />} />
      </Routes>
      {/* Render modal globally */}
      <Modal />
      <ToastContainer />
      {!isAdminRoute && !isClinicRoute && <Footer />}
    </>
  );
};

export const App = () => {
  return (
    <NavbarProvider>
      <Router>
        <AppContent />
      </Router>
    </NavbarProvider>
  );
};

export default App;