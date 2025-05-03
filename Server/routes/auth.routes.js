import express from 'express';
import cookieJwtAuth from '../middleware/GenerateToken.js';
import { uploadSingle, UploadMultiple } from '../middleware/MulterConfig.js';
import verifyEmailDomain from '../middleware/VerifyEmailDomain.js';

import {AdminLogin, VerifyAdmin, GetPendingClinics,  UpdateClinicVerificationStatus, GetClinicDetails, GetRegisteredUsers,
  GetPendingSitters, GetSitterDetails, UpdateSitterVerificationStatus, GetRegisteredVets, GetRegisteredGroomers, GetRegisteredSitters,
  RestrictUser,
} from '../controllers/AdminController.js';

import { Profile, Register, Logout, VerifyEmail, Login, ForgotPassword, ResetPassword,
  RegisterClinic, ResendResetOtp, ResendVerificationCode, RegisterProvider
} from '../controllers/AccountController.js';

import { CreatePetProfile, GetUserPets, UpdatePetProfile, DeletePetProfile, GetUserInfo, UpdateUserInfo, GetSitterInfo, UpdateSitterInfo,
  UpdateDetailUserInfo, GetAdopterProfile, GetPetProfile
} from '../controllers/UserController.js';

import { GetClinicsByCity, GetVetsAndGroomersByClinic, GetProviderDetails, UpdateProviderVerificationStatus, GetRegisteredStaffByClinic,
  GetClinicInfo, UpdateClinicProfile
} from '../controllers/ClinicController.js';

import {AddService, GetServicesByProvider, GetServiceDetails, DeleteService, UpdateService} from '../controllers/ProviderController.js';

import {SubmitAdoptionAd, GetAllAdoptionAds, GetAdoptionAdById, SubmitAdoptionApplication, CheckUserApplication, GetMyApplications, 
  GetUserAdoptionAds, UpdateAdoptionAd, GetAdoptionApplications, GetAdoptionApplicationDetails
} from '../controllers/AdoptionController.js';

import {GetVerifiedVets, GetVetById } from '../controllers/VetController.js';
import {CreateAppointment, ConfirmAppointment, StripeWebhook, GetUserAppointments, GetVetAppointments} from '../controllers/AppointmentController.js';

const AuthRoutes = express.Router();

//Appointment Routes
// 2) After redirect, confirm payment
AuthRoutes.get('/appointments', GetUserAppointments);
AuthRoutes.get('/appointments/vet', GetVetAppointments);
AuthRoutes.post('/appointments/confirm', ConfirmAppointment); // move this ABOVE
AuthRoutes.post('/appointments/:vetId', CreateAppointment); 




//Vet Routes
AuthRoutes.get('/vets', GetVerifiedVets);
AuthRoutes.get('/vets/:vetId', GetVetById);

// PetConnect Routes
AuthRoutes.post('/addAdoptionAd', UploadMultiple([{ name: 'photos', maxCount: 5 }]), SubmitAdoptionAd);
AuthRoutes.put("/update-adoption-ad/:id", UploadMultiple([{ name: 'photos', maxCount: 5 }]), UpdateAdoptionAd);
AuthRoutes.get('/get-adoption-ads', GetAllAdoptionAds);
AuthRoutes.get('/get-adoption-ads/:id', GetAdoptionAdById);
AuthRoutes.get("/user-adoption-ads", GetUserAdoptionAds);
AuthRoutes.get('/check-adopter-profile', GetAdopterProfile);
AuthRoutes.post('/adoption-application/:id', UploadMultiple([{ name: 'homeImages', maxCount: 4 }]), SubmitAdoptionApplication);
AuthRoutes.get("/check-application/:id", CheckUserApplication);
AuthRoutes.get('/get-my-applications', GetMyApplications);
AuthRoutes.get("/get-adoption-applications/:id", GetAdoptionApplications);
AuthRoutes.get("/adoption-applications/:applicationId", GetAdoptionApplicationDetails);

 
// service providers route
AuthRoutes.post('/add-service', AddService);
AuthRoutes.get('/get-services', GetServicesByProvider);
AuthRoutes.get('/service/:serviceId', GetServiceDetails);
AuthRoutes.delete("/delete-service/:serviceId", DeleteService);
AuthRoutes.put("/edit-service/:serviceId", UpdateService);

//common user account routes
AuthRoutes.post('/register', verifyEmailDomain, Register);
AuthRoutes.post('/verifyEmail', VerifyEmail);
AuthRoutes.post('/login', Login);
AuthRoutes.post('/forgot-password', ForgotPassword);
AuthRoutes.post('/reset-password', ResetPassword);
AuthRoutes.post('/resendVerificationCode', ResendVerificationCode);
AuthRoutes.post('/resendResetOtp', ResendResetOtp);
AuthRoutes.post('/logout', Logout);
AuthRoutes.get('/profile', cookieJwtAuth, Profile);

// Pet Owner and Sitter profile routes
AuthRoutes.get('/user/profile', GetUserInfo);
AuthRoutes.put('/user/update-profile', verifyEmailDomain, UpdateUserInfo);
AuthRoutes.put('/user/update-detail-profile', UpdateDetailUserInfo);
AuthRoutes.get('/sitter/profile', GetSitterInfo);
AuthRoutes.put('/sitter/update-profile', verifyEmailDomain, UpdateSitterInfo);

// Clinic specific routes
AuthRoutes.get('/clinic/profile', GetClinicInfo);
AuthRoutes.put('/clinic/update-profile', verifyEmailDomain, UpdateClinicProfile);

// Pet Owner specific routes
AuthRoutes.post('/create-pet', uploadSingle, CreatePetProfile);
AuthRoutes.get('/get-user-pets', GetUserPets);
AuthRoutes.put("/update-pet/:petId", uploadSingle, UpdatePetProfile);
AuthRoutes.delete('/pets/:petId', DeletePetProfile);
AuthRoutes.get('/pets/:petId', GetPetProfile);


AuthRoutes.get('/clinics/:city', GetClinicsByCity);
AuthRoutes.get('/clinic/vets-groomers', GetVetsAndGroomersByClinic);
AuthRoutes.get('/clinic/providers-details/:role/:provider_id', GetProviderDetails);
AuthRoutes.post('/clinic/update-provider-status', UpdateProviderVerificationStatus);
AuthRoutes.get('/clinic/staff', GetRegisteredStaffByClinic);

const uploadFields = [
  { name: 'vetResume', maxCount: 1 },
  { name: 'vetLicenseFile', maxCount: 1 },
  { name: 'vetDegree', maxCount: 1 },
  { name: 'groomerCertificate', maxCount: 1 },
  { name: 'sitterCertificate', maxCount: 1 }
];
AuthRoutes.post('/provider-register', UploadMultiple(uploadFields), verifyEmailDomain, RegisterProvider);

// Admin specific routes
AuthRoutes.post('/admin/login', AdminLogin); 
AuthRoutes.get('/admin/verify', VerifyAdmin);
AuthRoutes.get('/admin/pending-clinics', GetPendingClinics);
AuthRoutes.get('/admin/pending-sitters', GetPendingSitters);
AuthRoutes.post('/admin/update-clinic-status', UpdateClinicVerificationStatus);
AuthRoutes.post('/admin/update-sitter-status', UpdateSitterVerificationStatus);
AuthRoutes.get("/admin/clinic-details/:clinicName", GetClinicDetails);
AuthRoutes.get("/admin/sitter-details/:sitterId", GetSitterDetails);
AuthRoutes.get("/admin/users", GetRegisteredUsers);
AuthRoutes.get("/admin/get-vets", GetRegisteredVets);
AuthRoutes.get("/admin/get-groomers", GetRegisteredGroomers);
AuthRoutes.get("/admin/get-sitters", GetRegisteredSitters);
AuthRoutes.post("/admin/restrict-user/:id", RestrictUser);


const clinicUploadFields = [
  { name: 'clinicRegistrationFile', maxCount: 1 },
  { name: 'NICFile', maxCount: 1 },
  { name: 'vetLicenseFile', maxCount: 1 },
  { name: 'proofOfAddressFile', maxCount: 1 }
];
AuthRoutes.post('/clinic-register', UploadMultiple(clinicUploadFields), verifyEmailDomain, RegisterClinic );


export default AuthRoutes;
