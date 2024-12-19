import express from 'express';
import cookieJwtAuth from '../middleware/GenerateToken.js';
import { uploadSingle, UploadMultiple } from '../middleware/MulterConfig.js';
import verifyEmailDomain from '../middleware/VerifyEmailDomain.js';

import {AdminLogin, VerifyAdmin, GetPendingClinics,  UpdateClinicVerificationStatus, GetClinicDetails, GetRegisteredUsers,
  GetPendingSitters, GetSitterDetails, UpdateSitterVerificationStatus, GetRegisteredVets, GetRegisteredGroomers, GetRegisteredSitters,
  RestrictUser
} from '../controllers/AdminRoutes.js';

import { Profile, Register, Logout, VerifyEmail, Login, ForgotPassword, ResetPassword,
  RegisterClinic, ResendResetOtp, ResendVerificationCode, RegisterProvider
} from '../controllers/AccountRoutes.js';

import { CreatePetProfile, GetUserPets, UpdatePetProfile, DeletePetProfile, GetUserInfo, UpdateUserInfo, GetSitterInfo, UpdateSitterInfo
} from '../controllers/UserRoutes.js';

import { GetClinicsByCity, GetVetsAndGroomersByClinic, GetProviderDetails, UpdateProviderVerificationStatus, GetRegisteredStaffByClinic,
  GetClinicInfo, UpdateClinicProfile
} from '../controllers/ClinicRoutes.js';

import {AddService, GetServicesByProvider, GetServiceDetails, DeleteService, UpdateService} from '../controllers/ProviderRoutes.js';

const AuthRoutes = express.Router();

AuthRoutes.post('/add-service', AddService);
AuthRoutes.get('/get-services', GetServicesByProvider);
AuthRoutes.get('/service/:serviceId', GetServiceDetails);
AuthRoutes.delete("/delete-service/:serviceId", DeleteService);
AuthRoutes.put("/edit-service/:serviceId", UpdateService);

AuthRoutes.post('/register', verifyEmailDomain, Register);
AuthRoutes.post('/verifyEmail', VerifyEmail);
AuthRoutes.post('/login', Login);
AuthRoutes.post('/forgot-password', ForgotPassword);
AuthRoutes.post('/reset-password', ResetPassword);
AuthRoutes.post('/resendVerificationCode', ResendVerificationCode);
AuthRoutes.post('/resendResetOtp', ResendResetOtp);
AuthRoutes.post('/logout', Logout);
AuthRoutes.get('/profile', cookieJwtAuth, Profile);

AuthRoutes.get('/user/profile', GetUserInfo);
AuthRoutes.put('/user/update-profile', verifyEmailDomain, UpdateUserInfo);
AuthRoutes.get('/sitter/profile', GetSitterInfo);
AuthRoutes.put('/sitter/update-profile', verifyEmailDomain, UpdateSitterInfo);


AuthRoutes.get('/clinic/profile', GetClinicInfo);
AuthRoutes.put('/clinic/update-profile', verifyEmailDomain, UpdateClinicProfile);

AuthRoutes.post('/create-pet', uploadSingle, CreatePetProfile);
AuthRoutes.get('/get-user-pets', GetUserPets);
AuthRoutes.put("/update-pet/:petId", uploadSingle, UpdatePetProfile);
AuthRoutes.delete('/pets/:petId', DeletePetProfile);

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
