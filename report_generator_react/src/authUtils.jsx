// import { jwtDecode } from 'jwt-decode';

// export function getUserRole() {
//   const token = localStorage.getItem('token');
//   if (!token) return null;
//   try {
//     const decoded = jwtDecode(token);
//     return decoded.role; 
//   } catch (error) {
//     return null;
//   }
// }

// Temporary test function to force role to 'user'
export function getUserRole() {
  // Change to 'admin' or 'user' for testing purposes
  return 'user';  //'user' or 'admin'
}

