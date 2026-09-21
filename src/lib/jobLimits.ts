// A long poster (50+ roles, one line each, plus contacts and benefits) runs
// well past the old 2,500 characters and used to be cut off mid-list. The
// database column is unlimited and the job page scrolls the description, so
// this only needs to be a sane ceiling.
export const DESCRIPTION_MAX_LENGTH = 8000;
