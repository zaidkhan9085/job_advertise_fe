// Company reviews (a 1-5 star rating + optional written review) are fully
// built end to end -- POST/GET /companies/:id/ratings, the public company
// page's "Rate this company" box and reviews list, the job detail page's
// quick-rate widget -- but the client asked to keep them out of sight on
// every candidate-facing page for now, without ripping the feature out.
// Flip this back on when ready; nothing else needs to change.
export const SHOW_COMPANY_REVIEWS = false;
