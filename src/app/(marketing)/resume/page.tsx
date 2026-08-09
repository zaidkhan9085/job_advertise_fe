import { redirect } from "next/navigation";

// This used to be a "Submit Resume" form that never actually submitted
// anywhere (no backend call at all -- just a fake success message). The
// Resume Builder is the one real resume flow now; send anyone who still
// has this page bookmarked or linked there instead.
export default function PostResumePage() {
  redirect("/resume-builder");
}
