import { SignUp } from "@clerk/nextjs";
import ReferralCodeHandler from "@/components/ReferralCodeHandler";

export default function Page() {
  return (
    <div className="flex justify-center pt-4">
      <ReferralCodeHandler />
      <SignUp />
    </div>
  );
}