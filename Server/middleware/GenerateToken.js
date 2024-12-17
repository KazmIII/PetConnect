import jwt from 'jsonwebtoken'

export const cookieJwtAuth = (req, res, next) => {
  const roles = ['pet_owner', 'clinic', 'vet', 'groomer', 'sitter'];
  
  for (const role of roles) {
    const token = req.cookies?.[`${role}Token`]; 
    console.log("token inmiddleware:", token);
    if (token) {
      console.log("Token FOund");
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.role !== role) {
          throw new Error('Role mismatch');
        }

        req.user = decoded;
        console.log("user in middleware:", decoded); 
        return next(); 
      } catch (error) {
        console.warn(`Invalid or expired token for ${role}:`, error.message);
        req.user = null; 
        return next(); 
      }
    }
  }
};

export default cookieJwtAuth;