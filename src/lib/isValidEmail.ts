// Mirrors backend/utils/isValidEmail.js -- needed here specifically for the
// admin modals that save via onClick rather than a real <form onSubmit>,
// where type="email" never actually triggers browser validation.
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
